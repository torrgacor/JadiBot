import type { Metadata } from 'next'
import { CreditCard, Receipt, TriangleAlert } from 'lucide-react'
import { requireAuth, isAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { getPublicPlans } from '@/lib/services/plans'
import { getTrialStatus } from '@/lib/services/trial'
import { getRenewalStatus } from '@/lib/services/renewal'
import { cycleLabel, priceForCycle } from '@/lib/services/billing'
import { isPakasirConfigured, pakasirWebhookUrl, pakasirWebhookAliasUrl } from '@/lib/services/pakasir'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table'
import { PlanPicker } from '@/components/billing/plan-picker'
import { OrderStatusButton } from '@/components/billing/order-status-button'
import { TrialStatusPanel } from '@/components/billing/trial-status-panel'
import { PlanStatusPanel } from '@/components/billing/plan-status-panel'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Langganan & Pembayaran' }
export const dynamic = 'force-dynamic'

/**
 * Billing.
 *
 * Every row shown here is a real `payment` record — invoices are written when
 * the checkout is created and only become SUCCESS when Pakasir confirms the
 * money arrived. Nothing is marked paid optimistically.
 *
 * The free trial sits at the top: whether it is still available, how long it has
 * left, or that it has ended. Its state comes from the subscription row, so the
 * panel cannot show a customer a trial the server would refuse.
 */

const PAYMENT_TONE: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
  REFUNDED: 'info',
}

const PAYMENT_LABEL: Record<string, string> = {
  SUCCESS: 'Berhasil',
  PENDING: 'Menunggu pembayaran',
  FAILED: 'Gagal',
  REFUNDED: 'Dana dikembalikan',
}

function parseFeatures(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/**
 * Which billing cycle a period came from.
 *
 * The subscription row stores dates, not the cycle it was bought with, so this
 * is read back from the length of the period: a monthly one is 30 days and a
 * yearly one is 365, which is far enough apart to be unambiguous.
 */
function inferCycle(periodStart: Date, periodEnd: Date): 'monthly' | 'yearly' {
  const days = (periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000)
  return days > 200 ? 'yearly' : 'monthly'
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; plan?: string; cycle?: string }>
}) {
  const auth = await requireAuth()
  const { order, plan: planParam, cycle: cycleParam } = await searchParams

  const [subscription, plans, payments, configured, trial, renewal] = await Promise.all([
    db.subscription.findUnique({ where: { userId: auth.user.id }, include: { plan: true } }),
    getPublicPlans(),
    db.payment.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { plan: { select: { name: true, slug: true } } },
    }),
    Promise.resolve(isPakasirConfigured()),
    getTrialStatus(auth.user.id),
    // How long the paid period has left, and whether its warning window has been
    // entered. Null for a trial or a free account — the trial panel owns that.
    getRenewalStatus(auth.user.id),
  ])

  // The trial is never sold, so it is kept out of the picker and listed on its
  // own card instead.
  const trialPlan = plans.find((candidate) => candidate.isTrial) ?? null
  const paidPlans = plans.filter((candidate) => !candidate.isTrial)

  const plan = subscription?.plan ?? null
  const cycle: 'monthly' | 'yearly' = subscription
    ? inferCycle(subscription.currentPeriodStart, subscription.currentPeriodEnd)
    : 'monthly'
  const highlighted = order ? payments.find((payment) => payment.invoiceNumber === order) : null
  const pendingCount = payments.filter((payment) => payment.status === 'PENDING').length

  // Preselect the plan the customer just tried to buy, when we still sell it.
  // A `?plan=` from the pricing cards wins, because that is the choice they made
  // most recently and deliberately.
  const highlightedSlug = highlighted?.plan?.slug ?? null
  const sellable = (slug: string | null | undefined) =>
    Boolean(slug && paidPlans.some((candidate) => candidate.slug === slug))
  const preselected = sellable(planParam)
    ? (planParam as string)
    : sellable(highlightedSlug)
      ? (highlightedSlug as string)
      : null
  const initialCycle: 'monthly' | 'yearly' =
    cycleParam === 'yearly' || cycleParam === 'monthly' ? cycleParam : cycle

  return (
    <div className="space-y-6">
      <PageHeader
        title="Langganan & Pembayaran"
        description="Paket yang aktif, riwayat tagihan, dan pembayaran melalui Pakasir."
      />

      {highlighted && highlighted.status === 'PENDING' ? (
        <Card className="border-warning/30">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
            <div className="flex items-start gap-3">
              <Receipt className="mt-0.5 size-4 text-warning" aria-hidden />
              <div>
                <p className="text-mid font-medium">
                  Menunggu pembayaran untuk tagihan {highlighted.invoiceNumber}
                </p>
                <p className="mt-0.5 text-note text-muted-foreground">
                  Setelah membayar, paket aktif otomatis. Kalau halaman ini belum berubah,
                  tekan Cek status — panel akan menanyakan langsung ke Pakasir.
                </p>
              </div>
            </div>
            <OrderStatusButton invoice={highlighted.invoiceNumber} />
          </CardContent>
        </Card>
      ) : null}

      {!configured ? (
        <Card className="border-warning/30">
          <CardContent className="flex items-start gap-3 pt-5">
            <TriangleAlert className="mt-0.5 size-4 text-warning" aria-hidden />
            <div className="text-mid">
              <p className="font-medium">Pembayaran belum dikonfigurasi</p>
              <p className="mt-0.5 text-muted-foreground">
                Isi <code className="text-foreground">PAKASIR_SLUG</code> dan{' '}
                <code className="text-foreground">PAKASIR_API_KEY</code> di berkas{' '}
                <code className="text-foreground">.env</code> lalu jalankan ulang web.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Only one of these two ever renders: a paying account is `CONVERTED` for
          the trial, and an account on a trial or nothing has no paid period. */}
      <PlanStatusPanel status={renewal} />

      <TrialStatusPanel
        status={trial}
        plans={paidPlans}
        trialFeatures={trialPlan?.features ?? []}
        compact
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" aria-hidden />
              Paket aktif
            </CardTitle>
            <CardDescription>
              {plan
                ? `Kuota paket ini yang berlaku untuk akun Anda.`
                : 'Akun ini belum punya langganan.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan && subscription ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[17px] font-semibold tracking-tight">{plan.name}</span>
                  <Badge tone={subscription.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {subscription.status}
                  </Badge>
                  <Badge tone="neutral">{cycleLabel(cycle)}</Badge>
                </div>

                <dl className="grid gap-3 text-s sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Harga paket</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">
                      {plan.priceMonthly === 0
                        ? 'Gratis'
                        : formatCurrency(priceForCycle(plan, cycle), plan.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Berlaku sampai</dt>
                    <dd className="mt-0.5 font-medium">
                      {formatDateTime(subscription.currentPeriodEnd)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Pesan hari ini</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">
                      {subscription.messagesUsedToday}
                      {plan.maxMessagesPerDay === -1 ? ' / tanpa batas' : ` / ${plan.maxMessagesPerDay}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Permintaan API hari ini</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">
                      {subscription.apiRequestsUsedDay}
                      {plan.maxApiRequestsDay === -1 ? ' / tanpa batas' : ` / ${plan.maxApiRequestsDay}`}
                    </dd>
                  </div>
                </dl>

                <ul className="space-y-1.5 border-t border-border pt-3">
                  {parseFeatures(plan.features).map((feature) => (
                    <li key={feature} className="text-note text-muted-foreground">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada langganan aktif. Pilih paket di bawah untuk mulai.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubah atau perpanjang paket</CardTitle>
            <CardDescription>
              Membayar lewat Pakasir — QRIS atau virtual account, sesuai pilihan Anda di
              halaman pembayaran.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanPicker
              plans={plans}
              currentPlanSlug={plan?.slug ?? null}
              configured={configured}
              initialPlanSlug={preselected}
              initialCycle={initialCycle}
            />
          </CardContent>
        </Card>
      </div>

      {isAdmin(auth.user) ? (
        <Card>
          <CardHeader>
            <CardTitle>Integrasi Pakasir</CardTitle>
            <CardDescription>
              Hanya terlihat oleh administrator. Tempel URL di bawah ke kolom Webhook URL pada
              halaman detail proyek Pakasir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-s">
            <div>
              <span className="text-muted-foreground">Webhook URL: </span>
              <code className="break-all text-foreground">{pakasirWebhookUrl()}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Webhook alternatif: </span>
              <code className="break-all text-foreground">{pakasirWebhookAliasUrl()}</code>
            </div>
            <p className="text-muted-foreground">
              Webhook hanya jalur cepat, bukan syarat. Sistem memeriksa sendiri status tagihan yang
              masih tertunda setiap beberapa menit, jadi paket tetap aktif walau notifikasi Pakasir
              tidak pernah sampai ke panel ini.
            </p>
            <div>
              <span className="text-muted-foreground">Project slug: </span>
              <code className="text-foreground">{process.env.PAKASIR_SLUG ?? '—'}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Webhook secret: </span>
              {process.env.PAKASIR_WEBHOOK_SECRET ? (
                <Badge tone="success">terpasang</Badge>
              ) : (
                <Badge tone="danger">belum diisi</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat pembayaran</CardTitle>
          <CardDescription>
            {payments.length === 0
              ? 'Belum ada tagihan.'
              : `${payments.length} tagihan terakhir${pendingCount > 0 ? `, ${pendingCount} menunggu pembayaran` : ''}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Setiap pembayaran yang Anda buat akan tercatat di sini beserta statusnya.
            </p>
          ) : (
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tagihan</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-note">
                        {payment.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-s">
                        {payment.plan?.name ?? '—'}
                        <span className="text-muted-foreground"> · {cycleLabel(payment.cycle)}</span>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge tone={PAYMENT_TONE[payment.status] ?? 'neutral'}>
                          {PAYMENT_LABEL[payment.status] ?? payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-s text-muted-foreground">
                        {formatDateTime(payment.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'PENDING' ? (
                          <OrderStatusButton invoice={payment.invoiceNumber} />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrapper>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
