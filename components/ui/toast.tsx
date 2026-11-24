'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'
import { useTheme } from 'next-themes'

/**
 * Toast notifications.
 *
 * Re-exported `toast` helpers are used by every mutation hook so success and
 * failure feedback is consistent across the dashboard.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
      position="top-right"
      /* Clear the notch / status bar on phones, and stay inside the viewport. */
      mobileOffset={{ top: 'calc(env(safe-area-inset-top) + 8px)', left: '10px', right: '10px' }}
      closeButton
      duration={4200}
      toastOptions={{
        classNames: {
          toast:
            'group rounded-[12px] border border-border bg-elevated text-foreground shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)]',
          title: 'text-mid font-medium',
          description: 'text-xs text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground rounded-[7px] text-xs',
          cancelButton: 'bg-muted text-foreground rounded-[7px] text-xs',
          error: 'border-danger/30',
          success: 'border-success/30',
          warning: 'border-warning/30',
        },
      }}
    />
  )
}

export { toast }
