'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** Sentinel for "no filter" — Radix requires a non-empty value on every item. */
const SEMUA = '__semua__'

/**
 * Command search and filters.
 *
 * Filtering happens on the server (the catalogue is a couple of hundred entries
 * of plugin metadata), so this only keeps the querystring in sync. `replace` is
 * used rather than `push` so typing does not fill the back button with a history
 * entry per keystroke, and the input is debounced so a fast typist causes one
 * request instead of twenty.
 *
 * Three filters, one querystring: `q` (free text, matches aliases too),
 * `category`, and `limit` (the bot's own rule — free or spends the daily limit).
 */
export function CommandSearch({
  initialQuery,
  category,
  limit,
  categories,
}: {
  initialQuery: string
  category?: string
  limit?: 'free' | 'limited'
  categories: Array<{ name: string; commands: number }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Write one filter into the querystring, leaving the others alone. */
  function navigate(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, next] of Object.entries(patch)) {
      if (next) params.set(key, next)
      else params.delete(key)
    }

    startTransition(() => {
      router.replace(`/dashboard/commands?${params.toString()}`, { scroll: false })
    })
  }

  useEffect(() => {
    // Skip the initial mount — the server already rendered this result.
    if (value === initialQuery) return

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => navigate({ q: value.trim() || null }), 300)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
    // `navigate` closes over the current querystring, which is re-read each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Cari perintah, alias, tag, atau deskripsi…"
          aria-label="Cari perintah"
          className="pr-20"
          icon={<Search />}
        />

        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
          ) : null}
          {value ? (
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label="Hapus pencarian"
              className="grid size-6 place-items-center rounded-[7px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </span>
      </div>

      <Select
        value={category ?? SEMUA}
        onValueChange={(next) => navigate({ category: next === SEMUA ? null : next })}
      >
        <SelectTrigger id="filter-kategori" className="sm:w-52" aria-label="Filter kategori">
          <SelectValue placeholder="Semua kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEMUA}>Semua kategori</SelectItem>
          {categories.map((entry) => (
            <SelectItem key={entry.name} value={entry.name}>
              <span className="inline-flex w-full items-center justify-between gap-3">
                <span>{entry.name}</span>
                <span className="text-muted-foreground">{entry.commands}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={limit ?? SEMUA}
        onValueChange={(next) =>
          navigate({ limit: next === SEMUA ? null : (next as 'free' | 'limited') })
        }
      >
        <SelectTrigger id="filter-limit" className="sm:w-44" aria-label="Filter limit">
          <SelectValue placeholder="Semua limit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEMUA}>Semua limit</SelectItem>
          <SelectItem value="free">Gratis (tanpa limit)</SelectItem>
          <SelectItem value="limited">Pakai limit</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
