'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowRight, Command, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { navSectionsForRole } from '@/components/dashboard/nav-config'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/enums'

interface PaletteItem {
  label: string
  href: string
  section: string
  keywords: string
}

export function CommandPalette({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  const items = useMemo<PaletteItem[]>(() => {
    return navSectionsForRole(role).flatMap((section) =>
      section.items.map((item) => ({
        label: item.label,
        href: item.href,
        section: section.title || 'Navigasi',
        keywords: `${item.label} ${section.title} ${item.href}`.toLowerCase(),
      }))
    )
  }, [role])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.keywords.includes(q))
  }, [items, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === 'k'
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function go(href: string) {
    setOpen(false)
    if (href !== pathname) router.push(href)
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault()
      go(filtered[activeIndex].href)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 max-w-md flex-1 items-center gap-2 rounded-[11px] border border-border bg-muted/60 px-3 text-mid text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground md:flex"
        aria-label="Buka pencarian cepat (Ctrl+K)"
      >
        <Search className="size-3.5" aria-hidden />
        <span className="flex-1 text-left">Cari halaman, bot, perintah…</span>
        <span className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-surface px-1.5 py-0.5 text-label font-medium text-muted-foreground/80">
          <Command className="size-2.5" aria-hidden />K
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Pencarian cepat</DialogTitle>
            <DialogDescription>Navigasi cepat ke halaman dashboard</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Cari halaman, bot, sesi, perintah…"
              className="h-8 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Cari"
            />
            <kbd className="hidden rounded-[6px] border border-border bg-muted/70 px-1.5 py-0.5 text-label text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>

          <div className="max-h-[22rem] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-mid text-muted-foreground">
                Tidak ada hasil untuk "{query}".
              </p>
            ) : (
              <ul role="listbox" aria-label="Hasil pencarian">
                {filtered.map((item, idx) => {
                  const active = idx === activeIndex
                  return (
                    <li key={item.href} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => go(item.href)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors',
                          active ? 'bg-primary-soft text-primary' : 'hover:bg-muted/70'
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-mid font-medium">
                            {item.label}
                          </span>
                          <span className="block truncate text-xs2 text-muted-foreground">
                            {item.section}
                          </span>
                        </span>
                        <ArrowRight
                          className={cn(
                            'size-3.5 shrink-0',
                            active ? 'opacity-100' : 'opacity-0'
                          )}
                          aria-hidden
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-eyebrow text-muted-foreground">
            <span className="flex items-center gap-3">
              <span>↑↓ pilih</span>
              <span>↵ buka</span>
            </span>
            <span>Esc tutup</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
