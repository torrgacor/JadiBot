/* ==========================================================================
   Katalog API GRATIS (multi-penyedia) → data/api-free.json

   Hanya penyedia yang menyediakan daftar endpoint yang bisa dibaca mesin yang
   diambil di sini, supaya nama perintah & parameter tidak dikarang-karang:

     • api.theresav.biz.id/endpoints   → JSON terstruktur (kategori + parameter)
     • api.ryhar.my.id/docs            → JSON { plugins: [...] }
     • ytdlpyton.nvlgroup.my.id/openapi.json  → OpenAPI 3.1
     • api.fareza.eu.cc/openapi.json          → OpenAPI 3.0

   Jalankan: node scripts/generate-apifree-catalog.mjs
   ========================================================================== */

import fs from 'node:fs/promises'
import path from 'node:path'

const OUT = 'data/api-free.json'
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

async function ambil(url, ms = 45000) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      redirect: 'follow',
      headers: { accept: 'application/json, */*', 'user-agent': UA, 'accept-language': 'id-ID,id;q=0.9' },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return JSON.parse(text)
  } finally {
    clearTimeout(t)
  }
}

/* Nama parameter jadi huruf kecil semua supaya seragam. */
const wajib = (p) => p?.required === true
const contoh = (p) => p?.example ?? p?.schema?.example ?? p?.default ?? ''
const tipe = (p) => String(p?.type || p?.schema?.type || 'string').toLowerCase()

function rapikanParams(list, { buang = ['apikey', 'api_key', 'key'] } = {}) {
  return (Array.isArray(list) ? list : [])
    .filter((p) => p && p.name && !buang.includes(String(p.name).toLowerCase()))
    .map((p) => ({
      name: String(p.name),
      required: wajib(p),
      type: tipe(p),
      description: String(p.description || '').trim(),
      example: contoh(p) === '' ? '' : contoh(p),
      enum: Array.isArray(p.enum) ? p.enum : Array.isArray(p.schema?.enum) ? p.schema.enum : [],
    }))
}

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'umum'

const daftar = []

/* ── 1. theresav ─────────────────────────────────────────────────────────── */
async function theresav() {
  const data = await ambil('https://api.theresav.biz.id/endpoints')
  const base = 'https://api.theresav.biz.id'
  let n = 0
  for (const [kategori, isi] of Object.entries(data)) {
    for (const e of Array.isArray(isi) ? isi : []) {
      if (!e?.path) continue
      daftar.push({
        provider: 'theresav',
        id: `theresav:${e.path}`,
        name: String(e.name || e.path).trim(),
        path: e.path,
        full: base + e.path,
        method: String(e.method || 'GET').toUpperCase(),
        category: slug(e.category || kategori),
        description: String(e.desc || '').trim(),
        params: rapikanParams(e.params),
        key: { mode: 'query', name: 'apikey' },
        author: '',
      })
      n++
    }
  }
  return `theresav ${n}`
}

/* ── 2. ryhar ────────────────────────────────────────────────────────────── */
async function ryhar() {
  const data = await ambil('https://api.ryhar.my.id/docs')
  const base = 'https://api.ryhar.my.id'
  const list = Array.isArray(data?.plugins) ? data.plugins : []
  let n = 0
  for (const e of list) {
    const jalur = e?.endpoint
    if (!jalur) continue
    daftar.push({
      provider: 'ryhar',
      id: `ryhar:${jalur}`,
      name: String(e.name || jalur).trim(),
      path: jalur,
      full: base + jalur,
      method: String(e.method || 'GET').toUpperCase(),
      category: slug(e.category || 'umum'),
      description: String(e.deskripsi || '').trim(),
      params: rapikanParams(e.parameters),
      key: { mode: 'header', name: 'x-apikey' },
      author: '',
    })
    n++
  }
  return `ryhar ${n}`
}

/* ── 3 & 4. OpenAPI (nvlgroup, fareza) ───────────────────────────────────── */
async function openapi(provider, base, url) {
  const spec = await ambil(url)
  const paths = spec?.paths || {}
  let n = 0
  for (const [jalur, isi] of Object.entries(paths)) {
    for (const metode of ['get', 'post', 'put', 'delete']) {
      const op = isi?.[metode]
      if (!op) continue
      const tag = Array.isArray(op.tags) && op.tags.length ? op.tags[0] : 'umum'
      const paramsOpenapi = [
        ...(Array.isArray(op.parameters) ? op.parameters : []),
        ...(Array.isArray(isi.parameters) ? isi.parameters : []),
      ]
      const punyaKunciHeader = (op.security || spec.security || []).some((s) => s && (s.APIKeyHeader || s.ApiKeyAuth || s.apiKey))
      daftar.push({
        provider,
        id: `${provider}:${metode} ${jalur}`,
        name: String(op.summary || op.operationId || jalur).trim(),
        path: jalur,
        full: base.replace(/\/+$/, '') + jalur,
        method: metode.toUpperCase(),
        category: slug(tag),
        description: String(op.description || '').trim(),
        params: rapikanParams(paramsOpenapi),
        key: punyaKunciHeader ? { mode: 'header', name: 'X-API-Key' } : { mode: 'none', name: '' },
        author: '',
      })
      n++
    }
  }
  return `${provider} ${n}`
}

const catatan = []
for (const tugas of [
  ['theresav', theresav],
  ['ryhar', ryhar],
  ['nvlgroup', () => openapi('nvlgroup', 'https://ytdlpyton.nvlgroup.my.id', 'https://ytdlpyton.nvlgroup.my.id/openapi.json')],
  ['fareza', () => openapi('fareza', 'https://api.fareza.eu.cc', 'https://api.fareza.eu.cc/openapi.json')],
]) {
  try {
    const info = await tugas[1]()
    catatan.push(`✓ ${info}`)
  } catch (err) {
    catatan.push(`✗ ${tugas[0]}: ${err.message}`)
  }
}

/* Buang duplikat path per penyedia, dan endpoint yang tidak masuk akal. */
const unik = new Map()
for (const e of daftar) {
  const kunci = `${e.provider}|${e.method}|${e.path}`
  if (unik.has(kunci)) continue
  if (!/^\/[a-z0-9._\-/[\]]*$/i.test(e.path)) continue
  unik.set(kunci, e)
}
const akhir = [...unik.values()].sort((a, b) => a.provider.localeCompare(b.provider) || a.path.localeCompare(b.path))

const perPenyedia = {}
const perKategori = {}
for (const e of akhir) {
  perPenyedia[e.provider] = (perPenyedia[e.provider] || 0) + 1
  perKategori[e.category] = (perKategori[e.category] || 0) + 1
}

await fs.mkdir(path.dirname(OUT), { recursive: true })
await fs.writeFile(
  OUT,
  JSON.stringify(
    {
      dibuat: new Date().toISOString(),
      total: akhir.length,
      penyedia: perPenyedia,
      kategori: perKategori,
      endpoints: akhir,
    },
    null,
    1,
  ),
)

console.log(catatan.join('\n'))
console.log(`\nTOTAL ${akhir.length} endpoint → ${OUT}`)
console.log('per penyedia:', JSON.stringify(perPenyedia))
console.log('per kategori:', JSON.stringify(perKategori))
