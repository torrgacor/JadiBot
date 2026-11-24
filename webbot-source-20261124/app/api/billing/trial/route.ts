import { fail, ok } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { getTrialStatus, startTrial } from '@/lib/services/trial'

/**
 * Free trial (3 days).
 *
 *   GET  /api/billing/trial — current trial state for the signed-in account
 *   POST /api/billing/trial — activate it
 *
 * Both go through the guard in `assertTrialAllowsBot`/`startTrial`, which reads
 * and writes the trial columns on the subscription row. The client never sends a
 * date, a remaining duration or "still valid": there is nothing in the request
 * body to trust, so nothing to forge.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await requireAuth()
    return ok(await getTrialStatus(auth.user.id))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthWithCsrf(request)
    return ok(await startTrial(auth.user.id))
  } catch (error) {
    return fail(error)
  }
}
