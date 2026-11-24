import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'

/**
 * Typeface pair.
 *
 * Two families, no more: Space Grotesk carries headings and numbers — it has
 * the technical, instrument-panel character that suits a bot console — while
 * Inter stays the body face for long copy and small controls. Both are
 * self-hosted by `next/font`, so there is no render-blocking request to Google
 * and no layout shift.
 */
const displayFont = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
  variable: '--font-sans-display',
})

const bodyFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-body',
})

/**
 * Absolute origin for generated metadata (the icon link and `og:image`).
 *
 * Crawlers ignore relative image URLs, so without this the generated
 * `/opengraph-image` link resolves to nothing and shared links show no preview.
 * `NEXT_PUBLIC_APP_URL` is the address the app talks to *itself* on — the
 * gateway pushes realtime events there — which on a tunneled deployment is the
 * loopback origin, not the public one. The public origin is therefore
 * configured separately as `SITE_URL`.
 *
 * A static `metadata` object is resolved when the app is built, not per
 * request, so `SITE_URL` must be present at build time.
 */
function resolveSiteUrl(): string {
  const raw =
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  try {
    return new URL(raw).origin
  } catch {
    // A malformed value should degrade to a working page, not break every
    // route — the fallback is noisy in the build log instead.
    console.warn(`[metadata] SITE_URL is not a valid URL (${raw}); using localhost.`)
    return 'http://localhost:3000'
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: 'NANO GATEWAY — Panel Manajemen Bot WhatsApp',
    template: '%s · NANO GATEWAY',
  },
  description:
    'Hubungkan, kelola, dan pantau bot WhatsApp Nano Anda dari satu panel. Login dengan kode pairing atau QR, atur perintah, grup, dan data bot secara langsung.',
  applicationName: 'NANO GATEWAY',
  keywords: [
    'Panel Bot WhatsApp',
    'Bot WhatsApp Nano',
    'Login Pairing Code',
    'Login QR WhatsApp',
    'Manajemen Bot',
  ],
  openGraph: {
    title: 'NANO GATEWAY — Panel Manajemen Bot WhatsApp',
    description:
      'Hubungkan, kelola, dan pantau bot WhatsApp Nano Anda dari satu panel.',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0e16' },
    { media: '(prefers-color-scheme: light)', color: '#eef1f4' },
  ],
  width: 'device-width',
  initialScale: 1,
  // Never block zoom — pinch-zoom is an accessibility requirement.
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /*
    The per-request CSP nonce, set by `middleware.ts`. Next tags its own scripts
    automatically; this is for the one library that writes an inline script of
    its own (next-themes, applying the stored theme before first paint).
  */
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider nonce={nonce}>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
