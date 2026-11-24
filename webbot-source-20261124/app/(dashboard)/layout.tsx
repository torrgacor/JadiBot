import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/auth/session'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import type { UserRole } from '@/types/enums'

/**
 * Dashboard layout.
 *
 * Guards every child route by redirecting unauthenticated visitors, and
 * server-renders the user + notifications so the shell paints correctly on
 * first load instead of popping in.
 */
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  if (!auth) redirect('/login')

  const { user } = auth

  const [notifications, unreadCount, subscription] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        title: true,
        message: true,
        severity: true,
        actionUrl: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: { select: { name: true } } },
    }),
  ])

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role as UserRole,
        avatarUrl: user.avatarUrl ?? null,
        planName: subscription?.plan?.name ?? null,
      }}
      notifications={notifications.map((item) => ({
        ...item,
        actionUrl: item.actionUrl ?? null,
        createdAt: item.createdAt.toISOString(),
        readAt: item.readAt?.toISOString() ?? null,
      }))}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  )
}
