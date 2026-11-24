import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, AlertTriangle, Database, MessageSquare, Plus, Send } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { getDashboardData, trend } from '@/lib/services/dashboard-stats'
import { getBotPageData } from '@/lib/services/bot-service'
import { getUsage, quotaLabel } from '@/lib/services/entitlements'
import { getPublicPlans } from '@/lib/services/plans'
import { getTrialStatus } from '@/lib/services/trial'
import { getRenewalStatus } from '@/lib/services/renewal'
import { botAccessNotice, getBotAccess } from '@/lib/services/bot-access'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Collapsible } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ActivityFeed, SystemStatusPanel } from '@/components/dashboard/system-status'
import { AiBackendStatusPanel } from '@/components/dashboard/ai-backend-status'
import { BotHero } from '@/components/dashboard/bot-hero'
import { BotControls } from '@/components/bot/bot-controls'
import { WhatsAppConnection } from '@/components/dashboard/whatsapp-connection'
import { BotControlPanel } from '@/components/dashboard/bot-control-panel'
import { TrialStatusPanel } from '@/components/billing/trial-status-panel'
import { PlanStatusPanel } from '@/components/billing/plan-status-panel'
import { BotAccessNotice } from '@/components/billing/bot-access-notice'
import { formatNumber } from '@/lib/utils/format'
import { Reveal } from '@/components/marketing/reveal'
import type { SessionStatus } from '@/types/enums'

export const metadata: Metadata = { title: 'Beranda' }
export const dynamic = 'force-dynamic'

/**
 * Dashboard home.
 *
 * Deliberately short: the page answers "is my bot up, how did it do today, and
 * what happened last" and nothing else. Everything deeper lives on the page that
 * owns it — the plugin map and the message-volume chart on Bot Saya, the log on
 * Log Bot, the quota meters on Sesi WhatsApp — so no figure is stated twice on
 * one screen. Every value here is a real aggregate for the signed-in user.
 *
 * The trial banner reads its deadline from the subscription row — and reading it
 * is what applies an expiry that has already passed, so the panel is honest even
 * if no sweep has run yet.
 */
export default async function DashboardHomePage() {
  const auth = await requireAuth()
  const [data, usage, bot, trial, plans, access, renewal] = await Promise.all([
    getDashboardData(auth.user.id, { days: 7 }),
    getUsage(auth.user.id),
    getBotPageData(auth.user.id),
    getTrialStatus(auth.user.id),
    getPublicPlans(),
    getBotAccess(auth.user.id),
    // Paying accounts get the remaining days on their own panel; the trial
    // panel renders nothing for them, so the two never stack.
    getRenewalStatus(auth.user.id),
  ])

  const trialPlan = plans.find((plan) => plan.isTrial) ?? null
  const paidPlans = plans.filter((plan) => !plan.isTrial)

  // Null while the account is entitled; otherwise the reason the bot controls
  // below are disabled.
  const accessNotice = botAccessNotice(access)

  const { totals, activity, system } = data
  const messageTrend = trend(totals.messagesToday, totals.messagesYesterday)

  const botStatus = (bot.live?.status ?? bot.session?.status ?? 'CREATED') as SessionStatus
  const connectedSince = bot.live?.connectedSince ?? bot.session?.connectedSince ?? null
  const uptimeMs = connectedSince
    ? Math.max(0, Date.now() - new Date(connectedSince).getTime())
    : null

  // `botName` comes from the bot's own configuration file when it is readable,
  // so the poster shows the name the bot actually uses in chat.
  const botName =
    bot.nano.config?.botName ?? bot.session?.name ?? bot.nano.config?.botAlias ?? 'Bot Nano'

  return (
    <div className="space-y-6">
      <BotHero
        name={botName}
        number={bot.live?.phoneNumber ?? bot.session?.phoneNumber ?? null}
        status={botStatus}
        uptimeMs={botStatus === 'CONNECTED' ? uptimeMs : null}
        platform={bot.live?.platform ?? bot.session?.platform ?? null}
        engineOffline={bot.engineOffline}
        stats={[
          { label: 'Perintah', value: formatNumber(bot.nano.totalCommands) },
          { label: 'Plugin aktif', value: formatNumber(bot.nano.activePlugins) },
          {
            label: 'Pengguna bot',
            value: formatNumber(bot.botData?.stats.users ?? 0),
          },
          { label: 'Grup', value: formatNumber(bot.botData?.groupSettings.length ?? 0) },
        ]}
        controls={
          bot.session ? (
            <BotControls
              sessionId={bot.session.id}
              status={botStatus}
              engineLoaded={bot.engineLoaded}
              notice={accessNotice}
              size="sm"
            />
          ) : undefined
        }
      />

      <PageHeader
        title={`Selamat datang, ${auth.user.name.split(' ')[0]}`}
        description="Ringkasan langsung bot Nano Anda, nomor yang tersambung, dan pesan yang sudah ditangani."
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/bot">
                <Send className="size-4" />
                Buka bot
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/sessions/new">
                <Plus className="size-4" />
                Sesi baru
              </Link>
            </Button>
          </>
        }
      />

      {!auth.user.emailVerifiedAt ? (
        <div className="flex flex-col gap-3 rounded-[16px] border border-warning/30 bg-warning/10 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <div>
              <p className="text-mid font-medium text-warning">
                Alamat email Anda belum diverifikasi
              </p>
              <p className="mt-0.5 text-note leading-relaxed text-warning/90">
                Verifikasi sekarang agar akun Anda bisa dipulihkan bila lupa kata sandi.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/verify-email">Verifikasi email</Link>
          </Button>
        </div>
      ) : null}

      {/* ── plan status: the first thing that changes what you can do ── */}
      {renewal || trial.state !== 'CONVERTED' ? (
        <Collapsible
          title="Status paket & akses"
          defaultOpen={accessNotice !== null}
          hint={accessNotice ? 'Perlu perhatian' : 'Lihat detail'}
          openHint="Tutup"
        >
          <PlanStatusPanel status={renewal} compact />
          <TrialStatusPanel status={trial} plans={paidPlans} trialFeatures={trialPlan?.features ?? []} />
        </Collapsible>
      ) : null}

      {/* ── today's numbers ──────────────────────────────────────────── */}
      <Reveal as="div" className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatCard
          label="Pesan Hari Ini"
          value={totals.messagesToday}
          icon={MessageSquare}
          trend={messageTrend}
          tone="primary"
          hint={`dari batas harian ${quotaLabel(usage.messagesLimit)}`}
          spark={totals.messagesTrend.some((n) => n > 0) ? totals.messagesTrend : undefined}
          animate
        />
        <StatCard
          label="Tingkat Keberhasilan"
          value={totals.successRate}
          suffix="%"
          decimals={1}
          icon={Activity}
          tone={
            totals.successRate >= 95
              ? 'success'
              : totals.successRate >= 80
                ? 'warning'
                : 'danger'
          }
          hint="Dari seluruh pesan keluar"
        />
        <StatCard
          label="Pesan Gagal"
          value={totals.failedMessages}
          icon={AlertTriangle}
          tone={totals.failedMessages > 0 ? 'danger' : 'default'}
          hint={
            totals.failedMessages > 0
              ? 'Periksa di riwayat pesan'
              : 'Tidak ada kegagalan tercatat'
          }
        />
      </Reveal>

      {/* ── connection + control ─────────────────────────────────────── */}
      <div className="grid gap-3 lg:grid-cols-2">
        <WhatsAppConnection
          session={bot.session as any}
          status={botStatus}
          engineLoaded={bot.engineLoaded}
          engineOffline={bot.engineOffline}
          locked={accessNotice !== null}
          lockedMessage={accessNotice?.message}
        />

        {bot.session ? (
          <BotControlPanel
            sessionId={bot.session.id}
            status={botStatus}
            engineLoaded={bot.engineLoaded}
            engineOffline={bot.engineOffline}
            notice={accessNotice}
          />
        ) : accessNotice ? (
          /* No session *and* no plan: the honest card is the reason, not an
             invitation to create a session the server would refuse. */
          <Card className="flex flex-col justify-center gap-3 p-5">
            <h3 className="text-lead font-semibold">Bot belum bisa dijalankan</h3>
            <BotAccessNotice data={accessNotice} showActions={false} />
            <p className="text-s leading-relaxed text-muted-foreground">
              Begitu ada paket aktif, buat sesi di halaman Sesi WhatsApp lalu tautkan
              nomor WhatsApp Anda dengan kode pairing atau kode QR.
            </p>
          </Card>
        ) : (
          <Card className="flex flex-col justify-center gap-3 p-5">
            <h3 className="text-lead font-semibold">Belum ada bot untuk dikendalikan</h3>
            <p className="text-s leading-relaxed text-muted-foreground">
              Buat sesi lebih dulu. Setelah nomor tertaut, panel ini akan berisi
              tombol menjalankan, merestart, dan menghentikan proses bot.
            </p>
            <div>
              <Button asChild size="sm">
                <Link href="/dashboard/sessions/new">
                  <Plus className="size-4" />
                  Buat sesi
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* ── activity + system ─────────────────────────────────────────── */}
      <Reveal as="div" className="grid gap-3 md:grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
        <ActivityFeed entries={activity} />
        <SystemStatusPanel items={system} />
      </Reveal>

      {/* ── AI backend health (catatan job asli dari engine) ──────────── */}
      <AiBackendStatusPanel />

      {!bot.session ? (
        <p className="flex items-center gap-2 text-note text-muted-foreground">
          <Database className="size-3.5" aria-hidden />
          Data bot (pengguna, grup, jadwal) akan muncul setelah bot berjalan sekali.
        </p>
      ) : null}
    </div>
  )
}
