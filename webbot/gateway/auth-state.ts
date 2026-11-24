import { DatabaseSync } from 'node:sqlite'
import { existsSync, rmSync } from 'node:fs'
import { hardenFile, mkdirPrivate } from './permissions'
import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys'
import type { AuthenticationCreds, AuthenticationState, SignalDataTypeMap } from '@whiskeysockets/baileys'
import { sessionDir, sessionDbPath } from './config'

/**
 * Per-session Baileys auth state, persisted to SQLite.
 *
 * ── NANO COMPATIBILITY ──────────────────────────────────────────────────────
 * The table layout below is byte-for-byte the same as Nano's `core/sesi.js`:
 *
 *   creds (id, data, updated_at)                      — single row, id = 1
 *   keys  (category, id, data, updated_at)            — Signal keys, by category
 *
 * That is deliberate. A session linked here can be pointed at the Nano script
 * (or vice versa) and it will pick up the credentials without re-pairing, which
 * is what makes "gateway manages sessions, Nano runs the bot" actually work
 * rather than being an aspiration. The `ALLOWED_KEYS` list mirrors Nano's too,
 * including the `lid-mapping` category Nano added so LID↔number mapping
 * survives restarts.
 *
 * We use Node's built-in `node:sqlite` instead of `better-sqlite3` so the
 * gateway has no native build step.
 */

/**
 * Signal key categories we persist. Anything outside this set is dropped — the
 * same policy Nano applies, which keeps the file bounded and avoids storing
 * key types the protocol does not need to resume a session.
 */
const ALLOWED_KEYS = new Set<keyof SignalDataTypeMap>([
  'pre-key',
  'session',
  'sender-key',
  'app-state-sync-key',
  'app-state-sync-version',
  'lid-mapping',
])

/** Signal key categories Nano matches by prefix, longest-first to disambiguate. */
const CATEGORY_PREFIXES = [
  'app-state-sync-version',
  'app-state-sync-key',
  'sender-key',
  'lid-mapping',
  'pre-key',
  'session',
].sort((a, b) => b.length - a.length)

interface SqliteCredsRow {
  data: string
}
interface SqliteKeyRow {
  data: string | null
}

export interface AuthStateHandle {
  state: AuthenticationState
  saveCreds: () => Promise<void>
  close: () => void
  /** True when credentials already exist (i.e. this session was linked before). */
  wasRegistered: () => boolean
}

export async function useSqliteAuthState(
  sessionKey: string
): Promise<AuthStateHandle> {
  const dir = sessionDir(sessionKey)
  // 0700 on the directory is what protects the credential file inside it.
  mkdirPrivate(dir)

  const database = new DatabaseSync(sessionDbPath(sessionKey))
  hardenFile(sessionDbPath(sessionKey))
  database.exec('PRAGMA journal_mode = WAL')
  database.exec('PRAGMA synchronous = NORMAL')
  database.exec('PRAGMA busy_timeout = 5000')
  database.exec(`
    CREATE TABLE IF NOT EXISTS creds (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keys (
      category TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (category, id)
    );

    CREATE INDEX IF NOT EXISTS idx_keys_category ON keys(category);
  `)

  const readCredsStmt = database.prepare('SELECT data FROM creds WHERE id = 1')
  const writeCredsStmt = database.prepare(`
    INSERT INTO creds (id, data, updated_at) VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `)
  const readKeyStmt = database.prepare(
    'SELECT data FROM keys WHERE category = ? AND id = ?'
  )
  const writeKeyStmt = database.prepare(`
    INSERT INTO keys (category, id, data, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(category, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `)
  const deleteKeyStmt = database.prepare(
    'DELETE FROM keys WHERE category = ? AND id = ?'
  )

  const storedCreds = readCredsStmt.get() as SqliteCredsRow | undefined
  const creds: AuthenticationCreds = storedCreds
    ? (JSON.parse(storedCreds.data, BufferJSON.reviver) as AuthenticationCreds)
    : initAuthCreds()

  const registeredAtStart = Boolean(creds.registered)

  const saveCreds = async (): Promise<void> => {
    writeCredsStmt.run(
      JSON.stringify(creds, BufferJSON.replacer),
      Date.now()
    )
  }

  const keys: AuthenticationState['keys'] = {
    get: async (type, ids) => {
      const result: Record<string, unknown> = {}

      for (const id of ids) {
        const row = readKeyStmt.get(type, id) as SqliteKeyRow | undefined
        if (!row?.data) {
          result[id] = null
          continue
        }

        let value = JSON.parse(row.data, BufferJSON.reviver)

        // app-state-sync-key must be revived into its protobuf message class,
        // otherwise app-state sync silently fails after a restart.
        if (type === 'app-state-sync-key') {
          value = proto.Message.AppStateSyncKeyData.fromObject(value)
        }

        result[id] = value
      }

      return result as never
    },

    set: async (data) => {
      for (const category of Object.keys(data) as Array<keyof SignalDataTypeMap>) {
        if (!ALLOWED_KEYS.has(category)) continue

        const bucket = data[category] as Record<string, unknown> | undefined
        if (!bucket) continue

        for (const id of Object.keys(bucket)) {
          const value = bucket[id]
          if (value === null || value === undefined) {
            deleteKeyStmt.run(category, id)
          } else {
            writeKeyStmt.run(
              category,
              id,
              JSON.stringify(value, BufferJSON.replacer),
              Date.now()
            )
          }
        }
      }
    },
  }

  return {
    state: { creds, keys },
    saveCreds,
    close: () => {
      try {
        database.exec('PRAGMA wal_checkpoint(TRUNCATE)')
      } catch {
        // Non-fatal: the checkpoint is an optimisation, not a requirement.
      }
      database.close()
    },
    wasRegistered: () => registeredAtStart,
  }
}

/**
 * Cheap existence probe for a session's credential file.
 *
 * Unlike `hasStoredCredentials` this never opens the database, so it is safe to
 * call on every engine snapshot. It answers only "is there something to try",
 * which is the question the dashboard asks before restoring a session.
 */
export function hasCredentialFile(sessionKey: string): boolean {
  return existsSync(sessionDbPath(sessionKey))
}

/** Does this session already have credentials on disk? */
export function hasStoredCredentials(sessionKey: string): boolean {
  const dbPath = sessionDbPath(sessionKey)
  if (!existsSync(dbPath)) return false

  try {
    const database = new DatabaseSync(dbPath)
    const row = database
      .prepare('SELECT data FROM creds WHERE id = 1')
      .get() as SqliteCredsRow | undefined
    database.close()
    if (!row?.data) return false
    const creds = JSON.parse(row.data, BufferJSON.reviver) as AuthenticationCreds
    return Boolean(creds.registered)
  } catch {
    return false
  }
}

/** Wipe a session's credentials (used by logout and session deletion). */
export function clearStoredCredentials(sessionKey: string): void {
  const dbPath = sessionDbPath(sessionKey)
  for (const suffix of ['', '-wal', '-shm']) {
    rmSync(`${dbPath}${suffix}`, { force: true })
  }
}

/**
 * Map a flat Signal key id like "pre-key-42" onto its category. Mirrors Nano's
 * migration logic, which is what lets us import an existing Nano session.
 */
export function categoryFromKeyId(keyId: string): {
  category: string
  id: string
} | null {
  for (const prefix of CATEGORY_PREFIXES) {
    if (keyId.startsWith(`${prefix}-`)) {
      return { category: prefix, id: keyId.slice(prefix.length + 1) }
    }
  }
  return null
}
