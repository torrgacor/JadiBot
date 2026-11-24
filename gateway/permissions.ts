import fs from 'node:fs'
import path from 'node:path'

/**
 * Filesystem permissions for anything that holds a secret.
 *
 * The per-session state tree holds the most sensitive data this platform ever
 * touches: `sessions/auth.db` is a live WhatsApp credential — whoever reads it
 * can talk to WhatsApp as that bot. Nothing else in the process needs to read
 * it, so the directory is 0700 and the files inside are 0600.
 *
 * Why the *directory* carries most of the weight: the bot script creates and
 * rewrites its own credential files, and we do not get a vote in the mode it
 * uses. Making the directory unreadable to everyone else closes the tree
 * regardless of the mode on the files inside it.
 *
 * Every call is best-effort. A chmod that fails (an unusual filesystem, a file
 * that vanished mid-walk) must never take down the gateway — the session still
 * works, it is simply not hardened by us. Failures are silent by design and
 * surfaced only through the caller's own logging if it wants to.
 */

const DIR_MODE = 0o700
const FILE_MODE = 0o600

export function hardenDir(dir: string): void {
  try {
    fs.chmodSync(dir, DIR_MODE)
  } catch {
    // Directory may not exist yet — the caller creates it first.
  }
}

export function hardenFile(file: string): void {
  try {
    if (fs.existsSync(file)) fs.chmodSync(file, FILE_MODE)
  } catch {
    // Best effort only.
  }
}

/** Make a directory and immediately restrict it, avoiding a readable window. */
export function mkdirPrivate(dir: string): void {
  fs.mkdirSync(dir, { recursive: true, mode: DIR_MODE })
  hardenDir(dir)
}

/**
 * Restrict a session's sensitive subtree.
 *
 * Only the known-sensitive locations are touched (credential database, the
 * bot's own database, the message journal) rather than walking the whole tree:
 * the bot's data directory can grow large, and a full recursive walk on every
 * session start would be a cost with no security benefit.
 */
export function hardenSessionState(dirs: {
  sessionsDir: string
  dataDir: string
  bridgeDir: string
}): void {
  hardenDir(dirs.sessionsDir)
  hardenDir(dirs.dataDir)
  hardenDir(path.dirname(dirs.dataDir))
  hardenDir(dirs.bridgeDir)

  for (const name of ['auth.db', 'auth.db-wal', 'auth.db-shm']) {
    hardenFile(path.join(dirs.sessionsDir, name))
  }

  for (const name of ['nano.sqlite', 'nano.sqlite-wal', 'nano.sqlite-shm']) {
    hardenFile(path.join(dirs.dataDir, name))
  }

  for (const name of ['commands.jsonl', 'results.jsonl', 'messages.jsonl']) {
    hardenFile(path.join(dirs.bridgeDir, name))
  }
}
