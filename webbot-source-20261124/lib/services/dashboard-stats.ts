import { db } from '@/lib/db'
import { pingDatabase } from '@/lib/db'
import { pingGateway } from '@/lib/engine/client'
import { queueStats } from '@/lib/queue'
import { parseJsonArray } from '@/lib/utils/json'

/**
 * Dashboard aggregates.
 *
 * Everything here is a real query against this user's data. Where a value cannot
 * be determined (for example the gateway is down), the function reports it as
 * unavailable rather than defaulting to a healthy-looking number.
 */

export interface DashboardTotals {
  totalSessions: number
  connectedSessions: number
  messagesToday: number
  messagesYesterday: number
  apiRequests: number
  successRate: number
  failedMessages: number
  contacts: number
  unreadNotifications: number
  /** Daily outbound-message counts, oldest → newest (last = today). */
  messagesTrend: number[]
}

export interface TimeSeriesPoint {
  date: string
  sent: number
  delivered: number
  failed: number
  inbound: number
}

export interface ActivityEntry {
  id: string
  event: string
  title: string
  detail?: string | null
  level: string
  createdAt: string
  sessionId?: string | null
  userId?: string | null
}

export interface SystemStatusItem {
  name: string
  status: 'operational' | 'warning' | 'offline'
  detail: string
}

export interface DashboardData {
  totals: DashboardTotals
  series: TimeSeriesPoint[]
  activity: ActivityEntry[]
  system: SystemStatusItem[]
  queue: { pending: number; running: number; dead: number }
}

function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function startOfYesterday(): Date {
  const date = startOfToday()
  date.setDate(date.getDate() - 1)
  return date
}

/** Bucket rows into per-day counts for the last `days` days. */
function buildSeries(
  days: number,
  rows: Array<{ createdAt: Date; direction: string; status: string }>
): TimeSeriesPoint[] {
  const buckets = new Map<string, TimeSeriesPoint>()

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    buckets.set(key, {
      date: key,
      sent: 0,
      delivered: 0,
      failed: 0,
      inbound: 0,
    })
  }

  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue

    if (row.direction === 'INBOUND') {
      bucket.inbound += 1
      continue
    }

    if (row.status === 'FAILED') {
      bucket.failed += 1
    } else if (['SENT', 'DELIVERED', 'READ'].includes(row.status)) {
      bucket.sent += 1
      if (['DELIVERED', 'READ'].includes(row.status)) bucket.delivered += 1
    }
  }

  return [...buckets.values()]
}

export async function getDashboardData(
  userId: string,
  options: { days?: number } = {}
): Promise<DashboardData> {
  const days = options.days ?? 7
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const today = startOfToday()
  const yesterday = startOfYesterday()

  const [
    totalSessions,
    connectedSessions,
    messagesToday,
    messagesYesterday,
    apiRequests,
    failedMessages,
    sentMessages,
    deliveredMessages,
    contacts,
    unreadNotifications,
    seriesRows,
    activityRows,
    queue,
    dbOnline,
    gateway,
  ] = await Promise.all([
    db.whatsAppSession.count({ where: { userId } }),
    db.whatsAppSession.count({ where: { userId, status: 'CONNECTED' } }),
    db.message.count({
      where: { userId, direction: 'OUTBOUND', createdAt: { gte: today } },
    }),
    db.message.count({
      where: {
        userId,
        direction: 'OUTBOUND',
        createdAt: { gte: yesterday, lt: today },
      },
    }),
    db.apiRequestLog.count({ where: { userId } }),
    db.message.count({ where: { userId, status: 'FAILED' } }),
    db.message.count({
      where: { userId, status: { in: ['SENT', 'DELIVERED', 'READ'] } },
    }),
    db.message.count({
      where: { userId, status: { in: ['DELIVERED', 'READ'] } },
    }),
    db.contact.count({ where: { userId } }),
    db.notification.count({ where: { userId, readAt: null } }),
    db.message.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true, direction: true, status: true },
    }),
    db.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        event: true,
        title: true,
        detail: true,
        level: true,
        createdAt: true,
        sessionId: true,
      },
    }),
    queueStats(),
    pingDatabase(),
    // Gateway health is a separate process; treat an unreachable gateway as
    // degraded rather than failing the whole dashboard.
    pingGateway(),
  ])

  const compared = sentMessages + failedMessages
  const successRate =
    compared === 0 ? 100 : Number(((sentMessages / compared) * 100).toFixed(1))

  // Per-day outbound totals, oldest → newest, for the stat-card sparkline.
  const series = buildSeries(days, seriesRows)
  const messagesTrend = series.map((p) => p.sent + p.failed + p.inbound)

  // ── system status ───────────────────────────────────────────────────────
  const system: SystemStatusItem[] = [
    {
      name: 'Layanan WhatsApp',
      status: gateway.online ? 'operational' : 'offline',
      detail: gateway.online
        ? `${gateway.activeSessions ?? 0} sesi aktif`
        : 'Layanan sedang tidak dapat dihubungi. Coba lagi sebentar lagi.',
    },
    {
      name: 'Penyimpanan data',
      status: dbOnline ? 'operational' : 'offline',
      detail: dbOnline ? 'Pemeriksaan berjalan normal' : 'Penyimpanan data tidak merespons',
    },
    {
      name: 'Antrean',
      status: queue.dead > 0 ? 'warning' : 'operational',
      detail:
        queue.dead > 0
          ? `${queue.dead} pekerjaan gagal setelah semua percobaan`
          : `${queue.pending} menunggu · ${queue.running} berjalan`,
    },
  ]

  return {
    totals: {
      totalSessions,
      connectedSessions,
      messagesToday,
      messagesYesterday,
      apiRequests,
      successRate,
      failedMessages,
      contacts,
      unreadNotifications,
      messagesTrend,
    },
    series,
    activity: activityRows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
    system,
    queue: { pending: queue.pending, running: queue.running, dead: queue.dead },
  }
}

/** Percentage change with a guard for a zero baseline. */
export function trend(current: number, previous: number): number | undefined {
  if (previous === 0) return current > 0 ? 100 : undefined
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export { parseJsonArray }
