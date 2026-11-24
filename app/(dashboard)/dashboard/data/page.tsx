import type { Metadata } from 'next'
import Link from 'next/link'
import { BellRing, Clock, Database, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { getPrimarySession } from '@/lib/services/bot-service'
import { getNanoSessionDataForUser } from '@/lib/services/nano-service'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatNumber, timeAgo } from '@/lib/utils/format'
import type { NanoSessionData } from '@/lib/engine/nano'

export const metadata: Metadata = { title: 'Data Bot' }
export const dynamic = 'force-dynamic'

const TABS = [
  { id: 'users', label: 'Pengguna' },
  { id: 'afk', label: 'AFK' },
  { id: 'reminders', label: 'Pengingat' },
  { id: 'messageMode', label: 'Mode balasan' },
  { id: 'prefixes', label: 'Prefix' },
  { id: 'groups', label: 'Grup' },
  { id: 'schedules', label: 'Jadwal' },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * Bot data.
 *
 * Everything the bot itself has written: who has used it, which chats use a
 * custom prefix, which groups have welcome/antilink enabled, and the pending
 * group schedules. Read straight from the bot's own SQLite database, so this is
 * the same data the bot enforces with `.limit`, `.premium` and its group rules.
 */
export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { user } = await requireAuth()
  const session = await getPrimarySession(user.id)

  if (!session) {
    return (
      <div className="space-y-6">
        <PageHeader title="Data Bot" description="Apa yang bot Anda ketahui tentang chat-nya sendiri." />
        <Card>
          <EmptyState
            icon={Database}
            title="Belum ada bot"
            description="Buat sesi dan hubungkan nomor WhatsApp dulu — data bot akan muncul di sini setelah bot berjalan."
            action={
              <Link
                href="/dashboard/sessions/new"
                className="text-mid font-medium text-primary underline-offset-4 hover:underline"
              >
                Buat bot Anda
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  const { tab: rawTab } = await searchParams
  const tab: TabId = TABS.some((entry) => entry.id === rawTab) ? (rawTab as TabId) : 'users'

  // A bot that has never run has no database yet — that is a normal state, not
  // an error, so the page explains it rather than showing an empty failure.
  let data: NanoSessionData | null = null
  let dataError: string | null = null
  try {
    data = await getNanoSessionDataForUser(session.id, user.id)
  } catch (error) {
    dataError = error instanceof Error ? error.message : 'Gagal membaca data bot.'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Bot"
        description={`Data yang ditulis "${session.name}" — dibaca dari data milik bot sendiri.`}
      />

      {dataError ? (
        <Card>
          <CardContent className="pt-5">
            <p className="text-s text-muted-foreground">{dataError}</p>
          </CardContent>
        </Card>
      ) : null}

      {data ? (
        <>
          {/*
            Six figures in three columns rather than four: with an odd count, a
            four-column grid left a ragged half-empty row under the strip.
          */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Pengguna terdaftar"
              value={data.stats.users}
              icon={Users}
              tone="primary"
              hint={`${data.stats.premiumUsers} premium`}
            />
            <StatCard
              label="Owner"
              value={data.stats.owners}
              icon={ShieldCheck}
              tone="default"
            />
            <StatCard
              label="Prefix khusus"
              value={data.stats.customPrefixes}
              icon={Database}
              tone="default"
            />
            <StatCard
              label="Jadwal grup"
              value={data.stats.groupSchedules}
              icon={Database}
              tone={data.stats.activeSchedules > 0 ? 'success' : 'default'}
              hint={`${data.stats.activeSchedules} aktif`}
            />
            <StatCard
              label="Sedang AFK"
              value={data.stats.afkActive}
              icon={Clock}
              tone={data.stats.afkActive > 0 ? 'warning' : 'default'}
              hint={`${data.afk.length} tercatat`}
            />
            <StatCard
              label="Pengingat menunggu"
              value={data.stats.remindersPending}
              icon={BellRing}
              tone={data.stats.remindersPending > 0 ? 'primary' : 'default'}
              hint={`${data.stats.rpgUsers} pemain · ${data.stats.rpgGuilds} guild`}
            />
          </div>

          {/* ── tabs ─────────────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((entry) => (
              <Link
                key={entry.id}
                href={`/dashboard/data?tab=${entry.id}`}
                className={cn(
                  'rounded-[9px] border px-3.5 py-1.5 text-s transition-colors',
                  tab === entry.id
                    ? 'border-primary/40 bg-primary-soft text-primary'
                    : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary-soft'
                )}
                aria-current={tab === entry.id ? 'page' : undefined}
              >
                {entry.label}
              </Link>
            ))}
          </div>

          {!data.initialized ? (
            <Card>
              <EmptyState
                icon={Database}
                title="Bot belum menyimpan datanya"
                description="Data terbentuk saat bot pertama kali berjalan setelah tertaut. Hubungkan nomornya, lalu jalankan bot."
              />
            </Card>
          ) : (
            <>
              {tab === 'users' ? <UsersTab data={data} /> : null}
              {tab === 'afk' ? <AfkTab data={data} /> : null}
              {tab === 'reminders' ? <RemindersTab data={data} /> : null}
              {tab === 'messageMode' ? <MessageModeTab data={data} /> : null}
              {tab === 'prefixes' ? <PrefixesTab data={data} /> : null}
              {tab === 'groups' ? <GroupsTab data={data} /> : null}
              {tab === 'schedules' ? <SchedulesTab data={data} /> : null}
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Sumber data</CardTitle>
              <CardDescription>
                Tampilan hanya-baca dari data yang dihimpun bot. Gunakan{' '}
                <Link
                  href="/dashboard/bot/settings"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Pengaturan Bot
                </Link>{' '}
                untuk mengubah welcome, antilink, prefix, dan owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="flex flex-wrap items-center gap-2 text-s text-muted-foreground">
                <span>Kredensial sesi:</span>
                <span className="inline-flex items-center gap-1.5">
                  {data.connection.hasCredentials ? (
                    <Badge tone="success" size="sm">
                      tersimpan
                    </Badge>
                  ) : (
                    <Badge tone="neutral" size="sm">
                      belum tertaut
                    </Badge>
                  )}
                </span>
                {data.connection.registered ? (
                  <Badge tone="primary" size="sm">
                    terdaftar
                  </Badge>
                ) : null}
                {data.connection.platform ? (
                  <Badge tone="outline" size="sm">
                    {data.connection.platform}
                  </Badge>
                ) : null}
              </p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────── tabs ───

function UsersTab({ data }: { data: NanoSessionData }) {
  if (data.users.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          compact
          title="Belum ada pengguna yang berinteraksi dengan bot"
          description="Pengguna terdaftar saat pertama kali mereka mengirim perintah ke bot."
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Pengguna</CardTitle>
        <CardDescription>
          {formatNumber(data.users.length)} terdaftar
          {data.users.length >= 200 ? ' (menampilkan 200 pertama)' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {data.users.map((user) => (
            <li key={user.jid} className="flex flex-wrap items-center gap-2 px-5 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-mid font-medium">
                  {user.pushName ?? user.jid.split('@')[0]}
                </span>
                <span className="block truncate font-mono text-xs2 text-muted-foreground">
                  {user.jid}
                </span>
              </span>

              {user.premium ? (
                <Badge tone="success" size="sm">
                  premium
                </Badge>
              ) : null}

              <Badge tone={user.limitCount > 0 ? 'neutral' : 'warning'} size="sm">
                sisa limit {user.limitCount}
              </Badge>

              <span className="w-full text-tiny text-muted-foreground sm:w-auto">
                {user.registeredAt
                  ? `bergabung ${timeAgo(new Date(user.registeredAt * 1000))}`
                  : 'tanggal bergabung tidak diketahui'}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function AfkTab({ data }: { data: NanoSessionData }) {
  if (data.afk.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Clock}
          compact
          title="Tidak ada yang AFK"
          description="Anggota muncul di sini selama status AFK-nya aktif. Bot menghapus status itu begitu dia mengirim pesan lagi di chat yang dipantau bot."
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Daftar AFK</CardTitle>
        <CardDescription>
          Dibaca dari data milik bot — catatan yang sama yang membuat bot mengumumkan bahwa
          seseorang sedang pergi.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {data.afk.map((entry) => (
            <li key={entry.jid} className="flex flex-wrap items-center gap-2 px-5 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-mid font-medium">
                  {entry.pushName ?? entry.jid.split('@')[0]}
                </span>
                <span className="block truncate font-mono text-xs2 text-muted-foreground">
                  {entry.jid}
                </span>
              </span>

              <Badge tone={entry.active ? 'warning' : 'neutral'} size="sm">
                {entry.active ? 'AFK' : 'kembali'}
              </Badge>

              <span className="w-full text-tiny text-muted-foreground sm:w-auto">
                {entry.since ? `sejak ${timeAgo(new Date(entry.since))}` : 'tanpa waktu'}
              </span>

              {entry.reason ? (
                <span className="w-full truncate text-note text-muted-foreground" title={entry.reason}>
                  “{entry.reason}”
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function RemindersTab({ data }: { data: NanoSessionData }) {
  if (data.reminders.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={BellRing}
          compact
          title="Belum ada pengingat"
          description="Pengingat yang dibuat lewat perintah bot akan mengantre di sini sampai bot mengirimkannya."
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Pengingat</CardTitle>
        <CardDescription>
          Antrean pengingat milik bot.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {data.reminders.map((reminder) => (
            <li key={reminder.id} className="space-y-1.5 px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={reminder.sent ? 'success' : 'warning'} size="sm">
                  {reminder.sent ? 'terkirim' : 'menunggu'}
                </Badge>
                <span className="text-tiny text-muted-foreground">
                  jatuh tempo {formatDateTime(new Date(reminder.triggerAt * 1000))}
                </span>
                <span className="ml-auto truncate font-mono text-xs2 text-muted-foreground">
                  {reminder.chat}
                </span>
              </div>
              <p className="text-s">{reminder.message}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function MessageModeTab({ data }: { data: NanoSessionData }) {
  if (data.userSettings.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={MessageSquare}
          compact
          title="Semua memakai gaya balasan bawaan"
          description="Saat seseorang mengganti gaya balasan bot antara Android (kutipan) dan iOS (biasa) lewat perintah bawaan bot, pilihannya tercatat di sini."
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Mode balasan</CardTitle>
        <CardDescription>
          Gaya balasan yang dipilih masing-masing pengguna.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {data.userSettings.map((setting) => (
            <li key={setting.jid} className="flex flex-wrap items-center gap-2 px-5 py-3">
              <span className="min-w-0 flex-1 truncate font-mono text-note">{setting.jid}</span>
              <Badge tone={setting.messageMode === 'ios' ? 'primary' : 'neutral'} size="sm">
                {setting.messageMode}
              </Badge>
              <span className="text-tiny text-muted-foreground">
                {timeAgo(new Date(setting.updatedAt))}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function PrefixesTab({ data }: { data: NanoSessionData }) {
  if (data.prefixes.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Database}
          compact
          title="Tidak ada prefix khusus"
          description="Semua chat memakai prefix bawaan bot. Prefix khusus diatur per chat lewat perintah prefix bawaan bot."
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Prefix khusus</CardTitle>
        <CardDescription>Penimpaan prefix bawaan untuk chat tertentu.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {data.prefixes.map((entry) => (
            <li key={entry.chatId} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="min-w-0 truncate font-mono text-note">{entry.chatId}</span>
              <code className="rounded-[7px] border border-border bg-muted/50 px-2 py-0.5 font-mono text-note">
                {entry.prefix}
              </code>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function GroupsTab({ data }: { data: NanoSessionData }) {
  if (data.groupSettings.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Database}
          compact
          title="Belum ada pengaturan grup"
          description="Pesan welcome, antilink, dan prefix per grup akan muncul di sini setelah diatur dari WhatsApp."
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Pengaturan grup</CardTitle>
        <CardDescription>Gabungan pengaturan welcome dan antilink milik bot.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {data.groupSettings.map((group) => (
            <li key={group.chatId} className="px-5 py-3">
              <p className="truncate font-mono text-note">{group.chatId}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone={group.welcome ? 'success' : 'neutral'} size="sm">
                  welcome {group.welcome ? 'aktif' : 'mati'}
                </Badge>
                <Badge tone={group.antilinkGroup ? 'success' : 'neutral'} size="sm">
                  antilink {group.antilinkGroup ? 'aktif' : 'mati'}
                </Badge>
                <Badge tone={group.antilinkChannel ? 'success' : 'neutral'} size="sm">
                  antichannel {group.antilinkChannel ? 'aktif' : 'mati'}
                </Badge>
                {group.prefix ? (
                  <Badge tone="outline" size="sm">
                    prefix {group.prefix}
                  </Badge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function SchedulesTab({ data }: { data: NanoSessionData }) {
  if (data.schedules.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Database}
          compact
          title="Belum ada jadwal grup"
          description="Pesan grup terjadwal yang dibuat lewat penjadwal bawaan bot akan muncul di sini."
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Jadwal grup</CardTitle>
        <CardDescription>Pesan grup terjadwal yang menunggu dan yang sudah selesai.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {data.schedules.map((schedule) => (
            <li key={schedule.id} className="flex flex-wrap items-center gap-2 px-5 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-note">{schedule.groupId}</span>
                <span className="block text-tiny text-muted-foreground">
                  {schedule.mode} · {formatDateTime(new Date(schedule.executeAt * 1000))}
                </span>
              </span>

              <Badge
                tone={
                  schedule.status === 'sent'
                    ? 'success'
                    : schedule.status === 'failed'
                      ? 'danger'
                      : 'warning'
                }
                size="sm"
              >
                {schedule.status}
              </Badge>

              {schedule.lastError ? (
                <span
                  className="w-full text-tiny text-danger"
                  title={schedule.lastError}
                >
                  {schedule.lastError}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
