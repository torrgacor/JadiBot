import Link from 'next/link'
import { LifeBuoy, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

const COLUMNS = [
  {
    title: 'Produk',
    links: [
      { href: '/features', label: 'Fitur' },
      { href: '/pricing', label: 'Harga' },
      { href: '/status', label: 'Status Sistem' },
      { href: '/register', label: 'Mulai Sekarang' },
    ],
  },
  {
    title: 'Sumber Daya',
    links: [
      { href: '/docs', label: 'Panduan' },
      { href: '/api-docs', label: 'Referensi API' },
      { href: '/docs#quickstart', label: 'Mulai Cepat' },
      { href: '/docs#engine', label: 'Asal Perintah' },
    ],
  },
  {
    title: 'Dukungan',
    links: [
      { href: '/help', label: 'Bantuan' },
      { href: '/dashboard/support/ticket', label: 'Buat Tiket' },
      { href: '/status', label: 'Status Layanan' },
      { href: '/faq', label: 'FAQ' },
      { href: '/docs', label: 'Panduan' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Ketentuan Layanan' },
      { href: '/privacy', label: 'Kebijakan Privasi' },
      { href: '/docs#acceptable-use', label: 'Penggunaan yang Wajar' },
      { href: '/privacy#data', label: 'Penanganan Data' },
    ],
  },
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-mid leading-relaxed text-muted-foreground">
              Panel Manajemen Bot WhatsApp Nano. Hubungkan, kelola, dan awasi bot
              WhatsApp Anda dari satu tempat.
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              Kredensial sesi hanya tersimpan di server Anda
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/dashboard/support/ticket"
                className="grid size-8 place-items-center rounded-[8px] border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                aria-label="Buat tiket dukungan"
              >
                <LifeBuoy className="size-3.5" />
              </Link>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs2 font-semibold uppercase tracking-[0.12em] text-foreground/70">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-mid text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NANO GATEWAY. Seluruh hak dilindungi.</p>
          <p className="text-muted-foreground/80">
            Tidak berafiliasi dengan, tidak didukung oleh, dan tidak disponsori oleh
            WhatsApp LLC maupun Meta Platforms, Inc.
          </p>
        </div>
      </div>
    </footer>
  )
}
