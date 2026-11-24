'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  Bot,
  ChevronRight,
  LayoutDashboard,
  MessageCircle,
  Terminal,
  X,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Logo } from '@/components/brand/logo'
import { navSectionsForRole } from '@/components/dashboard/nav-config'
import type { TopbarUser } from '@/components/dashboard/topbar'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/enums'

/**
 * Mobile navigation.
 *
 * Two mechanisms, because they solve different problems:
 *
 *  - a **floating glass bottom bar** for the five destinations people actually
 *    switch between, inset from the screen edge with a real blur and a lift
 *    shadow so it reads as a surface hovering over the page;
 *  - a **floating glass drawer** for everything else, opening as a panel with
 *    its own account header.
 *
 * Both are touch-sized, and every entry resolves to a built page — the bottom
 * bar's last slot opens the drawer rather than being a fifth link, so no route
 * is stranded when the drawer is the only way to reach it.
 */

const BOTTOM_ITEMS = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/sessions', label: 'WhatsApp', icon: MessageCircle, exact: false },
  { href: '/dashboard/bot', label: 'Bot', icon: Bot, exact: true },
  { href: '/dashboard/bot/logs', label: 'Log', icon: Terminal, exact: false },
] as const

const BOTTOM_PATHS = BOTTOM_ITEMS.map((item) => item.href)

export function MobileNavDrawer({
  user,
  open,
  onClose,
}: {
  user: TopbarUser
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const sections = navSectionsForRole(user.role)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Close on navigation so the drawer never lingers over a new page.
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move focus into the dialog so keyboard users land on a control inside it,
    // not on whatever was behind the overlay (aria-modal promises this).
    const previouslyFocused = document.activeElement as HTMLElement | null
    requestAnimationFrame(() => closeRef.current?.focus())

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigasi"
    >
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-[3px] focus-visible:outline-2 focus-visible:outline-ring"
        onClick={onClose}
        aria-label="Tutup navigasi"
      />

      <div className="absolute inset-y-0 left-0 w-[88%] max-w-[350px] p-3">
        <div className="glass-strong flex h-full animate-drawer-in flex-col overflow-hidden rounded-[22px]">
          <div className="flex shrink-0 items-center justify-between px-4 pt-4">
            <Logo size={30} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-[11px] border border-border bg-glass text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Tutup navigasi"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* ── account header ─────────────────────────────────────────── */}
          <div className="mx-4 mt-4 shrink-0 rounded-[16px] border border-border bg-muted/50 p-3.5">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-label font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Masuk sebagai
                </p>
                <p className="mt-0.5 truncate text-body font-semibold">{user.name}</p>
                <p className="truncate text-xs2 text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-label font-semibold uppercase tracking-[0.1em] text-success"
                title="Sesi akun ini sedang aktif"
              >
                <span className="relative flex size-1.5" aria-hidden>
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                Aktif
              </span>
              <ThemeToggle />
            </div>
          </div>

          {/* ── menu ───────────────────────────────────────────────────── */}
          <nav
            className="no-scrollbar mt-3 flex-1 overflow-y-auto overscroll-contain px-3 pb-5"
            aria-label="Panel navigasi"
          >
            {sections.map((section, index) => (
              <div key={section.title || `s-${index}`} className={cn(index > 0 && 'mt-4')}>
                {section.title ? (
                  <h2 className="px-2 pb-1.5 text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                    {section.title}
                  </h2>
                ) : null}

                <ul role="list" className="space-y-0.5">
                  {section.items.map((item) => {
                    const active =
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href)

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'group flex items-center gap-3 rounded-[13px] px-2.5 py-2.5 text-mid-lg font-medium transition-colors',
                            active
                              ? 'bg-primary-soft text-primary'
                              : 'text-muted-foreground hover:bg-glass hover:text-foreground'
                          )}
                        >
                          <span
                            className={cn(
                              'grid size-7 shrink-0 place-items-center rounded-[9px] border transition-colors',
                              active
                                ? 'border-primary/30 bg-primary-soft text-primary'
                                : 'border-border bg-muted/60 text-muted-foreground group-hover:text-foreground'
                            )}
                            aria-hidden
                          >
                            <item.icon className="size-3.5" />
                          </span>

                          <span className="min-w-0 flex-1 truncate">{item.label}</span>

                          {item.badge ? (
                            <span className="rounded-full border border-primary/25 bg-primary-soft px-1.5 text-label font-semibold text-primary">
                              {item.badge}
                            </span>
                          ) : null}

                          <ChevronRight
                            className="size-3.5 shrink-0 text-muted-foreground/60"
                            aria-hidden
                          />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export function MobileBottomNav({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu: () => void
  menuOpen: boolean
}) {
  const pathname = usePathname()

  // The bar highlights the most specific matching route, so `/dashboard/bot/logs`
  // lights "Log" rather than also lighting "Bot".
  const activeHref = BOTTOM_PATHS.filter((href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  ).sort((a, b) => b.length - a.length)[0]

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Navigasi cepat"
    >
      <ul className="glass-float flex items-stretch overflow-hidden rounded-[20px] p-1.5">
        {BOTTOM_ITEMS.map((item) => {
          const active = item.href === activeHref

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[14px] py-1.5 text-xs2 font-semibold transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active ? (
                  <span
                    className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-primary shadow-[0_0_12px_var(--glow)]"
                    aria-hidden
                  />
                ) : null}
                <item.icon className="size-[19px]" aria-hidden />
                {item.label}
              </Link>
            </li>
          )
        })}

        <li className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            className={cn(
              'relative flex min-h-[44px] w-full flex-col items-center justify-center gap-1 rounded-[14px] py-1.5 text-xs2 font-semibold transition-colors',
              menuOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {menuOpen ? (
              <span
                className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-primary shadow-[0_0_12px_var(--glow)]"
                aria-hidden
              />
            ) : null}
            <LayoutDashboard className="size-[19px]" aria-hidden />
            Menu
          </button>
        </li>
      </ul>
    </nav>
  )
}
