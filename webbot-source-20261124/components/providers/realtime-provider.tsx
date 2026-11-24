'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { RealtimeEvent } from '@/lib/realtime/hub'

/**
 * Realtime provider.
 *
 * Opens a single EventSource for the whole dashboard and fans events out to
 * subscribers. One connection per tab, not per component, and it reconnects
 * with backoff when the stream drops.
 *
 * `connected` reflects the actual transport state — the UI must be able to tell
 * the user when live updates are unavailable rather than silently going stale.
 */

type Listener = (event: RealtimeEvent) => void

interface RealtimeContextValue {
  connected: boolean
  /** Set when the browser cannot establish or keep the stream. */
  error: string | null
  subscribe: (listener: Listener) => () => void
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  error: null,
  subscribe: () => () => {},
})

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listenersRef = useRef(new Set<Listener>())
  const sourceRef = useRef<EventSource | null>(null)
  const retryRef = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  useEffect(() => {
    let disposed = false

    const dispatch = (event: RealtimeEvent) => {
      for (const listener of listenersRef.current) {
        try {
          listener(event)
        } catch {
          // A faulty listener must not break the others.
        }
      }
    }

    const connect = () => {
      if (disposed) return

      const source = new EventSource('/api/realtime')
      sourceRef.current = source

      source.onopen = () => {
        retryRef.current = 0
        setConnected(true)
        setError(null)
      }

      // Every event type the server may emit needs a named listener, because
      // the server sends `event: <type>` rather than the default `message`.
      const NAMED_EVENTS = [
        'engine',
        'notification',
        'session.status',
        'message.status',
        'heartbeat',
      ] as const

      for (const name of NAMED_EVENTS) {
        source.addEventListener(name, (raw) => {
          try {
            dispatch(JSON.parse((raw as MessageEvent).data) as RealtimeEvent)
          } catch {
            // Ignore malformed frames.
          }
        })
      }

      source.onerror = () => {
        if (disposed) return

        setConnected(false)
        setError('Pembaruan langsung tidak tersedia. Menyambung ulang…')
        source.close()
        sourceRef.current = null

        // Exponential backoff capped at 30s.
        retryRef.current = Math.min(retryRef.current + 1, 6)
        const delay = Math.min(1_000 * 2 ** retryRef.current, 30_000)

        reconnectTimer.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      disposed = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      sourceRef.current?.close()
      sourceRef.current = null
    }
  }, [])

  const value = useMemo(
    () => ({ connected, error, subscribe }),
    [connected, error, subscribe]
  )

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtime() {
  return useContext(RealtimeContext)
}

/** Run a callback for every realtime event, optionally filtered by type. */
export function useRealtimeEvent(
  types: RealtimeEvent['type'] | RealtimeEvent['type'][],
  handler: Listener
) {
  const { subscribe } = useRealtime()
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const wanted = useMemo(
    () => (Array.isArray(types) ? types : [types]),
    [types]
  )

  useEffect(() => {
    return subscribe((event) => {
      if (wanted.includes(event.type)) handlerRef.current(event)
    })
  }, [subscribe, wanted])
}
