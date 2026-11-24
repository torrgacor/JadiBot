import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/ui/page-header'
import { NotificationList } from '@/components/account/notification-list'

export const metadata: Metadata = { title: 'Notifikasi' }
export const dynamic = 'force-dynamic'

/** Notification centre. Rows come from the same table the topbar bell reads. */
export default async function NotificationsPage() {
  const { user } = await requireAuth()

  const rows = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Peristiwa sesi, pesan, dan keamanan untuk akun Anda."
      />

      <NotificationList
        initial={rows.map((row) => ({
          id: row.id,
          title: row.title,
          message: row.message,
          severity: row.severity,
          actionUrl: row.actionUrl ?? null,
          readAt: row.readAt ? row.readAt.toISOString() : null,
          createdAt: row.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
