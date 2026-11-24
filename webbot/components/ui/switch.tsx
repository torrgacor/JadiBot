'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils/cn'

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
      'transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block size-[20px] rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
        'data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

/** Switch with an inline label + description, used throughout settings forms. */
export function SwitchField({
  label,
  description,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Switch> & {
  label: string
  description?: string
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start justify-between gap-4 rounded-[10px] border border-border bg-muted/20 p-3.5 transition-colors hover:border-border-strong',
        className
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-mid font-medium">{label}</span>
        {description ? (
          <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <Switch {...props} />
    </label>
  )
}
