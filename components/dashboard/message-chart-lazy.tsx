'use client'

import dynamic from 'next/dynamic'
import type { TimeSeriesPoint } from '@/lib/services/dashboard-stats'

/**
 * Lazy wrapper for the message chart.
 *
 * The chart is a client component (hover state, ResizeObserver-style
 * responsiveness) so it is code-split and only pulled in when the "Bot Saya"
 * page actually renders it. The rest of the page — and the rest of the
 * dashboard — does not pay for it. A plain box is the fallback so the layout
 * does not shift when the chunk arrives.
 *
 * (The underlying chart is hand-rolled SVG; the heavy recharts dependency it
 * used to ship is gone.)
 */
const MessageChart = dynamic(() => import('./message-chart').then((m) => m.MessageChart), {
  loading: () => (
    <div className="grid h-[240px] w-full place-items-center">
      <div className="flex items-center gap-2 text-mid text-muted-foreground">
        <span className="size-3.5 animate-spin-slow rounded-full border-2 border-border-strong border-t-primary" aria-hidden />
        Memuat grafik…
      </div>
    </div>
  ),
})

export function MessageChartLazy({ data }: { data: TimeSeriesPoint[] }) {
  return <MessageChart data={data} />
}
