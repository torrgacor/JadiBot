import { Secret, TOTP } from 'otpauth'
import { randomBytes, createHash } from 'crypto'
import { decryptSecret, encryptSecret } from '@/lib/security/crypto'

/**
 * TOTP two-factor authentication (RFC 6238) built on `otpauth`.
 *
 * Compatibility: SHA-1, 6 digits, 30-second period — the defaults understood by
 * Google Authenticator, Authy, 1Password, and every other mainstream app.
 * A 1-step window is allowed in each direction to tolerate clock drift.
 */

const ISSUER = 'NANO GATEWAY'

function buildTotp(secretBase32: string, label: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  })
}

export interface TwoFactorEnrollment {
  /** Base32 secret shown to the user (and encoded in the QR). */
  secret: string
  /** otpauth:// URI to render as a QR code. */
  otpauthUrl: string
  /** One-time recovery codes — shown exactly once, stored hashed. */
  backupCodes: string[]
}

export function createTwoFactorEnrollment(accountLabel: string): TwoFactorEnrollment {
  const secret = new Secret({ size: 20 })
  const totp = buildTotp(secret.base32, accountLabel)

  return {
    secret: secret.base32,
    otpauthUrl: totp.toString(),
    backupCodes: generateBackupCodes(),
  }
}

export function verifyTotpCode(
  encryptedSecret: string | null,
  code: string
): boolean {
  const secret = decryptSecret(encryptedSecret)
  if (!secret) return false

  const totp = buildTotp(secret, 'user')
  // `window: 1` accepts the previous, current and next code.
  const delta = totp.validate({ token: code.replace(/\D/g, ''), window: 1 })
  return delta !== null
}

/** Encrypt before persisting — the raw secret must never hit the database. */
export function sealTotpSecret(base32Secret: string): string {
  return encryptSecret(base32Secret)
}

export function unsealTotpSecret(encrypted: string | null): string | null {
  return decryptSecret(encrypted)
}

// ──────────────────────────────────────────────────────── backup codes ───────

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString('hex').toUpperCase() // 10 chars
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`
  })
}

/**
 * Backup codes are stored as SHA-256 digests. They are high-entropy (40 bits)
 * so a fast hash is appropriate — unlike user passwords, there is no dictionary
 * to attack and the codes are single-use.
 */
export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code.replace(/[\s-]/g, '').toUpperCase()).digest('hex')
}

/** Consume a backup code, returning the remaining hashes, or null if invalid. */
export function consumeBackupCode(
  hashedCodes: string[],
  candidate: string
): string[] | null {
  const candidateHash = hashBackupCode(candidate)
  const index = hashedCodes.indexOf(candidateHash)
  if (index === -1) return null
  return hashedCodes.filter((_, i) => i !== index)
}
