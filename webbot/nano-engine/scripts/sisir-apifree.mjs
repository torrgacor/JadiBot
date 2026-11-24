/* ==========================================================================
   Penyisir API GRATIS: menguji SETIAP endpoint katalog TANPA kunci apa pun,
   lalu menandai mana yang benar-benar jalan tanpa kunci.

   Hasil penandaan dipakai dua hal:
     • generator perintah (scripts/generate-apifree-commands.mjs) — hanya
       endpoint `aktif: true` yang jadi perintah bot;
     • halaman .af penyedia — supaya angkanya jujur.

   Pemakaian:
     node scripts/sisir-apifree.mjs                 # sisir semua penyedia
     node scripts/sisir-apifree.mjs fareza          # satu penyedia saja
     node scripts/sisir-apifree.mjs --ulang         # ulang yang masih "ragu"
     node scripts/sisir-apifree.mjs --tandai        # tulis hasil ke katalog

   Variabel lingkungan:
     WAJIB=1      hanya isi parameter wajib (tanpa param gaya theme/format)
     LEBAR=3      berapa permintaan sekaligus (bawaan 6)
     JEDA_MS=250  jeda antar gelombang (bawaan 0)
   ========================================================================== */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCatalog } from '../lib/apifree.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CATALOG = path.join(ROOT, 'data', 'api-free.json')
const SISIR = path.join(ROOT, 'data', 'api-free-sisir.json')

/* Jawaban yang menandakan endpoint butuh kunci (bukan sekadar salah masukan). */
const KUNCI_RE = /(api[\s_-]?key|x-api-key|apikey|unauthor|invalid key|missing key|akses ditolak|forbidden|tidak memiliki akses)/i

/* Kategori yang memang tidak dipasang. */
const DIBUANG = new Set(['nsfw', 'bypass', 'bypascf'])
/* Kategori bertema pembayaran/pesanan — tidak dipasang. */
const BAYAR = new Set(['topup', 'gopayqris', 'paket', 'olshop', 'produk', 'keuangan'])
/* Endpoint yang bukan fitur untuk pengguna. */
const BUKAN_FITUR = new Set(['/', '/system/health'])
/*
  Fitur kembar: isinya sama tapi datang dari dua endpoint/penyedia berbeda.
  Cukup satu yang dipasang. Pemenangnya dipilih dari hasil uji langsung
  (yang lebih cepat & datanya lebih lengkap), bukan asal pilih.
*/
const DUPLIKAT = [
  {
    sebab: 'pembuat gambar brat',
    simpan: { provider: 'fareza', path: '/canvas/brat' }, // 0,8 detik
    buang: [{ provider: 'theresav', path: '/api/maker/brat' }], // 1,3 detik
  },
  {
    sebab: 'pembuat video brat',
    simpan: { provider: 'fareza', path: '/canvas/bratvid' }, // 0,9 detik
    buang: [{ provider: 'theresav', path: '/api/maker/bratvid' }], // 2,1 detik
  },
  {
    sebab: 'kartu Spotify',
    simpan: { provider: 'fareza', path: '/canvas/spotify' }, // 0,5 detik
    buang: [{ provider: 'fareza', path: '/canvas/spotify-card' }], // 2,8 detik
  },
  {
    sebab: 'unduh TikTok',
    simpan: { provider: 'fareza', path: '/download/tiktok-v2' }, // 1,1 detik, tanpa watermark
    nama: 'download-tiktok',
    buang: [
      { provider: 'fareza', path: '/download/tiktok' }, // 7,8 detik
      { provider: 'fareza', path: '/download/tiktok-v3' }, // tautan videonya kosong
    ],
  },
  {
    sebab: 'unduh YouTube',
    simpan: { provider: 'fareza', path: '/download/youtube' }, // jalan
    buang: [{ provider: 'fareza', path: '/download/youtube-v2' }], // gagal (Y2Mate)
  },
  {
    sebab: 'lirik lagu (yang Spotify minta album + durasi, tidak praktis di chat)',
    simpan: { provider: 'fareza', path: '/search/lirik' },
    buang: [{ provider: 'fareza', path: '/search/spotify-lyrics' }],
  },
]

/*
  Endpoint yang statusnya 200 tapi isinya selalu gagal saat diuji dengan
  masukan nyata. Format: 'penyedia:/path' → sebab.
*/
const TAK_BERFUNGSI = new Map([
  // 3 tautan berbeda (postingan & reels) semuanya "login wall"
  ['fareza:/download/instagram', 'Instagram memblokir pengambil datanya (login wall)'],
])

/* Endpoint bertema pesanan/pembayaran walau kategorinya lain. */
const BAYAR_PATH = new Set([
  '/request-costs',
  '/cekrole',
  '/checkme',
  '/role/check',
  '/topup/roles',
  '/gopayqris/status',
  '/topup/qris',
])

const HANYA_WAJIB = process.env.WAJIB === '1'
const JEDA = Number(process.env.JEDA_MS || 0)
const LEBAR = Number(process.env.LEBAR || 6)
const ULANG_MS = Number(process.env.ULANG_MS || 6000)

/* Param yang benar-benar diisi pengguna. Param gaya "theme/format/blur" dilewati
   supaya nilai ujinya tidak membuat endpoint menolak. */
const PARAM_MASUKAN = new Set([
  'text', 'teks', 'prompt', 'query', 'q', 'kata', 'keyword', 'judul', 'title', 'name', 'nama',
  'url', 'link', 'kota', 'city', 'username', 'user', 'id', 'param', 'search', 'cari', 'lagu', 'pesan', 'message',
])

const tunggu = (ms) => new Promise((r) => setTimeout(r, ms))

function nilaiUntuk(p) {
  const nama = String(p.name || '').toLowerCase()
  const tipe = String(p.type || '').toLowerCase()
  if (/url|link|uri/.test(nama)) return 'https://www.google.com'
  if (/email|mail/.test(nama)) return 'contoh@gmail.com'
  if (/kota|city|daerah/.test(nama)) return 'jakarta'
  if (/user|username|ig|instagram|tiktok|channel/.test(nama)) return 'instagram'
  if (/int|number|jumlah|limit|page|halaman|nomor|id$/i.test(tipe + nama)) return '1'
  return 'halo'
}

function susunUrl(e) {
  const url = new URL(e.full)
  for (const p of e.params || []) {
    if (HANYA_WAJIB && !p.required && !PARAM_MASUKAN.has(String(p.name).toLowerCase())) continue
    const v = p.example !== undefined && p.example !== null && p.example !== '' ? p.example : nilaiUntuk(p)
    url.searchParams.set(p.name, String(v))
  }
  return url.toString()
}

async function sekali(e) {
  const mulai = Date.now()
  try {
    const res = await fetch(susunUrl(e), {
      method: (e.method || 'GET').toUpperCase() === 'POST' ? 'POST' : 'GET',
      headers: { accept: 'application/json,image/*,*/*', 'user-agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    })
    const teks = await res.text()
    return { status: res.status, ms: Date.now() - mulai, cuplik: teks.slice(0, 200).replace(/\s+/g, ' ') }
  } catch (err) {
    return { status: 0, ms: Date.now() - mulai, cuplik: String(err?.message || err).slice(0, 120) }
  }
}

/* 429/503/timeout bukan jawaban akhir — tunggu lalu ulangi sekali. */
async function coba(e) {
  let r = await sekali(e)
  if (r.status === 429 || r.status === 503 || r.status === 0) {
    await tunggu(ULANG_MS)
    r = await sekali(e)
  }
  return r
}

function klasifikasi(e, r) {
  const pesan = r.cuplik || ''
  if (r.status === 0) return 'ragu'
  if (r.status === 401 || r.status === 403) return 'butuh-kunci'
  if (KUNCI_RE.test(pesan)) return 'butuh-kunci'
  if (r.status >= 200 && r.status < 300) return 'jalan'
  return 'ragu'
}

/* ── penandaan ───────────────────────────────────────────────────────────── */

export function tandai(endpoints, hasil) {
  for (const e of endpoints) {
    const uji = hasil[e.id]
    const kelas = uji?.kelas || 'belum'
    e.uji = uji ? { kelas, status: uji.status, ms: uji.ms } : { kelas: 'belum', status: 0, ms: 0 }

    if (DIBUANG.has(e.category)) {
      e.aktif = false
      e.alasan = 'dibuang'
    } else if (TAK_BERFUNGSI.has(`${e.provider}:${e.path}`)) {
      e.aktif = false
      e.alasan = 'tak-berfungsi'
      e.catatan = TAK_BERFUNGSI.get(`${e.provider}:${e.path}`)
    } else if (BAYAR_PATH.has(e.path)) {
      e.aktif = false
      e.alasan = 'bayar'
    } else if (BAYAR.has(e.category)) {
      e.aktif = false
      e.alasan = 'bayar'
    } else if (BUKAN_FITUR.has(e.path)) {
      e.aktif = false
      e.alasan = 'bukan-fitur'
    } else if (/upscale|upload|form file/i.test(`${e.path} ${e.description || ''}`)) {
      e.aktif = false
      e.alasan = 'perlu-berkas'
    } else if (kelas === 'butuh-kunci') {
      e.aktif = false
      e.alasan = 'butuh-kunci'
    } else if (kelas === 'jalan' && /"result"\s*:\s*\[\s*\]/.test(uji?.cuplik || '')) {
      /* Jawabannya 200 tapi isinya selalu daftar kosong — jangan dipasang. */
      e.aktif = false
      e.alasan = 'hasil-kosong'
    } else if (kelas === 'jalan') {
      e.aktif = true
      e.alasan = 'tanpa-kunci'
    } else if (kelas === 'ragu' && e.key?.mode === 'none') {
      /* Penyedia tanpa kunci: kegagalan uji hampir selalu karena nilai uji
         (url/tema palsu), bukan karena kuncinya. Tetap dipasang. */
      e.aktif = true
      e.alasan = 'tanpa-kunci'
    } else {
      e.aktif = false
      e.alasan = kelas === 'ragu' ? 'tak-terverifikasi' : 'belum-diuji'
    }

    /* Endpoint yang lolos tanpa kunci memang TIDAK butuh kunci, walau
       dokumentasi penyedianya menulis "apikey" untuk seluruh endpointnya. */
    if (e.aktif) e.wajibKunci = false
  }

  /* Fitur kembar: sisakan satu. */
  const cari = (acuan) => endpoints.find((e) => e.provider === acuan.provider && e.path === acuan.path)
  for (const grup of DUPLIKAT) {
    const simpan = cari(grup.simpan)
    if (!simpan || !simpan.aktif) {
      console.warn(`  ! duplikat dilewati (yang disimpan tidak aktif): ${grup.simpan.provider}${grup.simpan.path}`)
      continue
    }
    if (grup.nama) simpan.paksaNama = grup.nama
    simpan.duplikatDari = grup.buang.map((b) => `${b.provider}${b.path}`)
    for (const acuan of grup.buang) {
      const ep = cari(acuan)
      if (!ep) continue
      ep.aktif = false
      ep.alasan = 'duplikat'
      ep.duplikatDengan = `${simpan.provider}${simpan.path}`
    }
  }

  return endpoints
}

/* ── jalankan ────────────────────────────────────────────────────────────── */

const argumen = process.argv.slice(2)
const tandaiSaja = argumen.includes('--tandai')
const ulang = argumen.includes('--ulang')
const penyedia = argumen.filter((a) => !a.startsWith('--'))

const katalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'))
const semua = katalog.endpoints || []

if (!tandaiSaja) {
  const lama = fs.existsSync(SISIR) ? JSON.parse(fs.readFileSync(SISIR, 'utf8')) : {}
  const daftar = semua.filter((e) => {
    if (penyedia.length && !penyedia.includes(e.provider)) return false
    if (ulang && lama[e.id]?.kelas !== 'ragu') return false
    return true
  })

  const hasil = {}
  for (let i = 0; i < daftar.length; i += LEBAR) {
    const gelombang = daftar.slice(i, i + LEBAR)
    const nilai = await Promise.all(
      gelombang.map(async (e) => {
        const r = await coba(e)
        return [e.id, { ...r, kelas: klasifikasi(e, r) }]
      }),
    )
    for (const [id, v] of nilai) hasil[id] = v
    process.stdout.write(`  ${Math.min(i + LEBAR, daftar.length)}/${daftar.length}\r`)
    if (JEDA) await tunggu(JEDA)
  }

  fs.writeFileSync(SISIR, JSON.stringify({ ...lama, ...hasil }, null, 1))

  const hitung = {}
  for (const e of daftar) {
    const kelas = hasil[e.id]?.kelas || 'belum'
    hitung[e.provider] ||= {}
    hitung[e.provider][kelas] = (hitung[e.provider][kelas] || 0) + 1
  }
  console.log(`\n=== HASIL SISIR (${daftar.length} endpoint) ===`)
  for (const [p, v] of Object.entries(hitung)) console.log(`  ${p}: ${JSON.stringify(v)}`)
}

const hasil = fs.existsSync(SISIR) ? JSON.parse(fs.readFileSync(SISIR, 'utf8')) : {}
tandai(semua, hasil)

katalog.meta = {
  ...(katalog.meta || {}),
  aktif: semua.filter((e) => e.aktif).length,
  total: semua.length,
  disaringAt: new Date().toISOString(),
}
fs.writeFileSync(CATALOG, JSON.stringify(katalog, null, 1))

const perPenyedia = {}
for (const e of semua) {
  perPenyedia[e.provider] ||= { aktif: 0, total: 0 }
  perPenyedia[e.provider].total++
  if (e.aktif) perPenyedia[e.provider].aktif++
}
console.log(`\n=== PENANDAAN (${katalog.meta.aktif} aktif dari ${semua.length}) ===`)
for (const [p, v] of Object.entries(perPenyedia)) console.log(`  ${p}: ${v.aktif} aktif / ${v.total}`)
const sebab = {}
for (const e of semua) if (!e.aktif) sebab[e.alasan] = (sebab[e.alasan] || 0) + 1
console.log(`  tidak dipasang: ${JSON.stringify(sebab)}`)
