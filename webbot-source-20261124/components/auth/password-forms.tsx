'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyRound, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormError, FormNotice } from '@/components/auth/auth-shell'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'
import { passwordStrength } from '@/lib/utils/password-strength'
import { cn } from '@/lib/utils/cn'

/**
 * Forgot password.
 *
 * The server always returns 200 so this cannot enumerate accounts. When SMTP is
 * unconfigured it also returns the reset link, which we surface with an
 * explicit explanation instead of silently doing nothing.
 */

interface ForgotResponse {
  submitted: boolean
  message: string
  emailSent: boolean
  devResetLink: string | null
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ForgotResponse | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiRequest<ForgotResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim().toLowerCase() },
      })
      setResult(response)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <FormNotice message={result.message} />

        {result.devResetLink ? (
          <>
            <Button asChild className="w-full">
              <Link href={result.devResetLink}>Buka tautan atur ulang</Link>
            </Button>
            <p className="text-tiny leading-relaxed text-muted-foreground">
              Tautan ditampilkan di sini karena pengiriman email belum aktif. Segera atur ulang
              kata sandi Anda, lalu simpan kata sandi baru di tempat yang aman.
            </p>
          </>
        ) : null}

        <Link
          href="/login"
          className="auth-link block text-center text-mid"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError message={error} />

      <Field
        label="Email"
        htmlFor="email"
        hint="Kami akan mengirim tautan sekali pakai yang berlaku 1 jam."
        required
      >
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

      <Button type="submit" className="auth-btn h-12 w-full text-lead sm:h-11" loading={loading}>
        {loading ? 'Mengirim…' : 'Kirim tautan atur ulang'}
      </Button>
    </form>
  )
}

/**
 * Reset password.
 *
 * The token comes from the URL. On success all sessions are revoked server-side
 * and we send the user to sign in again.
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const strength = useMemo(() => passwordStrength(password), [password])

  if (!token) {
    return (
      <div className="space-y-4">
        <FormError message="Tautan atur ulang ini tidak memiliki token. Minta tautan baru untuk melanjutkan." />
        <Button asChild className="w-full">
          <Link href="/forgot-password">Minta tautan baru</Link>
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="space-y-4">
        <FormNotice message="Kata sandi Anda sudah diganti dan semua sesi lain telah dikeluarkan." />
        <Button asChild className="w-full">
          <Link href="/login">Masuk dengan kata sandi baru</Link>
        </Button>
      </div>
    )
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password, confirmPassword },
      })
      setDone(true)
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.fieldErrors
        setError(fields.password ?? fields.confirmPassword ?? errorMessage(err))
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError message={error} />

      <Field
        label="Kata sandi baru"
        htmlFor="password"
        hint="Minimal 8 karakter dengan huruf besar, huruf kecil, dan angka."
        required
      >
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        required
        placeholder="••••••••"
        className="auth-input"
        icon={<KeyRound />}
      />
      </Field>

      {password ? (
        <div className="space-y-2">
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-300',
                  index < strength.score
                    ? strength.score <= 1
                      ? 'bg-danger'
                      : strength.score === 2
                        ? 'bg-warning'
                        : 'bg-success'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
          <p className="text-tiny text-muted-foreground">
            Kekuatan:{' '}
            <span
              className={cn(
                'font-medium',
                strength.score <= 1
                  ? 'text-danger'
                  : strength.score === 2
                    ? 'text-warning'
                    : 'text-success'
              )}
            >
              {strength.score <= 1 ? 'Weak' : strength.score === 2 ? 'Medium' : 'Strong'}
            </span>
            {strength.suggestions.length > 0 ? ` — ${strength.suggestions[0]}` : ''}
          </p>
        </div>
      ) : null}

      <Field label="Konfirmasi kata sandi baru" htmlFor="confirmPassword" required>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          required
          placeholder="••••••••"
          className="auth-input"
          icon={<KeyRound />}
        />
      </Field>

      <Button type="submit" className="auth-btn h-12 w-full text-lead sm:h-11" loading={loading}>
        {loading ? 'Menyimpan…' : 'Simpan kata sandi baru'}
      </Button>

      <p className="text-tiny leading-relaxed text-muted-foreground">
        Demi keamanan, semua sesi yang sedang aktif akan dikeluarkan setelah kata
        sandi diganti.
      </p>
    </form>
  )
}
