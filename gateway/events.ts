import { gatewayConfig, logger } from './config'
import type { EngineEvent } from '../lib/engine/types'

/**
 * Event forwarding: gateway → web app.
 *
 * The gateway pushes every engine event to the web app over HTTP rather than
 * holding a long-lived socket. Reasons:
 *
 *   • The web app owns the database and the realtime fan-out to browsers — one
 *     place to persist, not two.
 *   • A dropped connection cannot lose events: failed deliveries are retried
 *     from an in-memory queue, and the web app reconciles session state from
 *     `GET /sessions` on boot regardless.
 *
 * This is intentionally *at-least-once*: the web app's handlers are written to
 * be idempotent (upsert by external id, set status to a target value).
 */

const MAX_QUEUE = 500
const MAX_ATTEMPTS = 5

interface QueuedEvent {
  event: EngineEvent
  attempts: number
}

const queue: QueuedEvent[] = []
let flushing = false

async function deliver(event: EngineEvent): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(`${gatewayConfig.appUrl}/api/internal/gateway/events`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-gateway-token': gatewayConfig.token,
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function flush(): Promise<void> {
  if (flushing || queue.length === 0) return
  flushing = true

  try {
    while (queue.length > 0) {
      const item = queue[0]
      const ok = await deliver(item.event)

      if (ok) {
        queue.shift()
        continue
      }

      item.attempts += 1
      if (item.attempts >= MAX_ATTEMPTS) {
        const dropped = queue.shift()
        logger.warn(
          { type: dropped?.event.type, sessionKey: (dropped?.event as { sessionKey?: string }).sessionKey },
          'dropping event after max delivery attempts'
        )
        continue
      }

      // Back off and let the next flush retry.
      await new Promise((resolve) => setTimeout(resolve, 1_000 * item.attempts))
    }
  } finally {
    flushing = false
  }
}

/** Enqueue an event for delivery. Never throws. */
export function forwardEvent(event: EngineEvent): void {
  if (queue.length >= MAX_QUEUE) {
    // Drop the oldest — the newest state matters most, and the web app can
    // always re-sync from GET /sessions.
    queue.shift()
    logger.warn('event queue full, dropped oldest event')
  }

  queue.push({ event, attempts: 0 })
  // Fire and forget; flush serialises internally.
  void flush()
}

/** Drain the queue on shutdown so in-flight events are not lost. */
export async function drainEvents(timeoutMs = 5_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (queue.length > 0 && Date.now() < deadline) {
    await flush()
    if (queue.length > 0) await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

export function queueDepth(): number {
  return queue.length
}
