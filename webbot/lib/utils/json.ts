/**
 * JSON helpers.
 *
 * The database targets both SQLite and Postgres, and SQLite has no native
 * `Json` column type in Prisma — so structured data (scopes, events, action
 * lists, metadata) is stored as TEXT and (de)serialised here. Every parse is
 * defensive: a corrupt row must never take down a request.
 */

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return (parsed ?? fallback) as T
  } catch {
    return fallback
  }
}

export function parseJsonArray<T = string>(
  value: string | null | undefined
): T[] {
  const parsed = parseJson<unknown>(value, [])
  return Array.isArray(parsed) ? (parsed as T[]) : []
}

export function stringifyJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? null)
  } catch {
    return 'null'
  }
}

/** Redact obviously sensitive keys before persisting a request payload log. */
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'secret',
  'apikey',
  'authorization',
  'cookie',
  'twofactorsecret',
]

export function redact<T>(value: T, depth = 0): T {
  if (depth > 6 || value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1)) as unknown as T

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      out[key] = '[redacted]'
    } else {
      out[key] = redact(val, depth + 1)
    }
  }
  return out as T
}
