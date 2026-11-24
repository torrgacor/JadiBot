'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/** The handful of elements the reveals actually need. A bounded union keeps the
 *    component's props type simple (the full intrinsic-elements union is too
 *    large for the type-checker to represent in some configs). */
type RevealTag = 'div' | 'li' | 'ul' | 'article' | 'span' | 'section'

/**
 * Reveal — a CSS + IntersectionObserver entrance, replacing `motion/react`
 * for the marketing pages.
 *
 * It exists to drop the ~125 KB `motion` chunk out of every marketing page
 * (which is all it was ever used for: a fade-up on scroll-into-view). The
 * behaviour is intentionally limited to what those pages used:
 *
 *   • fade up 12px → 0 over ~0.5s when the element scrolls into view,
 *   • an optional `delay`,
 *   • `once` so it does not re-trigger on every scroll (the default here).
 *
 * It does NOT do springs, layout animation, or gestures — those were never
 * used, so dropping them costs nothing.
 *
 * Under `prefers-reduced-motion` the element is always visible: the observer
 * still toggles the class, but the CSS rule that drives the transform is
 * disabled globally (see globals.css), so there is no movement and no risk of
 * the content staying invisible if the script fails to load.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  /** Entrance delay in milliseconds. */
  delay?: number
  /** HTML element to render as. Defaults to `div`. */
  as?: RevealTag
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '-60px 0px', threshold: 0.05 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', shown && 'reveal-shown', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
