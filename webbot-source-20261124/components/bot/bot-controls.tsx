'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, RotateCw, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BotAccessNotice } from '@/components/billing/bot-access-notice'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import type { SessionStatus } from '@/types/enums'
import { cn } from '@/lib/utils/cn'
import type { BotAccessNoticeData } from '@/lib/services/bot-access'

/**
 * Bot lifecycle controls.
 *
 * START / STOP / RESTART map onto the engine's real `connect`, `disconnect` and
 * `restart` operations — the same ones the session detail page uses — so each
 * button genuinely spawns or kills the Nano process instead of flipping a label.
 * Progress is surfaced as a toast that resolves into success or failure.
 */

type Action = 'connect' | 'disconnect' | 'restart'

const COPY: Record<Action, { pending: string; done: string }> = {
  connect: {
    pending: 'Menjalankan bot…',
    done: 'Bot berhasil dijalankan. Menunggu QR / pairing code.',
  },
  disconnect: {
    pending: 'Menghentikan bot…',
    done: 'Bot dihentikan. Kredensial tetap disimpan.',
  },
  restart: {
    pending: 'Merestart bot…',
    done: 'Bot berhasil direstart.',
  },
}

export function BotControls({
  sessionId,
  status,
  engineLoaded = true,
  notice = null,
  className,
  size = 'md',
}: {
  sessionId: string
  status: SessionStatus
  /** False when the engine holds no runtime for this session (gateway restarted). */
  engineLoaded?: boolean
  /**
   * Set when the account is not entitled to a running bot. Starting and
   * restarting are then disabled here, because the server would refuse them
   * anyway — the notice explains why, and stopping stays available.
   */
  notice?: BotAccessNoticeData | null
  className?: string
  size?: 'sm' | 'md'
}) {
  const router = useRouter()
  const [pending, setPending] = useState<Action | null>(null)
  const locked = notice !== null

  // A stored status is only meaningful while the engine actually holds the
  // session; otherwise the row is stale and "start" is the honest action.
  const running =
    engineLoaded &&
    (status === 'CONNECTED' ||
      status === 'CONNECTING' ||
      status === 'QR_REQUIRED' ||
      status === 'PAIRING_REQUIRED' ||
      status === 'RECONNECTING')

  async function run(action: Action) {
    setPending(action)
    const toastId = toast.loading(COPY[action].pending)
    try {
      await apiRequest(`/api/sessions/${sessionId}/actions`, {
        method: 'POST',
        body: { action },
      })
      toast.success(COPY[action].done, { id: toastId })
      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error), { id: toastId })
    } finally {
      setPending(null)
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button
        variant="primary"
        size={size}
        loading={pending === 'connect'}
        disabled={pending !== null || running || locked}
        onClick={() => void run('connect')}
        title={
          locked
            ? (notice?.message ?? 'Paket tidak aktif')
            : running
              ? 'Bot sudah berjalan'
              : 'Jalankan proses bot'
        }
      >
        {pending !== 'connect' ? <Play /> : null}
        Jalankan bot
      </Button>

      <Button
        variant="secondary"
        size={size}
        loading={pending === 'restart'}
        disabled={pending !== null || locked}
        onClick={() => void run('restart')}
        title={
          locked
            ? (notice?.message ?? 'Paket tidak aktif')
            : 'Jalankan ulang proses bot dengan mode handshake yang sama'
        }
      >
        {pending !== 'restart' ? <RotateCw /> : null}
        Restart
      </Button>

      <Button
        variant="danger"
        size={size}
        loading={pending === 'disconnect'}
        disabled={pending !== null || !running}
        onClick={() => void run('disconnect')}
        title={running ? 'Hentikan proses bot' : 'Bot sedang tidak berjalan'}
      >
        {pending !== 'disconnect' ? <Square /> : null}
        Hentikan bot
      </Button>

      {locked ? <BotAccessNotice data={notice} className="basis-full" /> : null}
    </div>
  )
}
