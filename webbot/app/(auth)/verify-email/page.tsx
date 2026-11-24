import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { VerifyEmailPanel } from '@/components/auth/verify-email-panel'
import { getAuthContext } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Verifikasi email Anda',
  description: 'Konfirmasi alamat email untuk menyelesaikan pengaturan NANO GATEWAY.',
  robots: { index: false, follow: false },
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const [params, auth] = await Promise.all([searchParams, getAuthContext()])

  return (
    <AuthShell
      eyebrow="Verifikasi"
      title="Verifikasi email Anda"
      description="Setelah email dikonfirmasi, akun Anda lebih aman dan bisa dipulihkan bila lupa kata sandi."
    >
      <VerifyEmailPanel
        token={params.token ?? null}
        email={auth?.user.email ?? null}
        alreadyVerified={Boolean(auth?.user.emailVerifiedAt)}
      />
    </AuthShell>
  )
}
