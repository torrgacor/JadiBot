'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Gift, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format'
import { TrialClaimButton } from '@/components/billing/trial-claim-button'
import { TRIAL_DAYS, type TrialState } from '@/lib/utils/trial'
// Type-only: the mapper itself lives in a server module, because exports of a
// `'use client'` file cannot be *called* while rendering on the server.
import type { PublicPlan } from '@/lib/services/plans'

/**
 * Pricing.
 *
 * Rendered from the plan rows in the database, so editing a plan in the admin
 * panel changes both the landing page and the enforcement quotas at once.
 * Nothing here is hard-coded.
 *
 * Cards are selectable: the chosen one takes a neon border, a glow and a slight
 * scale-up, and the button carries the visitor to registration, or into the
 * panel when they are already signed in.
 *
 * The free trial is split out of the paid grid on purpose. It has no price, no
 * billing cycle and a completely different call to action — and it is activated
 * by the server, not sold — so it gets its own card instead of pretending to be
 * a plan you can buy for Rp0.
 */

export function PricingSection({
  plans,
  isAuthenticated,
  trial,
}: {
  plans: PublicPlan[]
  isAuthenticated: boolean
  /** Whether this visitor can still claim the one free trial per account. */
  trial?: { available: boolean; state: TrialState }
}) {
  const trialPlan = plans.find((plan) => plan.isTrial) ?? null
  const paidPlans = plans.filter((plan) => !plan.isTrial)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [chosen, setChosen] = useState<string | null>(null)

  if (plans.length === 0) {
    return (
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Belum ada paket yang tersedia saat ini. Silakan hubungi dukungan untuk informasi
          paket.
        </p>
      </section>
    )
  }

  // The recommended tier is highlighted before anyone touches it, so the section
  // has a focal point on first paint.
  const recommended =
    paidPlans.find((plan) => plan.badge === 'POPULAR')?.slug ??
    paidPlans[Math.min(2, paidPlans.length - 1)]?.slug ??
    null
  const active = chosen ?? recommended

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <span className="text-xs2 font-semibold uppercase tracking-[0.14em] text-primary">
            Harga
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Pilih Paket Bot Kamu
          </h2>
          <p className="mt-3 text-lead leading-relaxed text-muted-foreground">
            Setiap paket sudah termasuk panel lengkap: koneksi WhatsApp sungguhan, login
            kode pairing maupun QR, dan pengelolaan bot Nano. Pembayaran lewat Pakasir —
            QRIS atau virtual account. Belum yakin? Ada FREE TRIAL {TRIAL_DAYS} hari gratis di
            bawah kartu ini.
          </p>
        </div>

        {/* cycle switch */}
        <div
          className="inline-flex shrink-0 items-center gap-1 rounded-[10px] border border-border bg-muted/40 p-1"
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
                'rounded-[7px] px-3 py-1.5 text-mid font-medium capitalize transition-all duration-200',
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
      </div>

      {trialPlan ? (
        <TrialOfferCard
          plan={trialPlan}
          isAuthenticated={isAuthenticated}
          trial={trial ?? { available: true, state: 'NONE' }}
        />
      ) : null}

      <div
        className={cn(
          'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
          trialPlan ? 'mt-4' : 'mt-10'
        )}
        role="radiogroup"
        aria-label="Paket langganan"
      >
        {paidPlans.map((plan) => {
          const isActive = plan.slug === active
          const price = cycle === 'monthly' ? plan.priceMonthly : plan.priceYearly
          const isFree = price === 0
          // Intl pads the currency code with a non-breaking space ("Rp 5.000");
          // the card reads tighter as "Rp5.000".
          const priceLabel = isFree
            ? 'Gratis'
            : formatCurrency(price, plan.currency).replace(/\u00a0/g, '')

          return (
            <article
              key={plan.slug}
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              onClick={() => setChosen(plan.slug)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setChosen(plan.slug)
                }
              }}
              className={cn(
                'glass-panel group relative flex cursor-pointer flex-col overflow-hidden rounded-[18px] border p-5 outline-none',
                'transition-[transform,box-shadow,border-color] duration-300 ease-out',
                'hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary/40',
                isActive
                  ? 'scale-[1.03] border-primary/60 glow-neon'
                  : 'border-border hover:border-primary/40 hover:glow-soft'
              )}
            >
              {isActive ? (
                <>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-20 -right-10 size-44 rounded-full bg-primary/10 blur-3xl"
                  />
                </>
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lead font-semibold tracking-tight">{plan.name}</h3>
                <Badge tone="primary" className="shrink-0 tracking-[0.08em]">
                  {plan.badge === 'POPULAR' ? (
                    <Sparkles className="size-3" aria-hidden />
                  ) : null}
                  {plan.badge}
                </Badge>
              </div>

              <p className="mt-1.5 min-h-[34px] text-s leading-relaxed text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[26px] font-semibold tracking-tight tabular-nums">
                  {priceLabel}
                </span>
                {!isFree ? (
                  <span className="text-xs text-muted-foreground">
                    / {cycle === 'monthly' ? 'periode' : 'tahun'}
                  </span>
                ) : null}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-s">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={isActive ? 'primary' : 'secondary'}
                className="mt-6 w-full"
              >
                <Link
                  href={
                    isAuthenticated
                      ? `/dashboard/billing?plan=${plan.slug}&cycle=${cycle}`
                      : `/register?plan=${plan.slug}`
                  }
                  // Selecting is the card's job; the click belongs to the link.
                  onClick={(event) => event.stopPropagation()}
                >
                  Pilih Paket
                </Link>
              </Button>
            </article>
          )
        })}
      </div>

      <p className="mt-6 text-xs2 text-muted-foreground">
        Kuota tiap paket — pesan dan permintaan API per hari — tampil di dalam panel setelah
        kamu masuk, dan angka itulah yang benar-benar ditegakkan. Tanpa batas berarti tidak
        ada pembatasan dari panel; kebijakan WhatsApp sendiri tetap berlaku.
      </p>
    </section>
  )
}

/**
 * The free-trial card.
 *
 * "Gratis" here is time-boxed, not unlimited: the {TRIAL_DAYS}-day window is
 * stated next to the price so nobody reads it as an ongoing free plan.
 *
 * The button performs the real action — a signed-in visitor activates the trial
 * through the API, a visitor signs up first, and an account that has already
 * spent its one trial is told so and pointed at the paid plans instead of being
 * offered something it cannot have.
 */
function TrialOfferCard({
  plan,
  isAuthenticated,
  trial,
}: {
  plan: PublicPlan
  isAuthenticated: boolean
  trial: { available: boolean; state: TrialState }
}) {
  return (
    <article className="glass-panel glow-soft relative mt-10 overflow-hidden rounded-[18px] border border-primary/40 p-5 transition-transform duration-300 ease-out hover:-translate-y-[3px]">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 right-10 size-56 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-9 place-items-center rounded-[11px] bg-primary/10 text-primary">
              <Gift className="size-5" aria-hidden />
            </span>
            <h3 className="text-lead font-semibold tracking-tight">{plan.name}</h3>
            <Badge tone="primary" className="tracking-[0.08em]">
              {plan.badge}
            </Badge>
            <Badge tone="success" className="tracking-[0.08em]">
              GRATIS
            </Badge>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[26px] font-semibold tracking-tight">GRATIS</span>
            <span className="text-xs text-muted-foreground">durasi {TRIAL_DAYS} hari</span>
          </div>

          <p className="mt-2 text-s leading-relaxed text-muted-foreground">
            {plan.description} Berakhir otomatis setelah {TRIAL_DAYS} hari, tanpa tagihan — bot
            bisa dipakai normal selama masa trial.
          </p>

          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-note">
                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 lg:text-right">
          {!isAuthenticated ? (
            <Button asChild>
              <Link href={`/register?plan=${plan.slug}`}>
                COBA GRATIS {TRIAL_DAYS} HARI
              </Link>
            </Button>
          ) : trial.available ? (
            <TrialClaimButton redirectTo="/dashboard/billing" />
          ) : (
            <Button asChild variant="secondary">
              <Link href="/dashboard/billing">
                LIHAT PAKET BERBAYAR
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}

          <p className="mt-2 text-xs2 text-muted-foreground">
            {!isAuthenticated
              ? 'Satu kali per akun. Tanpa kartu kredit.'
              : trial.state === 'CONVERTED'
                ? 'Akun ini sudah berlangganan paket berbayar.'
                : trial.available
                  ? 'Satu kali per akun. Tanpa kartu kredit.'
                  : 'Trial gratis sudah pernah dipakai di akun ini. Satu kali per akun.'}
          </p>
        </div>
      </div>
    </article>
  )
}

