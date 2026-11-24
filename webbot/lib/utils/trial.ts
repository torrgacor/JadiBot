/**
 * Free-trial arithmetic, shared by the server and the browser.
 *
 * Deliberately free of any database or `next/*` import. The same numbers decide
 * two things — when the server considers a trial over, and what the countdown in
 * the panel says — and a helper the browser could not import would immediately
 * be duplicated and drift. Everything here is pure arithmetic on a millisecond
 * remainder, so there is exactly one definition of "3 hari".
 */

/** Slug of the time-boxed free tier in the `plan` table. */
export const TRIAL_PLAN_SLUG = 'trial'

/** Length of the free trial. */
export const TRIAL_DAYS = 1

export const SECOND_MS = 1_000
export const MINUTE_MS = 60 * SECOND_MS
export const HOUR_MS = 60 * MINUTE_MS
export const DAY_MS = 24 * HOUR_MS

export const TRIAL_DURATION_MS = TRIAL_DAYS * DAY_MS

/**
 * How long before a paid period ends the customer gets warned.
 *
 * Three days is the same window the free trial lasts, which is not a
 * coincidence: it is long enough for a bank transfer or a QRIS payment to clear
 * before the bot would be stopped, and short enough that the notice still feels
 * like it is about something imminent.
 *
 * Overridable so an installation with a different payment rhythm does not have
 * to be patched (`RENEWAL_WINDOW_DAYS`).
 */
export const RENEWAL_WINDOW_DAYS = 3

/** Whole milliseconds left until a deadline; 0 when it has passed or is unset. */
export function msUntil(deadline: Date | string | null | undefined, now = Date.now()): number {
  if (!deadline) return 0
  const at = deadline instanceof Date ? deadline.getTime() : new Date(deadline).getTime()
  if (Number.isNaN(at)) return 0
  return Math.max(0, at - now)
}

export function renewalWindowMs(days = RENEWAL_WINDOW_DAYS): number {
  return Math.max(1, Math.floor(days)) * DAY_MS
}

/**
 * Lifecycle of the single free trial an account gets.
 *
 *   NONE      — never activated, still available
 *   ACTIVE    — running, the bot may be used
 *   EXPIRED   — the 3 days elapsed (or it was never converted); not restartable
 *   CONVERTED — the account now pays, so the trial bookkeeping is closed
 */
export const TRIAL_STATES = ['NONE', 'ACTIVE', 'EXPIRED', 'CONVERTED'] as const
export type TrialState = (typeof TRIAL_STATES)[number]

export const TRIAL_STATE_LABELS: Record<TrialState, string> = {
  NONE: 'Belum diaktifkan',
  ACTIVE: 'Trial aktif',
  EXPIRED: 'Trial berakhir',
  CONVERTED: 'Paket berbayar',
}

/**
 * Trial status as it travels over JSON, i.e. with dates as ISO strings.
 *
 * Shared so the client can type what the API returns without importing the
 * server service — and so the two shapes cannot drift apart.
 */
export interface TrialStatusJson {
  state: TrialState
  /** True while the single free trial is still unspent. */
  available: boolean
  used: boolean
  startedAt: string | null
  expiresAt: string | null
  /** Milliseconds until the deadline; 0 when the trial is not running. */
  msLeft: number
  daysLeft: number
  /** Ready-to-render text, e.g. "2 Hari 23 Jam 59 Menit". */
  countdown: string
  planName: string | null
  planSlug: string | null
  isTrialPlan: boolean
}

export interface TrialRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  /**
   * Whole days until the deadline, rounded up: with 2 days and 23 hours left the
   * panel reads "3 DAYS LEFT", which is what a person means by three days.
   */
  daysLeft: number
}

/** Break a millisecond remainder into the parts a countdown displays. */
export function trialRemaining(msLeft: number): TrialRemaining {
  const safe = Math.max(0, msLeft)
  const totalSeconds = Math.floor(safe / SECOND_MS)

  return {
    days: Math.floor(totalSeconds / (DAY_MS / SECOND_MS)),
    hours: Math.floor((totalSeconds % (DAY_MS / SECOND_MS)) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    daysLeft: Math.max(0, Math.ceil(safe / DAY_MS)),
  }
}

/**
 * Human countdown, e.g. "2 Hari 23 Jam 59 Menit".
 *
 * Trailing units are dropped as the deadline gets closer so the text never
 * claims a precision it does not have — the seconds only appear in the last
 * minute, where they are the only interesting part.
 */
export function formatTrialCountdown(msLeft: number): string {
  if (msLeft <= 0) return '0 Menit'

  const { days, hours, minutes, seconds } = trialRemaining(msLeft)

  if (days > 0) return `${days} Hari ${hours} Jam ${minutes} Menit`
  if (hours > 0) return `${hours} Jam ${minutes} Menit`
  if (minutes > 0) return `${minutes} Menit ${seconds} Detik`
  return `${seconds} Detik`
}

/** Badge token shown next to any deadline: "3 DAYS LEFT", "EXPIRED". */
export function daysLeftLabel(msLeft: number): string {
  if (msLeft <= 0) return 'EXPIRED'
  const { daysLeft } = trialRemaining(msLeft)
  return daysLeft === 1 ? '1 DAY LEFT' : `${daysLeft} DAYS LEFT`
}

/** Same badge, named for the trial call site that reads best with it. */
export function trialDaysLeftLabel(msLeft: number): string {
  return daysLeftLabel(msLeft)
}

/**
 * The trial helpers are pure arithmetic on a millisecond remainder, so a paid
 * period reuses them instead of growing a second, drifting copy. These aliases
 * exist so the renewal code reads in its own terms while the maths stays in one
 * place.
 */
export const formatCountdown = formatTrialCountdown
export const periodRemaining = trialRemaining

