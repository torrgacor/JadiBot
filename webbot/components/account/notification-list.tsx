'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import { timeAgo } from '@/lib/utils/format'

export interface NotificationRow {
  id: string
  title: string
  message: string
  severity: string
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}

const SEVERITY_TONE: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
}

/**
 * Notification list.
 *
 * Marking read writes to the database through the real endpoint, and the row is
 * only styled as read once the server confirms it.
 */
export function NotificationList({ initial }: { initial: NotificationRow[] }) {
  const [items, setItems] = useState(initial)
  const [busy, setBusy] = useState(false)

  const unread = items.filter((item) => !item.readAt).length

  async function markAll() {
    setBusy(true)
    try {
      await apiRequest('/api/account/notifications', {
        method: 'PATCH',
        body: { action: 'read-all' },
      })
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })))
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function markOne(id: string) {
    try {
      await apiRequest('/api/account/notifications', {
        method: 'PATCH',
        body: { action: 'read', id },
      })
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item
        )
      )
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-mid font-medium">Tidak ada notifikasi</p>
          <p className="mt-1 text-s text-muted-foreground">
            Sesi yang terputus, pesan gagal, dan peringatan keamanan akan muncul di sini.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-s text-muted-foreground">
          {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
        </p>
        {unread > 0 ? (
          <Button variant="secondary" size="sm" onClick={markAll} loading={busy}>
            <CheckCheck className="size-3.5" />
            Tandai semua dibaca
          </Button>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn('px-4 py-3.5 transition-colors sm:px-5', !item.readAt && 'bg-primary-soft/40')}
            >
              <div className="flex flex-wrap items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-mid font-medium">{item.title}</span>
                    <Badge tone={SEVERITY_TONE[item.severity] ?? 'neutral'} size="sm">
                      {item.severity}
                    </Badge>
                    {!item.readAt ? (
                      <Badge tone="primary" size="sm">
                        baru
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-s leading-relaxed text-muted-foreground">
                    {item.message}
                  </span>
                  <span className="mt-1 block text-xs2 text-muted-foreground/80">
                    {timeAgo(item.createdAt)}
                  </span>
                </span>

                <span className="flex items-center gap-1.5">
                  {item.actionUrl ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={item.actionUrl}>
                        <ExternalLink className="size-3.5" />
                        Buka
                      </Link>
                    </Button>
                  ) : null}
                  {!item.readAt ? (
                    <Button variant="ghost" size="sm" onClick={() => markOne(item.id)}>
                      Tandai dibaca
                    </Button>
                  ) : null}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
