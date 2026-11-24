import type { Plan, Subscription } from '@/lib/db'
import { db } from '@/lib/db'
import { engineClient } from '@/lib/engine/client'
import { conflict, internalError } from '@/lib/errors'
import { logActivity, notify } from '@/lib/auth/audit'
import { isPaidSubscriptionActive } from '@/lib/services/entitlements'
import { formatDateTime } from '@/lib/utils/format'
import {
  DAY_MS,
  TRIAL_DAYS,
  TRIAL_DURATION_MS,
  TRIAL_PLAN_SLUG,
  formatTrialCountdown,
  trialRemaining,
  type TrialState,
  type TrialStatusJson,
} from '@/lib/utils/trial'

/**
 * Free trial (3 days, once per account).
 *
 * The rules that matter, and where each one is enforced:
 *
 *   • One trial per account, ever. `subscription.trialUsed` is written on
 *     activation and never cleared, so it survives signing out, signing in,
 *     clearing cookies and even a password reset — there is nothing on the
 *     client to reset.
 *   • The deadline is a database column. Everything that reads a trial state
 *     compares `trialExpiresAt` against the *server* clock; the countdown in the
 *     browser is presentation only and cannot extend anything.
 *   • Expiry is applied by whoever notices first — a dashboard render, the API,
 *     a bot-start attempt, or the background sweep — and is idempotent, so the
 *     stop-the-bot side effect happens exactly once.
 *   • A conversion to a paid plan closes the trial bookkeeping
 *     (`CONVERTED`), which is what stops the sweeper from ever stopping a bot
 *     the customer is paying for.
 */

/** Message shown wherever a trial user is told their bot was stopped. */
export const TRIAL_EXPIRED_MESSAGE =
  'Masa trial 3 hari berakhir. Pilih paket berbayar untuk menyalakan bot lagi.'

/**
 * Statuses that mean a process or socket may still be alive.
 *
 * `LOGGED_OUT` and `BANNED` are excluded because they are already down and need
 * a human, and `DISCONNECTED` is excluded so an expired session is stopped once
 * rather than re-stopped on every sweep.
 */
export const LIVE_STATUSES = [
  'CREATED',
  'CONNECTING',
  'QR_REQUIRED',
  'PAIRING_REQUIRED',
  'CONNECTED',
  'RECONNECTING',
] as const

/** Server-side trial status: the wire shape, with real dates. */
export interface TrialStatus
  extends Omit<TrialStatusJson, 'startedAt' | 'expiresAt'> {
  startedAt: Date | null
  expiresAt: Date | null
}

export type SubscriptionWithPlan = Subscription & { plan: Plan }

function emptyStatus(): TrialStatus {
  return {
    state: 'NONE',
    available: true,
    used: false,
    startedAt: null,
    expiresAt: null,
    msLeft: 0,
    daysLeft: 0,
    countdown: formatTrialCountdown(0),
    planName: null,
    planSlug: null,
    isTrialPlan: false,
  }
}

/**
 * Is this account paying right now?
 *
 * Both the trial offer and the activation path need the same answer: a trial
 * would *downgrade* a paying customer for three days, so `startTrial` refuses
 * one, and the panel must not offer what the server would refuse.
 */
function onActivePaidPlan(subscription: SubscriptionWithPlan, now: number): boolean {
  return isPaidSubscriptionActive(subscription, now)
}

/**
 * Decide which lifecycle state a subscription row represents, from its own
 * columns plus the clock. No writes, so it is safe to call from anywhere.
 */
function deriveState(subscription: SubscriptionWithPlan, now: number): TrialState {
  // Paying closes the trial conversation entirely, whether or not the free days
  // were ever used — there is nothing to sell here and nothing to give away.
  if (onActivePaidPlan(subscription, now)) return 'CONVERTED'

  if (!subscription.trialUsed) return 'NONE'
  if (subscription.trialStatus === 'CONVERTED') return 'CONVERTED'

  const expiresAt = subscription.trialExpiresAt?.getTime() ?? 0
  const running = subscription.trialStatus === 'ACTIVE' && expiresAt > now

  // A row that still points at the trial plan is the trial. One that does not,
  // and was never marked converted, is a trial whose account moved on some other
  // way — treat the elapsed trial as finished rather than inventing time left.
  return running ? 'ACTIVE' : 'EXPIRED'
}

function toStatus(subscription: SubscriptionWithPlan, now: number): TrialStatus {
  const state = deriveState(subscription, now)
  const trialExpiresAt = subscription.trialExpiresAt
  const expiresAt = trialExpiresAt
  const msLeft = state === 'ACTIVE' && expiresAt ? Math.max(0, expiresAt.getTime() - now) : 0
  const remaining = trialRemaining(msLeft)

  return {
    state,
    available: state === 'NONE',
    used: subscription.trialUsed,
    startedAt: subscription.trialStartedAt ?? null,
    expiresAt: trialExpiresAt ?? null,
    msLeft,
    daysLeft: remaining.daysLeft,
    countdown: formatTrialCountdown(msLeft),
    planName: subscription.plan?.name ?? 'Unknown',
    planSlug: subscription.plan?.slug ?? 'unknown',
    isTrialPlan: subscription.plan?.isTrial ?? false,
  }
}

async function loadSubscription(userId: string): Promise<SubscriptionWithPlan | null> {
  const sub: any = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  } as any)
  if (!sub) return null
  // Prisma returned `null` for absent optional dates; the Mongo adapter returns
  // `undefined` (the key is absent). Normalise to null so `?.getTime()` calls in
  // the trial/renewal logic never throw.
  for (const k of ['trialExpiresAt', 'trialStartedAt', 'renewalNoticeFor', 'canceledAt']) {
    if (sub[k] === undefined) sub[k] = null
  }
  return sub
}

/**
 * Current trial state for a user.
 *
 * When the deadline has passed but nothing has swept yet, the state is applied
 * and persisted here before answering — so the page render, the API response and
 * the bot-start guard all agree, and the bot is stopped by whichever of them
 * happens first rather than waiting up to a minute for the sweep.
 */
export async function getTrialStatus(userId: string): Promise<TrialStatus> {
  const subscription = await loadSubscription(userId)
  if (!subscription) return emptyStatus()

  const now = Date.now()
  const state = deriveState(subscription, now)

  if (state === 'EXPIRED' && subscription.trialStatus === 'ACTIVE') {
    await applyTrialExpiry(subscription, 'Trial berakhir saat diperiksa')
    return toStatus({ ...subscription, trialStatus: 'EXPIRED' }, now)
  }

  return toStatus(subscription, now)
}

/**
 * Whether the account can still claim its free trial — a read-only check, used
 * by the public pricing page where no state change is expected from a visitor.
 */
export async function getTrialAvailability(
  userId: string | null
): Promise<{ available: boolean; state: TrialState }> {
  // A visitor has nothing spent yet; they can register and activate afterwards.
  if (!userId) return { available: true, state: 'NONE' }

  const subscription = await loadSubscription(userId)
  if (!subscription) return { available: true, state: 'NONE' }

  const state = deriveState(subscription, Date.now())
  return { available: state === 'NONE', state }
}

/**
 * Activate the free trial.
 *
 * Refuses once it has been used, and refuses for an account that already pays —
 * handing a paid customer a trial would quietly *downgrade* them for three days.
 */
export async function startTrial(userId: string): Promise<TrialStatus> {
  const plan = await db.plan.findUnique({ where: { slug: TRIAL_PLAN_SLUG } })
  if (!plan || !plan.isTrial) {
    throw internalError(
      'Paket Free Trial belum ada di katalog. Jalankan penyemaian katalog paket lebih dulu.'
    )
  }

  const existing = await loadSubscription(userId)
  const now = Date.now()

  if (existing?.trialUsed) {
    const status = toStatus(existing, now)
    if (status.state === 'ACTIVE') {
      throw conflict(
        `Trial Anda masih berjalan sampai ${formatDateTime(status.expiresAt)}${
          status.countdown ? ` (${status.countdown} lagi)` : ''
        }.`
      )
    }
    throw conflict(
      'Trial gratis hanya bisa diaktifkan sekali per akun. Pilih paket berbayar untuk melanjutkan.'
    )
  }

  if (existing && onActivePaidPlan(existing, now)) {
    throw conflict(
      `Akun ini sudah punya paket ${existing.plan.name} yang aktif, jadi trial tidak diperlukan.`
    )
  }

  const startedAt = new Date(now)
  const expiresAt = new Date(now + TRIAL_DURATION_MS)

  const subscription = await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: 'TRIALING',
      currentPeriodStart: startedAt,
      currentPeriodEnd: expiresAt,
      trialStartedAt: startedAt,
      trialExpiresAt: expiresAt,
      trialStatus: 'ACTIVE',
      trialUsed: true,
      usageResetAt: startedAt,
    },
    update: {
      planId: plan.id,
      status: 'TRIALING',
      currentPeriodStart: startedAt,
      currentPeriodEnd: expiresAt,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      trialStartedAt: startedAt,
      trialExpiresAt: expiresAt,
      trialStatus: 'ACTIVE',
      trialUsed: true,
      // A new allowance starts with the trial.
      messagesUsedToday: 0,
      apiRequestsUsedDay: 0,
      usageResetAt: startedAt,
    },
    include: { plan: true },
  })

  await logActivity({
    userId,
    event: 'trial.started',
    title: 'Trial gratis diaktifkan',
    detail: `${TRIAL_DAYS} hari, berakhir ${formatDateTime(expiresAt)}`,
    level: 'success',
  })

  await notify({
    userId,
    type: 'SYSTEM',
    severity: 'success',
    title: `Trial ${TRIAL_DAYS} hari aktif`,
    message: `Bot bisa dipakai normal sampai ${formatDateTime(expiresAt)}. Setelah itu bot dihentikan otomatis sampai Anda memilih paket berbayar.`,
    actionUrl: '/dashboard/billing',
  })

  return toStatus(subscription!, now)
}

/**
 * Apply the expiry of one trial: flip the row and stop the account's bot.
 *
 * Guarded on `trialStatus = ACTIVE` so two callers racing (a page render and the
 * sweep) cannot both run the stop-everything side effect.
 */
async function applyTrialExpiry(
  subscription: SubscriptionWithPlan,
  reason: string
): Promise<boolean> {
  const updated = await db.subscription.updateMany({
    where: { id: subscription.id, trialStatus: 'ACTIVE' },
    data: { trialStatus: 'EXPIRED', status: 'EXPIRED' },
  })
  if (updated.count === 0) return false

  const stopped = await stopUserSessions(subscription.userId)

  await logActivity({
    userId: subscription.userId,
    event: 'trial.expired',
    title: 'Trial gratis berakhir',
    detail:
      stopped > 0
        ? `Trial ${TRIAL_DAYS} hari berakhir; ${stopped} sesi dihentikan`
        : `Trial ${TRIAL_DAYS} hari berakhir`,
    level: 'warning',
  })

  await notify({
    userId: subscription.userId,
    type: 'SUBSCRIPTION_EXPIRED',
    severity: 'warning',
    title: 'Trial kamu sudah berakhir',
    message: `Masa trial ${TRIAL_DAYS} hari sudah selesai dan bot dihentikan. Pilih paket berbayar untuk menyalakannya lagi.`,
    actionUrl: '/dashboard/billing',
  })

  console.info(`[trial] ${reason} — ${stopped} sesi dihentikan untuk pengguna ${subscription.userId}`)

  return true
}

/**
 * Stop every live session of a user.
 *
 * The engine call is best-effort and the database row is updated either way: if
 * the gateway is unreachable the session must still be recorded as stopped, and
 * the background sweep re-checks live rows until the engine agrees.
 */
export async function stopUserSessions(userId: string, message = TRIAL_EXPIRED_MESSAGE): Promise<number> {
  const sessions = await db.whatsAppSession.findMany({
    where: { userId, status: { in: [...LIVE_STATUSES] } },
    select: { id: true, name: true },
  })

  for (const session of sessions) {
    try {
      await engineClient.disconnect(session.id)
    } catch (error) {
      // Gateway down or the session is unknown there — the row is still
      // stopped below, and the sweep will retry while a socket is alive.
      console.warn(`[trial] gagal menghentikan sesi ${session.id} di engine:`, error)
    }

    await db.whatsAppSession.update({
      where: { id: session.id },
      data: {
        status: 'DISCONNECTED',
        statusMessage: message,
        connectedSince: null,
        lastDisconnectedAt: new Date(),
      },
    })

    await logActivity({
      userId,
      sessionId: session.id,
      event: 'session.stopped',
      title: 'Bot dihentikan',
      detail: message,
      level: 'warning',
    })
  }

  return sessions.length
}

// ──────────────────────────────────────────────────────── enforcement ───────

/**
 * Read-only trial status for a subscription row already in hand.
 *
 * `getTrialStatus` cannot be used from the gateway's disconnect handler: it
 * *applies* an elapsed deadline, and stopping a session from inside an event
 * about that very session would be circular. This answers the same question
 * without writing anything — the clock is the only input it adds.
 */
export function peekTrialStatus(
  subscription: SubscriptionWithPlan,
  now: number = Date.now()
): TrialStatus {
  return toStatus(subscription, now)
}

// ───────────────────────────────────────────────────────────── sweep ────────

/** How often the trial watchdog runs. */
export const TRIAL_SWEEP_INTERVAL_MS = 60_000

/** Cap per sweep so a backlog cannot turn into an unbounded burst. */
export const TRIAL_SWEEP_BATCH = 50

export interface TrialSweepSummary {
  examined: number
  expired: number
  converted: number
  /** Users whose bot was still live and had to be stopped. */
  stopped: number
  failed: number
}

/**
 * One pass of the trial watchdog.
 *
 * Two jobs, in order:
 *
 *  1. Close trials whose deadline has passed (persist `EXPIRED`, stop the bot).
 *  2. Re-stop any session belonging to an already-expired trial that is somehow
 *     live again — which is what happens when the gateway was down at the moment
 *     the trial ended and its socket outlived our best-effort stop.
 *
 * Never throws: a failure is counted and retried next minute.
 */
export async function sweepExpiredTrials(): Promise<TrialSweepSummary> {
  const summary: TrialSweepSummary = {
    examined: 0,
    expired: 0,
    converted: 0,
    stopped: 0,
    failed: 0,
  }

  const now = new Date()

  let due: SubscriptionWithPlan[]
  try {
    due = await db.subscription.findMany({
      where: { trialStatus: 'ACTIVE', trialExpiresAt: { lte: now } },
      include: { plan: true },
      take: TRIAL_SWEEP_BATCH,
    } as Parameters<typeof db.subscription.findMany>[0])
    for (const sub of due as any[]) {
      if (sub.trialExpiresAt === undefined) sub.trialExpiresAt = null
      if (sub.trialStartedAt === undefined) sub.trialStartedAt = null
    }
  } catch (error) {
    console.error('[trial] gagal membaca trial yang jatuh tempo:', error)
    return summary
  }

  for (const subscription of due) {
    summary.examined += 1
    try {
      if (!subscription.plan.isTrial) {
        // The account moved to a paid plan on its own: the trial is over but the
        // customer is not, so close the bookkeeping without touching the bot.
        await db.subscription.update({
          where: { id: subscription.id },
          data: { trialStatus: 'CONVERTED' },
        })
        summary.converted += 1
        continue
      }

      const applied = await applyTrialExpiry(subscription, 'Sapuan latar')
      if (applied) summary.expired += 1
    } catch (error) {
      summary.failed += 1
      console.warn(`[trial] gagal menutup trial ${subscription.id}:`, error)
    }
  }

  // Job 2: an expired trial must not have anything running.
  try {
    const resurrected = await db.whatsAppSession.findMany({
      where: {
        status: { in: [...LIVE_STATUSES] },
        user: { is: { subscription: { is: { trialStatus: 'EXPIRED' } } } },
      },
      select: { userId: true },
      take: TRIAL_SWEEP_BATCH,
    })

    const owners = [...new Set(resurrected.map((session) => session.userId))]
    for (const userId of owners) {
      summary.stopped += await stopUserSessions(userId)
    }
  } catch (error) {
    summary.failed += 1
    console.warn('[trial] gagal memeriksa sesi yang masih hidup:', error)
  }

  return summary
}

/**
 * Run the watchdog on an interval for the lifetime of the process.
 *
 * Detached and `unref`'d like the payment reconciler: it must never keep the
 * server alive, and it must never be able to take it down. `TRIAL_WATCH=0`
 * disables it.
 */
export function startTrialSweeper(): void {
  if (process.env.TRIAL_WATCH === '0') return

  const intervalMs = Number(process.env.TRIAL_WATCH_MS) || TRIAL_SWEEP_INTERVAL_MS
  let running = false

  const tick = async () => {
    if (running) return
    running = true
    try {
      const summary = await sweepExpiredTrials()
      if (summary.expired > 0 || summary.stopped > 0 || summary.failed > 0) {
        console.info(
          `[trial] diperiksa=${summary.examined} berakhir=${summary.expired} ` +
            `dikonversi=${summary.converted} sesi-dihentikan=${summary.stopped} gagal=${summary.failed}`
        )
      }
    } catch (error) {
      console.warn('[trial] sapuan gagal:', error)
    } finally {
      running = false
    }
  }

  const timer = setInterval(() => void tick(), intervalMs)
  timer.unref?.()

  console.info(
    `[trial] pengawas trial aktif — setiap ${Math.round(intervalMs / 1000)}s ` +
      `(trial ${TRIAL_DAYS} hari = ${Math.round(TRIAL_DURATION_MS / DAY_MS)}×24 jam).`
  )

  // A trial that ran out while the panel was down is applied shortly after boot.
  const first = setTimeout(() => void tick(), 10_000)
  first.unref?.()
}
