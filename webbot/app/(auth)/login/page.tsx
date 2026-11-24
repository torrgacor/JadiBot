import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'
import { getAuthContext } from '@/lib/auth/session'
import { features } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke panel NANO GATEWAY Anda.',
}

/** Only providers that are actually configured are offered. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verified?: string }>
}) {
  const auth = await getAuthContext()
  // Someone already signed in has no reason to see the login form.
  if (auth) redirect('/dashboard')

  const params = await searchParams

  return (
    <AuthShell
      eyebrow="Akses aman"
      title="Selamat datang kembali"
      description="Masuk untuk melanjutkan ke panel NANO GATEWAY kamu."
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="auth-link">
            Daftar sekarang
          </Link>
        </>
      }
    >
      {params.verified === '1' ? (
        <div
          role="status"
          className="animate-fade-in rounded-[12px] border border-success/35 bg-success/10 px-3.5 py-3 text-mid leading-relaxed text-success"
        >
          Email Anda sudah terverifikasi. Silakan masuk untuk melanjutkan.
        </div>
      ) : null}

      <LoginForm />
    </AuthShell>
  )
}
