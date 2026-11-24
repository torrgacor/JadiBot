'use client'

import { Reveal } from '@/components/marketing/reveal'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * "How it works".
 *
 * The steps mirror the actual dashboard flow, so a new user's first five
 * minutes match what this section promises.
 */

const STEPS = [
  {
    title: 'Buat akun',
    description:
      'Daftar dengan email dan kata sandi. Verifikasi email Anda, lalu opsional aktifkan verifikasi dua langkah.',
    detail: 'Sekitar 30 detik',
  },
  {
    title: 'Buat sesi bot',
    description:
      'Beri nama sesi, pilih apakah boleh menyambung ulang otomatis, dan atur jeda kirim yang Anda inginkan.',
    detail: 'Nama dan perilaku',
  },
  {
    title: 'Tautkan nomor WhatsApp',
    description:
      'Minta kode pairing lalu masukkan di ponsel lewat menu Perangkat Tertaut, atau scan kode QR yang tampil di panel.',
    detail: 'Kode asli dari WhatsApp',
  },
  {
    title: 'Atur bot dari panel',
    description:
      'Tentukan siapa yang boleh dijawab bot, aktifkan anticall, tambah owner, dan atur welcome serta antilink per grup.',
    detail: 'Ditulis ke data bot',
  },
  {
    title: 'Pantau dan rawat',
    description:
      'Ikuti log bot secara langsung, lihat pengguna dan AFK, dan atur nama, prefix, serta zona waktu dari panel.',
    detail: 'Log dan data asli',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border bg-surface/40 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs2 font-semibold uppercase tracking-[0.14em] text-primary">
            Cara kerja
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Dari daftar sampai bot Anda jalan
          </h2>
          <p className="mt-3 text-lead leading-relaxed text-muted-foreground">
            Lima langkah, tanpa perlu menyentuh terminal. Semuanya diatur dari panel.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.title}
              as="li"
              delay={index * 80}
              className="relative"
            >
              {/* connector line (desktop) */}
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[13px] top-8 hidden h-[calc(100%-8px)] w-px bg-gradient-to-b from-border-strong to-transparent lg:block"
                />
              ) : null}

              <div className="flex items-center gap-3">
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary-soft text-note font-semibold text-primary"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="font-mono text-eyebrow uppercase tracking-wide text-muted-foreground">
                  {step.detail}
                </span>
              </div>

              <h3 className="mt-3 text-lead font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-1.5 text-mid leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/register">
              Buat akun Anda
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/docs#quickstart">Baca panduan singkat</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
