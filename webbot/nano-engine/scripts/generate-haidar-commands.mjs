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
┇▫️Author  : Awang OfficiaL
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

/* ==========================================================================
   Generator nama command: SATU ENDPOINT = SATU COMMAND.

   Aturannya: nama command diambil dari potongan terakhir path endpoint.
     /ai-image/editimg-v1  ->  .editimg-v1
     /ai/chatgpt           ->  .chatgpt

   Kalau nama itu sudah dipakai (oleh plugin lain, atau oleh endpoint lain di
   path berbeda), namanya dinaikkan bertahap sampai bebas:
     1. potongan terakhir                 detail
     2. induk + potongan terakhir         komiku-detail
     3. kategori + potongan terakhir      anime-detail
     4. seluruh path dipisah tanda hubung anime-komiku-detail
     5. ditambah angka                    detail-2, detail-3, …

   Jalankan:  node scripts/generate-haidar-commands.mjs
   Hasil   :  data/haidar-commands.json
   ========================================================================== */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadAllPlugins, getCommandEntries } from '../core/pemuat-plugin.js'
import { KATEGORI_MENU } from '../lib/haidar-endpoint.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CATALOG = path.join(ROOT, 'data', 'haidar-api.json')
const OUT = path.join(ROOT, 'data', 'haidar-commands.json')
const PLUGIN_DIR = path.join(ROOT, 'plugins', 'haidar')
const KEPALA = `/*
⎢ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
⎢
⎢ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
⎢🔸Dilarang Menghapus Creadit SC
⎢🔸Dilarang Menjual Script Nano Ai
⎢🔸Dilarang Mengatas Namakan Script!!
⌬
*/
`

const SELF_FOLDER = `${path.sep}plugins${path.sep}haidar${path.sep}`
const RESERVED_EXTRA = ['hai', 'haidar', 'menu', 'ping', 'owner']

/* Endpoint yang TIDAK dibuatkan perintah karena sudah punya fitur khusus yang
   lebih lengkap di bot ini — supaya tidak dobel:
     /downloader/spotify   ->  plugins/download/spotify.js (.spotify: cari +
     /downloader/playspotify   kartu gaya Spotify + audionya bisa diputar)
     /spotify/search       ->  kembar dengan pencarian .spotify
     /search/spotify       ->  kembar dengan pencarian .spotify
     /spotify/home         ->  selalu gagal di penyedianya (upstream_error)
     /spotify/stream       ->  balasannya halaman HTML, bukan data audio

      /downloader/threads   ->  plugins/download/threads.js (.threads: scraper
                                 SSR sendiri di lib/threads.js, tanpa API key,
                                 tanpa rate limit, media diverifikasi dulu sebelum
                                 dikirim, plus statistik & komentar teratas) */
const DIBUANG_PATH = new Set([
  '/downloader/spotify',
  '/downloader/playspotify',
  '/spotify/search',
  '/search/spotify',
  '/spotify/home',
  '/spotify/stream',
  '/downloader/threads',
  '/downloader/x',
])

const segments = (p) => String(p || '').split('/').filter(Boolean)
const lastPart = (p) => segments(p).pop() || ''
const slug = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

/* Nama-nama yang sudah dipakai plugin lain (folder haidar dikecualikan supaya
   hasil generate tidak menabrak hasil generate sebelumnya). */
async function reservedCommands() {
  await loadAllPlugins()
  const taken = new Set(RESERVED_EXTRA)
  for (const entry of getCommandEntries()) {
    if (String(entry.plugin?.filePath || '').includes(SELF_FOLDER)) continue
    taken.add(entry.command)
  }
  return taken
}

export function buildCommands(endpoints, reserved = new Set()) {
  const taken = new Set(reserved)
  const commands = []
  const renamed = []

  for (const ep of endpoints) {
    const parts = segments(ep.path)
    const base = slug(lastPart(ep.path))
    const parent = slug(parts[parts.length - 2] || '')
    const category = slug(ep.category)

    const candidates = [base, parent && `${parent}-${base}`, category && `${category}-${base}`, slug(parts.join('-'))].filter(
      Boolean,
    )
    // tingkat terakhir: tambahkan angka
    for (let i = 2; i <= 40; i++) candidates.push(`${base}-${i}`)

    let chosen = ''
    for (const candidate of candidates) {
      if (!candidate || taken.has(candidate)) continue
      chosen = candidate
      break
    }
    if (!chosen) continue // praktis tidak terjadi

    if (chosen !== base) {
      renamed.push({
        path: ep.path,
        command: chosen,
        reason: reserved.has(base) ? 'nama sudah dipakai perintah lain' : 'nama sama dengan endpoint lain',
      })
    }

    taken.add(chosen)
    commands.push({
      command: chosen,
      path: ep.path,
      full: ep.full,
      name: ep.name,
      method: ep.method,
      category: ep.category,
      plan: ep.plan,
      rateLimit: ep.rateLimit ?? null,
      required: (ep.params || []).filter((p) => p.required).map((p) => p.name),
      summary: String(ep.description || '').slice(0, 160),
    })
  }

  return { commands, renamed }
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'))
  const endpoints = (catalog.endpoints || []).filter((ep) => !DIBUANG_PATH.has(ep.path))
  const dibuang = (catalog.endpoints || []).length - endpoints.length
  const reserved = await reservedCommands()
  const { commands, renamed } = buildCommands(endpoints, reserved)

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: catalog.meta?.source || 'https://api.haidarxd.my.id/docs',
      baseUrl: catalog.meta?.baseUrl || 'https://api.haidarxd.my.id',
      total: commands.length,
      reserved: reserved.size,
      renamed: renamed.length,
      dibuang,
    },
    commands,
    renamed,
  }

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 1))

  // ── berkas plugin per kategori ──────────────────────────────────────────
  const perKategori = new Map()
  for (const item of commands) perKategori.set(item.category, (perKategori.get(item.category) || 0) + 1)

  const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const wanted = new Map()
  for (const [kategori, total] of perKategori) {
    const menu = KATEGORI_MENU[kategori] || kategori
    wanted.set(`api-${slug(kategori)}.js`, { kategori, menu, total })
  }

  fs.mkdirSync(PLUGIN_DIR, { recursive: true })
  for (const file of fs.readdirSync(PLUGIN_DIR)) {
    if (!file.startsWith('api-') || !file.endsWith('.js')) continue
    if (!wanted.has(file)) {
      fs.unlinkSync(path.join(PLUGIN_DIR, file))
      console.log(`plugin dibuang : ${file} (kategori tidak ada lagi)`)
    }
  }

  for (const [file, info] of wanted) {
    const isi = `${KEPALA}\n/* Kategori "${info.kategori}" dari HaidarApis — ${info.total} perintah.\n   Semua perintah di kategori ini otomatis diambil dari\n   data/haidar-commands.json, jadi cukup jalankan ulang\n   scripts/generate-haidar-commands.mjs kalau daftarnya berubah.\n   Menu bot: ${info.menu} */\n\nimport { buatHandlerKategori } from '../../lib/haidar-endpoint.js'\n\nexport default buatHandlerKategori('${info.kategori}')\n`
    fs.writeFileSync(path.join(PLUGIN_DIR, file), isi)
  }

  console.log(`plugin kategori: ${wanted.size} berkas (plugins/haidar/api-*.js)`)
  for (const [file, info] of [...wanted].sort((a, b) => a[1].kategori.localeCompare(b[1].kategori))) {
    console.log(`   ${file.padEnd(26)} ${String(info.total).padStart(3)} perintah -> menu ${info.menu}`)
  }
  console.log('')
  console.log(`command dibuat : ${commands.length} (dari ${catalog.endpoints.length} endpoint)`)
  console.log(`nama disesuaikan: ${renamed.length}`)
  for (const r of renamed.slice(0, 20)) console.log(`   ${r.path} -> .${r.command}  (${r.reason})`)
  if (renamed.length > 20) console.log(`   … dan ${renamed.length - 20} lainnya`)
  console.log(`berkas        : ${path.relative(process.cwd(), OUT)}`)

  const dupes = commands.map((c) => c.command).filter((c, i, arr) => arr.indexOf(c) !== i)
  if (dupes.length) throw new Error(`Ada nama command kembar: ${dupes.join(', ')}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error('GAGAL:', err.message)
    process.exit(1)
  })
}
