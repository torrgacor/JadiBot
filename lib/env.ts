import { z } from 'zod'

/**
 * Server-side environment validation.
 *
 * Fails loudly at boot if something required is missing, instead of throwing
 * a confusing `undefined` deep inside a request handler.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY: z
    .string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  // Set only while rotating ENCRYPTION_KEY: it lets values sealed with the
  // previous key keep decrypting until scripts/rotate-encryption-key.ts has
  // re-sealed them. Remove it once that script reports nothing left to do.
  ENCRYPTION_KEY_OLD: z.string().min(32).optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  // Public origin used for generated metadata (icon link, og:image). Distinct
  // from NEXT_PUBLIC_APP_URL, which is the address the app reaches itself on
  // and may be loopback behind a tunnel. Read at build time — see app/layout.tsx.
  SITE_URL: z.string().url().optional(),

  GATEWAY_HOST: z.string().default('127.0.0.1'),
  GATEWAY_PORT: z.coerce.number().int().positive().default(4001),
  GATEWAY_TOKEN: z.string().min(8, 'GATEWAY_TOKEN must be set'),
  GATEWAY_STORAGE_DIR: z.string().default('./storage/sessions'),

  // Nano is the engine of record; local-baileys remains an opt-in fallback.
  ENGINE_DRIVER: z.enum(['local-baileys', 'nano-process']).default('nano-process'),
  NANO_ENGINE_DIR: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default('NANO GATEWAY <no-reply@nanogateway.local>'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  BILLING_PROVIDER: z.string().default('manual'),
  REALTIME_TRANSPORT: z.enum(['sse', 'ws']).default('sse'),
})

type ServerEnv = z.infer<typeof serverSchema>

function loadEnv(): ServerEnv {
  const parsed = serverSchema.safeParse(process.env)

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new Error(
      `Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env and fill it in.`
    )
  }

  return parsed.data
}

let cached: ServerEnv | null = null

/** Validated server environment. Throws on first access if misconfigured. */
export const env = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    if (!cached) cached = loadEnv()
    return cached[prop as keyof ServerEnv]
  },
})

/** Non-throwing check used by health/status endpoints. */
export function checkEnv(): { ok: boolean; missing: string[] } {
  const parsed = serverSchema.safeParse(process.env)
  if (parsed.success) return { ok: true, missing: [] }
  return {
    ok: false,
    missing: parsed.error.issues.map((i) => i.path.join('.')),
  }
}

/** Feature flags derived from whether optional integrations are configured. */
export const features = {
  get smtp() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)
  },
  get google() {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  },
  get github() {
    return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  },
}
