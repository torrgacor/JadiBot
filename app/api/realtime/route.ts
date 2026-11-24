import { getAuthContext } from '@/lib/auth/session'
import { subscribe, type RealtimeEvent } from '@/lib/realtime/hub'

/**
 * GET /api/realtime
 *
 * Authenticated Server-Sent Events stream. The dashboard subscribes once and
 * receives session lifecycle, message and notification updates without polling.
 *
 * Security: the stream is scoped to the signed-in user, and the hub only
 * delivers events addressed to them (see lib/realtime/hub.ts).
 */

export const dynamic = 'force-dynamic'
// SSE must not be buffered or cached by the platform.
export const fetchCache = 'force-no-store'
export const revalidate = 0

const HEARTBEAT_MS = 25_000

export async function GET(request: Request) {
  const context = await getAuthContext()

  if (!context) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = context.user.id
  const subscriberId = `${userId}:${crypto.randomUUID()}`

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false

      const write = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          closed = true
        }
      }

      const send = (event: RealtimeEvent) => {
        // Named SSE event so the client can dispatch per type.
        write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`)
      }

      // Tell the client it can consider itself live, and report the interval it
      // should expect so a silent stream is distinguishable from a dead one.
      send({ type: 'heartbeat', at: new Date().toISOString() })

      const unsubscribe = subscribe({ id: subscriberId, userId, send })

      const heartbeat = setInterval(() => {
        send({ type: 'heartbeat', at: new Date().toISOString() })
      }, HEARTBEAT_MS)

      const cleanup = () => {
        if (closed) return
        closed = true
        clearInterval(heartbeat)
        unsubscribe()
        try {
          controller.close()
        } catch {
          // Already closed.
        }
      }

      // The browser closing the tab / navigating away aborts the request.
      request.signal.addEventListener('abort', cleanup)

      // No synthetic snapshot is sent. The client loads current state from the
      // API on mount and this stream only carries genuine events — emitting a
      // fabricated "CONNECTED" here would be exactly the kind of fake status
      // this build avoids.
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      // Disable proxy buffering (nginx) so events arrive immediately.
      'x-accel-buffering': 'no',
    },
  })
}
