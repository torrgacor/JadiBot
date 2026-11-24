import Link from 'next/link'
import { Power } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-dot'
import { BotControls } from '@/components/bot/bot-controls'
import { BotAccessNotice } from '@/components/billing/bot-access-notice'
import type { SessionStatus } from '@/types/enums'
import type { BotAccessNoticeData } from '@/lib/services/bot-access'

/**
 * Bot control panel.
 *
 * A thin skin over `BotControls`, which is the component that already talks to
 * the engine's real `connect` / `restart` / `disconnect` operations. Nothing
 * here duplicates that logic — the panel only adds the framing.
 */
export function BotControlPanel({
  sessionId,
  status,
  engineLoaded,
  engineOffline,
  notice = null,
}: {
  sessionId: string
  status: SessionStatus
  engineLoaded: boolean
  engineOffline: boolean
  /** Set when the account has no active plan: the controls are replaced by the
   *  reason, and the trial/plan buttons live in the panel above this one. */
  notice?: BotAccessNoticeData | null
}) {
  if (notice) {
    return (
      <Card className="flex flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Power className="size-3.5 text-primary" aria-hidden />
            Kontrol Bot
          </span>
          <StatusPill status={status} />
        </div>

        <BotAccessNotice data={notice} showActions={false} className="mt-3" />

        <p className="mt-3 text-note leading-relaxed text-muted-foreground">
          Tombol menjalankan bot aktif lagi begitu ada paket berbayar atau trial yang berjalan.
        </p>

        <div className="mt-4 border-t border-border pt-4">
          <Button asChild variant="ghost" size="sm" className="px-0">
            <Link href={`/dashboard/sessions/${sessionId}`}>Buka detail sesi →</Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Power className="size-3.5 text-primary" aria-hidden />
          Kontrol Bot
        </span>
        <StatusPill status={status} />
      </div>

      <p className="mt-3 text-s leading-relaxed text-muted-foreground">
        {engineOffline
          ? 'Layanan bot sedang tidak dapat dihubungi. Tombol di bawah akan gagal sampai layanan kembali.'
          : engineLoaded
            ? 'Setiap tombol menjalankan perintah nyata ke proses bot: menjalankan, merestart, atau menghentikannya.'
            : 'Proses bot belum dimuat layanan. Menjalankannya akan memulai handshake baru.'}
      </p>

      <div className="mt-4">
        <BotControls sessionId={sessionId} status={status} engineLoaded={engineLoaded} size="sm" />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link href={`/dashboard/sessions/${sessionId}`}>Buka detail sesi →</Link>
        </Button>
      </div>
    </Card>
  )
}
