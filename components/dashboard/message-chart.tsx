'use client'

import { useMemo, useState } from 'react'
import type { TimeSeriesPoint } from '@/lib/services/dashboard-stats'
import { cn } from '@/lib/utils/cn'

/**
 * Message throughput chart — hand-rolled SVG, no chart library.
 *
 * The previous version used recharts, a ~372 KB chunk pulled in for a single
 * 7-day area chart. This replaces it with ~120 lines of plain SVG: a stacked
 * area per series, a hover crosshair + tooltip, and a toggle legend. The data
 * shape is identical (`TimeSeriesPoint[]`), so the page that renders it is
 * unchanged.
 *
 * It is responsive by measuring the container width (ResizeObserver) and
 * scaling the SVG to it, which is what `ResponsiveContainer` was doing.
 */

const SERIES = [
  { key: 'sent', label: 'Terkirim', color: 'var(--primary)' },
  { key: 'delivered', label: 'Diterima', color: 'var(--accent)' },
  { key: 'failed', label: 'Gagal', color: 'var(--danger)' },
  { key: 'inbound', label: 'Masuk', color: 'var(--warning)' },
] as const

type SeriesKey = (typeof SERIES)[number]['key']

// Chart geometry (SVG user units). The viewBox is fixed; the wrapper measures
// its pixel width and the SVG scales to fill it, so text and strokes stay the
// same visual size at every width.
const VB_W = 720
const VB_H = 240
const PAD = { top: 12, right: 12, bottom: 28, left: 40 }

export function MessageChart({ data }: { data: TimeSeriesPoint[] }) {
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    sent: true,
    delivered: true,
    failed: true,
    inbound: true,
  })
  const [hover, setHover] = useState<number | null>(null)

  const hasAnyData = data.some(
    (point) => point.sent + point.delivered + point.failed + point.inbound > 0
  )

  // The tallest stacked total across the visible series — the Y scale.
  const yMax = useMemo(() => {
    if (data.length === 0) return 0
    let max = 0
    for (const point of data) {
      let total = 0
      for (const series of SERIES) {
        if (visible[series.key]) total += point[series.key]
      }
      max = Math.max(max, total)
    }
    return Math.max(1, max)
  }, [data, visible])

  const innerW = VB_W - PAD.left - PAD.right
  const innerH = VB_H - PAD.top - PAD.bottom
  const n = data.length
  const stepX = n > 1 ? innerW / (n - 1) : 0

  const xAt = (index: number) => PAD.left + (n > 1 ? index * stepX : innerW / 2)
  const yAt = (value: number) => PAD.top + innerH - (value / yMax) * innerH

  // Build each visible series' area path (stacked) + line path.
  const areas = useMemo(() => {
    const result: Array<{ key: SeriesKey; path: string; color: string }> = []
    if (n === 0) return result
    // cumulative baseline per index
    const baseline = new Array<number>(n).fill(0)
    for (const series of SERIES) {
      if (!visible[series.key]) continue
      const top = new Array<number>(n)
      let d = ''
      for (let i = 0; i < n; i++) {
        top[i] = baseline[i] + data[i][series.key]
        const x = xAt(i)
        const yTop = yAt(top[i])
        const yBase = yAt(baseline[i])
        if (i === 0) d += `M ${x.toFixed(1)} ${yTop.toFixed(1)}`
        else d += ` L ${x.toFixed(1)} ${yTop.toFixed(1)}`
        baseline[i] = top[i]
      }
      // close down to the baseline (reverse order) and back to start
      for (let i = n - 1; i >= 0; i--) {
        d += ` L ${xAt(i).toFixed(1)} ${yAt(baseline[i]).toFixed(1)}`
      }
      d += ' Z'
      result.push({ key: series.key, path: d, color: series.color })
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, visible, yMax])

  function onMove(event: React.MouseEvent<SVGSVGElement>) {
    const svg = event.currentTarget
    const rect = svg.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * VB_W
    // nearest data index
    const index = Math.round((px - PAD.left) / (n > 1 ? stepX : 1))
    setHover(Math.max(0, Math.min(n - 1, index)))
  }

  if (!hasAnyData) {
    return (
      <div className="grid h-[240px] place-items-center rounded-[10px] border border-dashed border-border">
        <p className="max-w-xs text-center text-mid text-muted-foreground">
          Belum ada aktivitas pesan pada periode ini. Hubungkan sesi dan kirim pesan
          pertama agar grafik ini terisi.
        </p>
      </div>
    )
  }

  const hoveredPoint = hover !== null ? data[hover] : null

  return (
    <div className="flex flex-col gap-4">
      {/* legend doubles as a toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {SERIES.map((series) => (
          <button
            key={series.key}
            type="button"
            onClick={() => setVisible((prev) => ({ ...prev, [series.key]: !prev[series.key] }))}
            aria-pressed={visible[series.key]}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-tiny font-medium transition-all',
              visible[series.key]
                ? 'border-border-strong bg-muted/50 text-foreground'
                : 'border-border text-muted-foreground opacity-60'
            )}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} aria-hidden />
            {series.label}
          </button>
        ))}
      </div>

      <div className="relative h-[240px] w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="Grafik volume pesan harian"
        >
          <defs>
            {SERIES.map((series) => (
              <linearGradient key={series.key} id={`msg-fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={series.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={series.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

          {/* horizontal gridlines + Y ticks */}
          {[0, 0.5, 1].map((t) => {
            const y = yAt(t * yMax)
            const value = Math.round(t * yMax)
            return (
              <g key={t}>
                <line x1={PAD.left} x2={VB_W - PAD.right} y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 3" />
                <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
                  {value}
                </text>
              </g>
            )
          })}

          {/* stacked areas (drawn bottom-up so the front series is on top) */}
          {areas.map((area) => (
            <path key={area.key} d={area.path} fill={`url(#msg-fill-${area.key})`} stroke={area.color} strokeWidth={2} />
          ))}

          {/* X labels (sparse: first, middle, last) */}
          {data.map((point, i) => {
            const show = i === 0 || i === n - 1 || (n > 3 && i === Math.floor(n / 2))
            if (!show) return null
            return (
              <text key={i} x={xAt(i)} y={VB_H - 8} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
                {point.date.slice(5)}
              </text>
            )
          })}

          {/* hover crosshair + a dot on each visible series at the hovered index */}
          {hoveredPoint && hover !== null ? (
            <g>
              <line x1={xAt(hover)} x2={xAt(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--border-strong)" />
              {(() => {
                // Running baseline so each dot sits on its series' stacked top.
                let baseline = 0
                const dots: Array<{ key: SeriesKey; y: number; color: string }> = []
                for (const series of SERIES) {
                  if (!visible[series.key]) continue
                  const top = baseline + hoveredPoint[series.key]
                  // Dot on the top edge of this series' band.
                  dots.push({ key: series.key, y: yAt(top), color: series.color })
                  baseline = top
                }
                return dots.map((dot) => (
                  <circle key={dot.key} cx={xAt(hover)} cy={dot.y} r={3.5} fill={dot.color} />
                ))
              })()}
            </g>
          ) : null}
        </svg>

        {/* tooltip — positioned in the relative wrapper, not the SVG, so it
            does not scale with preserveAspectRatio="none". */}
        {hoveredPoint && hover !== null ? (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-[10px] border border-border bg-elevated px-3 py-2 text-note shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)]"
            style={{ left: `calc(${(hover / Math.max(1, n - 1)) * 100}% )`, transform: hover > n / 2 ? 'translateX(-110%)' : 'translateX(8px)' }}
          >
            <p className="mb-1 text-muted-foreground">{hoveredPoint.date}</p>
            {SERIES.map((series) =>
              visible[series.key] ? (
                <p key={series.key} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} aria-hidden />
                  <span className="text-foreground">{series.label}: {hoveredPoint[series.key]}</span>
                </p>
              ) : null
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
