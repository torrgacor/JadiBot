'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FormError } from '@/components/auth/auth-shell'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'

/**
 * Login form.
 *
 * When the server reports `requiresTwoFactor`, the same form switches to the
 * second step (a 6-digit code or a backup code) instead of navigating — the
 * password step has already succeeded at that point.
 *
 * Presentation only: the request bodies, the 2FA hand-off and the redirect are
 * exactly as the auth API defines them.
 */

interface LoginResponse {
  requiresTwoFactor: boolean
  userId?: string
  redirectTo?: string
}

export function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [step, setStep] = useState<'credentials' | 'two-factor'>('credentials')
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [code, setCode] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      const result = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password, rememberMe },
      })

      if (result.requiresTwoFactor && result.userId) {
        setPendingUserId(result.userId)
        setStep('two-factor')
        setCode('')
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

  async function submitTwoFactor(event: React.FormEvent) {
    event.preventDefault()
    if (!pendingUserId) return

    setLoading(true)
    setError(null)

    try {
      const result = await apiRequest<LoginResponse>('/api/auth/2fa', {
        method: 'POST',
        body: { action: 'verify', userId: pendingUserId, code, rememberMe },
      })

      router.push(result.redirectTo ?? '/dashboard')
      router.refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'two-factor') {
    return (
      <form onSubmit={submitTwoFactor} className="space-y-4">
        <div className="flex items-start gap-3 rounded-[14px] border border-primary/25 bg-primary-soft px-3.5 py-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-s leading-relaxed text-muted-foreground">
            Masukkan 6 digit kode dari aplikasi autentikator Anda. Anda juga bisa memakai salah
            satu kode cadangan yang sudah disimpan.
          </p>
        </div>

        <FormError message={error} />

        <Field label="Kode autentikasi" htmlFor="code" required>
          <Input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            placeholder="123456"
            className="auth-input text-center font-mono text-lg tracking-[0.3em]"
          />
        </Field>

        <Button type="submit" className="auth-btn h-12 w-full text-lead sm:h-11" loading={loading}>
          {loading ? 'Memverifikasi…' : 'Verifikasi dan masuk'}
        </Button>

        <button
          type="button"
          onClick={() => {
            setStep('credentials')
            setPendingUserId(null)
            setError(null)
          }}
          className="w-full text-center text-mid text-muted-foreground transition-colors hover:text-foreground"
        >
          Pakai akun lain
        </button>
      </form>
    )
  }

  return (
    <div className="space-y-5">
      {/*
        No social sign-in buttons here on purpose: the platform authenticates
        with email + password (plus optional TOTP), and the only way to add a
        provider would be a real OAuth route. A button pointing at an endpoint
        that does not exist would be worse than no button.
      */}
      <form onSubmit={submitCredentials} className="space-y-4">
        <FormError message={error} />

        <Field label="Email" htmlFor="email" error={fieldErrors.email} required>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="nama@email.com"
            className="auth-input"
            icon={<Mail />}
          />
        </Field>

        <Field label="Kata sandi" htmlFor="password" error={fieldErrors.password} required>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="auth-input"
            icon={<KeyRound />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="grid size-9 place-items-center rounded-[9px] text-muted-foreground transition-all duration-200 hover:bg-white/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-mid text-muted-foreground transition-colors hover:text-foreground">
            <Switch
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              aria-label="Ingat saya di perangkat ini"
            />
            Ingat saya
          </label>

          <Link href="/forgot-password" className="auth-link text-mid">
            Lupa kata sandi?
          </Link>
        </div>

        <Button type="submit" className="auth-btn h-12 w-full text-lead sm:h-11" loading={loading}>
          {loading ? 'Masuk…' : 'Masuk'}
        </Button>

        <p className="text-center text-tiny leading-relaxed text-muted-foreground">
          &ldquo;Ingat saya&rdquo; membuat Anda tetap masuk selama 30 hari. Tanpa itu, sesi
          berakhir setelah satu hari.
        </p>
      </form>
    </div>
  )
}
