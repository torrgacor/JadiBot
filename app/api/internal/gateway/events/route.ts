import { z } from 'zod'
import { db } from '@/lib/db'
import { ok, parseBody } from '@/lib/api/response'
import { publish } from '@/lib/realtime/hub'
import { logActivity, notify } from '@/lib/auth/audit'
import { dispatchAutomationForInbound } from '@/lib/services/automation-service'

import { safeCompare } from '@/lib/security/crypto'
import { stringifyJson } from '@/lib/utils/json'
import {
  MESSAGE_STATUSES,
  MESSAGE_TYPES,
  SESSION_STATUSES,
  type MessageStatus,
  type MessageType,
  type SessionStatus,
} from '@/types/enums'
import { recordMessageUsage } from '@/lib/services/entitlements'
import { botStopMessageFor } from '@/lib/services/bot-access'

/**
 * POST /api/internal/gateway/events
 *
 * The gateway process calls this for every engine event. This route is the
 * single ingestion point that:
 *
 *   1. persists the state change (session row, message row)
 *   2. fans the event out to connected browsers over SSE
 *   3. triggers the user's automation rules
 *
 * It is authenticated with the shared GATEWAY_TOKEN rather than a user session —
 * it is machine-to-machine only and is never exposed to the browser.
 *
 * Handlers are written to be idempotent: the gateway retries failed deliveries,
 * so the same event may arrive more than once and must converge to the same
 * state (updates are absolute, not increments, wherever that matters).
 */

export const dynamic = 'force-dynamic'

/*
  Free-form payload with the fields we actually read pinned down.

  A machine-to-machine route still gets validated: the gateway is the only
  caller, but a compromised or buggy gateway must not be able to write a 10 MB
  status message into the session row. Lengths are capped where the value ends
  up stored.
*/
const eventSchema = z.object({
  type: z.enum([
    'session.status',
    'session.qr',
    'session.pairing',
    'session.error',
    'message.sent',
    'message.failed',
    'message.status',
    'message.received',
  ]),
  sessionKey: z.string().min(1).max(64),
  at: z.string().max(64),
  status: z.string().max(32).optional(),
  statusMessage: z.string().max(500).nullable().optional(),
  externalId: z.string().max(128).optional(),
  messageId: z.string().max(64).optional(),
  to: z.string().max(128).optional(),
  from: z.string().max(128).optional(),
  text: z.string().max(8000).nullable().optional(),
  reason: z.string().max(1000).optional(),
  pushName: z.string().max(120).nullable().optional(),
  messageType: z.string().max(32).optional(),
  mediaMime: z.string().max(120).nullable().optional(),
  phoneNumber: z.string().max(32).nullable().optional(),
  profileName: z.string().max(120).nullable().optional(),
  profilePicUrl: z.string().max(1024).nullable().optional(),
  platform: z.string().max(64).nullable().optional(),
  qr: z.string().max(4096).nullable().optional(),
  pairingCode: z.string().max(32).nullable().optional(),
}).passthrough()

function gatewayAuthorized(request: Request): boolean {
  const token = request.headers.get('x-gateway-token')
  const expected = process.env.GATEWAY_TOKEN
  if (!token || !expected) return false
  return safeCompare(token, expected)
}

export async function POST(request: Request) {
  if (!gatewayAuthorized(request)) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Token gateway tidak valid.' } },
      { status: 401 }
    )
  }

  const event = await parseBody(request, eventSchema)

  // Resolve the owning user once; every downstream action needs it.
  const session = await db.whatsAppSession.findUnique({
    where: { id: event.sessionKey },
    select: { id: true, userId: true, name: true, status: true },
  })

  if (!session) {
    // The session was deleted while the gateway still had it loaded. Nothing to
    // reconcile — acknowledge so the gateway stops retrying.
    return ok({ ignored: 'unknown-session' })
  }

  const userId = session.userId

  switch (event.type) {
    case 'session.status':
      await handleStatus(userId, session.id, session.name, session.status, event)
      break
    case 'session.qr':
      await handleQr(userId, session.id, event)
      break
    case 'session.pairing':
      await handlePairing(userId, session.id, event)
      break
    case 'session.error':
      await handleError(userId, session.id, session.name, event)
      break
    case 'message.sent':
      await handleMessageSent(userId, session.id, event)
      break
    case 'message.failed':
      await handleMessageFailed(userId, session.id, event)
      break
    case 'message.status':
      await handleMessageStatus(userId, session.id, event)
      break
    case 'message.received':
      await handleMessageReceived(userId, session.id, session.name, event)
      break
  }

  return ok({ processed: true })
}

type AnyEvent = Record<string, unknown> & { type: string; sessionKey: string; at: string }

// ────────────────────────────────────────────────────────────── handlers ────

async function handleStatus(
  userId: string,
  sessionId: string,
  sessionName: string,
  storedStatus: string,
  event: AnyEvent
) {
  const rawStatus = String(event.status ?? 'DISCONNECTED')
  const status: SessionStatus = (SESSION_STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as SessionStatus)
    : 'DISCONNECTED'

  const isConnected = status === 'CONNECTED'

  /*
    When the bot went down because the account has no active plan — a trial that
    ran out, a plan that closed, never had one — the engine's status text
    ("stopped by the user") is simply not what happened. One extra read on the
    disconnect path only, so the session page and the notification tell the truth.
  */
  const stopMessage = isConnected ? null : await botStopMessageFor(userId)

  // The gateway retries failed deliveries, so the same CONNECTED status can
  // arrive more than once. `connectedSince` is the anchor for the uptime shown
  // everywhere in the panel, so it may only move when the session genuinely
  // transitions *into* CONNECTED — otherwise every duplicate event would reset
  // the timer and the dashboard would report an uptime that is always ~0.
  const wasConnected = storedStatus === 'CONNECTED'

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: {
      status,
      statusMessage: stopMessage ?? (event.statusMessage as string | null) ?? null,
      phoneNumber: (event.phoneNumber as string | null) ?? undefined,
      profileName: (event.profileName as string | null) ?? undefined,
      profilePicUrl: (event.profilePicUrl as string | null) ?? undefined,
      platform: (event.platform as string | null) ?? undefined,
      ...(isConnected
        ? {
            ...(wasConnected
              ? {}
              : { connectedSince: new Date(), lastConnectedAt: new Date() }),
            lastError: null,
          }
        : {
            connectedSince: null,
            // Only record a disconnect when there was a connection to lose.
            ...(wasConnected ? { lastDisconnectedAt: new Date() } : {}),
          }),
    },
  })

  publish({ type: 'engine', sessionKey: sessionId, event: event as never }, userId)
  publish({ type: 'session.status', sessionKey: sessionId, userId, status }, userId)

  if (isConnected) {
    await logActivity({
      userId,
      sessionId,
      event: 'session.connected',
      title: 'WhatsApp terhubung',
      detail: `${sessionName} sedang online`,
      level: 'success',
    })
  } else if (status === 'DISCONNECTED' || status === 'LOGGED_OUT' || status === 'BANNED') {
    await logActivity({
      userId,
      sessionId,
      event: 'session.disconnected',
      title: 'WhatsApp terputus',
      detail: stopMessage ?? (event.statusMessage as string) ?? `${sessionName} sedang offline`,
      level: status === 'DISCONNECTED' ? 'warning' : 'error',
    })

    await notify({
      userId,
      type: 'SESSION_DISCONNECTED',
      severity: status === 'BANNED' ? 'error' : 'warning',
      title: `${sessionName} terputus`,
      message:
        stopMessage ??
        (event.statusMessage as string) ??
        'Sesi WhatsApp terputus. Hubungkan ulang sesi untuk melanjutkan.',
      actionUrl: `/dashboard/sessions/${sessionId}`,
    })
  }
}

async function handleQr(userId: string, sessionId: string, event: AnyEvent) {
  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: {
      status: 'QR_REQUIRED',
      lastQrAt: new Date(),
      statusMessage: 'Pindai kode QR untuk menautkan perangkat ini.',
    },
  })

  publish({ type: 'engine', sessionKey: sessionId, event: event as never }, userId)
}

async function handlePairing(userId: string, sessionId: string, event: AnyEvent) {
  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: {
      status: 'PAIRING_REQUIRED',
      statusMessage: 'Masukkan kode pairing di ponsel Anda untuk menyelesaikan penautan.',
    },
  })

  publish({ type: 'engine', sessionKey: sessionId, event: event as never }, userId)
}

async function handleError(
  userId: string,
  sessionId: string,
  sessionName: string,
  event: AnyEvent
) {
  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { status: 'ERROR', lastError: String(event.message ?? 'Kesalahan engine tidak diketahui') },
  })

  publish({ type: 'engine', sessionKey: sessionId, event: event as never }, userId)

  await notify({
    userId,
    type: 'SESSION_DISCONNECTED',
    severity: 'error',
    title: `${sessionName} melaporkan kesalahan`,
    message: String(event.message ?? 'Engine melaporkan sebuah kesalahan.'),
    actionUrl: `/dashboard/sessions/${sessionId}`,
  })
}

/**
 * Record an outbound message.
 *
 * Two kinds of send arrive here:
 *
 *   • one the panel composed — a row already exists in a pending state, and this
 *     reconciles it with the provider id;
 *   • one the **bot** sent by itself (a plugin reply, an antilink warning, an
 *     AFK notice). Nothing queued that, so the row is created here. Without this
 *     the panel stayed empty while the bot answered every chat.
 */
async function handleMessageSent(userId: string, sessionId: string, event: AnyEvent) {
  const externalId = String(event.externalId ?? '')
  const recipient = String(event.to ?? '')
  const text = typeof event.text === 'string' && event.text ? event.text : null
  const rawType = String(event.messageType ?? 'text')
  const type = (MESSAGE_TYPES as readonly string[]).includes(rawType)
    ? (rawType as MessageType)
    : 'text'

  // Idempotency: the gateway is at-least-once, so the same send can be delivered
  // more than once. One row, one count.
  // Same reasoning as `handleMessageStatus`: the idempotency lookup is scoped to
  // this session so it can never match (and suppress) another account's row.
  const already = externalId
    ? await db.message.findFirst({ where: { externalId, sessionId }, select: { id: true } })
    : null
  if (already) return

  // Match the queued row this send corresponds to (most recent pending send to
  // the same recipient on this session).
  const pending = await db.message.findFirst({
    where: {
      sessionId,
      recipient,
      direction: 'OUTBOUND',
      status: { in: ['PENDING', 'QUEUED', 'SENDING'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (pending) {
    await db.message.update({
      where: { id: pending.id },
      data: {
        status: 'SENT',
        externalId,
        sentAt: new Date(),
        ...(text ? { body: text } : {}),
        errorCode: null,
        errorMessage: null,
      },
    })
    publish({ type: 'message.status', userId, messageId: pending.id, status: 'SENT' }, userId)
  } else {
    // Engine-originated: the bot's own reply, read from its message journal.
    await db.message.create({
      data: {
        userId,
        sessionId,
        direction: 'OUTBOUND',
        type,
        recipient,
        body: text,
        status: 'SENT',
        externalId,
        sentAt: new Date(),
        responsePayload: stringifyJson(event),
      },
    })

    // The daily meter follows the same real events. Sends the panel queued have
    // already consumed quota at the point of sending, so only these are counted
    // here — counting both would double every reply.
    await recordMessageUsage(userId).catch(() => {
      // Meter bookkeeping must never fail the ingestion of a real message.
    })
  }

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { messagesSent: { increment: 1 } },
  })

  // Only sends the panel composed are worth an activity entry. A bot that
  // answers every chat would otherwise bury session events under one row per
  // reply; those replies are recorded as messages (list, chart, counters)
  // where they belong.
  if (pending) {
    await logActivity({
      userId,
      sessionId,
      event: 'message.sent',
      title: 'Pesan terkirim',
      detail: recipient,
      level: 'success',
      metadata: { latencyMs: event.latencyMs },
    })
  }

  publish({ type: 'engine', sessionKey: sessionId, event: event as never }, userId)
}

async function handleMessageFailed(userId: string, sessionId: string, event: AnyEvent) {
  const messageId = event.messageId ? String(event.messageId) : null
  const reason = String(event.reason ?? 'Pengiriman gagal')

  if (messageId) {
    await db.message.update({
      where: { id: messageId },
      data: { status: 'FAILED', errorMessage: reason, errorCode: (event.code as string) ?? null },
    })
    publish({ type: 'message.status', userId, messageId, status: 'FAILED' }, userId)
  }

  await logActivity({
    userId,
    sessionId,
    event: 'message.failed',
    title: 'Pesan gagal',
    detail: reason,
    level: 'error',
  })

  await notify({
    userId,
    type: 'MESSAGE_FAILED',
    severity: 'error',
    title: 'Ada pesan yang gagal terkirim',
    message: reason,
    actionUrl: '/dashboard/bot/logs',
  })

  publish({ type: 'engine', sessionKey: sessionId, event: event as never }, userId)
}

async function handleMessageStatus(userId: string, sessionId: string, event: AnyEvent) {
  const externalId = String(event.externalId ?? '')
  const rawStatus = String(event.status ?? '')
  if (!(MESSAGE_STATUSES as readonly string[]).includes(rawStatus)) return

  const status = rawStatus as MessageStatus

  /*
    Scoped to the session that reported it. A message id is unique in practice,
    but "in practice" is not an access control: without this, an event carrying
    another session's id would update a row belonging to a different account.
  */
  const message = await db.message.findFirst({
    where: { externalId, sessionId },
    select: { id: true, status: true },
  })
  if (!message) return

  // Never regress a message's state (a late DELIVERED must not overwrite READ).
  const rank: Record<MessageStatus, number> = {
    PENDING: 0,
    QUEUED: 1,
    SENDING: 2,
    SENT: 3,
    DELIVERED: 4,
    READ: 5,
    FAILED: 0,
  }
  if (rank[status] <= rank[message.status as MessageStatus]) return

  await db.message.update({
    where: { id: message.id },
    data: {
      status,
      ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      ...(status === 'READ' ? { readAt: new Date() } : {}),
    },
  })

  publish({ type: 'message.status', userId, messageId: message.id, status }, userId)
}

/** Inbound message: persist it, then run the user's automation rules. */
async function handleMessageReceived(
  userId: string,
  sessionId: string,
  sessionName: string,
  event: AnyEvent
) {
  const from = String(event.from ?? '')
  const externalId = String(event.externalId ?? '')

  // Idempotency: the gateway is at-least-once, so the same event can be
  // delivered more than once. Scoped to the session that reported it, exactly
  // like the outbound and status paths: matching on `externalId` alone would
  // let one session's id suppress (or be suppressed by) another account's row.
  const duplicate = externalId
    ? await db.message.findFirst({
        where: { externalId, sessionId },
        select: { id: true },
      })
    : null

  if (duplicate) return

  const message = await db.message.create({
    data: {
      userId,
      sessionId,
      direction: 'INBOUND',
      type: String(event.messageType ?? 'text'),
      recipient: from,
      recipientName: (event.pushName as string | null) ?? null,
      body: (event.text as string | null) ?? null,
      mediaMime: (event.mediaMime as string | null) ?? null,
      status: 'DELIVERED',
      externalId,
      responsePayload: stringifyJson(event),
    },
  })

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { messagesReceived: { increment: 1 } },
  })

  await logActivity({
    userId,
    sessionId,
    event: 'message.received',
    title: 'Pesan diterima',
    detail: (event.text as string | null)?.slice(0, 120) ?? from,
    level: 'info',
    metadata: { from },
  })

  publish(
    { type: 'engine', sessionKey: sessionId, event: event as never },
    userId
  )

  // Run the user's automation rules against this message. Failures here must not
  // fail the ingestion request — the message is already stored.
  await dispatchAutomationForInbound({
    userId,
    sessionId,
    sessionName,
    messageId: message.id,
    from,
    pushName: (event.pushName as string | null) ?? null,
    isGroup: Boolean(event.isGroup),
    text: (event.text as string | null) ?? '',
  }).catch((error) => {
    console.error('[automation] dispatch failed', error)
  })
}
