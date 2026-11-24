'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Copy, KeyRound, Loader2, Lock, Monitor, ShieldCheck, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'
import { useCopy } from '@/hooks/use-copy'
import { passwordStrength } from '@/lib/utils/password-strength'
import { formatDateTime, timeAgo } from '@/lib/utils/format'

/**
 * Security panels.
 *
 * All three talk to endpoints that already exist: change-password, the
 * two-factor endpoint, and the login-session list. Nothing here is a mock —
 * every button performs the real operation and reports its real outcome.
 */

// ──────────────────────────────────────────────────────────── password ──────

export function ChangePasswordPanel() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(form.newPassword)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: { ...form, signOutOtherDevices: true },
      })
      toast.success('Kata sandi diganti. Perangkat lain telah dikeluarkan.')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors)
      toast.error(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kata sandi</CardTitle>
        <CardDescription>
          Menggantinya akan mengeluarkan semua perangkat lain, kecuali yang ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="max-w-md space-y-4">
          <Field label="Kata sandi saat ini" htmlFor="currentPassword" error={errors.currentPassword} required>
            <Input
              id="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              autoComplete="current-password"
            />
          </Field>

          <Field
            label="Kata sandi baru"
            htmlFor="newPassword"
            error={errors.newPassword}
            hint={form.newPassword ? strength.label : undefined}
            required
          >
            <Input
              id="newPassword"
              type="password"
              value={form.newPassword}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              autoComplete="new-password"
            />
          </Field>

          <Field
            label="Konfirmasi kata sandi baru"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
            required
          >
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              autoComplete="new-password"
            />
          </Field>

          <Button type="submit" loading={loading}>
            <Lock className="size-4" />
            Ganti kata sandi
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────── 2FA ────────

interface Enrollment {
  secret: string
  qrImage: string
  otpauthUrl: string
}

export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter()
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const { copy, copied } = useCopy()

  async function startSetup() {
    setBusy(true)
    try {
      const result = await apiRequest<Enrollment>('/api/auth/2fa', {
        method: 'POST',
        body: { action: 'setup' },
      })
      setEnrollment(result)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function enable() {
    setBusy(true)
    try {
      const result = await apiRequest<{ backupCodes: string[] }>('/api/auth/2fa', {
        method: 'POST',
        body: { action: 'enable', code },
      })
      setBackupCodes(result.backupCodes)
      setEnrollment(null)
      setCode('')
      toast.success('Verifikasi dua langkah sekarang aktif.')
      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      await apiRequest('/api/auth/2fa', {
        method: 'POST',
        body: { action: 'disable', password },
      })
      setPassword('')
      toast.success('Verifikasi dua langkah dinonaktifkan.')
      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Verifikasi dua langkah</CardTitle>
            <CardDescription>
              Kode dari aplikasi autentikator Anda, diminta setiap kali masuk.
            </CardDescription>
          </div>
          <Badge tone={enabled ? 'success' : 'neutral'} size="sm">
            {enabled ? 'aktif' : 'nonaktif'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Backup codes are shown exactly once, right after enabling. */}
        {backupCodes ? (
          <div className="rounded-[12px] border border-primary/25 bg-primary-soft p-4">
            <p className="text-s font-medium text-primary">Simpan kode cadangan Anda</p>
            <p className="mt-1 text-note text-muted-foreground">
              Setiap kode hanya bisa dipakai sekali. Kode ini hanya ditampilkan sekarang dan tidak
              bisa dilihat lagi nanti.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-s sm:grid-cols-4">
              {backupCodes.map((backup) => (
                <span key={backup} className="rounded-[7px] border border-border bg-background px-2 py-1">
                  {backup}
                </span>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => copy(backupCodes.join('\n'))}
            >
              <Copy className="size-3.5" />
              {copied ? 'Tersalin' : 'Salin semua'}
            </Button>
          </div>
        ) : null}

        {enabled ? (
          <div className="max-w-md space-y-4">
            <Field
              label="Konfirmasi dengan kata sandi Anda"
              htmlFor="disable-password"
              hint="Diperlukan agar sesi yang dibajak tidak bisa mematikan 2FA."
              required
            >
              <Input
                id="disable-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Button
              variant="danger"
              onClick={disable}
              loading={busy}
              disabled={password.length === 0}
            >
              <ShieldOff className="size-4" />
              Matikan 2FA
            </Button>
          </div>
        ) : enrollment ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="shrink-0 rounded-[12px] border border-border bg-white p-2.5">
                {enrollment.qrImage ? (
                  <Image
                    src={enrollment.qrImage}
                    alt="Kode QR verifikasi dua langkah"
                    width={168}
                    height={168}
                    unoptimized
                    className="size-[168px]"
                  />
                ) : (
                  <Skeleton className="size-[168px]" />
                )}
              </div>

              <div className="min-w-0 space-y-2 text-s text-muted-foreground">
                <p>1. Scan kode ini dengan aplikasi autentikator Anda.</p>
                <p>
                  2. Atau masukkan kunci ini secara manual:
                </p>
                <code className="block break-all rounded-[8px] border border-border bg-muted/40 px-2.5 py-1.5 font-mono text-tiny">
                  {enrollment.secret}
                </code>
                <p>3. Masukkan 6 digit kode yang ditampilkan untuk menyelesaikan.</p>
              </div>
            </div>

            <div className="max-w-xs space-y-3">
              <Field label="Kode autentikator" htmlFor="enable-code" required>
                <Input
                  id="enable-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  placeholder="123456"
                  icon={<KeyRound />}
                />
              </Field>
              <div className="flex gap-2">
                <Button onClick={enable} loading={busy} disabled={code.length < 6}>
                  <ShieldCheck className="size-4" />
                  Aktifkan 2FA
                </Button>
                <Button variant="ghost" onClick={() => setEnrollment(null)} disabled={busy}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md space-y-3">
            <p className="text-s text-muted-foreground">
              Anda perlu aplikasi autentikator seperti Google Authenticator, Authy, atau 1Password.
            </p>
            <Button onClick={startSetup} loading={busy}>
              <ShieldCheck className="size-4" />
              Siapkan 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────── devices ──────

interface AccountSession {
  id: string
  device: string | null
  ip: string | null
  location: string | null
  createdAt: string
  lastActiveAt: string
  isCurrent: boolean
}

export function ActiveSessionsPanel() {
  const router = useRouter()
  const [sessions, setSessions] = useState<AccountSession[] | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setSessions(await apiRequest<AccountSession[]>('/api/account/sessions'))
    } catch (error) {
      toast.error(errorMessage(error))
      setSessions([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function revoke(id: string) {
    setRevoking(id)
    try {
      await apiRequest('/api/account/sessions', { method: 'DELETE', body: { sessionId: id } })
      setSessions((prev) => prev?.filter((session) => session.id !== id) ?? null)
      toast.success('Perangkat telah dikeluarkan.')
      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setRevoking(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perangkat aktif</CardTitle>
        <CardDescription>
          Semua browser yang sedang masuk ke akun ini. Cabut yang tidak Anda kenali.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions === null ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        ) : sessions.length === 0 ? (
          <p className="text-s text-muted-foreground">Tidak ada perangkat aktif.</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center gap-3 rounded-[10px] border border-border bg-muted/20 px-3.5 py-3"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[9px] border border-border bg-background text-muted-foreground">
                <Monitor className="size-4" aria-hidden />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-mid font-medium">
                    {session.device ?? 'Perangkat tidak dikenal'}
                  </span>
                  {session.isCurrent ? (
                    <Badge tone="success" size="sm">
                      perangkat ini
                    </Badge>
                  ) : null}
                </span>
                <span className="mt-0.5 block truncate text-tiny text-muted-foreground">
                  {session.ip ?? 'IP tidak diketahui'}
                  {session.location ? ` · ${session.location}` : ''} · aktif{' '}
                  {timeAgo(session.lastActiveAt)}
                </span>
                <span className="block text-xs2 text-muted-foreground/80">
                  masuk {formatDateTime(session.createdAt)}
                </span>
              </span>

              {session.isCurrent ? (
                <span className="text-tiny text-muted-foreground">sesi saat ini</span>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => revoke(session.id)}
                  loading={revoking === session.id}
                >
                  Cabut
                </Button>
              )}
            </div>
          ))
        )}

        {sessions === null ? (
          <p className="flex items-center gap-2 text-note text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Memuat perangkat Anda…
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
