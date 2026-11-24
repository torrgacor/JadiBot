import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, LifeBuoy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Bantuan',
  description: 'Langkah singkat memakai NANO GATEWAY, dari daftar sampai bot jalan.',
}

/**
 * Help.
 *
 * A short, plain-language walkthrough for first-time users. Written to be
 * readable without any knowledge of how the panel works internally.
 */

const STEPS = [
  {
    title: 'Buat akun',
    body: 'Daftar dengan email dan kata sandi. Jika email verifikasi belum masuk, ikuti tombol verifikasi yang muncul tepat setelah Anda mendaftar.',
  },
  {
    title: 'Masuk ke panel',
    body: 'Setelah masuk, panel menampilkan ringkasan bot Anda. Semua pengaturan ada di menu sebelah kiri.',
  },
  {
    title: 'Tautkan nomor WhatsApp',
    body: 'Buka Sesi lalu Tambah Sesi, beri nama sesi. Pilih memindai kode QR dengan kamera ponsel, atau minta kode pairing lalu ketikkan di WhatsApp pada Perangkat Tertaut → Tautkan dengan nomor telepon.',
  },
  {
    title: 'Atur cara bot menjawab',
    body: 'Buka Pengaturan Bot. Tentukan siapa yang boleh dijawab bot — semua, hanya grup, atau hanya chat pribadi — dan nyalakan tolak panggilan bila Anda mau.',
  },
  {
    title: 'Atur grup',
    body: 'Di halaman yang sama, atur pesan selamat datang, pesan perpisahan, antilink, dan prefix per grup. Perubahan langsung dipakai bot.',
  },
  {
    title: 'Pantau bot',
    body: 'Ringkasan Bot menampilkan status dan aktivitas. Log Bot menampilkan keluaran bot. Perintah memuat semua perintah yang dikenali bot, dan Data Bot menampilkan pengguna, AFK, pengingat, serta jadwal grup.',
  },
  {
    title: 'Amankan akun',
    body: 'Di halaman Keamanan, aktifkan verifikasi dua langkah dan tinjau perangkat yang sedang masuk. Cabut perangkat yang tidak Anda kenali.',
  },
]

const TROUBLES = [
  {
    question: 'Status bot tidak berubah atau bot tidak merespons',
    answer:
      'Buka Ringkasan Bot lalu tekan Jalankan bot, dan tunggu beberapa detik sampai statusnya berubah.',
  },
  {
    question: 'Kode QR sudah kedaluwarsa',
    answer:
      'Kode QR hanya berlaku sebentar. Muat ulang kode di halaman sesi, lalu pindai lagi dengan cepat.',
  },
  {
    question: 'Kode pairing tidak muncul',
    answer:
      'Pastikan nomor yang Anda masukkan sudah benar dan belum tertaut di perangkat lain, lalu minta kode baru.',
  },
  {
    question: 'Halaman tidak bisa dibuka atau data tidak muncul',
    answer:
      'Cek halaman Status untuk memastikan layanan sedang normal, lalu muat ulang halaman beberapa saat kemudian.',
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bantuan</h1>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          Langkah singkat memakai panel, dari daftar akun sampai bot berjalan. Tidak perlu
          pengetahuan teknis.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold tracking-tight">Langkah pemakaian</h2>
        <ol className="mt-5 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3.5">
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary-soft text-s font-semibold text-primary"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-body font-medium">{step.title}</p>
                <p className="mt-0.5 text-mid leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold tracking-tight">Kalau ada masalah</h2>
        <div className="mt-5 space-y-3">
          {TROUBLES.map((item) => (
            <Card key={item.question} className="p-4">
              <p className="text-mid-lg font-medium">{item.question}</p>
              <p className="mt-1 text-s leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="size-4 text-primary" aria-hidden />
            Masih butuh bantuan?
          </CardTitle>
          <CardDescription>
            Kirim tiket dari panel, atau cek status layanan dan panduan lengkap.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/support/ticket">Buat tiket</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/status">
              <Activity className="size-3.5" />
              Status layanan
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/docs">Panduan lengkap</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
