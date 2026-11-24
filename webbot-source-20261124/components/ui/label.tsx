'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils/cn'

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'flex items-center gap-1 text-mid font-medium text-foreground/90 select-none',
      className
    )}
    {...props}
  >
    {children}
    {required ? (
      <span className="text-danger" aria-hidden>
        *
      </span>
    ) : null}
  </LabelPrimitive.Root>
))
Label.displayName = 'Label'

/** Label + control + error message, so forms stay consistent and accessible. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string
  htmlFor?: string
  hint?: string
  error?: string | null
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  const describedBy = error
    ? `${htmlFor}-error`
    : hint
      ? `${htmlFor}-hint`
      : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}

      {/* Clone to attach aria wiring without every caller repeating it. */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id: htmlFor,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
          })
        : children}

      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
