import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, Lock, ShieldCheck, Zap } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo'
import { AuthBackground } from '@/components/auth/auth-bg'
import { StatusPill } from '@/components/ui/status-dot'

/**
 * Auth page frame.
 *
 * Split on desktop — a visual panel on the left, the glass authentication card
 * on the right — and single column on phones, where the brand panel is dropped
 * entirely so the card is the first and only thing in view. The form column is
 * first in the DOM for that reason; `lg:order-*` is what puts the artwork on
 * the left once there is room for it.
 *
 * This is presentation only. The card holds whatever the page hands over —
 * every field, request and redirect still lives in the existing auth forms.
 */
export function AuthShell({
  title,
  description,
  eyebrow,
  children,
  footer,
}: {
  title: string
  description?: string
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <AuthBackground />

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[1440px] lg:grid-cols-[1.06fr_1fr]">
        {/* ── form side (first in DOM: on a phone this is all you see) ──── */}
        <div className="order-1 flex flex-col justify-center px-5 py-9 sm:px-8 lg:order-2 lg:px-10 lg:py-14 xl:px-16">
          <div className="mx-auto w-full max-w-[440px]">
            <Link
              href="/"
              aria-label="Kembali ke beranda NANO BOT PANEL"
              className="inline-flex animate-fade-up items-center gap-3 rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <LogoMark size={36} className="rounded-[12px]" />
              <span className="flex flex-col leading-none">
                <span className="text-lead font-bold tracking-[0.14em]">
                  NANO <span className="text-primary">BOT</span> PANEL
                </span>
                <span className="mt-1.5 text-label uppercase tracking-[0.34em] text-muted-foreground">
                  WhatsApp Control
                </span>
              </span>
            </Link>

            <div className="relative mt-6">
              {/* Ambient green bloom sitting behind the card. */}
              <span
                aria-hidden
                className="auth-anim-bloom pointer-events-none absolute -inset-8 -z-10 rounded-[44px] blur-3xl"
                style={{
                  background:
                    'radial-gradient(58% 55% at 50% 42%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 72%)',
                }}
              />

              <section className="auth-card animate-fade-up px-5 py-6 sm:px-7 sm:py-7" style={{ animationDelay: '70ms' }}>
                <span className="auth-hairline" aria-hidden />

                <header>
                  <span className="auth-eyebrow">
                    <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--glow)]" />
                    {eyebrow ?? 'Secure access'}
                  </span>

                  <h1 className="mt-3.5 text-[25px] font-bold leading-[1.14] tracking-tight sm:text-[27px]">
                    {title}
                  </h1>

                  {description ? (
                    <p className="mt-2.5 text-mid-lg leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                </header>

                <div className="mt-6">{children}</div>
              </section>
            </div>

            {footer ? (
              <div
                className="mt-5 animate-fade-up text-center text-mid leading-relaxed text-muted-foreground"
                style={{ animationDelay: '150ms' }}
              >
                {footer}
              </div>
            ) : null}
          </div>
        </div>

        {/* ── brand side ────────────────────────────────────────────────── */}
        <aside className="relative hidden overflow-hidden border-l border-border/70 lg:order-1 lg:flex lg:flex-col lg:justify-center px-12 xl:px-16">
          {/* HUD corner brackets. */}
          <span aria-hidden className="absolute left-8 top-8 size-7 border-l border-t border-primary/45" />
          <span aria-hidden className="absolute right-8 top-8 size-7 border-r border-t border-primary/45" />
          <span aria-hidden className="absolute bottom-8 left-8 size-7 border-b border-l border-primary/45" />
          <span aria-hidden className="absolute bottom-8 right-8 size-7 border-b border-r border-primary/45" />

          <div className="animate-fade-up max-w-[440px]">
            <span className="auth-eyebrow">Nano gateway</span>

            <p className="mt-5 text-[30px] font-bold leading-[1.2] tracking-tight xl:text-[34px]">
              Satu panel untuk mengelola{' '}
              <span className="text-gradient-neon">bot WhatsApp Nano</span> Anda.
            </p>

            <p className="mt-4 text-body leading-relaxed text-muted-foreground">
              Hubungkan nomor dengan kode pairing atau QR, lalu atur perintah, fitur grup, dan data
              bot — semuanya berasal dari script Nano yang benar-benar berjalan.
            </p>
          </div>

          {/* Live status mock: the "living" heart of the panel. Purely
              illustrative (decorative, aria-hidden) — it shows what the
              dashboard actually looks like without leaking real data. */}
          <div
            aria-hidden
            className="auth-livecard animate-fade-up mt-9 max-w-[440px] rounded-[16px] border border-primary/20 bg-white/[0.03] p-4 backdrop-blur-md"
            style={{ animationDelay: '90ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-label font-semibold uppercase tracking-[0.16em] text-white/60">
                <Zap className="size-3.5 text-primary" />
                Bot Nano
              </span>
              <StatusPill status="CONNECTED" className="border-white/12 bg-white/6" />
            </div>

            <p className="mt-3 font-display text-[22px] font-bold tracking-tight">
              +62 8xx-xxxx-1234
            </p>
            <p className="mt-0.5 text-tiny text-white/50">aktif 2j 14m · 48 plugin · 12 grup</p>

            {/* A few "live" activity rows, fading toward the bottom. */}
            <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
              {[
                { tag: 'GRUP', text: 'Balasan otomatis dikirim ke 3 grup', time: 'baru saja' },
                { tag: 'KUNJUNGAN', text: '5 pengguna baru hari ini', time: '2m' },
                { tag: 'PERINTAH', text: '.menu dipanggil oleh 12 pengguna', time: '9m' },
              ].map((row, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 text-s"
                  style={{ opacity: 1 - i * 0.22 }}
                >
                  <span className="inline-flex w-16 shrink-0 justify-center rounded-[6px] border border-primary/25 bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-primary">
                    {row.tag}
                  </span>
                  <span className="truncate text-white/80">{row.text}</span>
                  <span className="ml-auto shrink-0 text-tiny text-white/40">{row.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="mt-9 animate-fade-up space-y-4" style={{ animationDelay: '130ms' }}>
            {[
              {
                icon: ShieldCheck,
                title: 'Keamanan diutamakan',
                detail: 'Kata sandi terenkripsi, sesi bisa dicabut per perangkat, dan tersedia verifikasi dua langkah.',
              },
              {
                icon: Lock,
                title: 'Kredensial tetap milik Anda',
                detail: 'Kredensial sesi WhatsApp hanya tersimpan di server Anda, tidak pernah dikirim ke pihak lain.',
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span
                  className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[11px] border border-primary/25 bg-primary-soft text-primary"
                  aria-hidden
                >
                  <item.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-mid-lg font-medium">{item.title}</span>
                  <span className="mt-1 block text-s leading-relaxed text-muted-foreground">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/features"
            className="mt-10 inline-flex animate-fade-up items-center gap-1.5 text-mid font-medium text-primary"
            style={{ animationDelay: '170ms' }}
          >
            Lihat semua fitur
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </aside>
      </div>
    </div>
  )
}

/** Inline error banner used by every auth form. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="animate-fade-in overflow-hidden rounded-[12px] border border-danger/35 bg-danger/10 px-3.5 py-3 text-mid leading-relaxed text-danger"
    >
      {message}
    </div>
  )
}

/** Inline success banner. */
export function FormNotice({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="animate-fade-in overflow-hidden rounded-[12px] border border-success/35 bg-success/10 px-3.5 py-3 text-mid leading-relaxed text-success"
    >
      {message}
    </div>
  )
}
