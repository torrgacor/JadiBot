import * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Field styling.
 *
 * 16px on phones on purpose: iOS Safari zooms the whole page when a focused
 * field renders below 16px, which leaves the layout scrolled sideways. From the
 * `sm` breakpoint up the type can drop back to the 14px the design uses.
 */
const fieldStyles =
  'w-full rounded-[10px] border bg-muted/40 px-3 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors duration-200 focus:outline-none focus:border-primary/60 focus:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger/60 aria-[invalid=true]:focus:border-danger sm:text-sm'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Renders a leading icon inside the field. */
  icon?: React.ReactNode
  /** Renders a trailing slot (e.g. a show/hide password toggle). */
  trailing?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, trailing, ...props }, ref) => {
    const field = (
      <input
        ref={ref}
        className={cn(
          fieldStyles,
          // Taller on touch screens so the field itself is a comfortable target.
          'h-11 sm:h-10',
          icon && 'pl-9',
          trailing && 'pr-10',
          className
        )}
        {...props}
      />
    )

    if (!icon && !trailing) return field

    return (
      <div className="relative w-full">
        {icon ? (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        {field}
        {trailing ? (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldStyles, 'min-h-[92px] py-2.5 leading-relaxed', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { fieldStyles }
