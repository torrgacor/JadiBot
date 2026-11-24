'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2Off, Play, QrCode, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import type { SessionStatus } from '@/types/enums'

/**
 * WhatsApp connection actions.
 *
 * Every button calls a real session action — none of them is decorative:
 *
 *   connect      → spawns the bot process and waits for QR / pairing
 *   restart      → tears the handshake down and re-runs it (the honest
 *                  "reconnect" for this engine; there is no separate one)
 *   disconnect   → stops the process but keeps the stored credentials
 *   refresh-qr   → asks WhatsApp for a fresh QR payload for the pending login
 *
 * A "reconnect" button that resolved to the same call as "restart" would be two
 * labels for one operation, so the pair is not offered as if they differed.
 */

type Action = 'connect' | 'restart' | 'disconnect' | 'refresh-qr'

const COPY: Record<Action, { pending: string; done: string }> = {
  connect: {
    pending: 'Menjalankan bot…',
    done: 'Bot dijalankan. Selesaikan login di halaman sesi.',
  },
  restart: {
    pending: 'Menyambung ulang…',
    done: 'Bot disambungkan ulang.',
  },
  disconnect: {
    pending: 'Memutuskan koneksi…',
    done: 'Koneksi diputuskan. Kredensial tetap disimpan.',
  },
  'refresh-qr': {
    pending: 'Memuat kode QR baru…',
    done: 'Kode QR baru diminta dari WhatsApp.',
  },
}

export function ConnectionActions({
  sessionId,
  status,
  engineLoaded = true,
  locked = false,
  lockedMessage,
  className,
}: {
  sessionId: string
  status: SessionStatus
  /** False when the service holds no runtime for this session. */
  engineLoaded?: boolean
  /**
   * True when the account has no active plan. The buttons that would put the
   * bot online are disabled — the server refuses them — while "Putuskan" stays
   * available. The reason is stated by the control panel beside this card, so
   * nothing is repeated here.
   */
  locked?: boolean
  lockedMessage?: string
  className?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState<Action | null>(null)

  const running =
    engineLoaded &&
    (status === 'CONNECTED' ||
      status === 'CONNECTING' ||
      status === 'RECONNECTING' ||
      status === 'QR_REQUIRED' ||
      status === 'PAIRING_REQUIRED')

  const awaitingLogin = status === 'QR_REQUIRED' || status === 'PAIRING_REQUIRED'

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
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {awaitingLogin ? (
        <Button
          variant="primary"
          size="sm"
          loading={pending === 'refresh-qr'}
          disabled={pending !== null || locked}
          onClick={() => void run('refresh-qr')}
          title={locked ? lockedMessage : undefined}
        >
          {pending !== 'refresh-qr' ? <QrCode /> : null}
          Muat ulang QR
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          loading={pending === 'connect'}
          disabled={pending !== null || running || locked}
          onClick={() => void run('connect')}
          title={locked ? lockedMessage : running ? 'Bot sudah berjalan' : 'Jalankan proses bot'}
        >
          {pending !== 'connect' ? <Play /> : null}
          {running ? 'Sudah berjalan' : 'Jalankan bot'}
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        loading={pending === 'restart'}
        disabled={pending !== null || !running || locked}
        onClick={() => void run('restart')}
        title={
          locked
            ? lockedMessage
            : 'Putuskan lalu sambungkan ulang dengan mode handshake yang sama'
        }
      >
        {pending !== 'restart' ? <RotateCw /> : null}
        Sambung ulang
      </Button>

      <Button
        variant="danger"
        size="sm"
        loading={pending === 'disconnect'}
        disabled={pending !== null || !running}
        onClick={() => void run('disconnect')}
        title={running ? 'Hentikan koneksi tanpa menghapus kredensial' : 'Bot sedang tidak berjalan'}
      >
        {pending !== 'disconnect' ? <Link2Off /> : null}
        Putuskan
      </Button>
    </div>
  )
}
