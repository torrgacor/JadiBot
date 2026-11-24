/**
 * Re-seal stored secrets after an ENCRYPTION_KEY rotation.
 *
 * `ENCRYPTION_KEY` protects values that must be recoverable — today that is
 * `User.twoFactorSecret`. Rotating it would orphan every value sealed with the
 * old key, so the rotation is done in two stages:
 *
 *   1. Put the new value in `ENCRYPTION_KEY` and the previous one in
 *      `ENCRYPTION_KEY_OLD`. The running app now decrypts with either.
 *   2. Run this script to re-seal every stored ciphertext under the new key.
 *      Then delete `ENCRYPTION_KEY_OLD` and restart — the old key is no longer
 *      needed by anything.
 *
 *   npx tsx scripts/rotate-encryption-key.ts
 *   npx tsx scripts/rotate-encryption-key.ts --dry-run
 *
 * Safe to re-run: a row already sealed with the current key is skipped, so the
 * script can be interrupted and started again.
 */

import path from 'node:path'
import { existsSync } from 'node:fs'

// Load `.env` before anything reads it. Next.js does this for the web app; the
// gateway does it explicitly; this script has to, because the Prisma client
// captures DATABASE_URL the moment `lib/db` is imported. The imports below are
// dynamic for exactly that reason.
const envFile = path.resolve(process.cwd(), '.env')
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    // Fall back to the ambient environment.
  }
}

const { db } = await import('../lib/db')
const { decryptSecret, encryptSecret, isSealedWithCurrentKey } = await import(
  '../lib/security/crypto'
)

const dryRun = process.argv.includes('--dry-run')

/**
 * Every column that holds an `encryptSecret` payload. Adding a field here (and
 * to the schema) is the whole job when a new recoverable secret is introduced.
 */
async function rotateTwoFactorSecrets(): Promise<{ total: number; rotated: number }> {
  const users = await db.user.findMany({
    where: { twoFactorSecret: { not: null } },
    select: { id: true, email: true, twoFactorSecret: true },
  })

  let rotated = 0

  for (const user of users) {
    const sealed = user.twoFactorSecret
    // No value, already current, or unreadable with either key.
    if (!sealed || isSealedWithCurrentKey(sealed)) continue

    const plaintext = decryptSecret(sealed)
    if (plaintext === null) {
      // Neither the new key nor ENCRYPTION_KEY_OLD could open it. The value is
      // lost, and guessing at it would silently disable a security control, so
      // say so loudly and leave the row untouched.
      console.error(
        `  ✗ ${user.email}: cannot decrypt with ENCRYPTION_KEY or ENCRYPTION_KEY_OLD.`
      )
      continue
    }

    if (dryRun) {
      console.log(`  · would re-seal ${user.email}`)
      rotated += 1
      continue
    }

    await db.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: encryptSecret(plaintext) },
    })
    console.log(`  ✓ re-sealed ${user.email}`)
    rotated += 1
  }

  return { total: users.length, rotated }
}

async function main(): Promise<void> {
  const current = process.env.ENCRYPTION_KEY
  const previous = process.env.ENCRYPTION_KEY_OLD

  if (!previous) {
    console.error(
      'ENCRYPTION_KEY_OLD is not set. Nothing to rotate from — this script only\n' +
        'runs *after* a new ENCRYPTION_KEY has been put in place.'
    )
    process.exit(1)
  }
  if (previous === current) {
    console.error('ENCRYPTION_KEY_OLD is identical to ENCRYPTION_KEY — nothing to do.')
    process.exit(1)
  }

  console.log(`\n▸ Re-sealing secrets${dryRun ? ' (dry run)' : ''}`)
  const { total, rotated } = await rotateTwoFactorSecrets()

  console.log(`\n  two-factor secrets : ${rotated} of ${total} re-sealed`)

  if (dryRun) {
    console.log('\nDry run — nothing was written.\n')
    return
  }
  if (rotated === 0) {
    console.log('\nNothing left to re-seal. It is safe to remove ENCRYPTION_KEY_OLD.\n')
    return
  }

  console.log('\nDone. Remove ENCRYPTION_KEY_OLD from .env and restart the web process.\n')
}

void main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => process.exit())
