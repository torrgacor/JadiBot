'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Hand-rolled SVG sparkline — no chart library (we dropped recharts for exactly
 * this reason: a few KB, not 372 KB). Renders a thin area line with a soft
 * gradient fill. Purely presentational; pass already-computed numbers.
 *
 * Respects `prefers-reduced-motion` by not animating the line draw.
 */
export function Sparkline({
  data,
  className,
  tone = 'current',
}: {
  /** Ordered, oldest → newest. At least 2 points. */
  data: number[]
  className?: string
  /** CSS color for stroke + gradient (defaults to `currentColor`). */
  tone?: string
}) {
  const id = useId()
  const W = 100
  const H = 32
  const PAD = 2

  if (data.length < 2) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const stepX = W / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
    return [x, y] as const
  })

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`

  const last = points[points.length - 1]
  const color = tone === 'current' ? 'currentColor' : tone

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn('block h-8 w-full', className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="1.8" fill={color} />
    </svg>
  )
}
