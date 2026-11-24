import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { safeCompare } from '../lib/security/crypto'
import { gatewayConfig, logger } from './config'
import { SessionManager } from './session-manager'
import { drainEvents, queueDepth } from './events'
import {
  listNanoPlugins,
  nanoInstallInfo,
  readNanoConfig,
  readNanoSessionData,
} from './nano/introspect'
import { applyBotSetting } from './nano/mutate'
import { updateNanoConfigFile } from './nano/settings-file'
import type { NanoBotSettingOp, NanoConfigKey } from '../lib/engine/nano'
import {
  EngineCapabilityError,
  EngineInputError,
  EngineTimeoutError,
} from '../lib/engine/types'
import { NanoSettingsError } from './nano/errors'
import type { GatewayResponse } from '../lib/engine/types'

/**
 * NANO GATEWAY — WhatsApp engine service.
 *
 * Standalone process that owns every WhatsApp connection. The Next.js app talks
 * to it over localhost HTTP; nothing else in the platform touches Baileys.
 *
 *   npm run gateway        # foreground
 *   npm run dev            # web + gateway together
 *
 * Auth is a shared bearer token (GATEWAY_TOKEN) and the server binds to
 * 127.0.0.1 by default, so it is not reachable from outside the host.
 */

const startedAt = Date.now()
const manager = new SessionManager()

// ─────────────────────────────────────────────────────────────── helpers ─────

function send<T>(res: ServerResponse, status: number, body: GatewayResponse<T>) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  })
  res.end(payload)
}

function succeed<T>(res: ServerResponse, data: T, status = 200) {
  send(res, status, { ok: true, data })
}

function fail(res: ServerResponse, status: number, code: string, message: string) {
  send(res, status, { ok: false, error: { code, message } })
}

/**
 * Map internal failures onto the gateway's error codes.
 *
 * `EngineCapabilityError` becomes 501 Not Implemented with a distinct code so
 * the dashboard can explain that the configured engine genuinely cannot do the
 * thing, instead of showing a generic error.
 */
function handleError(res: ServerResponse, error: unknown) {
  if (error instanceof EngineCapabilityError) {
    logger.warn({ capability: error.capability }, 'capability unavailable')
    return fail(res, 501, 'CAPABILITY_UNAVAILABLE', error.message)
  }

  // A rejected setting is the caller's problem, and its message is already
  // written for the dashboard to show verbatim.
  if (error instanceof NanoSettingsError) {
    logger.warn({ message: error.message }, 'rejected nano setting')
    return fail(res, 400, 'INVALID_SETTING', error.message)
  }

  // Bad input: retrying is pointless until it changes, so 400 with the reason.
  if (error instanceof EngineInputError) {
    logger.warn({ code: error.code }, 'rejected input')
    return fail(res, 400, error.code, error.message)
  }

  // A handshake or send that never completed. 504 rather than 502 because the
  // request itself was fine — it just did not finish in time, and trying again
  // is a reasonable next step.
  if (error instanceof EngineTimeoutError) {
    logger.warn({ code: error.code }, 'engine operation timed out')
    return fail(res, 504, error.code, error.message)
  }

  const message = error instanceof Error ? error.message : 'Kesalahan engine tidak diketahui.'

  if (message.includes('terputus') || message.includes('tidak berjalan')) {
    return fail(res, 409, 'SESSION_NOT_CONNECTED', message)
  }
  if (message.includes('tidak dimuat di driver ini')) {
    return fail(res, 404, 'SESSION_NOT_FOUND', message)
  }

  logger.error({ err: error }, 'gateway request failed')
  return fail(res, 502, 'ENGINE_ERROR', message)
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  let size = 0
  // Cap the body so a runaway client cannot exhaust gateway memory.
  const MAX_BYTES = 32 * 1024 * 1024

  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > MAX_BYTES) throw new Error('Isi permintaan terlalu besar (batas 32MB).')
    chunks.push(chunk as Buffer)
  }

  if (chunks.length === 0) return {} as T
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T
}

/**
 * Shared-secret check for every non-health route.
 *
 * Constant-time comparison, because `===` on a secret leaks its prefix through
 * timing. The gateway only listens on loopback and the token is long, so this is
 * belt-and-braces rather than a live hole — but a secret comparison is exactly
 * the place not to be casual.
 */
function authorized(req: IncomingMessage): boolean {
  const token = req.headers['x-gateway-token']
  if (typeof token !== 'string' || !gatewayConfig.token) return false
  return safeCompare(token, gatewayConfig.token)
}

// ──────────────────────────────────────────────────────────────── routing ───

interface RouteMatch {
  handler: () => Promise<void> | void
}

async function route(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  url: URL
): Promise<RouteMatch | null> {
  const method = req.method ?? 'GET'

  /*
    ── health ──────────────────────────────────────────────────────────────
    Unauthenticated so a probe does not need the secret. It is therefore kept to
    what a probe needs: counts and status, never a filesystem path or a
    configuration value. The engine directory is dropped here rather than at the
    edge, so no other route can accidentally reintroduce it.
  */
  if (pathname === '/health' && method === 'GET') {
    return {
      handler: () => {
        const { nanoEngineDir: _nanoEngineDir, ...health } = manager.health()
        succeed(res, {
          status: 'ok',
          uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
          pendingEvents: queueDepth(),
          ...health,
        })
      },
    }
  }

  // Every other route requires the shared token.
  if (!authorized(req)) {
    return {
      handler: () =>        fail(res, 401, 'UNAUTHORIZED', 'Token gateway tidak valid.'),
    }
  }

  // ── collection: /sessions ────────────────────────────────────────────────
  if (pathname === '/sessions' && method === 'POST') {
    return {
      handler: async () => {
        const body = await readJson<Parameters<SessionManager['createSession']>[0]>(req)
        if (!body?.key) throw new Error('Kunci sesi wajib diisi.')
        succeed(res, await manager.createSession(body), 201)
      },
    }
  }

  if (pathname === '/sessions' && method === 'GET') {
    return { handler: () => succeed(res, manager.listStates()) }
  }

  // ── Nano introspection ───────────────────────────────────────────────────
  //
  // The product's feature surface *is* Nano's feature surface, so the dashboard
  // reads the bot's real artifacts through these endpoints. Everything is
  // read-only with respect to the installation.
  if (pathname === '/nano/info' && method === 'GET') {
    return { handler: () => succeed(res, nanoInstallInfo()) }
  }

  if (pathname === '/nano/config' && method === 'GET') {
    return {
      handler: async () => {
        const force = url.searchParams.get('refresh') === '1'
        succeed(res, await readNanoConfig(force))
      },
    }
  }

  /**
   * Write whitelisted identity settings into the script's own config file.
   *
   * The candidate file is parsed back before it replaces the original, and the
   * previous version is kept in `.gateway-patch-backup/`, so this can never
   * leave the bot with a config it cannot load.
   */
  if (pathname === '/nano/config' && method === 'POST') {
    return {
      handler: async () => {
        const body = await readJson<Partial<Record<NanoConfigKey, unknown>>>(req)
        succeed(res, await updateNanoConfigFile(body ?? {}))
      },
    }
  }

  if (pathname === '/nano/plugins' && method === 'GET') {
    return {
      handler: async () => {
        const force = url.searchParams.get('refresh') === '1'
        succeed(res, await listNanoPlugins(force))
      },
    }
  }

  const nanoSessionMatch = pathname.match(/^\/nano\/sessions\/([^/]+)$/)
  if (nanoSessionMatch && method === 'GET') {
    const key = decodeURIComponent(nanoSessionMatch[1])
    return { handler: () => succeed(res, readNanoSessionData(key)) }
  }

  // Runtime bot settings — written into the bot's own database, using the same
  // tables the script's own commands use.
  const nanoSettingsMatch = pathname.match(/^\/nano\/sessions\/([^/]+)\/settings$/)
  if (nanoSettingsMatch && method === 'POST') {
    const key = decodeURIComponent(nanoSettingsMatch[1])
    return {
      handler: async () => {
        const body = await readJson<NanoBotSettingOp>(req)
        if (!body?.op) throw new Error('Operasi pengaturan wajib diisi.')
        succeed(res, applyBotSetting(key, body))
      },
    }
  }

  // ── messages ─────────────────────────────────────────────────────────────
  if (pathname === '/messages' && method === 'POST') {
    return {
      handler: async () => {
        const body = await readJson<Parameters<SessionManager['sendMessage']>[0]>(req)
        succeed(res, await manager.sendMessage(body))
      },
    }
  }

  // ── item routes: /sessions/:key/... ──────────────────────────────────────
  const match = pathname.match(/^\/sessions\/([^/]+)(?:\/(.+))?$/)
  if (!match) return null

  const key = decodeURIComponent(match[1])
  const action = match[2]

  const actions: Record<string, (() => Promise<void> | void) | undefined> = {
    'POST:connect': async () => succeed(res, await manager.connect(key)),
    'POST:disconnect': async () => succeed(res, await manager.disconnect(key)),
    'POST:logout': async () => {
      await manager.logout(key)
      succeed(res, { done: true })
    },
    'POST:restart': async () => succeed(res, await manager.restart(key)),
    'POST:qr': async () => succeed(res, await manager.refreshQr(key)),
    'POST:pairing-code': async () => {
      const body = await readJson<{ phoneNumber: string }>(req)
      succeed(res, await manager.requestPairingCode({ sessionKey: key, phoneNumber: body.phoneNumber }))
    },
    'GET:queue': async () => succeed(res, await manager.getQueueDepth(key)),
    'GET:groups': async () => succeed(res, await manager.listGroups(key)),
    'GET:logs': async () => {
      const since = Number(url.searchParams.get('since') ?? '0')
      succeed(res, await manager.getLogs(key, Number.isFinite(since) ? since : 0))
    },
    'DELETE:': async () => {
      await manager.removeSession(key)
      succeed(res, { done: true })
    },
    'GET:': () => succeed(res, manager.getState(key)),
  }

  const handler = actions[`${method}:${action ?? ''}`]
  if (handler) return { handler }
  return null
}

// ──────────────────────────────────────────────────────────────── server ────

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  void (async () => {
    try {
      const matched = await route(req, res, url.pathname, url)
      if (!matched) {
        fail(res, 404, 'NOT_FOUND', `No gateway route for ${req.method} ${url.pathname}.`)
        return
      }
      await matched.handler()
    } catch (error) {
      handleError(res, error)
    }
  })()
})

server.listen(gatewayConfig.port, gatewayConfig.host, () => {
  logger.info(
    {
      url: `http://${gatewayConfig.host}:${gatewayConfig.port}`,
      driver: gatewayConfig.driver,
      storage: gatewayConfig.storageDir,
      nanoEngineDir: gatewayConfig.nanoEngineDir ?? '(not configured)',
    },
    'NANO GATEWAY engine listening'
  )
})

// ──────────────────────────────────────────────────────────── shutdown ──────

let shuttingDown = false

async function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'shutting down gateway')

  server.close()
  manager.shutdown()

  // Give queued events a chance to reach the web app.
  await drainEvents(5_000)

  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'unhandled rejection in gateway')
})

process.on('uncaughtException', (error) => {
  // A single bad session must not take down every other connection, but an
  // unknown fault is serious enough to log loudly.
  logger.error({ err: error }, 'uncaught exception in gateway')
})
