import type { EngineEvent } from '@/lib/engine/types'
import type { NotificationSeverity, SessionStatus } from '@/types/enums'

/**
 * Realtime hub.
 *
 * Server-Sent Events are used rather than Socket.IO for one concrete reason:
 * SSE is a plain HTTP response, so it needs no custom server, no extra port and
 * no sticky-session configuration — it works with the Next.js runtime as-is and
 * survives proxies that mangle WebSocket upgrades.
 *
 * ── ⚠ REQUIRES REDIS PUB/SUB FOR MULTI-INSTANCE ─────────────────────────────
 * The subscriber set below is process-local. With several web replicas, an
 * event ingested by replica A will not reach a browser connected to replica B.
 * Single-process deployments (the default, including `npm run dev`) are
 * unaffected. To scale out, publish to Redis here and subscribe in every
 * replica — the `publish()` signature is the only thing that needs to change.
 */

export type RealtimeEvent =
  /** Any engine lifecycle/QR/pairing/message event from the gateway. */
  | { type: 'engine'; sessionKey: string; event: EngineEvent }
  /** A notification row was created for this user. */
  | {
      type: 'notification'
      userId: string
      notification: {
        id: string
        title: string
        message: string
        severity: NotificationSeverity
      }
    }
  /** Session status changed — drives the sidebar and dashboard tiles. */
  | { type: 'session.status'; sessionKey: string; userId: string; status: SessionStatus }
  /** A message's delivery state advanced. */
  | {
      type: 'message.status'
      userId: string
      messageId: string
      status: string
    }
  /** Server heartbeat, keeps intermediaries from closing the stream. */
  | { type: 'heartbeat'; at: string }

export interface Subscriber {
  id: string
  userId: string
  send: (event: RealtimeEvent) => void
}

const subscribers = new Map<string, Subscriber>()

export function subscribe(subscriber: Subscriber): () => void {
  subscribers.set(subscriber.id, subscriber)
  return () => {
    subscribers.delete(subscriber.id)
  }
}

/**
 * Broadcast to everyone who is allowed to see the event.
 *
 * Events carrying a `userId` are delivered only to that user's connections;
 * engine events are addressed by session key, so the ingestion route resolves
 * the owner first and emits with a `userId` where possible.
 */
export function publish(event: RealtimeEvent, targetUserId?: string): number {
  let delivered = 0

  for (const subscriber of subscribers.values()) {
    if (targetUserId && subscriber.userId !== targetUserId) continue

    try {
      subscriber.send(event)
      delivered++
    } catch {
      // A broken pipe should not stop delivery to everyone else.
      subscribers.delete(subscriber.id)
    }
  }

  return delivered
}

export function subscriberCount(): number {
  return subscribers.size
}
