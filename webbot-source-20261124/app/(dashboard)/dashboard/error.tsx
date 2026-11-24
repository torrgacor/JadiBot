'use client'

import { useEffect } from 'react'
import { AlertOctagon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Dashboard error boundary.
 *
 * Any render failure inside the dashboard lands here instead of showing the
 * framework's developer overlay. `reset()` re-renders the segment, which is a
 * genuine retry — the same data is fetched again from the database and gateway.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface it in the browser console (and therefore in any client-side
    // monitoring) without hiding it behind the UI.
    console.error('[dashboard] render failed', error)
  }, [error])

  return (
    <Card>
      <CardContent className="py-10">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
          <div
            className="grid size-12 place-items-center rounded-[14px] border border-danger/25 bg-danger/10 text-danger"
            aria-hidden
          >
            <AlertOctagon className="size-5" />
          </div>

          <h2 className="text-base font-semibold">Gagal menampilkan halaman</h2>
          <p className="text-mid leading-relaxed text-muted-foreground">
            {error.message ||
              'Panel tidak bisa memuat halaman ini. Layanan mungkin sedang tidak dapat diakses.'}
          </p>
          {error.digest ? (
            <p className="font-mono text-xs2 text-muted-foreground">ref {error.digest}</p>
          ) : null}

          <Button onClick={reset} variant="secondary" className="mt-1">
            <RefreshCw />
            Coba lagi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
