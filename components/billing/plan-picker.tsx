'use client'

import { useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format'
import type { PublicPlan } from '@/lib/services/plans'

/**
 * Buy or renew a plan.
 *
 * The price shown here is only a preview — the invoice is priced from the plan
 * row on the server, so this component cannot influence what is charged. Paying
 * hands off to Pakasir's hosted page, which is why nothing is marked paid until
 * the webhook comes back.
 *
 * The time-boxed free tier is filtered out: it has no price to invoice and is
 * activated through its own endpoint, so offering it here would only produce a
 * button that fails. It is shown on the trial card above instead.
 */

type CheckoutResponse = {
  invoiceNumber: string
  paymentUrl: string
  amountRupiah: number
  isSandbox: boolean
}

export function PlanPicker({
  plans,
  currentPlanSlug,
  configured,
  initialPlanSlug,
  initialCycle = 'monthly',
}: {
  plans: PublicPlan[]
  currentPlanSlug: string | null
  configured: boolean
  initialPlanSlug?: string | null
  /** Cycle the customer arrived with (their pricing-card choice). */
  initialCycle?: 'monthly' | 'yearly'
}) {
  const purchasable = plans.filter((plan) => !plan.isTrial)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>(initialCycle)
  const [pending, setPending] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(
    initialPlanSlug ?? currentPlanSlug ?? null
  )

  async function pay(slug: string) {
    if (pending) return
    setPending(slug)

    try {
      const result = await apiRequest<CheckoutResponse>('/api/billing/checkout', {
        method: 'POST',
        body: { planSlug: slug, cycle },
      })

      toast.success(
        `Tagihan ${result.invoiceNumber} dibuat. Mengalihkan ke halaman pembayaran…`
      )
      // Leaving the tab intentionally: Pakasir's page is the payment UI, and it
      // returns the payer to /dashboard/billing when they are done.
      window.location.assign(result.paymentUrl)
    } catch (error) {
      toast.error(errorMessage(error))
      setPending(null)
    }
  }

  if (purchasable.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada paket yang bisa dibeli saat ini.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 rounded-[10px] border border-border bg-muted/40 p-1"
          role="group"
          aria-label="Siklus penagihan"
        >
          {(['monthly', 'yearly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              aria-pressed={cycle === option}
              className={cn(
                'rounded-[7px] px-3 py-1.5 text-mid font-medium transition-all duration-200',
                cycle === option
                  ? 'bg-elevated text-foreground shadow-[0_1px_0_0_var(--border)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option === 'monthly' ? 'Bulanan' : 'Tahunan'}
              {option === 'yearly' ? (
                <span className="ml-1.5 text-label text-primary">−17%</span>
              ) : null}
            </button>
          ))}
        </div>

        {!configured ? (
          <Badge tone="warning">Pembayaran belum dikonfigurasi</Badge>
        ) : null}
      </div>

      <ul role="list" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {purchasable.map((plan) => {
          const price = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly
          const isCurrent = plan.slug === currentPlanSlug
          const isSelected = plan.slug === selected
          const isBusy = pending === plan.slug

          return (
            <li
              key={plan.slug}
              onClick={() => setSelected(plan.slug)}
              className={cn(
                'glass-panel relative flex cursor-pointer flex-col rounded-[16px] border p-4',
                'transition-[border-color,box-shadow,transform] duration-300 ease-out',
                isSelected
                  ? 'border-primary/60 glow-neon'
                  : 'border-border hover:border-primary/40 hover:glow-soft'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-body font-semibold tracking-tight">{plan.name}</span>
                <Badge tone="primary" className="tracking-[0.08em]">
                  {plan.badge === 'POPULAR' ? <Sparkles className="size-3" aria-hidden /> : null}
                  {plan.badge}
                </Badge>
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[22px] font-semibold tracking-tight tabular-nums">
                  {formatCurrency(price, plan.currency).replace(/\u00a0/g, '')}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {cycle === 'monthly' ? 'bulan' : 'tahun'}
                </span>
              </div>

              <ul className="mt-3 flex-1 space-y-1.5">
                {plan.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-note">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 4 ? (
                  <li className="pl-[22px] text-note text-muted-foreground">
                    +{plan.features.length - 4} fitur lain
                  </li>
                ) : null}
              </ul>

              <Button
                variant={isSelected ? 'primary' : 'secondary'}
                className="mt-4 w-full"
                disabled={!configured || pending !== null}
                onClick={(event) => {
                  event.stopPropagation()
                  void pay(plan.slug)
                }}
              >
                {isBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                {isCurrent ? 'Perpanjang' : isBusy ? 'Menyiapkan…' : 'Bayar'}
              </Button>

              {isCurrent ? (
                <p className="mt-2 text-center text-xs2 text-primary">Paket Anda saat ini</p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
