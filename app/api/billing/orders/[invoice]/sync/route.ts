import { fail, ok } from '@/lib/api/response'
import { requireAuthWithCsrf } from '@/lib/auth/guards'
import { syncOrderStatus } from '@/lib/services/billing'
import { badRequest } from '@/lib/errors'

/**
 * POST /api/billing/orders/:invoice/sync
 *
 * Ask Pakasir what really happened to one of *our* pending invoices.
 *
 * The webhook is the fast path but it can be lost, and a customer staring at a
 * "menunggu pembayaran" badge should not have to wait for a retry. The lookup is
 * scoped to the signed-in user, so an invoice number alone cannot be used to
 * probe someone else's payments.
 */

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ invoice: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await requireAuthWithCsrf(request)
    const { invoice } = await params

    // A malformed percent-escape (?invoice=100%) throws a URIError. Decode
    // defensively so it is a clean 400, not a 500 with a stack trace.
    let invoiceNumber: string
    try {
      invoiceNumber = decodeURIComponent(invoice)
    } catch {
      throw badRequest('Nomor tagihan tidak valid.')
    }

    const result = await syncOrderStatus({
      invoiceNumber,
      userId: auth.user.id,
    })

    return ok(result)
  } catch (error) {
    return fail(error)
  }
}
