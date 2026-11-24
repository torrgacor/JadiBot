'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductPreview } from '@/components/marketing/product-preview'
import { Reveal } from '@/components/marketing/reveal'

/**
 * Hero.
 *
 * Entrance is a CSS scroll-reveal (components/marketing/reveal.tsx) rather than
 * the motion/react chunk, so the page does not ship ~125 KB of animation
 * machinery just to fade a few elements in. Nothing loops; under
 * `prefers-reduced-motion` the whole thing collapses to static output (the
 * global rule in globals.css zeroes the reveal transition).
 */

const BADGES = [
  { icon: Zap, label: 'Data langsung dari Nano' },
  { icon: ShieldCheck, label: 'Kode pairing & QR' },
  { icon: BookOpen, label: 'Panduan lengkap' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
      {/* ── background layers ─────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 aurora" />
        <div className="absolute inset-0 grid-background radial-fade opacity-40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* ── copy ──────────────────────────────────────────────────── */}
          <div>
            <Reveal className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Panel Manajemen Bot WhatsApp Nano
            </Reveal>

            {/* The heading and lede are the LCP: they paint on first frame as
                static server HTML. Keeping them out of the reveal means first
                paint is never blocked on the client bundle. */}
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Kelola Bot WhatsApp Anda
              <br />
              <span className="text-gradient">Langsung dari Satu Panel</span>
            </h1>

            <p className="mt-5 max-w-xl text-lead leading-relaxed text-muted-foreground">
              Hubungkan nomor dengan kode pairing atau QR, lalu atur perintah,
              fitur grup, pengguna, dan log bot dari satu panel. Semua datanya
              berasal dari script Nano yang benar-benar berjalan — tanpa simulasi.
            </p>

            <Reveal delay={180} className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Mulai Sekarang
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/docs">Panduan</Link>
              </Button>
            </Reveal>

            <Reveal delay={260} as="ul" className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              {BADGES.map((badge) => (
                <li
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <badge.icon className="size-3.5 text-primary" aria-hidden />
                  {badge.label}
                </li>
              ))}
            </Reveal>
          </div>

          {/* ── product preview ──────────────────────────────────────── */}
          <Reveal delay={150} className="relative">
            <ProductPreview />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
