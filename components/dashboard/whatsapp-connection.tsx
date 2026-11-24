import Link from 'next/link'
import { MessageSquareText, Plug, QrCode, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-dot'
import { ConnectionActions } from '@/components/dashboard/connection-actions'
import { formatDuration, formatNumber } from '@/lib/utils/format'
import type { SessionStatus } from '@/types/enums'

/**
 * WhatsApp connection card.
 *
 * Deliberately narrow: it answers "is the number linked, and can I do anything
 * about it" and nothing else. Every value is read from the stored session row or
 * the service's live snapshot — when neither exists the card says so instead of
 * showing a placeholder number.
 */

interface ConnectionSession {
  id: string
  name: string
  status: string
  phoneNumber: string | null
  profileName: string | null
  platform: string | null
  connectedSince: Date | null
  lastConnectedAt: Date | null
  messagesSent: number
  messagesReceived: number
}

export function WhatsAppConnection({
  session,
  status,
  engineLoaded,
  engineOffline,
  locked = false,
  lockedMessage,
}: {
  session: ConnectionSession | null
  /** Engine-reported status; falls back to the stored row. */
  status: SessionStatus
  engineLoaded: boolean
  engineOffline: boolean
  /** True when the account has no active plan: the buttons below that would
   *  start or relink the bot are disabled and the sibling card states why. */
  locked?: boolean
  lockedMessage?: string
}) {
  if (!session) {
    return (
      <Card glow className="p-5">
        <CardHeading status={null} />

        <div className="mt-4 flex items-start gap-3.5">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-[13px] border border-primary/30 bg-primary-soft text-primary"
            aria-hidden
          >
            <Plug className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lead font-semibold">WhatsApp belum terhubung</h3>
            <p className="mt-1 text-s leading-relaxed text-muted-foreground">
              Buat sesi lebih dulu, lalu tautkan nomor dengan memindai kode QR
              atau memasukkan kode pairing. Kodenya datang langsung dari
              WhatsApp — tidak ada simulasi.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/sessions/new">
              <QrCode className="size-4" />
              Hubungkan WhatsApp
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/help">Cara menautkan nomor</Link>
          </Button>
        </div>
      </Card>
    )
  }

  const connectedMs = session.connectedSince
    ? Math.max(0, Date.now() - new Date(session.connectedSince).getTime())
    : null

  const rows: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: 'Nomor', value: session.phoneNumber ?? 'belum tertaut', mono: true },
    {
      label: 'Terhubung sejak',
      value:
        status === 'CONNECTED' && connectedMs !== null
          ? formatDuration(connectedMs)
          : 'belum terhubung',
    },
    { label: 'Platform', value: session.platform ?? '—' },
    {
      label: 'Pesan keluar',
      value: formatNumber(session.messagesSent),
    },
    {
      label: 'Pesan masuk',
      value: formatNumber(session.messagesReceived),
    },
    { label: 'Nama profil', value: session.profileName ?? '—' },
  ]

  return (
    <Card className="p-5">
      <CardHeading status={status} />

      <div className="mt-4 flex items-center gap-3.5">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-[13px] border border-border bg-glass/60 text-primary"
          aria-hidden
        >
          <Smartphone className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-[17px] font-semibold tracking-tight">
            {session.phoneNumber ?? 'nomor belum tertaut'}
          </p>
          <p className="mt-0.5 truncate text-note text-muted-foreground">
            {session.name}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-label font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {row.label}
            </dt>
            <dd
              className={`mt-1 truncate text-mid font-medium ${row.mono ? 'font-mono' : ''}`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {engineOffline ? (
        <p className="mt-4 flex items-start gap-2 rounded-[11px] border border-warning/30 bg-warning/10 p-3 text-note leading-relaxed text-warning">
          <Plug className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Layanan bot tidak dapat dihubungi, jadi status di atas berasal dari
          data terakhir yang tersimpan. Coba lagi setelah layanan kembali.
        </p>
      ) : null}

      {session.status === 'QR_REQUIRED' || session.status === 'PAIRING_REQUIRED' ? (
        <p className="mt-4 flex items-start gap-2 rounded-[11px] border border-warning/30 bg-warning/10 p-3 text-note leading-relaxed text-warning">
          <QrCode className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Login belum selesai.{' '}
          <Link
            href={`/dashboard/sessions/${session.id}`}
            className="font-semibold underline underline-offset-2"
          >
            Buka halaman sesi
          </Link>{' '}
          untuk memindai QR atau memasukkan kode pairing.
        </p>
      ) : null}

      <div className="mt-4 border-t border-border pt-4">
        <ConnectionActions
          sessionId={session.id}
          status={status}
          engineLoaded={engineLoaded}
          locked={locked}
          lockedMessage={lockedMessage}
        />
      </div>
    </Card>
  )
}

function CardHeading({ status }: { status: SessionStatus | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <MessageSquareText className="size-3.5 text-primary" aria-hidden />
        Koneksi WhatsApp
      </span>
      {status ? <StatusPill status={status} /> : null}
    </div>
  )
}
