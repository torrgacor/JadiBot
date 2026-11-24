import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Bot,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Smartphone,
} from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { getBotPageData } from '@/lib/services/bot-service'
import { getDashboardData } from '@/lib/services/dashboard-stats'
import { botAccessNotice, getBotAccess } from '@/lib/services/bot-access'
import { BotAccessNotice } from '@/components/billing/bot-access-notice'
import { db } from '@/lib/db'
import { pingGateway } from '@/lib/engine/client'
import { BotControls } from '@/components/bot/bot-controls'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { StatusDot } from '@/components/ui/status-dot'
import { EmptyState } from '@/components/ui/empty-state'
import { ConnectPanel } from '@/components/sessions/connect-panel'
import { MessageChartLazy } from '@/components/dashboard/message-chart-lazy'
import { FeatureGrid } from '@/components/dashboard/feature-grid'
import { STATUS_LABELS, type SessionStatus } from '@/types/enums'
import { formatDateTime, formatNumber, timeAgo } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Bot Saya' }
export const dynamic = 'force-dynamic'

/**
 * Bot overview.
 *
 * The account's single Nano bot: how to link it, what it is doing right now,
 * and what it knows. Every number comes from the bot itself — its config file,
 * its plugin folder, its database — so this page is never a mock-up.
 */
export default async function BotPage() {
  const { user } = await requireAuth()
  const [{ session, live, engineOffline, engineLoaded, nano, botData }, access] = await Promise.all([
    getBotPageData(user.id),
    getBotAccess(user.id),
  ])

  // Null while the account is entitled; otherwise the reason the controls below
  // are disabled and the server would refuse a connect.
  const accessNotice = botAccessNotice(access)

  if (!session) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bot Saya"
          description="Hubungkan nomor WhatsApp ke bot Nano Anda dan kelola semuanya dari sini."
        />

        <Card>
          <EmptyState
            icon={Bot}
            title="Belum ada bot"
            description="Buat sesi, lalu hubungkan nomor WhatsApp Anda dengan kode pairing. Setelah itu bot langsung bekerja."
            action={
              <Button asChild>
                <Link href="/dashboard/sessions/new">
                  <Plus className="size-4" />
                  Buat bot Anda
                </Link>
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  // Prefer the engine's live view; fall back to the last state we persisted.
  const status = (live?.status ?? session.status) as SessionStatus
  const statusMessage = live?.statusMessage ?? session.statusMessage ?? null
  const connected = status === 'CONNECTED'

  const botName = nano.config?.botName ?? nano.config?.botAlias ?? null

  // ── real numbers for the headline row ──────────────────────────────────
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [health, messagesToday, dashboard] = await Promise.all([
    pingGateway(),
    db.message.count({
      where: { userId: user.id, direction: 'OUTBOUND', createdAt: { gte: startOfToday } },
    }),
    // The same 7-day message buckets the Beranda chart used to render. This
    // page owns message volume now, so the chart moved here with the numbers.
    getDashboardData(user.id, { days: 7 }),
  ])

  const groupsConfigured = botData?.groupSettings.length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bot Saya"
        description={`Bot Nano "${session.name}" — nomor tersambung, status langsung, dan semua yang sudah dipelajarinya.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/*
              The controls carry no notice of their own here: the banner just
              below the header states the reason once, for the whole page.
            */}
            <BotControls
              sessionId={session.id}
              status={status}
              engineLoaded={engineLoaded}
              size="sm"
            />
            {/*
              Only the controls and the session link sit here. Settings and the
              log viewer are one click away in the sidebar, so repeating them as
              header buttons only crowded the top of the page.
            */}
            <Button asChild variant="secondary" size="sm">
              <Link href={`/dashboard/sessions/${session.id}`}>Detail sesi</Link>
            </Button>
          </div>
        }
      />

      {/* No active plan: said once, before the controls that are disabled. */}
      <BotAccessNotice data={accessNotice} />

      {engineOffline ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div className="text-s">
            <p className="font-medium text-foreground">Tidak dapat terhubung ke layanan.</p>
            <p className="mt-0.5 text-muted-foreground">
              Angka di bawah hanya status terakhir yang tercatat. Coba lagi sebentar lagi
              untuk mengendalikan bot.
            </p>
          </div>
        </div>
      ) : null}

      {!engineLoaded && !engineOffline ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div className="text-s">
            <p className="font-medium text-foreground">
              Sesi ini sedang tidak aktif
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Sistem baru saja dimulai ulang, jadi status di bawah hanya catatan terakhir.
              Tekan <span className="font-medium">Jalankan bot</span>{' '}
              untuk memuat sesi ini kembali.
            </p>
          </div>
        </div>
      ) : null}

      {/*
        ── headline numbers ──────────────────────────────────────────────────
        Four cards, one row. User, command and group counts used to be repeated
        here as three more cards; they live in the "Data bot" card and the
        "Kemampuan bot" grid below instead, so no figure is stated twice on one
        screen.
      */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          icon={Smartphone}
          label="Status bot"
          tone={
            connected
              ? 'success'
              : status === 'ERROR' || status === 'BANNED'
                ? 'danger'
                : 'warning'
          }
          hint={statusMessage}
        >
          <span className="flex items-center gap-2">
            <StatusDot status={status} />
            <span className="text-xl font-semibold tracking-tight">
              {STATUS_LABELS[status] ?? status}
            </span>
          </span>
        </Tile>

        <Tile
          icon={MessageSquare}
          label="WhatsApp"
          tone={live?.phoneNumber ?? session.phoneNumber ? 'primary' : 'default'}
        >
          <span className="block truncate font-mono text-lead font-semibold tracking-tight">
            {live?.phoneNumber ?? session.phoneNumber ?? 'Belum tersambung'}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {live?.platform ? (
              <Badge tone="outline" size="sm">
                {live.platform}
              </Badge>
            ) : null}
          </span>
        </Tile>

        <Tile
          icon={Clock}
          label="Uptime sistem"
          tone={health.online ? 'success' : 'danger'}
          hint={health.online ? undefined : 'sistem tidak dapat dihubungi'}
        >
          <span className="block text-xl font-semibold tracking-tight">
            {health.online ? formatUptime(health.uptimeSeconds ?? 0) : 'mati'}
          </span>
          {health.online ? (
            <span className="mt-1.5 block text-note text-muted-foreground">
              {health.activeSessions ?? 0} sesi dimuat · {health.latencyMs ?? 0}ms
            </span>
          ) : null}
        </Tile>

        <StatCard
          label="Pesan hari ini"
          value={messagesToday}
          icon={Send}
          tone="primary"
          hint="keluar, sejak tengah malam"
        />
      </div>

      {/* ── connect ─────────────────────────────────────────────────────── */}
      {!connected ? (
        <ConnectPanel
          sessionId={session.id}
          status={status}
          statusMessage={statusMessage}
          // The panel fetches its own QR on the QR tab; nothing is generated here.
          initialQr={null}
          notice={accessNotice}
        />
      ) : null}

      {/* ── message volume ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Volume pesan</CardTitle>
          <CardDescription>
            Jumlah pesan harian selama 7 hari terakhir, dipecah menurut arah dan hasil pengiriman.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MessageChartLazy data={dashboard.series} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── identity ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Identitas bot</CardTitle>
            <CardDescription>
              Dibaca langsung dari konfigurasi bot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-mid">
              <Row label="Nama bot" value={botName ?? '—'} />
              <Row label="Alias" value={nano.config?.botAlias ?? '—'} />
              <Row label="Versi" value={nano.config?.botVersion ?? '—'} mono />
              <Row label="Mode" value={nano.config?.botMode ?? '—'} />
              <Row label="Owner" value={nano.config?.ownerName ?? '—'} />
              <Row label="Prefix" value={nano.config?.defaultPrefix ?? '—'} mono />
              <Row label="Zona waktu" value={nano.config?.timezone ?? '—'} />
              <Row
                label="Nomor tersambung"
                value={live?.phoneNumber ?? session.phoneNumber ?? 'belum tersambung'}
                mono
              />
            </dl>

            {nano.configError ? (
              <p className="rounded-[10px] border border-warning/30 bg-warning/8 px-3 py-2 text-note text-muted-foreground">
                Gagal membaca konfigurasi bot: {nano.configError}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* ── connection ───────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            {/* Status itself is the "Status bot" tile above — not repeated here. */}
            <div>
              <CardTitle>Koneksi</CardTitle>
              <CardDescription>Status langsung proses bot.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-mid">
              <Row
                label="Terhubung sejak"
                value={
                  live?.connectedSince
                    ? `${timeAgo(live.connectedSince)} (${formatDateTime(live.connectedSince)})`
                    : '—'
                }
              />
              <Row
                label="Terakhir terhubung"
                value={
                  live?.lastConnectedAt
                    ? formatDateTime(live.lastConnectedAt)
                    : session.lastConnectedAt
                      ? formatDateTime(session.lastConnectedAt)
                      : 'belum pernah'
                }
              />
              <Row label="Pesan terkirim" value={formatNumber(live?.messagesSent ?? 0)} />
              <Row label="Pesan diterima" value={formatNumber(live?.messagesReceived ?? 0)} />
              <Row
                label="Layanan"
                value={engineOffline ? 'mati' : 'hidup'}
                tone={engineOffline ? 'warning' : 'success'}
              />
            </dl>

            {statusMessage ? (
              <p className="rounded-[10px] border border-border bg-muted/30 px-3 py-2 text-note text-muted-foreground">
                {statusMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* ── engine installation ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Bot Nano</CardTitle>
            <CardDescription>
              Instalasi yang dipakai bersama oleh setiap bot di platform ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {nano.install.available ? (
              <>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-mid">
                  <Row label="Paket" value={nano.install.name ?? '—'} mono />
                  <Row label="Versi" value={nano.install.version ?? '—'} mono />
                  <Row label="Plugin ditemukan" value={formatNumber(nano.totalPlugins)} />
                  <Row label="Plugin aktif" value={formatNumber(nano.activePlugins)} />
                </dl>
                {nano.install.patched ? (
                  <p className="text-note text-muted-foreground">
                    Integrasi bot sudah aktif. Setiap bot punya kredensial dan datanya sendiri,
                    dan pengaturan di panel langsung dipakai bot.
                  </p>
                ) : (
                  <div className="flex items-start gap-2 rounded-[10px] border border-warning/30 bg-warning/8 px-3 py-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
                    <p className="text-note text-muted-foreground">
                      Integrasi bot belum siap, jadi bot belum bisa dikendalikan dari panel.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-2 rounded-[10px] border border-warning/30 bg-warning/8 px-3 py-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
                <div className="text-note text-muted-foreground">
                  <p className="font-medium text-foreground">Bot Nano tidak ditemukan.</p>
                  <p className="mt-0.5">{nano.install.reason}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── bot data ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Data bot</CardTitle>
                <CardDescription>
                  Dibaca dari data milik bot sendiri, bukan salinannya.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/data">Buka</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {botData?.initialized ? (
              <>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-mid">
                  <Row label="Pengguna terdaftar" value={formatNumber(botData.stats.users)} />
                  <Row label="Pengguna premium" value={formatNumber(botData.stats.premiumUsers)} />
                  <Row label="Owner" value={formatNumber(botData.stats.owners)} />
                  <Row label="Prefix khusus" value={formatNumber(botData.stats.customPrefixes)} />
                  <Row label="Grup dikonfigurasi" value={formatNumber(groupsConfigured)} />
                  <Row label="Jadwal grup" value={formatNumber(botData.stats.groupSchedules)} />
                  <Row label="Jadwal aktif" value={formatNumber(botData.stats.activeSchedules)} />
                </dl>

                <p className="mt-3 text-note leading-relaxed text-muted-foreground">
                  {formatNumber(botData.stats.groupsWithWelcome)} grup memakai welcome ·{' '}
                  {formatNumber(botData.stats.groupsWithAntilink)} memakai antilink.
                </p>
              </>
            ) : (
              <p className="text-s text-muted-foreground">
                Bot belum menyimpan datanya. Data terbentuk saat bot pertama kali berjalan
                setelah tertaut, dan halaman ini akan terisi otomatis.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── feature map ────────────────────────────────────────────────── */}
      <FeatureGrid
        categories={nano.categories}
        totalCommands={nano.totalCommands}
        activePlugins={nano.activePlugins}
      />
    </div>
  )
}

/**
 * Non-numeric headline tile.
 *
 * `StatCard` animates a number, so statuses, phone numbers and durations — which
 * are strings — get this tile instead. Same visual language, honest value.
 */
function Tile({
  icon: Icon,
  label,
  tone = 'default',
  hint,
  children,
}: {
  icon: typeof Smartphone
  label: string
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  hint?: string | null
  children: ReactNode
}) {
  const toneClass = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }[tone]

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-note font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span
          className={[
            'grid size-8 place-items-center rounded-[9px] border border-border bg-muted/50',
            toneClass,
          ].join(' ')}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="mt-3">{children}</div>

      {hint ? (
        <p className="mt-1.5 line-clamp-2 text-note text-muted-foreground" title={hint}>
          {hint}
        </p>
      ) : null}
    </Card>
  )
}

/** Compact duration for the gateway uptime tile. */
function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return `${hours}h ${rest}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

/** Small label/value pair used by the definition lists above. */
function Row({
  label,
  value,
  mono,
  tone,
}: {
  label: string
  value: string
  mono?: boolean
  tone?: 'success' | 'warning'
}) {
  return (
    <div className="min-w-0">
      <dt className="text-tiny uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={[
          'mt-0.5 truncate',
          mono ? 'font-mono text-note' : '',
          tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}
