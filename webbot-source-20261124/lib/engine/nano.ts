/**
 * Nano engine types.
 *
 * NANO GATEWAY does not invent a feature set — it surfaces the one the Nano bot
 * already has. These shapes describe what is read out of the live installation:
 * `config/settings.js`, the `plugins/` folder, and the bot's own SQLite database.
 *
 * Pure types only, so both the gateway process (`gateway/nano/introspect.ts`,
 * which reads the files) and the web app (which fetches via `/api/nano/*`) can
 * import this without dragging `node:fs` into a client bundle.
 */

// ──────────────────────────────────────────────────────────── install ──────

export interface NanoInstallInfo {
  available: boolean
  /** Absolute path to the installation (the folder holding `index.js`). */
  dir: string | null
  name?: string | null
  version?: string | null
  /** True when the gateway bridge + env redirect patch is installed. */
  patched?: boolean
  /** True when the original files were backed up before patching. */
  hasBackup?: boolean
  /** Populated when `available` is false. */
  reason?: string
}

// ───────────────────────────────────────────────────────────── config ──────

/** Mirror of the values `config/settings.js` actually exports. */
export interface NanoConfig {
  botName: string | null
  botAlias: string | null
  botVersion: string | null
  botMode: string | null
  ownerName: string | null
  ownerNumbers: string[]
  defaultPrefix: string | null
  timezone: string | null
  footerText: string | null
  pairingNumber: string | null
  links: Record<string, string> | null
  /** Present when settings.js could not be evaluated. */
  error?: string
}

// ──────────────────────────────────────────────────────────── plugins ──────

export interface NanoPlugin {
  /**
   * Unique per registered handler, e.g. "tools/reminder.js". A file that
   * registers several categories (`tools/gist.js`) appears once per category,
   * with `#<kategori>` appended from the second one on.
   */
  id: string
  /** Path relative to plugins/, e.g. "tools/reminder.js". Shared by every
   *  handler that one file registers. */
  file: string
  name: string
  category: string
  /**
   * Command names without the prefix, exactly the ones the bot's menu shows.
   * Every figure the panel displays is counted from this list.
   */
  commands: string[]
  /**
   * Names the bot also answers to but does not advertise in its menu. Searchable
   * in the panel, deliberately not counted as features.
   */
  aliases: string[]
  help: string[]
  tags: string[]
  description: string | null
  /** Plugin opts out of the per-user limit system. */
  unlimited: boolean
  groupOnly: boolean
  ownerOnly: boolean
  /** Command is reserved for premium users (the bot refuses it otherwise). */
  premium: boolean
  privateOnly: boolean
  adminOnly: boolean
  /** False for files the loader would reject (no command/help). */
  valid: boolean
}

export interface NanoPluginCatalogue {
  /** One entry per registered handler, not per file. */
  plugins: NanoPlugin[]
  /** `count` is the number of plugin files that serve the category. */
  categories: Array<{ name: string; count: number; commands: number }>
  /** Total command names exposed across every plugin. */
  totalCommands: number
  /** Plugin files: how many were scanned and how many registered a handler. */
  files: { total: number; loaded: number }
  /**
   * How the catalogue was read:
   *   • `loader` — the bot's own plugin loader (exact, the normal path)
   *   • `static` — text scan fallback, only when the loader cannot run
   */
  source: 'loader' | 'static'
}

// ──────────────────────────────────────────────────── per-session data ──────

export interface NanoUser {
  jid: string
  pushName: string | null
  registeredAt: number | null
  limitCount: number
  limitResetAt: number
  premium: boolean
}

export interface NanoGroupSettings {
  chatId: string
  welcome: boolean
  /** Welcome text stored by `.welcome` in the bot (`group_welcome.message`). */
  welcomeMessage: string | null
  /** Goodbye text (`group_welcome.left_message`). */
  welcomeLeftMessage: string | null
  antilinkGroup: boolean
  antilinkChannel: boolean
  prefix: string | null
}

/** `bot_access_mode` — normal / group-only / private-only. */
export type NanoAccessMode = 'normal' | 'onlygc' | 'onlypc'

/** One row of the bot's `afk` table. */
export interface NanoAfkEntry {
  jid: string
  pushName: string | null
  active: boolean
  reason: string
  /** Epoch ms when the user went AFK. */
  since: number | null
  updatedAt: number
}

/** One row of `pengingat` (the bot's reminder queue). */
export interface NanoReminder {
  id: number
  jid: string
  chat: string
  message: string
  triggerAt: number
  sent: boolean
}

/** One row of `user_settings` (per-user reply style). */
export interface NanoUserSetting {
  jid: string
  /** `android` renders the bot's replies as quoted messages, `ios` as plain. */
  messageMode: 'android' | 'ios'
  updatedAt: number
}

export interface NanoSessionData {
  sessionKey: string
  /** False until the bot has run once and created its database. */
  initialized: boolean
  dbPath: string
  stats: {
    users: number
    premiumUsers: number
    owners: number
    groupSchedules: number
    activeSchedules: number
    customPrefixes: number
    antilinkStrikes: number
    /** Newer counters, all read straight from the bot's own tables. */
    afkActive: number
    remindersPending: number
    rpgUsers: number
    rpgGuilds: number
    groupsWithWelcome: number
    groupsWithAntilink: number
  }
  users: NanoUser[]
  prefixes: Array<{ chatId: string; prefix: string }>
  owners: Array<{ number: string; addedAt: number; addedBy: string | null; name: string | null }>
  groupSettings: NanoGroupSettings[]
  schedules: Array<{
    id: number
    groupId: string
    mode: string
    executeAt: number
    status: string
    createdAt: number
    lastError: string | null
  }>
  /** Runtime settings the bot stores in its own database. */
  accessMode: NanoAccessMode
  anticall: boolean
  afk: NanoAfkEntry[]
  reminders: NanoReminder[]
  userSettings: NanoUserSetting[]
  connection: {
    hasCredentials: boolean
    registered: boolean
    platform: string | null
  }
}

// ─────────────────────────────────────────────────── writable settings ──────

/**
 * Writes the panel can perform against the bot's own database.
 *
 * Every op maps 1:1 onto a table the script itself reads while handling
 * messages (`core/akses-mode.js`, `core/anticall.js`, `core/prefix.js`, the
 * welcome/antilink modules), so a change takes effect on the next message
 * instead of living beside the bot as a parallel setting.
 */
export type NanoBotSettingOp =
  | { op: 'access-mode'; mode: NanoAccessMode }
  | { op: 'anticall'; enabled: boolean }
  | {
      op: 'group-welcome'
      chatId: string
      enabled: boolean
      message?: string | null
      leftMessage?: string | null
    }
  | {
      op: 'group-antilink'
      chatId: string
      groupEnabled: boolean
      channelEnabled: boolean
    }
  | { op: 'chat-prefix'; chatId: string; prefix: string | null }
  | { op: 'add-owner'; number: string; name?: string | null }
  | { op: 'remove-owner'; number: string }

export interface NanoBotSettingResult {
  op: NanoBotSettingOp['op']
  /** Arabic-free, user-facing sentence the UI shows verbatim in a toast. */
  message: string
  dbCreated: boolean
}

// ────────────────────────────────────────────────── script config file ──────

/** Keys the panel is allowed to write into `config/settings.js`. */
export const NANO_CONFIG_EDITABLE_KEYS = [
  'botName',
  'botAlias',
  'ownerName',
  'ownerNumbers',
  'defaultPrefix',
  'timezone',
  'footerText',
  'footerYear',
  'botVersion',
  'botMode',
  'pairingNumber',
] as const

export type NanoConfigKey = (typeof NANO_CONFIG_EDITABLE_KEYS)[number]

export interface NanoConfigUpdateResult {
  /** Keys actually rewritten. */
  updated: NanoConfigKey[]
  /** The configuration as it reads after the write. */
  config: NanoConfig
  /** Absolute path of the backup taken before the write. */
  backupPath: string
  /** The script reads settings.js at startup, so a restart applies it. */
  requiresRestart: true
}

// ──────────────────────────────────────────────────────────────── logs ──────

export type NanoLogLevel = 'info' | 'success' | 'warn' | 'error'

export interface NanoLogLine {
  /** Monotonic per-session sequence, used as a cursor by the log viewer. */
  seq: number
  at: string
  level: NanoLogLevel
  /** `stdout` / `stderr` / `system` (our own supervision messages). */
  stream: 'stdout' | 'stderr' | 'system'
  text: string
}

export interface NanoLogBatch {
  lines: NanoLogLine[]
  /** Cursor to pass back as `since` on the next poll. */
  nextSeq: number
  /** Total lines currently retained for this session. */
  buffered: number
}
