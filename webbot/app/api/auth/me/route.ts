import { fail, ok } from '@/lib/api/response'
import { getAuthContext, toSessionUser } from '@/lib/auth/session'
import { getEntitlements, getUsage } from '@/lib/services/entitlements'

/**
 * GET /api/auth/me
 *
 * Session bootstrap for the client: the signed-in user, their plan
 * entitlements and current usage counters in one round trip.
 */
export async function GET() {
  try {
    const context = await getAuthContext()

    if (!context) {
      return ok({ authenticated: false })
    }

    const [entitlements, usage] = await Promise.all([
      getEntitlements(context.user),
      getUsage(context.user.id),
    ])

    return ok({
      authenticated: true,
      user: toSessionUser(context.user),
      plan: entitlements.plan
        ? {
            slug: entitlements.plan.slug,
            name: entitlements.plan.name,
            status: entitlements.subscription?.status ?? 'ACTIVE',
          }
        : null,
      limits: entitlements.limits,
      usage,
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
