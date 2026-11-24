import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs2 font-medium leading-5 whitespace-nowrap backdrop-blur-sm',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-glass text-muted-foreground',
        primary:
          'border-primary/30 bg-primary-soft text-primary shadow-[0_0_18px_-8px_var(--glow)]',
        success:
          'border-success/30 bg-success/10 text-success shadow-[0_0_18px_-8px_var(--glow)]',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        danger: 'border-danger/30 bg-danger/10 text-danger',
        info: 'border-info/30 bg-info/10 text-info',
        outline: 'border-border-strong bg-transparent text-foreground',
      },
      size: {
        sm: 'text-label px-1.5 py-0',
        md: '',
        lg: 'text-xs px-2.5 py-1',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, tone, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot ? (
        <span
          className="size-1.5 rounded-full bg-current"
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  )
}

export { badgeVariants }
