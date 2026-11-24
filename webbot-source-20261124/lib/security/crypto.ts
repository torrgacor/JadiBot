import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'crypto'

/**
 * Cryptographic primitives.
 *
 * Everything that touches secrets lives here so there is exactly one place to
 * audit. Nothing in this file is allowed to be "clever" — it must be obviously
 * correct.
 */

// ───────────────────────────────────────────────── at-rest encryption ────────

/**
 * AES-256-GCM encryption for secrets that must be recoverable — today that is
 * the sealed TOTP secret in `User.twoFactorSecret`, the only value stored this
 * way. Format: v1.<iv>.<tag>.<ciphertext>, base64url.
 *
 * GCM gives us authenticity as well as confidentiality, so a tampered row
 * fails to decrypt instead of silently returning garbage.
 */

/** Derive a fixed 32-byte key from whatever length the operator supplied. */
function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest()
}

function encryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters.')
  }
  return deriveKey(secret)
}

/**
 * The previous ENCRYPTION_KEY, kept only while a rotation is being completed.
 *
 * Rotating ENCRYPTION_KEY would otherwise orphan every value sealed with the old
 * key. While `ENCRYPTION_KEY_OLD` is set, decryption falls back to it so the
 * running app keeps working, and `scripts/rotate-encryption-key.ts` re-seals the
 * stored ciphertexts with the new key. Once that reports nothing left to do, the
 * variable is removed.
 */
function legacyEncryptionKeys(): Buffer[] {
  const secret = process.env.ENCRYPTION_KEY_OLD
  // An empty, too-short, or unchanged value would only add a redundant attempt.
  if (!secret || secret.length < 32 || secret === process.env.ENCRYPTION_KEY) {
    return []
  }
  return [deriveKey(secret)]
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.')
}

/** Attempt a single key. Returns null on a bad key, bad input, or tampering. */
function tryDecrypt(key: Buffer, payload: string): string | null {
  const parts = payload.split('.')
  if (parts.length !== 4 || parts[0] !== 'v1') return null

  try {
    const [, ivPart, tagPart, dataPart] = parts
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivPart, 'base64url')
    )
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    // Wrong key or tampered ciphertext — never throw to the caller.
    return null
  }
}

/**
 * Returns null when the value is missing, malformed, or tampered with.
 *
 * The current key is tried first, then `ENCRYPTION_KEY_OLD` when a rotation is
 * in flight (see `legacyEncryptionKeys`).
 */
export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) return null

  const withCurrent = tryDecrypt(encryptionKey(), payload)
  if (withCurrent !== null) return withCurrent

  for (const legacy of legacyEncryptionKeys()) {
    const withLegacy = tryDecrypt(legacy, payload)
    if (withLegacy !== null) return withLegacy
  }
  return null
}

/**
 * True when the payload was sealed with the key currently in `ENCRYPTION_KEY`.
 *
 * The rotation script uses this to find the rows that still need re-sealing, so
 * it can be re-run until it reports nothing left to do.
 */
export function isSealedWithCurrentKey(payload: string | null | undefined): boolean {
  if (!payload) return false
  return tryDecrypt(encryptionKey(), payload) !== null
}

// ─────────────────────────────────────────────────────────── hashing ─────────

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/**
 * Keyed hash used for API keys and session tokens. Peppered with AUTH_SECRET so
 * a stolen database alone is not enough to brute-force low-entropy values.
 */
export function hmac(value: string): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is required.')
  return createHmac('sha256', secret).update(value).digest('hex')
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Constant-time string comparison that tolerates unequal lengths by comparing
 * digests, so callers cannot learn the length of a secret by timing.
 */
export function safeCompare(a: string, b: string): boolean {
  return safeEqual(sha256(a), sha256(b))
}

// ──────────────────────────────────────────────────────────── tokens ────────

/** URL-safe random token. The raw value is never stored, only its hash. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

// ─────────────────────────────────────────────────────────── api keys ───────

const API_KEY_PREFIX = 'ng'

/**
 * API key format: ng_<env>_<32 random chars>
 * e.g. ng_live_9f2Kd8sLqPzR4tVwXyZ1aB3cD5eF7gH9
 */
export function generateApiKey(): {
  key: string
  prefix: string
  lastFour: string
  hash: string
} {
  const envPart = process.env.NODE_ENV === 'production' ? 'live' : 'test'
  const random = randomBytes(24).toString('base64url').replace(/[-_]/g, '')
  const key = `${API_KEY_PREFIX}_${envPart}_${random.slice(0, 32)}`
  return {
    key,
    prefix: `${API_KEY_PREFIX}_${envPart}_`,
    lastFour: key.slice(-4),
    hash: hmac(key),
  }
}

/** Display helper: ng_live_…4f2a */
export function maskApiKey(lastFour: string): string {
  return `ng_••••••••${lastFour}`
}
