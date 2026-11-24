'use client'

import { Activity, Bot, CheckCheck, QrCode, Radio } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Product preview.
 *
 * An illustration of the dashboard's layout and workflow, not live data — the
 * landing page's headline statistics come from the database (see
 * `PlatformStats`), and these panels deliberately show interface anatomy
 * (session rows, lifecycle, delivery state) rather than invented numbers.
 *
 * The entrance effects are plain CSS keyframes (see the `preview-*` utilities
 * in globals.css), not the motion/react chunk. This is a static mock-up, so a
 * one-shot staggered fade on mount is all it ever needed; the animation library
 * was overkill and shipped ~125 KB to every marketing page for it.
 */

const SESSIONS = [
  { name: 'Bot Toko', number: '+62 812 •••• 4471', state: 'connected' },
  { name: 'Bot CS', number: '+62 813 •••• 9028', state: 'connected' },
  { name: 'Bot Baru', number: 'Menunggu scan QR', state: 'qr' },
]

const LIFECYCLE = [
  { label: 'Buat sesi', done: true },
  { label: 'Minta kode pairing', done: true },
  { label: 'Bot terhubung', done: true },
  { label: 'Atur dari panel', done: false },
]

export function ProductPreview() {
  return (
    <div className="relative">
      {/* soft halo behind the panel — calm, not neon */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[28px] bg-primary/5 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-[16px] border border-border bg-surface/90 backdrop-blur-xl">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-danger/60" aria-hidden />
          <span className="size-2.5 rounded-full bg-warning/60" aria-hidden />
          <span className="size-2.5 rounded-full bg-success/60" aria-hidden />
          <span className="ml-3 font-mono text-xs2 text-muted-foreground">
            Panel · Sesi
          </span>
        </div>

        <div className="grid gap-0 sm:grid-cols-[1.25fr_1fr]">
          {/* ── sessions panel ─────────────────────────────────────── */}
          <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
            <div className="flex items-center justify-between">
              <span className="text-xs2 font-medium uppercase tracking-wide text-muted-foreground">
                Sesi WhatsApp
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-label font-medium text-success">
                <Radio className="size-3" aria-hidden />
                langsung
              </span>
            </div>

            <ul className="mt-3 space-y-2">
              {SESSIONS.map((session, index) => (
                <li
                  key={session.name}
                  className="preview-fade flex items-center gap-3 rounded-[10px] border border-border bg-muted/25 px-3 py-2.5"
                  style={{ animationDelay: `${350 + index * 100}ms` }}
                >
                  <span
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-[8px] border text-label font-semibold',
                      session.state === 'connected'
                        ? 'border-success/25 bg-success/10 text-success'
                        : 'border-warning/25 bg-warning/10 text-warning'
                    )}
                    aria-hidden
                  >
                    {session.state === 'connected' ? (
                      <CheckCheck className="size-3.5" />
                    ) : (
                      <QrCode className="size-3.5" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-mid font-medium">
                      {session.name}
                    </span>
                    <span className="block truncate font-mono text-eyebrow text-muted-foreground">
                      {session.number}
                    </span>
                  </span>

                  <span className="relative flex size-2" aria-hidden>
                    {session.state === 'connected' ? (
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                    ) : null}
                    <span
                      className={cn(
                        'relative inline-flex size-2 rounded-full',
                        session.state === 'connected' ? 'bg-success' : 'bg-warning'
                      )}
                    />
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-[10px] border border-border bg-muted/20 p-3">
              <span className="text-eyebrow uppercase tracking-wide text-muted-foreground">
                Siklus hidup
              </span>
              <ol className="mt-2 space-y-1.5">
                {LIFECYCLE.map((step, index) => (
                  <li
                    key={step.label}
                    className="preview-fade flex items-center gap-2 text-tiny"
                    style={{ animationDelay: `${700 + index * 80}ms` }}
                  >
                    <span
                      className={cn(
                        'grid size-4 place-items-center rounded-full border text-label',
                        step.done
                          ? 'border-primary/40 bg-primary-soft text-primary'
                          : 'border-border text-muted-foreground'
                      )}
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className={step.done ? 'text-foreground/90' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── side panel ─────────────────────────────────────────── */}
          <div className="space-y-3 p-4">
            <PreviewTile
              icon={Bot}
              title="perintah bot dijalankan"
              detail=".menu · 198 perintah dimuat"
              delay={550}
            />
            <PreviewTile
              icon={Bot}
              title="pengaturan grup disimpan"
              detail="welcome aktif · antilink aktif"
              delay={680}
            />
            <PreviewTile
              icon={Activity}
              title="log bot mengalir"
              detail="proses Nano berjalan · 199 plugin"
              delay={810}
            />

            {/* mini bar chart of message throughput */}
            <div className="rounded-[10px] border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow uppercase tracking-wide text-muted-foreground">
                  Volume pesan
                </span>
                <span className="text-eyebrow text-muted-foreground">7 hari</span>
              </div>
              <div className="mt-3 flex h-14 items-end gap-1.5" aria-hidden>
                {[38, 52, 30, 68, 46, 82, 60].map((height, index) => (
                  <span
                    key={index}
                    className={cn(
                      'preview-bar flex-1 rounded-t-[3px]',
                      index === 5 ? 'bg-primary' : 'bg-primary/30'
                    )}
                    style={{ height: `${height}%`, animationDelay: `${900 + index * 60}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewTile({
  icon: Icon,
  title,
  detail,
  delay,
}: {
  icon: typeof Bot
  title: string
  detail: string
  delay: number
}) {
  return (
    <div
      className="preview-fade flex items-start gap-3 rounded-[10px] border border-border bg-muted/25 p-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-[8px] border border-border bg-surface text-primary">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-note font-medium">{title}</span>
        <span className="block truncate font-mono text-eyebrow text-muted-foreground">
          {detail}
        </span>
      </span>
    </div>
  )
}
