import { spawn, type ChildProcessByStdio } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type { Readable } from 'node:stream'
import { gatewayConfig, logger } from '../config'
import { nanoInstallInfo, nanoStateDirs } from '../nano/introspect'
import { hardenSessionState, mkdirPrivate } from '../permissions'
import type {
  CreateSessionInput,
  EngineEvent,
  EngineGroup,
  EngineSessionState,
  PairingCodeInput,
  SendMessageInput,
  SendMessageResult,
  WhatsAppEngine,
} from '../../lib/engine/types'
import {
  EngineCapabilityError,
  EngineInputError,
  EngineTimeoutError,
} from '../../lib/engine/types'
import type { NanoLogBatch, NanoLogLevel, NanoLogLine } from '../../lib/engine/nano'
import type { MessageType, SessionStatus } from '../../types/enums'

/**
 * `nano-process` driver — the Nano bot script is the engine.
 *
 * ── DESIGN ──────────────────────────────────────────────────────────────────
 * One **shared code installation** (`NANO_ENGINE_DIR`) with **per-session state**:
 *
 *   shared   plugins/ · config/ · lib/ · assets/ · node_modules/
 *   per bot  sessions/auth.db            (WhatsApp credentials)
 *            data/database/nano.sqlite   (users, prefixes, group settings, …)
 *
 * Nano derives those two paths from its own file location, so a small additive
 * patch (see `.gateway-patch-backup/` in the install) lets them be redirected
 * via `NANO_SESSION_DIR` / `NANO_DATA_DIR`. Unset, the script behaves exactly
 * as stock. This gives full isolation without copying 378 npm packages per bot.
 *
 * ── OBSERVABLE SURFACE ──────────────────────────────────────────────────────
 * The script has no HTTP API, so everything is derived from what it genuinely
 * prints, verified against its source:
 *
 *   `QR_IMAGE=<https://api.qrserver.com/…&data=<urlencoded payload>>`  → QR
 *   a boxed `│ ABCD-EFGH │`                                            → pairing
 *   `Berhasil terhubung ke WhatsApp!`                                  → connected
 *   `Sesi logout dari perangkat.` / `Bot berhenti (logged out)`        → logged out
 *
 * Outbound sends go through the injected bridge (`core/gateway-bridge.js` +
 * a hook in `index.js`), which is inert unless `NANO_GATEWAY_BRIDGE_DIR` is set.
 * Both are installed by `scripts/install-nano-bridge.ts`.
 */

const QR_TTL_MS = 60_000
const PAIRING_TTL_MS = 60_000
const SEND_TIMEOUT_MS = 60_000
const SEND_POLL_MS = 150

/**
 * How often each session's message journal is polled.
 *
 * The bot owns the socket, so its traffic reaches the platform through a file
 * rather than an event emitter; this is the latency between a reply the bot has
 * already sent and the panel's counters, history and charts showing it.
 */
const JOURNAL_POLL_MS = 400

/** Content kinds the platform models. Anything else degrades to `text`. */
const MESSAGE_KINDS = [
  'text',
  'image',
  'video',
  'audio',
  'document',
  'sticker',
  'location',
  'contact',
] as const

/** Ring-buffer bounds for the log viewer (per session). */
const MAX_LOG_LINES = 500
const MAX_LOG_CHARS = 200_000

interface NanoRuntime {
  key: string
  bridgeDir: string
  sessionsDir: string
  dataDir: string
  process: ChildProcessByStdio<null, Readable, Readable> | null

  autoReconnect: boolean
  alwaysOnline: boolean
  readReceipts: boolean
  typingSimulation: boolean
  defaultDelayMs: number

  /** Which handshake the running process was started in. */
  mode: 'qr' | 'pairing' | null
  pairingNumber: string | null

  status: SessionStatus
  statusMessage: string | null

  qr: string | null
  qrExpiresAt: Date | null
  pairingCode: string | null

  phoneNumber: string | null
  profileName: string | null
  /**
   * The account's own WhatsApp avatar, published by the bridge.
   *
   * Only the bot process can ask WhatsApp for this, so it arrives through
   * `bridge/identity.json` rather than a direct call.
   */
  profilePicUrl: string | null
  platform: string | null

  connectedSince: Date | null
  lastConnectedAt: Date | null
  lastDisconnectedAt: Date | null
  lastError: string | null

  messagesSent: number
  messagesReceived: number

  resultsOffset: number
  /** Read cursor into the bot's message journal (`bridge/messages.jsonl`). */
  messagesOffset: number
  /**
   * mtime of the bridge's `identity.json`, so the gateway re-parses it only when
   * the bot has actually published something new.
   */
  identityMtimeMs: number
  stdoutBuffer: string
  restartAttempts: number

  /** Bounded tail of everything the bot actually printed, for the log viewer. */
  logs: NanoLogLine[]
  logSeq: number
  logChars: number
}

export class NanoProcessDriver implements WhatsAppEngine {
  private runtimes = new Map<string, NanoRuntime>()
  private journalTimer: NodeJS.Timeout | null = null

  constructor(private readonly emit: (event: EngineEvent) => void) {
    const info = nanoInstallInfo()
    if (!info.available) {
      logger.error({ reason: info.reason }, 'nano engine is not usable')
    } else if (!info.patched) {
      logger.warn(
        { dir: info.dir },
        'nano bridge is not installed — run: npx tsx scripts/install-nano-bridge.ts'
      )
    }

    this.journalTimer = setInterval(() => this.drainJournals(), JOURNAL_POLL_MS)
    // Never hold the process open just for bookkeeping.
    this.journalTimer.unref()
  }

  private engineDir(): string {
    const info = nanoInstallInfo()
    if (!info.available || !info.dir) {
      throw new Error(
        `NANO_ENGINE_DIR tidak dapat dipakai${info.reason ? `: ${info.reason}` : '.'} Arahkan ke folder yang berisi index.js.`
      )
    }
    return info.dir
  }

  private snapshot(runtime: NanoRuntime): EngineSessionState {
    return {
      key: runtime.key,
      driver: 'nano-process',
      hasCredentials: hasNanoCredentials(runtime.sessionsDir),
      status: runtime.status,
      statusMessage: runtime.statusMessage,
      qr: runtime.qr,
      qrIssuedAt: runtime.qrExpiresAt
        ? new Date(runtime.qrExpiresAt.getTime() - QR_TTL_MS).toISOString()
        : null,
      qrExpiresAt: runtime.qrExpiresAt?.toISOString() ?? null,
      pairingCode: runtime.pairingCode,
      pairingCodeIssuedAt: null,
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
    runtime: NanoRuntime,
    status: SessionStatus,
    statusMessage: string | null = null
  ) {
    runtime.status = status
    runtime.statusMessage = statusMessage
    if (status === 'ERROR' || status === 'BANNED') runtime.lastError = statusMessage

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

  private runtimeFor(key: string): NanoRuntime {
    const runtime = this.runtimes.get(key)
    if (!runtime) throw new Error(`Sesi ${key} tidak dimuat di driver ini.`)
    return runtime
  }

  // ─────────────────────────────────────────────────────────── lifecycle ───

  async createSession(input: CreateSessionInput): Promise<EngineSessionState> {
    const existing = this.runtimes.get(input.key)
    if (existing) return this.snapshot(existing)

    const dirs = nanoStateDirs(input.key)
    // Private from the moment they exist: this tree holds WhatsApp credentials
    // and the bot's own database, and the script rewrites files inside it with
    // its own modes, so the directory permission is what actually protects them.
    mkdirPrivate(dirs.sessionsDir)
    mkdirPrivate(dirs.dataDir)
    mkdirPrivate(dirs.bridgeDir)
    hardenSessionState(dirs)

    const runtime: NanoRuntime = {
      key: input.key,
      bridgeDir: dirs.bridgeDir,
      sessionsDir: dirs.sessionsDir,
      dataDir: dirs.dataDir,
      process: null,
      autoReconnect: input.autoReconnect ?? true,
      alwaysOnline: input.alwaysOnline ?? false,
      readReceipts: input.readReceipts ?? true,
      typingSimulation: input.typingSimulation ?? false,
      defaultDelayMs: input.defaultDelayMs ?? 1200,
      mode: null,
      pairingNumber: null,
      status: 'CREATED',
      statusMessage: null,
      qr: null,
      qrExpiresAt: null,
      pairingCode: null,
      phoneNumber: null,
      profileName: null,
      profilePicUrl: null,
      platform: null,
      connectedSince: null,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
      lastError: null,
      messagesSent: 0,
      messagesReceived: 0,
      resultsOffset: 0,
      // Start at the end of the journal: a gateway restart must not replay
      // traffic from the previous run as if it had just been sent.
      messagesOffset: journalSize(path.join(dirs.bridgeDir, 'messages.jsonl')),
      identityMtimeMs: 0,
      stdoutBuffer: '',
      restartAttempts: 0,
      logs: [],
      logSeq: 0,
      logChars: 0,
    }

    this.runtimes.set(input.key, runtime)
    logger.info({ key: input.key, stateDir: dirs.root }, 'nano session prepared')
    return this.snapshot(runtime)
  }

  /** Start (or restart) the bot process in the requested handshake mode. */
  private startProcess(runtime: NanoRuntime, mode: 'qr' | 'pairing', pairingNumber?: string) {
    this.stopProcess(runtime)

    const engineDir = this.engineDir()
    this.setStatus(runtime, 'CONNECTING')

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      // Per-session isolation — honoured by the additive patch in core/sesi.js
      // and core/sqlite.js. Without it every bot would share one auth.db.
      NANO_SESSION_DIR: runtime.sessionsDir,
      NANO_DATA_DIR: runtime.dataDir,
      // Activates the bridge; inert when unset, so stock runs are unaffected.
      NANO_GATEWAY_BRIDGE_DIR: runtime.bridgeDir,
      // Keep the bot from trying to read a phone number from a TTY.
      NANO_LOG: process.env.NANO_LOG ?? 'silent',
    }

    if (mode === 'pairing') {
      // Verified behaviour: the script only calls requestPairingCode when
      // PAIRING_NUMBER is set AND NANO_QR is not.
      env.PAIRING_NUMBER = pairingNumber ?? ''
      delete env.NANO_QR
    } else {
      env.NANO_QR = '1'
      delete env.PAIRING_NUMBER
    }

    const child = spawn(process.execPath, ['index.js'], {
      cwd: engineDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    runtime.process = child
    runtime.mode = mode
    runtime.pairingNumber = pairingNumber ?? null
    runtime.stdoutBuffer = ''

    // The previous handshake is dead the moment we restart: a QR from a
    // torn-down socket is unscannable, and a pairing code is single-use. Leaving
    // either set would let the UI offer something that no longer works.
    runtime.qr = null
    runtime.qrExpiresAt = null
    runtime.pairingCode = null

    this.pushLog(
      runtime,
      'system',
      `Menjalankan bot Nano (${mode === 'pairing' ? `pairing: ${pairingNumber ?? '-'}` : 'QR'}) di ${engineDir}`
    )

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => this.consume(runtime, chunk, 'stdout'))
    child.stderr.on('data', (chunk: string) => this.consume(runtime, chunk, 'stderr'))

    child.on('exit', (code, signal) => {
      // A restart (link mode change, QR refresh, pairing code) replaces the
      // process before the old one finishes dying. Without this guard the stale
      // child's exit handler would clear the *new* child's reference, leaving it
      // running with nothing pointing at it — unbounded process leaks and a
      // session we can no longer stop.
      if (runtime.process !== child) return

      runtime.process = null
      runtime.lastDisconnectedAt = new Date()
      runtime.connectedSince = null
      runtime.mode = null
      this.pushLog(
        runtime,
        'system',
        `Proses bot berhenti (${signal ?? `exit ${code}`}).`
      )

      // A deliberate logout or shutdown should not trigger a restart.
      if (runtime.status === 'LOGGED_OUT' || !runtime.autoReconnect) {
        if (runtime.status !== 'LOGGED_OUT') {
          this.setStatus(runtime, 'DISCONNECTED', `Bot process stopped (${signal ?? code}).`)
        }
        return
      }

      runtime.restartAttempts += 1
      if (runtime.restartAttempts > 8) {
        this.setStatus(
          runtime,
          'ERROR',
          `Proses bot terus keluar (terakhir: ${signal ?? code}). Periksa log dan mulai ulang secara manual.`
        )
        return
      }

      const backoff = Math.min(2_000 * 2 ** (runtime.restartAttempts - 1), 30_000)
      this.setStatus(
        runtime,
        'RECONNECTING',
        `Proses bot keluar (${signal ?? code}). Mulai ulang dalam ${Math.round(backoff / 1000)}s…`
      )

      this.pushLog(
        runtime,
        'system',
        `Menjadwalkan restart otomatis dalam ${Math.round(backoff / 1000)}s (percobaan ${runtime.restartAttempts}).`
      )

      setTimeout(() => {
        if (runtime.autoReconnect && !runtime.process) {
          this.startProcess(runtime, mode, runtime.pairingNumber ?? undefined)
        }
      }, backoff)
    })

    child.on('error', (error) => {
      if (runtime.process !== child) return
      runtime.lastError = error.message
      this.setStatus(runtime, 'ERROR', `Tidak dapat menjalankan proses Nano: ${error.message}`)
    })
  }

  /**
   * Append one line to the session's log tail.
   *
   * The buffer is bounded by both line count and total characters: a bot that
   * loops on an error must not be able to grow gateway memory without limit.
   */
  private pushLog(
    runtime: NanoRuntime,
    stream: NanoLogLine['stream'],
    rawLine: string
  ) {
    const text = stripAnsi(rawLine).trim()
    if (!text) return

    runtime.logSeq += 1
    runtime.logChars += text.length
    runtime.logs.push({
      seq: runtime.logSeq,
      at: new Date().toISOString(),
      level: classifyLogLevel(text, stream),
      stream,
      text,
    })

    while (runtime.logs.length > MAX_LOG_LINES || runtime.logChars > MAX_LOG_CHARS) {
      const dropped = runtime.logs.shift()
      if (!dropped) break
      runtime.logChars -= dropped.text.length
    }
  }

  /** Log lines for the viewer, from `sinceSeq` (exclusive) onwards. */
  async getLogs(sessionKey: string, sinceSeq = 0): Promise<NanoLogBatch> {
    const runtime = this.runtimeFor(sessionKey)
    const lines = runtime.logs.filter((line) => line.seq > sinceSeq).slice(-MAX_LOG_LINES)
    return {
      lines,
      nextSeq: lines.length > 0 ? lines[lines.length - 1].seq : Math.max(sinceSeq, runtime.logSeq),
      buffered: runtime.logs.length,
    }
  }

  /** Parse the script's output for the signals it genuinely prints. */
  private consume(runtime: NanoRuntime, chunk: string, stream: NanoLogLine['stream']) {
    runtime.stdoutBuffer += chunk

    // Bound the buffer in case a line never terminates.
    if (runtime.stdoutBuffer.length > 200_000) {
      runtime.stdoutBuffer = runtime.stdoutBuffer.slice(-50_000)
    }

    const lines = runtime.stdoutBuffer.split('\n')
    runtime.stdoutBuffer = lines.pop() ?? ''

    for (const rawLine of lines) {
      const line = stripAnsi(rawLine).trim()
      if (!line) continue

      // Everything the bot prints is kept for the log viewer, whether or not it
      // is one of the handshake signals parsed below.
      this.pushLog(runtime, stream, line)

      // ── QR payload ────────────────────────────────────────────────────────
      if (line.includes('QR_IMAGE=')) {
        const url = line.slice(line.indexOf('QR_IMAGE=') + 'QR_IMAGE='.length).trim()
        const payload = extractQrPayload(url)
        if (!payload) continue

        runtime.qr = payload
        runtime.qrExpiresAt = new Date(Date.now() + QR_TTL_MS)
        runtime.pairingCode = null

        if (runtime.status !== 'CONNECTED') {
          this.setStatus(runtime, 'QR_REQUIRED', 'Scan kode QR untuk menautkan perangkat ini.')
        }

        this.emit({
          type: 'session.qr',
          sessionKey: runtime.key,
          qr: payload,
          expiresAt: runtime.qrExpiresAt.toISOString(),
          at: new Date().toISOString(),
        })
        continue
      }

      // ── pairing code box ──────────────────────────────────────────────────
      const pairingMatch = line.match(/\b([A-Z0-9]{4}-[A-Z0-9]{4})\b/)
      if (pairingMatch && line.includes('│')) {
        runtime.pairingCode = pairingMatch[1]
        runtime.restartAttempts = 0
        // A code supersedes the QR entirely, and vice versa.
        runtime.qr = null
        runtime.qrExpiresAt = null
        this.setStatus(
          runtime,
          'PAIRING_REQUIRED',
          'Masukkan kode pairing di ponsel Anda untuk menyelesaikan penautan.'
        )
        this.emit({
          type: 'session.pairing',
          sessionKey: runtime.key,
          pairingCode: pairingMatch[1],
          phoneNumber: runtime.pairingNumber ?? '',
          at: new Date().toISOString(),
        })
        continue
      }

      // ── connected ─────────────────────────────────────────────────────────
      if (line.includes('Berhasil terhubung ke WhatsApp')) {
        runtime.qr = null
        runtime.qrExpiresAt = null
        runtime.pairingCode = null
        runtime.connectedSince = new Date()
        runtime.lastConnectedAt = new Date()
        runtime.restartAttempts = 0
        this.setStatus(runtime, 'CONNECTED')
        continue
      }

      // ── logged out ────────────────────────────────────────────────────────
      if (
        line.includes('Sesi logout dari perangkat') ||
        line.includes('Bot berhenti (logged out)')
      ) {
        runtime.qr = null
        runtime.pairingCode = null
        runtime.phoneNumber = null
        runtime.connectedSince = null
        runtime.autoReconnect = false
        this.setStatus(
          runtime,
          'LOGGED_OUT',
          'Perangkat ini telah dilepas dari WhatsApp. Tautkan ulang untuk menyambung kembali.'
        )
        continue
      }

      // The bot prints the linked number indirectly; capture it when the bridge
      // reports the connection so the dashboard can show it.
      if (line.includes('GATEWAY_BRIDGE=')) {
        logger.info({ key: runtime.key, line }, 'nano bridge status')
        if (line.includes('ready') || line.includes('rebound')) {
          const number = runtime.pairingNumber
          if (number && !runtime.phoneNumber) {
            runtime.phoneNumber = number
            this.emit({
              type: 'session.status',
              sessionKey: runtime.key,
              status: runtime.status,
              statusMessage: runtime.statusMessage,
              phoneNumber: number,
              profileName: runtime.profileName,
              profilePicUrl: runtime.profilePicUrl,
              platform: runtime.platform,
              at: new Date().toISOString(),
            })
          }
        }
      }
    }
  }

  private stopProcess(runtime: NanoRuntime) {
    if (!runtime.process) return
    const child = runtime.process
    runtime.process = null
    try {
      child.kill('SIGTERM')

      // `child.killed` only reports that a signal was *sent*, so it would always
      // be true here and the escalation would never run. `exitCode`/`signalCode`
      // are the real liveness signals.
      const escalate = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill('SIGKILL')
        }
      }, 5_000)

      // Do not hold the event loop open just for the escalation timer.
      escalate.unref?.()
      child.once('exit', () => clearTimeout(escalate))
    } catch {
      // Already gone.
    }
  }

  /**
   * Start the bot.
   *
   * Defaults to QR mode. To link with a pairing code instead, call
   * `requestPairingCode` — that restarts the process in pairing mode, which is
   * how the script is designed to work (the two handshakes are mutually
   * exclusive).
   */
  async connect(key: string): Promise<EngineSessionState> {
    const runtime = this.runtimeFor(key)
    if (!runtime.process) this.startProcess(runtime, 'qr')
    return this.snapshot(runtime)
  }

  async disconnect(key: string): Promise<EngineSessionState> {
    const runtime = this.runtimeFor(key)
    runtime.autoReconnect = false
    this.stopProcess(runtime)

    // The socket is gone, so any QR or pairing code handed out for it is dead.
    // Leaving them set would let the dashboard offer a code that cannot work.
    runtime.qr = null
    runtime.qrExpiresAt = null
    runtime.pairingCode = null
    runtime.connectedSince = null

    this.pushLog(runtime, 'system', 'Bot dihentikan oleh pengguna.')
    this.setStatus(runtime, 'DISCONNECTED', 'Diputuskan oleh pengguna.')
    return this.snapshot(runtime)
  }

  async logout(key: string): Promise<void> {
    const runtime = this.runtimeFor(key)
    runtime.autoReconnect = false
    this.stopProcess(runtime)

    // Remove this bot's credentials only — the shared installation is untouched.
    for (const suffix of ['', '-wal', '-shm']) {
      fs.rmSync(path.join(runtime.sessionsDir, `auth.db${suffix}`), { force: true })
    }

    runtime.qr = null
    runtime.pairingCode = null
    runtime.phoneNumber = null
    runtime.connectedSince = null
    this.setStatus(runtime, 'LOGGED_OUT', 'Sesi dilepas dari WhatsApp.')
  }

  async restart(key: string): Promise<EngineSessionState> {
    const runtime = this.runtimeFor(key)
    runtime.restartAttempts = 0
    // Preserve the handshake the session was using.
    this.startProcess(runtime, runtime.mode ?? 'qr', runtime.pairingNumber ?? undefined)
    return this.snapshot(runtime)
  }

  async removeSession(key: string): Promise<void> {
    const runtime = this.runtimes.get(key)
    if (runtime) {
      runtime.autoReconnect = false
      this.stopProcess(runtime)
      // Wipe this bot's state, leave the shared install alone.
      fs.rmSync(nanoStateDirs(key).root, { recursive: true, force: true })
      this.runtimes.delete(key)
    }
  }

  async refreshQr(key: string): Promise<{ qr: string; expiresAt: string }> {
    const runtime = this.runtimeFor(key)
    // Only a restart makes the script emit a fresh QR.
    this.startProcess(runtime, 'qr')

    const deadline = Date.now() + 45_000
    while (Date.now() < deadline) {
      if (runtime.qr && runtime.qrExpiresAt && runtime.qrExpiresAt.getTime() > Date.now()) {
        return { qr: runtime.qr, expiresAt: runtime.qrExpiresAt.toISOString() }
      }
      await sleep(250)
    }

    throw new EngineTimeoutError(
      'QR_TIMEOUT',
      'Proses Nano tidak mengeluarkan kode QR tepat waktu. Periksa log bot untuk melihat kesalahan.'
    )
  }

  /**
   * Link using a pairing code.
   *
   * This restarts the process with `PAIRING_NUMBER` set and `NANO_QR` unset —
   * the exact condition the script checks before requesting a code.
   */
  async requestPairingCode(
    input: PairingCodeInput
  ): Promise<{ pairingCode: string; expiresAt: string }> {
    const runtime = this.runtimeFor(input.sessionKey)
    const phoneNumber = input.phoneNumber.replace(/\D/g, '')

    if (phoneNumber.length < 8) {
      throw new EngineInputError(
        'INVALID_NUMBER',
        'Masukkan nomor telepon internasional lengkap beserta kode negara, hanya angka.'
      )
    }

    runtime.pairingCode = null
    runtime.phoneNumber = phoneNumber
    runtime.restartAttempts = 0
    this.startProcess(runtime, 'pairing', phoneNumber)

    const deadline = Date.now() + 60_000
    while (Date.now() < deadline) {
      if (runtime.pairingCode) {
        return {
          pairingCode: runtime.pairingCode,
          expiresAt: new Date(Date.now() + PAIRING_TTL_MS).toISOString(),
        }
      }
      await sleep(250)
    }

    throw new EngineTimeoutError(
      'PAIRING_TIMEOUT',
      'WhatsApp tidak mengeluarkan kode pairing. Pastikan nomornya benar, belum tertaut, dan log bot tidak menampilkan kesalahan.'
    )
  }

  // ─────────────────────────────────────────────────────────── messaging ───

  /**
   * Send through the injected bridge.
   *
   * Writes a command to `commands.jsonl` and waits for the matching result in
   * `results.jsonl`. The bot process is the only holder of the socket, so this
   * round trip is unavoidable — and it is a real one.
   */
  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    const runtime = this.runtimeFor(input.sessionKey)

    if (runtime.status !== 'CONNECTED') {
      throw new Error('Sesi WhatsApp terputus. Hubungkan ulang sesi untuk melanjutkan.')
    }
    if (!runtime.process) {
      throw new Error('Proses bot Nano tidak berjalan untuk sesi ini.')
    }

    if (input.mediaBase64 && !input.mediaUrl) {
      throw new EngineCapabilityError(
        'media uploads via the nano-process driver',
        'Skrip Nano hanya menerima media lewat URL. Publikasikan berkasnya lalu kirim mediaUrl publik.'
      )
    }

    const id = `cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

    mkdirPrivate(runtime.bridgeDir)
    fs.appendFileSync(
      path.join(runtime.bridgeDir, 'commands.jsonl'),
      `${JSON.stringify({
        id,
        // MessageType is lowercase and matches the bridge's switch 1:1, except
        // `contact`, which the bridge has no builder for — it degrades to text.
        type: input.type,
        to: input.to,
        text: input.text,
        mediaUrl: input.mediaUrl,
        caption: input.caption,
        mimetype: input.mimeType,
        fileName: input.fileName,
        latitude: input.latitude,
        longitude: input.longitude,
        locationName: input.locationName,
        quotedId: input.quotedId,
        at: new Date().toISOString(),
      })}\n`
    )

    const result = await this.awaitResult(runtime, id)
    if (!result.ok) {
      throw new Error(result.error ?? 'Bot Nano gagal mengirim pesan.')
    }

    // `messagesSent` is not incremented here: the bridge journals this send like
    // any other, and the journal reader is the single place that counts — two
    // counters for one message is how a dashboard starts lying.
    return {
      externalId: result.externalId ?? id,
      timestamp: Date.now(),
      recipient: result.recipient ?? input.to,
      type: input.type,
    }
  }

  private async awaitResult(
    runtime: NanoRuntime,
    commandId: string
  ): Promise<{ ok: boolean; externalId?: string | null; recipient?: string; error?: string }> {
    const resultsPath = path.join(runtime.bridgeDir, 'results.jsonl')
    const deadline = Date.now() + SEND_TIMEOUT_MS

    while (Date.now() < deadline) {
      if (fs.existsSync(resultsPath)) {
        const size = fs.statSync(resultsPath).size
        // The bridge trims the file; if it shrank, restart from the beginning.
        if (size < runtime.resultsOffset) runtime.resultsOffset = 0

        if (size > runtime.resultsOffset) {
          const fd = fs.openSync(resultsPath, 'r')
          const length = size - runtime.resultsOffset
          const buffer = Buffer.alloc(length)
          fs.readSync(fd, buffer, 0, length, runtime.resultsOffset)
          fs.closeSync(fd)

          const chunk = buffer.toString('utf8')
          const lastNewline = chunk.lastIndexOf('\n')
          if (lastNewline !== -1) {
            runtime.resultsOffset += Buffer.byteLength(chunk.slice(0, lastNewline + 1), 'utf8')
            for (const line of chunk.slice(0, lastNewline).split('\n')) {
              if (!line.trim()) continue
              try {
                const parsed = JSON.parse(line) as { id?: string }
                if (parsed.id === commandId) {
                  return parsed as never
                }
              } catch {
                // Skip unparseable lines.
              }
            }
          }
        }
      }

      await sleep(SEND_POLL_MS)
    }

    throw new EngineTimeoutError(
      'SEND_TIMEOUT',
      'Waktu habis menunggu konfirmasi kirim dari bot Nano.'
    )
  }

  // ─────────────────────────────────────────────────── message journal ───

  /**
   * Read every session's message journal and forward what has appeared.
   *
   * The bot process holds the WhatsApp socket, so `bridge/messages.jsonl` is
   * the only place its traffic becomes observable. Without this the usage
   * meter, the message history, the throughput chart and inbound automation
   * rules all stay empty while the bot replies to every chat.
   */
  private drainJournals() {
    for (const runtime of this.runtimes.values()) {
      try {
        this.pollIdentity(runtime)
        this.drainJournal(runtime)
      } catch (error) {
        logger.warn({ key: runtime.key, err: error }, 'message journal read failed')
      }
    }
  }

  /**
   * Read the identity the bridge publishes from inside the bot process.
   *
   * The panel wants each bot's own avatar, name and number, but the WhatsApp
   * socket that can answer for them belongs to the bot — so the bridge writes
   * `bridge/identity.json` and this reads it back, the same arrangement as the
   * message journal. Called on the journal tick, but only re-parsed when the
   * file's mtime moves, so an unchanged avatar costs one `stat`.
   */
  private pollIdentity(runtime: NanoRuntime) {
    const identityPath = path.join(runtime.bridgeDir, 'identity.json')

    let stat: fs.Stats
    try {
      stat = fs.statSync(identityPath)
    } catch {
      return // The bridge has not published anything yet.
    }
    if (stat.mtimeMs === runtime.identityMtimeMs) return
    runtime.identityMtimeMs = stat.mtimeMs

    let record: Record<string, unknown>
    try {
      record = JSON.parse(fs.readFileSync(identityPath, 'utf8')) as Record<string, unknown>
    } catch {
      // The bridge writes atomically, so this is only a torn read at shutdown.
      return
    }

    const phoneNumber = typeof record.phoneNumber === 'string' ? record.phoneNumber : null
    const profileName = typeof record.name === 'string' ? record.name : null
    const profilePicUrl = typeof record.profilePicUrl === 'string' ? record.profilePicUrl : null

    // A LID account publishes no number, and must not erase one the pairing flow
    // already established.
    const nextPhone = phoneNumber ?? runtime.phoneNumber
    if (
      nextPhone === runtime.phoneNumber &&
      profileName === runtime.profileName &&
      profilePicUrl === runtime.profilePicUrl
    ) {
      return
    }

    runtime.phoneNumber = nextPhone
    runtime.profileName = profileName
    runtime.profilePicUrl = profilePicUrl

    /*
      Only announce this while the session is genuinely connected. A status
      event carries the status with it, and the panel anchors uptime to the
      moment it first sees CONNECTED — so sending a stale status here would
      reset that timer. When identity arrives before the connection settles,
      the CONNECTED transition carries the fields instead, because `setStatus`
      reads them from the runtime.
    */
    if (runtime.status !== 'CONNECTED') return

    logger.info({ key: runtime.key, hasAvatar: Boolean(profilePicUrl) }, 'bot identity published')
    this.emit({
      type: 'session.status',
      sessionKey: runtime.key,
      status: runtime.status,
      statusMessage: runtime.statusMessage,
      phoneNumber: runtime.phoneNumber,
      profileName: runtime.profileName,
      profilePicUrl: runtime.profilePicUrl,
      platform: runtime.platform,
      at: new Date().toISOString(),
    })
  }

  private drainJournal(runtime: NanoRuntime) {
    const journalPath = path.join(runtime.bridgeDir, 'messages.jsonl')

    let size: number
    try {
      size = fs.statSync(journalPath).size
    } catch {
      return
    }

    // The bridge trims the file; a smaller size means this cursor is stale.
    if (size < runtime.messagesOffset) runtime.messagesOffset = 0
    if (size === runtime.messagesOffset) return

    let chunk: string
    try {
      const fd = fs.openSync(journalPath, 'r')
      const length = size - runtime.messagesOffset
      const buffer = Buffer.alloc(length)
      fs.readSync(fd, buffer, 0, length, runtime.messagesOffset)
      fs.closeSync(fd)
      chunk = buffer.toString('utf8')
    } catch {
      return
    }

    const lastNewline = chunk.lastIndexOf('\n')
    if (lastNewline === -1) return // partial line, wait for the rest
    runtime.messagesOffset += Buffer.byteLength(chunk.slice(0, lastNewline + 1), 'utf8')

    for (const line of chunk.slice(0, lastNewline).split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        this.reportJournalledMessage(runtime, JSON.parse(trimmed) as Record<string, unknown>)
      } catch {
        // One corrupt line must not stall everything behind it.
      }
    }
  }

  private reportJournalledMessage(runtime: NanoRuntime, record: Record<string, unknown>) {
    const externalId = record.externalId ? String(record.externalId) : ''
    // No id means the platform cannot deduplicate, and the same message would be
    // counted again on every retry.
    if (!externalId) return

    const chatId = String(record.chatId ?? '')
    if (!chatId) return

    const at = typeof record.at === 'string' ? record.at : new Date().toISOString()
    const text = typeof record.text === 'string' && record.text ? record.text : null
    const messageType = normalizeMessageType(record.kind)

    if (record.direction === 'in') {
      runtime.messagesReceived += 1
      this.emit({
        type: 'message.received',
        sessionKey: runtime.key,
        externalId,
        from: chatId,
        pushName: typeof record.chatName === 'string' ? record.chatName : null,
        isGroup: Boolean(record.isGroup),
        groupJid: record.isGroup ? chatId : null,
        messageType,
        text,
        mediaMime: null,
        at,
      })
      return
    }

    runtime.messagesSent += 1
    this.emit({
      type: 'message.sent',
      sessionKey: runtime.key,
      externalId,
      to: chatId,
      at,
      messageType,
      text,
    })
  }

  async getQueueDepth(): Promise<number> {
    // The script serialises sends internally and exposes no counter.
    return 0
  }

  /**
   * Group participants are not exportable.
   *
   * The script keeps group *settings* (welcome/antilink/schedules) in its own
   * database — which this platform reads directly, see
   * `gateway/nano/introspect.ts` — but it has no module that enumerates group
   * members, so that is reported as unavailable instead of faked.
   */
  async listGroups(_sessionKey: string): Promise<EngineGroup[]> {
    throw new EngineCapabilityError(
      'group participant export',
      'Skrip Nano tidak memiliki modul ekspor grup. Pengaturan grup dibaca dari basis data bot (lihat /nano/data).'
    )
  }

  async getState(sessionKey: string): Promise<EngineSessionState | null> {
    return this.getStateSync(sessionKey)
  }

  async listStates(): Promise<EngineSessionState[]> {
    return this.listStatesSync()
  }

  getStateSync(sessionKey: string): EngineSessionState | null {
    const runtime = this.runtimes.get(sessionKey)
    return runtime ? this.snapshot(runtime) : null
  }

  listStatesSync(): EngineSessionState[] {
    return [...this.runtimes.values()].map((runtime) => this.snapshot(runtime))
  }

  size(): number {
    return this.runtimes.size
  }

  /** Stop every child process on gateway shutdown. */
  shutdown() {
    if (this.journalTimer) {
      clearInterval(this.journalTimer)
      this.journalTimer = null
    }

    for (const runtime of this.runtimes.values()) {
      runtime.autoReconnect = false
      this.stopProcess(runtime)
    }
  }
}

// ─────────────────────────────────────────────────────────────── helpers ────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Size of a journal file, or 0 when it has not been created yet. */
function journalSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size
  } catch {
    return 0
  }
}

/** Map a journal `kind` onto the platform's message types. */
function normalizeMessageType(kind: unknown): MessageType {
  const value = String(kind ?? 'text').toLowerCase()
  return (MESSAGE_KINDS as readonly string[]).includes(value) ? (value as MessageType) : 'text'
}

/**
 * Does this bot have stored WhatsApp credentials?
 *
 * Nano keeps them in its own `sessions/auth.db`. This is deliberately an
 * existence-and-size probe rather than a read: the file is the bot's private
 * store, and whether the credentials are still *valid* is a question only
 * WhatsApp can answer when the handshake actually runs.
 */
function hasNanoCredentials(sessionsDir: string): boolean {
  try {
    const stat = fs.statSync(path.join(sessionsDir, 'auth.db'))
    return stat.isFile() && stat.size > 0
  } catch {
    return false
  }
}

/**
 * Classify one output line for the log viewer.
 *
 * Deliberately keyword-based: the script prints plain text (no log levels), so
 * this is a reading aid, and `stderr` is trusted over any keyword.
 */
function classifyLogLevel(text: string, stream: NanoLogLine['stream']): NanoLogLevel {
  if (stream === 'stderr') return 'error'

  const lower = text.toLowerCase()
  if (
    /(error|err_|failed|gagal|exception|unhandled|econn|etimedout|timed out|denied|invalid|tidak valid)/.test(
      lower
    )
  ) {
    return 'error'
  }
  if (/(warn|peringatan|deprecated|retry|reconnect|menunggu)/.test(lower)) return 'warn'
  if (
    /(berhasil terhubung|berhasil|connected|ready|sukses|success|online|aktif)/.test(lower)
  ) {
    return 'success'
  }
  return 'info'
}

// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g

function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, '')
}

/**
 * The script embeds the real QR payload as a URL-encoded `data` parameter of an
 * api.qrserver.com image URL. Decoding recovers the exact string WhatsApp
 * issued, which we then re-render ourselves.
 */
function extractQrPayload(qrImageUrl: string): string | null {
  try {
    const url = new URL(qrImageUrl)
    const data = url.searchParams.get('data')
    return data && data.length > 8 ? data : null
  } catch {
    return null
  }
}
