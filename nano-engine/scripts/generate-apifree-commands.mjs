/* ==========================================================================
   Generator perintah API GRATIS: SATU ENDPOINT = SATU COMMAND.

   Nama perintah diambil dari potongan terakhir path; kalau sudah dipakai,
   dinaikkan bertahap (induk → kategori → seluruh path → tambah angka) supaya
   tidak menabrak perintah milik fitur lain.

   Jalankan: node scripts/generate-apifree-commands.mjs
   Hasil   : data/api-free-commands.json + plugins/apifree/api-*.js
   ========================================================================== */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadAllPlugins, getCommandEntries } from '../core/pemuat-plugin.js'
import { KATEGORI_MENU, kategoriMenu } from '../lib/apifree.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CATALOG = path.join(ROOT, 'data', 'api-free.json')
const OUT = path.join(ROOT, 'data', 'api-free-commands.json')
const PLUGIN_DIR = path.join(ROOT, 'plugins', 'apifree')

/* Hanya endpoint hasil sisir yang benar-benar jalan tanpa kunci (aktif: true)
   yang dijadikan perintah. Penyisirnya: scripts/sisir-apifree.mjs */
function layak(ep) {
  return ep.aktif === true
}

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

const SELF_FOLDER = `${path.sep}plugins${path.sep}apifree${path.sep}`
const RESERVED_EXTRA = ['af', 'apifree', 'menu', 'ping', 'owner']

/* Nama potongan path yang terlalu kabur kalau dipakai sendirian
   (mis. "/iptv/id" → ".id"). Untuk ini, nama induk/kategori didahulukan. */
const NAMA_UMUM = new Set([
  'id', 'ids', 'status', 'categories', 'category', 'channels', 'countries', 'languages', 'playlist',
  'list', 'detail', 'details', 'info', 'data', 'all', 'index', 'home', 'search', 'file', 'media',
  'type', 'name', 'role', 'plan', 'cost', 'price', 'menu', 'update', 'delete', 'create', 'check',
  'send', 'get', 'post', 'random', 'test', 'leave', 'join', 'user', 'users', 'server',
])

const segments = (p) => String(p || '').split('/').filter(Boolean)
const slug = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

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
    const base = slug(parts[parts.length - 1] || '')
    if (!base) continue
    const induk = slug(parts[parts.length - 2] || '')
    const kategori = slug(ep.category)
    const penyedia = slug(ep.provider)

    const indukJelas = induk && induk !== base && !NAMA_UMUM.has(induk)
    const wajibDulu = ep.paksaNama ? [slug(ep.paksaNama)] : []
    const kandidat = [
      ...wajibDulu,
      /* nama kabur → dahulukan nama induk/kategori biar jelas */
      ...(NAMA_UMUM.has(base) && indukJelas ? [`${induk}-${base}`] : []),
      ...(NAMA_UMUM.has(base) && induk && kategori !== induk ? [`${kategori}-${induk}-${base}`] : []),
      ...(NAMA_UMUM.has(base) && kategori && kategori !== base ? [`${kategori}-${base}`] : []),
      base,
      induk && `${induk}-${base}`,
      kategori && `${kategori}-${base}`,
      penyedia && `${penyedia}-${base}`,
      slug(parts.join('-')),
    ].filter(Boolean)
    for (let i = 2; i <= 60; i++) kandidat.push(`${base}-${i}`)

    let dipilih = ''
    for (const k of kandidat) {
      if (!k || taken.has(k)) continue
      dipilih = k
      break
    }
    if (!dipilih) continue

    if (dipilih !== base) {
      renamed.push({
        provider: ep.provider,
        path: ep.path,
        command: dipilih,
        reason: reserved.has(base) ? 'nama sudah dipakai perintah lain' : 'nama sama dengan endpoint lain',
      })
    }

    taken.add(dipilih)
    commands.push({
      command: dipilih,
      provider: ep.provider,
      path: ep.path,
      full: ep.full,
      method: ep.method,
      name: ep.name,
      category: ep.category,
      menu: kategoriMenu(ep.category),
      required: (ep.params || []).filter((p) => p.required).map((p) => p.name),
      params: (ep.params || []).map((p) => p.name),
      kunci: ep.wajibKunci === false || ep.key?.mode === 'none' ? 'tanpa kunci' : ep.key?.mode || 'none',
      keyMode: ep.wajibKunci === false ? 'none' : ep.key?.mode || 'none',
      summary: String(ep.description || '').slice(0, 160),
    })
  }

  return { commands, renamed }
}

async function main() {
  const katalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'))
  const semua = katalog.endpoints || []
  const endpoints = semua.filter(layak)
  const dibuang = semua.length - endpoints.length

  const reserved = await reservedCommands()
  const { commands, renamed } = buildCommands(endpoints, reserved)

  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        meta: {
          generatedAt: new Date().toISOString(),
          source: 'data/api-free.json',
          total: commands.length,
          reserved: reserved.size,
          renamed: renamed.length,
          dibuang,
        },
        commands,
        renamed,
      },
      null,
      1,
    ),
  )

  /* ── satu berkas plugin per kategori MENU ────────────────────────────────
     Kategori katalog yang sejenis (canvas/canvas-maker/maker/image) digabung
     jadi satu plugin supaya kategorinya tidak dobel di menu. */
  const perMenu = new Map()
  for (const item of commands) {
    const menu = item.menu || kategoriMenu(item.category)
    const isi = perMenu.get(menu) || { total: 0, katalog: new Set() }
    isi.total++
    isi.katalog.add(item.category)
    perMenu.set(menu, isi)
  }

  const wanted = new Map()
  for (const [menu, isi] of perMenu) {
    wanted.set(`api-${slug(menu)}.js`, { menu, kategori: [...isi.katalog].join(', '), total: isi.total })
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
    fs.writeFileSync(
      path.join(PLUGIN_DIR, file),
      `${KEPALA}\n/* Kategori menu "${info.menu}" API Gratis — ${info.total} perintah.\n   Kategori katalog: ${info.kategori}.\n   Daftar perintahnya dibaca dari data/api-free-commands.json,\n   jadi jalankan ulang scripts/generate-apifree-commands.mjs kalau berubah. */\n\nimport { buatHandlerKategori } from '../../lib/apifree-endpoint.js'\n\nexport default buatHandlerKategori('${info.menu}')\n`,
    )
  }

  console.log(`endpoint aktif   : ${endpoints.length} dari ${semua.length} (dilewati ${dibuang})`)
  console.log(`perintah dibuat  : ${commands.length}`)
  console.log(`nama disesuaikan : ${renamed.length}`)
  console.log(`plugin kategori  : ${wanted.size} berkas`)
  for (const [file, info] of [...wanted].sort((a, b) => b[1].total - a[1].total)) {
    console.log(`   ${file.padEnd(20)} ${String(info.total).padStart(3)} perintah -> menu ${info.menu} (katalog: ${info.kategori})`)
  }

  const kembar = commands.map((c) => c.command).filter((c, i, arr) => arr.indexOf(c) !== i)
  if (kembar.length) throw new Error(`Nama perintah kembar: ${kembar.join(', ')}`)
  console.log(`\nberkas: ${path.relative(process.cwd(), OUT)}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error('GAGAL:', err.message)
    process.exit(1)
  })
}
