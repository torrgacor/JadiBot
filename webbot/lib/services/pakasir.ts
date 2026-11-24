import { safeCompare } from '@/lib/security/crypto'
import { badRequest, internalError, rateLimited } from '@/lib/errors'

/**
 * Pakasir payment gateway — API v2.
 *
 * Server-side only. The API key is read from the environment on every call and
 * never leaves this process; the browser only ever receives a payment link.
 *
 * Verified against the v2 guide (https://pakasir.com/p/create-transaction,
 * /transaction-status, /webhook). v1 is deprecated and stops on 20 October 2026,
 * so only v2 endpoints are used here.
 *
 * Amounts: this platform stores money in minor units (see `lib/utils/format.ts`,
 * which divides by 100), while Pakasir wants plain rupiah. Every call in this
 * file crosses that boundary explicitly so the two can never be confused.
 */

const DEFAULT_BASE_URL = 'https://app.pakasir.com'

/**
 * Payment methods Pakasir accepts.
 *
 * `payment_link` is the default: it hands the payer a page where they pick
 * their own method. That matters here because virtual accounts start at
 * Rp10.000, so the cheaper plans could not be paid by VA at all — but QRIS
 * starts at Rp500 and the link still allows it.
 */
export type PakasirMethod =
  | 'payment_link'
  | 'qris'
  | 'bri_va'
  | 'bni_va'
  | 'cimb_niaga_va'
  | 'permata_va'
  | 'maybank_va'
  | 'bnc_va'
  | 'artha_graha_va'
  | 'sampoerna_va'

export type PakasirStatus = 'pending' | 'completed' | 'canceled'

export interface CreatedTransaction {
  txnId: string
  paymentLink: string | null
  qrString: string | null
  vaNumber: string | null
  totalPayment: number | null
  fee: number | null
  expiredAt: string | null
  isSandbox: boolean
  status: PakasirStatus
}

export interface TransactionStatus {
  txnId: string
  orderId: string
  amount: number
  status: PakasirStatus
  completedAt: string | null
  isSandbox: boolean
}

function baseUrl(): string {
  return (process.env.PAKASIR_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')
}

function slug(): string {
  return (process.env.PAKASIR_SLUG ?? '').trim()
}

function apiKey(): string {
  return (process.env.PAKASIR_API_KEY ?? '').trim()
}

function webhookSecret(): string {
  return (process.env.PAKASIR_WEBHOOK_SECRET ?? '').trim()
}

/** Are the credentials present? Used to explain the situation instead of failing obscurely. */
export function isPakasirConfigured(): boolean {
  return Boolean(slug() && apiKey())
}

/** Where Pakasir should POST payment notifications — shown to the admin so it can be copied into the project page. */
export function pakasirWebhookUrl(): string {
  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
  return `${origin}/api/payments/pakasir/webhook`
}

/**
 * The same handler under the shorter path Pakasir's dashboard often uses.
 * Both routes exist and import one implementation, so either can be registered.
 */
export function pakasirWebhookAliasUrl(): string {
  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
  return `${origin}/api/webhook/pakasir`
}

/**
 * Check the `X-Secret` header of an incoming webhook.
 *
 * Pakasir sends a shared secret rather than a signature, so this is a straight
 * constant-time comparison. An unconfigured secret rejects everything: a missing
 * environment variable must never become an open door that activates plans.
 */
export function verifyWebhookSecret(headerValue: string | null): boolean {
  const secret = webhookSecret()
  if (!secret || !headerValue) return false
  return safeCompare(headerValue.trim(), secret)
}

/** Rupiah for a stored minor-unit amount. */
export function toRupiah(minorUnits: number): number {
  return Math.round(minorUnits / 100)
}

async function callPakasir<T>(path: string, init: RequestInit, what: string): Promise<T> {
  if (!isPakasirConfigured()) {
    throw internalError(
      'Pembayaran belum dikonfigurasi: PAKASIR_SLUG dan PAKASIR_API_KEY belum diisi.'
    )
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey(),
        ...(init.headers ?? {}),
      },
      // Never let a hanging gateway hold a request open indefinitely.
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw internalError(`Tidak dapat menghubungi Pakasir saat ${what}: ${reason}`)
  }

  const text = await response.text()
  if (!response.ok) {
    // Rate limiting is reported separately because it is the one failure a
    // caller can act on: it is transient, and hammering on regardless makes it
    // worse. Verified live — the status endpoint answers 429 if it is called
    // twice in quick succession.
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('retry-after'))
      throw rateLimited(
        'Pakasir sedang membatasi permintaan. Coba lagi sebentar lagi.',
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined
      )
    }

    // Include Pakasir's own message when it sent one — it is the most useful
    // part of the failure — but never echo credentials back.
    const detail = text.slice(0, 300).replace(/\s+/g, ' ').trim()
    throw internalError(
      `Pakasir menolak permintaan ${what} (HTTP ${response.status})${detail ? `: ${detail}` : '.'}`
    )
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw internalError(`Jawaban Pakasir saat ${what} tidak dapat dibaca.`)
  }
}

interface RawTransaction {
  txn_id?: unknown
  payment_link?: unknown
  qr_string?: unknown
  va_number?: unknown
  total_payment?: unknown
  fee?: unknown
  expired_at?: unknown
  is_sandbox?: unknown
  status?: unknown
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asStatus(value: unknown): PakasirStatus {
  return value === 'completed' || value === 'canceled' ? value : 'pending'
}

/**
 * Create (or fetch) a transaction.
 *
 * The v2 endpoint is find-or-create: calling it twice with the same order id and
 * body returns the same transaction, so a user who reloads the checkout page
 * does not end up with two invoices.
 */
export async function createTransaction(input: {
  orderId: string
  amountRupiah: number
  method?: PakasirMethod
}): Promise<CreatedTransaction> {
  const { orderId, amountRupiah, method = 'payment_link' } = input

  if (!Number.isInteger(amountRupiah) || amountRupiah < 500) {
    throw badRequest('Nominal pembayaran minimal Rp500.')
  }

  const raw = await callPakasir<RawTransaction>(
    `/api/v2/create-transaction/${encodeURIComponent(slug())}/${encodeURIComponent(orderId)}`,
    { method: 'POST', body: JSON.stringify({ method, amount: amountRupiah }) },
    'membuat transaksi'
  )

  const txnId = asString(raw.txn_id)
  if (!txnId) throw internalError('Pakasir tidak mengembalikan ID transaksi.')

  return {
    txnId,
    paymentLink: asString(raw.payment_link),
    qrString: asString(raw.qr_string),
    vaNumber: asString(raw.va_number),
    totalPayment: asNumber(raw.total_payment),
    fee: asNumber(raw.fee),
    expiredAt: asString(raw.expired_at),
    isSandbox: raw.is_sandbox === true,
    status: asStatus(raw.status),
  }
}

/**
 * Read a transaction's status.
 *
 * The webhook is the fast path, but it can be lost — this is the authoritative
 * check, and the docs recommend it for anything that matters.
 */
export async function getTransactionStatus(txnId: string): Promise<TransactionStatus> {
  const raw = await callPakasir<{
    txn_id?: unknown
    order_id?: unknown
    amount?: unknown
    status?: unknown
    completed_at?: unknown
    is_sandbox?: unknown
  }>(
    `/api/v2/transaction-status/${encodeURIComponent(slug())}/${encodeURIComponent(txnId)}`,
    { method: 'GET' },
    'memeriksa status transaksi'
  )

  return {
    txnId: asString(raw.txn_id) ?? txnId,
    orderId: asString(raw.order_id) ?? '',
    amount: asNumber(raw.amount) ?? 0,
    status: asStatus(raw.status),
    completedAt: asString(raw.completed_at),
    isSandbox: raw.is_sandbox === true,
  }
}

/**
 * Payment link options.
 *
 * `redirect` brings the payer back to our own page once they are done, instead
 * of leaving them on Pakasir; `qris_only` is deliberately not used so the payer
 * keeps the choice of method.
 */
export function withRedirect(paymentLink: string, redirectUrl: string): string {
  const url = new URL(paymentLink)
  url.searchParams.set('redirect', redirectUrl)
  return url.toString()
}
