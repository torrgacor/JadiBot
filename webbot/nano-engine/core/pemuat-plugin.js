/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █    
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━
┇
┇▫️Author  : Danz nano & Awang Ofc 
┇▫️Website  : awangofc.my.id
┇▫️WhatsApp : wa.me/556184127506
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
┇
┇🔸Dilarang Menghapus Creadit SC
┇🔸Dilarang Menjual Script Nano Ai
┇🔸Dilarang Mengatas Namakan Script!!
⌬
*/


import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import chokidar from 'chokidar'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = path.join(__dirname, '..', 'plugins')

export const pluginStore = new Map()

function isValidHandler(handler) {
  return typeof handler === 'function' && (handler.command || handler.help)
}

/*
  Satu berkas boleh mengekspor SATU handler, atau ARRAY handler. Versi array
  dipakai kalau satu sumber fitur perlu tampil di beberapa kategori menu
  sekaligus — mis. fitur download dan fitur alat dari sumber yang sama.
*/
function normalizeHandlers(mod) {
  const raw = mod?.default
  return (Array.isArray(raw) ? raw : [raw]).filter(isValidHandler)
}

/* pasang handler ke store. Entri lama dari berkas yang sama dibuang dulu
   (termasuk sisipan kategori `path#n`) supaya hot-reload tidak menyisakan
   handler basi saat isi berkasnya berubah. */
function daftarkanHandlers(relativePath, handlers) {
  for (const key of [...pluginStore.keys()]) {
    if (key === relativePath || key.startsWith(`${relativePath}#`)) pluginStore.delete(key)
  }

  handlers.forEach((handler, i) => {
    pluginStore.set(i === 0 ? relativePath : `${relativePath}#${i}`, handler)
  })
}

function categoryFromPath(relativePath) {
  const segments = relativePath.split(path.sep)
  return segments.length > 1 ? segments[0].toLowerCase() : 'umum'
}

async function loadOneFile(absPath) {
  const relativePath = path.relative(PLUGIN_ROOT, absPath)
  try {
    const url = `${pathToFileURL(absPath).href}?update=${Date.now()}`
    const mod = await import(url)

    const handlers = normalizeHandlers(mod)
    if (!handlers.length) {
      logSkip(relativePath, 'tidak mengekspor handler yang valid')
      return []
    }

    for (const handler of handlers) {
      handler.category = handler.category || categoryFromPath(relativePath)
      handler.filePath = absPath
    }

    daftarkanHandlers(relativePath, handlers)
    return handlers
  } catch (err) {
    logSkip(relativePath, err.message)
    return []
  }
}

function logSkip(relativePath, reason) {
  console.log(`  \x1b[33m⚠\x1b[0m  Plugin dilewati: ${relativePath} (${reason})`)
}

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

export async function loadAllPlugins() {
  pluginStore.clear()
  await fs.ensureDir(PLUGIN_ROOT)

  const files = await walkDir(PLUGIN_ROOT)
  let loaded = 0
  let handlers = 0

  for (const file of files) {
    const result = await loadOneFile(file)
    if (result.length) {
      loaded++
      handlers += result.length
    }
  }

  return { total: files.length, loaded, handlers }
}

export function watchPlugins({ onReload } = {}) {
  const watcher = chokidar.watch(PLUGIN_ROOT, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  })

  watcher.on('add', async (file) => {
    if (!file.endsWith('.js')) return
    await loadOneFile(file)
    onReload?.('added', path.relative(PLUGIN_ROOT, file))
  })

  watcher.on('addDir', async (dir) => {
    if (dir === PLUGIN_ROOT) return
    const files = await walkDir(dir)
    for (const file of files) {
      await loadOneFile(file)
    }
    if (files.length) {
      onReload?.('folder-baru', path.relative(PLUGIN_ROOT, dir))
    }
  })

  watcher.on('change', async (file) => {
    if (!file.endsWith('.js')) return
    await loadOneFile(file)
    onReload?.('changed', path.relative(PLUGIN_ROOT, file))
  })

  watcher.on('unlink', (file) => {
    if (!file.endsWith('.js')) return
    const relativePath = path.relative(PLUGIN_ROOT, file)
    for (const key of [...pluginStore.keys()]) {
      if (key === relativePath || key.startsWith(`${relativePath}#`)) pluginStore.delete(key)
    }
    onReload?.('removed', relativePath)
  })

  return watcher
}

export function findPluginByCommand(commandText) {
  for (const handler of pluginStore.values()) {
    if (handler.disabled) continue

    if (handler.command instanceof RegExp) {
      handler.command.lastIndex = 0
      if (handler.command.test(commandText)) return handler
      handler.command.lastIndex = 0
    }

    if (typeof handler.command === 'string' && handler.command === commandText) {
      return handler
    }

    if (Array.isArray(handler.help) && handler.help.includes(commandText)) {
      return handler
    }
  }
  return null
}

export function getCommandEntries() {
  const entries = []
  for (const handler of pluginStore.values()) {
    if (handler.disabled) continue

    const declared = []
    const help = Array.isArray(handler.help) ? handler.help : [handler.help]
    const menuHelp = Array.isArray(handler.menuHelp) ? handler.menuHelp : [handler.menuHelp]

    for (const command of [...help, ...menuHelp]) {
      if (typeof command === 'string') declared.push(command)
    }

    if (typeof handler.command === 'string') {
      declared.push(handler.command)
    }

    if (handler.command instanceof RegExp) {
      const source = handler.command.source
        .replace(/^\^/, '')
        .replace(/\$$/, '')
        .replace(/\(\?:/g, '(')
        .replace(/[()]/g, '')
      if (/^[a-z0-9_-]+(?:\|[a-z0-9_-]+)*$/i.test(source)) {
        declared.push(...source.split('|'))
      }
    }

    for (const command of declared) {
      const normalized = command.trim().toLowerCase()
      if (!normalized) continue
      entries.push({
        command: normalized,
        plugin: handler,
        category: handler.category || 'umum',
      })
    }
  }
  return entries
}

export function getAllCategories() {
  const categories = new Set()
  for (const handler of pluginStore.values()) {
    if (!handler.disabled && !handler.hiddenFromCategory) categories.add(handler.category || 'umum')
  }
  return [...categories]
}

export function getPluginsByCategory(category) {
  const key = String(category || '').trim().toLowerCase()
  return [...pluginStore.values()].filter(
    (handler) => !handler.disabled && String(handler.category || 'umum').trim().toLowerCase() === key
  )
}

export default {
  pluginStore,
  loadAllPlugins,
  watchPlugins,
  findPluginByCommand,
  getCommandEntries,
  getAllCategories,
  getPluginsByCategory,
}
