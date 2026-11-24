'use client'

import { useState } from 'react'
import { AlertTriangle, Check, Loader2 } from 'lucide-react'
import { useRealtimeEvent } from '@/components/providers/realtime-provider'
import { StatusPill } from '@/components/ui/status-dot'
import { cn } from '@/lib/utils/cn'
import type { SessionStatus } from '@/types/enums'

/**
 * Linking progress.
 *
 * Four steps, each tied to a status the engine genuinely reports — there is no
 * timer here, and nothing advances on a `setTimeout`. If the service says the
 * session is waiting for a code, step 2 stays active until it says otherwise,
 * however long that takes.
 *
 * The step that is "active" is the one currently being *waited on*: for a QR or
 * pairing handshake that is the phone, not the server.
 */

interface StepState {
  done: number
  /** Index of the step currently in progress, or null when nothing is pending. */
  active: number | null
  /** Set for states where the handshake has stopped and needs the user. */
  blocked: string | null
}

function stepsFor(status: SessionStatus, hasNumber: boolean): StepState {
  switch (status) {
    case 'CREATED':
      // Nothing has been asked of WhatsApp yet. The only thing that can be
      // "done" is having a number to link with.
      return hasNumber
        ? { done: 1, active: null, blocked: null }
        : { done: 0, active: 0, blocked: null }

    case 'CONNECTING':
      return { done: 1, active: 1, blocked: null }

    case 'QR_REQUIRED':
    case 'PAIRING_REQUIRED':
      return { done: 1, active: 1, blocked: null }

    case 'RECONNECTING':
      return { done: 1, active: 2, blocked: null }

    case 'CONNECTED':
      // A connected socket is the only signal we get, and the bot process is
      // already up by definition — it is the thing holding the socket.
      return { done: 4, active: null, blocked: null }

    case 'LOGGED_OUT':
      return { done: 1, active: null, blocked: 'Sesi dilepas dari WhatsApp.' }

    case 'AUTH_REQUIRED':
      return {
        done: 1,
        active: null,
        blocked: 'Kredensial tersimpan tidak lagi berlaku. Tautkan ulang perangkat.',
      }

    case 'BANNED':
      return { done: 1, active: null, blocked: 'Nomor ini diblokir oleh WhatsApp.' }

    case 'ERROR':
      return { done: 0, active: null, blocked: 'Proses bot berhenti karena kesalahan.' }

    case 'DISCONNECTED':
    default:
      return { done: hasNumber ? 1 : 0, active: null, blocked: null }
  }
}

const STEPS = [
  { title: 'Nomor bot disiapkan', detail: 'Nama dan nomor tersimpan pada sesi.' },
  { title: 'Menunggu perangkat', detail: 'Memindai QR atau memasukkan kode pairing.' },
  { title: 'Autentikasi WhatsApp', detail: 'Perangkat sedang diverifikasi.' },
  { title: 'Bot berjalan', detail: 'Proses bot memuat konfigurasi dan perintahnya.' },
]

export function LinkingProgress({
  sessionId,
  initialStatus,
  hasNumber,
  className,
}: {
  sessionId: string
  initialStatus: SessionStatus
  hasNumber: boolean
  className?: string
}) {
  const [status, setStatus] = useState<SessionStatus>(initialStatus)
  const [message, setMessage] = useState<string | null>(null)

  // Same subscription the connect panel uses; both simply render the state the
  // gateway publishes, so they cannot disagree.
  useRealtimeEvent('engine', (event) => {
    if (event.type !== 'engine' || event.sessionKey !== sessionId) return
    if (event.event.type !== 'session.status') return
    setStatus(event.event.status)
    setMessage(event.event.statusMessage ?? null)
  })

  const state = stepsFor(status, hasNumber)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lead font-semibold tracking-tight">Progres penautan</h2>
        <StatusPill status={status} />
      </div>

      <ol className="space-y-1">
        {STEPS.map((step, index) => {
          const isDone = index < state.done
          const isActive = state.active === index

          return (
            <li key={step.title} className="flex gap-3">
              <span className="flex flex-col items-center">
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-xs2 font-semibold',
                    isDone
                      ? 'border-primary/30 bg-primary-soft text-primary'
                      : isActive
                        ? 'border-info/40 bg-info/10 text-info'
                        : 'border-border bg-glass/40 text-muted-foreground'
                  )}
                  aria-hidden
                >
                  {isDone ? (
                    <Check className="size-3.5" />
                  ) : isActive ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    index + 1
                  )}
                </span>
                {index < STEPS.length - 1 ? (
                  <span
                    className={cn(
                      'my-0.5 w-px flex-1',
                      isDone ? 'bg-primary/30' : 'bg-border'
                    )}
                    aria-hidden
                  />
                ) : null}
              </span>

              <span className={cn('min-w-0 pb-3', index === STEPS.length - 1 && 'pb-0')}>
                <span
                  className={cn(
                    'block text-mid font-medium',
                    isDone
                      ? 'text-foreground'
                      : isActive
                        ? 'text-info'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
                <span className="mt-0.5 block text-tiny leading-relaxed text-muted-foreground">
                  {step.detail}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      {state.blocked ? (
        <p className="flex items-start gap-2 rounded-[11px] border border-danger/30 bg-danger/10 p-3 text-note leading-relaxed text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {state.blocked}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-[11px] border border-border bg-glass/40 px-3.5 py-2.5 text-note leading-relaxed text-muted-foreground">
          {message}
        </p>
      ) : null}

      <p className="text-xs2 leading-relaxed text-muted-foreground">
        Langkah di atas mengikuti status yang dilaporkan layanan bot secara
        langsung — tidak ada simulasi waktu.
      </p>
    </div>
  )
}
