'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A number that fades in once on mount instead of counting up.
 *
 * `AnimatedNumber` (count-up) is kept for the single hero figure where the
 * motion reads as "alive". For a *grid* of stat cards, count-up on every card
 * is noise — a quiet fade is calmer.
 *
 * Exported as a **component** (`<FadeNumber/>`), not a function call: a plain
 * function like the old `fadeOnce(value)` could not be invoked from a server
 * component (StatCard is a server component) — React would throw
 * "attempted to call a client function from the server". Rendering it as a
 * client *component* is the correct bridge: the server renders the element,
 * the client takes over the fade.
 */
export function FadeNumber({
  value,
  decimals = 0,
}: {
  value: number
  decimals?: number
}) {
  const [shown, setShown] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)

  return (
    <span
      aria-label={String(value)}
      className="tabular-nums transition-opacity duration-500 motion-reduce:transition-none"
      style={{ opacity: shown ? 1 : 0 }}
    >
      {formatted}
    </span>
  )
}
