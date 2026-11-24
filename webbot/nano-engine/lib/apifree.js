/* ==========================================================================
   API GRATIS multi-penyedia — katalog, kunci, dan pemanggil.

   Berbeda dari HaidarApis (satu alamat), katalog ini berisi banyak penyedia
   sekaligus, jadi setiap endpoint menyimpan alamat lengkapnya sendiri dan
   aturan kuncinya (query / header / tanpa kunci).

   Katalog  : data/api-free.json          (dibuat scripts/generate-apifree-catalog.mjs)
   Perintah : data/api-free-commands.json (dibuat scripts/generate-apifree-commands.mjs)
   Kunci    : data/apifree-keys.json      ({ penyedia: kunci })
   ========================================================================== */

import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { readable, pickAnswer, findMedia, downloadMedia, unwrap, tebakTipe } from './haidar.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const CATALOG_FILE = path.join(DATA_DIR, 'api-free.json')
const COMMANDS_FILE = path.join(DATA_DIR, 'api-free-commands.json')
const KEYS_FILE = path.join(DATA_DIR, 'apifree-keys.json')

export const DEFAULT_TIMEOUT = Number(process.env.APIFREE_TIMEOUT_MS || 45000)

/*
  Kategori katalog → kategori menu bot.
  Beberapa kategori katalog sengaja disatukan supaya tidak muncul berkali-kali
  di menu: canvas + canvas-maker + maker + image semuanya jadi "image",
  berita + news jadi "news", dan seterusnya.
*/
export const KATEGORI_MENU = {
  ai: 'ai',
  anime: 'anime',
  manga: 'anime',
  downloader: 'download',
  games: 'game',
  news: 'news',
  berita: 'news',
  search: 'search',
  stalker: 'stalker',
  stalk: 'stalker',
  pinterest: 'stalker',
  cecan: 'stalker',
  islami: 'agama',
  quran: 'agama',
  kalender: 'agama',
  crypto: 'crypto',
  topup: 'topup',
  gopayqris: 'topup',
  paket: 'topup',
  olshop: 'topup',
  produk: 'topup',
  keuangan: 'topup',
  film: 'film',
  bioskop: 'film',
  iptv: 'film',
  video: 'film',
  spotify: 'music',
  youtube: 'download',
  image: 'image',
  canvas: 'image',
  'canvas-maker': 'image',
  maker: 'image',
  info: 'info',
  cuaca: 'info',
  transportasi: 'info',
  resep: 'info',
  kamus: 'info',
  pddikti: 'info',
  olahraga: 'info',
  alamat: 'info',
  /* kategori sisa yang dulu jadi menu sendiri-sendiri */
  umum: 'tools',
  misc: 'tools',
  utility: 'tools',
  tools: 'tools',
  appinfo: 'tools',
  internet: 'tools',
  seo: 'tools',
  stats: 'tools',
  user: 'tools',
  apikey: 'tools',
  premium: 'tools',
  jjcc: 'tools',
}

export function kategoriMenu(kategori) {
  const key = String(kategori || '').trim().toLowerCase()
  return KATEGORI_MENU[key] || key
}

export { readable, pickAnswer, findMedia, downloadMedia, unwrap, tebakTipe }

export class ApiFreeError extends Error {
  constructor(message, { code = 'error', status = 0, endpoint = null, provider = null } = {}) {
    super(message)
    this.name = 'ApiFreeError'
    this.code = code
    this.status = status
    this.endpoint = endpoint
    this.provider = provider
  }
}

/* ── katalog ─────────────────────────────────────────────────────────────── */

let katalogCache = null

export function loadCatalog(force = false) {
  if (katalogCache && !force) return katalogCache
  try {
    const json = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'))
    const endpoints = Array.isArray(json.endpoints) ? json.endpoints : []

    /* Path bisa kembar antar penyedia (mis. /news/detik ada di fareza dan
       ryhar), jadi satu kunci bisa berisi beberapa endpoint. Kunci
       "penyedia:path" selalu menunjuk satu endpoint. */
    const index = new Map()
    const tambah = (kunci, ep) => {
      const k = kunci.toLowerCase()
      const isi = index.get(k)
      if (!isi) index.set(k, [ep])
      else if (!isi.includes(ep)) isi.push(ep)
    }
    for (const ep of endpoints) {
      tambah(ep.path, ep)
      tambah(`${ep.provider}:${ep.path}`, ep)
      tambah(`/${ep.provider}${ep.path}`, ep)
      tambah(String(ep.id), ep)
    }
    katalogCache = { meta: json, endpoints, index }
  } catch {
    katalogCache = { meta: {}, endpoints: [], index: new Map() }
  }
  return katalogCache
}

/* Hanya endpoint yang sudah lolos penyisiran tanpa kunci (e.aktif === true). */
export function aktifList() {
  return loadCatalog().endpoints.filter((ep) => ep.aktif)
}

export function penyediaList() {
  const bucket = new Map()
  for (const ep of loadCatalog().endpoints) {
    const cur = bucket.get(ep.provider) || { provider: ep.provider, total: 0, aktif: 0, tanpaKunci: 0, hosts: new Set() }
    cur.total++
    if (ep.aktif) {
      cur.aktif++
      if (ep.key?.mode === 'none') cur.tanpaKunci++
      cur.hosts.add(new URL(ep.full).host)
    }
    bucket.set(ep.provider, cur)
  }
  return [...bucket.values()].map((p) => ({ ...p, hosts: [...p.hosts] }))
}

/* Kategori memakai nama kategori MENU, bukan nama kategori katalog, supaya
   satu kelompok fitur tidak muncul sebagai beberapa kategori terpisah. */
export function kategoriList() {
  const bucket = new Map()
  for (const ep of aktifList()) {
    const menu = kategoriMenu(ep.category)
    bucket.set(menu, (bucket.get(menu) || 0) + 1)
  }
  return [...bucket.entries()].map(([kategori, total]) => ({ kategori, total }))
}

export function byCategory(kategori) {
  const key = String(kategori || '').trim().toLowerCase()
  return aktifList().filter((ep) => kategoriMenu(ep.category) === key || String(ep.category).toLowerCase() === key)
}

/* Satu kunci index bisa berisi beberapa endpoint (path kembar antar penyedia). */
function dariIndex(kunci) {
  const isi = loadCatalog().index.get(String(kunci || '').trim().toLowerCase())
  if (!isi || !isi.length) return null
  if (isi.length === 1) return isi[0]
  // utamakan yang sudah lolos sisir & bisa dipakai tanpa kunci
  const pilihan = isi.find((ep) => ep.aktif && ep.key?.mode === 'none') || isi.find((ep) => ep.aktif)
  return pilihan || { ambiguous: isi.slice(0, 12) }
}

/*
  Cari endpoint. `provider` dipakai kalau pemanggilnya sudah tahu penyedianya
  (perintah hasil generate selalu tahu) — perlu, karena path bisa kembar.
*/
export function findEndpoint(query, provider = '') {
  if (query && typeof query === 'object' && query.full) return query
  const catalog = loadCatalog()
  const key = String(query || '').trim().replace(/\s+/g, ' ').toLowerCase()
  if (!key) return null

  if (provider) {
    const pasti = dariIndex(`${String(provider).toLowerCase()}:${key}`)
    if (pasti) return pasti
  }

  const langsung = dariIndex(key)
  if (langsung) return langsung

  const dashed = key.replace(/\//g, '-').replace(/^\/+/, '')
  const lewatDash = dariIndex(dashed)
  if (lewatDash) return lewatDash

  const hits = catalog.endpoints.filter(
    (ep) => ep.path.toLowerCase().includes(key) || ep.name.toLowerCase().includes(key) || String(ep.id).toLowerCase().includes(key),
  )
  if (hits.length === 1) return hits[0]
  return hits.length ? { ambiguous: hits.slice(0, 12) } : null
}

/* Cari endpoint tertentu milik satu penyedia (dipakai perintah hasil generate). */
export function findEndpointOf(provider, path_) {
  return dariIndex(`${String(provider).toLowerCase()}:${String(path_)}`) || findEndpoint(path_, provider)
}

export function searchEndpoints(query, limit = 25) {
  const key = String(query || '').trim().toLowerCase()
  if (!key) return []
  const scored = []
  for (const ep of aktifList()) {
    const hay = `${ep.path} ${ep.name} ${ep.description} ${ep.category} ${ep.provider}`.toLowerCase()
    let skor = 0
    if (ep.path.toLowerCase() === key) skor += 100
    if (ep.path.toLowerCase().includes(key)) skor += 40
    if (ep.name.toLowerCase().includes(key)) skor += 25
    if (hay.includes(key)) skor += 10
    if (skor) scored.push({ ep, skor })
  }
  return scored.sort((a, b) => b.skor - a.skor).slice(0, limit).map((s) => s.ep)
}

/* ── perintah (nama command per endpoint) ────────────────────────────────── */

let commandsCache = null

export function loadCommands(force = false) {
  if (commandsCache && !force) return commandsCache
  try {
    const json = JSON.parse(fs.readFileSync(COMMANDS_FILE, 'utf8'))
    const commands = Array.isArray(json.commands) ? json.commands : []
    commandsCache = {
      meta: json.meta || {},
      commands,
      renamed: json.renamed || [],
      byPath: new Map(commands.map((c) => [c.path, c])),
      byCommand: new Map(commands.map((c) => [String(c.command).toLowerCase(), c])),
    }
  } catch {
    commandsCache = { meta: {}, commands: [], renamed: [], byPath: new Map(), byCommand: new Map() }
  }
  return commandsCache
}

export function commandFor(endpointOrPath) {
  const p = typeof endpointOrPath === 'string' ? endpointOrPath : endpointOrPath?.path
  return p ? loadCommands().byPath.get(p) || null : null
}

/* ── kunci per penyedia ──────────────────────────────────────────────────── */

function readKeys() {
  try {
    const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'))
    return json && typeof json === 'object' ? json : {}
  } catch {
    return {}
  }
}

export function getKey(provider) {
  const keys = readKeys()
  const dariFile = String(keys[String(provider || '').toLowerCase()] || '').trim()
  if (dariFile) return dariFile
  const envName = `APIFREE_KEY_${String(provider || '').toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
  return String(process.env[envName] || '').trim()
}

export function semuaKunci() {
  const keys = readKeys()
  const out = {}
  for (const p of penyediaList()) out[p.provider] = String(keys[p.provider] || '').trim()
  return out
}

export async function saveKey(provider, apikey) {
  const nama = String(provider || '').trim().toLowerCase()
  const key = String(apikey || '').trim()
  if (!nama) throw new ApiFreeError('Nama penyedia kosong.', { code: 'noprovider' })
  if (key.length < 6 || !/^[A-Za-z0-9_.:-]+$/.test(key)) {
    throw new ApiFreeError('Format kunci tidak wajar.', { code: 'keyformat' })
  }
  const keys = readKeys()
  keys[nama] = key
  await fs.ensureDir(DATA_DIR)
  await fs.writeJson(KEYS_FILE, keys, { spaces: 2 })
  return { provider: nama, key }
}

export async function deleteKey(provider) {
  const keys = readKeys()
  delete keys[String(provider || '').toLowerCase()]
  await fs.ensureDir(DATA_DIR)
  await fs.writeJson(KEYS_FILE, keys, { spaces: 2 })
}

export function maskKey(key) {
  const v = String(key || '')
  if (!v) return ''
  return v.length <= 10 ? `${v.slice(0, 3)}…` : `${v.slice(0, 6)}…${v.slice(-4)}`
}

/* ── pemanggilan ─────────────────────────────────────────────────────────── */

function describeHttpError(status, payload, endpoint) {
  const pesan = payload?.error?.message || payload?.error || payload?.message || payload?.msg || ''
  const teks = typeof pesan === 'string' ? pesan : JSON.stringify(pesan || '')
  const key = endpoint?.key || {}

  if (status === 401 || status === 403) {
    if (/api.?key|apikey|unauthorized|akses ditolak|invalid key/i.test(teks) || key.mode !== 'none') {
      return new ApiFreeError(
        teks || `Penyedia ${endpoint?.provider} butuh kunci API untuk endpoint ini.`,
        { code: 'nokey', status, endpoint },
      )
    }
  }
  if (status === 429) return new ApiFreeError(teks || 'Kena batas kecepatan penyedia. Tunggu sebentar.', { code: 'ratelimit', status, endpoint })
  if (status === 404) return new ApiFreeError(teks || 'Endpoint tidak ditemukan di penyedia.', { code: 'notfound', status, endpoint })
  if (status >= 500) {
    const upstream = /cloudflare|security alert|block_device|just a moment/i.test(teks)
    return new ApiFreeError(teks || `Server penyedia bermasalah (HTTP ${status}).`, {
      code: upstream ? 'upstream' : 'server',
      status,
      endpoint,
    })
  }
  return new ApiFreeError(teks || `Permintaan gagal (HTTP ${status}).`, { code: 'http', status, endpoint })
}

export async function callEndpoint(endpointOrQuery, params = {}, { timeout = DEFAULT_TIMEOUT, provider = '' } = {}) {
  const found = findEndpoint(endpointOrQuery, provider)
  if (!found) throw new ApiFreeError(`Endpoint "${endpointOrQuery}" tidak ada di katalog.`, { code: 'unknown' })
  if (found.ambiguous) {
    throw new ApiFreeError(`Ada ${found.ambiguous.length} endpoint mirip: ${found.ambiguous.map((e) => e.path).join(', ')}`, {
      code: 'ambiguous',
    })
  }

  const endpoint = found
  const key = getKey(endpoint.provider)
  const keyMode = endpoint.key?.mode || 'none'
  const keyName = endpoint.key?.name || 'apikey'

  if (keyMode !== 'none' && !key && endpoint.wajibKunci !== false) {
    throw new ApiFreeError(
      `Penyedia *${endpoint.provider}* butuh kunci API untuk fitur ini. Simpan dulu: .af kunci ${endpoint.provider} <kunci>`,
      { code: 'nokey', endpoint, provider: endpoint.provider },
    )
  }

  const url = new URL(endpoint.full)
  const init = { method: endpoint.method, headers: { accept: 'application/json, */*', 'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36' }, redirect: 'follow' }

  if (endpoint.method === 'GET') {
    for (const [nama, nilai] of Object.entries(params || {})) {
      if (nilai === undefined || nilai === null || nilai === '') continue
      url.searchParams.set(nama, typeof nilai === 'object' ? JSON.stringify(nilai) : String(nilai))
    }
  } else {
    const body = {}
    for (const [nama, nilai] of Object.entries(params || {})) {
      if (nilai === undefined || nilai === null || nilai === '') continue
      body[nama] = nilai
    }
    init.headers['content-type'] = 'application/json'
    init.body = JSON.stringify(body)
    // sebagian penyedia tetap membaca parameter dari query walau method POST
    for (const [nama, nilai] of Object.entries(params || {})) {
      if (nilai === undefined || nilai === null || nilai === '') continue
      if (/-?(url|link|q|query|text|message|prompt)$/i.test(nama) && String(nilai).length < 300) url.searchParams.set(nama, String(nilai))
    }
  }

  if (keyMode === 'query' && keyName && key) url.searchParams.set(keyName, key)
  if (keyMode === 'header' && keyName && key) init.headers[keyName] = key

  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeout)
  const mulai = Date.now()
  let response
  try {
    response = await fetch(url, { ...init, signal: ac.signal })
  } catch (error) {
    clearTimeout(timer)
    if (error?.name === 'AbortError') {
      throw new ApiFreeError(`Penyedia tidak menjawab dalam ${Math.ceil(timeout / 1000)} detik.`, { code: 'timeout', endpoint })
    }
    throw new ApiFreeError(`Tidak bisa menghubungi ${url.host} (${String(error?.message || error).slice(0, 60)}).`, {
      code: 'network',
      endpoint,
    })
  } finally {
    clearTimeout(timer)
  }

  const contentType = response.headers.get('content-type') || ''
  let data = null
  let text = ''
  if (/^image\/|^audio\/|^video\/|application\/(octet-stream|pdf|zip)/i.test(contentType)) {
    data = { __media: url.toString(), __tipe: contentType }
  } else {
    text = await response.text()
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = { raw: text.slice(0, 4000) }
    }
  }

  const ms = Date.now() - mulai
  const ok = response.ok || (response.status === 200 && data !== null)

  return {
    endpoint,
    provider: endpoint.provider,
    ok,
    status: response.status,
    data,
    text,
    ms,
    url: url.toString().replace(/([?&](apikey|key|api_key)=)[^&]*/i, '$1***'),
    params,
    error: ok ? null : describeHttpError(response.status, data, endpoint),
  }
}

export async function callOrThrow(endpointOrQuery, params = {}, options = {}) {
  const hasil = await callEndpoint(endpointOrQuery, params, options)
  if (!hasil.ok) throw hasil.error
  return hasil
}

/* ── parameter ───────────────────────────────────────────────────────────── */

export function missingRequired(endpoint, params = {}) {
  return (endpoint?.params || []).filter((p) => p.required && (params[p.name] === undefined || params[p.name] === ''))
}

export function parseParams(input) {
  const text = Array.isArray(input) ? input.join(' ') : String(input || '')
  const params = {}
  const blok = []

  let sisa = text.replace(/\{[\s\S]*\}/g, (m) => {
    blok.push(m)
    return ' '
  })

  /* "nama=nilai" hanya dianggap parameter kalau namanya diawali spasi atau
     awal teks. Tanpa ini, URL seperti https://youtube.com/watch?v=abc ikut
     dipotong (v=abc dianggap parameter) sehingga url-nya rusak. */
  const re = /(^|\s)([A-Za-z0-9_.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s]+))/g
  let m
  while ((m = re.exec(sisa))) {
    const nama = m[2]
    let nilai = m[4] !== undefined ? m[4] : m[5] !== undefined ? m[5] : m[6]
    if (/^-?\d+(\.\d+)?$/.test(nilai)) nilai = Number(nilai)
    else if (nilai === 'true' || nilai === 'false') nilai = nilai === 'true'
    params[nama] = nilai
  }
  re.lastIndex = 0
  sisa = sisa.replace(re, (utuh, spasi) => spasi || '').trim()

  for (const b of blok) {
    try {
      Object.assign(params, JSON.parse(b))
    } catch {
      /* abaikan JSON tidak valid */
    }
  }

  return { params, free: sisa }
}

export function exampleCommand(endpoint, prefix = '.') {
  const cmd = commandFor(endpoint)?.command
  const wajib = (endpoint.params || []).filter((p) => p.required)
  const bagian = wajib.map((p) => {
    let nilai = p.example
    if (nilai === undefined || nilai === null || nilai === '') {
      if (p.enum?.length) nilai = p.enum[0]
      else if (p.type === 'number') nilai = 1
      else nilai = `<${p.name}>`
    }
    const teks = String(nilai)
    return p.type === 'number' || (!teks.includes(' ') && !teks.startsWith('<')) ? `${p.name}=${teks}` : `${p.name}="${teks}"`
  })
  return `${prefix}${cmd || 'af ' + endpoint.path}${bagian.length ? ' ' + bagian.join(' ') : ''}`.trim()
}

export function testProvider(provider) {
  const ep = loadCatalog().endpoints.find((x) => x.provider === provider)
  return ep ? { endpoint: ep, kunci: getKey(provider) } : null
}

export default {
  loadCatalog,
  aktifList,
  kategoriMenu,
  KATEGORI_MENU,
  penyediaList,
  kategoriList,
  byCategory,
  findEndpoint,
  findEndpointOf,
  searchEndpoints,
  loadCommands,
  commandFor,
  getKey,
  semuaKunci,
  saveKey,
  deleteKey,
  maskKey,
  callEndpoint,
  callOrThrow,
  missingRequired,
  parseParams,
  exampleCommand,
  testProvider,
  readable,
  pickAnswer,
  findMedia,
  downloadMedia,
}
