import type { Plan, Subscription } from '@/lib/db'
import { db } from '@/lib/db'
import { logActivity, notify } from '@/lib/auth/audit'
import { isPaidSubscriptionActive } from '@/lib/services/entitlements'
import { formatDateTime } from '@/lib/utils/format'
import { RENEWAL_WINDOW_DAYS, daysLeftLabel, formatCountdown, msUntil } from '@/lib/utils/trial'

/**
 * Renewal reminders.
 *
 * A paywall that only speaks *after* the bot stops is a bad paywall: the
 * customer loses a working bot before they were ever told it was about to end.
 * This service is the other half of the access gate — it warns, through the same
 * notification and activity channels everything else uses, while there is still
 * time to pay.
 *
 * The rules, and why each one is a column rather than a guess:
 *
 *   • Only paid plans that are still running are considered. A trial has its own
 *     panel, and an account that already lapsed has nothing left to renew.
 *   • The warning goes out **once per period**. `Subscription.renewalNoticeFor`
 *     stores the period end we warned about, so no timer, no in-memory set and
 *     no "have we already emailed them?" bookkeeping is needed — and a renewal
 *     re-arms it for free, because the new period end no longer matches.
 *   • The clock is the server's. The days left shown in the panel come from the
 *     same column the sweep reads, so a browser clock cannot change either.
 *
 * Nothing here can stop or start a bot. It reports, it warns, and that is all —
 * `bot-access.ts` remains the only thing that decides whether a bot may run.
 */

export interface RenewalStatus {
  planName: string
  planSlug: string
  /** End of the paid period, as the server stored it. */
  expiresAt: Date
  /** Milliseconds left, computed server-side. */
  msLeft: number
  daysLeft: number
  /** Ready-to-render text, e.g. "12 Hari 4 Jam 9 Menit". */
  countdown: string
  /** Badge token: "12 DAYS LEFT". */
  badge: string
  /** True once the end is inside the warning window. */
  dueSoon: boolean
  /** True when the warning for this period has already gone out. */
  noticeSent: boolean
}

/** The warning window, in milliseconds — `RENEWAL_WINDOW_DAYS` overrides it. */
export function renewalWindowMs(): number {
  const configured = Number(process.env.RENEWAL_WINDOW_DAYS)
  const days = Number.isFinite(configured) && configured > 0 ? configured : RENEWAL_WINDOW_DAYS
  return Math.floor(days) * 24 * 60 * 60 * 1000
}

interface RenewalRow {
  subscription: Subscription
  plan: Plan
}

/** Is this row a paid plan that is currently running? */
function isRunning(row: RenewalRow | null, now: number): row is RenewalRow {
  if (!row) return false
  return isPaidSubscriptionActive({ ...row.subscription, plan: row.plan }, now)
}

/**
 * Renewal status for one account, or null when there is nothing to renew.
 *
 * `null` for a free account, a closed plan and for an account inside its free
 * trial — the trial panel already owns that conversation, and reporting both
 * would state the same deadline twice.
 */
export async function getRenewalStatus(
  userId: string,
  now: number = Date.now()
): Promise<RenewalStatus | null> {
  const row = await loadRow(userId)
  if (!isRunning(row, now)) return null

  const expiresAt = row.subscription.currentPeriodEnd
  const msLeft = msUntil(expiresAt, now)

  return {
    planName: row.plan.name,
    planSlug: row.plan.slug,
    expiresAt,
    msLeft,
    daysLeft: Math.ceil(msLeft / (24 * 60 * 60 * 1000)),
    countdown: formatCountdown(msLeft),
    badge: daysLeftLabel(msLeft),
    dueSoon: msLeft <= renewalWindowMs(),
    noticeSent:
      row.subscription.renewalNoticeFor?.getTime() === row.subscription.currentPeriodEnd.getTime(),
  }
}

async function loadRow(userId: string): Promise<RenewalRow | null> {
  const sub: any = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  } as any)
  if (!sub) return null
  // Normalise absent optional dates (Mongo returns undefined, Prisma null).
  for (const k of ['renewalNoticeFor', 'canceledAt']) {
    if (sub[k] === undefined) sub[k] = null
  }
  return { subscription: sub, plan: sub.plan }
}

// ───────────────────────────────────────────────────────────── sweep ────────

/** How often the renewal watchdog runs. Renewals are not urgent to the second. */
export const RENEWAL_SWEEP_INTERVAL_MS = 5 * 60_000

/** Cap per sweep so a backlog cannot turn into an unbounded burst. */
export const RENEWAL_SWEEP_BATCH = 50

export interface RenewalSweepSummary {
  examined: number
  warned: number
  failed: number
}

/**
 * Warn every paid account whose period is about to end.
 *
 * The query is deliberately narrow — running paid plan, ending inside the
 * window, and either never warned or warned about a *different* period — so the
 * common case costs one indexed read and returns nothing.
 *
 * Never throws: a failure is counted and retried on the next tick.
 */
export async function sweepRenewals(now: number = Date.now()): Promise<RenewalSweepSummary> {
  const summary: RenewalSweepSummary = { examined: 0, warned: 0, failed: 0 }

  const windowEnd = new Date(now + renewalWindowMs())

  let due: (Subscription & { plan: Plan })[]
  try {
    due = await db.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
        currentPeriodEnd: { gt: new Date(now), lte: windowEnd },
        plan: { priceMonthly: { gt: 0 }, isTrial: false },
      },
      include: { plan: true },
      take: RENEWAL_SWEEP_BATCH,
      orderBy: { currentPeriodEnd: 'asc' },
    } as Parameters<typeof db.subscription.findMany>[0])
    // Normalise absent optional dates so the sweep's `?.getTime()` is safe.
    for (const sub of due as any[]) {
      if (sub.renewalNoticeFor === undefined) sub.renewalNoticeFor = null
    }
  } catch (error) {
    console.error('[perpanjangan] gagal membaca paket yang akan berakhir:', error)
    summary.failed += 1
    return summary
  }

  for (const subscription of due) {
    // Already warned about *this* period end? Then there is nothing to do —
    // the column is compared to the deadline it warned about, not to "ever".
    if (subscription.renewalNoticeFor?.getTime() === subscription.currentPeriodEnd.getTime()) {
      continue
    }

    summary.examined += 1

    const plan = subscription.plan
    const msLeft = msUntil(subscription.currentPeriodEnd, now)
    const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000))

    try {
      /*
        Claim the period *before* notifying. `updateMany` with the previous value
        in the filter makes the write compare-and-set: if the sweep is somehow
        running twice, only the caller that actually changed the row sends the
        message, and the loser sees `count === 0` and stops.
      */
      const claimed = await db.subscription.updateMany({
        where: {
          id: subscription.id,
          currentPeriodEnd: subscription.currentPeriodEnd,
          OR: [
            { renewalNoticeFor: null },
            { renewalNoticeFor: { not: subscription.currentPeriodEnd } },
          ],
        },
        data: { renewalNoticeFor: subscription.currentPeriodEnd },
      })

      if (claimed.count === 0) continue

      await notify({
        userId: subscription.userId,
        type: 'SUBSCRIPTION_RENEWAL',
        severity: 'warning',
        title: `Paket ${plan.name} berakhir dalam ${daysLeft} hari`,
        message:
          `Masa paket ${plan.name} berakhir ${formatDateTime(subscription.currentPeriodEnd)}. ` +
          'Perpanjang sekarang agar bot tidak dihentikan otomatis.',
        actionUrl: '/dashboard/billing',
        metadata: {
          plan: plan.slug,
          periodEnd: subscription.currentPeriodEnd.toISOString(),
        },
      })

      await logActivity({
        userId: subscription.userId,
        event: 'subscription.renewal_reminder',
        title: 'Pengingat perpanjangan dikirim',
        detail: `Paket ${plan.name} berakhir dalam ${daysLeft} hari (${formatDateTime(
          subscription.currentPeriodEnd
        )})`,
        level: 'warning',
      })

      summary.warned += 1
      console.info(
        `[perpanjangan] pengingat dikirim ke ${subscription.userId} — ${plan.slug} berakhir dalam ${daysLeft} hari`
      )
    } catch (error) {
      summary.failed += 1
      console.warn(`[perpanjangan] gagal mengirim pengingat ke ${subscription.userId}:`, error)
    }
  }

  return summary
}

/**
 * Run the renewal watchdog on an interval for the lifetime of the process.
 *
 * Detached and `unref`'d like the trial, access and payment sweeps: it must
 * never keep the server alive and never be able to take it down.
 * `RENEWAL_WATCH=0` disables it, `RENEWAL_WATCH_MS` changes the period.
 */
export function startRenewalWatchdog(): void {
  if (process.env.RENEWAL_WATCH === '0') return

  const intervalMs = Number(process.env.RENEWAL_WATCH_MS) || RENEWAL_SWEEP_INTERVAL_MS

  // The window is read once per tick so changing RENEWAL_WINDOW_DAYS only needs
  // a restart, not a new build.
  const windowDays = renewalWindowMs() / (24 * 60 * 60 * 1000)

  let running = false

  const tick = async () => {
    if (running) return
    running = true
    try {
      const summary = await sweepRenewals()
      if (summary.warned > 0 || summary.failed > 0) {
        console.info(
          `[perpanjangan] diperiksa=${summary.examined} diingatkan=${summary.warned} gagal=${summary.failed}`
        )
      }
    } catch (error) {
      console.warn('[perpanjangan] sapuan gagal:', error)
    } finally {
      running = false
    }
  }

  const timer = setInterval(() => void tick(), intervalMs)
  timer.unref?.()

  console.info(
    `[perpanjangan] pengawas perpanjangan aktif — setiap ${Math.round(intervalMs / 1000)}s, ` +
      `pengingat ${windowDays} hari sebelum berakhir`
  )

  // A period that crossed into the window while the panel was down is caught
  // shortly after boot.
  const first = setTimeout(() => void tick(), 15_000)
  first.unref?.()
}
