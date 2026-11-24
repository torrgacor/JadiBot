'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy to clipboard with a self-resetting "copied" flag.
 *
 * Falls back to a hidden textarea + execCommand when the async Clipboard API is
 * unavailable — which is the case on plain HTTP origins, a very likely scenario
 * for a self-hosted gateway.
 */
export function useCopy(resetAfterMs = 1600) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copy = useCallback(
    async (value: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value)
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = value
          textarea.setAttribute('readonly', '')
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          const ok = document.execCommand('copy')
          document.body.removeChild(textarea)
          if (!ok) throw new Error('Perintah salin ditolak oleh peramban.')
        }

        setError(null)
        setCopied(true)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopied(false), resetAfterMs)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tidak dapat menyalin.')
        return false
      }
    },
    [resetAfterMs]
  )

  return { copy, copied, error }
}
