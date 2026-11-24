import { db } from '@/lib/db'
import { forbidden } from '@/lib/errors'
import { logActivity, notify } from '@/lib/auth/audit'
import { isPaidSubscriptionActive } from '@/lib/services/entitlements'
import {
  LIVE_STATUSES,
  TRIAL_EXPIRED_MESSAGE,
  getTrialStatus,
  peekTrialStatus,
  stopUserSessions,
  type SubscriptionWithPlan,
  type TrialStatus,
} from '@/lib/services/trial'
import { formatDateTime } from '@/lib/utils/format'
import { DAY_MS, formatTrialCountdown, msUntil, type TrialState } from '@/lib/utils/trial'

/**
 * Bot access — "may this account run a bot at all?".
 *
 * The rule is deliberately blunt, because it is the paywall this panel is built
 * around: a bot may only be created, started, restarted, or linked with a QR or
 * pairing code while the account is *entitled* — either inside the 3-day free
 * trial, or on a paid plan that is still inside its period. Anything else (no
 * subscription at all, the legacy Rp0 `free` plan, a trial that ended, a paid
 * plan whose period closed) is locked, and the answer comes with the sentence
 * the user should read.
 *
 * Three properties matter, and all three are easy to get wrong:
 *
 *   • It is decided from the subscription row and the server clock, on every
 *     route that could put a bot online. The UI mirrors the decision so buttons
 *     are honest, but the UI is never what enforces it.
 *   • One decision function, used by the gate, by the sweeper that stops bots
 *     that are already running, and by the disconnect handler that explains why
 *     a session went down.
 *   • A bot is only ever taken down through `stopUserSessions`, the same path a
 *     trial expiry uses — one place writes `DISCONNECTED`, one place logs it.
 *
 * Operator accounts are exempt: an ADMIN who could not start a bot because their
 * own subscription lapsed would be locked out of the panel they administer.
 */

export type BotAccessReason =
  /** Inside the free trial. */
  | 'TRIAL_ACTIVE'
  /** On a paid plan that is still inside its period. */
  | 'PLAN_ACTIVE'
  /** Operator account: the paywall does not apply. */
  | 'STAFF'
  /** The 3-day trial ran out. */
  | 'TRIAL_EXPIRED'
  /** A paid plan whose period ended (or whose status is no longer active). */
  | 'PLAN_EXPIRED'
  /** No subscription, or the legacy Rp0 `free` plan — i.e. nothing to run on. */
  | 'NO_PLAN'

export interface BotAccess {
  allowed: boolean
  reason: BotAccessReason
  /** Short heading for the locked notice, in Indonesian. */
  title: string
  /** Why the bot cannot run, in Indonesian — safe to show the user verbatim. */
  message: string
  planName: string | null
  planSlug: string | null
  isTrial: boolean
  /** End of the current entitlement (trial deadline or paid period end). */
  expiresAt: Date | null
  /** Milliseconds until `expiresAt`, as the server computed them. */
  msLeft: number
  /** Whole days until `expiresAt`, rounded up. */
  daysLeft: number
  /** True only while the free trial can still be claimed. */
  trialAvailable: boolean
  trialState: TrialState
}

const NO_PLAN_TITLE = 'Belum ada paket aktif'

/** What the trial columns say about an account that has no subscription row. */
const NO_TRIAL: TrialStatus = {
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

/** Copy for a locked account, minus the parts that depend on the row. */
function noPlanMessage(trialAvailable: boolean): string {
  return trialAvailable
    ? 'Bot tidak bisa dijalankan atau ditautkan sebelum ada paket aktif. Aktifkan Free Trial 3 hari gratis, atau pilih paket berbayar.'
    : 'Bot tidak bisa dijalankan atau ditautkan karena tidak ada paket aktif di akun ini. Pilih paket berbayar untuk melanjutkan.'
}

export interface BotAccessInputs {
  role: string
  subscription: SubscriptionWithPlan | null
  /** The trial columns of that subscription, or `NO_TRIAL` when there is none. */
  trial: TrialStatus
}

/**
 * The whole rule, as a pure function of what is stored plus the clock.
 *
 * Kept free of I/O so the same verdict can be reached on a path that must not
 * write (the gateway's disconnect handler) and on one that may (the gate, which
 * applies an elapsed trial as a side effect of reading it).
 */
export function decideBotAccess(inputs: BotAccessInputs, now: number = Date.now()): BotAccess {
  const { role, subscription, trial } = inputs

  const planName = subscription?.plan.name ?? trial.planName
  const planSlug = subscription?.plan.slug ?? trial.planSlug
  const isTrial = subscription?.plan.isTrial ?? trial.isTrialPlan

  // A paid period is measured from the same column the renewal reminder reads,
  // so the badge in the panel and the warning notification cannot disagree.
  const paidMsLeft = subscription ? msUntil(subscription.currentPeriodEnd, now) : 0

  const base = {
    planName,
    planSlug,
    isTrial,
    trialAvailable: trial.available,
    trialState: trial.state,
  }

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return {
      ...base,
      allowed: true,
      reason: 'STAFF',
      title: 'Akun operator',
      message: 'Akun operator tidak dibatasi oleh paket.',
      expiresAt: trial.expiresAt,
      msLeft: trial.msLeft,
      daysLeft: trial.daysLeft,
    }
  }

  // ── entitled ────────────────────────────────────────────────────────────
  if (trial.state === 'ACTIVE') {
    return {
      ...base,
      allowed: true,
      reason: 'TRIAL_ACTIVE',
      title: 'Trial aktif',
      message: `Trial ${trial.countdown} lagi.`,
      expiresAt: trial.expiresAt,
      msLeft: trial.msLeft,
      daysLeft: trial.daysLeft,
    }
  }

  // Covers `trial.state === 'CONVERTED'` too: that state *is* an active paid
  // plan, by the same predicate the trial service uses.
  if (subscription && isPaidSubscriptionActive(subscription, now)) {
    return {
      ...base,
      allowed: true,
      reason: 'PLAN_ACTIVE',
      title: 'Paket aktif',
      message: `Paket ${subscription.plan.name} aktif sampai ${formatDateTime(subscription.currentPeriodEnd)}.`,
      expiresAt: subscription.currentPeriodEnd,
      msLeft: paidMsLeft,
      daysLeft: Math.ceil(paidMsLeft / DAY_MS),
    }
  }

  // ── locked ──────────────────────────────────────────────────────────────
  if (subscription && subscription.plan.priceMonthly > 0) {
    return {
      ...base,
      allowed: false,
      reason: 'PLAN_EXPIRED',
      title: `Paket ${subscription.plan.name} sudah berakhir`,
      message: `Masa paket ${subscription.plan.name} sudah berakhir, jadi bot dihentikan dan tidak bisa dinyalakan lagi. Perpanjang paket untuk melanjutkan.`,
      expiresAt: subscription.currentPeriodEnd,
      msLeft: 0,
      daysLeft: 0,
    }
  }

  if (subscription?.plan.isTrial && trial.state === 'EXPIRED') {
    return {
      ...base,
      allowed: false,
      reason: 'TRIAL_EXPIRED',
      title: 'Trial kamu sudah berakhir',
      message: TRIAL_EXPIRED_MESSAGE,
      expiresAt: trial.expiresAt,
      msLeft: 0,
      daysLeft: 0,
    }
  }

  // No subscription row, or the legacy Rp0 `free` plan: nothing to run on.
  return {
    ...base,
    allowed: false,
    reason: 'NO_PLAN',
    title: NO_PLAN_TITLE,
    message: noPlanMessage(trial.available),
    expiresAt: subscription?.currentPeriodEnd ?? trial.expiresAt,
    msLeft: 0,
    daysLeft: 0,
  }
}

/**
 * Load the decision inputs.
 *
 * `lazy` is the difference between reading and acting: with it, an elapsed trial
 * deadline is applied (the bot is stopped and the row closed) as part of asking
 * the question, which is what keeps a page render, an API call and the watchdog
 * from disagreeing.
 */
async function loadInputs(userId: string, lazy: boolean): Promise<BotAccessInputs> {
  const [user, subscription] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { role: true } }),
    db.subscription.findUnique({ where: { userId }, include: { plan: true } }),
  ])

  // With `lazy`, asking the question is also what applies an elapsed deadline.
  const trial = lazy
    ? await getTrialStatus(userId)
    : subscription
      ? peekTrialStatus(subscription)
      : NO_TRIAL

  return { role: user?.role ?? 'USER', subscription, trial }
}

/** Current access decision for a user. */
export async function getBotAccess(userId: string): Promise<BotAccess> {
  return decideBotAccess(await loadInputs(userId, true))
}

/**
 * Guard for anything that would put a bot online: creating a session,
 * connecting, restarting, asking for a QR, asking for a pairing code.
 */
export async function assertBotCanRun(userId: string): Promise<void> {
  const access = await getBotAccess(userId)
  if (!access.allowed) {
    throw forbidden(`${access.title}: ${access.message}`, {
      reason: access.reason,
      actionUrl: '/dashboard/billing',
    })
  }
}

/**
 * The message a disconnect should carry, when the account is not entitled.
 *
 * The engine only knows that a socket closed, so its own status text reads as if
 * a person stopped the bot — which is false when the watchdog did. The gateway
 * event handler passes its text through here so the stored explanation, the
 * session page and the notification agree with what actually happened.
 *
 * Read-only on purpose (see `peekTrialStatus`), because it runs inside the event
 * about the very session it would otherwise be stopping.
 */
export async function botStopMessageFor(userId: string): Promise<string | null> {
  const access = decideBotAccess(await loadInputs(userId, false))
  return access.allowed ? null : access.message
}

/**
 * Plain-data form of a locked decision, safe to hand to a client component.
 *
 * Dates and the subscription row stay on the server; the UI gets only the
 * sentence to show and whether the trial is still there to be claimed.
 */
export interface BotAccessNoticeData {
  reason: BotAccessReason
  title: string
  message: string
  trialAvailable: boolean
}

/** The notice to show, or null when the account may run a bot. */
export function botAccessNotice(access: BotAccess): BotAccessNoticeData | null {
  if (access.allowed) return null

  return {
    reason: access.reason,
    title: access.title,
    message: access.message,
    trialAvailable: access.trialAvailable,
  }
}

// ─────────────────────────────────────────────────── existing bots ──────────

/** How often the access watchdog runs. */
export const ACCESS_SWEEP_INTERVAL_MS = 60_000

/** Cap per sweep so a backlog cannot turn into an unbounded burst. */
export const ACCESS_SWEEP_BATCH = 50

export interface AccessSweepSummary {
  /** Distinct owners of live sessions examined. */
  owners: number
  /** Owners whose bot had to be stopped. */
  stopped: number
  /** Sessions actually taken down. */
  sessions: number
  failed: number
}

/**
 * Stop the bots of accounts that are not entitled to one.
 *
 * A paywall cannot only apply at the door: without this, an account whose plan
 * ran out would keep a working bot for as long as it avoided disconnecting, and
 * an account that never had a plan would never be affected at all. Only live
 * sessions are considered, grouped by owner so each account is judged once, and
 * the decision comes from `getBotAccess` rather than a second copy of the rules.
 *
 * Never throws: a failure is counted and retried on the next tick.
 */
export async function sweepUnentitledBots(): Promise<AccessSweepSummary> {
  const summary: AccessSweepSummary = { owners: 0, stopped: 0, sessions: 0, failed: 0 }

  let live: { userId: string }[]
  try {
    live = await db.whatsAppSession.findMany({
      where: { status: { in: [...LIVE_STATUSES] } },
      select: { userId: true },
      take: ACCESS_SWEEP_BATCH,
    })
  } catch (error) {
    console.error('[akses] gagal membaca sesi yang hidup:', error)
    summary.failed += 1
    return summary
  }

  for (const userId of [...new Set(live.map((row) => row.userId))]) {
    summary.owners += 1
    try {
      const access = await getBotAccess(userId)
      if (access.allowed) continue

      const stopped = await stopUserSessions(userId, access.message)
      if (stopped === 0) continue

      summary.stopped += 1
      summary.sessions += stopped

      await logActivity({
        userId,
        event: 'bot.blocked',
        title: 'Bot dihentikan: paket tidak aktif',
        detail: access.message,
        level: 'warning',
      })

      await notify({
        userId,
        type: 'SUBSCRIPTION_EXPIRED',
        severity: 'warning',
        title: access.title,
        message: `${access.message} Bot dihentikan otomatis.`,
        actionUrl: '/dashboard/billing',
      })

      console.info(`[akses] ${access.reason} — ${stopped} sesi dihentikan untuk pengguna ${userId}`)
    } catch (error) {
      summary.failed += 1
      console.warn(`[akses] gagal memeriksa pengguna ${userId}:`, error)
    }
  }

  return summary
}

/**
 * Run the access watchdog on an interval for the lifetime of the process.
 *
 * Detached and `unref`'d, exactly like the trial and payment sweeps: it must
 * never keep the server alive and never be able to take it down. `ACCESS_WATCH=0`
 * disables it, `ACCESS_WATCH_MS` changes the period.
 */
export function startBotAccessWatchdog(): void {
  if (process.env.ACCESS_WATCH === '0') return

  const intervalMs = Number(process.env.ACCESS_WATCH_MS) || ACCESS_SWEEP_INTERVAL_MS
  let running = false

  const tick = async () => {
    if (running) return
    running = true
    try {
      const summary = await sweepUnentitledBots()
      if (summary.stopped > 0 || summary.failed > 0) {
        console.info(
          `[akses] pemilik=${summary.owners} dihentikan=${summary.stopped} ` +
            `sesi=${summary.sessions} gagal=${summary.failed}`
        )
      }
    } catch (error) {
      console.warn('[akses] sapuan gagal:', error)
    } finally {
      running = false
    }
  }

  const timer = setInterval(() => void tick(), intervalMs)
  timer.unref?.()

  console.info(`[akses] pengawas paket aktif — setiap ${Math.round(intervalMs / 1000)}s`)

  // Sessions left over from before a restart are re-checked shortly after boot.
  const first = setTimeout(() => void tick(), 12_000)
  first.unref?.()
}
