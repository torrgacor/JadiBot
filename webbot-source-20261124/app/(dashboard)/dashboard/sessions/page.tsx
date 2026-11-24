import type { Metadata } from 'next'
import Link from 'next/link'
import { Layers, Plus, Smartphone, Users } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { listSessions } from '@/lib/services/session-service'
import { getUsage } from '@/lib/services/entitlements'
import { botAccessNotice, getBotAccess } from '@/lib/services/bot-access'
import { BotAccessNotice } from '@/components/billing/bot-access-notice'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { StatusDot } from '@/components/ui/status-dot'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MobileCard,
  MobileCardList,
  MobileField,
} from '@/components/ui/mobile-card-list'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table'
import { SessionActions } from '@/components/sessions/session-actions'
import { STATUS_LABELS, type SessionStatus } from '@/types/enums'
import { formatDateTime, formatNumber, timeAgo } from '@/lib/utils/format'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Sesi WhatsApp' }
export const dynamic = 'force-dynamic'

/**
 * Session list.
 *
 * Renders a table on desktop and a card list below `md`, because a six-column
 * table on a phone forces horizontal scrolling that the spec explicitly rules
 * out.
 */
export default async function SessionsPage() {
  const auth = await requireAuth()

  const [{ items: sessions }, connectedCount, contacts, unreadNotifications, usage, access] =
    await Promise.all([
      listSessions(auth.user.id, { pageSize: 50 }),
      db.whatsAppSession.count({
        where: { userId: auth.user.id, status: 'CONNECTED' },
      }),
      db.contact.count({ where: { userId: auth.user.id } }),
      db.notification.count({ where: { userId: auth.user.id, readAt: null } }),
      getUsage(auth.user.id),
      getBotAccess(auth.user.id),
    ])

  // Null while the account is entitled; otherwise every "Hubungkan" in the
  // action menus below is disabled and the reason is stated once at the top.
  const accessNotice = botAccessNotice(access)

  const unlinked = sessions.filter((session) =>
    ['LOGGED_OUT', 'DISCONNECTED', 'CREATED', 'ERROR', 'BANNED'].includes(session.status)
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sesi WhatsApp"
        description="Setiap sesi adalah koneksi WhatsApp tersendiri dengan kredensial dan siklus hidupnya sendiri."
        actions={
          <Button asChild>
            <Link href="/dashboard/sessions/new">
              <Plus className="size-4" />
              Tambah Sesi
            </Link>
          </Button>
        }
      />

      <BotAccessNotice data={accessNotice} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Sesi" value={sessions.length} icon={Layers} tone="primary" />
        <StatCard
          label="Terhubung"
          value={connectedCount}
          icon={Smartphone}
          tone={connectedCount > 0 ? 'success' : 'default'}
        />
        <StatCard label="Perlu Ditangani" value={unlinked} icon={Smartphone} tone="warning" />
      </div>

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Layers}
            title="Belum ada sesi WhatsApp"
            description="Buat sesi pertama Anda untuk menghubungkan nomor WhatsApp. Anda akan scan kode QR atau memakai kode pairing untuk menautkannya."
            action={
              <Button asChild>
                <Link href="/dashboard/sessions/new">
                  <Plus className="size-4" />
                  Buat sesi pertama
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* ── desktop table ─────────────────────────────────────────── */}
          <div className="hidden md:block">
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Sesi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nomor</TableHead>
                    <TableHead>Terakhir terhubung</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/sessions/${session.id}`}
                          className="flex items-center gap-3 transition-opacity hover:opacity-80"
                        >
                          <Avatar
                            src={session.profilePicUrl}
                            name={session.profileName ?? session.name}
                            size={34}
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-mid-lg font-medium">
                              {session.name}
                            </span>
                            <span className="block truncate text-tiny text-muted-foreground">
                              {session.description ?? 'Tanpa deskripsi'}
                            </span>
                          </span>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <StatusDot status={session.status as SessionStatus} />
                          <span className="text-s">
                            {STATUS_LABELS[session.status as SessionStatus] ?? session.status}
                          </span>
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-s text-muted-foreground">
                        {session.phoneNumber ?? '—'}
                      </TableCell>

                      <TableCell className="text-s text-muted-foreground">
                        {session.lastConnectedAt ? timeAgo(session.lastConnectedAt) : 'belum pernah'}
                      </TableCell>

                      <TableCell className="text-s text-muted-foreground">
                        {formatDateTime(session.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/sessions/${session.id}`}>Buka</Link>
                          </Button>
                          <SessionActions
                            sessionId={session.id}
                            sessionName={session.name}
                            status={session.status as SessionStatus}
                            locked={accessNotice !== null}
                            lockedMessage={accessNotice?.message}
                            compact
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {sessions.length === 0 ? (
                    <TableEmpty colSpan={6}>
                      <span className="text-mid text-muted-foreground">
Tidak ada sesi yang cocok dengan filter Anda.
                      </span>
                    </TableEmpty>
                  ) : null}
                </TableBody>
              </Table>
            </TableWrapper>
          </div>

          {/* ── mobile cards ──────────────────────────────────────────── */}
          <MobileCardList className="md:hidden">
            {sessions.map((session) => (
              <MobileCard key={session.id}>
                <div className="flex items-start gap-3">
                  <Avatar
                    src={session.profilePicUrl}
                    name={session.profileName ?? session.name}
                    size={38}
                  />

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/sessions/${session.id}`}
                      className="block truncate text-body font-medium"
                    >
                      {session.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusDot status={session.status as SessionStatus} />
                      <Badge tone="neutral" size="sm">
                        {STATUS_LABELS[session.status as SessionStatus] ?? session.status}
                      </Badge>
                    </div>
                  </div>

                  <SessionActions
                    sessionId={session.id}
                    sessionName={session.name}
                    status={session.status as SessionStatus}
                    locked={accessNotice !== null}
                    lockedMessage={accessNotice?.message}
                    compact
                  />
                </div>

                <dl className="mt-3 border-t border-border pt-2">
                  <MobileField label="Nomor">
                    <span className="font-mono">{session.phoneNumber ?? '—'}</span>
                  </MobileField>
                  <MobileField label="Terakhir terhubung">
                    {session.lastConnectedAt ? timeAgo(session.lastConnectedAt) : 'belum pernah'}
                  </MobileField>
                  <MobileField label="Pesan">
                    {session.messagesSent} terkirim · {session.messagesReceived} diterima
                  </MobileField>
                </dl>
              </MobileCard>
            ))}
          </MobileCardList>
        </>
      )}

      {/*
        Quota meters close the page: the session list is what this page is for,
        and the limits read better as a summary underneath it than as a wall
        above it.
      */}
      <Card>
        <CardHeader>
          <CardTitle>Pemakaian paket</CardTitle>
          <CardDescription>
            Penghitung 24 jam terakhir, berlaku sama di panel maupun di server.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <UsageBar
            label="Pesan hari ini"
            used={usage.messagesToday}
            limit={usage.messagesLimit}
          />
          <UsageBar
            label="Permintaan API hari ini"
            used={usage.apiRequestsToday}
            limit={usage.apiLimit}
          />
          <div className="flex items-center gap-2 text-s text-muted-foreground">
            <Users className="size-3.5" aria-hidden />
            {formatNumber(contacts)} kontak tersimpan
          </div>
          <Link
            href="/dashboard/account/notifications"
            className="flex items-center gap-2 text-s text-muted-foreground transition-colors hover:text-foreground"
          >
            <Badge tone={unreadNotifications > 0 ? 'primary' : 'neutral'} size="sm">
              {unreadNotifications}
            </Badge>
            notifikasi belum dibaca
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

/** Usage meter. A -1 limit renders as unlimited with a full-width bar. */
function UsageBar({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const unlimited = limit === -1
  const percent = unlimited ? 0 : Math.min(100, (used / Math.max(1, limit)) * 100)
  const tone =
    unlimited || percent < 75
      ? 'bg-primary'
      : percent < 95
        ? 'bg-warning'
        : 'bg-danger'

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-s text-muted-foreground">{label}</span>
        <span className="text-s font-medium tabular-nums">
          {formatNumber(used)}
          <span className="text-muted-foreground">
            {' / '}
            {unlimited ? 'tanpa batas' : formatNumber(limit)}
          </span>
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={
            unlimited
              ? 'h-full w-full bg-primary/30'
              : `${tone} h-full rounded-full transition-[width] duration-500`
          }
          style={unlimited ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
