'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import { TRIAL_DAYS, type TrialStatusJson } from '@/lib/utils/trial'

/**
 * Activate the free trial.
 *
 * The only thing sent is the request itself — no dates, no duration, no "still
 * valid" flag — because the server derives all of that from the subscription
 * row. A refusal (already used, already paying) comes back as an error and is
 * shown as-is rather than being papered over.
 */
export function TrialClaimButton({
  label = `COBA GRATIS ${TRIAL_DAYS} HARI`,
  variant = 'primary',
  size,
  className,
  /** Visit this page once the trial is live, instead of just refreshing. */
  redirectTo,
}: {
  label?: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function claim() {
    if (pending) return
    setPending(true)

    try {
      const status = await apiRequest<TrialStatusJson>('/api/billing/trial', {
        method: 'POST',
      })

      toast.success(
        `Trial ${TRIAL_DAYS} hari aktif sampai ${new Date(status.expiresAt ?? Date.now()).toLocaleString(
          'id-ID',
          { dateStyle: 'medium', timeStyle: 'short' }
        )}.`
      )

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      onClick={() => void claim()}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      {pending ? 'Mengaktifkan…' : label}
    </Button>
  )
}
