'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownToLine, Copy, Pause, Play, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import type { NanoLogBatch, NanoLogLevel, NanoLogLine } from '@/lib/engine/nano'
import { cn } from '@/lib/utils/cn'

/**
 * Live bot log viewer.
 *
 * Shows the tail of what the bot process itself printed. The server keeps a
 * bounded ring buffer per session and this component polls it with a cursor
 * (`since`), so each poll only transfers new lines — the same technique the
 * gateway uses to read the bot's bridge results.
 */

const POLL_MS = 2500
/** Keep the browser-side history bounded the way the server does. */
const MAX_RENDERED = 800

const LEVELS: Array<{ value: NanoLogLevel | 'all'; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Sukses' },
  { value: 'warn', label: 'Peringatan' },
  { value: 'error', label: 'Error' },
]

const LEVEL_CLASS: Record<NanoLogLevel, string> = {
  info: 'text-white/55',
  success: 'text-primary',
  warn: 'text-warning',
  error: 'text-danger',
}

const LEVEL_BADGE: Record<NanoLogLevel, 'neutral' | 'primary' | 'warning' | 'danger'> = {
  info: 'neutral',
  success: 'primary',
  warn: 'warning',
  error: 'danger',
}

export function LogViewer({
  sessionId,
  running,
  compact = false,
  className,
}: {
  sessionId: string
  /** Whether the gateway currently holds this session (i.e. there is output). */
  running: boolean
  /**
   * Shorter panel with the level/search filters hidden — for embedding on the
   * dashboard, where the full-height console would dominate the page. Behaviour
   * (polling, cursor, auto-follow) is identical.
   */
  compact?: boolean
  className?: string
}) {
  const [lines, setLines] = useState<NanoLogLine[]>([])
  const [nextSeq, setNextSeq] = useState(0)
  const [paused, setPaused] = useState(false)
  const [level, setLevel] = useState<NanoLogLevel | 'all'>('all')
  const [search, setSearch] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [live, setLive] = useState(running)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const cursorRef = useRef(0)

  const load = useCallback(async () => {
    try {
      const batch = await apiRequest<NanoLogBatch & { running: boolean }>(
        `/api/bot/logs?since=${cursorRef.current}&sessionId=${encodeURIComponent(sessionId)}`
      )

      cursorRef.current = batch.nextSeq
      setNextSeq(batch.nextSeq)
      setLive(batch.running)
      setError(null)

      if (batch.lines.length > 0) {
        setLines((previous) => [...previous, ...batch.lines].slice(-MAX_RENDERED))
      }
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }, [sessionId])

  // Full refresh when the session changes.
  useEffect(() => {
    cursorRef.current = 0
    setLines([])
    setNextSeq(0)
    void load()
  }, [load])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => void load(), POLL_MS)
    return () => clearInterval(timer)
  }, [load, paused])

  // Follow the tail unless the reader has scrolled up or paused.
  useEffect(() => {
    if (!autoScroll || paused) return
    const element = scrollRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [lines, autoScroll, paused])

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return lines.filter((line) => {
      if (level !== 'all' && line.level !== level) return false
      if (needle && !line.text.toLowerCase().includes(needle)) return false
      return true
    })
  }, [lines, level, search])

  const counts = useMemo(() => {
    const tally = { info: 0, success: 0, warn: 0, error: 0 }
    for (const line of lines) tally[line.level] += 1
    return tally
  }, [lines])

  async function copyAll() {
    if (visible.length === 0) {
      toast.error('Tidak ada log untuk disalin.')
      return
    }
    const text = visible
      .map((line) => `${new Date(line.at).toISOString()} [${line.level}] ${line.text}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${visible.length} baris log disalin.`)
    } catch {
      toast.error('Clipboard tidak bisa diakses browser ini.')
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-[12px] border border-border bg-[#0b0d10]', className)}>
      {/* ── toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs2 uppercase tracking-wide text-white/40">
          keluaran bot
        </span>

        <Badge tone={live ? 'primary' : 'neutral'} size="sm" dot>
          {live ? 'mengalir' : 'diam'}
        </Badge>
        {counts.error > 0 ? (
          <Badge tone="danger" size="sm">
            {counts.error} error
          </Badge>
        ) : null}
        {counts.warn > 0 ? (
          <Badge tone="warning" size="sm">
            {counts.warn} warning
          </Badge>
        ) : null}

        <span className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-xs2 text-white/35 sm:inline">
            kursor {nextSeq}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void load()}
            title="Ambil baris baru sekarang"
            aria-label="Muat ulang log"
            className="text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            <RefreshCw />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPaused((value) => !value)}
            title={paused ? 'Lanjutkan aliran log' : 'Jeda aliran log'}
            aria-label={paused ? 'Lanjutkan aliran log' : 'Jeda aliran log'}
            className="text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            {paused ? <Play /> : <Pause />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void copyAll()}
            title="Salin baris yang terlihat"
            aria-label="Salin log"
            className="text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setLines([])
              setAutoScroll(true)
            }}
            title="Bersihkan tampilan ini (bot tetap mencatat log)"
            aria-label="Bersihkan tampilan"
            className="text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            <Trash2 />
          </Button>
        </span>
      </div>

      {/* ── filters ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2',
          compact && 'hidden'
        )}
      >
        <div className="flex flex-wrap gap-1">
          {LEVELS.map((entry) => (
            <button
              key={entry.value}
              type="button"
              onClick={() => setLevel(entry.value)}
              aria-pressed={level === entry.value}
              className={cn(
                'rounded-[7px] px-2 py-1 font-mono text-xs2 transition-colors',
                level === entry.value
                  ? 'bg-white/[0.10] text-white'
                  : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter teks…"
            aria-label="Filter baris log"
            className="h-8 border-white/[0.08] bg-white/[0.04] pl-8 font-mono text-tiny text-white placeholder:text-white/25"
          />
        </div>
      </div>

      {/* ── output ──────────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const element = event.currentTarget
          const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 24
          setAutoScroll(atBottom)
        }}
        className={cn(
          'overflow-y-auto px-3 py-2 font-mono text-tiny leading-relaxed',
          compact ? 'h-[196px]' : 'h-[360px] lg:h-[520px]'
        )}
        role="log"
        aria-live="polite"
      >
        {error ? (
          <p className="py-2 text-danger">
            {error}
          </p>
        ) : visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-white/45">
              {lines.length === 0 ? 'Belum ada output dari bot.' : 'Tidak ada baris yang cocok filter.'}
            </p>
            <p className="max-w-md text-xs2 text-white/30">
              {lines.length === 0
                ? 'Log berasal dari proses bot yang sedang berjalan. Jalankan bot supaya outputnya muncul di sini.'
                : 'Ubah filter level atau kata kunci.'}
            </p>
          </div>
        ) : (
          visible.map((line) => (
            <div key={line.seq} className="flex gap-2.5 py-[1px] hover:bg-white/[0.03]">
              <span className="shrink-0 text-white/25">
                {new Date(line.at).toLocaleTimeString('id-ID')}
              </span>
              <span
                className={cn('w-14 shrink-0', LEVEL_CLASS[line.level])}
                title={line.stream}
              >
                {line.level}
              </span>
              <span className="min-w-0 whitespace-pre-wrap break-words text-white/85">
                {line.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── footer ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] px-3 py-2 text-xs2 text-white/35">
        <span>
          {visible.length} / {lines.length} baris
        </span>
        {paused ? (
          <span className="text-warning">dijeda</span>
        ) : (
          <span>memantau tiap {POLL_MS / 1000}s</span>
        )}
        <button
          type="button"
          onClick={() => {
            setAutoScroll(true)
            const element = scrollRef.current
            if (element) element.scrollTop = element.scrollHeight
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1 transition-colors hover:bg-white/[0.06] hover:text-white/70"
        >
          <ArrowDownToLine className="size-3" />
          {autoScroll ? 'mengikuti baris terbaru' : 'lompat ke terbaru'}
        </button>
      </div>
    </div>
  )
}
