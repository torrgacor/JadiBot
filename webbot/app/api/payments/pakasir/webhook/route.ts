import { NextResponse } from 'next/server'
import { verifyWebhookSecret } from '@/lib/services/pakasir'
import { settleOrder } from '@/lib/services/billing'
import { AppError } from '@/lib/errors'

/**
 * POST /api/payments/pakasir/webhook
 *
 * Pakasir's notification that a payment landed.
 *
 * Contract notes that shape this handler:
 *
 *   • Authentication is the `X-Secret` header, compared in constant time
 *     against PAKASIR_WEBHOOK_SECRET. Anything else is rejected — an
 *     unauthenticated request here would otherwise be able to hand out plans.
 *   • Pakasir retries until it gets a 2xx, so settlement is idempotent and this
 *     route only ever answers 500 for a *retryable* problem.
 *   • The body is not trusted for anything except the amount and the order id.
 *     Which plan to activate was decided when the invoice was written.
 *   • The amount is verified against the invoice. A mismatch is recorded on the
 *     payment row and answered with 500 so it keeps retrying and stays visible
 *     instead of silently swallowing someone's money.
 *
 * This route is deliberately outside the session/CSRF guards: the caller is a
 * machine with no cookie, and the shared secret is the proof.
 */

export const dynamic = 'force-dynamic'

/** Minimal envelope so a failure is still recognisable JSON to the caller. */
function respond(status: number, code: string, message: string) {
  return NextResponse.json(
    { success: status >= 200 && status < 300, error: status < 300 ? undefined : { code, message } },
    { status }
  )
}

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request.headers.get('x-secret'))) {
    return respond(401, 'UNAUTHORIZED', 'Secret webhook tidak valid.')
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return respond(400, 'BAD_REQUEST', 'Isi webhook bukan JSON.')
  }

  const body = (payload ?? {}) as Record<string, unknown>
  const orderId = typeof body.order_id === 'string' ? body.order_id.trim() : ''
  const txnId = typeof body.txn_id === 'string' ? body.txn_id.trim() : ''
  const status = typeof body.status === 'string' ? body.status.trim() : ''
  const amount = typeof body.amount === 'number' ? body.amount : Number.NaN
  const completedAt = typeof body.completed_at === 'string' ? body.completed_at : ''

  if (!orderId && !txnId) {
    return respond(400, 'BAD_REQUEST', 'Webhook tidak memuat order_id atau txn_id.')
  }
  if (!Number.isFinite(amount)) {
    return respond(400, 'BAD_REQUEST', 'Webhook tidak memuat nominal yang valid.')
  }

  // Anything that is not a completed payment is informational only.
  if (status !== 'completed') {
    return respond(200, 'OK', `Status "${status || 'tidak diketahui'}" diabaikan.`)
  }

  try {
    const result = await settleOrder({
      invoiceNumber: orderId || null,
      txnId: txnId || null,
      amountRupiah: amount,
      paidAt: completedAt ? new Date(completedAt) : new Date(),
      providerRef: txnId || null,
    })

    return respond(
      200,
      'OK',
      result.outcome === 'activated' ? 'Paket diaktifkan.' : 'Tagihan sudah pernah diproses.'
    )
  } catch (error) {
    // An unknown invoice is not ours (or was never written). Retrying will not
    // help, so acknowledge it and keep the trail in the log.
    if (error instanceof AppError && error.code === 'NOT_FOUND') {
      console.warn('[pakasir-webhook] tagihan tidak dikenal:', orderId || txnId)
      return respond(200, 'OK', 'Tagihan tidak dikenal, diabaikan.')
    }

    // Everything else may be transient (or needs a human): let Pakasir retry.
    console.error('[pakasir-webhook] gagal memproses pembayaran:', error)
    return respond(500, 'SETTLEMENT_FAILED', 'Pembayaran belum dapat diproses.')
  }
}
