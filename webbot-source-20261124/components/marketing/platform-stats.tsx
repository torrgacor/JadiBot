import { Activity, MessageSquare, Server, Users } from 'lucide-react'
import type { PlatformStats } from '@/lib/services/platform-stats'
import { formatCompact, formatDuration } from '@/lib/utils/format'

/**
 * Stat band.
 *
 * Values come from `getPlatformStats()` — real database aggregates. The uptime
 * tile reports process uptime, and the section says so, rather than implying a
 * contractual SLA that is not measured here.
 */
export function PlatformStatsBand({ stats }: { stats: PlatformStats }) {
  const items = [
    {
      icon: Activity,
      label: 'Sesi Aktif',
      value: formatCompact(stats.activeSessions),
      hint: 'Sesi WhatsApp yang sedang terhubung',
    },
    {
      icon: MessageSquare,
      label: 'Pesan Terkirim',
      value: formatCompact(stats.messagesSent),
      hint: 'Terkirim lewat panel',
    },
    {
      icon: Server,
      label: 'Permintaan API',
      value: formatCompact(stats.apiRequests),
      hint: 'Panggilan API yang tercatat',
    },
    {
      icon: Users,
      label: 'Uptime',
      value: formatDuration(stats.uptimeSeconds * 1000),
      hint: 'Uptime sistem saat ini',
    },
  ]

  return (
    <section className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-start gap-3.5">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-[11px] border border-border bg-muted/50 text-primary"
                aria-hidden
              >
                <item.icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <div className="text-xl font-semibold tracking-tight tabular-nums">
                  {item.value}
                </div>
                <div className="text-mid font-medium">{item.label}</div>
                <div className="mt-0.5 text-tiny leading-snug text-muted-foreground">
                  {item.hint}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs2 text-muted-foreground">
          Angka di atas dibaca langsung dari data instalasi ini. Uptime mengacu pada sistem
          yang sedang berjalan, bukan jaminan layanan (SLA).
        </p>
      </div>
    </section>
  )
}
