'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar, type TopbarNotification, type TopbarUser } from '@/components/dashboard/topbar'
import { MobileBottomNav, MobileNavDrawer } from '@/components/dashboard/mobile-nav'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import { cn } from '@/lib/utils/cn'
import { usePathname } from 'next/navigation'

/**
 * Dashboard shell.
 *
 * Layout state (sidebar collapsed / drawer open) lives here rather than in the
 * server layout, because it is purely presentational. The collapsed preference
 * is persisted so it survives navigation.
 */
export function DashboardShell({
  user,
  notifications,
  unreadCount,
  children,
}: {
  user: TopbarUser
  notifications: TopbarNotification[]
  unreadCount: number
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const stored = window.localStorage.getItem('nano-sidebar-collapsed')
    if (stored === '1') setCollapsed(true)
  }, [])

  // Track recently visited dashboard pages for sidebar "recent" section.
  useEffect(() => {
    if (!pathname?.startsWith('/dashboard')) return
    try {
      const key = 'nano-recent-pages'
      const raw = window.localStorage.getItem(key)
      const prev: string[] = raw ? JSON.parse(raw) : []
      const next = [pathname, ...prev.filter((p) => p !== pathname)].slice(0, 5)
      window.localStorage.setItem(key, JSON.stringify(next))
    } catch {
      /* ignore quota/parse errors */
    }
  }, [pathname])

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem('nano-sidebar-collapsed', next ? '1' : '0')
      return next
    })
  }, [])

  return (
    <RealtimeProvider>
      <div className="flex min-h-dvh bg-background">
        {/*
          Desktop sidebar. A solid, edge-to-edge panel: it reads as the chrome
          of the tool, and keeps the content column on a stable full-bleed
          width instead of a floating card's inset. The wrapper's padding is
          just the panel's own inset from the viewport.
        */}
        <div
          className={cn(
            'sticky top-0 hidden h-dvh shrink-0 border-r border-border transition-[width] duration-300 lg:block',
            collapsed ? 'w-[76px]' : 'w-[264px]'
          )}
        >
          <Sidebar
            role={user.role}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
          />
        </div>

        <MobileNavDrawer
          user={user}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            user={user}
            initialNotifications={notifications}
            unreadCount={unreadCount}
            onOpenMobileNav={() => setDrawerOpen(true)}
          />

          {/*
            Bottom padding clears the floating mobile nav bar (bar + its 12px
            inset) plus any home-indicator inset. `overflow-x-clip` stops a stray
            wide row — a long JID, an unbroken log line — from side-scrolling the
            whole page on a phone; it is `clip`, not `hidden`, because `hidden`
            would turn this element into a scroll container and break the sticky
            topbar above it. The page transition lives in `template.tsx`, which
            re-mounts per navigation — animating here too would nest two.
          */}
          <main className="min-w-0 flex-1 overflow-x-clip px-3.5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 lg:px-7 lg:pb-7 lg:pt-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        <MobileBottomNav
          menuOpen={drawerOpen}
          onOpenMenu={() => setDrawerOpen(true)}
        />
      </div>
    </RealtimeProvider>
  )
}
