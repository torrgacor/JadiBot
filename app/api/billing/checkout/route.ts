import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuthWithCsrf } from '@/lib/auth/guards'
import { BILLING_CYCLES, startCheckout } from '@/lib/services/billing'

/**
 * POST /api/billing/checkout
 *
 * Start buying a plan: writes a pending invoice and returns the Pakasir payment
 * link to send the customer to.
 *
 * The plan and the price are resolved server-side from the slug — the request
 * carries no amount, so a tampered client cannot buy a Rp25.000 plan for Rp500.
 * This never marks anything paid; only the webhook (or a status check) does that.
 */

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  planSlug: z.string().trim().min(1, 'Pilih paket terlebih dahulu.').max(64),
  cycle: z.enum(BILLING_CYCLES).default('monthly'),
})

export async function POST(request: Request) {
  try {
    const auth = await requireAuthWithCsrf(request)
    const input = await parseBody(request, bodySchema)

    const result = await startCheckout({
      userId: auth.user.id,
      planSlug: input.planSlug,
      cycle: input.cycle,
    })

    return ok(result)
  } catch (error) {
    return fail(error)
  }
}
