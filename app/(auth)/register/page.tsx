import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { RegisterForm } from '@/components/auth/register-form'
import { getAuthContext } from '@/lib/auth/session'
import { features } from '@/lib/env'
import { TRIAL_DAYS, TRIAL_PLAN_SLUG } from '@/lib/utils/trial'

export const metadata: Metadata = {
  title: 'Buat akun Anda',
  description: 'Buat akun NANO GATEWAY dan hubungkan bot WhatsApp pertama Anda.',
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const auth = await getAuthContext()
  if (auth) redirect('/dashboard')

  const params = await searchParams

  return (
    <AuthShell
      eyebrow="Akun baru"
      title="Buat akun kamu"
      description="Daftar dan mulai kelola bot WhatsApp kamu."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="auth-link">
            Masuk
          </Link>
        </>
      }
    >
      {params.plan ? (
        <div className="mb-4 animate-fade-in rounded-[12px] border border-primary/25 bg-primary-soft px-3.5 py-3 text-mid leading-relaxed text-primary">
          {params.plan === TRIAL_PLAN_SLUG ? (
            <>
              Anda memilih <span className="font-medium">FREE TRIAL</span>. Setelah akun dibuat,
              aktifkan trial {TRIAL_DAYS} hari dari panel — gratis, satu kali per akun.
            </>
          ) : (
            <>
              Anda memilih paket <span className="font-medium capitalize">{params.plan}</span>.
              Setelah akun dibuat, selesaikan pembayaran di halaman Langganan untuk
              mengaktifkannya.
            </>
          )}
        </div>
      ) : null}

      <RegisterForm />
    </AuthShell>
  )
}
