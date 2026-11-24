import Link from 'next/link'
import { ArrowRight, BellRing, CalendarClock, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PeriodCountdown, PeriodDaysLeft } from '@/components/billing/period-clock'
import { formatDateTime } from '@/lib/utils/format'
import { RENEWAL_WINDOW_DAYS } from '@/lib/utils/trial'
import type { RenewalStatus } from '@/lib/services/renewal'

/**
 * Status of a paid plan: how long it still has, and a renewal way out.
 *
 * Renders nothing for an account that is not on a running paid plan — a trial
 * has its own panel, and a free account has nothing to count down to. That is
 * also what keeps the two panels from ever stating the same deadline twice.
 *
 * Two moods, one component:
 *
 *   • running normally — the plan, the end date, a live countdown and a way to
 *     extend early (paying early continues the current period instead of
 *     replacing it, see `settleOrder`).
 *   • inside the warning window — the same facts, but stated as a deadline: the
 *     access watchdog *will* stop the bot when this runs out, so the notice says
 *     so plainly instead of making the customer discover it.
 *
 * Every number here comes from `RenewalStatus`, which the server computed from
 * `currentPeriodEnd`; the client only ticks the countdown between refreshes.
 */
export function PlanStatusPanel({
  status,
  compact = false,
}: {
  status: RenewalStatus | null
  compact?: boolean
}) {
  if (!status) return null

  const expiresAt = status.expiresAt.toISOString()
  const deadline =
    status.daysLeft === 1 ? 'besok' : `dalam ${status.daysLeft} hari`

  return (
    <section
      className={
        status.dueSoon
          ? 'glass-panel relative overflow-hidden rounded-[18px] border border-warning/45 p-5'
          : 'glass-panel rounded-[18px] border border-border p-5'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={
              status.dueSoon
                ? 'grid size-10 shrink-0 place-items-center rounded-[12px] bg-warning/10 text-warning'
                : 'grid size-10 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary'
            }
          >
            {status.dueSoon ? (
              <BellRing className="size-5" aria-hidden />
            ) : (
              <CreditCard className="size-5" aria-hidden />
            )}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lead font-semibold tracking-tight">
                {status.planName.toUpperCase()}
              </p>
              <Badge tone={status.dueSoon ? 'warning' : 'success'} className="tracking-[0.08em]">
                <PeriodDaysLeft expiresAt={expiresAt} initialMsLeft={status.msLeft} />
              </Badge>
            </div>
            <p className="mt-1 text-note text-muted-foreground">
              Berakhir {formatDateTime(status.expiresAt)}
            </p>

            {status.dueSoon ? (
              <p className="mt-2 max-w-xl text-note leading-relaxed text-warning">
                Paket {status.planName} berakhir {deadline}. Setelah itu bot dihentikan otomatis
                dan tidak bisa dinyalakan sampai paket diperpanjang — dashboard tetap bisa dibuka.
                {status.noticeSent ? ' Pengingat untuk periode ini sudah dikirim.' : ''}
              </p>
            ) : !compact ? (
              <p className="mt-2 max-w-xl text-note leading-relaxed text-muted-foreground">
                Bot berjalan normal dengan kuota paket ini. Kalau diperpanjang sebelum habis, sisa
                periode sekarang ditambahkan ke periode berikutnya — tidak ada waktu yang hilang.
                {' '}
                Pengingat otomatis dikirim {RENEWAL_WINDOW_DAYS} hari sebelum berakhir.
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
          <Button
            asChild
            size="sm"
            variant={status.dueSoon ? 'primary' : 'secondary'}
            className="mt-3"
          >
            <Link href={`/dashboard/billing?plan=${status.planSlug}`}>
              {status.dueSoon ? 'PERPANJANG SEKARANG' : 'Perpanjang paket'}
              {status.dueSoon ? <ArrowRight className="size-4" /> : <CalendarClock className="size-4" />}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
