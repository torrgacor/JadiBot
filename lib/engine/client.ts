import { engineError, engineUnavailable } from '@/lib/errors'
import { assertPublicHttpUrl } from '@/lib/security/url-guard'
import type {
  NanoBotSettingOp,
  NanoBotSettingResult,
  NanoConfig,
  NanoConfigKey,
  NanoConfigUpdateResult,
  NanoInstallInfo,
  NanoLogBatch,
  NanoPluginCatalogue,
  NanoSessionData,
} from '@/lib/engine/nano'
import type {
  CreateSessionInput,
  EngineGroup,
  EngineSessionState,
  GatewayResponse,
  PairingCodeInput,
  SendMessageInput,
  SendMessageResult,
  WhatsAppEngine,
} from '@/lib/engine/types'

/**
 * Web-side engine client.
 *
 * Speaks HTTP to the standalone gateway process. Two reasons this is a network
 * hop rather than an in-process import:
 *
 *  1. Baileys pulls in protobuf codegen and native modules that fight Next's
 *     bundler; keeping it in its own process removes that whole class of
 *     problem and keeps the web build fast.
 *  2. A socket crash must not take the web app down with it. The gateway can
 *     restart independently and sessions recover from persisted credentials.
 *
 * If the gateway is stopped, every call fails with `engineUnavailable`, which
 * the UI renders as "Unable to connect to gateway" — a real, honest error
 * rather than an empty dashboard.
 */

const DEFAULT_TIMEOUT_MS = 30_000
/** Media uploads and pairing handshakes need more room than a CRUD call. */
const LONG_TIMEOUT_MS = 120_000

function gatewayUrl(path: string): string {
  const host = process.env.GATEWAY_HOST ?? '127.0.0.1'
  const port = process.env.GATEWAY_PORT ?? '4001'
  return `http://${host}:${port}${path}`
}

async function request<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(gatewayUrl(path), {
      ...rest,
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-gateway-token': process.env.GATEWAY_TOKEN ?? '',
        ...(rest.headers ?? {}),
      },
      // Never cache engine state — it is inherently volatile.
      cache: 'no-store',
    })
  } catch (error) {
    clearTimeout(timer)
    const isAbort = error instanceof Error && error.name === 'AbortError'
    throw engineUnavailable(
      isAbort
        ? 'Layanan terlalu lama merespons. Mungkin sedang menyambungkan ulang sebuah sesi.'
        : 'Tidak dapat terhubung ke layanan. Coba lagi sebentar lagi.'
    )
  }
  clearTimeout(timer)

  let payload: GatewayResponse<T> | null = null
  try {
    payload = (await response.json()) as GatewayResponse<T>
  } catch {
    // Non-JSON body — almost certainly a crash page from the gateway.
    throw engineError(
      `Layanan mengirim respons yang tidak bisa dibaca (HTTP ${response.status}).`
    )
  }

  if (!response.ok || !payload?.ok) {
    const code = payload?.error?.code ?? 'ENGINE_ERROR'
    const message =
      payload?.error?.message ?? `Permintaan ke layanan gagal (HTTP ${response.status}).`

    // Surface capability gaps distinctly so the UI can explain what is missing
    // instead of showing a generic failure.
    if (code === 'CAPABILITY_UNAVAILABLE') {
      throw engineError(message, { capability: true })
    }
    throw engineError(message)
  }

  return payload.data as T
}

function json(body: unknown) {
  return JSON.stringify(body)
}

export const engineClient: WhatsAppEngine = {
  createSession(input: CreateSessionInput) {
    return request<EngineSessionState>('/sessions', {
      method: 'POST',
      body: json(input),
    })
  },

  connect(sessionKey: string) {
    return request<EngineSessionState>(`/sessions/${sessionKey}/connect`, {
      method: 'POST',
    })
  },

  disconnect(sessionKey: string) {
    return request<EngineSessionState>(`/sessions/${sessionKey}/disconnect`, {
      method: 'POST',
    })
  },

  async logout(sessionKey: string) {
    await request<{ done: true }>(`/sessions/${sessionKey}/logout`, {
      method: 'POST',
      timeoutMs: LONG_TIMEOUT_MS,
    })
  },

  restart(sessionKey: string) {
    return request<EngineSessionState>(`/sessions/${sessionKey}/restart`, {
      method: 'POST',
    })
  },

  async removeSession(sessionKey: string) {
    await request<{ done: true }>(`/sessions/${sessionKey}`, { method: 'DELETE' })
  },

  refreshQr(sessionKey: string) {
    return request<{ qr: string; expiresAt: string }>(
      `/sessions/${sessionKey}/qr`,
      { method: 'POST', timeoutMs: LONG_TIMEOUT_MS }
    )
  },

  requestPairingCode(input: PairingCodeInput) {
    return request<{ pairingCode: string; expiresAt: string }>(
      `/sessions/${input.sessionKey}/pairing-code`,
      {
        method: 'POST',
        body: json({ phoneNumber: input.phoneNumber }),
        timeoutMs: LONG_TIMEOUT_MS,
      }
    )
  },

  getState(sessionKey: string) {
    return request<EngineSessionState | null>(`/sessions/${sessionKey}`, {
      method: 'GET',
    })
  },

  listStates() {
    return request<EngineSessionState[]>('/sessions', { method: 'GET' })
  },

  sendMessage(input: SendMessageInput) {
    /*
      One choke point for outbound sends, so one place validates the media URL.
      The bot performs the actual fetch from inside this host, which makes a
      user-supplied URL an SSRF primitive unless it is checked here.
    */
    const body = input.mediaUrl
      ? { ...input, mediaUrl: assertPublicHttpUrl(input.mediaUrl) }
      : input

    // Media sends can take a while to encrypt and upload.
    const timeoutMs = input.mediaBase64 || input.mediaUrl ? LONG_TIMEOUT_MS : DEFAULT_TIMEOUT_MS
    return request<SendMessageResult>('/messages', {
      method: 'POST',
      body: json(body),
      timeoutMs,
    })
  },

  getQueueDepth(sessionKey: string) {
    return request<number>(`/sessions/${sessionKey}/queue`, { method: 'GET' })
  },

  listGroups(sessionKey: string) {
    // Group sync can be slow on accounts with many groups.
    return request<EngineGroup[]>(`/sessions/${sessionKey}/groups`, {
      method: 'GET',
      timeoutMs: LONG_TIMEOUT_MS,
    })
  },

  getLogs(sessionKey: string, sinceSeq = 0) {
    return request<NanoLogBatch>(
      `/sessions/${encodeURIComponent(sessionKey)}/logs?since=${sinceSeq}`,
      { method: 'GET' }
    )
  },
}

/**
 * Nano introspection.
 *
 * Read-only views of the bot the platform manages: its configuration, its
 * plugin catalogue, and each session's own bot database. Routed through the
 * gateway so the knowledge of where the installation lives stays in one process
 * and `node:sqlite` never reaches the Next.js bundle.
 */
export const nanoClient = {
  info() {
    return request<NanoInstallInfo>('/nano/info', { method: 'GET' })
  },

  config(refresh = false) {
    return request<NanoConfig>(`/nano/config${refresh ? '?refresh=1' : ''}`, {
      method: 'GET',
    })
  },

  plugins(refresh = false) {
    return request<NanoPluginCatalogue>(`/nano/plugins${refresh ? '?refresh=1' : ''}`, {
      method: 'GET',
      // Parsing 199 plugin files is fast, but give it room on a cold start.
      timeoutMs: LONG_TIMEOUT_MS,
    })
  },

  sessionData(sessionKey: string) {
    return request<NanoSessionData>(`/nano/sessions/${encodeURIComponent(sessionKey)}`, {
      method: 'GET',
    })
  },

  /** Apply one setting change to the bot's own database. */
  applyBotSetting(sessionKey: string, op: NanoBotSettingOp) {
    return request<NanoBotSettingResult>(
      `/nano/sessions/${encodeURIComponent(sessionKey)}/settings`,
      { method: 'POST', body: json(op) }
    )
  },

  /**
   * Rewrite whitelisted keys in the script's `config/settings.js`.
   *
   * Routed through the gateway because the file lives next to the engine and the
   * write has to be verified by importing the result in that same directory.
   */
  updateConfig(patch: Partial<Record<NanoConfigKey, unknown>>) {
    return request<NanoConfigUpdateResult>('/nano/config', {
      method: 'POST',
      body: json(patch),
    })
  },
}

/** Probe used by the system-status panel. */
export async function pingGateway(): Promise<{
  online: boolean
  driver?: string
  uptimeSeconds?: number
  activeSessions?: number
  latencyMs?: number
}> {
  const started = Date.now()
  try {
    const health = await request<{
      driver: string
      uptimeSeconds: number
      activeSessions: number
    }>('/health', { method: 'GET', timeoutMs: 4000 })
    return { online: true, ...health, latencyMs: Date.now() - started }
  } catch {
    return { online: false }
  }
}
