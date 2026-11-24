'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Count-up number.
 *
 * The only client-side piece of `StatCard`. Keeping it separate lets StatCard
 * itself be a server component, which matters: a server page cannot pass an
 * icon *component* to a client component, because functions are not
 * serialisable across that boundary.
 *
 * Counts up once on mount. Respects `prefers-reduced-motion` by rendering the
 * value immediately, and always exposes the real number to assistive tech via
 * `aria-label` — the animation is decoration, never the source of truth.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
}: {
  value: number
  decimals?: number
}) {
  const [display, setDisplay] = useState(value)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const duration = 700

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      // easeOutExpo for a snappy settle.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplay(value * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value])

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display)

  return (
    <span aria-label={String(value)} className="tabular-nums">
      {formatted}
    </span>
  )
}
