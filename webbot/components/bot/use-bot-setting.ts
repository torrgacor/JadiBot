'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import type { NanoBotSettingOp, NanoBotSettingResult } from '@/lib/engine/nano'

/**
 * Shared mutation hook for the bot settings screens.
 *
 * Every write goes to `/api/bot/settings`, which applies it to the bot's own
 * database through the gateway. Feedback is the same everywhere: a pending
 * toast that resolves into the sentence the engine returned, or the validation
 * error it rejected the change with.
 */
export function useBotSetting() {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  const apply = useCallback(
    async (op: NanoBotSettingOp, pendingLabel = 'Menyimpan setting…'): Promise<boolean> => {
      setPending(op.op)
      const toastId = toast.loading(pendingLabel)
      try {
        const result = await apiRequest<NanoBotSettingResult>('/api/bot/settings', {
          method: 'POST',
          body: op,
        })
        toast.success(result.message, { id: toastId })
        router.refresh()
        return true
      } catch (error) {
        toast.error(errorMessage(error), { id: toastId })
        return false
      } finally {
        setPending(null)
      }
    },
    [router]
  )

  return { apply, pending }
}
