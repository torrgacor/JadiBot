/**
 * Rotate an account's password and revoke every session it has open.
 *
 *   npx tsx scripts/rotate-admin-password.ts [email] [--password "…"]
 *
 * Generated passwords are printed to stdout exactly once and are never stored
 * anywhere else — neither in the repository nor in the database in clear text,
 * only as a scrypt hash.
 *
 * Useful immediately after seeding, because the seeded administrator ships with
 * a published default that must not survive contact with a public URL.
 */

import { randomBytes } from 'node:crypto'
import { db } from '../lib/db'
import { hashPassword } from '../lib/security/password'

const args = process.argv.slice(2)
const passwordFlag = args.findIndex((value) => value === '--password')
const explicit = passwordFlag !== -1 ? args[passwordFlag + 1] : undefined
const email = args.find((value) => value.includes('@')) ?? 'admin@nanogateway.local'

/**
 * Readable but high-entropy: grouped so it can be typed from a screen, drawn
 * from an unambiguous alphabet so 0/O and 1/l cannot be confused.
 */
function generatePassword(groups = 5, size = 5): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const out: string[] = []
  for (let group = 0; group < groups; group += 1) {
    let chunk = ''
    for (const byte of randomBytes(size)) {
      chunk += alphabet[byte % alphabet.length]
    }
    out.push(chunk)
  }
  return out.join('-')
}

async function main() {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true, role: true },
  })

  if (!user) {
    console.error(`No account found for ${email}.`)
    process.exit(1)
  }

  const password = explicit ?? generatePassword()

  if (password.length < 12) {
    console.error('Refusing to set a password shorter than 12 characters.')
    process.exit(1)
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
      // A password change must also clear any lockout the old one caused.
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  })

  // Anything holding the previous password stays signed in otherwise, which
  // would defeat the point of rotating it.
  const revoked = await db.loginSession.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  console.log(`\nAccount   : ${user.email} (${user.username}, ${user.role})`)
  console.log(`Sessions  : ${revoked.count} revoked`)
  if (explicit) {
    console.log('Password  : set from --password (not shown)')
  } else {
    console.log(`Password  : ${password}`)
    console.log('\nShown once. Store it in a password manager.')
  }
  console.log('')
}

void main().finally(() => process.exit(0))
