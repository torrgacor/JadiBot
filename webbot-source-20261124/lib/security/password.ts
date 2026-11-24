import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

/**
 * Password hashing with scrypt.
 *
 * scrypt is memory-hard and is the KDF Node ships in core, so password hashing
 * here needs no native module (which keeps the gateway and the web app free of
 * ABI-mismatch problems). Parameters follow the `crypto.scrypt` guidance:
 *   N=16384, r=8, p=1  →  ~16 MB per hash, ~100ms on commodity hardware.
 *
 * Stored format: scrypt$<N>$<r>$<p>$<saltB64>$<hashB64>
 * Parameters are embedded so they can be raised later without invalidating
 * existing hashes — `verifyPassword` reads them back from the stored value.
 */

const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const KEY_LENGTH = 64
const SALT_LENGTH = 16

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const derived = await scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    // Header + 128*N*r must fit, with headroom.
    maxmem: 64 * 1024 * 1024,
  })

  return [
    'scrypt',
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$')
}

/**
 * Characters used for generated passwords.
 *
 * Ambiguous glyphs are left out (l/1, I/1, O/0) because these passwords are
 * read off a screen and typed by hand — a character that can be misread turns
 * into a support ticket.
 */
const LOWER = 'abcdefghijkmnpqrstuvwxyz'
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const DIGITS = '23456789'
const ALL = LOWER + UPPER + DIGITS

function pick(alphabet: string): string {
  // `randomBytes` rather than `Math.random`: this value is a credential, and
  // the modulo bias is negligible over a 55-character alphabet.
  return alphabet[randomBytes(1)[0] % alphabet.length]
}

/**
 * Generate a random password that satisfies `passwordSchema` (at least one
 * lowercase, one uppercase and one digit, 8–128 characters).
 *
 * One character of each required class is placed first, the rest are drawn from
 * the full alphabet, and the result is shuffled so the guaranteed characters do
 * not sit in predictable positions. Used for administrator-initiated resets,
 * where the account owner has not chosen the value themselves.
 */
export function generatePassword(length = 12): string {
  const size = Math.min(128, Math.max(8, length))
  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS)]

  while (chars.length < size) chars.push(pick(ALL))

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false

  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const N = Number(parts[1])
  const r = Number(parts[2])
  const p = Number(parts[3])
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false

  let salt: Buffer
  let expected: Buffer
  try {
    salt = Buffer.from(parts[4], 'base64')
    expected = Buffer.from(parts[5], 'base64')
  } catch {
    return false
  }

  try {
    const derived = await scryptAsync(
      password.normalize('NFKC'),
      salt,
      expected.length,
      { N, r, p, maxmem: 64 * 1024 * 1024 }
    )
    return timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

/**
 * Re-exported from the client-safe module so server code has a single import
 * site for everything password-related, while forms import the pure helper
 * directly (this file pulls in `node:crypto` and must stay server-only).
 */
export { passwordStrength } from '@/lib/utils/password-strength'
export type { PasswordStrength } from '@/lib/utils/password-strength'
