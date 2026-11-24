'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/features', label: 'Fitur' },
  { href: '/pricing', label: 'Harga' },
  { href: '/docs', label: 'Panduan' },
  { href: '/help', label: 'Bantuan' },
  { href: '/api-docs', label: 'API' },
  { href: '/status', label: 'Status' },
]

/**
 * Marketing navigation.
 *
 * `isAuthenticated` is passed in from the server layout so the header can show
 * "Dashboard" instead of "Login" without a client-side auth fetch.
 */
export function SiteNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled ? 'glass border-b border-border' : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Beranda NANO GATEWAY">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu utama">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[8px] px-3 py-2 text-mid font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />

          {isAuthenticated ? (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">Panel</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}

          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              {isAuthenticated ? 'Buka panel' : 'Mulai Sekarang'}
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:text-foreground sm:size-10 lg:hidden"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="glass-strong border-t border-border lg:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Menu mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-xs text-muted-foreground">Tampilan</span>
                <ThemeToggle />
              </div>

              {isAuthenticated ? (
                <Button asChild className="w-full">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    Buka panel
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Masuk
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Mulai Sekarang
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
