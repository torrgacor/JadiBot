'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Clock3, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip'
import { navSectionsForRole } from '@/components/dashboard/nav-config'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/enums'

/**
 * Sidebar.
 *
 * A solid, edge-to-edge panel: it reads as the chrome of the tool rather than a
 * card floating above it, and keeps the content column at a stable width. The
 * accent (primary) is used only to mark the active route — never as a fill.
 *
 * Active state is derived from the live pathname, with a longest-prefix match so
 * `/dashboard/sessions/new` highlights "Tambah Sesi" rather than also lighting
 * up "Sesi".
 */
export function Sidebar({
  role,
  collapsed,
  onToggleCollapse,
  className,
}: {
  role: UserRole
  collapsed: boolean
  onToggleCollapse: () => void
  className?: string
}) {
  const pathname = usePathname()
  const sections = navSectionsForRole(role)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('nano-recent-pages')
      setRecent(raw ? JSON.parse(raw) : [])
    } catch {
      setRecent([])
    }
  }, [pathname])

  const allItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections]
  )

  const recentItems = useMemo(
    () =>
      recent
        .map((href) => allItems.find((item) => item.href === href))
        .filter((item): item is (typeof allItems)[number] => Boolean(item))
        .filter((item) => item.href !== pathname)
        .slice(0, 3),
    [recent, allItems, pathname]
  )

  /** Longest matching href wins, so nested routes highlight the right item. */
  const activeHref = allItems
    .map((item) => item.href)
    .filter((href) =>
      href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
    )
    .sort((a, b) => b.length - a.length)[0]

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'flex h-full flex-col overflow-hidden border-r border-border bg-surface',
          className
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center gap-2 px-4',
            collapsed ? 'justify-center px-0' : 'justify-between'
          )}
        >
          {collapsed ? (
            <Tooltip label="NANO GATEWAY" side="right">
              <Link href="/dashboard" aria-label="Panel NANO GATEWAY">
                <Logo showText={false} size={30} />
              </Link>
            </Tooltip>
          ) : (
            <Link href="/dashboard" aria-label="Panel NANO GATEWAY">
              <Logo showText size={30} />
            </Link>
          )}

          {collapsed ? (
            <Tooltip label="Buka bilah samping" side="right">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden size-8 shrink-0 place-items-center rounded-[9px] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring lg:grid"
                aria-label="Buka bilah samping"
                aria-expanded={false}
              >
                <PanelLeftOpen className="size-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden size-8 shrink-0 place-items-center rounded-[9px] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring lg:grid"
              aria-label="Tutup bilah samping"
              aria-expanded
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>

        <nav
          className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-3 py-3"
          aria-label="Navigasi panel"
        >
          {recentItems.length > 0 && !collapsed ? (
            <div>
              <h2 className="mb-1.5 flex items-center gap-1.5 px-2.5 text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                <Clock3 className="size-3" aria-hidden />
                Terakhir dibuka
              </h2>
              <ul role="list" className="space-y-0.5 pb-2">
                {recentItems.map((item) => {
                  const active = item.href === activeHref
                  return (
                    <li key={`recent-${item.href}`}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-mid transition-colors',
                          active
                            ? 'text-primary'
                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-6 shrink-0 place-items-center rounded-[8px] border transition-colors',
                            active
                              ? 'border-primary/25 bg-primary-soft text-primary'
                              : 'border-border bg-muted/60'
                          )}
                          aria-hidden
                        >
                          <item.icon className="size-3" />
                        </span>
                        <span className="min-w-0 truncate">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div className="mx-2.5 h-px bg-border" aria-hidden />
            </div>
          ) : null}

          {sections.map((section, index) => (
            <div key={section.title || `section-${index}`} className={cn(index > 0 && 'mt-4')}>
              {section.title && !collapsed ? (
                <h2 className="px-2.5 pb-1.5 text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                  {section.title}
                </h2>
              ) : null}

              {section.title && collapsed ? (
                <div className="mx-2 mb-2 h-px bg-border" aria-hidden />
              ) : null}

              <ul role="list" className="space-y-0.5">
                {section.items.map((item) => {
                  const active = item.href === activeHref

                  const link = (
                    <Link
                      href={item.href}
                      aria-label={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-mid font-medium transition-all duration-200',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-primary-soft text-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      )}
                    >
                      {active ? (
                        <span
                          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary"
                          aria-hidden
                        />
                      ) : null}

                      <item.icon className="size-4 shrink-0" aria-hidden />

                      {!collapsed ? (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge ? (
                            <Badge tone="primary" size="sm" className="ml-auto">
                              {item.badge}
                            </Badge>
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  )

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip label={item.label} side="right">
                          {link}
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-2.5">
          {collapsed ? (
            <Tooltip label="Dokumentasi" side="right">
              <Link
                href="/docs"
                target="_blank"
                rel="noreferrer"
                aria-label="Dokumentasi"
                className="flex items-center justify-center rounded-[11px] px-0 py-2 text-mid text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                <BookOpen className="size-4 shrink-0" aria-hidden />
              </Link>
            </Tooltip>
          ) : (
            <Link
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-mid text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              <BookOpen className="size-4 shrink-0" aria-hidden />
              <span>Dokumentasi</span>
            </Link>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
