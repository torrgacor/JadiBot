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
   Generator katalog HaidarApis

   Halaman https://api.haidarxd.my.id/docs adalah aplikasi Next.js yang
   merender daftar endpoint di sisi klien, jadi katalognya dibaca dari payload
   halaman itu sendiri (bukan ditebak satu per satu).

   Jalankan:  node scripts/generate-haidar-catalog.mjs
   Hasil   :  data/haidar-api.json
   ========================================================================== */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'data', 'haidar-api.json')

export const BASE_URL = 'https://api.haidarxd.my.id'

/* --------------------------------------------------------------------------
   Penyaringan.
   Kategori pembayaran/PPOB dibuang sesuai permintaan. Sisanya dibuang karena
   isinya bukan fitur biasa: konten 18+, alat penipuan (struk palsu), spam,
   pembuat akun/token premium, penyelesai CAPTCHA, dan pencarian data pribadi
   (NIK, bansos, rekening bank/e-wallet, follower pribadi).

   Cek profil publik (kategori stalker) dan daftar proxy TETAP dipasang, karena
   itu fitur biasa bot.
   -------------------------------------------------------------------------- */
const EXCLUDE_CATEGORY = new Set(['adult(18+)', 'orderkuota', 'wekios'])

const EXCLUDE_PATH = [
  [/^\/tools\/orderkuota\//, 'pembayaran (OrderKuota)'],
  [/^\/wekios\//, 'pembayaran (WeKios)'],
  [/^\/adult\//, 'konten 18+'],
  [/^\/ai-image\/tobugil/, 'pembuat gambar telanjang'],
  [/^\/freefire\//, 'pembuatan akun otomatis'],
  [/^\/apps-premium\//, 'pembuat token akun premium'],
  [/^\/alight-motion\//, 'otomatisasi akun Alight Motion'],
  [/^\/stalker\/(ig-cek-unfoll)/, 'pelacakan follower pribadi'],
  [/^\/tools\/(spamngl|reactch)/, 'spam pesan / auto-react massal'],
  [/^\/tools\/nikparse/, 'pembacaan data kependudukan (NIK)'],
  [/^\/tools\/create-struk/, 'pembuat struk/nota palsu'],
  [/^\/tools\/cek-rekening-/, 'pengecekan data rekening pribadi'],
  [/^\/tools\/cloudflare-/, 'penembus CAPTCHA/WAF'],
  [/cekbansos/, 'pengecekan data bansos by NIK'],
]

export function reasonExcluded(endpoint) {
  if (EXCLUDE_CATEGORY.has(endpoint.category)) {
    if (endpoint.category === 'orderkuota' || endpoint.category === 'wekios') return 'pembayaran'
    return 'konten 18+'
  }
  const target = endpoint.path || ''
  for (const [re, reason] of EXCLUDE_PATH) {
    if (re.test(target)) return reason
  }
  return null
}

/* Baca payload halaman /docs lalu kembalikan daftar endpoint mentah. */
export function extractEndpoints(html) {
  const un = html
    .replace(/\\u0026/g, '&')
    .replace(/\\"/g, '"')
    .replace(/\\\\n/g, '\\n')
    .replace(/\\\\/g, '\\')

  const found = []
  const re = /"id":"(?:get|post|put|delete|patch)_[a-z0-9_]+"/g
  let m

  while ((m = re.exec(un))) {
    const braceStart = un.lastIndexOf('{', m.index)
    if (braceStart < 0) continue

    let depth = 0
    let i = braceStart
    let inStr = false
    let esc = false

    for (; i < un.length; i++) {
      const c = un[i]
      if (inStr) {
        if (esc) esc = false
        else if (c === '\\') esc = true
        else if (c === '"') inStr = false
        continue
      }
      if (c === '"') inStr = true
      else if (c === '{') depth++
      else if (c === '}') {
        depth--
        if (depth === 0) {
          i++
          break
        }
      }
    }

    try {
      const obj = JSON.parse(un.slice(braceStart, i))
      if (obj?.fullPath && obj?.method) found.push(obj)
    } catch {
      /* potongan rusak dilewati */
    }
    re.lastIndex = i
  }

  const uniq = new Map()
  for (const e of found) uniq.set(e.id, e)
  return [...uniq.values()]
}

/* Ringkas endpoint agar berkas katalog tetap kecil dan enak dibaca plugin. */
function slim(e) {
  return {
    id: e.id,
    name: e.name,
    path: e.path,
    full: e.fullPath,
    method: e.method,
    category: e.category,
    description: e.description,
    author: e.author,
    params: (Array.isArray(e.parameters) ? e.parameters : []).map((p) => ({
      name: p.name,
      type: p.type,
      required: Boolean(p.required),
      description: p.description,
      example: p.example,
      default: p.default,
      enum: p.enum,
      optional: p.options ? { endpoint: p.options.endpoint, dataPath: p.options.dataPath, valueKey: p.options.valueKey, labelKey: p.options.labelKey } : undefined,
    })),
    rateLimit: e.rateLimit ?? null,
    plan: e.plan || 'free',
    premium: Boolean(e.premium),
    auth: e.auth !== false,
    dailyLimit: e.freeDailyLimit ?? 0,
    cache: e.cache ?? 0,
    sample: e.sample ?? null,
  }
}

export function buildCatalog(rawEndpoints, { sourceUrl = `${BASE_URL}/docs` } = {}) {
  const kept = []
  const dropped = []

  for (const e of rawEndpoints) {
    const reason = reasonExcluded(e)
    if (reason) dropped.push({ path: e.path, method: e.method, name: e.name, category: e.category, reason })
    else kept.push(slim(e))
  }

  kept.sort((a, b) => (a.category === b.category ? a.path.localeCompare(b.path) : a.category.localeCompare(b.category)))

  const categories = {}
  for (const e of kept) categories[e.category] = (categories[e.category] || 0) + 1

  return {
    meta: {
      name: 'HaidarApis',
      baseUrl: BASE_URL,
      source: sourceUrl,
      generatedAt: new Date().toISOString(),
      total: kept.length,
      totalRaw: rawEndpoints.length,
      excluded: dropped.length,
      categories,
    },
    endpoints: kept,
    dropped,
  }
}

async function main() {
  const url = `${BASE_URL}/docs`
  const res = await fetch(url, { headers: { accept: 'text/html', 'user-agent': 'NanoAi/1.0 (+catalog)' } })
  if (!res.ok) throw new Error(`Gagal mengambil ${url}: HTTP ${res.status}`)
  const html = await res.text()

  const raw = extractEndpoints(html)
  if (!raw.length) throw new Error('Katalog kosong — struktur halaman docs mungkin berubah.')

  const catalog = buildCatalog(raw)
  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 1))

  console.log(`katalog : ${catalog.meta.total} endpoint dipasang (dari ${catalog.meta.totalRaw} mentah)`)
  console.log(`dibuang : ${catalog.meta.excluded} endpoint (pembayaran, 18+, spam, data pribadi, dll.)`)
  console.log(`kategori: ${Object.entries(catalog.meta.categories).map(([k, v]) => `${k}=${v}`).join(' ')}`)
  console.log(`berkas  : ${path.relative(process.cwd(), OUT)}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error('GAGAL:', err.message)
    process.exit(1)
  })
}
