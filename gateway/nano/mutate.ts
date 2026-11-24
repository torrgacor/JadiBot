import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { logger } from '../config'
import { NanoSettingsError } from './errors'
import { nanoDbPath, nanoStateDirs } from './introspect'
import type {
  NanoAccessMode,
  NanoBotSettingOp,
  NanoBotSettingResult,
} from '../../lib/engine/nano'

/**
 * Nano bot-database writes.
 *
 * The panel never keeps a second copy of the bot's settings: it writes into the
 * bot's own SQLite database, to the exact tables the script reads while handling
 * messages (`core/akses-mode.js`, `core/anticall.js`, `core/prefix.js`,
 * `core/welcome.js`, `core/antilink.js`). Every statement below mirrors the
 * upsert that the corresponding Nano module performs, so a change made here is
 * indistinguishable from one made with the bot's own `.onlygc` / `.anticall` /
 * `.welcome` / `.antilink` commands.
 *
 * Safety rules:
 *   • the schema is created with the script's own DDL, so a write performed
 *     before the bot has ever run still leaves a database the bot accepts;
 *   • values are validated against the script's own CHECK constraints before
 *     they are written, so the bot can never be handed a row it would reject;
 *   • `busy_timeout` is set so a write never fails just because the running bot
 *     happens to be mid-transaction.
 */

/** Verbatim DDL from the script (`core/sqlite.js`, `core/akses-mode.js`). */
const SCHEMA_DDL = [
  `CREATE TABLE IF NOT EXISTS bot_access_mode (
     id INTEGER PRIMARY KEY CHECK (id = 1),
     mode TEXT NOT NULL CHECK (mode IN ('normal', 'onlygc', 'onlypc'))
   )`,
  `CREATE TABLE IF NOT EXISTS anticall_status (
     id INTEGER PRIMARY KEY CHECK (id = 1),
     enabled INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS prefixes (
     chatId TEXT PRIMARY KEY,
     prefix TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS group_welcome (
     chatId TEXT PRIMARY KEY,
     enabled INTEGER NOT NULL DEFAULT 0,
     message TEXT,
     left_message TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS group_antilink (
     chatId TEXT PRIMARY KEY,
     gc_enabled INTEGER NOT NULL DEFAULT 0,
     ch_enabled INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS owners (
     number TEXT PRIMARY KEY,
     addedAt INTEGER NOT NULL,
     addedBy TEXT,
     name TEXT
   )`,
]

const ACCESS_MODES: NanoAccessMode[] = ['normal', 'onlygc', 'onlypc']

// ─────────────────────────────────────────────────────────────── opening ─────

interface OpenResult {
  db: DatabaseSync
  created: boolean
}

/**
 * Open the session's bot database for writing, creating it (with the script's
 * schema) when the bot has never run for this session.
 */
function openForWrite(sessionKey: string): OpenResult {
  const dirs = nanoStateDirs(sessionKey)
  const dbPath = nanoDbPath(sessionKey)
  const existed = fs.existsSync(dbPath)

  if (!existed) fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)
  // The bot may hold the database at this moment; wait instead of failing.
  try {
    db.exec('PRAGMA busy_timeout = 5000')
    db.exec('PRAGMA journal_mode = WAL')
  } catch (error) {
    logger.warn({ err: error, sessionKey }, 'could not set nano database pragmas')
  }
  for (const statement of SCHEMA_DDL) db.exec(statement)

  // A brand new database gets the script's own defaults, exactly as its
  // `ensureSchema()` helpers would on first boot.
  db.prepare('INSERT OR IGNORE INTO bot_access_mode (id, mode) VALUES (1, ?)').run('normal')
  db.prepare('INSERT OR IGNORE INTO anticall_status (id, enabled) VALUES (1, 0)').run()

  logger.info({ sessionKey, dbPath, existed }, 'opened nano bot database for write')
  return { db, created: !existed }
}

// ────────────────────────────────────────────────────────────── validation ───

function assertChatId(chatId: unknown): string {
  const value = String(chatId ?? '').trim()
  if (!/^\d{6,}@(g\.us|s\.whatsapp\.net|newsletter|lid)$/.test(value)) {
    throw new NanoSettingsError(
      'Chat ID tidak valid. Gunakan ID lengkap dari bot, contoh 120363199179422985@g.us.'
    )
  }
  return value
}

function assertGroupId(chatId: unknown): string {
  const value = assertChatId(chatId)
  if (!value.endsWith('@g.us')) {
    throw new NanoSettingsError('Fitur ini hanya untuk grup (ID harus berakhiran @g.us).')
  }
  return value
}

function assertPrefix(prefix: string): string {
  const value = prefix.trim()
  // The script matches the prefix as a literal string, so anything with spaces
  // or line breaks would silently break every command.
  if (value.length < 1 || value.length > 3) {
    throw new NanoSettingsError('Prefix harus 1–3 karakter.')
  }
  if (/\s/.test(value)) throw new NanoSettingsError('Prefix tidak boleh mengandung spasi.')
  return value
}

function assertOwnerNumber(number: string): string {
  const digits = number.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) {
    throw new NanoSettingsError('Nomor owner harus nomor internasional (contoh 6281234567890).')
  }
  return digits
}

// ──────────────────────────────────────────────────────────────── writes ────

/**
 * Apply one setting change to the bot database.
 *
 * Throws with a user-facing Indonesian message when the value is invalid, so the
 * API layer can hand the message straight to the dashboard toast.
 */
export function applyBotSetting(
  sessionKey: string,
  op: NanoBotSettingOp
): NanoBotSettingResult {
  const { db, created } = openForWrite(sessionKey)

  try {
    switch (op.op) {
      case 'access-mode': {
        if (!ACCESS_MODES.includes(op.mode)) {
          throw new NanoSettingsError(`Mode akses tidak valid: ${String(op.mode)}`)
        }
        db.prepare('UPDATE bot_access_mode SET mode = ? WHERE id = 1').run(op.mode)
        const label =
          op.mode === 'onlygc'
            ? 'hanya grup'
            : op.mode === 'onlypc'
              ? 'hanya private chat'
              : 'normal (grup + private)'
        return {
          op: op.op,
          message: `Mode bot diubah ke ${label}.`,
          dbCreated: created,
        }
      }

      case 'anticall': {
        db.prepare(
          'INSERT INTO anticall_status (id, enabled) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET enabled = excluded.enabled'
        ).run(op.enabled ? 1 : 0)
        return {
          op: op.op,
          message: `Anticall ${op.enabled ? 'diaktifkan' : 'dimatikan'}.`,
          dbCreated: created,
        }
      }

      case 'group-welcome': {
        const chatId = assertGroupId(op.chatId)
        const hasMessage = op.message !== undefined
        const hasLeft = op.leftMessage !== undefined

        if (!hasMessage && !hasLeft) {
          db.prepare(
            'INSERT INTO group_welcome (chatId, enabled) VALUES (?, ?) ON CONFLICT(chatId) DO UPDATE SET enabled = excluded.enabled'
          ).run(chatId, op.enabled ? 1 : 0)
        } else {
          // Preserve the columns the caller did not send.
          db.prepare(
            `INSERT INTO group_welcome (chatId, enabled, message, left_message)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(chatId) DO UPDATE SET
               enabled = excluded.enabled,
               message = CASE WHEN ? THEN excluded.message ELSE group_welcome.message END,
               left_message = CASE WHEN ? THEN excluded.left_message ELSE group_welcome.left_message END`
          ).run(
            chatId,
            op.enabled ? 1 : 0,
            hasMessage ? (op.message ?? null) : null,
            hasLeft ? (op.leftMessage ?? null) : null,
            hasMessage ? 1 : 0,
            hasLeft ? 1 : 0
          )
        }

        return {
          op: op.op,
          message: `Welcome/goodbye grup diperbarui${op.enabled ? '' : ' (nonaktif)'}.`,
          dbCreated: created,
        }
      }

      case 'group-antilink': {
        const chatId = assertGroupId(op.chatId)
        db.prepare(
          `INSERT INTO group_antilink (chatId, gc_enabled, ch_enabled) VALUES (?, ?, ?)
           ON CONFLICT(chatId) DO UPDATE SET
             gc_enabled = excluded.gc_enabled,
             ch_enabled = excluded.ch_enabled`
        ).run(chatId, op.groupEnabled ? 1 : 0, op.channelEnabled ? 1 : 0)

        return {
          op: op.op,
          message: `Antilink grup diperbarui (link grup: ${op.groupEnabled ? 'ON' : 'OFF'}, link channel: ${op.channelEnabled ? 'ON' : 'OFF'}).`,
          dbCreated: created,
        }
      }

      case 'chat-prefix': {
        const chatId = assertChatId(op.chatId)
        if (op.prefix === null || op.prefix === '') {
          db.prepare('DELETE FROM prefixes WHERE chatId = ?').run(chatId)
          return {
            op: op.op,
            message: 'Prefix chat dikembalikan ke default script.',
            dbCreated: created,
          }
        }
        const prefix = assertPrefix(op.prefix)
        db.prepare(
          'INSERT INTO prefixes (chatId, prefix) VALUES (?, ?) ON CONFLICT(chatId) DO UPDATE SET prefix = excluded.prefix'
        ).run(chatId, prefix)
        return {
          op: op.op,
          message: `Prefix chat diset ke "${prefix}".`,
          dbCreated: created,
        }
      }

      case 'add-owner': {
        const number = assertOwnerNumber(op.number)
        db.prepare(
          `INSERT INTO owners (number, addedAt, addedBy, name) VALUES (?, ?, ?, ?)
           ON CONFLICT(number) DO UPDATE SET name = excluded.name`
        ).run(number, Date.now(), 'panel', op.name?.trim() || null)
        return {
          op: op.op,
          message: `Owner ${number} ditambahkan ke database bot.`,
          dbCreated: created,
        }
      }

      case 'remove-owner': {
        const number = assertOwnerNumber(op.number)
        const result = db
          .prepare('DELETE FROM owners WHERE number = ?')
          .run(number)
        if (Number(result.changes) === 0) {
          throw new NanoSettingsError(`Owner ${number} tidak ada di database bot.`)
        }
        return {
          op: op.op,
          message: `Owner ${number} dihapus dari database bot.`,
          dbCreated: created,
        }
      }

      default: {
        // Exhaustiveness: adding an op without handling it is a compile error.
        const never: never = op
        throw new NanoSettingsError(`Operasi tidak dikenal: ${JSON.stringify(never)}`)
      }
    }
  } finally {
    db.close()
  }
}
