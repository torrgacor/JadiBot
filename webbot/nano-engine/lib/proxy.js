/* ── pool proxy gratis · proxifly/free-proxy-list ──────────────────────────
   Mengambil daftar proxy publik, menguji satu per satu (paralel), lalu
   menyimpan yang hidup. Dipakai lib/haidar.js untuk mencoba ulang permintaan
   yang gagal karena 403/429/5xx/network lewat jalur IP berbeda.

   Catatan jujur: proxy di sisi bot TIDAK bisa membuka blokir yang terjadi
   di server penyedia (mis. sumber anime menolak IP server penyedia).
   Ini membantu untuk: rate-limit per-IP (429), dan sumber yang memblokir
   IP server bot secara langsung.
─────────────────────────────────────────────────────────────────────────── */

import { ProxyAgent } from 'undici'
import fs from 'node:fs'
import path from 'node:path'

const LIST_URL =
  'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.json'

const PROBE_URL = 'https://www.gstatic.com/generate_204'
const PROBE_TIMEOUT = 5000 // ms per proxy
const PROBE_BATCH = 160 // berapa kandidat diuji tiap sesi
const PROXY_TIMEOUT = 9000 // ms per proxy saat dipakai sungguhan
const POOL_TARGET = 14 // berapa proxy hidup yang disimpan
const CACHE_TTL = 30 * 60 * 1000 // segarkan pool tiap 30 menit

const CACHE_FILE = path.join(process.cwd(), 'tmp', 'proxy-pool.json')

/* state pool ─ dipakai bersama semua request */
let pool = [] // [{ url, ms, country, agent }]
let cursor = 0
let refreshing = null // promise agar refresh tidak dobel
let lastRefresh = 0

/* ── penyimpanan aman (WebView/konteks terbatas tidak meledak) ──────────── */
function loadCache() {
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
    if (Array.isArray(raw?.pool) && Date.now() - raw.saved < CACHE_TTL * 2) {
      pool = raw.pool.filter((p) => p && typeof p.url === 'string').slice(0, POOL_TARGET)
      lastRefresh = raw.saved
    }
  } catch {
    /* belum ada cache — wajar */
  }
}

function saveCache() {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ saved: Date.now(), pool: pool.map(({ url, ms, country }) => ({ url, ms, country })) }),
    )
  } catch {
    /* gagal simpan tidak fatal */
  }
}

/* ── uji satu proxy: hidup = bisa menghubungi target HTTPS tepat waktu ──── */
async function probeOne(entry) {
  const agent = new ProxyAgent(entry.proxy)
  const t = Date.now()
  const res = await fetch(PROBE_URL, { dispatcher: agent, signal: AbortSignal.timeout(PROBE_TIMEOUT) })
  if (res.status !== 200 && res.status !== 204) throw new Error(`status ${res.status}`)
  return {
    url: entry.proxy,
    ms: Date.now() - t,
    country: entry.geolocation?.country || '',
    agent,
  }
}

/* ── ambil daftar kandidat & uji paralel ────────────────────────────────── */
async function probeList() {
  const res = await fetch(LIST_URL, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`daftar proxy HTTP ${res.status}`)
  const list = await res.json()

  const candidates = list
    .filter((p) => p && p.protocol === 'http' && typeof p.proxy === 'string')
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, PROBE_BATCH)

  const results = await Promise.allSettled(candidates.map(probeOne))
  const live = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .sort((a, b) => a.ms - b.ms)
    .slice(0, POOL_TARGET)

  return live
}

/* pastikan pool terisi — segera saat kosong, latar belakang saat kadaluarsa */
function ensurePool({ immediate = false, force = false } = {}) {
  const stale = force || Date.now() - lastRefresh > CACHE_TTL
  if (refreshing) return refreshing

  const needImmediate = immediate && pool.length === 0
  if (!needImmediate && !stale) return Promise.resolve()

  refreshing = (async () => {
    try {
      const live = await probeList()
      if (live.length) {
        pool = live
        cursor = 0
        lastRefresh = Date.now()
        saveCache()
      }
    } catch {
      /* jaringan lagi jelek — pakai pool lama saja */
    } finally {
      refreshing = null
    }
  })()

  return refreshing
}

/* ── ambil dispatcher proxy berikutnya yang masih hidup ─────────────────── */
export async function nextProxy() {
  loadCacheOnce()

  /* pool kosong → tunggu pengisian pertama (maks 15 dtk, tidak menggantung) */
  if (!pool.length) {
    const warming = ensurePool({ immediate: true })
    if (warming && typeof warming.then === 'function') {
      await Promise.race([warming, new Promise((r) => setTimeout(r, 15000))])
    }
  }

  if (!pool.length) return null

  /* rotasi bulat; proxy yang mati dibuang saat dipakai */
  const entry = pool[cursor % pool.length]
  cursor = (cursor + 1) % pool.length
  if (!entry.agent) entry.agent = new ProxyAgent(entry.url)
  return { entry, drop } // drop dipanggil penelepon kalau proxy terbukti gagal
}

/* buang proxy dari pool + picu pengisian ulang latar belakang */
function drop(entry) {
  const before = pool.length
  pool = pool.filter((p) => p.url !== entry.url)
  if (pool.length !== before && pool.length < POOL_TARGET) ensurePool()
}

/* tandai proxy berhasil — biarkan tetap di rotasi depan */
export function promote(entry) {
  if (!entry) return
  entry.ms = Math.max(1, entry.ms - 1)
}

/* ── fetch lewat satu proxy hidup, dengan retry antar-proxy ─────────────── */
export async function proxiedFetch(url, init = {}, { attempts = 3 } = {}) {
  let lastError = null

  for (let i = 0; i < attempts; i++) {
    const handle = await nextProxy()
    if (!handle) break

    try {
      const res = await fetch(url, {
        ...init,
        dispatcher: handle.entry.agent,
        signal: init.signal || AbortSignal.timeout(PROXY_TIMEOUT),
      })
      /* 429 = IP proxy kena limit juga → ganti proxy lain */
      if (res.status === 429) {
        drop(handle.entry)
        lastError = new Error(`proxy 429`)
        continue
      }
      promote(handle.entry)
      return res
    } catch (error) {
      lastError = error
      drop(handle.entry)
    }
  }

  throw lastError || new Error('pool proxy kosong')
}

/* ── segarkan pool sekarang juga ──────────────────────────────────────────
   Dipakai script `npm run proxy:update` (manual/cron) maupun saat butuh
   memaksa pembaruan di luar interval otomatis. Menulis ulang cache. */
export async function refreshPool() {
  loadCacheOnce()
  await ensurePool({ force: true })
  return poolStatus()
}

/* ── status pool untuk perintah diag ────────────────────────────────────── */
export function poolStatus() {
  return {
    total: pool.length,
    urls: pool.map((p) => ({ url: p.url, ms: p.ms, country: p.country })),
    lastRefresh: lastRefresh ? new Date(lastRefresh).toISOString() : null,
  }
}

let cacheLoaded = false
function loadCacheOnce() {
  if (cacheLoaded) return
  cacheLoaded = true
  loadCache()
}

/* Muat cache dulu (kalau masih segar, tidak perlu probe ulang), lalu panaskan
   pool di latar belakang supaya boot tidak terblokir jaringan. */
loadCacheOnce()
ensurePool()

/* penyegaran berkala aktif — pool tetap segar meski bot sedang senggang.
   Repo GitHub update ±3–5 jam sekali, tapi proxy gratis mati jauh lebih
   cepat, jadi 30 menit lebih tepat daripada mengikuti jeda commit. */
const REFRESH_INTERVAL = setInterval(() => ensurePool({ immediate: false }), CACHE_TTL)
if (typeof REFRESH_INTERVAL.unref === 'function') REFRESH_INTERVAL.unref()
