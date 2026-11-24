import type { MessageType, SessionStatus } from '@/types/enums'
import type { NanoLogBatch } from '@/lib/engine/nano'

/**
 * WhatsApp engine contract.
 *
 * This interface is the boundary between the product and WhatsApp. Nothing
 * above it (API routes, services, UI) is allowed to know whether the session is
 * served by an in-process Baileys socket or by the provided Nano bot script —
 * both satisfy this contract.
 *
 * Implementations:
 *   • gateway/drivers/local-baileys.ts  → owns the socket in the gateway process
 *   • gateway/drivers/nano-process.ts   → spawns the provided Nano script
 *
 * The web app never calls the engine directly; it goes through
 * `lib/engine/client.ts`, which speaks HTTP to the gateway process.
 */

export type EngineDriver = 'local-baileys' | 'nano-process'

/** Live view of a session as reported by the engine. */
export interface EngineSessionState {
  /** Our internal WhatsAppSession.id — the engine keys everything by this. */
  key: string
  driver: EngineDriver
  status: SessionStatus
  /** Human-readable reason for the current status. */
  statusMessage?: string | null

  /** Raw QR payload (NOT an image). Render it with the `qrcode` package. */
  qr?: string | null
  qrIssuedAt?: string | null
  qrExpiresAt?: string | null

  /** Pairing code, e.g. "ABCD-EFGH". Single use, ~60s lifetime. */
  pairingCode?: string | null
  pairingCodeIssuedAt?: string | null

  phoneNumber?: string | null
  profileName?: string | null
  profilePicUrl?: string | null
  platform?: string | null

  connectedSince?: string | null
  lastConnectedAt?: string | null
  lastDisconnectedAt?: string | null
  lastError?: string | null

  messagesSent: number
  messagesReceived: number

  /**
   * True when the session has credentials on disk that the engine could reuse.
   *
   * This is a *cheap* existence probe, not a validity check — only WhatsApp can
   * say whether stored credentials are still accepted. The panel uses it to tell
   * "this bot was linked and can be brought back up" apart from "this bot has
   * never been linked", which is the difference between restoring a session on
   * boot and asking the user to pair again.
   */
  hasCredentials?: boolean
}

export interface CreateSessionInput {
  key: string
  driver: EngineDriver
  /** Absolute path to the per-session auth-state directory. */
  authStateDir: string
  name: string
  autoReconnect?: boolean
  alwaysOnline?: boolean
  readReceipts?: boolean
  typingSimulation?: boolean
  defaultDelayMs?: number
}

export interface SendMessageInput {
  sessionKey: string
  /** Destination: phone number, group JID, or full JID. */
  to: string
  type: MessageType
  text?: string
  mediaUrl?: string
  /** Base64 data URL for locally uploaded media. */
  mediaBase64?: string
  mimeType?: string
  fileName?: string
  caption?: string
  /** Seconds of simulated typing before the message is delivered. */
  simulateTyping?: number
  /** Engine-side delay in ms before dispatch. */
  delayMs?: number
  /** ID of a message to quote. */
  quotedId?: string
  /** Send a read receipt for the quoted message. */
  markRead?: boolean
  latitude?: number
  longitude?: number
  locationName?: string
  address?: string
  /** vCard payload for contact messages. */
  contactName?: string
  contactPhone?: string
}

export interface SendMessageResult {
  /** Provider message id, used to reconcile delivery receipts. */
  externalId: string
  timestamp: number
  recipient: string
  type: MessageType
}

export interface EngineGroup {
  jid: string
  name: string
  description?: string | null
  memberCount: number
  isAdmin: boolean
  inviteCode?: string | null
  pictureUrl?: string | null
  createdAt?: string | null
  participants: Array<{
    jid: string
    phone?: string | null
    name?: string | null
    isAdmin: boolean
    isSuperAdmin: boolean
  }>
}

export interface PairingCodeInput {
  sessionKey: string
  /** Full international number, digits only (e.g. "6281234567890"). */
  phoneNumber: string
}

/**
 * Events the engine emits. The gateway forwards these to the web app, which
 * persists them and fans them out to connected browsers over SSE.
 */
export type EngineEvent =
  | {
      type: 'session.status'
      sessionKey: string
      status: SessionStatus
      statusMessage?: string | null
      phoneNumber?: string | null
      profileName?: string | null
      profilePicUrl?: string | null
      platform?: string | null
      at: string
    }
  | {
      type: 'session.qr'
      sessionKey: string
      qr: string
      expiresAt: string
      at: string
    }
  | {
      type: 'session.pairing'
      sessionKey: string
      pairingCode: string
      phoneNumber: string
      at: string
    }
  | {
      type: 'message.sent'
      sessionKey: string
      externalId: string
      to: string
      at: string
      latencyMs?: number
      /**
       * Content kind and body, when the engine could read them.
       *
       * The `nano-process` driver learns about sends from the bot's own journal,
       * so it can describe a message the panel never composed — without these the
       * stored row would be an empty recipient with no text.
       */
      messageType?: MessageType
      text?: string | null
    }
  | {
      type: 'message.failed'
      sessionKey: string
      to: string
      reason: string
      code?: string
      at: string
      /** Internal message id when we know which send attempt failed. */
      messageId?: string
    }
  | {
      type: 'message.status'
      sessionKey: string
      externalId: string
      status: 'DELIVERED' | 'READ' | 'PLAYED'
      at: string
    }
  | {
      type: 'message.received'
      sessionKey: string
      externalId: string
      from: string
      pushName?: string | null
      isGroup: boolean
      groupJid?: string | null
      /** Content kind of the received message (text/image/...). */
      messageType: MessageType
      text?: string | null
      mediaMime?: string | null
      at: string
    }
  | {
      type: 'session.error'
      sessionKey: string
      message: string
      at: string
    }

// ───────────────────────────────────────────────────────────── contract ──────

export interface WhatsAppEngine {
  /** Create the session record in the engine (does not connect yet). */
  createSession(input: CreateSessionInput): Promise<EngineSessionState>

  /** Bring the session up. Resolves once the socket is initialising; the
   *  outcome arrives asynchronously via `session.status` / `session.qr`. */
  connect(sessionKey: string): Promise<EngineSessionState>

  /** Tear down the socket but keep credentials (can reconnect without re-scan). */
  disconnect(sessionKey: string): Promise<EngineSessionState>

  /** Disconnect and wipe credentials — the phone is unlinked. */
  logout(sessionKey: string): Promise<void>

  /** Force a fresh socket. */
  restart(sessionKey: string): Promise<EngineSessionState>

  /** Remove the session and all its local state. */
  removeSession(sessionKey: string): Promise<void>

  /** Request a new QR payload. */
  refreshQr(sessionKey: string): Promise<{ qr: string; expiresAt: string }>

  /** Request a pairing code for a phone number. */
  requestPairingCode(input: PairingCodeInput): Promise<{
    pairingCode: string
    expiresAt: string
  }>

  getState(sessionKey: string): Promise<EngineSessionState | null>
  listStates(): Promise<EngineSessionState[]>

  /**
   * Fetch group metadata for a connected session.
   *
   * Not every driver can do this — the Nano script has no group-export module,
   * so its driver rejects with `EngineCapabilityError` rather than returning an
   * empty list that would look like "you have no groups".
   */
  listGroups(sessionKey: string): Promise<EngineGroup[]>

  sendMessage(input: SendMessageInput): Promise<SendMessageResult>

  /** Ask the engine for the phone's outbound queue depth. */
  getQueueDepth(sessionKey: string): Promise<number>

  /**
   * Tail of the engine's own output, for the log viewer.
   *
   * Optional: an engine that owns the socket in-process (the gateway's own
   * Baileys driver) has no child output to report, and its absence is surfaced
   * as an unavailable capability instead of an empty, misleading log.
   */
  getLogs?(sessionKey: string, sinceSeq?: number): Promise<NanoLogBatch>
}

/**
 * ── REQUIRES NANO ENGINE INTEGRATION ─────────────────────────────────────────
 * The Nano script (`nano-engine/`, see `NANO_ENGINE_DIR`) is a single-session
 * terminal bot: one
 * process, one `sessions/auth.db`, and no HTTP surface. Capabilities it does
 * *not* expose and which therefore cannot be implemented against it are listed
 * here rather than being faked:
 *
 *   • listGroups / group metadata sync — Nano has no exporter module. Group
 *     data is instead read from the live socket by the `local-baileys` driver.
 *   • per-message delivery receipts to an external system — Nano logs to stdout
 *     only; the `nano-process` driver parses the lines it does print.
 *   • multiple concurrent sessions within one process — one Nano process equals
 *     one bot, so the driver runs one child process per session. Code is shared
 *     from a single installation (`NANO_ENGINE_DIR`); only per-bot state
 *     (credentials + bot database) is isolated, redirected through
 *     `NANO_SESSION_DIR` / `NANO_DATA_DIR`.
 *
 * Anything a driver cannot support throws `EngineCapabilityError` with a clear
 * message instead of silently returning fabricated data.
 */
export class EngineCapabilityError extends Error {
  readonly capability: string
  constructor(capability: string, detail: string) {
    super(`Kapabilitas engine tidak tersedia: ${capability}. ${detail}`)
    this.name = 'EngineCapabilityError'
    this.capability = capability
  }
}

/**
 * The caller supplied something the engine cannot act on.
 *
 * Distinct from a generic failure because the message is the *whole* answer:
 * retrying will not help until the input changes.
 */
export class EngineInputError extends Error {
  readonly code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'EngineInputError'
    this.code = code
  }
}

/**
 * A handshake or delivery the engine was waiting on never completed.
 *
 * Unlike an input error this is retryable, and unlike an unknown engine fault
 * it says the conversation with WhatsApp simply did not finish in time.
 */
export class EngineTimeoutError extends Error {
  readonly code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'EngineTimeoutError'
    this.code = code
  }
}

/** Shape returned by the gateway's HTTP API — always this envelope. */
export interface GatewayResponse<T> {
  ok: boolean
  data?: T
  error?: { code: string; message: string }
}
