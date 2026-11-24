import { db } from '@/lib/db'
import { nanoClient } from '@/lib/engine/client'
import { notFound } from '@/lib/errors'
import type {
  NanoConfig,
  NanoInstallInfo,
  NanoPlugin,
  NanoPluginCatalogue,
  NanoSessionData,
} from '@/lib/engine/nano'

/**
 * Nano engine service (server-side).
 *
 * Everything here is about *observing* the bot the platform runs: its config,
 * its plugin catalogue, and each session's own database. Nothing is generated
 * by this app — if the engine is unreachable these functions throw, and the UI
 * says so rather than rendering placeholder numbers.
 */

export interface NanoOverview {
  install: NanoInstallInfo
  config: NanoConfig | null
  categories: NanoPluginCatalogue['categories']
  totalPlugins: number
  /** Plugins the loader would actually register (have a command or help text). */
  activePlugins: number
  totalCommands: number
  /** Set when the installation is present but its settings could not be read. */
  configError: string | null
}

/**
 * One call for the features page: installation health, live config and the
 * plugin breakdown. Config failures are surfaced rather than thrown so the page
 * still shows the catalogue when `settings.js` is temporarily unreadable.
 */
export async function getNanoOverview(): Promise<NanoOverview> {
  const [install, catalogue] = await Promise.all([nanoClient.info(), nanoClient.plugins()])

  let config: NanoConfig | null = null
  let configError: string | null = null
  try {
    config = await nanoClient.config()
  } catch (error) {
    configError = error instanceof Error ? error.message : 'Gagal membaca konfigurasi Nano.'
  }

  return {
    install,
    config,
    categories: catalogue.categories,
    /* Plugin counts are FILE counts, matching what the bot loads; the catalogue
       itself lists one entry per registered handler (`plugins`). */
    totalPlugins: catalogue.files.total,
    activePlugins: catalogue.files.loaded,
    totalCommands: catalogue.totalCommands,
    configError,
  }
}

export interface NanoPluginQuery {
  /** Free-text match across command names, aliases, tags, description and plugin name. */
  q?: string
  category?: string
  /** Only plugins the loader would register. */
  activeOnly?: boolean
  /**
   * Filter by the bot's own limit rule:
   *   • `free`    — the plugin never spends the user's daily limit
   *   • `limited` — it does
   */
  limit?: 'free' | 'limited'
}

/**
 * The plugin catalogue, filtered.
 *
 * Filtering happens here rather than in the UI because the catalogue is ~200
 * entries of static metadata — cheap to filter once on the server, and it keeps
 * the client bundle free of the whole list.
 */
export async function getNanoPlugins(query: NanoPluginQuery = {}): Promise<
  NanoPluginCatalogue & {
    filtered: NanoPlugin[]
    /**
     * What the search and limit filters leave, BEFORE the category filter — so
     * the category chips can show counts that match what clicking them shows.
     */
    scope: { totalCommands: number; categories: Array<{ name: string; commands: number }> }
  }
> {
  const catalogue = await nanoClient.plugins()
  const needle = query.q?.trim().toLowerCase()

  function withinFilters(plugin: NanoPlugin): boolean {
    if (query.activeOnly && !plugin.valid) return false
    if (query.limit === 'free' && !plugin.unlimited) return false
    if (query.limit === 'limited' && plugin.unlimited) return false
    if (!needle) return true

    // Aliases are searched too: they are real commands even though the bot's
    // menu — and therefore the counts — only list the primary ones.
    return (
      plugin.name.toLowerCase().includes(needle) ||
      plugin.id.toLowerCase().includes(needle) ||
      plugin.category.toLowerCase().includes(needle) ||
      (plugin.description?.toLowerCase().includes(needle) ?? false) ||
      plugin.commands.some((command) => command.toLowerCase().includes(needle)) ||
      plugin.aliases.some((alias) => alias.toLowerCase().includes(needle)) ||
      plugin.tags.some((tag) => tag.toLowerCase().includes(needle))
    )
  }

  const scopePlugins = catalogue.plugins.filter(withinFilters)
  const filtered = query.category
    ? scopePlugins.filter((plugin) => plugin.category === query.category)
    : scopePlugins

  const byCategory = new Map<string, number>()
  let scopeCommands = 0
  for (const plugin of scopePlugins) {
    scopeCommands += plugin.commands.length
    byCategory.set(plugin.category, (byCategory.get(plugin.category) ?? 0) + plugin.commands.length)
  }

  return {
    ...catalogue,
    filtered,
    scope: {
      totalCommands: scopeCommands,
      categories: [...byCategory.entries()]
        .map(([name, commands]) => ({ name, commands }))
        .sort((a, b) => b.commands - a.commands || a.name.localeCompare(b.name)),
    },
  }
}

/**
 * Read one session's Nano bot data.
 *
 * Ownership is checked against our database first, so a user can never read
 * another account's bot state. Admins go through their own endpoints.
 */
export async function getNanoSessionDataForUser(
  sessionId: string,
  userId: string
): Promise<NanoSessionData> {
  const session = await db.whatsAppSession.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true },
  })

  // Reported as "not found" rather than "forbidden" so the API does not confirm
  // that someone else's session exists.
  if (!session || session.userId !== userId) {
    throw notFound('Sesi tidak ditemukan.')
  }

  return nanoClient.sessionData(sessionId)
}
