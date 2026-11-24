import type { User, WhatsAppSession } from '@/lib/db'
import { db } from '@/lib/db'
import { engineClient, nanoClient } from '@/lib/engine/client'
import { getNanoOverview, type NanoOverview } from '@/lib/services/nano-service'
import type { EngineSessionState } from '@/lib/engine/types'
import { logActivity } from '@/lib/auth/audit'
import { forbidden, notFound } from '@/lib/errors'
import { isAdmin } from '@/lib/auth/guards'
import { getBotAccess } from '@/lib/services/bot-access'
import type {
  NanoBotSettingOp,
  NanoBotSettingResult,
  NanoConfigKey,
  NanoConfigUpdateResult,
  NanoLogBatch,
  NanoSessionData,
} from '@/lib/engine/nano'

/**
 * Bot service.
 *
 * The product is one Nano bot per account, so "the user's bot" is a single row.
 * This module is the one place that resolves it and gathers everything the bot
 * pages need, which keeps the pages themselves free of engine plumbing.
 */

export async function getPrimarySession(userId: string): Promise<WhatsAppSession | null> {
  return db.whatsAppSession.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
}

export interface BotPageData {
  session: WhatsAppSession | null
  /** Live view from the engine; null when the gateway is not holding this session. */
  live: EngineSessionState | null
  /** True when the gateway process could not be reached at all. */
  engineOffline: boolean
  /**
   * True when the engine actually holds this session.
   *
   * After a gateway restart its in-memory runtimes are empty until something
   * re-registers them, so the stored row can say CONNECTED while the engine has
   * no process at all. The UI uses this flag to offer "start" rather than
   * pretending the bot is up.
   */
  engineLoaded: boolean
  nano: NanoOverview
  /** The bot's own database contents; null until the bot has run once. */
  botData: NanoSessionData | null
}

/**
 * Read a session's live engine state, re-registering it when the gateway has
 * forgotten about it.
 *
 * `engineClient.createSession` is idempotent — the gateway returns the existing
 * snapshot when the key is already loaded — so calling it here is a safe,
 * self-healing reconcile rather than a second session. It prepares state only;
 * it never starts the bot process (both drivers only allocate a runtime; only
 * `connect()` spawns or opens a socket), which is why this read is not itself a
 * way around the paywall.
 *
 * `allowed` still matters. For an account with no active plan the right thing is
 * to leave the engine alone entirely: a locked account must not be able to make
 * the gateway hold a runtime for it by simply opening a page, and the panel that
 * renders is the locked notice, not this state. So the reconcile is skipped and
 * the answer is "nothing loaded" — which is true, because nothing was.
 */
async function loadLiveState(
  session: WhatsAppSession,
  allowed: boolean
): Promise<{
  state: EngineSessionState | null
  offline: boolean
  loaded: boolean
}> {
  if (!allowed) return { state: null, offline: false, loaded: false }

  try {
    const existing = await engineClient.getState(session.id)
    if (existing) return { state: existing, offline: false, loaded: true }

    await engineClient.createSession({
      key: session.id,
      driver: session.driver as 'local-baileys' | 'nano-process',
      authStateDir: session.authStateDir,
      name: session.name,
      autoReconnect: session.autoReconnect,
      alwaysOnline: session.alwaysOnline,
      readReceipts: session.readReceipts,
      typingSimulation: session.typingSimulation,
      defaultDelayMs: session.defaultDelayMs,
    })

    const recreated = await engineClient.getState(session.id)
    return { state: recreated, offline: false, loaded: recreated !== null }
  } catch {
    // The gateway itself is unreachable — an honest "offline", not "no bot".
    return { state: null, offline: true, loaded: false }
  }
}

/**
 * Resolve the session a user is allowed to act on.
 *
 * Defaults to their primary (oldest) bot — the product is one bot per account —
 * and falls back to an explicit id only after checking ownership. Reported as
 * "not found" so the API never confirms that another account's session exists.
 */
export async function requireBotSession(
  userId: string,
  sessionId?: string
): Promise<WhatsAppSession> {
  if (sessionId) {
    const session = await db.whatsAppSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== userId) throw notFound('Sesi tidak ditemukan.')
    return session
  }

  const session = await getPrimarySession(userId)
  if (!session) {
    throw notFound(
      'Belum ada bot untuk akun ini. Buat bot dan hubungkan WhatsApp terlebih dahulu.'
    )
  }
  return session
}

/** Settings in the shared `config/settings.js` affect every bot, so only admins may write. */
export function assertCanEditEngineConfig(user: Pick<User, 'role'>) {
  if (!isAdmin(user)) {
    throw forbidden(
      'Konfigurasi ini dipakai bersama semua bot, jadi hanya admin yang bisa mengubahnya.'
    )
  }
}

/**
 * Apply a runtime setting to the user's own bot database and record it.
 *
 * The write happens inside the bot's own database (see the gateway), so the bot
 * enforces the change on its next message instead of reading a parallel copy.
 */
export async function applyBotSettingForUser(
  userId: string,
  op: NanoBotSettingOp,
  sessionId?: string
): Promise<NanoBotSettingResult> {
  const session = await requireBotSession(userId, sessionId)
  const result = await nanoClient.applyBotSetting(session.id, op)

  await logActivity({
    userId,
    sessionId: session.id,
    event: `bot.setting.${op.op}`,
    title: 'Pengaturan bot diubah',
    detail: result.message,
    level: 'info',
    metadata: op,
  })

  return result
}

/**
 * Rewrite whitelisted keys in the script's config file.
 *
 * Admin-only because the file is shared by every bot in the installation. The
 * gateway verifies the candidate file parses before it replaces the original.
 */
export async function updateEngineConfigForUser(
  user: Pick<User, 'id' | 'role'>,
  patch: Partial<Record<NanoConfigKey, unknown>>
): Promise<NanoConfigUpdateResult> {
  assertCanEditEngineConfig(user)
  const result = await nanoClient.updateConfig(patch)

  await logActivity({
    userId: user.id,
    event: 'bot.config.update',
    title: 'Konfigurasi bot diperbarui',
    detail: `Diubah: ${result.updated.join(', ')}`,
    // The backup file path is deliberately not recorded here: it is an
    // internal location and it would surface verbatim in the activity log.
    level: 'warning',
    metadata: { keys: result.updated },
  })

  return result
}

/**
 * Tail of the running bot's own output.
 *
 * Only meaningful for sessions the gateway currently holds in memory: an empty
 * log buffer means "the bot is not running", which the UI states plainly rather
 * than showing a fabricated line.
 */
export async function getBotLogsForUser(
  userId: string,
  options: { since?: number; sessionId?: string } = {}
): Promise<NanoLogBatch & { sessionId: string; running: boolean }> {
  const session = await requireBotSession(userId, options.sessionId)
  const getLogs = engineClient.getLogs
  if (!getLogs) {
    throw new Error('Bot saat ini tidak menyediakan log.')
  }

  const batch = await getLogs(session.id, options.since ?? 0)
  return { ...batch, sessionId: session.id, running: batch.buffered > 0 }
}

/**
 * Everything the bot overview renders.
 *
 * Failures are captured per-source rather than thrown: the page should still
 * render the session and the command catalogue when, say, the bot database has
 * not been created yet because the bot has never been linked.
 */
export async function getBotPageData(userId: string): Promise<BotPageData> {
  const session = await getPrimarySession(userId)

  /*
    Two steps, not one `Promise.all`.

    The access decision comes first because the engine reconcile depends on it:
    for a locked account there is nothing to ask the gateway. The catalogue and
    the bot's own database are read alongside the decision, since neither is
    gated — an account whose plan just ended should still be able to read its own
    data instead of meeting a wall.
  */
  const [access, nano, botDataResult] = await Promise.all([
    // The same decision the API gate and the watchdog use — no second copy of
    // the rules, and no engine work for an account that may not run a bot.
    getBotAccess(userId),
    getNanoOverview(),
    session
      ? nanoClient.sessionData(session.id).then(
          (data) => data,
          () => null
        )
      : Promise.resolve(null),
  ])

  const liveResult = session
    ? await loadLiveState(session, access.allowed)
    : { state: null, offline: false, loaded: false }

  return {
    session,
    live: liveResult.state,
    engineOffline: liveResult.offline,
    engineLoaded: liveResult.loaded,
    nano,
    botData: botDataResult,
  }
}
