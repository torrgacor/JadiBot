import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, Bot, Layers, Users } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { pingGateway } from '@/lib/engine/client'
import { getNanoOverview } from '@/lib/services/nano-service'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { StatusDot } from '@/components/ui/status-dot'
import { AdminUserActions } from '@/components/admin/user-actions'
import { AdminResetPassword } from '@/components/admin/reset-password'
import { formatDateTime, formatNumber, timeAgo } from '@/lib/utils/format'
import type { SessionStatus } from '@/types/enums'

export const metadata: Metadata = { title: 'Panel Admin' }
export const dynamic = 'force-dynamic'

/**
 * Admin overview.
 *
 * Platform-wide counts, the accounts themselves, and the health of the pieces
 * the platform depends on. Everything is counted from the database or probed
 * live — there are no placeholder figures.
 */
export default async function AdminPage() {
  const admin = await requireAdmin()

  const [userStats, sessionStats, messageCount, gateway, nano] = await Promise.all([
    db.user.groupBy({ by: ['status'], _count: { _all: true } }),
    db.whatsAppSession.groupBy({ by: ['status'], _count: { _all: true } }),
    db.message.count(),
    pingGateway(),
    getNanoOverview(),
  ])

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      _count: { select: { whatsappSessions: true } },
    },
  })

  const totalUsers = userStats.reduce((sum, row) => sum + (row._count?._all ?? 0), 0)
  const suspended = userStats.find((row) => row.status === 'SUSPENDED')?._count?._all ?? 0
  const totalSessions = sessionStats.reduce((sum, row) => sum + (row._count?._all ?? 0), 0)
  const connected = sessionStats.find((row) => row.status === 'CONNECTED')?._count?._all ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Admin"
        description={`Masuk sebagai ${admin.user.email}. Tampilan menyeluruh akun dan bot.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pengguna" value={totalUsers} icon={Users} tone="primary" />
        <StatCard
          label="Ditangguhkan"
          value={suspended}
          icon={Users}
          tone={suspended > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Bot"
          value={totalSessions}
          icon={Layers}
          tone="default"
          hint={`${connected} terhubung`}
        />
        <StatCard label="Pesan" value={messageCount} icon={Activity} tone="default" />
      </div>

      {/* ── system ───────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status sistem</CardTitle>
            <CardDescription>Pemeriksaan langsung, bukan nilai lama.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusRow
              label="Layanan WhatsApp"
              ok={gateway.online}
              detail={
                gateway.online
                  ? `${gateway.activeSessions ?? 0} sesi aktif · ${gateway.latencyMs}ms`
                  : 'tidak dapat dihubungi'
              }
            />
            <StatusRow
              label="Bot Nano"
              ok={nano.install.available && Boolean(nano.install.patched)}
              detail={
                nano.install.available
                  ? `${nano.install.name} ${nano.install.version} · ${nano.install.patched ? 'jembatan terpasang' : 'JEMBATAN HILANG'}`
                  : nano.install.reason ?? 'tidak ditemukan'
              }
            />
            <StatusRow
              label="Katalog perintah"
              ok={nano.totalCommands > 0}
              detail={`${formatNumber(nano.totalCommands)} perintah · ${formatNumber(nano.activePlugins)} plugin aktif`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rincian status bot</CardTitle>
            <CardDescription>Semua bot di platform menurut status siklus hidupnya.</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionStats.length === 0 ? (
              <p className="text-s text-muted-foreground">Belum ada bot yang dibuat.</p>
            ) : (
              <ul className="space-y-2.5">
                {sessionStats
                  .sort((a, b) => (b._count?._all ?? 0) - (a._count?._all ?? 0))
                  .map((row) => (
                    <li key={String(row.status)} className="flex items-center gap-3">
                      <StatusDot status={String(row.status) as SessionStatus} />
                      <span className="flex-1 text-s">{String(row.status)}</span>
                      <span className="text-s font-medium tabular-nums">
                        {row._count?._all ?? 0}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── users ────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Pengguna</CardTitle>
          <CardDescription>
            50 akun terbaru. Menangguhkan akun langsung mengeluarkannya dari semua perangkat.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {users.map((user) => (
              <li key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-mid font-medium">{user.name}</span>
                    {user.role !== 'USER' ? (
                      <Badge tone="primary" size="sm">
                        {user.role.replace('_', ' ').toLowerCase()}
                      </Badge>
                    ) : null}
                    {user.status !== 'ACTIVE' ? (
                      <Badge tone="danger" size="sm">
                        {user.status.toLowerCase()}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-tiny text-muted-foreground">
                    {user.email} · {user._count?.whatsappSessions ?? 0} bot ·{' '}
                    {user.lastLoginAt
                      ? `terakhir terlihat ${timeAgo(user.lastLoginAt)}`
                      : 'belum pernah masuk'}
                  </span>
                  <span className="block text-xs2 text-muted-foreground/80">
                    bergabung {formatDateTime(user.createdAt)}
                  </span>
                </span>

                {/* Nobody may suspend themselves from this screen. */}
                {user.id === admin.user.id ? (
                  <Badge tone="success" size="sm">
                    Anda
                  </Badge>
                ) : (
                  <div className="flex items-center gap-1">
                    <AdminResetPassword userId={user.id} email={user.email} />
                    <AdminUserActions userId={user.id} status={user.status} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-note text-muted-foreground">
        Mencari bot Anda sendiri? <Link href="/dashboard/bot" className="text-primary underline-offset-4 hover:underline">Buka Bot Saya</Link>.
      </p>
    </div>
  )
}

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-40 shrink-0 text-s text-muted-foreground">{label}</span>
      <Badge tone={ok ? 'success' : 'warning'} size="sm">
        {ok ? 'normal' : 'perlu perhatian'}
      </Badge>
      <span className="min-w-0 flex-1 truncate text-note text-muted-foreground" title={detail}>
        {detail}
      </span>
    </div>
  )
}
