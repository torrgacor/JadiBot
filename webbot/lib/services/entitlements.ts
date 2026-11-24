import type { Plan, Subscription, User } from '@/lib/db'
import { db } from '@/lib/db'
import { quotaExceeded } from '@/lib/errors'

/**
 * Plan entitlements.
 *
 * Every quota check funnels through here so the pricing page, the API and the
 * enforcement code read from one source of truth. A user without a subscription
 * row falls back to the Free plan, so the platform is never in a limbo state
 * where an account has no limits at all.
 */

export interface Entitlements {
  plan: Plan | null
  subscription: Subscription | null
  /** -1 means unlimited. */
  limits: {
    whatsappSessions: number
    messagesPerDay: number
    apiRequestsPerDay: number
    contacts: number
    automationRules: number
    teamMembers: number
  }
}

/** Unlimited sentinel used throughout the quota code. */
export const UNLIMITED = -1

export function isUnlimited(limit: number): boolean {
  return limit === UNLIMITED
}

export function limitReached(used: number, limit: number): boolean {
  return !isUnlimited(limit) && used >= limit
}

export function quotaLabel(limit: number): string {
  return isUnlimited(limit) ? 'tanpa batas' : String(limit)
}

export async function getEntitlements(
  user: Pick<User, 'id'>
): Promise<Entitlements> {
  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: true },
  })

  // Fall back to the Free plan row when the user has no subscription yet.
  const plan =
    subscription?.plan ??
    (await db.plan.findFirst({
      where: { slug: 'free' },
    }))

  return {
    plan,
    subscription,
    limits: {
      whatsappSessions: plan?.maxWhatsappSessions ?? 1,
      messagesPerDay: plan?.maxMessagesPerDay ?? 100,
      apiRequestsPerDay: plan?.maxApiRequestsDay ?? 1000,
      contacts: plan?.maxContacts ?? 100,
      automationRules: plan?.maxAutomationRules ?? 0,
      teamMembers: plan?.maxTeamMembers ?? 1,
    },
  }
}

/**
 * Is this subscription paid-for and still inside its window?
 *
 * One predicate, three callers: the trial service (a paying customer must never
 * be handed a free trial, and a converted account must never be stopped by the
 * trial watchdog) and the bot-access gate (a paid plan is what unlocks the bot).
 * Keeping it here means "paying" cannot mean two different things.
 */
export function isPaidSubscriptionActive(
  subscription: Pick<Subscription, 'status' | 'currentPeriodEnd'> & {
    plan: Pick<Plan, 'priceMonthly'>
  },
  now: number = Date.now()
): boolean {
  return (
    !!subscription.plan &&
    subscription.plan.priceMonthly > 0 &&
    subscription.currentPeriodEnd.getTime() > now &&
    (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING')
  )
}

/**
 * Reset rolling daily counters if the window has elapsed.
 * Called before reading usage so counts are always current.
 */
export async function refreshUsageWindow(
  subscription: Subscription
): Promise<Subscription> {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  // `usageResetAt` defaults to row creation, but guard against a missing value
  // so a row that lost it (e.g. partial migration) resets rather than throws.
  if (!subscription.usageResetAt) return subscription
  if (subscription.usageResetAt.getTime() > oneDayAgo) return subscription

  const updated = await db.subscription.update({
    where: { id: subscription.id },
    data: {
      messagesUsedToday: 0,
      apiRequestsUsedDay: 0,
      usageResetAt: new Date(),
    },
  })
  if (!updated) return subscription
  return updated
}

export interface UsageSnapshot {
  messagesToday: number
  apiRequestsToday: number
  messagesLimit: number
  apiLimit: number
}

export async function getUsage(userId: string): Promise<UsageSnapshot> {
  const entitlements = await getEntitlements({ id: userId })
  let subscription = entitlements.subscription
  if (subscription) subscription = await refreshUsageWindow(subscription)

  // With a subscription row the counter is authoritative. Without one there is
  // no counter at all, so the meter is derived from the messages themselves —
  // the same thing the free-tier check in `consumeMessageQuota` does. Otherwise
  // the panel would report a permanent zero for an account that is clearly busy.
  const messagesToday = subscription
    ? subscription.messagesUsedToday
    : await db.message.count({
        where: {
          userId,
          direction: 'OUTBOUND',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })

  return {
    messagesToday,
    apiRequestsToday: subscription?.apiRequestsUsedDay ?? 0,
    messagesLimit: entitlements.limits.messagesPerDay,
    apiLimit: entitlements.limits.apiRequestsPerDay,
  }
}

// ──────────────────────────────────────────────────────── assertions ────────

interface AssertOptions {
  /** Count to compare against the limit (e.g. current session count). */
  used: number
  limit: number
  label: string
}

function assertWithinLimit({ used, limit, label }: AssertOptions) {
  if (limitReached(used, limit)) {
    throw quotaExceeded(
      `Anda telah mencapai batas ${label} untuk paket Anda (${limit}). Tingkatkan paket untuk menambah.`,
      { resource: label, used, limit }
    )
  }
}

export async function assertCanCreateSession(userId: string) {
  const { limits } = await getEntitlements({ id: userId })
  const used = await db.whatsAppSession.count({ where: { userId } })
  assertWithinLimit({ used, limit: limits.whatsappSessions, label: 'WhatsApp session' })
}

export async function assertCanCreateRule(userId: string) {
  const { limits } = await getEntitlements({ id: userId })
  const used = await db.automationRule.count({ where: { userId } })
  assertWithinLimit({ used, limit: limits.automationRules, label: 'automation rule' })
}

export async function assertCanCreateContact(userId: string, addingCount = 1) {
  const { limits } = await getEntitlements({ id: userId })
  const used = await db.contact.count({ where: { userId } })
  assertWithinLimit({
    used: used + addingCount - 1,
    limit: limits.contacts,
    label: 'contact',
  })
}

/**
 * Consume one message from the daily quota.
 *
 * This is the single choke point for outbound sends, so a campaign fan-out and
 * an interactive send are accounted identically.
 */
export async function consumeMessageQuota(userId: string, count = 1) {
  const { limits, subscription } = await getEntitlements({ id: userId })

  if (!subscription) {
    // No subscription row: enforce the free-tier limit by counting directly.
    if (!isUnlimited(limits.messagesPerDay)) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const sent = await db.message.count({
        where: { userId, direction: 'OUTBOUND', createdAt: { gte: since } },
      })
      if (sent + count > limits.messagesPerDay) {
        throw quotaExceeded(
          `Batas pesan harian tercapai (${limits.messagesPerDay}). Naikkan paket untuk mengirim lebih banyak.`,
          { limit: limits.messagesPerDay, used: sent }
        )
      }
    }
    return
  }

  const refreshed = await refreshUsageWindow(subscription)

  if (!isUnlimited(limits.messagesPerDay)) {
    if (refreshed.messagesUsedToday + count > limits.messagesPerDay) {
      throw quotaExceeded(
        `Batas pesan harian tercapai (${limits.messagesPerDay}). Naikkan paket untuk mengirim lebih banyak.`,
        { limit: limits.messagesPerDay, used: refreshed.messagesUsedToday }
      )
    }
  }

  await db.subscription.update({
    where: { id: refreshed.id },
    data: { messagesUsedToday: { increment: count } },
  })
}

/**
 * Count outbound traffic against the daily meter **without** enforcing it.
 *
 * `consumeMessageQuota` both checks and increments — it is the choke point for
 * sends the *panel* performs. Messages the bot process sends on its own socket
 * cannot be blocked after the fact, so they are recorded here instead: the meter
 * has to reflect what actually happened, even when the plan limit is spent.
 * Nothing is enforced for engine-originated traffic, and this never throws.
 */
export async function recordMessageUsage(userId: string, count = 1) {
  const { subscription } = await getEntitlements({ id: userId })
  if (!subscription) return

  const refreshed = await refreshUsageWindow(subscription)
  await db.subscription.update({
    where: { id: refreshed.id },
    data: { messagesUsedToday: { increment: count } },
  })
}

export async function consumeApiQuota(userId: string) {
  const { limits, subscription } = await getEntitlements({ id: userId })
  if (!subscription) return

  const refreshed = await refreshUsageWindow(subscription)
  if (!isUnlimited(limits.apiRequestsPerDay)) {
    if (refreshed.apiRequestsUsedDay + 1 > limits.apiRequestsPerDay) {
      throw quotaExceeded(
        `Batas permintaan API harian tercapai (${limits.apiRequestsPerDay}). Naikkan paket untuk batas lebih tinggi.`,
        { limit: limits.apiRequestsPerDay, used: refreshed.apiRequestsUsedDay }
      )
    }
  }

  await db.subscription.update({
    where: { id: refreshed.id },
    data: { apiRequestsUsedDay: { increment: 1 } },
  })
}
