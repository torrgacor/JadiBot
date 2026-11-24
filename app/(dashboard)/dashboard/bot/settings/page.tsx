import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Bot, Plus, Terminal } from 'lucide-react'
import { isAdmin, requireAuth } from '@/lib/auth/guards'
import { getBotPageData } from '@/lib/services/bot-service'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { RuntimeSettings } from '@/components/bot/runtime-settings'
import { GroupSettingsList } from '@/components/bot/group-settings'
import { EngineConfigForm } from '@/components/bot/engine-config-form'

export const metadata: Metadata = { title: 'Pengaturan Bot' }
export const dynamic = 'force-dynamic'

/**
 * Bot settings.
 *
 * Split deliberately into two scopes, because they behave differently and have
 * different owners:
 *
 *   • runtime settings live in the bot's own database, apply on the next message
 *     and belong to the account that owns the bot;
 *   • the engine config file is shared by every bot in the installation, needs a
 *     restart, and is therefore admin-only.
 *
 * Nothing here is a stored-in-the-panel preference: each control writes to a
 * real Nano artifact, so the bot's behaviour and this page cannot diverge.
 */
export default async function BotSettingsPage() {
  const { user } = await requireAuth()
  const { session, botData, engineOffline, nano } = await getBotPageData(user.id)

  if (!session) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pengaturan Bot"
          description="Konfigurasi bot Nano yang berjalan di akun ini."
        />
        <Card>
          <EmptyState
            icon={Bot}
            title="Belum ada bot"
            description="Buat bot dan hubungkan nomor WhatsApp lebih dulu — pengaturannya akan muncul di sini."
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

  const canEditConfig = isAdmin(user)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Bot"
        description={`Pengaturan untuk "${session.name}" — disimpan langsung ke data bot, bukan terpisah.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost">
              <Link href="/dashboard/bot/logs">
                <Terminal className="size-3.5" />
                Log bot
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/bot">Ringkasan bot</Link>
            </Button>
          </div>
        }
      />

      {engineOffline ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div className="text-s">
            <p className="font-medium text-foreground">Tidak dapat terhubung ke layanan.</p>
            <p className="mt-0.5 text-muted-foreground">
              Pengaturan belum bisa disimpan saat ini. Coba lagi sebentar lagi.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── runtime settings ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lead font-semibold tracking-tight">Pengaturan bot</h2>
        <Badge tone={botData?.initialized ? 'primary' : 'warning'} size="sm">
          {botData?.initialized ? 'data bot siap' : 'data bot belum dibuat'}
        </Badge>
        <span className="text-note text-muted-foreground">
          Berlaku langsung — bot membacanya saat menangani pesan.
        </span>
      </div>

      <RuntimeSettings
        accessMode={botData?.accessMode ?? 'normal'}
        anticall={botData?.anticall ?? false}
        owners={botData?.owners ?? []}
        initialized={botData?.initialized ?? false}
      />

      {/* ── group settings ────────────────────────────────────────────────── */}
      <div className="space-y-1 pt-2">
        <h2 className="text-lead font-semibold tracking-tight">Grup</h2>
        <p className="max-w-3xl text-s leading-relaxed text-muted-foreground">
          Welcome, goodbye, antilink, dan prefix per chat — satu baris untuk setiap chat yang
          pengaturannya sudah disimpan bot. Nano tidak menyediakan daftar anggota grup, jadi yang
          ditampilkan adalah ID chat sebagaimana dilihat bot.
        </p>
      </div>

      <GroupSettingsList
        groups={botData?.groupSettings ?? []}
        defaultPrefix={nano.config?.defaultPrefix ?? '.'}
      />

      {/* ── engine config file ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <h2 className="text-lead font-semibold tracking-tight">Konfigurasi bot</h2>
        <Badge tone="neutral" size="sm">
          dipakai bersama semua bot
        </Badge>
      </div>

      <EngineConfigForm config={nano.config} canEdit={canEditConfig} />
    </div>
  )
}
