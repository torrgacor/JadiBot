'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AtSign, KeyRound, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormError, FormNotice } from '@/components/auth/auth-shell'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'
import { passwordStrength } from '@/lib/utils/password-strength'
import { cn } from '@/lib/utils/cn'

/**
 * Registration form.
 *
 * On success the user is already signed in (the API sets the session cookie),
 * so we navigate to the dashboard. If SMTP is unconfigured the API returns a
 * direct verification link and we surface it explicitly rather than implying an
 * email was delivered.
 *
 * The inline rules below only mirror what the API already rejects — they give
 * feedback while typing, they never replace a server check and they never block
 * the request. Nothing about what is sent has changed.
 */

interface RegisterResponse {
  redirectTo?: string
  verification?: {
    emailSent: boolean
    reason?: string
    verificationPath?: string
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_RE = /^[a-z0-9._]{3,20}$/

type FormKey = 'name' | 'username' | 'email' | 'password' | 'confirmPassword'

/** Mirrors the register API's own rules, for earlier feedback only. */
function validate(form: Record<FormKey, string>): Partial<Record<FormKey, string>> {
  const errors: Partial<Record<FormKey, string>> = {}
  const username = form.username.trim().toLowerCase()
  const email = form.email.trim().toLowerCase()

  if (!form.name.trim()) errors.name = 'Nama wajib diisi.'
  else if (form.name.trim().length < 2) errors.name = 'Nama terlalu pendek.'

  if (!username) errors.username = 'Nama pengguna wajib diisi.'
  else if (!USERNAME_RE.test(username))
    errors.username = '3–20 karakter: huruf kecil, angka, titik, atau garis bawah.'

  if (!email) errors.email = 'Email wajib diisi.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Format email belum valid.'

  if (!form.password) errors.password = 'Kata sandi wajib diisi.'
  else if (form.password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
    errors.password = 'Minimal 8 karakter dengan huruf besar, huruf kecil, dan angka.'

  if (!form.confirmPassword) errors.confirmPassword = 'Ulangi kata sandi Anda.'
  else if (form.confirmPassword !== form.password)
    errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.'

  return errors
}

/** Weak / Medium / Strong — the three states the design calls for. */
function strengthTone(score: number) {
  if (score <= 1)
    return { label: 'Lemah', bar: 'bg-danger', pill: 'border-danger/35 bg-danger/10 text-danger' }
  if (score === 2)
    return { label: 'Sedang', bar: 'bg-warning', pill: 'border-warning/35 bg-warning/10 text-warning' }
  return { label: 'Kuat', bar: 'bg-success', pill: 'border-success/35 bg-success/10 text-success' }
}

export function RegisterForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({})

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [verifyPath, setVerifyPath] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => passwordStrength(form.password), [form.password])
  const clientErrors = useMemo(() => validate(form), [form])
  const tone = strengthTone(strength.score)

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /** Server errors win; otherwise show the mirrored rule once touched. */
  function errorFor(key: FormKey): string | undefined {
    return fieldErrors[key] ?? (touched[key] ? clientErrors[key] : undefined)
  }

  function touch(key: FormKey) {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})
    setNotice(null)
    // Surface every mirrored issue at once instead of one field per attempt.
    setTouched({ name: true, username: true, email: true, password: true, confirmPassword: true })

    try {
      const result = await apiRequest<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: {
          name: form.name,
          // Usernames are stored lowercase; mirror that so validation agrees.
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          acceptTerms,
        },
      })

      if (result.verification && !result.verification.emailSent) {
        // No mail transport. The server only hands back a link when development
        // links are switched on, so the wording has to match what actually
        // arrived: never promise a button that the response did not include.
        const path = result.verification.verificationPath ?? null
        setNotice(
          path
            ? `${result.verification.reason ?? 'Pengiriman email sedang tidak tersedia.'} Gunakan tombol di bawah untuk memverifikasi alamat email Anda.`
            : (result.verification.reason ??
              'Pengiriman email sedang tidak tersedia, jadi verifikasi email belum bisa diselesaikan sekarang.')
        )
        setVerifyPath(path)
        return
      }

      router.push(result.redirectTo ?? '/dashboard')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors)
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (notice) {
    return (
      <div className="space-y-4">
        <FormNotice message={notice} />

        {verifyPath ? (
          <Button asChild className="auth-btn h-12 w-full text-lead sm:h-11">
            <Link href={verifyPath}>Verifikasi email saya sekarang</Link>
          </Button>
        ) : null}

        <Button asChild variant="secondary" className="h-12 rounded-[14px] text-lead sm:h-11">
          <Link href="/dashboard">Lanjut ke panel</Link>
        </Button>

        <p className="text-center text-tiny leading-relaxed text-muted-foreground">
          Pengiriman email belum aktif, jadi email verifikasi tidak terkirim. Gunakan tombol di
          atas untuk memverifikasi alamat Anda.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/*
        Registration is email + password only: there is no OAuth route in this
        build, so no provider button is rendered rather than one that dead-ends.
      */}
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />

        <Field label="Nama lengkap" htmlFor="name" error={errorFor('name')} required>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            onBlur={() => touch('name')}
            autoComplete="name"
            required
            placeholder="Nama Anda"
            className="auth-input"
            icon={<User />}
          />
        </Field>

        <Field
          label="Nama pengguna"
          htmlFor="username"
          error={errorFor('username')}
          hint="Huruf kecil, angka, garis bawah, dan titik."
          required
        >
          <Input
            id="username"
            value={form.username}
            onChange={(event) => update('username', event.target.value.toLowerCase())}
            onBlur={() => touch('username')}
            autoComplete="username"
            required
            placeholder="ada"
            className="auth-input"
            icon={<AtSign />}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errorFor('email')} required>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            onBlur={() => touch('email')}
            autoComplete="email"
            required
            placeholder="nama@email.com"
            className="auth-input"
            icon={<Mail />}
          />
        </Field>

        <Field
          label="Kata sandi"
          htmlFor="password"
          error={errorFor('password')}
          hint="Minimal 8 karakter dengan huruf besar, huruf kecil, dan angka."
          required
        >
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            onBlur={() => touch('password')}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="auth-input"
            icon={<KeyRound />}
          />
        </Field>

        {/* strength meter */}
        {form.password ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5" aria-hidden>
              <div className="flex h-1.5 flex-1 gap-1.5">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      'flex-1 rounded-full transition-all duration-500 ease-out',
                      index < strength.score
                        ? cn(tone.bar, 'shadow-[0_0_10px_-1px_var(--glow)]')
                        : 'bg-muted'
                    )}
                    style={{
                      opacity: index < strength.score ? 1 : 0.4,
                      transform: index < strength.score ? 'scaleX(1)' : 'scaleX(0.85)',
                      transformOrigin: 'left',
                    }}
                  />
                ))}
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-[7px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
                  tone.pill
                )}
              >
                {tone.label}
              </span>
            </div>
            {strength.suggestions.length > 0 ? (
              <p className="text-tiny text-muted-foreground">
                {strength.suggestions[0]}
              </p>
            ) : null}
          </div>
        ) : null}

        <Field
          label="Konfirmasi kata sandi"
          htmlFor="confirmPassword"
          error={errorFor('confirmPassword')}
          required
        >
          <Input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
            onBlur={() => touch('confirmPassword')}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="auth-input"
            icon={<KeyRound />}
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-2.5 text-s leading-relaxed text-muted-foreground transition-colors hover:text-foreground">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-border accent-[var(--primary)]"
            required
          />
          <span>
            Saya menyetujui{' '}
            <Link href="/terms" className="auth-link">
              Ketentuan Layanan
            </Link>{' '}
            dan{' '}
            <Link href="/privacy" className="auth-link">
              Kebijakan Privasi
            </Link>
            , serta akan memakai panel ini sesuai kebijakan WhatsApp.
          </span>
        </label>

        <Button
          type="submit"
          className="auth-btn h-12 w-full text-lead sm:h-11"
          loading={loading}
          disabled={!acceptTerms}
        >
          {loading ? 'Membuat akun…' : 'Buat akun'}
        </Button>
      </form>
    </div>
  )
}
