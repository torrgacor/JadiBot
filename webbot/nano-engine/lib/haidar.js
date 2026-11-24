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

/* ==========================================================================
   Klien HaidarApis (api.haidarxd.my.id)

   Katalog endpoint dibaca dari data/haidar-api.json — hasil dari
   scripts/generate-haidar-catalog.mjs, diambil langsung dari halaman docs
   penyedianya. Jadi daftar fiturnya tidak pernah ditulis manual di sini.

   Kunci API urutannya:
     1. .hai kunci <apikey>   → tersimpan di data/haidar-key.json
     2. HAIDAR_API_KEY        → environment variable
   ========================================================================== */

import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchBuffer, fetchToFile } from './http.js'
import { proxiedFetch } from './proxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const KEY_FILE = path.join(DATA_DIR, 'haidar-key.json')
const CATALOG_FILE = path.join(DATA_DIR, 'haidar-api.json')

export const BASE_URL = String(process.env.HAIDAR_BASE_URL || 'https://api.haidarxd.my.id').replace(/\/+$/, '')
export const DEFAULT_TIMEOUT = Number(process.env.HAIDAR_TIMEOUT_MS || 120000)
export const SITE = 'https://api.haidarxd.my.id'
export const REGISTER_URL = `${SITE}/register`

export class HaidarError extends Error {
  constructor(message, { code = 'error', status = 0, endpoint = null, plan = null } = {}) {
    super(message)
    this.name = 'HaidarError'
    this.code = code
    this.status = status
    this.endpoint = endpoint
    this.plan = plan
  }
}

/* ── katalog ─────────────────────────────────────────────────────────────── */

let catalogCache = null

export function loadCatalog(force = false) {
  if (catalogCache && !force) return catalogCache
  const raw = fs.readFileSync(CATALOG_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  const endpoints = Array.isArray(parsed.endpoints) ? parsed.endpoints : []
  const index = new Map()

  const add = (key, item) => {
    const k = String(key || '').trim().toLowerCase()
    if (k && !index.has(k)) index.set(k, item)
  }

  for (const ep of endpoints) {
    add(ep.full, ep)
    add(ep.path, ep)
    add(String(ep.path || '').replace(/^\//, ''), ep)
    add(String(ep.path || '').replace(/^\//, '').replace(/\//g, '-'), ep)
    add(String(ep.path || '').replace(/^\//, '').replace(/\//g, '_'), ep)
    add(ep.id, ep)
    add(ep.name, ep)
  }

  catalogCache = { meta: parsed.meta || {}, endpoints, dropped: parsed.dropped || [], index }
  return catalogCache
}

export function findEndpoint(query) {
  if (query && typeof query === 'object' && query.full) return query
  const catalog = loadCatalog()
  const key = String(query || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!key) return null
  if (catalog.index.has(key)) return catalog.index.get(key)

  const dashed = key.replace(/\//g, '-').replace(/^\/+/, '')
  if (catalog.index.has(dashed)) return catalog.index.get(dashed)

  const underscored = key.replace(/\//g, '_').replace(/^\/+/, '')
  if (catalog.index.has(underscored)) return catalog.index.get(underscored)

  // pencocokan sebagian: "chatgpt" -> /ai/chatgpt
  const hits = catalog.endpoints.filter(
    (ep) =>
      ep.path.toLowerCase().includes(key) ||
      ep.name.toLowerCase().includes(key) ||
      ep.path.toLowerCase().replace(/\//g, '-').includes(key),
  )
  if (hits.length === 1) return hits[0]
  return hits.length ? { ambiguous: hits.slice(0, 12) } : null
}

export function searchEndpoints(query, limit = 25) {
  const catalog = loadCatalog()
  const key = String(query || '').trim().toLowerCase()
  if (!key) return []
  const scored = []

  for (const ep of catalog.endpoints) {
    const haystack = `${ep.path} ${ep.name} ${ep.category} ${ep.description || ''}`.toLowerCase()
    const at = haystack.indexOf(key)
    if (at === -1) continue
    // yang cocok di path/nama didahulukan
    const priority = ep.path.toLowerCase().includes(key) ? 0 : ep.name.toLowerCase().includes(key) ? 1 : 2
    scored.push({ ep, score: priority * 1000 + at })
  }

  scored.sort((a, b) => a.score - b.score)
  return scored.slice(0, limit).map((item) => item.ep)
}

export function listCategories() {
  const catalog = loadCatalog()
  const map = new Map()
  for (const ep of catalog.endpoints) {
    if (!map.has(ep.category)) map.set(ep.category, 0)
    map.set(ep.category, map.get(ep.category) + 1)
  }
  return [...map.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
}

export function endpointsByCategory(category) {
  const catalog = loadCatalog()
  const key = String(category || '').trim().toLowerCase()
  return catalog.endpoints.filter((ep) => ep.category.toLowerCase() === key)
}

export function catalogMeta() {
  return loadCatalog().meta
}

export function droppedEndpoints() {
  return loadCatalog().dropped
}

/* ── daftar perintah (1 endpoint = 1 perintah) ──────────────────────────── */

const COMMANDS_FILE = path.join(DATA_DIR, 'haidar-commands.json')

let commandsCache = null

export function loadCommands() {
  if (commandsCache) return commandsCache
  try {
    const parsed = JSON.parse(fs.readFileSync(COMMANDS_FILE, 'utf8'))
    const list = Array.isArray(parsed.commands) ? parsed.commands : []
    commandsCache = {
      meta: parsed.meta || {},
      commands: list,
      renamed: parsed.renamed || [],
      byPath: new Map(list.map((item) => [item.path, item])),
      byCommand: new Map(list.map((item) => [item.command, item])),
    }
  } catch {
    commandsCache = { meta: {}, commands: [], renamed: [], byPath: new Map(), byCommand: new Map() }
  }
  return commandsCache
}

/* Nama perintah untuk sebuah endpoint (mis. .editimg-v1), atau null kalau belum dibuat. */
export function commandFor(endpointOrPath) {
  const path_ = typeof endpointOrPath === 'string' ? endpointOrPath : endpointOrPath?.path
  if (!path_) return null
  return loadCommands().byPath.get(path_) || null
}

/* ── kunci API ───────────────────────────────────────────────────────────── */

function readKeyFile() {
  try {
    const json = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'))
    const key = String(json?.apikey || '').trim()
    if (!key) return null
    return { apikey: key, savedAt: json.savedAt || null, label: json.label || '' }
  } catch {
    return null
  }
}

export function getKey() {
  const saved = readKeyFile()
  if (saved) return { key: saved.apikey, source: 'perintah', savedAt: saved.savedAt, label: saved.label }
  const env = String(process.env.HAIDAR_API_KEY || '').trim()
  if (env) return { key: env, source: 'environment', savedAt: null, label: '' }
  return { key: '', source: '', savedAt: null, label: '' }
}

function looksLikeKey(value) {
  const key = String(value || '').trim()
  return key.length >= 12 && /^[A-Za-z0-9_-]+$/.test(key)
}

export async function saveKey(apikey, { label = '' } = {}) {
  const key = String(apikey || '').trim()
  if (!looksLikeKey(key)) {
    throw new HaidarError('Format kunci tidak wajar. Contoh: haidarapis-xxxxxxxx', { code: 'keyformat' })
  }
  await fs.ensureDir(DATA_DIR)
  await fs.writeJson(KEY_FILE, { apikey: key, savedAt: new Date().toISOString(), label }, { spaces: 2 })
  return { key, source: 'perintah', savedAt: new Date().toISOString(), label }
}

export async function deleteKey() {
  await fs.remove(KEY_FILE)
}

export function maskKey(key) {
  const value = String(key || '')
  if (!value) return ''
  if (value.length <= 10) return `${value.slice(0, 3)}…`
  return `${value.slice(0, 12)}…${value.slice(-4)}`
}

/* ── setelan ─────────────────────────────────────────────────────────────── */

const CONFIG_FILE = path.join(DATA_DIR, 'haidar-config.json')
const DEFAULT_CONFIG = { access: 'semua', perUserPerMinute: 8, pakaiLimit: true, indoReply: true }

export function getConfig() {
  try {
    const json = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    return {
      ...DEFAULT_CONFIG,
      ...json,
      access: json?.access === 'owner' ? 'owner' : 'semua',
      perUserPerMinute: Number(json?.perUserPerMinute) > 0 ? Number(json.perUserPerMinute) : DEFAULT_CONFIG.perUserPerMinute,
      pakaiLimit: json?.pakaiLimit === false ? false : true,
      indoReply: json?.indoReply === false ? false : true,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export async function setConfig(patch = {}) {
  const next = { ...getConfig(), ...patch }
  await fs.ensureDir(DATA_DIR)
  await fs.writeJson(CONFIG_FILE, next, { spaces: 2 })
  return next
}

/* ── pemanggilan ─────────────────────────────────────────────────────────── */

export function redactUrl(url) {
  return String(url).replace(/([?&]apikey=)[^&]*/i, '$1***')
}

function describeHttpError(status, payload, endpoint) {
  const serverMessage = payload?.error?.message || payload?.message || payload?.msg || ''
  const plan = endpoint?.plan && endpoint.plan !== 'free' ? endpoint.plan : null

  if (status === 401) {
    return new HaidarError(
      serverMessage || 'Kunci API belum diisi atau tidak dikenali server.',
      { code: 'unauthorized', status, endpoint },
    )
  }
  if (status === 403) {
    return new HaidarError(
      serverMessage || `Endpoint ini butuh plan ${plan || 'berbayar'}.`,
      { code: 'forbidden', status, endpoint, plan },
    )
  }
  if (status === 429) {
    return new HaidarError(
      serverMessage || `Kena batas kecepatan (${endpoint?.rateLimit || 0} permintaan/menit). Tunggu sebentar.`,
      { code: 'ratelimit', status, endpoint },
    )
  }
  if (status === 404) {
    return new HaidarError(serverMessage || 'Endpoint tidak ada di server penyedia.', { code: 'notfound', status, endpoint })
  }
  if (status >= 500) {
    return new HaidarError(serverMessage || `Server penyedia sedang bermasalah (HTTP ${status}).`, { code: 'server', status, endpoint })
  }
  return new HaidarError(serverMessage || `Permintaan gagal (HTTP ${status}).`, { code: 'http', status, endpoint })
}

/* status yang layak dicoba ulang lewat proxy: blokir per-IP, limit per-IP,
   dan server penyedia yang rewel terhadap IP tertentu */
const RETRY_STATUS = new Set([403, 429, 500, 502, 503, 504])

/* satu percobaan ulang memakai pool proxy publik (lib/proxy.js) */
async function viaProxy(url, init, timeout) {
  const response = await proxiedFetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeout),
  })
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  return { response, data, text, ms: 0, url }
}

async function rawRequest(endpoint, params, { key, timeout = DEFAULT_TIMEOUT } = {}) {
  const apiKey = key !== undefined ? key : getKey().key
  const needsKey = endpoint.auth !== false

  if (needsKey && !apiKey) {
    throw new HaidarError(
      'Kunci API belum diatur. Ambil kuncinya di Dashboard penyedia, lalu kirim: .hai kunci <apikey>',
      { code: 'nokey', endpoint },
    )
  }

  const url = new URL(endpoint.full, BASE_URL)
  for (const [name, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(name, typeof value === 'object' ? JSON.stringify(value) : String(value))
  }
  if (needsKey && apiKey) url.searchParams.set('apikey', apiKey)

  const headers = { accept: 'application/json, */*' }
  const init = { method: endpoint.method, headers, redirect: 'follow' }

  if (endpoint.method === 'POST') {
    headers['content-type'] = 'application/json'
    init.body = JSON.stringify(params || {})
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const started = Date.now()

  const attempt = async (dispatcher) => {
    const ctl = dispatcher ? new AbortController() : controller
    const tmr = dispatcher ? setTimeout(() => ctl.abort(), timeout) : null
    try {
      const response = await fetch(url, {
        ...init,
        signal: ctl.signal,
        ...(dispatcher ? { dispatcher } : {}),
      })
      const text = await response.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = { raw: text }
      }
      return { response, data, text, ms: Date.now() - started, url }
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new HaidarError(`Permintaan melebihi ${Math.ceil(timeout / 1000)} detik. Endpoint ini memang lambat, coba lagi.`, {
          code: 'timeout',
          endpoint,
        })
      }
      throw new HaidarError(`Tidak bisa menghubungi ${BASE_URL}. Periksa koneksi server.`, { code: 'network', endpoint })
    } finally {
      if (tmr) clearTimeout(tmr)
    }
  }

  try {
    let result = await attempt()

    /* kena blokir per-IP (403) / limit per-IP (429) / server rewel (5xx) →
       coba sekali lagi lewat jalur proxy. Kalau proxy juga gagal, biarkan
       hasil langsung yang dipakai supaya pesan galatnya tetap jujur.
       403 "plan_required" = kunci memang tak termasuk plan (bukan blokir IP)
       → tidak perlu dicoba lewat proxy. */
    const planLocked = result.data?.error?.code === 'plan_required'
    if (!result.response.ok && !planLocked && RETRY_STATUS.has(result.response.status)) {
      const retry = await viaProxy(url, init, timeout).catch(() => null)
      if (retry?.response?.ok) result = { ...retry, viaProxy: true }
    }

    return result
  } finally {
    clearTimeout(timer)
  }
}

/* ── bahasa balasan ──────────────────────────────────────────────────────
  Semua percakapan AI dipaksa menjawab dengan bahasa Indonesia. Endpoint yang
  isinya bukan percakapan (lagu, suara, gambar) tidak disentuh supaya isinya
  tidak rusak — mis. prompt gambar tidak ikut ditempeli instruksi bahasa.
*/

const INDO_HINT = '(Jawab dalam bahasa Indonesia yang jelas dan santai, jangan pakai bahasa Inggris.)'

function isIndoReply() {
  return getConfig().indoReply !== false
}

function isNotConversation(endpoint, params) {
  // Patokan dari path, bukan nama — mis. "AISeek Chat & Image Gen" tetap
  // percakapan saat action=chat, jadi namanya tidak boleh jadi alasan.
  const path_ = String(endpoint?.path || '')
  if (/suno|text2speech|tts|vision|image|voice|audio|music|song/i.test(path_)) return true
  if (String(params?.action || '').toLowerCase() === 'image') return true
  return false
}

/* Sisipkan instruksi bahasa Indonesia ke parameter yang paling tepat. */
export function withIndonesian(endpoint, params = {}) {
  if (!endpoint || endpoint.category !== 'ai') return params
  if (!isIndoReply() || isNotConversation(endpoint, params)) return params

  const names = new Set((endpoint.params || []).map((p) => p.name))
  const next = { ...params }

  // 1) pakai parameter instruksi khusus kalau endpoint menyediakannya
  for (const slot of ['instruction', 'system', 'system_prompt']) {
    if (!names.has(slot)) continue
    const before = String(next[slot] || '').trim()
    if (/bahasa indonesia/i.test(before)) return next
    next[slot] = before ? `${before}. Jawab dalam bahasa Indonesia.` : 'Jawab dalam bahasa Indonesia.'
    return next
  }

  // 2) kalau tidak ada, tempelkan pada parameter teks utamanya
  const list = endpoint.params || []
  const target =
    list.find((p) => p.required && /^(message|prompt|question|query|text|chat)$/i.test(p.name)) ||
    list.find((p) => /^(message|prompt|question|query|text|chat)$/i.test(p.name))

  if (target && next[target.name] !== undefined && next[target.name] !== '') {
    const value = String(next[target.name])
    if (!/bahasa indonesia/i.test(value)) next[target.name] = `${value}\n\n${INDO_HINT}`
  }
  return next
}

/* ── cadangan otomatis ────────────────────────────────────────────────────
  Endpoint milik penyedia kadang diblokir oleh sumber di baliknya, mis.
  "Mimo upstream: Security Alert _[BLOCK_DEVICE]_". Kalau itu terjadi, perintah
  yang sama maknanya dicoba lewat jalur lain supaya tetap hidup — dan pengguna
  diberi tahu jalur mana yang akhirnya dipakai.
*/

const DEEPAI_DEEPSEEK_MODEL = 'deepseek-v3.2'

function deepseekModelToDeepai(model) {
  const value = String(model || '').trim().toLowerCase()
  if (value.endsWith('/deepseek-v3.2')) return 'deepseek-v3.2'
  return DEEPAI_DEEPSEEK_MODEL
}

const FALLBACKS = {
  '/ai/deepsek': [
    {
      path: '/ai/deepai',
      why: 'DeepAI · model deepseek-v3.2',
      map: (p) => ({ message: p.message, model: deepseekModelToDeepai(p.model) }),
    },
    {
      path: '/ai/aiseek',
      why: 'AISeek · model deepseek/deepseek-chat',
      map: (p) => ({ prompt: p.message, action: 'chat', model: 'deepseek/deepseek-chat' }),
    },
  ],
  '/ai/aimodel': [
    {
      path: '/ai/aiseek',
      why: 'AISeek · chat',
      map: (p) => ({ prompt: p.message || p.prompt, action: 'chat' }),
    },
    {
      path: '/ai/deepai',
      why: 'DeepAI · standard',
      map: (p) => ({ message: p.message || p.prompt }),
    },
  ],
}

/* Daftar jalur cadangan untuk sebuah endpoint (kosong kalau tidak ada). */
export function fallbackRoutes(endpoint) {
  const key = typeof endpoint === 'string' ? endpoint : endpoint?.path
  return key ? FALLBACKS[key] || [] : []
}

/* Benar kalau sumber di balik penyedia yang memblokir, bukan kunci kita. */
function isUpstreamBlock(result) {
  if (!result || result.response?.ok) return false
  const code = result.data?.error?.code || result.data?.code
  const message = `${result.data?.error?.message || result.data?.message || ''} ${result.text || ''}`
  return code === 'upstream_error' || /BLOCK_DEVICE|Security Alert|Mimo upstream/i.test(message)
}

export async function callEndpoint(endpointOrQuery, params = {}, options = {}) {
  const found = findEndpoint(endpointOrQuery)
  if (!found) {
    throw new HaidarError(`Endpoint "${endpointOrQuery}" tidak ada di katalog. Coba: .hai cari ${endpointOrQuery}`, {
      code: 'unknown',
    })
  }
  if (found.ambiguous) {
    throw new HaidarError(
      `Ada ${found.ambiguous.length} endpoint yang mirip: ${found.ambiguous.map((e) => e.path).join(', ')}`,
      { code: 'ambiguous' },
    )
  }

  const endpoint = found
  let result = await rawRequest(endpoint, withIndonesian(endpoint, params), options)
  let via = null

  if (isUpstreamBlock(result)) {
    for (const route of fallbackRoutes(endpoint)) {
      const alt = findEndpoint(route.path)
      if (!alt || alt.ambiguous) continue
      const altParams = withIndonesian(alt, route.map(params))
      if (missingRequired(alt, altParams).length) continue
      const attempt = await rawRequest(alt, altParams, options).catch(() => null)
      if (attempt?.response?.ok) {
        result = attempt
        via = { path: alt.path, name: alt.name, why: route.why }
        break
      }
    }
  }

  const { response, data, text, ms, url } = result
  const error = response.ok ? null : describeHttpError(response.status, data, endpoint)

  if (error && !via && isUpstreamBlock(result)) {
    error.code = 'upstream'
    error.blocked = true
  }

  return {
    endpoint,
    ok: response.ok,
    status: response.status,
    data,
    text,
    ms,
    url: redactUrl(url.toString()),
    via,
    params,
    error,
  }
}

/* ── jawaban utama ───────────────────────────────────────────────────────
  Sebagian endpoint membalas dengan banyak kolom (model, id, echo pertanyaan).
  Fungsi ini memilih kolom yang benar-benar jawaban supaya bisa ditampilkan
  langsung tanpa kolom teknis. "message" tidak dipakai karena biasanya cuma
  mengulang pertanyaan yang kita kirim.
*/

/* "jawaban"/"balasan" sengaja TIDAK dipakai: di fitur game kolom itu berisi
   kunci jawaban, jadi kalau dikirim sendirian permainannya rusak (soalnya hilang). */
const ANSWER_KEYS = ['reply', 'answer', 'response', 'ai_response', 'result', 'output', 'content', 'text']

export function pickAnswer(data) {
  const body = unwrap(data)
  if (!body || typeof body !== 'object') return null
  for (const key of ANSWER_KEYS) {
    const value = body[key]
    if (typeof value !== 'string') continue
    const teks = value.trim()
    if (teks.length <= 1) continue
    /* Tautan bukan "jawaban teks" — itu isi unduhan/gambar yang dikirim
       sebagai lampiran. Kalau gagal jadi lampiran, tautannya tetap muncul
       di balasan teks biasa. */
    if (/^https?:\/\//i.test(teks)) continue
    return { key, value: teks }
  }
  return null
}

export async function callOrThrow(endpointOrQuery, params = {}, options = {}) {
  const result = await callEndpoint(endpointOrQuery, params, options)
  if (!result.ok) throw result.error
  return result
}

/* ── parameter ───────────────────────────────────────────────────────────── */

export function missingRequired(endpoint, params = {}) {
  const list = Array.isArray(endpoint?.params) ? endpoint.params : []
  return list.filter((p) => p.required && (params[p.name] === undefined || params[p.name] === ''))
}

/* Ubah "prompt=halo dunia" "jumlah=2" jadi objek. Mendukung nilai JSON dan kutip. */
export function parseParams(input) {
  const text = Array.isArray(input) ? input.join(' ') : String(input || '')
  const params = {}
  const jsonBlocks = []

  let rest = text.replace(/\{[\s\S]*\}/g, (match) => {
    jsonBlocks.push(match)
    return ' '
  })

  /* "nama=nilai" hanya dianggap parameter kalau namanya diawali spasi atau
     awal teks. Tanpa ini, URL seperti https://youtu.be/x?v=abc ikut dipotong
     (v=abc dianggap parameter) sehingga url-nya rusak. */
  const re = /(^|\s)([A-Za-z0-9_.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s]+))/g
  let m
  while ((m = re.exec(rest))) {
    const name = m[2]
    let value = m[4] !== undefined ? m[4] : m[5] !== undefined ? m[5] : m[6]
    if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value)
    else if (value === 'true' || value === 'false') value = value === 'true'
    params[name] = value
  }

  re.lastIndex = 0
  rest = rest.replace(re, (utuh, spasi) => spasi || '').trim()

  for (const block of jsonBlocks) {
    try {
      Object.assign(params, JSON.parse(block))
    } catch {
      /* bukan JSON valid — diabaikan */
    }
  }

  return { params, free: rest }
}

/* ── hasil ───────────────────────────────────────────────────────────────── */

const MEDIA_EXT = /\.(jpe?g|png|webp|gif|bmp|mp4|mkv|mov|webm|mp3|m4a|wav|ogg|opus|pdf|apk|zip)(\?|$)/i
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp)(\?|$)/i
const VIDEO_EXT = /\.(mp4|mkv|mov|webm)(\?|$)/i
const AUDIO_EXT = /\.(mp3|m4a|wav|ogg|opus)(\?|$)/i

export function mediaKind(url) {
  const value = String(url || '')
  if (IMAGE_EXT.test(value)) return 'image'
  if (VIDEO_EXT.test(value)) return 'video'
  if (AUDIO_EXT.test(value)) return 'audio'
  if (MEDIA_EXT.test(value)) return 'file'
  return ''
}

/*
   Cari tautan media di dalam balasan JSON. Dipakai supaya hasil yang berupa
   gambar/video/audio bisa dikirim sebagai lampiran, bukan cuma teks.
*/
/* Nama kunci yang menandakan isinya media, dipakai kalau URL-nya tanpa ekstensi
   (banyak endpoint mengirim mis. /api/v1/img/abc123). */
function hintKind(keyName) {
  const key = String(keyName || '').toLowerCase()
  if (/(image|thumbnail|thumb|photo|gambar|foto|picture|poster|cover|screenshot)/.test(key)) return 'image'
  if (/(video|mp4|clip|reel)/.test(key)) return 'video'
  if (/(audio|mp3|voice|music|lagu|sound|murotal|song|tts)/.test(key)) return 'audio'
  if (/(pdf|document|apk|zip|file_url)/.test(key)) return 'file'
  /* Tautan hasil unduhan sering tanpa ekstensi (mis. proxy /ssstik/1234?st=…
     atau /v2?token=…), jadi nama kuncinya yang jadi patokan — termasuk
     bentuk camelCase seperti "downloadLink". Tipe aslinya tetap dicek dari
     content-type saat diunduh (lihat sendMedia). */
  if (/(download|unduh|watermark|result|hasil|media|file|berkas|stream)/.test(key)) return 'file'
  if (/(^|[_\-])(dl|hd|sd|src|play)($|[_\-])/.test(key) || /^(dl|hd|sd|src|play)[A-Z]/.test(keyName)) return 'file'
  return ''
}

/* Kunci yang menandakan varian kualitas (HD/SD, ada/tanpa watermark). */
const KUNCI_KUALITAS = /(^|[_\-])(hd|sd|low|high|watermark|wm|no_?watermark|nowatermark|wm_?free|360p?|480p?|720p?|1080p?)([_\-]|$)/i

/* Daftar putar HLS (.m3u8 / get_m3u8_stream_fast) bukan berkas utuh. Kalau
   ikut dikirim sebagai lampiran, pengguna cuma dapat berkas teks berisi
   potongan URL — jadi tidak pernah dianggap lampiran. */
const DAFTAR_PUTAR_RE = /\.m3u8|m3u8_stream|\/hls\//i

function skorKualitas(keyName) {
  const key = String(keyName || '').toLowerCase()
  if (/(no_?watermark|nowatermark|no_?wm|wm_?free)/.test(key)) return 3
  if (/(^|[_\-])(hd|high|1080p?|720p?)([_\-]|$)/.test(key)) return 2
  if (/(^|[_\-])(sd|low|360p?|480p?)([_\-]|$)/.test(key)) return 0
  if (/(^|[_\-])(watermark|wm)([_\-]|$)/.test(key)) return 0
  return 1
}

export function findMedia(data, { max = 4 } = {}) {
  const out = []
  const seen = new Set()

  const push = (url, hint = '', keyName = '') => {
    const value = String(url || '').trim()
    if (!/^https?:/i.test(value)) return
    if (DAFTAR_PUTAR_RE.test(value)) return
    if (seen.has(value) || out.length >= max) return
    const kind = mediaKind(value) || hint
    if (!kind) return
    seen.add(value)
    out.push({ url: value, kind, key: keyName })
  }

  const walk = (node, depth, keyName = '') => {
    if (out.length >= max || depth > 6 || node === null || node === undefined) return
    const hint = hintKind(keyName)
    if (typeof node === 'string') {
      if (/^https?:\/\//i.test(node) && (MEDIA_EXT.test(node) || hint)) push(node, hint, keyName)
      return
    }
    if (typeof node !== 'object') return
    if (Array.isArray(node)) {
      for (const item of node.slice(0, 10)) walk(item, depth + 1, keyName)
      return
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'apikey' || key === 'Author' || key === 'ApiCreator') continue
      walk(value, depth + 1, key)
    }
  }

  walk(data, 0)

  /* Kalau penyedia menyediakan beberapa varian (mis. hd dan sd), kirim yang
     terbaik saja — bukan keduanya. */
  const bervarian = out.filter((item) => KUNCI_KUALITAS.test(String(item.key || '')))
  if (bervarian.length > 1) {
    const terbaik = Math.max(...bervarian.map((item) => skorKualitas(item.key)))
    return out.filter((item) => !KUNCI_KUALITAS.test(String(item.key || '')) || skorKualitas(item.key) === terbaik)
  }
  return out
}

/*
  Tebak tipe berkas dari isinya. Banyak endpoint mengirim header
  content-type: application/octet-stream walau isinya video/audio/gambar —
  tanpa ini, videonya terkirim sebagai dokumen biasa.
*/
export function tebakTipe(buffer) {
  const b = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || '')
  if (b.length < 12) return ''
  const awal = b.subarray(0, 12).toString('latin1')
  if (awal.startsWith('\x89PNG')) return 'image/png'
  if (awal.startsWith('\xff\xd8\xff')) return 'image/jpeg'
  if (awal.startsWith('GIF8')) return 'image/gif'
  if (awal.startsWith('RIFF') && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp'
  if (b.subarray(4, 8).toString('latin1') === 'ftyp') return 'video/mp4'
  if (awal.startsWith('ID3')) return 'audio/mpeg'
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return 'audio/mpeg'
  if (awal.startsWith('OggS')) return 'audio/ogg'
  if (b.subarray(0, 4).toString('hex') === '1a45dfa3') return 'video/webm'
  if (awal.startsWith('%PDF')) return 'application/pdf'
  if (awal.startsWith('PK')) return 'application/zip'
  return ''
}

function shortValue(value, max = 300) {
  if (typeof value === 'boolean') return value ? 'ya' : 'tidak'
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') {
    const text = value.replace(/\s+/g, ' ').trim()
    if (/^data:/i.test(text)) return '[data tertanam]'
    // Tautan penyedia API bukan untuk diperlihatkan ke pengguna
    if (isProviderUrl(text)) return '-'
    // "2026-09-18T06:18:58.932Z" -> "2026-09-18 06:18"
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) return text.slice(0, 16).replace('T', ' ')
    if (text.length > max) return `${text.slice(0, max)}…`
    return text
  }
  return String(value)
}

/* Host penyedia HaidarApis — tautannya disaring dari semua balasan chat. */
export const PROVIDER_HOST_RE = /https?:\/\/[^\s/]*haidarxd\.my\.id[^\s]*/gi

export function isProviderUrl(text) {
  PROVIDER_HOST_RE.lastIndex = 0
  return PROVIDER_HOST_RE.test(String(text || ''))
}

/* Buang seluruh baris yang memuat tautan penyedia dari teks balasan. */
export function stripProviderUrls(text) {
  return String(text || '')
    .split('\n')
    .filter((line) => !isProviderUrl(line))
    .join('\n')
}

/* Nama kolom yang lebih enak dibaca di chat. */
const LABELS = {
  title: 'Judul',
  judul: 'Judul',
  name: 'Nama',
  nama: 'Nama',
  time: 'Waktu',
  date: 'Tanggal',
  published: 'Terbit',
  updated_at: 'Diperbarui',
  created_at: 'Dibuat',
  url: 'Tautan',
  link: 'Tautan',
  source: 'Sumber',
  sources: 'Sumber',
  author: 'Penulis',
  artist: 'Artis',
  album: 'Album',
  description: 'Deskripsi',
  desc: 'Deskripsi',
  image: 'Gambar',
  thumbnail: 'Gambar',
  thumb: 'Gambar',
  category: 'Kategori',
  duration: 'Durasi',
  size: 'Ukuran',
  lyrics: 'Lirik',
  results: 'Hasil',
  result: 'Hasil',
  data: 'Data',
  articles: 'Berita',
  items: 'Daftar',
  list: 'Daftar',
  views: 'Dilihat',
  quality: 'Kualitas',
  question: 'Pertanyaan',
  soal: 'Soal',
  jawaban: 'Jawaban',
  answer: 'Jawaban',
  reply: 'Jawaban',
  text: 'Isi',
  content: 'Isi',
  format: 'Format',
  region: 'Wilayah',
  city: 'Kota',
  kota: 'Kota',
  snippet: 'Cuplikan',
  tags: 'Tag',
  links: 'Tautan',
  username: 'Nama pengguna',
  followers: 'Pengikut',
  following: 'Mengikuti',
  posts: 'Postingan',
  likes: 'Suka',
  comments: 'Komentar',
  shares: 'Dibagikan',
  plays: 'Diputar',
  verified: 'Terverifikasi',
  bio: 'Bio',
  email: 'Surel',
  phone: 'Telepon',
  full_name: 'Nama lengkap',
  nickname: 'Nama panggilan',
  private: 'Privat',
  is_private: 'Privat',
  raw: 'Isi',
  berita: 'Judul',
  berita_url: 'Tautan',
  berita_thumb: 'Gambar',
  berita_diupload: 'Waktu',
  uploaded: 'Diunggah',
  /* Kolom camelCase dari penyedia downloader. */
  filename: 'Nama',
  filesize: 'Ukuran',
  size_str: 'Ukuran',
  downloadurl: 'Unduhan',
  download_url: 'Unduhan',
  finaldownloadurl: 'Unduhan',
  streamurl: 'Stream',
  stream_url: 'Stream',
  downloadsremaining: 'Sisa unduhan',
  resolution: 'Kualitas',
  type: 'Tipe',
  link_download: 'Unduhan',
  rating: 'Penilaian',
  episode: 'Episode',
  genre: 'Genre',
  status: 'Status',
}

/* Kolom teknis yang tidak ada gunanya ditampilkan ke pengguna. */
const NOISE_KEYS = new Set([
  'status',
  'success',
  'code',
  'total',
  'apicreator',
  'apikey',
  'cache',
  'cached',
  'elapsed',
  'execution_time',
  'process_time',
  'took',
  'updated_at',
  'created_at',
  'path',
  'time_zone',
  'adm4',
  'eventid',
  'session_id',
  'sessionid',
  'conversation_id',
  'conversationid',
  'message_id',
  'messageid',
  'parentmessageid',
  'deviceid',
  'chat_id',
  'chatid',
  'persona',
  'thinking',
  'web_search',
  'image_analyzed',
  'creator',
  'credit',
  'coded_by',
  'uuid',
  'request_id',
  'task_id',
])

/* "suhu_c", "kelembapan_persen" — isinya sama dengan kolom dasarnya. */
const DERIVED_SUFFIX = /_(c|persen|kmh|derajat|m|ms|sec|seconds)$/i
const TITLE_KEYS = ['title', 'judul', 'name', 'nama', 'question', 'soal', 'text', 'caption', 'berita']

function isBlank(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

function labelOf(key) {
  return LABELS[key] || LABELS[String(key).toLowerCase()] || key
}

function scalarEntries(obj, skip = []) {
  const keys = new Set(Object.keys(obj))
  const diabaikan = new Set(skip.map((v) => String(v).trim().toLowerCase()).filter(Boolean))
  const sudahAda = new Set()
  return Object.entries(obj).filter(([key, value]) => {
    if (NOISE_KEYS.has(String(key).toLowerCase())) return false
    if (isBlank(value)) return false
    if (typeof value === 'object') return false
    if (typeof value === 'string' && isProviderUrl(value)) return false
    if (DERIVED_SUFFIX.test(key) && keys.has(key.replace(DERIVED_SUFFIX, ''))) return false
    // jangan tampilkan lagi apa yang barusan diketik pengguna (echo "query: hebat")
    if (diabaikan.has(String(value).trim().toLowerCase())) return false
    /* Kolom kembar dalam satu objek cukup sekali: downloadUrl dan
       finalDownloadUrl biasanya berisi tautan yang sama persis. */
    const tanda = typeof value === 'string' ? value.trim().toLowerCase() : String(value)
    if (sudahAda.has(tanda)) return false
    sudahAda.add(tanda)
    return true
  })
}

/*
   Ubah balasan penyedia jadi bacaan yang rapi: daftar bernomor untuk kumpulan
   data, label bahasa Indonesia, dan kolom kosong/tidak penting dibuang.
*/
export function readable(data, { maxLines = 55, maxItems = 10, skip = [] } = {}) {
  const lines = []
  const add = (text) => {
    if (lines.length < maxLines) lines.push(text)
  }

  /* Daftar item (baik dari array maupun objek ber-kunci angka) ditampilkan
     sebagai daftar bernomor. */
  function renderItems(items, pad, depth) {
    items.slice(0, maxItems).forEach((item, index) => {
      if (index > 0) add('')
      const fields = scalarEntries(item, skip)
      const judul = TITLE_KEYS.map((k) => item[k]).find((v) => typeof v === 'string' && v.trim())
      // tanpa kolom judul, kolom pertama dipakai sebagai baris kepala
      const pakaiPertama = !judul && fields.length > 0
      const head = judul ? shortValue(judul, 220) : pakaiPertama ? shortValue(fields[0][1], 220) : ''
      add(`${pad}${index + 1}. ${head}`.trimEnd())
      for (const [key, value] of fields) {
        if (judul && TITLE_KEYS.includes(key)) continue
        if (pakaiPertama && key === fields[0][0]) continue
        add(`${pad}   ${labelOf(key)}: ${shortValue(value)}`)
      }
      for (const [key, value] of Object.entries(item)) {
        if (isBlank(value) || typeof value !== 'object' || Array.isArray(value)) continue
        add(`${pad}   ${labelOf(key)}:`)
        walk(value, `${pad}      `, depth + 2)
      }
    })
    if (items.length > maxItems) add(`${pad}… +${items.length - maxItems} lagi`)
  }

  function walk(node, pad, depth) {
    if (lines.length >= maxLines || depth > 3 || isBlank(node)) return

    if (Array.isArray(node)) {
      const sederhana = node.every((item) => item === null || typeof item !== 'object')
      if (sederhana) {
        add(`${pad}${node.slice(0, maxItems).map((v) => shortValue(v, 80)).join(', ')}`)
        return
      }
      renderItems(
        node.filter((item) => item && typeof item === 'object'),
        pad,
        depth,
      )
      return
    }

    if (typeof node === 'object') {
      const entries = Object.entries(node)

      /* Banyak penyedia mengirim daftar sebagai {"0": {…}, "1": {…}} — itu
         tetap daftar, jadi ditampilkan bernomor, bukan sebagai blok "0:". */
      const objek = entries.filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v))
      const berAngka = objek.filter(([k]) => /^\d+$/.test(k))
      if (berAngka.length >= 2 && berAngka.length === objek.length) {
        for (const [key, value] of scalarEntries(node, skip)) add(`${pad}${labelOf(key)}: ${shortValue(value)}`)
        if (lines.length) add('')
        renderItems(berAngka.map(([, v]) => v), pad, depth)
        return
      }

      const lists = entries.filter(([, v]) => Array.isArray(v) && v.some((x) => x && typeof x === 'object'))
      const nested = entries.filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v) && !isBlank(v))

      for (const [key, value] of scalarEntries(node, skip)) add(`${pad}${labelOf(key)}: ${shortValue(value)}`)

      // daftar isian sederhana (mis. tags: ["a", "b"]) — satu baris saja
      for (const [key, value] of entries) {
        if (!Array.isArray(value) || !value.length) continue
        if (!value.every((x) => x === null || typeof x !== 'object')) continue
        add(`${pad}${labelOf(key)}: ${value.slice(0, maxItems).map((v) => shortValue(v, 60)).join(', ')}`)
      }

      for (const [, value] of lists) {
        if (lines.length) add('')
        walk(value, pad, depth + 1)
      }

      for (const [key, value] of nested) {
        if (lines.length) add('')
        add(`${pad}${labelOf(key)}:`)
        walk(value, `${pad}  `, depth + 1)
      }
      return
    }

    add(`${pad}${shortValue(node)}`)
  }

  walk(Array.isArray(data) ? data : unwrap(data), '', 0)
  return lines
}

export function unwrap(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of ['result', 'data', 'results', 'hasil']) {
      if (data[key] !== undefined && Object.keys(data).length <= 4) return data[key]
    }
  }
  return data
}

/*
  Contoh pemakaian sebuah endpoint.

  Kalau `command` diisi (nama perintah yang sedang diketik pengguna), contohnya
  memakai perintah itu sendiri — ".terabox <url>", bukan jalur internal
  ".hai run /downloader/terabox url=<url>". Satu parameter wajib cukup ditulis
  nilainya saja karena teks bebas mengisi parameter wajib pertama (lihat
  resolveParams di haidar-aksi.js).
*/
export function exampleCommand(endpoint, prefix = '.', command = '', jalur = 'hai') {
  const required = (endpoint.params || []).filter((p) => p.required)

  const contohNilai = (p) => {
    let value = p.example
    if (value === undefined || value === null || value === '') {
      if (p.enum?.length) value = p.enum[0]
      else if (p.type === 'number') value = 1
      else value = `<${p.name}>`
    }
    return String(value)
  }

  const parts = required.map((p) => {
    const text = contohNilai(p)
    if (p.type === 'number' || (!text.includes(' ') && !text.startsWith('<'))) return `${p.name}=${text}`
    return `${p.name}="${text}"`
  })

  const nama = String(command || '').trim()
  if (nama) {
    const nilai = required.length === 1 ? contohNilai(required[0]) : ''
    /* Nilai ber-tanda '=' atau placeholder bisa salah dibaca sebagai nama
       parameter, jadi untuk kasus itu tetap pakai bentuk nama=nilai. */
    if (required.length === 1 && !nilai.startsWith('<') && !nilai.includes('=')) {
      return `${prefix}${nama} ${nilai}`.trim()
    }
    return `${prefix}${nama} ${parts.join(' ')}`.trim()
  }

  return `${prefix}${jalur} run ${endpoint.path} ${parts.join(' ')}`.trim()
}

export async function downloadMedia(url, { timeout = 60000, maxBytes = 45 * 1024 * 1024 } = {}) {
  return fetchBuffer(url, { timeout, maxBytes })
}

/* Batas kirim lampiran lewat WhatsApp. Di atas ini berkasnya tidak diunduh
   sama sekali — tautannya saja yang dikirim. */
export const BATAS_KIRIM = 1024 * 1024 * 1024

/*
  Berkas besar diunduh ke berkas sementara supaya memori bot tetap aman.
  Pemanggil wajib menghapus `file` setelah dikirim.
*/
export async function downloadMediaToFile(url, { timeout = 600000, maxBytes = BATAS_KIRIM, prefix = 'nano-hdr', onMulai = null } = {}) {
  return fetchToFile(url, { timeout, maxBytes, prefix, onMulai })
}

/* Endpoint ringan untuk menguji kunci: GET, perlu auth, tanpa parameter wajib. */
export function probeEndpoint() {
  const catalog = loadCatalog()
  const prefer = ['/info/bloxfruits-stok', '/info/kalender', '/random/waifu', '/news']
  for (const candidate of prefer) {
    const found = catalog.endpoints.find((ep) => ep.path === candidate)
    if (found) return found
  }
  return catalog.endpoints.find((ep) => ep.method === 'GET' && ep.auth && (ep.params || []).every((p) => !p.required)) || null
}

export async function testKey(key) {
  const endpoint = probeEndpoint()
  if (!endpoint) throw new HaidarError('Tidak ada endpoint uji di katalog.', { code: 'noprobe' })
  const result = await callEndpoint(endpoint, {}, { key })
  return { endpoint, ...result }
}

export default {
  BASE_URL,
  SITE,
  REGISTER_URL,
  PROVIDER_HOST_RE,
  isProviderUrl,
  stripProviderUrls,
  HaidarError,
  loadCatalog,
  loadCommands,
  commandFor,
  findEndpoint,
  searchEndpoints,
  listCategories,
  endpointsByCategory,
  catalogMeta,
  droppedEndpoints,
  getKey,
  saveKey,
  deleteKey,
  maskKey,
  getConfig,
  setConfig,
  callEndpoint,
  callOrThrow,
  parseParams,
  missingRequired,
  findMedia,
  readable,
  pickAnswer,
  withIndonesian,
  unwrap,
  exampleCommand,
  downloadMedia,
  testKey,
  probeEndpoint,
  redactUrl,
}
