import type * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Mobile card list.
 *
 * Pages render a real <table> above `md` and this below it, so tables never
 * force horizontal page scrolling on phones. Each item is a definition list so
 * the label/value pairs stay readable to screen readers.
 */
export function MobileCardList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col gap-3', className)}>{children}</div>
}

export function MobileCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const interactive = Boolean(onClick)

  return (
    <div
      className={cn(
        'rounded-[12px] border border-border bg-surface p-4',
        interactive && 'cursor-pointer transition-colors hover:border-border-strong',
        className
      )}
      onClick={onClick}
      {...(interactive
        ? {
            role: 'button',
            tabIndex: 0,
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            },
          }
        : {})}
    >
      {children}
    </div>
  )
}

export function MobileField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 py-1', className)}>
      <dt className="text-xs2 uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-right text-mid">{children}</dd>
    </div>
  )
}
