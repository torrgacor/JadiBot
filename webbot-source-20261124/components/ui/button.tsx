'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  // Touch targets stay >= 36px so mobile taps are comfortable.
  // `will-change-transform` is omitted on purpose: the press scale is short
  // enough that promoting every button to its own layer costs more than it saves.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[11px] text-sm font-medium transition-[transform,box-shadow,background-color,border-color] duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_8px_26px_-12px_var(--glow)] hover:shadow-[0_14px_36px_-10px_var(--glow)]',
        secondary:
          'border border-border bg-glass text-foreground backdrop-blur-sm hover:border-border-strong hover:bg-muted',
        outline:
          'border border-border bg-transparent text-foreground hover:border-border-strong hover:bg-muted',
        ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
        danger:
          'border border-danger/25 bg-danger/10 text-danger hover:border-danger/40 hover:bg-danger/20',
        success:
          'border border-success/25 bg-success/10 text-success hover:border-success/40 hover:bg-success/20',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      /*
        Every size is one step taller below `sm`, because the pointer there is a
        finger: 44px is the comfortable minimum on a phone, and the same button
        can be tighter on a mouse. Only the touch breakpoint changes — desktop
        spacing is untouched.
      */
      size: {
        sm: 'h-11 px-3 text-mid [&_svg]:size-4 sm:h-9',
        md: 'h-11 px-4 [&_svg]:size-4 sm:h-10',
        lg: 'h-12 px-6 text-lead [&_svg]:size-[18px] sm:h-11',
        icon: 'size-11 [&_svg]:size-4 sm:size-10',
        'icon-sm': 'size-11 [&_svg]:size-3.5 sm:size-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Shows a spinner and blocks interaction. */
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    // `asChild` forwards to a single child, so a spinner cannot be injected.
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
