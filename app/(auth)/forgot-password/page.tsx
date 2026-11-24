import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { ForgotPasswordForm } from '@/components/auth/password-forms'

export const metadata: Metadata = {
  title: 'Atur ulang kata sandi',
  description: 'Minta tautan sekali pakai untuk mengatur ulang kata sandi akun NANO GATEWAY Anda.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Pemulihan akun"
      title="Atur ulang kata sandi"
      description="Masukkan alamat email kamu. Kami kirim tautan sekali pakai untuk membuat kata sandi baru."
      footer={
        <>
          Sudah ingat?{' '}
          <Link href="/login" className="auth-link">
            Kembali ke halaman masuk
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
