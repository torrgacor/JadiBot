import type { LucideIcon } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Empty state.
 *
 * Every list in the product renders one of these instead of a bare "no data"
 * string, and always offers the next action so a new account is never a
 * dead end.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 py-8' : 'gap-3 py-16',
        className
      )}
    >
      <div
        className={cn(
          'relative grid place-items-center rounded-[14px] border border-border bg-muted/40 text-muted-foreground',
          compact ? 'size-11' : 'size-14'
        )}
        aria-hidden
      >
        <Icon className={compact ? 'size-5' : 'size-6'} />
        <span className="absolute inset-0 rounded-[14px] bg-primary/5 blur-lg" />
      </div>

      <div className="max-w-sm space-y-1 px-4">
        <h3 className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>
          {title}
        </h3>
        {description ? (
          <p className="text-mid leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
