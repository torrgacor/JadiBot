import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { pathToFileURL } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { assertSessionKey, gatewayConfig, logger } from '../config'
import type {
  NanoAccessMode,
  NanoConfig,
  NanoGroupSettings,
  NanoInstallInfo,
  NanoPlugin,
  NanoPluginCatalogue,
  NanoSessionData,
} from '../../lib/engine/nano'

export type {
  NanoAccessMode,
  NanoAfkEntry,
  NanoConfig,
  NanoConfigKey,
  NanoConfigUpdateResult,
  NanoBotSettingOp,
  NanoBotSettingResult,
  NanoGroupSettings,
  NanoInstallInfo,
  NanoLogBatch,
  NanoLogLevel,
  NanoLogLine,
  NanoPlugin,
  NanoPluginCatalogue,
  NanoReminder,
  NanoSessionData,
  NanoUser,
  NanoUserSetting,
} from '../../lib/engine/nano'

/**
 * Nano introspection.
 *
 * The platform's feature surface *is* Nano's feature surface, so the dashboard
 * must read Nano's real artifacts rather than maintain a parallel copy:
 *
 *   • `config/settings.js`        → bot identity, owner numbers, prefix, mode
 *   • `plugins/**\/*.js`          → every command, grouped the way the bot groups it
 *   • `data/database/nano.sqlite` → users, prefixes, group settings, schedules
 *
 * Everything here is read-only with respect to the script. Nothing is invented:
 * if a file is missing or a database has not been created yet (the bot has
 * never run for that session), the reader reports that state honestly.
 */

// ─────────────────────────────────────────────────────────────── paths ──────

function engineDir(): string {
  const dir = gatewayConfig.nanoEngineDir
  if (!dir) {
    throw new Error(
      'NANO_ENGINE_DIR belum dikonfigurasi. Arahkan ke folder skrip Nano (folder yang berisi index.js).'
    )
  }
  if (!fs.existsSync(path.join(dir, 'index.js'))) {
    throw new Error(`NANO_ENGINE_DIR (${dir}) does not contain index.js.`)
  }
  return dir
}

/**
 * Per-session runtime state. Nano is patched (see .gateway-patch-backup) to
 * honour these env vars, so code stays shared while credentials and bot data
 * stay isolated per session.
 */
export function nanoStateDirs(sessionKey: string) {
  // The key is a directory name; reject anything that could climb out of the
  // state root before it is joined into a path (see `assertSessionKey`).
  const root = path.resolve(
    gatewayConfig.storageDir,
    '..',
    'nano-state',
    assertSessionKey(sessionKey)
  )
  return {
    root,
    sessionsDir: path.join(root, 'sessions'),
    dataDir: path.join(root, 'data', 'database'),
    bridgeDir: path.join(root, 'bridge'),
  }
}

/** Absolute path of the bot database that belongs to one session. */
export function nanoDbPath(sessionKey: string): string {
  return path.join(nanoStateDirs(sessionKey).dataDir, 'nano.sqlite')
}

/** Open a session's Nano database read-only, or return null if it has no data yet. */
function openNanoDb(sessionKey: string): DatabaseSync | null {
  const dbPath = nanoDbPath(sessionKey)
  if (!fs.existsSync(dbPath)) return null
  try {
    // Read-only so the gateway can never corrupt the running bot's database.
    return new DatabaseSync(dbPath, { readOnly: true })
  } catch (error) {
    logger.warn({ err: error, sessionKey }, 'could not open nano database')
    return null
  }
}

function rows<T>(db: DatabaseSync, sql: string, params: unknown[] = []): T[] {
  try {
    return db.prepare(sql).all(...(params as never[])) as T[]
  } catch {
    // A missing table just means the bot has never used that feature.
    return []
  }
}

// ─────────────────────────────────────────────────────────────── config ─────

let configCache: { at: number; value: NanoConfig } | null = null

/**
 * Evaluate `config/settings.js` to read the live configuration.
 *
 * This imports the real module rather than regex-parsing it, so computed values
 * (functions, ternaries) are reported exactly as the bot sees them. Cached
 * briefly because the module has side-effect-free top-level code only.
 */
export async function readNanoConfig(force = false): Promise<NanoConfig> {
  if (!force && configCache && Date.now() - configCache.at < 10_000) {
    return configCache.value
  }

  const settingsPath = path.join(engineDir(), 'config', 'settings.js')

  try {
    const url = `${pathToFileURL(settingsPath).href}?t=${Date.now()}`
    const mod = await import(url)
    const settings = (mod.settings ?? mod.default ?? {}) as Record<string, unknown>

    const value: NanoConfig = {
      botName: (settings.botName as string) ?? null,
      botAlias: (settings.botAlias as string) ?? null,
      botVersion: (settings.botVersion as string) ?? null,
      botMode: (settings.botMode as string) ?? null,
      ownerName: (settings.ownerName as string) ?? null,
      ownerNumbers: Array.isArray(settings.ownerNumbers)
        ? (settings.ownerNumbers as string[])
        : [],
      defaultPrefix: (settings.defaultPrefix as string) ?? null,
      timezone: (settings.timezone as string) ?? null,
      footerText: (settings.footerText as string) ?? null,
      pairingNumber: (settings.pairingNumber as string) ?? null,
      links: (settings.links as Record<string, string>) ?? null,
    }

    configCache = { at: Date.now(), value }
    return value
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui'
    return {
      botName: null,
      botAlias: null,
      botVersion: null,
      botMode: null,
      ownerName: null,
      ownerNumbers: [],
      defaultPrefix: null,
      timezone: null,
      footerText: null,
      pairingNumber: null,
      links: null,
      error: `Could not read config/settings.js: ${message}`,
    }
  }
}

// ────────────────────────────────────────────────────────────── plugins ─────

/**
 * Extract plugin metadata by reading the source.
 *
 * Nano's plugins follow a strict convention (`handler.command`, `handler.help`,
 * `handler.tags`, `handler.category`, `handler.description` plus behaviour
 * flags). Extracting statically avoids importing 199 modules into the gateway
 * process — which would execute their top-level code and is exactly what the
 * bot's own loader is careful about.
 */
function parsePluginFile(
  absolutePath: string,
  relativePath: string
): NanoPlugin {
  let source = ''
  try {
    source = fs.readFileSync(absolutePath, 'utf8')
  } catch {
    source = ''
  }

  /*
    `handler.category` menang atas nama folder, persis seperti pemuat bot
    (`categoryFromPath` di core/pemuat-plugin.js hanya dipakai sebagai cadangan).
  */
  const literalCategory = source.match(/handler\.category\s*=\s*['"`]([^'"`]+)['"`]/)
  const category =
    literalCategory?.[1]?.trim().toLowerCase() ||
    (relativePath.includes(path.sep) ? relativePath.split(path.sep)[0].toLowerCase() : 'umum')

  const stringArray = (field: string): string[] => {
    // handler.help = ['a', 'b']  |  handler.help = 'a'
    const arrayMatch = source.match(
      new RegExp(`handler\\.${field}\\s*=\\s*\\[([\\s\\S]*?)\\]`)
    )
    if (arrayMatch) {
      return [...arrayMatch[1].matchAll(/['"`]([^'"`]*)['"`]/g)]
        .map((m) => m[1].trim())
        .filter(Boolean)
    }

    const singleMatch = source.match(
      new RegExp(`handler\\.${field}\\s*=\\s*['"\`]([^'"\`]*)['"\`]`)
    )
    return singleMatch ? [singleMatch[1].trim()] : []
  }

  const stringField = (field: string): string | null => {
    const match = source.match(
      new RegExp(`handler\\.${field}\\s*=\\s*['"\`]([\\s\\S]*?)['"\`]\\s*$`, 'm')
    )
    return match ? match[1].trim() : null
  }

  const boolField = (field: string): boolean =>
    new RegExp(`handler\\.${field}\\s*=\\s*true`).test(source)

  // Commands may be a regex literal (/^(a|b)$/i), a string, or an array.
  const commands: string[] = []
  const regexMatch = source.match(/handler\.command\s*=\s*\/([\s\S]*?)\/[a-z]*\s*$|\/m/)
  const regexAlt = source.match(/handler\.command\s*=\s*\/([\s\S]*?)\/[gimsuy]*\s*$/m)
  const pattern = regexAlt?.[1] ?? regexMatch?.[1]

  if (pattern) {
    const group = pattern.match(/\(\?:\s*([^)]+?)\s*\)/) ?? [null, pattern]
    if (group[1]) {
      for (const part of group[1].split('|')) {
        const cleaned = part.replace(/[\^$\\]/g, '').trim()
        if (cleaned && /^[\w.-]+$/.test(cleaned)) commands.push(cleaned)
      }
    }
  }

  if (commands.length === 0) {
    const stringCommands = stringArray('command')
    for (const value of stringCommands) {
      commands.push(value.replace(/^[.!/]/, ''))
    }
  }

  const help = stringArray('help')
  const tags = stringArray('tags')

  const relatif = relativePath.split(path.sep).join('/')

  return {
    id: relatif,
    file: relatif,
    name: path.basename(relativePath, '.js'),
    category,
    commands,
    /* A text scan cannot tell a menu entry from an alias; the loader does. */
    aliases: [],
    help,
    tags,
    description: stringField('description'),
    /*
     * `unlimited` = plugin menolak limit harian. The loader reads this from the
     * live status (`!status.limit`); statically the only thing we can honestly
     * read is the explicit flag — `handler.limit = false` opts out, anything
     * else (including no flag at all) is treated as using the limit.
     *
     * This used to be `boolField('limit') === false ? false : !boolField('limit')`,
     * whose two branches both yield `false`: `unlimited` was a constant false
     * for every plugin, so the fallback catalogue told the panel every command
     * was metered and the `?limit=free` filter matched nothing.
     */
    unlimited: /handler\.limit\s*=\s*false/.test(source),
    groupOnly: boolField('groupOnly'),
    /* Premium follows the same flag names core/status-command.js reads. */
    premium: boolField('premium') || boolField('premiumOnly') || boolField('requiresPremium'),
    ownerOnly: boolField('ownerOnly') || boolField('isOwner'),
    privateOnly: boolField('privateOnly') || boolField('onlyPc'),
    adminOnly: boolField('adminOnly') || boolField('isAdmin'),
    // A plugin the loader would skip: it must export a handler with command or help.
    valid: /export\s+default\s+handler/.test(source) && (commands.length > 0 || help.length > 0),
  }
}

const execFileAsync = promisify(execFile)

/** Marker the engine script wraps its JSON payload in, so plugin chatter on
 *  stdout can never be mistaken for the catalogue. */
const KATALOG_MARKER = '===KATALOG==='

/**
 * Read the catalogue through the bot's own plugin loader.
 *
 * Static parsing can only see what is written literally in a file. Plugins that
 * are generated — the API-category ones build their command list, category and
 * limit flag at runtime — look like empty plugins to a text reader, so the panel
 * would show things the bot's own menu does not (and miss what it does). That is
 * why the panel must not guess here.
 *
 * The engine ships `scripts/katalog-plugin.mjs` for exactly this: it loads every
 * plugin the way the bot does and prints the result as one JSON line. We run it
 * as a throwaway process — it takes about half a second, and anything a plugin
 * does while being imported dies with it instead of touching the supervisor.
 */
async function scanViaLoader(dir: string): Promise<NanoPluginCatalogue | null> {
  const script = path.join(dir, 'scripts', 'katalog-plugin.mjs')
  if (!fs.existsSync(script)) return null

  try {
    const { stdout } = await execFileAsync(process.execPath, [script], {
      cwd: dir,
      env: { ...process.env, NANO_LOG: process.env.NANO_LOG ?? 'silent' },
      timeout: 60_000,
      maxBuffer: 32 * 1024 * 1024,
    })

    const line = stdout
      .split('\n')
      .filter((row) => row.startsWith(KATALOG_MARKER))
      .pop()
    if (!line) return null

    const payload = JSON.parse(line.slice(KATALOG_MARKER.length)) as {
      files: { total: number; loaded: number }
      totalCommands: number
      categories: NanoPluginCatalogue['categories']
      plugins: NanoPlugin[]
    }

    return {
      plugins: payload.plugins,
      categories: payload.categories,
      totalCommands: payload.totalCommands,
      files: payload.files,
      source: 'loader',
    }
  } catch (error) {
    logger.warn({ err: error }, 'katalog plugin via loader gagal — memakai pemindai statis')
    return null
  }
}

let pluginCache: { at: number; value: NanoPluginCatalogue } | null = null

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full)
  }
  return out
}

/** Full plugin catalogue, read from the live installation. */
export async function listNanoPlugins(
  force = false
): Promise<NanoPluginCatalogue> {
  if (!force && pluginCache && Date.now() - pluginCache.at < 30_000) {
    return pluginCache.value
  }

  const dir = engineDir()
  const root = path.join(dir, 'plugins')
  if (!fs.existsSync(root)) {
    return { plugins: [], categories: [], totalCommands: 0, files: { total: 0, loaded: 0 }, source: 'static' }
  }

  const value =
    (await scanViaLoader(dir)) ??
    summarise(
      walk(root).map((file) => parsePluginFile(file, path.relative(root, file))),
      'static'
    )

  pluginCache = { at: Date.now(), value }
  return value
}

/**
 * Static fallback: one entry per file, commands as written in the source.
 * Only used when the loader script cannot run at all (missing engine file,
 * unreadable install), never as the normal path.
 */
function summarise(plugins: NanoPlugin[], source: 'static' | 'loader'): NanoPluginCatalogue {
  const byCategory = new Map<string, { count: number; commands: number }>()

  for (const plugin of plugins) {
    const entry = byCategory.get(plugin.category) ?? { count: 0, commands: 0 }
    entry.count += 1
    entry.commands += plugin.commands.length
    byCategory.set(plugin.category, entry)
  }

  return {
    plugins,
    categories: [...byCategory.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.commands - a.commands || a.name.localeCompare(b.name)),
    totalCommands: plugins.reduce((sum, plugin) => sum + plugin.commands.length, 0),
    files: { total: plugins.length, loaded: plugins.filter((plugin) => plugin.valid).length },
    source,
  }
}

// ──────────────────────────────────────────────────── per-session data ──────

/**
 * Read a session's Nano bot data.
 *
 * Reads the database the bot itself writes, so numbers here are the same ones
 * the bot enforces `.limit`, `.premium`, welcome and antilink behaviour with.
 */
export function readNanoSessionData(sessionKey: string): NanoSessionData {
  const dirs = nanoStateDirs(sessionKey)

  // Credentials live in the session's own auth.db (same format as before).
  let hasCredentials = false
  let registered = false
  let platform: string | null = null

  const authDb = path.join(dirs.sessionsDir, 'auth.db')
  if (fs.existsSync(authDb)) {
    try {
      const auth = new DatabaseSync(authDb, { readOnly: true })
      const row = auth.prepare('SELECT data FROM creds WHERE id = 1').get() as
        | { data: string }
        | undefined
      if (row?.data) {
        hasCredentials = true
        const creds = JSON.parse(row.data) as { registered?: boolean; platform?: string }
        registered = Boolean(creds.registered)
        platform = creds.platform ?? null
      }
      auth.close()
    } catch {
      // A partially written database is not fatal — report "not linked".
    }
  }

  const db = openNanoDb(sessionKey)

  if (!db) {
    return {
      sessionKey,
      initialized: false,
      dbPath: nanoDbPath(sessionKey),
      stats: {
        users: 0,
        premiumUsers: 0,
        owners: 0,
        groupSchedules: 0,
        activeSchedules: 0,
        customPrefixes: 0,
        antilinkStrikes: 0,
        afkActive: 0,
        remindersPending: 0,
        rpgUsers: 0,
        rpgGuilds: 0,
        groupsWithWelcome: 0,
        groupsWithAntilink: 0,
      },
      users: [],
      prefixes: [],
      owners: [],
      groupSettings: [],
      schedules: [],
      // The bot database does not exist yet, so every runtime setting is at the
      // script's own default. Reported as such rather than as "false".
      accessMode: 'normal',
      anticall: false,
      afk: [],
      reminders: [],
      userSettings: [],
      connection: { hasCredentials, registered, platform },
    }
  }

  try {
    const users = rows<{
      jid: string
      pushName: string | null
      registeredAt: number
      limitCount: number
      limitResetAt: number
      premium: number
    }>(db, 'SELECT * FROM users ORDER BY registeredAt DESC LIMIT 500')

    const prefixes = rows<{ chatId: string; prefix: string }>(
      db,
      'SELECT * FROM prefixes LIMIT 500'
    )

    const owners = rows<{
      number: string
      addedAt: number
      addedBy: string | null
      name: string | null
    }>(db, 'SELECT number, addedAt, addedBy, name FROM owners LIMIT 200')

    const welcome = rows<{
      chatId: string
      enabled: number
      message: string | null
      left_message: string | null
    }>(db, 'SELECT * FROM group_welcome')
    const antilink = rows<{
      chatId: string
      gc_enabled: number
      ch_enabled: number
    }>(db, 'SELECT * FROM group_antilink')

    // ── runtime settings the bot keeps in its own database ─────────────────
    const accessModeRow = rows<{ mode: string }>(
      db,
      'SELECT mode FROM bot_access_mode WHERE id = 1'
    )[0]
    const accessMode: NanoAccessMode =
      accessModeRow?.mode === 'onlygc' || accessModeRow?.mode === 'onlypc'
        ? accessModeRow.mode
        : 'normal'

    const anticall = Boolean(
      rows<{ enabled: number }>(db, 'SELECT enabled FROM anticall_status WHERE id = 1')[0]
        ?.enabled
    )

    // `afk.jid` is the long form (`62…:62@s.whatsapp.net` / `…@lid`), so it is
    // matched against `users.jid` exactly — that is the same key the bot uses.
    const afk = rows<{
      jid: string
      is_afk: number
      reason: string
      afk_since: number | null
      updated_at: number
      pushName: string | null
    }>(
      db,
      `SELECT a.jid, a.is_afk, a.reason, a.afk_since, a.updated_at, u.pushName
         FROM afk a LEFT JOIN users u ON u.jid = a.jid
        ORDER BY a.updated_at DESC LIMIT 300`
    )

    const reminders = rows<{
      id: number
      jid: string
      chat: string
      pesan: string
      trigger_at: number
      sent: number
    }>(
      db,
      'SELECT id, jid, chat, pesan, trigger_at, sent FROM pengingat ORDER BY trigger_at DESC LIMIT 200'
    )

    const userSettings = rows<{
      jid: string
      message_mode: string
      updated_at: number
    }>(
      db,
      'SELECT jid, message_mode, updated_at FROM user_settings ORDER BY updated_at DESC LIMIT 300'
    )

    // Merge the two tables into one per-chat view, since the UI shows a single
    // settings row per group.
    const merged = new Map<string, NanoGroupSettings>()
    const blank = (chatId: string): NanoGroupSettings => ({
      chatId,
      welcome: false,
      welcomeMessage: null,
      welcomeLeftMessage: null,
      antilinkGroup: false,
      antilinkChannel: false,
      prefix: prefixes.find((p) => p.chatId === chatId)?.prefix ?? null,
    })

    for (const row of welcome) {
      merged.set(row.chatId, {
        ...blank(row.chatId),
        welcome: Boolean(row.enabled),
        welcomeMessage: row.message,
        welcomeLeftMessage: row.left_message,
      })
    }
    for (const row of antilink) {
      const existing = merged.get(row.chatId) ?? blank(row.chatId)
      existing.antilinkGroup = Boolean(row.gc_enabled)
      existing.antilinkChannel = Boolean(row.ch_enabled)
      merged.set(row.chatId, existing)
    }
    // Groups that only have a custom prefix still deserve a row.
    for (const prefix of prefixes) {
      if (!merged.has(prefix.chatId)) {
        merged.set(prefix.chatId, { ...blank(prefix.chatId), prefix: prefix.prefix })
      }
    }

    const schedules = rows<{
      id: number
      groupId: string
      mode: string
      executeAt: number
      status: string
      createdAt: number
      lastError: string | null
    }>(
      db,
      'SELECT id, groupId, mode, executeAt, status, createdAt, lastError FROM group_schedules ORDER BY executeAt DESC LIMIT 200'
    )

    const count = (sql: string): number => {
      try {
        const result = db.prepare(sql).get() as { n?: number } | undefined
        return result?.n ?? 0
      } catch {
        return 0
      }
    }

    return {
      sessionKey,
      initialized: true,
      dbPath: nanoDbPath(sessionKey),
      stats: {
        users: count('SELECT COUNT(*) AS n FROM users'),
        premiumUsers: count('SELECT COUNT(*) AS n FROM users WHERE premium = 1'),
        owners: count('SELECT COUNT(*) AS n FROM owners'),
        groupSchedules: count('SELECT COUNT(*) AS n FROM group_schedules'),
        activeSchedules: count(
          "SELECT COUNT(*) AS n FROM group_schedules WHERE status = 'active'"
        ),
        customPrefixes: count('SELECT COUNT(*) AS n FROM prefixes'),
        antilinkStrikes: count('SELECT COUNT(*) AS n FROM antilink_strikes'),
        afkActive: count('SELECT COUNT(*) AS n FROM afk WHERE is_afk = 1'),
        remindersPending: count('SELECT COUNT(*) AS n FROM pengingat WHERE sent = 0'),
        rpgUsers: count('SELECT COUNT(*) AS n FROM rpg_users'),
        rpgGuilds: count('SELECT COUNT(*) AS n FROM rpg_guilds'),
        groupsWithWelcome: count('SELECT COUNT(*) AS n FROM group_welcome WHERE enabled = 1'),
        groupsWithAntilink: count(
          'SELECT COUNT(*) AS n FROM group_antilink WHERE gc_enabled = 1 OR ch_enabled = 1'
        ),
      },
      users: users.map((user) => ({
        jid: user.jid,
        pushName: user.pushName,
        registeredAt: user.registeredAt,
        limitCount: user.limitCount,
        limitResetAt: user.limitResetAt,
        premium: Boolean(user.premium),
      })),
      prefixes,
      owners,
      groupSettings: [...merged.values()],
      schedules,
      accessMode,
      anticall,
      afk: afk.map((row) => ({
        jid: row.jid,
        pushName: row.pushName,
        active: Boolean(row.is_afk),
        reason: row.reason,
        since: row.afk_since,
        updatedAt: row.updated_at,
      })),
      reminders: reminders.map((row) => ({
        id: row.id,
        jid: row.jid,
        chat: row.chat,
        message: row.pesan,
        triggerAt: row.trigger_at,
        sent: Boolean(row.sent),
      })),
      userSettings: userSettings.map((row) => ({
        jid: row.jid,
        messageMode: row.message_mode === 'ios' ? 'ios' : 'android',
        updatedAt: row.updated_at,
      })),
      connection: { hasCredentials, registered, platform },
    }
  } finally {
    db.close()
  }
}

/** Sanity check used by the status page: is the engine usable? */
export function nanoInstallInfo(): NanoInstallInfo {
  try {
    const dir = engineDir()
    const pkgPath = path.join(dir, 'package.json')
    let version: string | null = null
    let name: string | null = null
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
        name?: string
        version?: string
      }
      version = pkg.version ?? null
      name = pkg.name ?? null
    } catch {
      // package.json missing is reported via nulls.
    }

    const patched =
      fs.existsSync(path.join(dir, 'core', 'gateway-bridge.js')) &&
      fs.readFileSync(path.join(dir, 'index.js'), 'utf8').includes('NANO GATEWAY BRIDGE HOOK')

    return {
      available: true as const,
      dir,
      name,
      version,
      /** True when the additive env-var patch is present. */
      patched,
      hasBackup: fs.existsSync(path.join(dir, '.gateway-patch-backup')),
    }
  } catch (error) {
    return {
      available: false as const,
      dir: gatewayConfig.nanoEngineDir,
      reason: error instanceof Error ? error.message : 'Kesalahan tidak diketahui',
    }
  }
}
