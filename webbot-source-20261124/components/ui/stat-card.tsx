import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { FadeNumber } from '@/components/ui/fade-once'
import { Sparkline } from '@/components/ui/sparkline'
import { cn } from '@/lib/utils/cn'

/**
 * Stat card.
 *
 * Deliberately a **server** component. Dashboard pages pass an `icon` prop, and
 * a server component cannot hand a function (which a Lucide icon is) to a client
 * component — React refuses to serialise it. The only part that needs the browser
 * is the count-up, and that lives in `AnimatedNumber`.
 *
 * Compact by design: a small label, a large number, a whisper of context. The
 * card lifts and picks up a green halo on hover, which is the only motion here.
 */
export interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  /** Percentage change vs the previous period. Omit when not applicable. */
  trend?: number
  hint?: string
  suffix?: string
  decimals?: number
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
  /** Ordered data (oldest → newest) for an inline SVG sparkline. */
  spark?: number[]
  /** When true the number counts up; when false it fades in (less noise). */
  animate?: boolean
}

const TONE_CLASS: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

const TONE_TILE: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'border-border',
  primary: 'border-primary/30 bg-primary-soft',
  success: 'border-success/30 bg-success/10',
  warning: 'border-warning/30 bg-warning/10',
  danger: 'border-danger/30 bg-danger/10',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  suffix,
  decimals = 0,
  tone = 'default',
  className,
  spark,
  animate = false,
}: StatCardProps) {
  const trendTone =
    trend === undefined
      ? null
      : trend > 0
        ? 'text-success'
        : trend < 0
          ? 'text-danger'
          : 'text-muted-foreground'

  const TrendIcon =
    trend === undefined ? Minus : trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus

  return (
    <Card className={cn('card-hover relative overflow-hidden p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-eyebrow font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-[9px] border border-border bg-surface',
            TONE_TILE[tone],
            TONE_CLASS[tone]
          )}
          aria-hidden
        >
          <Icon className="size-3.5" />
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1">
        <span className="font-display text-[26px] font-bold leading-none tracking-tight tabular">
          {animate ? (
            <AnimatedNumber value={value} decimals={decimals} />
          ) : (
            <FadeNumber value={value} decimals={decimals} />
          )}
        </span>
        {suffix ? (
          <span className="text-mid font-medium text-muted-foreground">{suffix}</span>
        ) : null}
      </div>

      <div className="mt-1.5 flex items-center gap-2 text-tiny">
        {trend !== undefined && trendTone ? (
          <span className={cn('inline-flex items-center gap-0.5 font-semibold', trendTone)}>
            <TrendIcon className="size-3.5" aria-hidden />
            {Math.abs(trend).toFixed(1)}%
          </span>
        ) : null}
        {hint ? <span className="truncate text-muted-foreground">{hint}</span> : null}
      </div>

      {spark && spark.length > 1 ? (
        <div className={cn('mt-3 text-primary', TONE_CLASS[tone])} aria-hidden>
          <Sparkline data={spark} />
        </div>
      ) : null}
    </Card>
  )
}
