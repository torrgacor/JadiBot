import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { badRequest, internalError, notFound } from '@/lib/errors'
import { logActivity, notify } from '@/lib/auth/audit'
import {
  createTransaction,
  getTransactionStatus,
  isPakasirConfigured,
  toRupiah,
  withRedirect,
  type PakasirMethod,
} from '@/lib/services/pakasir'

/**
 * Subscriptions and payment settlement.
 *
 * Everything that turns money into an active plan lives here so the webhook and
 * the manual status check cannot drift apart: both call `settleOrder`, which is
 * the only code allowed to mark a payment successful or move a subscription.
 *
 * Trust model — the part worth reading before changing anything:
 *
 *   • The price is read from our own `plan` row, never from the request.
 *   • Which plan a payment settles is written to the `payment` row at checkout,
 *     never taken from the webhook body.
 *   • The amount Pakasir reports is compared against the amount we invoiced;
 *     a mismatch is recorded and refused rather than quietly accepted.
 *   • Settlement is idempotent, because Pakasir retries webhooks.
 *   • A successful payment ends the free trial (`trialStatus = CONVERTED`), so
 *     the trial watchdog and the paid plan can never disagree about a bot.
 */

export const BILLING_CYCLES = ['monthly', 'yearly'] as const
export type BillingCycle = (typeof BILLING_CYCLES)[number]

const PERIOD_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  yearly: 365,
}

export function cycleLabel(cycle: string): string {
  return cycle === 'yearly' ? 'Tahunan' : 'Bulanan'
}

/** End of a period that starts at `from`. */
export function periodEndFor(cycle: string, from: Date = new Date()): Date {
  const days = PERIOD_DAYS[cycle === 'yearly' ? 'yearly' : 'monthly']
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
}

/** Price of a plan for a cycle, in the platform's minor units. */
export function priceForCycle(
  plan: { priceMonthly: number; priceYearly: number },
  cycle: BillingCycle
): number {
  return cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
}

/** `AAAA…`-style invoice number: unique, readable, and long enough for Pakasir. */
function newInvoiceNumber(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `QG-${stamp}-${randomBytes(4).toString('hex').toUpperCase()}`
}

export interface CheckoutResult {
  invoiceNumber: string
  paymentUrl: string
  amountRupiah: number
  isSandbox: boolean
}

/**
 * Create a pending invoice and the Pakasir transaction that pays it.
 *
 * Nothing here decides that money arrived — that only happens in `settleOrder`.
 */
export async function startCheckout(input: {
  userId: string
  planSlug: string
  cycle: BillingCycle
  method?: PakasirMethod
}): Promise<CheckoutResult> {
  if (!isPakasirConfigured()) {
    throw internalError(
      'Pembayaran belum dikonfigurasi. Hubungi administrator untuk mengisi kredensial Pakasir.'
    )
  }

  const plan = await db.plan.findFirst({
    where: { slug: input.planSlug, isPublic: true },
  })
  if (!plan) throw notFound('Paket itu tidak tersedia.')

  const amountMinor = priceForCycle(plan, input.cycle)
  if (amountMinor <= 0) {
    throw badRequest('Paket ini tidak bisa dibeli.')
  }
  const amountRupiah = toRupiah(amountMinor)

  const invoiceNumber = newInvoiceNumber()
  const payment = await db.payment.create({
    data: {
      userId: input.userId,
      invoiceNumber,
      amount: amountMinor,
      currency: 'IDR',
      status: 'PENDING',
      method: 'pakasir',
      description: `Paket ${plan.name} — ${cycleLabel(input.cycle)}`,
      planId: plan.id,
      cycle: input.cycle,
    },
  })

  let created
  try {
    created = await createTransaction({
      orderId: invoiceNumber,
      amountRupiah,
      method: input.method ?? 'payment_link',
    })
  } catch (error) {
    // The invoice exists but was never payable — say so on the row rather than
    // leaving a PENDING payment that can never settle.
    await db.payment
      .update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: error instanceof Error ? error.message.slice(0, 400) : 'Gagal membuat transaksi.',
        },
      })
      .catch(() => undefined)
    throw error
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { providerRef: created.txnId },
  })

  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
  const paymentUrl = created.paymentLink
    ? withRedirect(created.paymentLink, `${origin}/dashboard/billing?order=${invoiceNumber}`)
    : `${process.env.PAKASIR_BASE_URL ?? 'https://app.pakasir.com'}/pay-v2/${created.txnId}`

  return {
    invoiceNumber,
    paymentUrl,
    amountRupiah,
    isSandbox: created.isSandbox,
  }
}

export type SettlementOutcome = 'activated' | 'already-settled' | 'not-payable'

export interface SettlementResult {
  outcome: SettlementOutcome
  invoiceNumber: string
  userId: string | null
}

/**
 * Apply a completed payment.
 *
 * Called from the Pakasir webhook and from the manual status check. Idempotent:
 * a repeated notification for an already-settled invoice changes nothing and
 * does not extend the period twice.
 */
export async function settleOrder(input: {
  invoiceNumber?: string | null
  txnId?: string | null
  /** Amount Pakasir reports, in plain rupiah. */
  amountRupiah: number
  paidAt?: Date | null
  providerRef?: string | null
}): Promise<SettlementResult> {
  const where = input.invoiceNumber
    ? { invoiceNumber: input.invoiceNumber }
    : input.txnId
      ? { providerRef: input.txnId }
      : null

  if (!where) throw badRequest('Webhook tidak memuat order_id atau txn_id.')

  const payment = await db.payment.findFirst({ where })
  if (!payment) {
    throw notFound(`Tagihan ${input.invoiceNumber ?? input.txnId} tidak dikenal.`)
  }

  if (payment.status === 'SUCCESS') {
    return { outcome: 'already-settled', invoiceNumber: payment.invoiceNumber, userId: payment.userId }
  }

  // The amount is the one thing that must match: everything else about the
  // payment was decided on our side when the invoice was written.
  const expected = toRupiah(payment.amount)
  if (expected !== input.amountRupiah) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        failureReason: `Nominal tidak cocok: tagihan Rp${expected}, dibayar Rp${input.amountRupiah}.`,
      },
    })
    throw badRequest(
      `Nominal pembayaran tidak cocok dengan tagihan (tagihan Rp${expected}, diterima Rp${input.amountRupiah}).`
    )
  }

  if (!payment.planId) {
    // Should not happen for invoices created here; refuse rather than guess.
    await db.payment.update({
      where: { id: payment.id },
      data: { failureReason: 'Tagihan tidak menyebutkan paket.' },
    })
    throw badRequest('Tagihan ini tidak menyebutkan paket yang dibeli.')
  }

  const plan = await db.plan.findUnique({ where: { id: payment.planId } })
  if (!plan) throw notFound('Paket pada tagihan ini sudah tidak ada.')

  const paidAt = input.paidAt ?? new Date()
  const cycle: BillingCycle = payment.cycle === 'yearly' ? 'yearly' : 'monthly'

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: 'SUCCESS',
      paidAt,
      failureReason: null,
      ...(input.providerRef ? { providerRef: input.providerRef } : {}),
    },
  })

  const existing = await db.subscription.findUnique({
    where: { userId: payment.userId },
    include: { plan: true },
  })

  /*
   * Renewing the *same* paid plan extends the current period, so a customer who
   * pays early is not punished for it. Switching plans starts a fresh period
   * immediately — the remaining time on the old plan is not credited, because
   * this platform has no proration and inventing one silently would be worse
   * than a plain rule.
   */
  const now = new Date()
  const continuing =
    Boolean(existing) &&
    existing!.planId === plan.id &&
    existing!.plan.priceMonthly > 0 &&
    existing!.currentPeriodEnd > now
  const periodStart = continuing ? existing!.currentPeriodEnd : now

  await db.subscription.upsert({
    where: { userId: payment.userId },
    create: {
      userId: payment.userId,
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEndFor(cycle, now),
      cancelAtPeriodEnd: false,
      usageResetAt: now,
    },
    update: {
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEndFor(cycle, periodStart),
      cancelAtPeriodEnd: false,
      canceledAt: null,
      // A new period starts a new allowance.
      messagesUsedToday: 0,
      apiRequestsUsedDay: 0,
      usageResetAt: now,
      // A renewal clears the reminder bookkeeping: the new period end will be
      // past the warning window, so the notice is due again when it comes near.
      renewalNoticeFor: null,
      // Paying closes any free-trial bookkeeping, so the trial watchdog can
      // never stop a bot the customer is now paying for. Only touched for
      // accounts that actually had a trial — the value stays the `NONE` default
      // for everyone else.
      ...(existing?.trialUsed ? { trialStatus: 'CONVERTED' } : {}),
    },
  })

  await db.payment.update({
    where: { id: payment.id },
    data: { subscriptionId: (await db.subscription.findUnique({ where: { userId: payment.userId } }))?.id ?? null },
  })

  await logActivity({
    userId: payment.userId,
    event: 'payment.success',
    title: `Pembayaran ${payment.invoiceNumber} berhasil`,
    detail: `Paket ${plan.name} — ${cycleLabel(cycle)}`,
    level: 'success',
  })

  await notify({
    userId: payment.userId,
    type: 'PAYMENT_SUCCESS',
    severity: 'success',
    title: `Paket ${plan.name} aktif`,
    message: `Pembayaran ${payment.invoiceNumber} sebesar Rp${input.amountRupiah.toLocaleString('id-ID')} diterima. Paket aktif sampai ${periodEndFor(cycle, periodStart).toLocaleDateString('id-ID')}.`,
    actionUrl: '/dashboard/billing',
  })

  return { outcome: 'activated', invoiceNumber: payment.invoiceNumber, userId: payment.userId }
}

/**
 * Ask Pakasir what really happened to a pending invoice.
 *
 * Used by the billing page, because a webhook can be lost and the customer
 * should not have to wait for a retry to see their plan.
 */
export async function syncOrderStatus(input: {
  invoiceNumber: string
  userId: string
}): Promise<{ payment: { status: string; amount: number; cycle: string; providerRef: string | null } }> {
  const payment = await db.payment.findFirst({
    where: { invoiceNumber: input.invoiceNumber, userId: input.userId },
  })
  if (!payment) throw notFound('Tagihan itu tidak ditemukan.')

  if (payment.status !== 'SUCCESS' && payment.providerRef) {
    const remote = await getTransactionStatus(payment.providerRef)

    if (remote.status === 'completed') {
      await settleOrder({
        invoiceNumber: payment.invoiceNumber,
        amountRupiah: remote.amount,
        paidAt: remote.completedAt ? new Date(remote.completedAt) : new Date(),
        providerRef: remote.txnId,
      })
    } else if (remote.status === 'canceled') {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: 'Transaksi dibatalkan atau kedaluwarsa.' },
      })
    }
  }

  const fresh = await db.payment.findUniqueOrThrow({ where: { id: payment.id } })
  return {
    payment: {
      status: fresh.status,
      amount: fresh.amount,
      cycle: fresh.cycle,
      providerRef: fresh.providerRef ?? null,
    },
  }
}
