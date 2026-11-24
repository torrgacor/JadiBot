'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Accessible collapsible section.
 *
 * Replaces the native `<details>/<summary>` that was used for the dashboard's
 * "plan & access" panel — `<details>` is inconsistent across browsers, has
 * poor keyboard/a11y affordances, and cannot animate. This keeps the header as
 * a real `<button>`, animates height with a CSS grid trick (no JS measuring),
 * and respects `prefers-reduced-motion`.
 */
export function Collapsible({
  title,
  defaultOpen = false,
  hint,
  openHint,
  children,
  className,
}: {
  title: React.ReactNode
  defaultOpen?: boolean
  /** Short right-aligned label when collapsed. */
  hint?: React.ReactNode
  /** Right-aligned label when open. */
  openHint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('glass-panel rounded-[16px] border border-border', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-mid font-medium text-left"
      >
        <span>{title}</span>
        <span className="flex items-center gap-2 text-xs2 font-normal text-muted-foreground">
          {!open ? hint : openHint}
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-200 motion-reduce:transition-none',
              open ? 'rotate-180' : 'rotate-0'
            )}
            aria-hidden
          />
        </span>
      </button>

      {/* Grid-rows 0fr → 1fr animates height without measuring. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-border p-4 pt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
