'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormError, FormNotice } from '@/components/auth/auth-shell'
import { apiRequest, errorMessage } from '@/lib/api/client'

/**
 * Email verification panel.
 *
 * Verifies automatically when a token is present in the URL (the common case,
 * arriving from an email link). Without a token it offers to resend.
 */
export function VerifyEmailPanel({
  token,
  email,
  alreadyVerified,
}: {
  token: string | null
  email?: string | null
  alreadyVerified: boolean
}) {
  const [state, setState] = useState<'idle' | 'verifying' | 'verified' | 'failed'>(
    alreadyVerified ? 'verified' : token ? 'verifying' : 'idle'
  )
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const verify = useCallback(async (verificationToken: string) => {
    setState('verifying')
    setError(null)
    try {
      await apiRequest('/api/auth/verify-email', {
        method: 'POST',
        body: { token: verificationToken },
      })
      setState('verified')
    } catch (err) {
      setError(errorMessage(err))
      setState('failed')
    }
  }, [])

  useEffect(() => {
    // Guard on state so a re-render cannot fire a second verification request;
    // tokens are single-use and a duplicate call would report a false failure.
    if (state === 'verifying' && token) void verify(token)
  }, [state, token, verify])

  async function resend() {
    setResending(true)
    setError(null)
    setNotice(null)
    try {
      const result = await apiRequest<{ message: string }>(
        '/api/auth/verify-email?resend=1',
        { method: 'POST', body: email ? { email } : {} }
      )
      setNotice(result.message)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setResending(false)
    }
  }

  if (state === 'verifying') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
        <p className="text-mid text-muted-foreground">
Memverifikasi alamat email Anda…
        </p>
      </div>
    )
  }

  if (state === 'verified') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            className="grid size-11 place-items-center rounded-[12px] border border-success/30 bg-success/10 text-success"
            aria-hidden
          >
            <CheckCircle2 className="size-5" />
          </span>
          <p className="text-mid text-muted-foreground">
            {alreadyVerified
              ? 'Alamat email Anda sudah terverifikasi.'
              : 'Alamat email Anda berhasil diverifikasi.'}
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/dashboard">Lanjut ke panel</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FormError message={error} />
      <FormNotice message={notice} />

      {state === 'idle' || state === 'failed' ? (
        <>
          <div className="flex items-start gap-3 rounded-[10px] border border-warning/25 bg-warning/10 px-3.5 py-3">
            <MailWarning className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <p className="text-s leading-relaxed text-warning">
              {email
                ? `Alamat ${email} masih perlu diverifikasi.`
                : 'Alamat email Anda masih perlu diverifikasi.'}{' '}
              Minta tautan baru di bawah bila tautan sebelumnya sudah kedaluwarsa.
            </p>
          </div>

          <Button onClick={resend} loading={resending} className="w-full">
            Kirim ulang email verifikasi
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/dashboard">Lewati dulu</Link>
          </Button>

          <p className="text-tiny leading-relaxed text-muted-foreground">
            Selama pengiriman email belum aktif, email verifikasi tidak terkirim.
            Gunakan tombol verifikasi yang muncul setelah Anda mendaftar.
          </p>
        </>
      ) : null}
    </div>
  )
}
