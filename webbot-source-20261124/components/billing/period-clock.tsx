'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCountdown, daysLeftLabel } from '@/lib/utils/trial'

/**
 * Live countdown to a deadline — a free trial or a paid period end.
 *
 * The deadline is not computed here. It arrives as an ISO timestamp that the
 * server read from the subscription row, together with the string the server
 * already rendered. The first client paint reuses that string, so there is no
 * hydration mismatch and no flash of a wrong number.
 *
 * The tick is presentation only, and deliberately so. Nothing in the browser can
 * extend an entitlement: the server compares the stored deadline against its own
 * clock on every read, and when the countdown reaches zero this asks for a
 * refresh so the server re-evaluates — persisting an expired trial, or, for a
 * paid period, letting the access watchdog stop what is no longer paid for.
 * Closing the tab, freezing timers or winding the device clock forward or back
 * buys exactly zero extra seconds.
 *
 * Generic on purpose: the free trial and the paid plan both end on a date, and
 * two countdowns that could drift apart would be worse than one.
 */

function useMsLeft(expiresAt: string, initialMsLeft: number): number {
  const router = useRouter()
  const [msLeft, setMsLeft] = useState(Math.max(0, initialMsLeft))

  useEffect(() => {
    const target = new Date(expiresAt).getTime()
    if (Number.isNaN(target)) return

    const tick = () => setMsLeft(Math.max(0, target - Date.now()))
    tick()

    const timer = setInterval(tick, 1_000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const done = msLeft <= 0

  useEffect(() => {
    if (!done) return
    // The server owns the verdict; give it a moment, then let it deliver it.
    const timer = setTimeout(() => router.refresh(), 1_500)
    return () => clearTimeout(timer)
  }, [done, router])

  return msLeft
}

/** "2 Hari 23 Jam 59 Menit" */
export function PeriodCountdown({
  expiresAt,
  initialMsLeft,
  className,
}: {
  expiresAt: string
  /** Milliseconds left as the server computed them. */
  initialMsLeft: number
  className?: string
}) {
  const msLeft = useMsLeft(expiresAt, initialMsLeft)
  return (
    <span className={className} suppressHydrationWarning>
      {formatCountdown(msLeft)}
    </span>
  )
}

/** "3 DAYS LEFT" / "1 DAY LEFT" / "EXPIRED" */
export function PeriodDaysLeft({
  expiresAt,
  initialMsLeft,
  className,
}: {
  expiresAt: string
  initialMsLeft: number
  className?: string
}) {
  const msLeft = useMsLeft(expiresAt, initialMsLeft)
  return (
    <span className={className} suppressHydrationWarning>
      {daysLeftLabel(msLeft)}
    </span>
  )
}
