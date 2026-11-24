'use client'

import {
  Activity,
  BarChart3,
  Bot,
  CalendarClock,
  Contact,
  FileText,
  Images,
  KeyRound,
  Layers,
  ListTree,
  QrCode,
  Radio,
  ScrollText,
  Smartphone,
  Terminal,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Reveal } from '@/components/marketing/reveal'

/**
 * Feature grid.
 *
 * Each entry corresponds to functionality that actually exists in this build —
 * no aspirational tiles.
 */

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Terminal,
    title: 'Bot Nano Anda',
    description:
      'Bot Nano Anda yang menjalankan semuanya. Plugin, perintah, pengguna, dan datanya dipakai apa adanya.',
  },
  {
    icon: Smartphone,
    title: 'Login kode pairing',
    description:
      'Tautkan nomor tanpa kamera. Kode pairing asli dari WhatsApp ditampilkan di panel beserta langkah-langkahnya.',
  },
  {
    icon: QrCode,
    title: 'Login QR',
    description:
      'Kode QR asli yang diterbitkan WhatsApp, tampil langsung di panel lengkap dengan hitungan waktu kedaluwarsa.',
  },
  {
    icon: ScrollText,
    title: 'Katalog perintah',
    description:
      'Seluruh perintah dibaca dari folder plugin bot, lengkap dengan kategori, deskripsi, dan batasannya.',
  },
  {
    icon: Bot,
    title: 'Kontrol bot',
    description:
      'Jalankan, hentikan, dan restart proses bot dari panel. Statusnya mengikuti proses yang benar-benar berjalan.',
  },
  {
    icon: Users,
    title: 'Pengaturan grup',
    description:
      'Welcome, goodbye, antilink, dan prefix per chat — ditulis langsung ke data yang dibaca bot.',
  },
  {
    icon: CalendarClock,
    title: 'Pengingat & jadwal',
    description:
      'Lihat antrean pengingat dan jadwal pesan grup yang dibuat lewat perintah bot, beserta statusnya.',
  },
  {
    icon: Layers,
    title: 'Data pengguna bot',
    description:
      'Daftar pengguna, status premium, sisa limit, AFK, dan gaya balasan — semuanya dari data bot sendiri.',
  },
  {
    icon: Radio,
    title: 'Log bot langsung',
    description:
      'Keluaran proses Nano ditampilkan di penampil log dengan filter level, pencarian, dan jeda.',
  },
  {
    icon: Images,
    title: 'AFK otomatis',
    description:
      'Status AFK muncul begitu dikirim lewat bot dan dihapus otomatis saat orangnya kembali mengirim pesan.',
  },
  {
    icon: FileText,
    title: 'Konfigurasi script',
    description:
      'Ubah nama bot, owner, prefix, zona waktu, dan mode dari panel. File lama dicadangkan sebelum ditimpa.',
  },
  {
    icon: BarChart3,
    title: 'Keamanan akun',
    description:
      'Sesi login tersimpan aman dan bisa dicabut per perangkat, plus verifikasi dua langkah TOTP.',
  },
]

const SUPPORTING = [
  { icon: KeyRound, label: 'Kata sandi di-hash scrypt' },
  { icon: ListTree, label: 'Proteksi CSRF di setiap aksi' },
  { icon: Activity, label: 'Status sesi realtime lewat SSE' },
  { icon: FileText, label: 'Log audit aktivitas akun' },
]

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs2 font-semibold uppercase tracking-[0.14em] text-primary">
          Fitur
        </span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Semua yang dibutuhkan untuk mengelola bot WhatsApp
        </h2>
        <p className="mt-3 text-lead leading-relaxed text-muted-foreground">
          Dibangun sungguhan: nomor benar-benar tertaut ke WhatsApp, bot memakai Nano milik
          Anda, dan setiap perubahan tersimpan ke data yang memang dipakai bot.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <Reveal
            key={feature.title}
            as="article"
            delay={Math.min(index * 35, 300)}
            className={cn(
              'group rounded-[14px] border border-border bg-surface p-5',
              'transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong',
              'hover:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.85)]'
            )}
          >
            <span
              className="grid size-9 place-items-center rounded-[10px] border border-border bg-muted/50 text-muted-foreground transition-colors duration-300 group-hover:border-primary/30 group-hover:bg-primary-soft group-hover:text-primary"
              aria-hidden
            >
              <feature.icon className="size-4.5" />
            </span>
            <h3 className="mt-3.5 text-lead font-semibold tracking-tight">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-mid leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </Reveal>
        ))}
      </div>

      <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        {SUPPORTING.map((item) => (
          <li
            key={item.label}
            className="inline-flex items-center gap-2 text-mid text-muted-foreground"
          >
            <item.icon className="size-3.5 text-primary" aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
