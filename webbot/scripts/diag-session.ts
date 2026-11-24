/**
 * Diagnose why a session cookie does not validate, using the app's own
 * `lib/db` + `lib/security/crypto` (the exact code paths the server uses).
 *
 *   node --import tsx scripts/diag-session.ts <cookie-token>
 */
import { initDb, db } from '../lib/db'
import { hmac } from '../lib/security/crypto'

const cookie = process.argv[2]
if (!cookie) {
  console.error('usage: tsx scripts/diag-session.ts <token>')
  process.exit(2)
}

async function main() {
  await initDb()
  const h = hmac(cookie)
  const row: any = await db.loginSession.findUnique({
    where: { tokenHash: h },
    include: { user: true },
  } as any)

  console.log('cookie:', cookie.slice(0, 12) + '…')
  console.log('hmac(cookie):', h.slice(0, 16) + '…')
  console.log('row found:', !!row)
  if (row) {
    console.log('  revokedAt:', row.revokedAt ? new Date(row.revokedAt).toISOString() : 'null')
    console.log(
      '  expiresAt:',
      row.expiresAt ? new Date(row.expiresAt).toISOString() : 'MISSING',
      '→ valid:',
      (row.expiresAt?.getTime() ?? 0) > Date.now()
    )
    console.log('  user found:', !!row.user, 'user.status:', row.user?.status)
  } else {
    // show the newest session so we can compare tokenHash shapes
    const latest: any = await db.loginSession.findFirst({ orderBy: { createdAt: 'desc' } } as any)
    console.log('  (no match) newest session tokenHash:', latest?.tokenHash?.slice(0, 16), 'len', latest?.tokenHash?.length)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error('ERR', e.message)
  process.exit(1)
})
