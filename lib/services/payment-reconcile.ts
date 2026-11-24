import { db } from '@/lib/db'
import { AppError } from '@/lib/errors'
import { getTransactionStatus, isPakasirConfigured } from '@/lib/services/pakasir'
import { settleOrder } from '@/lib/services/billing'

/**
 * Payment reconciliation sweep.
 *
 * Why this exists: the Pakasir webhook is the *fast* path, not the only one.
 * A webhook can be lost, and in this deployment it may never arrive at all —
 * the notification host is not necessarily this panel. Relying on the push
 * alone would mean money can be received while the plan stays inactive, which
 * is the worst possible failure for a checkout.
 *
 * So the authoritative check is the pull: ask Pakasir what really happened to
 * every invoice we are still waiting on, and settle the ones that are paid.
 *
 * Two rules keep that safe:
 *
 *   • It only ever touches payments that are PENDING and already carry a
 *     `providerRef`. A SUCCESS row is never re-examined, so a sweep can never
 *     double-extend a subscription — `settleOrder` is idempotent regardless.
 *   • A freshly created invoice is skipped for a grace period. Pakasir needs a
 *     moment before a just-created transaction is queryable, and hammering its
 *     status endpoint for an invoice the user is literally looking at is waste.
 *
 * Disable with `PAYMENT_RECONCILE=0`. Tune with `PAYMENT_RECONCILE_MS`.
 */

/** Don't query an invoice younger than this — the payer has not had a chance yet. */
export const RECONCILE_MIN_AGE_MS = 60_000

/**
 * Cap per sweep so a backlog cannot turn into a burst of outbound calls.
 *
 * At the spacing below this is ~60s of work, comfortably inside the interval,
 * so a full batch always finishes before the next sweep starts.
 */
export const RECONCILE_BATCH = 10

/**
 * Gap between status calls.
 *
 * Measured against the live API, not guessed. Pakasir's limiter is far tighter
 * than a burst cap and refills slowly: calls 1s, 2s and 3s apart alternated
 * 200/429 almost every time, while 6s apart returned 200 three times in a row
 * (and again after only a 20s pause). 6s is the observed sustainable rate, with
 * a margin added — being slow here is cheap, being limited out is not, because
 * a limited sweep activates nothing.
 */
export const RECONCILE_CALL_SPACING_MS = 6_500

/** How often the background sweeper runs. */
export const RECONCILE_INTERVAL_MS = 2 * 60_000

export interface ReconcileSummary {
  /** How many pending invoices were queried this pass. */
  checked: number
  /** Invoices Pakasir reported as paid and that we activated. */
  settled: number
  /** Invoices Pakasir reported as dead (canceled/expired). */
  canceled: number
  /** Still genuinely waiting on the payer. */
  pending: number
  /** Queries or settlements that errored; retried next sweep. */
  failed: number
  /** True when Pakasir rate-limited us and the sweep stopped early. */
  rateLimited: boolean
}

const EMPTY: ReconcileSummary = {
  checked: 0,
  settled: 0,
  canceled: 0,
  pending: 0,
  failed: 0,
  rateLimited: false,
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * One pass over the outstanding invoices.
 *
 * Never throws: a single bad invoice must not stop the rest, and a sweep must
 * not be able to take the server down. Anything that goes wrong is counted in
 * `failed` and retried on the next pass.
 */
export async function sweepPendingPayments(options?: {
  minAgeMs?: number
  batch?: number
  /** Delay between status calls. Only tests pass 0. */
  spacingMs?: number
}): Promise<ReconcileSummary> {
  if (!isPakasirConfigured()) return { ...EMPTY }

  const minAgeMs = options?.minAgeMs ?? RECONCILE_MIN_AGE_MS
  const batch = options?.batch ?? RECONCILE_BATCH
  const spacingMs = options?.spacingMs ?? RECONCILE_CALL_SPACING_MS
  const cutoff = new Date(Date.now() - minAgeMs)

  let outstanding
  try {
    outstanding = await db.payment.findMany({
      where: {
        status: 'PENDING',
        providerRef: { not: null },
        createdAt: { lt: cutoff },
      },
      orderBy: { createdAt: 'asc' },
      take: batch,
      // Only what the status call needs; the amount comes from our own row when
      // settling, not from the select here.
      select: { invoiceNumber: true, providerRef: true },
    })
  } catch (error) {
    console.error('[reconcile] gagal membaca tagihan tertunda:', error)
    return { ...EMPTY }
  }

  const summary: ReconcileSummary = { ...EMPTY }

  for (const [index, payment] of outstanding.entries()) {
    if (!payment.providerRef) continue

    // Space the calls out. The first one goes immediately (no point waiting to
    // make the only call), the rest wait.
    if (index > 0 && spacingMs > 0) await sleep(spacingMs)

    summary.checked += 1

    try {
      const remote = await getTransactionStatus(payment.providerRef)

      if (remote.status === 'completed') {
        await settleOrder({
          invoiceNumber: payment.invoiceNumber,
          amountRupiah: remote.amount,
          paidAt: remote.completedAt ? new Date(remote.completedAt) : new Date(),
          providerRef: remote.txnId,
        })
        summary.settled += 1
        console.info(`[reconcile] tagihan ${payment.invoiceNumber} dibayar — paket diaktifkan.`)
        continue
      }

      if (remote.status === 'canceled') {
        await db.payment.updateMany({
          where: { invoiceNumber: payment.invoiceNumber, status: 'PENDING' },
          data: { status: 'FAILED', failureReason: 'Transaksi dibatalkan atau kedaluwarsa.' },
        })
        summary.canceled += 1
        continue
      }

      summary.pending += 1
    } catch (error) {
      // Rate limited: every remaining call in this batch would also be refused,
      // so stop here rather than spending the rest of the quota proving it. The
      // invoice is not counted as failed — nothing is wrong with it.
      if (error instanceof AppError && error.code === 'RATE_LIMITED') {
        summary.checked -= 1
        summary.rateLimited = true
        console.warn(
          `[reconcile] Pakasir membatasi permintaan; sapuan dihentikan setelah ${summary.checked} tagihan.`
        )
        break
      }

      summary.failed += 1
      // Logged, not thrown: the next sweep retries this invoice.
      console.warn(`[reconcile] tagihan ${payment.invoiceNumber} gagal diperiksa:`, error)
    }
  }

  return summary
}

/**
 * Run the sweep on an interval for the lifetime of the process.
 *
 * The timer is `unref`'d so it never keeps the event loop (or a shutdown)
 * alive, and a `running` guard stops two slow sweeps from overlapping and
 * querying the same invoices twice.
 */
export function startPaymentReconciler(): void {
  if (process.env.PAYMENT_RECONCILE === '0') return

  const intervalMs = Number(process.env.PAYMENT_RECONCILE_MS) || RECONCILE_INTERVAL_MS
  let running = false

  const tick = async () => {
    if (running) return
    running = true
    try {
      const summary = await sweepPendingPayments()
      if (summary.checked > 0 || summary.rateLimited) {
        console.info(
          `[reconcile] diperiksa=${summary.checked} diaktifkan=${summary.settled} ` +
            `dibatalkan=${summary.canceled} menunggu=${summary.pending} gagal=${summary.failed}` +
            (summary.rateLimited ? ' (dibatasi Pakasir)' : '')
        )
      }
    } catch (error) {
      console.warn('[reconcile] sapuan gagal:', error)
    } finally {
      running = false
    }
  }

  const timer = setInterval(() => void tick(), intervalMs)
  timer.unref?.()

  console.info(
    `[reconcile] penyelaras pembayaran aktif — setiap ${Math.round(intervalMs / 1000)}s ` +
      `(minimal umur tagihan ${Math.round(RECONCILE_MIN_AGE_MS / 1000)}s).`
  )

  // One pass shortly after start so a payment that landed while the panel was
  // down is applied without waiting a full interval.
  const first = setTimeout(() => void tick(), 15_000)
  first.unref?.()
}
