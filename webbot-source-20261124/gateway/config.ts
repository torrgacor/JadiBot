import path from 'node:path'
import { existsSync } from 'node:fs'
import pino from 'pino'
import { EngineInputError } from '../lib/engine/types'

/**
 * Gateway configuration.
 *
 * Kept separate from the web app's `lib/env.ts`: the gateway is a standalone
 * process with a smaller surface, and it must be startable without the web
 * app's required variables present.
 */

// Next.js loads `.env` for us, but this process runs under plain Node/tsx. Load
// the same file explicitly so both halves of the platform read one config.
// `process.loadEnvFile` (Node 20.12+) does not overwrite variables that are
// already set, so a real deployment's environment always wins.
const envFile = path.resolve(process.cwd(), '.env')
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    // A malformed .env should not stop the gateway from using process env.
  }
}

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`[gateway] missing required env var: ${name}`)
  return value
}

export const gatewayConfig = {
  host: process.env.GATEWAY_HOST ?? '127.0.0.1',
  port: Number(process.env.GATEWAY_PORT ?? 4001),

  /** Shared secret the web app must present on every request. */
  token: required('GATEWAY_TOKEN'),

  /** Root folder for per-session auth state. */
  storageDir: path.resolve(
    process.cwd(),
    process.env.GATEWAY_STORAGE_DIR ?? './storage/sessions'
  ),

  /**
   * The Nano bot script is the engine of record. `local-baileys` remains
   * available as a fallback (and for sessions that need group export), but
   * Nano is what the product is built around.
   */
  driver: (process.env.ENGINE_DRIVER ?? 'nano-process') as
    | 'local-baileys'
    | 'nano-process',

  /** Where the provided Nano script lives (only for the nano-process driver). */
  nanoEngineDir: process.env.NANO_ENGINE_DIR
    ? path.resolve(process.env.NANO_ENGINE_DIR)
    : null,

  /** The web app, so the gateway can push events back to it. */
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  /** Set NANO_LOG=trace to capture raw WhatsApp protocol traffic. */
  logLevel: process.env.GATEWAY_LOG ?? 'info',
} as const

export const logger = pino({
  level: gatewayConfig.logLevel,
  // Baileys passes its own logger in; keep ours readable in a terminal.
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : { target: 'pino/file', options: { destination: 1 } },
})

/**
 * A session key becomes a directory name, so it is validated before it ever
 * reaches the filesystem.
 *
 * Session keys are cuids minted by the database. The gateway, however, also
 * receives keys in URL paths, and Node's `path.join`/`path.resolve` happily
 * normalise `..` and treat a leading `/` as absolute — so an unvalidated key
 * such as `../../etc` would climb out of the storage tree. Both operations
 * would then touch a directory that is not a session at all. Constraining the
 * key to an opaque, slash-free token closes that class outright, which is the
 * only shape a real key ever has.
 */
const SESSION_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function assertSessionKey(sessionKey: string): string {
  if (typeof sessionKey !== 'string' || !SESSION_KEY_PATTERN.test(sessionKey)) {
    throw new EngineInputError('INVALID_SESSION_KEY', 'Kunci sesi tidak valid.')
  }
  return sessionKey
}

/** Path to a session's auth-state directory. */
export function sessionDir(sessionKey: string): string {
  return path.join(gatewayConfig.storageDir, assertSessionKey(sessionKey))
}

/** Path to a session's SQLite auth database (same layout as Nano's). */
export function sessionDbPath(sessionKey: string): string {
  return path.join(sessionDir(sessionKey), 'auth.db')
}
