import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Data apa yang disimpan NANO GATEWAY, alasannya, dan cara menghapusnya.',
}

/**
 * Privacy.
 *
 * Explains what the panel stores, in plain language, without exposing internal
 * implementation details — a visitor does not need to know how the data is kept.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          Halaman ini menjelaskan data apa yang disimpan saat Anda memakai panel ini, mengapa
          data itu diperlukan, dan cara menghapusnya.
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data akun</CardTitle>
            <CardDescription>Diperlukan agar akun Anda bisa berjalan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-mid leading-relaxed text-muted-foreground">
            <p>
              Nama, nama pengguna, alamat email, nomor telepon (opsional), dan zona waktu Anda.
              Kata sandi disimpan dalam bentuk terenkripsi satu arah, tidak pernah sebagai teks
              biasa.
            </p>
            <p>
              Sesi login mencatat informasi perangkat, alamat IP, dan waktu aktif terakhir agar
              bisa Anda tinjau dan cabut dari halaman Keamanan. Peristiwa penting seperti login,
              pergantian kata sandi, dan perubahan verifikasi dua langkah dicatat di log aktivitas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data WhatsApp</CardTitle>
            <CardDescription>Ditangani oleh bot Anda sendiri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-mid leading-relaxed text-muted-foreground">
            <p>
              Menautkan nomor akan menyimpan kredensial WhatsApp milik bot Anda di server tempat
              bot berjalan. Kredensial itu terpisah per bot, jadi bot Anda tidak bisa membaca
              kredensial akun lain.
            </p>
            <p>
              Isi pesan hanya tersimpan bila bot Anda sendiri menyimpannya. Panel ini tidak
              menyalin isi pesan; yang ditampilkan hanya ringkasan jumlahnya.
            </p>
          </CardContent>
        </Card>

        <Card id="data" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>Menghapus data Anda</CardTitle>
            <CardDescription>Apa yang sebenarnya terjadi saat data dihapus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-mid leading-relaxed text-muted-foreground">
            <p>
              Melepas tautan bot akan menghapus kredensial WhatsApp yang tersimpan, sehingga
              nomornya perlu ditautkan ulang untuk dipakai lagi. Menghapus bot juga menghapus
              seluruh datanya.
            </p>
            <p>
              Untuk menghapus akun beserta seluruh data Anda, ajukan permintaan lewat{' '}
              <Link
                href="/dashboard/support/ticket"
                className="text-primary underline-offset-4 hover:underline"
              >
                tiket dukungan
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-s text-muted-foreground">
        Lihat juga{' '}
        <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
          Ketentuan Layanan
        </Link>
        .
      </p>
    </div>
  )
}
