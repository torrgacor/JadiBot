'use client'

import { useEffect } from 'react'

/**
 * Root-level error boundary.
 *
 * `error.tsx` segments cannot catch a failure in the root layout itself (a
 * crashed provider, a font import, an import in `globals.css`). When that
 * happens Next renders `global-error.tsx` instead — and it must be fully
 * self-contained: no import from the `app/` tree, because the layout that would
 * normally provide context is exactly what just failed. So everything here is
 * inlined.
 *
 * This only shows up when the whole app has fallen over; the per-route
 * `dashboard/error.tsx` handles the common case (a data fetch blowing up on a
 * single page).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global] app failed to render', error)
  }, [error])

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#0a0e16',
          color: '#eef2f7',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          <div
            aria-hidden
            style={{
              width: 48,
              height: 48,
              margin: '0 auto 16px',
              borderRadius: 14,
              border: '1px solid rgba(248,113,113,0.35)',
              background: 'rgba(248,113,113,0.12)',
              display: 'grid',
              placeItems: 'center',
              color: '#f87171',
              fontSize: 22,
            }}
          >
            !
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>
            Panel gagal memuat
          </h1>
          <p style={{ margin: '0 0 6px', fontSize: 14, color: '#8b96a8', lineHeight: 1.5 }}>
            Terjadi kesalahan yang tak terduga. Muat ulang halaman untuk mencoba lagi.
          </p>
          {error.digest ? (
            <p style={{ margin: '0 0 16px', fontSize: 11, color: '#5f6b7a', fontFamily: 'ui-monospace, monospace' }}>
              ref {error.digest}
            </p>
          ) : null}

          <button
            type="button"
            onClick={reset}
            style={{
              border: '1px solid rgba(45,212,191,0.4)',
              background: 'rgba(45,212,191,0.12)',
              color: '#2dd4bf',
              borderRadius: 10,
              padding: '9px 18px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  )
}
