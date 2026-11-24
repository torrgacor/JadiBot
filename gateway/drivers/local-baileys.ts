import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidGroup,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  delay,
  type WASocket,
  type WAMessage,
  type GroupMetadata,
  type ConnectionState,
  type AnyMessageContent,
  type MiscMessageGenerationOptions,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import {
  clearStoredCredentials,
  hasCredentialFile,
  useSqliteAuthState,
  type AuthStateHandle,
} from '../auth-state'
import { logger } from '../config'
import type {
  CreateSessionInput,
  EngineEvent,
  EngineGroup,
  EngineSessionState,
  PairingCodeInput,
  SendMessageInput,
  SendMessageResult,
} from '../../lib/engine/types'
import type { MessageType, SessionStatus } from '../../types/enums'

/**
 * `local-baileys` driver.
 *
 * Owns one Baileys socket per session inside the gateway process. This is the
 * only implementation that can serve many sessions concurrently, because the
 * Nano script is hard-wired to a single global connection.
 *
 * Lifecycle contract (see lib/engine/types.ts):
 *   createSession → connect → [ QR_REQUIRED | PAIRING_REQUIRED ] → CONNECTED
 * On credentials already present, connect goes straight to CONNECTING and
 * resumes without a scan.
 */

/** How long a QR payload stays valid. Baileys rotates it on its own timer too. */
const QR_TTL_MS = 60_000

/** Pairing codes are valid for roughly one minute per WhatsApp's protocol. */
const PAIRING_TTL_MS = 60_000

const MAX_RECONNECT_ATTEMPTS = 8
const RECONNECT_BASE_DELAY_MS = 2_000
const RECONNECT_MAX_DELAY_MS = 60_000

/** Baileys is extremely chatty at debug level; silence unless explicitly asked. */
const baileysLogger = pino({
  level: process.env.NANO_LOG === 'trace' ? 'trace' : 'silent',
})

interface Runtime {
  key: string
  driver: 'local-baileys'
  authStateDir: string
  autoReconnect: boolean
  alwaysOnline: boolean
  readReceipts: boolean
  typingSimulation: boolean
  defaultDelayMs: number

  auth: AuthStateHandle | null
  sock: WASocket | null

  status: SessionStatus
  statusMessage: string | null

  qr: string | null
  qrIssuedAt: Date | null
  qrExpiresAt: Date | null
  /** Reject the pending `refreshQr()` when a new payload arrives. */
  qrWaiters: Array<(value: { qr: string; expiresAt: string }) => void>

  pairingCode: string | null
  pairingCodeIssuedAt: Date | null
  pairingRequested: boolean

  phoneNumber: string | null
  profileName: string | null
  profilePicUrl: string | null
  platform: string | null

  connectedSince: Date | null
  lastConnectedAt: Date | null
  lastDisconnectedAt: Date | null
  lastError: string | null

  messagesSent: number
  messagesReceived: number

  reconnectAttempts: number
  reconnectTimer: NodeJS.Timeout | null
  /** In-flight outbound sends, surfaced as the session's queue depth. */
  inFlight: number
}

let cachedVersion: number[] | null = null

async function baileysVersion(): Promise<number[]> {
  if (cachedVersion) return cachedVersion
  try {
    const { version } = await fetchLatestBaileysVersion()
    cachedVersion = version
    return version
  } catch {
    // Offline is survivable — fall back to a version Baileys ships with.
    return [2, 3000, 0]
  }
}

/** "628123456:12@s.whatsapp.net" → "628123456" */
function phoneFromJid(jid: string | undefined | null): string | null {
  if (!jid) return null
  const user = jid.split('@')[0]
  return user.split(':')[0] || null
}

/** Accepts a bare number, a JID, or a group JID and returns a usable JID. */
export function normalizeRecipient(to: string): string {
  const trimmed = to.trim()
  if (trimmed.includes('@')) return trimmed
  const digits = trimmed.replace(/\D/g, '')
  return `${digits}@s.whatsapp.net`
}

export class LocalBaileysDriver {
  private runtimes = new Map<string, Runtime>()

  constructor(private readonly emit: (event: EngineEvent) => void) {}

  // ─────────────────────────────────────────────────────── state helpers ────

  private snapshot(runtime: Runtime): EngineSessionState {
    return {
      key: runtime.key,
      driver: 'local-baileys',
      hasCredentials: hasCredentialFile(runtime.key),
      status: runtime.status,
      statusMessage: runtime.statusMessage,
      qr: runtime.qr,
      qrIssuedAt: runtime.qrIssuedAt?.toISOString() ?? null,
      qrExpiresAt: runtime.qrExpiresAt?.toISOString() ?? null,
      pairingCode: runtime.pairingCode,
      pairingCodeIssuedAt: runtime.pairingCodeIssuedAt?.toISOString() ?? null,
      phoneNumber: runtime.phoneNumber,
      profileName: runtime.profileName,
      profilePicUrl: runtime.profilePicUrl,
      platform: runtime.platform,
      connectedSince: runtime.connectedSince?.toISOString() ?? null,
      lastConnectedAt: runtime.lastConnectedAt?.toISOString() ?? null,
      lastDisconnectedAt: runtime.lastDisconnectedAt?.toISOString() ?? null,
      lastError: runtime.lastError,
      messagesSent: runtime.messagesSent,
      messagesReceived: runtime.messagesReceived,
    }
  }

  private setStatus(
    runtime: Runtime,
    status: SessionStatus,
    statusMessage: string | null = null
  ) {
    runtime.status = status
    runtime.statusMessage = statusMessage
    runtime.lastError = status === 'ERROR' || status === 'BANNED' ? statusMessage : runtime.lastError

    this.emit({
      type: 'session.status',
      sessionKey: runtime.key,
      status,
      statusMessage,
      phoneNumber: runtime.phoneNumber,
      profileName: runtime.profileName,
      profilePicUrl: runtime.profilePicUrl,
      platform: runtime.platform,
      at: new Date().toISOString(),
    })
  }

  private runtimeFor(key: string): Runtime {
    const runtime = this.runtimes.get(key)
    if (!runtime) {
      throw new Error(`Sesi ${key} tidak dimuat di driver ini.`)
    }
    return runtime
  }

  // ─────────────────────────────────────────────────────────── lifecycle ───

  async createSession(input: CreateSessionInput): Promise<EngineSessionState> {
    const existing = this.runtimes.get(input.key)
    if (existing) return this.snapshot(existing)

    const runtime: Runtime = {
      key: input.key,
      driver: 'local-baileys',
      authStateDir: input.authStateDir,
      autoReconnect: input.autoReconnect ?? true,
      alwaysOnline: input.alwaysOnline ?? false,
      readReceipts: input.readReceipts ?? true,
      typingSimulation: input.typingSimulation ?? false,
      defaultDelayMs: input.defaultDelayMs ?? 1200,

      auth: null,
      sock: null,

      status: 'CREATED',
      statusMessage: null,

      qr: null,
      qrIssuedAt: null,
      qrExpiresAt: null,
      qrWaiters: [],

      pairingCode: null,
      pairingCodeIssuedAt: null,
      pairingRequested: false,

      phoneNumber: null,
      // Populated from the live socket on connect — never defaulted to the
      // user's chosen session label, which would misreport the real profile.
      profileName: null,
      profilePicUrl: null,
      platform: null,

      connectedSince: null,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
      lastError: null,

      messagesSent: 0,
      messagesReceived: 0,

      reconnectAttempts: 0,
      reconnectTimer: null,
      inFlight: 0,
    }

    this.runtimes.set(input.key, runtime)

    // Prepare auth state up front so `connect()` can resume instantly.
    runtime.auth = await useSqliteAuthState(input.key)
    return this.snapshot(runtime)
  }

  async connect(key: string): Promise<EngineSessionState> {
    const runtime = this.runtimeFor(key)
    if (runtime.sock && (runtime.status === 'CONNECTED' || runtime.status === 'CONNECTING')) {
      return this.snapshot(runtime)
    }
    await this.openSocket(runtime)
    return this.snapshot(runtime)
  }

  private async openSocket(runtime: Runtime): Promise<void> {
    if (runtime.reconnectTimer) {
      clearTimeout(runtime.reconnectTimer)
      runtime.reconnectTimer = null
    }

    if (!runtime.auth) {
      runtime.auth = await useSqliteAuthState(runtime.key)
    }

    this.setStatus(runtime, 'CONNECTING')

    const version = await baileysVersion()
    const { state, saveCreds } = runtime.auth

    const sock = makeWASocket({
      version: version as [number, number, number],
      logger: baileysLogger,
      printQRInTerminal: false,
      qrTimeout: QR_TTL_MS,
      auth: {
        creds: state.creds,
        // Caching wrapper: avoids a SQLite round-trip for every key read.
        keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
      },
      browser: Browsers.ubuntu('Chrome'),
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: runtime.alwaysOnline,
      // We handle retries ourselves so backoff and status reporting stay ours.
      shouldIgnoreJid: () => false,
    })

    runtime.sock = sock

    sock.ev.on('creds.update', () => {
      void saveCreds().catch((error) => {
        logger.error({ key: runtime.key, err: error }, 'failed saving credentials')
      })
      runtime.platform = state.creds.platform ?? runtime.platform
    })

    sock.ev.on('connection.update', (update) => {
      void this.handleConnectionUpdate(runtime, update)
    })

    sock.ev.on('messages.upsert', ({ messages, type }) => {
      void this.handleMessagesUpsert(runtime, messages, type)
    })

    sock.ev.on('messages.update', (updates) => {
      for (const { key: waKey, update } of updates) {
        const statusCode = (update as { status?: number }).status
        if (statusCode === undefined || !waKey?.id) continue

        // proto.WebMessageInfo.Status: 3 = DELIVERY_ACK, 4 = READ, 5 = PLAYED
        let status: 'DELIVERED' | 'READ' | 'PLAYED' | null = null
        if (statusCode === 3) status = 'DELIVERED'
        else if (statusCode === 4) status = 'READ'
        else if (statusCode === 5) status = 'PLAYED'
        if (!status) continue

        this.emit({
          type: 'message.status',
          sessionKey: runtime.key,
          externalId: waKey.id,
          status,
          at: new Date().toISOString(),
        })
      }
    })
  }

  private async handleConnectionUpdate(
    runtime: Runtime,
    update: Partial<ConnectionState>
  ): Promise<void> {
    const { connection, lastDisconnect, qr } = update

    // ── a fresh QR payload ──────────────────────────────────────────────────
    if (qr) {
      runtime.qr = qr
      runtime.qrIssuedAt = new Date()
      runtime.qrExpiresAt = new Date(Date.now() + QR_TTL_MS)
      // A new QR supersedes any earlier pairing code.
      runtime.pairingCode = null
      runtime.pairingRequested = false

      if (runtime.status !== 'CONNECTED') {
        this.setStatus(runtime, 'QR_REQUIRED', 'Scan kode QR untuk menautkan perangkat ini.')
      }

      this.emit({
        type: 'session.qr',
        sessionKey: runtime.key,
        qr,
        expiresAt: runtime.qrExpiresAt.toISOString(),
        at: new Date().toISOString(),
      })

      // Resolve anything waiting on `refreshQr()`.
      const waiters = runtime.qrWaiters.splice(0)
      for (const resolve of waiters) {
        resolve({ qr, expiresAt: runtime.qrExpiresAt.toISOString() })
      }
    }

    if (connection === 'connecting' && runtime.status !== 'CONNECTED') {
      this.setStatus(runtime, 'CONNECTING')
    }

    // ── connected ───────────────────────────────────────────────────────────
    if (connection === 'open') {
      runtime.reconnectAttempts = 0
      runtime.qr = null
      runtime.qrExpiresAt = null
      runtime.pairingCode = null

      const userJid = runtime.sock?.user?.id ?? null
      runtime.phoneNumber = phoneFromJid(userJid)
      runtime.profileName =
        runtime.sock?.user?.name ?? runtime.profileName ?? null
      runtime.platform = runtime.auth?.state.creds.platform ?? runtime.platform

      runtime.connectedSince = new Date()
      runtime.lastConnectedAt = new Date()

      try {
        if (userJid) {
          runtime.profilePicUrl = await runtime.sock!.profilePictureUrl(
            jidNormalizedUser(userJid),
            'image'
          ) ?? null
        }
      } catch {
        // Privacy settings commonly block this — not an error worth surfacing.
        runtime.profilePicUrl = null
      }

      logger.info(
        { key: runtime.key, phone: runtime.phoneNumber },
        'session connected'
      )
      this.setStatus(runtime, 'CONNECTED')
      return
    }

    // ── disconnected ────────────────────────────────────────────────────────
    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
      const reason = lastDisconnect?.error?.message ?? 'Koneksi ditutup.'

      runtime.lastDisconnectedAt = new Date()
      runtime.connectedSince = null
      runtime.sock = null

      // 401 — the user unlinked the device from their phone.
      if (statusCode === DisconnectReason.loggedOut) {
        clearStoredCredentials(runtime.key)
        runtime.auth?.close()
        runtime.auth = null
        runtime.profileName = null
        runtime.phoneNumber = null
        runtime.profilePicUrl = null
        this.setStatus(
          runtime,
          'LOGGED_OUT',
          'Perangkat ini telah dilepas dari WhatsApp. Tautkan ulang untuk menyambung kembali.'
        )
        return
      }

      // 403 — WhatsApp refused the connection; usually a ban or a blocked client.
      if (statusCode === DisconnectReason.forbidden) {
        this.setStatus(
          runtime,
          'BANNED',
          'WhatsApp menolak sesi ini. Nomor mungkin dibatasi atau diblokir.'
        )
        return
      }

      // 411 — the multi-device identity no longer matches; credentials are stale.
      if (statusCode === DisconnectReason.multideviceMismatch) {
        this.setStatus(
          runtime,
          'ERROR',
          'Identitas perangkat tidak cocok. Logout lalu tautkan ulang sesi ini.'
        )
        return
      }

      if (statusCode === DisconnectReason.connectionReplaced) {
        this.setStatus(
          runtime,
          'DISCONNECTED',
          'Sesi digantikan — ada perangkat lain yang tertaut memakai kredensial yang sama.'
        )
        return
      }

      // Everything else is transient (timeouts, restarts, network drops).
      const wasLinked = Boolean(runtime.phoneNumber)
      if (runtime.autoReconnect) {
        this.setStatus(
          runtime,
          wasLinked ? 'RECONNECTING' : 'DISCONNECTED',
          `Connection lost (${reason}). Reconnecting…`
        )
        this.scheduleReconnect(runtime)
      } else {
        this.setStatus(runtime, 'DISCONNECTED', reason)
      }
    }
  }

  private scheduleReconnect(runtime: Runtime) {
    if (runtime.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.setStatus(
        runtime,
        'ERROR',
        `Menyerah setelah ${MAX_RECONNECT_ATTEMPTS} percobaan sambung ulang. Mulai ulang sesi untuk mencoba lagi.`
      )
      return
    }

    runtime.reconnectAttempts += 1

    // Exponential backoff with jitter so many sessions do not reconnect in lockstep.
    const backoff = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** (runtime.reconnectAttempts - 1),
      RECONNECT_MAX_DELAY_MS
    )
    const jitter = Math.floor(Math.random() * 1_000)

    runtime.reconnectTimer = setTimeout(() => {
      runtime.reconnectTimer = null
      this.openSocket(runtime).catch((error) => {
        logger.error({ key: runtime.key, err: error }, 'reconnect attempt failed')
        this.scheduleReconnect(runtime)
      })
    }, backoff + jitter)
  }

  private async handleMessagesUpsert(
    runtime: Runtime,
    messages: WAMessage[],
    type: string
  ) {
    if (type !== 'notify') return

    for (const message of messages) {
      const remoteJid = message.key.remoteJid
      if (!remoteJid || !message.key.id) continue

      const fromMe = Boolean(message.key.fromMe)

      if (fromMe) {
        // Our own send, echoed back — count it but do not treat it as inbound.
        runtime.messagesSent += 1
        this.emit({
          type: 'message.sent',
          sessionKey: runtime.key,
          externalId: message.key.id,
          to: remoteJid,
          at: new Date().toISOString(),
        })
        continue
      }

      runtime.messagesReceived += 1

      const isGroup = isJidGroup(remoteJid) ?? false
      const content = message.message ?? {}
      const { type: messageType, text, mediaMime } = extractContent(content)

      this.emit({
        type: 'message.received',
        sessionKey: runtime.key,
        externalId: message.key.id,
        from: remoteJid,
        pushName: message.pushName ?? null,
        isGroup,
        groupJid: isGroup ? remoteJid : null,
        messageType,
        text,
        mediaMime,
        at: new Date().toISOString(),
      })
    }
  }

  async disconnect(key: string): Promise<EngineSessionState> {
    const runtime = this.runtimeFor(key)
    if (runtime.reconnectTimer) {
      clearTimeout(runtime.reconnectTimer)
      runtime.reconnectTimer = null
    }
    runtime.autoReconnect = false
    runtime.reconnectAttempts = 0

    const sock = runtime.sock
    runtime.sock = null
    if (sock) {
      try {
        sock.end(undefined)
      } catch {
        // Already closed.
      }
    }

    this.setStatus(runtime, 'DISCONNECTED', 'Diputuskan oleh pengguna.')
    return this.snapshot(runtime)
  }

  async logout(key: string): Promise<void> {
    const runtime = this.runtimeFor(key)

    if (runtime.reconnectTimer) {
      clearTimeout(runtime.reconnectTimer)
      runtime.reconnectTimer = null
    }

    const sock = runtime.sock
    if (sock) {
      try {
        // Tells WhatsApp to unlink the device, then removes local credentials.
        await sock.logout()
      } catch {
        // If the socket is already dead we still wipe local state below.
      }
      try {
        sock.end(undefined)
      } catch {
        // ignore
      }
    }
    runtime.sock = null
    runtime.autoReconnect = false

    runtime.auth?.close()
    runtime.auth = null
    clearStoredCredentials(key)

    runtime.qr = null
    runtime.qrExpiresAt = null
    runtime.pairingCode = null
    runtime.phoneNumber = null
    runtime.profileName = null
    runtime.profilePicUrl = null
    runtime.connectedSince = null
    runtime.lastDisconnectedAt = new Date()

    this.setStatus(runtime, 'LOGGED_OUT', 'Sesi dilepas dari WhatsApp.')

    // Leave the runtime registered but inert until the user reconnects.
    runtime.auth = await useSqliteAuthState(key)
  }

  async restart(key: string): Promise<EngineSessionState> {
    const runtime = this.runtimeFor(key)
    runtime.reconnectAttempts = 0
    if (runtime.sock) {
      try {
        runtime.sock.end(undefined)
      } catch {
        // ignore
      }
      runtime.sock = null
    }
    await delay(300)
    await this.openSocket(runtime)
    return this.snapshot(runtime)
  }

  async removeSession(key: string): Promise<void> {
    const runtime = this.runtimes.get(key)
    if (runtime) {
      if (runtime.reconnectTimer) clearTimeout(runtime.reconnectTimer)
      try {
        runtime.sock?.end(undefined)
      } catch {
        // ignore
      }
      runtime.auth?.close()
      this.runtimes.delete(key)
    }
    clearStoredCredentials(key)
  }

  // ───────────────────────────────────────────────────── qr / pairing ──────

  async refreshQr(key: string): Promise<{ qr: string; expiresAt: string }> {
    const runtime = this.runtimeFor(key)

    // A live socket will emit a fresh QR on its own; drop the cached one so the
    // caller waits for genuinely new data rather than a stale payload.
    if (runtime.sock && runtime.qrExpiresAt && runtime.qrExpiresAt.getTime() > Date.now()) {
      const current = runtime.qr
      if (current) return { qr: current, expiresAt: runtime.qrExpiresAt.toISOString() }
    }

    if (runtime.sock) {
      // Reopen to force WhatsApp to issue a new payload.
      try {
        runtime.sock.end(undefined)
      } catch {
        // ignore
      }
      runtime.sock = null
    }

    const waitForQr = new Promise<{ qr: string; expiresAt: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = runtime.qrWaiters.indexOf(resolve)
        if (index >= 0) runtime.qrWaiters.splice(index, 1)
        reject(new Error('Waktu habis menunggu kode QR dari WhatsApp.'))
      }, 45_000)

      runtime.qrWaiters.push((value) => {
        clearTimeout(timeout)
        resolve(value)
      })
    })

    runtime.auth = runtime.auth ?? (await useSqliteAuthState(key))
    await this.openSocket(runtime)
    return waitForQr
  }

  async requestPairingCode(
    input: PairingCodeInput
  ): Promise<{ pairingCode: string; expiresAt: string }> {
    const runtime = this.runtimeFor(input.sessionKey)
    const phoneNumber = input.phoneNumber.replace(/\D/g, '')

    if (!phoneNumber || phoneNumber.length < 8) {
      throw new Error('Masukkan nomor telepon internasional lengkap, hanya angka.')
    }

    // The account is already linked — pairing would be a no-op.
    if (runtime.auth?.wasRegistered() || runtime.status === 'CONNECTED') {
      throw new Error('Sesi ini sudah tertaut ke sebuah akun WhatsApp.')
    }

    // Pairing requires a socket in the "connecting" phase.
    if (!runtime.sock) {
      runtime.auth = runtime.auth ?? (await useSqliteAuthState(runtime.key))
      await this.openSocket(runtime)
    }

    // Give the socket a moment to reach the registration handshake — requesting
    // too early is the most common cause of a rejected pairing attempt.
    await delay(3_000)

    const requestCode = async (): Promise<string> => {
      let lastError: unknown = null

      // WhatsApp occasionally rejects the first request; retrying is standard.
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const code = await runtime.sock!.requestPairingCode(phoneNumber)
          return code
        } catch (error) {
          lastError = error
          if (attempt < 3) await delay(2_000)
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error('WhatsApp tidak mengembalikan kode pairing.')
    }

    const raw = await requestCode()

    // WhatsApp returns 8 characters; groups of four are far easier to type.
    const formatted = raw.match(/.{1,4}/g)?.join('-') ?? raw

    runtime.pairingCode = formatted
    runtime.pairingCodeIssuedAt = new Date()
    runtime.pairingRequested = true

    this.setStatus(
      runtime,
      'PAIRING_REQUIRED',
      'Masukkan kode pairing di ponsel Anda untuk menyelesaikan penautan.'
    )

    this.emit({
      type: 'session.pairing',
      sessionKey: runtime.key,
      pairingCode: formatted,
      phoneNumber,
      at: new Date().toISOString(),
    })

    return {
      pairingCode: formatted,
      expiresAt: new Date(Date.now() + PAIRING_TTL_MS).toISOString(),
    }
  }

  // ─────────────────────────────────────────────────────────── messaging ───

  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    const runtime = this.runtimeFor(input.sessionKey)

    if (!runtime.sock || runtime.status !== 'CONNECTED') {
      throw new Error(
        'Sesi WhatsApp terputus. Hubungkan ulang sesi untuk melanjutkan.'
      )
    }

    const recipient = normalizeRecipient(input.to)
    runtime.inFlight += 1

    try {
      // Optional human-like pacing. Applied server-side so it survives a client
      // navigating away mid-send.
      if (input.simulateTyping && input.simulateTyping > 0) {
        try {
          await runtime.sock.sendPresenceUpdate('composing', recipient)
        } catch {
          // Presence is cosmetic; never fail a send over it.
        }
        await delay(input.simulateTyping * 1_000)
        try {
          await runtime.sock.sendPresenceUpdate('paused', recipient)
        } catch {
          // ignore
        }
      }

      if (input.delayMs && input.delayMs > 0) {
        await delay(input.delayMs)
      }

      const content = await this.buildContent(input)
      const options: MiscMessageGenerationOptions = {}

      if (input.quotedId) {
        // Quoting by ID alone: we only persist the id, so we reconstruct the
        // minimal message key Baileys needs to render the quote.
        options.quoted = buildQuotedStub(recipient, input.quotedId)
      }

      const started = Date.now()
      const sent = await runtime.sock.sendMessage(recipient, content, options)
      const latencyMs = Date.now() - started

      const externalId = sent?.key?.id
      if (!externalId) {
        throw new Error('WhatsApp menerima pengiriman tetapi tidak mengembalikan id pesan.')
      }

      runtime.messagesSent += 1

      if (input.markRead && input.quotedId) {
        try {
          await runtime.sock.readMessages([
            { remoteJid: recipient, id: input.quotedId, fromMe: false },
          ])
        } catch {
          // Read receipts are best-effort.
        }
      }

      this.emit({
        type: 'message.sent',
        sessionKey: runtime.key,
        externalId,
        to: recipient,
        at: new Date().toISOString(),
        latencyMs,
      })

      return {
        externalId,
        timestamp: Date.now(),
        recipient,
        type: input.type,
      }
    } finally {
      runtime.inFlight = Math.max(0, runtime.inFlight - 1)
    }
  }

  /** Translate our generic message input into Baileys content objects. */
  private async buildContent(input: SendMessageInput): Promise<AnyMessageContent> {
    const media = await resolveMedia(input)

    switch (input.type) {
      case 'text':
        if (!input.text?.trim()) throw new Error('Isi pesan tidak boleh kosong.')
        return { text: input.text }

      case 'image':
        return { image: media, caption: input.caption ?? undefined }

      case 'video':
        return { video: media, caption: input.caption ?? undefined }

      case 'audio':
        return {
          audio: media,
          mimetype: input.mimeType ?? 'audio/mp4',
          ptt: false,
        }

      case 'document':
        return {
          document: media,
          mimetype: input.mimeType ?? 'application/octet-stream',
          fileName: input.fileName ?? 'document',
          caption: input.caption ?? undefined,
        }

      case 'sticker':
        return { sticker: media }

      case 'location': {
        if (input.latitude === undefined || input.longitude === undefined) {
          throw new Error('Pesan lokasi memerlukan lintang dan bujur.')
        }
        return {
          location: {
            degreesLatitude: input.latitude,
            degreesLongitude: input.longitude,
            name: input.locationName ?? undefined,
            address: input.address ?? undefined,
          },
        }
      }

      case 'contact': {
        const name = input.contactName ?? 'Contact'
        const phone = (input.contactPhone ?? input.to).replace(/\D/g, '')
        return {
          contacts: {
            displayName: name,
            contacts: [
              {
                vcard: [
                  'BEGIN:VCARD',
                  'VERSION:3.0',
                  `FN:${name}`,
                  `TEL;type=CELL;type=VOICE;waid=${phone}:+${phone}`,
                  'END:VCARD',
                ].join('\n'),
              },
            ],
          },
        }
      }

      default:
        throw new Error(`Unsupported message type: ${input.type}`)
    }
  }

  async getQueueDepth(sessionKey: string): Promise<number> {
    return this.runtimes.get(sessionKey)?.inFlight ?? 0
  }

  // ───────────────────────────────────────────────────────────── groups ────

  /**
   * Fetch group metadata for a connected session.
   *
   * Only the `local-baileys` driver can do this. The Nano script has no
   * group-export module, so that driver throws `EngineCapabilityError` rather
   * than returning invented data — see lib/engine/types.ts.
   */
  async listGroups(sessionKey: string): Promise<EngineGroup[]> {
    const runtime = this.runtimeFor(sessionKey)

    if (!runtime.sock || runtime.status !== 'CONNECTED') {
      throw new Error(
        'Sesi WhatsApp terputus. Hubungkan ulang sesi untuk melanjutkan.'
      )
    }

    const raw = await runtime.sock.groupFetchAllParticipating()
    const groups: EngineGroup[] = []

    for (const [jid, meta] of Object.entries(raw) as Array<[string, GroupMetadata]>) {
      groups.push({
        jid,
        name: meta.subject ?? 'Grup tanpa nama',
        description: meta.desc ?? null,
        memberCount: meta.participants?.length ?? 0,
        isAdmin: Boolean(
          meta.participants?.some(
            (p) =>
              p.id === runtime.sock?.user?.id &&
              (p.admin === 'admin' || p.admin === 'superadmin')
          )
        ),
        inviteCode: meta.inviteCode ?? null,
        pictureUrl: null,
        createdAt: meta.creation ? new Date(meta.creation * 1000).toISOString() : null,
        participants: (meta.participants ?? []).map((participant) => ({
          jid: participant.id,
          phone: phoneFromJid(participant.id),
          name: null,
          isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin',
          isSuperAdmin: participant.admin === 'superadmin',
        })),
      })
    }

    return groups
  }

  // ───────────────────────────────────────────────────────────── queries ───

  getState(sessionKey: string): EngineSessionState | null {
    const runtime = this.runtimes.get(sessionKey)
    return runtime ? this.snapshot(runtime) : null
  }

  listStates(): EngineSessionState[] {
    return [...this.runtimes.values()].map((runtime) => this.snapshot(runtime))
  }

  size(): number {
    return this.runtimes.size
  }

  /** Close every socket so the gateway process can exit cleanly. */
  shutdown() {
    for (const runtime of this.runtimes.values()) {
      runtime.autoReconnect = false
      try {
        runtime.sock?.end(undefined)
      } catch {
        // Already closed — nothing to do.
      }
    }
  }
}

// ───────────────────────────────────────────────────────────── helpers ──────

/** Pull a displayable type + text out of an arbitrary Baileys message body. */
function extractContent(content: Record<string, any>): {
  type: MessageType
  text: string | null
  mediaMime: string | null
} {
  const body =
    content.ephemeralMessage?.message ??
    content.viewOnceMessage?.message ??
    content.viewOnceMessageV2?.message ??
    content

  if (body.conversation) {
    return { type: 'text', text: body.conversation, mediaMime: null }
  }
  if (body.extendedTextMessage?.text) {
    return { type: 'text', text: body.extendedTextMessage.text, mediaMime: null }
  }
  if (body.imageMessage) {
    return {
      type: 'image',
      text: body.imageMessage.caption ?? null,
      mediaMime: body.imageMessage.mimetype ?? null,
    }
  }
  if (body.videoMessage) {
    return {
      type: 'video',
      text: body.videoMessage.caption ?? null,
      mediaMime: body.videoMessage.mimetype ?? null,
    }
  }
  if (body.audioMessage) {
    return { type: 'audio', text: null, mediaMime: body.audioMessage.mimetype ?? null }
  }
  if (body.documentMessage) {
    return {
      type: 'document',
      text: body.documentMessage.caption ?? body.documentMessage.fileName ?? null,
      mediaMime: body.documentMessage.mimetype ?? null,
    }
  }
  if (body.stickerMessage) {
    return { type: 'sticker', text: null, mediaMime: body.stickerMessage.mimetype ?? null }
  }
  if (body.locationMessage) {
    return { type: 'location', text: null, mediaMime: null }
  }
  if (body.contactMessage) {
    return { type: 'contact', text: body.contactMessage.displayName ?? null, mediaMime: null }
  }

  return { type: 'text', text: null, mediaMime: null }
}

/**
 * Resolve media for a send.
 *
 * Accepts either a public URL (Baileys streams it) or a base64 payload from a
 * dashboard upload. Returns a Buffer for base64 and a `{ url }` wrapper for
 * remote media, which is what Baileys expects for each case.
 */
async function resolveMedia(
  input: SendMessageInput
): Promise<Buffer | { url: string }> {
  if (input.mediaBase64) {
    // Accept both a bare base64 string and a full data: URL.
    const base64 = input.mediaBase64.includes(',')
      ? input.mediaBase64.split(',')[1]
      : input.mediaBase64
    return Buffer.from(base64, 'base64')
  }

  if (input.mediaUrl) {
    return { url: input.mediaUrl }
  }

  throw new Error(`A ${input.type} message requires media (upload or URL).`)
}

/**
 * Build the minimal quoted-message stub Baileys needs.
 *
 * We persist only the remote message id, not the full WAMessage, so the quote
 * renders as a reply to an id rather than echoing the original body. Documented
 * rather than hidden: if full quoted bodies are required, persist the raw
 * provider payload alongside the message row.
 */
function buildQuotedStub(remoteJid: string, id: string): WAMessage {
  return {
    key: {
      remoteJid,
      fromMe: true,
      id,
    },
    message: { conversation: '' },
  } as unknown as WAMessage
}