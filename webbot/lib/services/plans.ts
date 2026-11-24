import { db } from '@/lib/db'

/**
 * Public plan catalogue, shaped for the storefront.
 *
 * Deliberately a plain server module rather than an export of the pricing
 * component: Next turns every export of a `'use client'` module into a *client
 * reference*, so calling such a function during server rendering throws
 * ("Attempted to call … from the server"). The pricing pages did exactly that,
 * the throw was swallowed by a `.catch(() => [])`, and the section rendered its
 * empty state on every request — which looks identical to "no plans on sale".
 */

export interface PublicPlan {
  slug: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  currency: string
  badge: string
  /** The time-boxed free tier: never sold, activated through the trial API. */
  isTrial: boolean
  features: string[]
}

/** Columns the mapper needs from a `plan` row. */
export interface PlanRow {
  slug: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  currency: string
  isTrial: boolean
  features: string
}

/**
 * Badge shown on a card.
 *
 * Keyed on the slug, because the slug already *is* the tier id
 * (`starter | pro | popular | premium | ultimate`). A plan added later with a
 * slug that is not listed here still gets a sensible badge from its name rather
 * than an empty pill.
 */
const BADGE_BY_SLUG: Record<string, string> = {
  trial: 'FREE TRIAL',
  starter: 'STARTER',
  pro: 'PRO',
  popular: 'POPULAR',
  premium: 'PREMIUM',
  ultimate: 'ULTIMATE',
}

export function toPublicPlan(plan: PlanRow): PublicPlan {
  let features: string[] = []
  try {
    const parsed = JSON.parse(plan.features)
    if (Array.isArray(parsed)) features = parsed.map(String)
  } catch {
    features = []
  }

  return {
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    currency: plan.currency,
    badge: BADGE_BY_SLUG[plan.slug] ?? plan.name.toUpperCase(),
    isTrial: plan.isTrial,
    features,
  }
}

/**
 * Read the plans the storefront is allowed to show.
 *
 * A failure is logged rather than swallowed. Returning an empty list is the
 * right thing to *render*, but doing it silently is how a broken query stayed
 * invisible: the page simply looked like a deployment with nothing to sell.
 *
 * Includes the trial plan, flagged with `isTrial`, because the storefront shows
 * it as its own card. Anything that *sells* plans must filter it out — it has no
 * price to charge.
 */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  try {
    const rows = await db.plan.findMany({
      where: { isPublic: true },
      orderBy: { sortOrder: 'asc' },
    })
    return rows.map(toPublicPlan)
  } catch (error) {
    console.error('[pricing] daftar paket gagal dibaca:', error)
    return []
  }
}
