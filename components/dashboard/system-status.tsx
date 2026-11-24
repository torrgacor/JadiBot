import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  MessageSquare,
  Power,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils/cn'
import { timeAgo } from '@/lib/utils/format'
import type { ActivityEntry, SystemStatusItem } from '@/lib/services/dashboard-stats'

/**
 * System status.
 *
 * Reports what is actually true: a value is never displayed as "operational"
 * unless the corresponding probe succeeded (see `getDashboardData`).
 */
export function SystemStatusPanel({ items }: { items: SystemStatusItem[] }) {
  const tone = {
    operational: 'text-success bg-success/10 border-success/25',
    warning: 'text-warning bg-warning/10 border-warning/25',
    offline: 'text-danger bg-danger/10 border-danger/25',
  } as const

  const Icon = {
    operational: CheckCircle2,
    warning: AlertTriangle,
    offline: XCircle,
  } as const

  const STATUS_LABEL = {
    operational: 'normal',
    warning: 'peringatan',
    offline: 'mati',
  } as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Sistem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((item) => {
          const IconComponent = Icon[item.status]
          return (
            <div
              key={item.name}
              className="flex items-start gap-3 rounded-[10px] border border-border bg-muted/20 p-3"
            >
              <span
                className={cn(
                  'mt-0.5 grid size-6 shrink-0 place-items-center rounded-[7px] border',
                  tone[item.status]
                )}
                aria-hidden
              >
                <IconComponent className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-mid font-medium">{item.name}</span>
                  <span
                    className={cn(
                      'text-eyebrow font-medium uppercase tracking-wide',
                      item.status === 'operational'
                        ? 'text-success'
                        : item.status === 'warning'
                          ? 'text-warning'
                          : 'text-danger'
                    )}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </span>
                <span className="mt-0.5 block text-tiny leading-snug text-muted-foreground">
                  {item.detail}
                </span>
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

const LEVEL_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
} as const

const LEVEL_TONE = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
  info: 'text-info',
} as const

const EVENT_ICON: Record<string, typeof Activity> = {
  'session.connected': Power,
  'session.disconnected': Power,
  'message.sent': MessageSquare,
  'message.received': MessageSquare,
  'message.failed': MessageSquare,
}

/** Recent activity feed, newest first. */
export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            compact
            icon={Activity}
            title="Belum ada aktivitas"
            description="Koneksi sesi, pengiriman pesan, dan peristiwa API akan muncul di sini."
          />
        ) : (
          <ul role="list" className="space-y-1">
            {entries.map((entry) => {
              const LevelIcon =
                LEVEL_ICON[entry.level as keyof typeof LEVEL_ICON] ?? Info
              const EventIcon = EVENT_ICON[entry.event] ?? Activity
              const tone =
                LEVEL_TONE[entry.level as keyof typeof LEVEL_TONE] ?? 'text-muted-foreground'

              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-[9px] px-2 py-2.5 transition-colors hover:bg-muted/30"
                >
                  <span
                    className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] border border-border bg-muted/40 text-muted-foreground"
                    aria-hidden
                  >
                    <EventIcon className="size-3.5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <LevelIcon className={cn('size-3 shrink-0', tone)} aria-hidden />
                      <span className="truncate text-s font-medium">
                        {entry.title}
                      </span>
                    </span>
                    {entry.detail ? (
                      <span className="mt-0.5 block truncate text-tiny text-muted-foreground">
                        {entry.detail}
                      </span>
                    ) : null}
                  </span>

                  <span className="shrink-0 whitespace-nowrap text-eyebrow text-muted-foreground/80">
                    {timeAgo(entry.createdAt)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
