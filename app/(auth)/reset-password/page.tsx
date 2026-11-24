import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { ResetPasswordForm } from '@/components/auth/password-forms'

export const metadata: Metadata = {
  title: 'Buat kata sandi baru',
  description: 'Pilih kata sandi baru untuk akun NANO GATEWAY Anda.',
  // A page reached from a one-time link should never be indexed.
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams

  return (
    <AuthShell
      title="Buat kata sandi baru"
      description="Pilih kata sandi yang kuat. Setelah disimpan, Anda akan keluar dari semua perangkat lain."
    >
      <ResetPasswordForm token={params.token ?? ''} />
    </AuthShell>
  )
}
