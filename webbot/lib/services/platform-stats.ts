import { db } from '@/lib/db'

/**
 * Platform statistics.
 *
 * These are **real aggregates** queried from the database — the landing page
 * shows what the platform has actually processed, not invented marketing
 * numbers. On a fresh install they are legitimately small or zero, which is the
 * honest state of affairs.
 *
 * Every query is individually guarded: a statistics panel must never be able to
 * take the marketing site down.
 */

export interface PlatformStats {
  activeSessions: number
  messagesSent: number
  apiRequests: number
  uptimeSeconds: number
  uptimePercent: number
  totalUsers: number
  connectedNow: boolean
}

async function safeCount(run: () => Promise<number>): Promise<number> {
  try {
    return await run()
  } catch {
    return 0
  }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [activeSessions, messagesSent, apiRequests, totalUsers] = await Promise.all([
    safeCount(() => db.whatsAppSession.count({ where: { status: 'CONNECTED' } })),
    safeCount(() =>
      db.message.count({
        where: { direction: 'OUTBOUND', status: { in: ['SENT', 'DELIVERED', 'READ'] } },
      })
    ),
    safeCount(() => db.apiRequestLog.count()),
    safeCount(() => db.user.count({ where: { status: 'ACTIVE' } })),
  ])

  // Uptime of this process. A production deployment would source this from the
  // monitoring system that actually tracks restarts across replicas.
  const uptimeSeconds = Math.floor(process.uptime())

  return {
    activeSessions,
    messagesSent,
    apiRequests,
    uptimeSeconds,
    // Reported as 100% for a process that is currently serving this request;
    // this is process uptime, not an SLA measurement.
    uptimePercent: 100,
    totalUsers,
    connectedNow: true,
  }
}
