import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Bell, Mail, ShieldCheck } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ProfileForm } from '@/components/account/profile-form'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { formatDateTime, timeAgo } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Profil' }
export const dynamic = 'force-dynamic'

/** Profile. Identity that is read-only is shown as such rather than as a field. */
export default async function ProfilePage() {
  const { user } = await requireAuth()

  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      username: true,
      name: true,
      phone: true,
      timezone: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
      emailVerifiedAt: true,
      twoFactorEnabled: true,
    },
  })

  if (!profile) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Detail akun dan preferensi notifikasi Anda."
      />

      {/* ── account card ────────────────────────────────────────────── */}
      <Card className="relative overflow-hidden">
        {/* A whisper of aurora along the top edge, so the card has a horizon. */}
        <div className="aurora pointer-events-none absolute inset-x-0 top-0 h-28" aria-hidden />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.2]" aria-hidden />

        <CardContent className="relative pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar
              src={profile.avatarUrl}
              name={profile.name}
              size={72}
              className="border-primary/30 shadow-[0_0_30px_-10px_var(--glow)]"
            />

            <div className="min-w-0 flex-1">
              <p className="text-label font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Masuk sebagai
              </p>
              <h2 className="mt-1 truncate font-display text-[21px] font-bold tracking-tight">
                {profile.name}
              </h2>
              <p className="mt-0.5 truncate text-s text-muted-foreground">
                @{profile.username} · {profile.email}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-label font-semibold uppercase tracking-[0.1em] text-success"
                  title="Sesi akun ini sedang aktif"
                >
                  <span className="relative flex size-1.5" aria-hidden>
                    <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                  </span>
                  Aktif
                </span>

                <Badge tone="primary" size="sm">
                  {profile.role.replace('_', ' ').toLowerCase()}
                </Badge>

                {profile.emailVerifiedAt ? (
                  <Badge tone="success" size="sm">
                    <BadgeCheck className="size-3" />
                    email terverifikasi
                  </Badge>
                ) : (
                  <Badge tone="warning" size="sm">
                    email belum terverifikasi
                  </Badge>
                )}

                {profile.twoFactorEnabled ? (
                  <Badge tone="success" size="sm">
                    <ShieldCheck className="size-3" />
                    2FA aktif
                  </Badge>
                ) : (
                  <Badge tone="neutral" size="sm">
                    2FA nonaktif
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-border pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-label font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                Anggota sejak
              </dt>
              <dd className="mt-1 text-mid">{formatDateTime(profile.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-label font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                Terakhir masuk
              </dt>
              <dd className="mt-1 text-mid">
                {profile.lastLoginAt ? timeAgo(profile.lastLoginAt) : 'ini sesi pertama Anda'}
              </dd>
            </div>
            <div>
              <dt className="text-label font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                Zona waktu
              </dt>
              <dd className="mt-1 text-mid">{profile.timezone}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/account/security">
                <ShieldCheck className="size-4" />
                Keamanan
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/sessions">Sesi WhatsApp</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/account/notifications">
                <Bell className="size-4" />
                Notifikasi
              </Link>
            </Button>

            <span className="ml-auto flex items-center gap-2 text-note text-muted-foreground">
              Tampilan
              <ThemeToggle />
            </span>
          </div>
        </CardContent>
      </Card>

      <ProfileForm
        initial={{
          name: profile.name,
          username: profile.username,
          phone: profile.phone ?? '',
          timezone: profile.timezone,
          notifyEmail: true,
          notifyPush: true,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Alamat email</CardTitle>
          <CardDescription>Sengaja hanya bisa dibaca di sini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-mid">
            <Mail className="size-3.5 text-muted-foreground" aria-hidden />
            <span className="font-medium">{profile.email}</span>
          </div>
          <p className="text-s leading-relaxed text-muted-foreground">
            Mengganti email harus disertai pembuktian bahwa alamat barunya benar milik Anda, jadi
            prosesnya berupa alur verifikasi, bukan sekadar kolom isian. Alur itu belum dibuat —
            verifikasi email dan tautan atur ulang kata sandi sudah tersedia, hanya formulir
            ganti email yang belum ada.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
