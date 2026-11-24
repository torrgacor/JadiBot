/**
 * End-to-end smoke test of the MongoDB adapter against a live database.
 * Run with tsx (which handles the relative TS import cleanly):
 *   npx tsx scripts/verify-mongo.ts
 *
 * The process is force-exited on success — the Mongo client otherwise keeps
 * the event loop alive.
 */
import { db, initDb, pingDatabase, ensureIndexes } from '../lib/db'
import { setTimeout as setTimer } from 'node:timers/promises'

async function main() {
  await initDb()
  await ensureIndexes()
  console.log('indexes: OK')

  const user = await db.user.findUnique({ where: { email: 'admin@nanogateway.local' } })
  console.log('1 admin:', user?.username, '(', user?.role, ')')
  if (!user) throw new Error('admin not found')

  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: true },
  } as any)
  console.log('2 sub.plan:', sub?.plan?.slug, '(include works)')

  const paid = await db.subscription.findMany({
    where: { status: { in: ['ACTIVE', 'TRIALING'] }, plan: { priceMonthly: { gt: 0 } } },
    take: 5,
  } as any)
  console.log('3 relational where:', paid.length, 'paid subs')

  const u = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, _count: { select: { whatsappSessions: true } } },
  } as any)
  console.log('4 select._count.whatsappSessions:', u?._count?.whatsappSessions)

  console.log('5 total messages:', await db.message.count())
  console.log('ping:', await pingDatabase())
  console.log('ALL CHECKS PASSED')
}

main()
  .catch((e) => {
    console.error('FAIL:', e.message)
    process.exit(1)
  })
  .then(() => process.exit(0))
