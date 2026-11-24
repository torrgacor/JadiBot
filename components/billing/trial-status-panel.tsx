import Link from 'next/link'
import { AlarmClock, ArrowRight, Check, Gift, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrialClaimButton } from '@/components/billing/trial-claim-button'
import { PeriodCountdown, PeriodDaysLeft } from '@/components/billing/period-clock'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import { TRIAL_DAYS } from '@/lib/utils/trial'
import type { PublicPlan } from '@/lib/services/plans'
import type { TrialStatus } from '@/lib/services/trial'

/**
 * Trial status, rendered from the subscription row.
 *
 * Three states are shown, and each one says only what the database actually
 * holds:
 *
 *   ACTIVE  — FREE TRIAL, "N DAYS LEFT" and a live countdown to the stored
 *             deadline. The bot is usable, inside the trial plan's quotas.
 *   EXPIRED — "Trial kamu sudah berakhir", the real prices we sell, and a way
 *             straight to checkout. The dashboard stays open; the bot does not.
 *   NONE    — the offer, with a button that activates it for real.
 *
 * `CONVERTED` (the account now pays) renders nothing: there is no trial left to
 * talk about.
 *
 * Dates are displayed with `formatDateTime`, but every number shown as *time
 * left* comes from `msLeft`, which the server computed from `trialExpiresAt` —
 * never from anything the browser decided.
 */
export function TrialStatusPanel({
  status,
  plans,
  trialFeatures = [],
  compact = false,
}: {
  status: TrialStatus
  /** Paid plans to offer; the trial plan itself is never listed here. */
  plans: PublicPlan[]
  /** Feature list read from the trial plan row, so copy cannot drift from the DB. */
  trialFeatures?: string[]
  compact?: boolean
}) {
  if (status.state === 'CONVERTED') return null

  const expiresAt = status.expiresAt?.toISOString() ?? null

  // ── running ──────────────────────────────────────────────────────────────
  if (status.state === 'ACTIVE' && expiresAt) {
    return (
      <section className="glass-panel relative overflow-hidden rounded-[18px] border border-primary/40 p-5 glow-soft">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lead font-semibold tracking-tight">FREE TRIAL</p>
                <Badge tone="primary" className="tracking-[0.08em]">
                  <PeriodDaysLeft expiresAt={expiresAt} initialMsLeft={status.msLeft} />
                </Badge>
              </div>
              <p className="mt-1 text-note text-muted-foreground">
                Berakhir {formatDateTime(status.expiresAt)}
              </p>
              {!compact ? (
                <p className="mt-2 max-w-xl text-note leading-relaxed text-muted-foreground">
                  Bot bisa dipakai normal selama trial berjalan, dengan kuota paket trial. Setelah{' '}
                  {TRIAL_DAYS} hari berakhir, bot dihentikan otomatis sampai Anda memilih paket
                  berbayar — dashboard tetap bisa dibuka.
                </p>
              ) : null}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-eyebrow uppercase tracking-[0.14em] text-muted-foreground">
              Sisa waktu
            </p>
            <p className="mt-0.5 text-[19px] font-semibold tabular-nums">
              <PeriodCountdown expiresAt={expiresAt} initialMsLeft={status.msLeft} />
            </p>
            <Button asChild size="sm" variant="secondary" className="mt-3">
              <Link href="/dashboard/billing">
                Lihat paket
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // ── over ─────────────────────────────────────────────────────────────────
  if (status.state === 'EXPIRED') {
    return (
      <section className="glass-panel relative overflow-hidden rounded-[18px] border border-danger/40 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-danger/10 text-danger">
            <AlarmClock className="size-5" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lead font-semibold tracking-tight">Trial kamu sudah berakhir</p>
              <Badge tone="danger" className="tracking-[0.08em]">
                TRIAL EXPIRED
              </Badge>
            </div>
            <p className="mt-1 text-note text-muted-foreground">
              {status.expiresAt
                ? `Masa trial ${TRIAL_DAYS} hari selesai ${formatDateTime(status.expiresAt)}. `
                : `Masa trial ${TRIAL_DAYS} hari sudah selesai. `}
              Bot dan sesi WhatsApp sudah dihentikan. Pilih paket di bawah untuk menyalakannya lagi.
            </p>
          </div>
        </div>

        {plans.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {plans.map((plan) => (
              <li key={plan.slug}>
                <Link
                  href={`/dashboard/billing?plan=${plan.slug}`}
                  className="flex flex-col rounded-[12px] border border-border bg-glass px-3.5 py-2 transition-colors hover:border-primary/50"
                >
                  <span className="text-body font-semibold tabular-nums">
                    {formatCurrency(plan.priceMonthly, plan.currency).replace(/\u00a0/g, '')}
                  </span>
                  <span className="text-xs2 text-muted-foreground">{plan.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/billing">
              PERPANJANG SEKARANG
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="text-tiny text-muted-foreground">
            Pembayaran lewat Pakasir — QRIS atau virtual account.
          </p>
        </div>
      </section>
    )
  }

  // ── never used ───────────────────────────────────────────────────────────
  return (
    <section className="glass-panel rounded-[18px] border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-success/10 text-success">
            <Gift className="size-5" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lead font-semibold tracking-tight">Free Trial</p>
              <Badge tone="success" className="tracking-[0.08em]">
                GRATIS
              </Badge>
            </div>
            <p className="mt-1 max-w-xl text-note leading-relaxed text-muted-foreground">
              Coba seluruh fitur dasar gratis selama {TRIAL_DAYS} hari — bot, koneksi WhatsApp, QR
              dan pairing code, pengaturan, perintah, grup, sampai log. Satu kali per akun.
            </p>
            {!compact && trialFeatures.length > 0 ? (
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {trialFeatures.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-tiny text-muted-foreground"
                  >
                    <Check className="size-3 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <TrialClaimButton />
      </div>
    </section>
  )
}
