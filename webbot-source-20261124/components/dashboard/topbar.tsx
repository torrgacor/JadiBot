'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User as UserIcon,
  WifiOff,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/brand/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useRealtime } from '@/components/providers/realtime-provider'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { apiRequest } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils/cn'
import { timeAgo } from '@/lib/utils/format'
import type { UserRole } from '@/types/enums'

export interface TopbarNotification {
  id: string
  title: string
  message: string
  severity: string
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}

export interface TopbarUser {
  id: string
  name: string
  email: string
  username: string
  role: UserRole
  avatarUrl: string | null
  planName: string | null
}

/**
 * Topbar.
 *
 * Notifications are passed in from the server on first render and then extended
 * live over SSE, so the bell is correct immediately and stays correct without
 * polling.
 */
export function Topbar({
  user,
  initialNotifications,
  unreadCount,
  onOpenMobileNav,
}: {
  user: TopbarUser
  initialNotifications: TopbarNotification[]
  unreadCount: number
  onOpenMobileNav: () => void
}) {
  const router = useRouter()
  const { connected } = useRealtime()

  const [notifications, setNotifications] = useState(initialNotifications)
  const [unread, setUnread] = useState(unreadCount)
  const [signingOut, setSigningOut] = useState(false)

  async function markAllRead() {
    try {
      await apiRequest('/api/account/notifications', {
        method: 'PATCH',
        body: { action: 'read-all' },
      })
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() }))
      )
      setUnread(0)
    } catch {
      toast.error('Gagal menandai notifikasi sebagai sudah dibaca.')
    }
  }

  async function signOut() {
    setSigningOut(true)
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Gagal keluar. Silakan coba lagi.')
      setSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 sm:px-5">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="grid size-11 shrink-0 place-items-center rounded-[11px] border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground sm:size-9 lg:hidden"
        aria-label="Buka navigasi"
      >
        <Menu className="size-4" />
      </button>

      {/*
        Brand mark. The sidebar carries the wordmark from `lg` up, so the bar
        shows it only where the sidebar is hidden — never twice at once.
      */}
      <Link
        href="/dashboard"
        aria-label="NANO GATEWAY"
        className="inline-flex shrink-0 items-center gap-2 lg:hidden"
      >
        <LogoMark size={28} />
        <span className="hidden text-mid font-semibold tracking-tight sm:block">
          NANO<span className="text-primary"> GATEWAY</span>
        </span>
      </Link>

      <CommandPalette role={user.role} />
      <Link
        href="/dashboard/commands"
        className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-border bg-surface text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground md:hidden"
        aria-label="Cari perintah bot"
      >
        <Search className="size-4" aria-hidden />
      </Link>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Live transport state — honest about being offline. */}
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-label font-semibold uppercase tracking-[0.1em] backdrop-blur-sm',
            connected
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-warning/30 bg-warning/10 text-warning'
          )}
          title={
            connected
              ? 'Pembaruan langsung tersambung'
              : 'Pembaruan langsung sedang menyambung ulang — data bisa sesaat tertunda'
          }
        >
          {connected ? (
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success" />
              <span className="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
          ) : (
            <WifiOff className="size-3" aria-hidden />
          )}
          {/* On a narrow phone the dot alone carries the state; the label
              would crowd the bell and the account button. The text is hidden
              visually but kept for screen readers in both cases. */}
          <span className="hidden sm:inline">{connected ? 'Online' : 'Menyambung'}</span>
          <span className="sr-only">{connected ? 'Terhubung' : 'Sedang menyambung ulang'}</span>
        </span>

        <span className="hidden sm:block">
          <ThemeToggle />
        </span>

        {/* ── notifications ─────────────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-[11px] border border-border bg-surface text-muted-foreground backdrop-blur-sm hover:text-foreground"
              aria-label={
                unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'
              }
            >
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 grid min-w-[15px] place-items-center rounded-full bg-primary px-1 text-label font-semibold text-primary-foreground">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>

          {/* The panel is capped to the viewport so it cannot run off a phone. */}
          <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-1.5rem)] p-0">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <span className="text-mid font-semibold">Notifikasi</span>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-tiny text-primary transition-opacity hover:opacity-80"
                >
                  Tandai semua dibaca
                </button>
              ) : null}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3.5 py-8 text-center text-mid text-muted-foreground">
                  Tidak ada notifikasi baru.
                </p>
              ) : (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.actionUrl ?? '/dashboard'}
                    className={cn(
                      'flex gap-3 border-b border-border/60 px-3.5 py-3 transition-colors last:border-b-0 hover:bg-muted/40',
                      !item.readAt && 'bg-primary-soft/40'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1.5 size-1.5 shrink-0 rounded-full',
                        item.severity === 'error'
                          ? 'bg-danger'
                          : item.severity === 'warning'
                            ? 'bg-warning'
                            : item.severity === 'success'
                              ? 'bg-success'
                              : 'bg-info'
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-s font-medium">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-tiny leading-snug text-muted-foreground">
                        {item.message}
                      </span>
                      <span className="mt-1 block text-eyebrow text-muted-foreground/80">
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </Link>
                ))
              )}
            </div>

            <Link
              href="/dashboard/account/notifications"
              className="block border-t border-border px-3.5 py-2.5 text-center text-note text-muted-foreground transition-colors hover:text-foreground"
            >
              Lihat semua notifikasi
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── user menu ─────────────────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[11px] border border-border bg-glass/50 px-1.5 py-1 backdrop-blur-sm transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Menu akun"
            >
              <Avatar src={user.avatarUrl} name={user.name} size={26} />
              <span className="hidden max-w-[9rem] truncate text-s font-medium sm:block">
                {user.name}
              </span>
              <ChevronDown
                className="hidden size-3.5 text-muted-foreground sm:block"
                aria-hidden
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <span className="block truncate text-mid font-medium normal-case tracking-normal text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs2 font-normal normal-case tracking-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>

            {user.planName ? (
              <div className="px-2.5 pb-2">
                <Badge tone="primary" size="sm">
                  Paket {user.planName}
                </Badge>
              </div>
            ) : null}

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard/account/profile">
                <UserIcon />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/account/security">
                <Settings />
                Keamanan
              </Link>
            </DropdownMenuItem>
            {user.role !== 'USER' ? (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin">
                  <Check />
                  Panel admin
                </Link>
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuSeparator />

            <DropdownMenuItem destructive onClick={signOut} disabled={signingOut}>
              <LogOut />
              {signingOut ? 'Keluar…' : 'Keluar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
