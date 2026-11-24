import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Activity, Bot, Info, MessageSquare, Settings2, Smartphone } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { getLiveState } from '@/lib/services/session-service'
import { botAccessNotice, getBotAccess } from '@/lib/services/bot-access'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { StatusDot } from '@/components/ui/status-dot'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConnectPanel } from '@/components/sessions/connect-panel'
import { LinkingProgress } from '@/components/sessions/linking-progress'
import { SessionActions } from '@/components/sessions/session-actions'
import { STATUS_LABELS, type SessionStatus } from '@/types/enums'
import { formatDateTime, formatDuration, timeAgo } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const auth = await requireAuth().catch(() => null)
  const { id } = await params

  /*
    An authenticated request only ever describes the caller's own session. A
    request with no session is a crawler building a link preview, and it looks up
    the row unscoped — because the preview image rendered beside this title is
    already built from that same row without authentication (see
    `opengraph-image.tsx`). Keeping ownership here would leave the preview saying
    "Sesi" next to a card that names the bot.
  */
  const session = await db.whatsAppSession
    .findFirst({
      where: auth ? { id, userId: auth.user.id } : { id },
      select: { name: true },
    })
    .catch(() => null)

  const name = session?.name

  return {
    title: name ?? 'Sesi',
    /*
      The root layout pins an `openGraph.title`, and that is inherited by every
      route that does not override it — which would title the preview with the
      brand while the card beside it names the bot. Only the title is set here;
      the image comes from `opengraph-image.tsx`.
    */
    ...(name ? { openGraph: { title: `${name} · NANO GATEWAY` } } : {}),
  }
}

/**
 * Session detail.
 *
 * Combines the stored configuration with live engine state. When the gateway is
 * unreachable the page still renders from the database and says so, instead of
 * erroring out — the user's session data is not lost just because the engine is
 * restarting.
 */
export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const auth = await requireAuth()
  const { id } = await params

  let data
  try {
    data = await getLiveState(auth.user.id, id)
  } catch {
    notFound()
  }

  // Null while the account is entitled; otherwise QR and pairing are replaced by
  // the reason, and connecting is disabled in the action menu.
  const accessNotice = botAccessNotice(await getBotAccess(auth.user.id))

  const { session, live, engineOnline } = data

  const [recentMessages, recentActivity] = await Promise.all([
    db.message.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        direction: true,
        type: true,
        recipient: true,
        body: true,
        status: true,
        createdAt: true,
      },
    }),
    db.activityLog.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, event: true, title: true, detail: true, level: true, createdAt: true },
    }),
  ])

  // The engine is authoritative for live state; fall back to the stored row.
  const status = (live?.status ?? session.status) as SessionStatus
  const statusMessage = live?.statusMessage ?? session.statusMessage
  const phoneNumber = live?.phoneNumber ?? session.phoneNumber
  const profileName = live?.profileName ?? session.profileName
  const profilePicUrl = live?.profilePicUrl ?? session.profilePicUrl

  const connectedSince = live?.connectedSince ?? session.connectedSince?.toISOString() ?? null
  const uptimeMs = connectedSince ? Date.now() - new Date(connectedSince).getTime() : 0

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: 'Beranda', href: '/dashboard' },
          { label: 'Sesi', href: '/dashboard/sessions' },
          { label: session.name },
        ]}
        title={session.name}
        description={session.description ?? 'Sesi WhatsApp'}
        actions={
          <SessionActions
            sessionId={session.id}
            sessionName={session.name}
            status={status}
            locked={accessNotice !== null}
            lockedMessage={accessNotice?.message}
          />
        }
      />

      {!engineOnline ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-danger/30 bg-danger/10 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="text-mid font-medium text-danger">
              Tidak dapat terhubung ke layanan
            </p>
            <p className="mt-0.5 text-note leading-relaxed text-danger/90">
              Status langsung dan kode QR tidak tersedia saat ini. Detail di bawah berasal dari
              status terakhir yang diketahui.
            </p>
          </div>
        </div>
      ) : null}

      {/*
        Status and uptime are text, not numbers, so they get their own tiles
        rather than being forced into StatCard (which animates a numeric value).
      */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="text-note font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <StatusDot status={status} />
          </div>
          <p
            className={
              status === 'CONNECTED'
                ? 'mt-3 text-lg font-semibold text-success'
                : ['BANNED', 'ERROR'].includes(status)
                  ? 'mt-3 text-lg font-semibold text-danger'
                  : 'mt-3 text-lg font-semibold text-warning'
            }
          >
            {STATUS_LABELS[status] ?? status}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {phoneNumber ?? 'Belum ada nomor tersambung'}
          </p>
        </Card>

        <StatCard
          label="Pesan Terkirim"
          value={session.messagesSent}
          icon={MessageSquare}
          hint="Sepanjang usia sesi ini"
        />

        <StatCard
          label="Pesan Diterima"
          value={session.messagesReceived}
          icon={MessageSquare}
          hint="Pesan masuk yang tercatat"
        />

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="text-note font-medium uppercase tracking-wide text-muted-foreground">
              Uptime
            </span>
            <span
              className="grid size-8 place-items-center rounded-[9px] border border-border bg-muted/50 text-muted-foreground"
              aria-hidden
            >
              <Activity className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
            {connectedSince ? formatDuration(uptimeMs) : '—'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {connectedSince ? `sejak ${formatDateTime(connectedSince)}` : 'belum terhubung'}
          </p>
        </Card>
      </div>

      {/* ── identity + connect ───────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Akun</CardTitle>
            <CardDescription>Profil yang dilaporkan WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3.5">
              <Avatar src={profilePicUrl} name={profileName ?? session.name} size={48} />
              <div className="min-w-0">
                <p className="truncate text-body font-medium">
                  {profileName ?? 'Belum tertaut'}
                </p>
                <p className="truncate font-mono text-note text-muted-foreground">
                  {phoneNumber ?? 'Belum ada nomor tersambung'}
                </p>
              </div>
            </div>

            {/* The status itself is the tile above and the connect panel beside
                this card; only the engine's own message is worth repeating. */}
            {statusMessage ? (
              <p className="rounded-[10px] border border-border bg-muted/25 px-3.5 py-2.5 text-s leading-relaxed text-muted-foreground">
                {statusMessage}
              </p>
            ) : null}

            <dl className="space-y-2.5 border-t border-border pt-4 text-s">
              <Row label="ID sesi" value={<span className="font-mono">{session.id}</span>} />
              <Row label="Platform" value={live?.platform ?? session.platform ?? '—'} />
              <Row
                label="Terakhir terhubung"
                value={
                  session.lastConnectedAt ? formatDateTime(session.lastConnectedAt) : 'belum pernah'
                }
              />
              <Row label="Dibuat" value={formatDateTime(session.createdAt)} />
            </dl>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Badge tone={session.autoReconnect ? 'success' : 'neutral'} size="sm">
                sambung ulang otomatis {session.autoReconnect ? 'aktif' : 'mati'}
              </Badge>
              <Badge tone={session.alwaysOnline ? 'primary' : 'neutral'} size="sm">
                selalu online {session.alwaysOnline ? 'aktif' : 'mati'}
              </Badge>
              <Badge tone="neutral" size="sm">
                jeda {session.defaultDelayMs}ms
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {status !== 'CONNECTED' ? (
            <Card>
              <CardContent className="pt-5">
                <LinkingProgress
                  sessionId={session.id}
                  initialStatus={status}
                  hasNumber={Boolean(phoneNumber)}
                />

                <div className="mt-4 border-t border-border pt-4">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/dashboard/sessions/${session.id}/number`}>
                      <Smartphone className="size-4" />
                      {phoneNumber ? 'Ubah nomor bot' : 'Atur nomor bot'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

        <ConnectPanel
          sessionId={session.id}
          status={status}
          statusMessage={statusMessage ?? null}
          initialQr={null}
          botNumber={phoneNumber}
          notice={accessNotice}
        />
        </div>
      </div>

      {/* ── history + activity ───────────────────────────────────────── */}
      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">
            <MessageSquare />
            Pesan terbaru
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity />
            Log aktivitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardContent className="pt-5">
              {recentMessages.length === 0 ? (
                <EmptyState
                  compact
                  icon={MessageSquare}
                  title="Belum ada pesan"
                  description="Pesan yang dikirim dan diterima pada sesi ini akan muncul di sini. Mengirim dari panel belum tersedia; bot menjawab perintah yang masuk lewat WhatsApp."
                  action={
                    <Button asChild size="sm" variant="secondary">
                      <Link href="/dashboard/bot/logs">Lihat log bot</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y divide-border">
                  {recentMessages.map((message) => (
                    <li key={message.id} className="flex items-start gap-3 py-3">
                      <span
                        className={
                          message.direction === 'OUTBOUND'
                            ? 'mt-0.5 rounded-full border border-primary/25 bg-primary-soft px-2 py-0.5 text-label font-medium text-primary'
                            : 'mt-0.5 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-label font-medium text-muted-foreground'
                        }
                      >
                        {message.direction === 'OUTBOUND' ? 'KELUAR' : 'MASUK'}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-note text-muted-foreground">
                          {message.recipient}
                        </span>
                        <span className="mt-0.5 block truncate text-mid">
                          {message.body ?? `(${message.type})`}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span className="block text-xs2 text-muted-foreground">
                          {message.status}
                        </span>
                        <span className="block text-eyebrow text-muted-foreground/80">
                          {timeAgo(message.createdAt)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-5">
              {recentActivity.length === 0 ? (
                <EmptyState
                  compact
                  icon={Activity}
                  title="Belum ada aktivitas"
                  description="Peristiwa siklus hidup sesi ini akan muncul di sini."
                />
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3">
                      <span
                        className={
                          entry.level === 'error'
                            ? 'mt-1.5 size-1.5 shrink-0 rounded-full bg-danger'
                            : entry.level === 'warning'
                              ? 'mt-1.5 size-1.5 shrink-0 rounded-full bg-warning'
                              : entry.level === 'success'
                                ? 'mt-1.5 size-1.5 shrink-0 rounded-full bg-success'
                                : 'mt-1.5 size-1.5 shrink-0 rounded-full bg-info'
                        }
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-mid font-medium">{entry.title}</span>
                        {entry.detail ? (
                          <span className="mt-0.5 block text-note text-muted-foreground">
                            {entry.detail}
                          </span>
                        ) : null}
                        <span className="mt-0.5 block font-mono text-eyebrow text-muted-foreground/80">
                          {entry.event}
                        </span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-eyebrow text-muted-foreground">
                        {timeAgo(entry.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── link out ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/bot/settings">
            <Settings2 className="size-4" />
            Pengaturan grup &amp; bot
          </Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/bot">
            <Bot className="size-4" />
            Ringkasan bot
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{value}</dd>
    </div>
  )
}
