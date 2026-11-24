import * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Card shell.
 *
 * The base surface of the whole panel: translucent glass, hairline border and a
 * real backdrop blur, supplied by the `glass-panel` utility so every card in the
 * product shares one definition. The premium feel comes from spacing and
 * hierarchy rather than heavy decoration.
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lift on hover — only for cards that are themselves interactive. */
  interactive?: boolean
  /** Soft primary glow, used sparingly (e.g. the active plan). */
  glow?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, glow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'glass-panel rounded-[16px] border border-border',
        interactive && 'card-hover cursor-pointer',
        glow && 'glow-soft border-primary/25',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-5 pb-3', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-base font-semibold tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-3 p-5 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'
