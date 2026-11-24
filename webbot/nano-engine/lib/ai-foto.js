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

/*
  Helper AI foto bersama untuk plugin editfoto / upscale / paraloid / unblur.

  Dipindahkan dari plugins/tools/editfoto.js ke lib/ karena import antar-plugin
  terikat cache modul versi boot: hot-reload satu plugin membuat plugin lain
  yang mengimpornya melihat kode stale (terbukti saat upscale.js dilewati
  karena editfoto.js versi lama tidak punya export barunya). lib/ dimuat ulang
  hanya saat restart — jalur yang memang sudah jadi konvensi engine ini.
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { getAllOwnerNumbers } from './cek-akses.js'
import { proxiedFetch } from './proxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATA_DIR = process.env.NANO_DATA_DIR
  ? path.resolve(process.env.NANO_DATA_DIR)
  : path.join(__dirname, '..', 'data')

const MAX_UNDUH = 12 * 1024 * 1024

/* ================================================================
   Jalur HTTP backend AI — lewat pool proxy publik (lib/proxy.js).

   PhotoEditor AI membatasi permintaan per-IP, jadi .editfoto / .upscale
   dirutekan lewat pool proxy gratis (sumber GitHub, disaring hidup oleh
   lib/proxy.js) supaya limit tidak menempel ke satu IP server bot. Pool
   proxy gratis sering mati, jadi bila pool kosong atau semua proxy gagal
   permintaan jatuh kembali ke koneksi langsung agar perintah tetap jalan.
   ================================================================ */
async function fetchAi(url, init = {}) {
  try {
    return await proxiedFetch(url, init, { attempts: 3 })
  } catch {
    return fetch(url, init)
  }
}

/* ================================================================
   Status backend — dicatat setiap job agar dashboard owner bisa
   menampilkan kuota/health tanpa harus membuang job sendiri.
   ================================================================ */

const STATUS_STORE = path.join(DATA_DIR, 'ai-backend-status.json')

function muatStatus() {
  try {
    if (!fs.existsSync(STATUS_STORE)) return {}
    const parsed = JSON.parse(fs.readFileSync(STATUS_STORE, 'utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function simpanStatus(data) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const temp = STATUS_STORE + '.' + process.pid + '.tmp'
    fs.writeFileSync(temp, JSON.stringify(data, null, 2))
    fs.renameSync(temp, STATUS_STORE)
    return true
  } catch {
    return false
  }
}

/** Catat hasil job sebuah backend: { ok, code, message } → ai-backend-status.json */
export function catatStatus(backend, ok, info = {}) {
  try {
    const semua = muatStatus()
    const lama = semua[backend] || {}
    const now = Date.now()
    // `...lama` WAJIB: entri ini juga menyimpan bookkeeping lain seperti
    // noticeAt (throttle notifikasi kuota) yang tidak boleh hilang tiap job.
    semua[backend] = {
      ...lama,
      backend,
      ok: Boolean(ok),
      code: info.code ?? lama.code ?? null,
      message: String(info.message || '').slice(0, 300),
      checkedAt: now,
      lastSuccessAt: ok ? now : lama.lastSuccessAt ?? null,
      consecutiveFailures: ok ? 0 : Number(lama.consecutiveFailures || 0) + 1,
    }
    return simpanStatus(semua)
  } catch {
    return false
  }
}

/** Baca seluruh status backend (untuk pengujian / keperluan lokal). */
export function bacaStatus() {
  return muatStatus()
}

/* ================================================================
   Notifikasi kuota habis ke owner bot
   ================================================================ */

const JEDA_NOTIF_KUOTA = 6 * 60 * 60 * 1000

/** True bila pesan galat menunjukkan kuota backend habis (400005). */
export function adalahGalatKuota(pesan) {
  return /insufficient credits|400005/i.test(String(pesan || ''))
}

/** True bila notifikasi kuota backend ini belum dikirim dalam 6 jam terakhir. */
export function perluNotifKuota(backend) {
  const entry = muatStatus()[backend] || {}
  return Date.now() - Number(entry.noticeAt || 0) > JEDA_NOTIF_KUOTA
}

function tandaiNotifKuota(backend) {
  try {
    const semua = muatStatus()
    semua[backend] = { ...(semua[backend] || {}), backend, noticeAt: Date.now() }
    return simpanStatus(semua)
  } catch {
    return false
  }
}

/**
 * DM ke owner bot saat kuota backend AI habis — dibatasi 1 notifikasi per
 * 6 jam per backend supaya tidak membanjiri chat owner. Pengiriman dibungkus
 * try/catch: kegagalan notifikasi tidak boleh menggagalkan alur user.
 */
export async function beritahuOwnerKuota(conn, backend, detail = '') {
  if (!conn || !adalahGalatKuota(detail) || !perluNotifKuota(backend)) return false

  // Ditandai sebelum kirim agar kegagalan ganda tidak mengirim dua kali.
  tandaiNotifKuota(backend)

  const label =
    backend === 'photoeditor' ? 'PhotoEditor AI' : backend === 'faa' ? 'Faa AI' : backend
  const teks = [
    '╭─〔 ⚠️ KUOTA BACKEND AI 〕',
    '│',
    '│ Backend : ' + label,
    '│ Status  : KUOTA HABIS',
    detail ? '│ Pesan   : ' + String(detail).slice(0, 120) : '',
    '│',
    '│ Perintah .editfoto / .upscale akan',
    '│ gagal sampai kuota backend pulih.',
    '╰──────────────',
  ].filter(Boolean).join('\n')

  let terkirim = 0
  for (const nomor of getAllOwnerNumbers()) {
    try {
      await conn.sendMessage(nomor + '@s.whatsapp.net', { text: teks })
      terkirim += 1
    } catch (err) {
      console.error('[AI-FOTO] notif kuota ke ' + nomor + ' gagal:', err?.message || err)
    }
  }
  return terkirim > 0
}

/* ================================================================
   Riwayat job AI (untuk dashboard)
   ================================================================ */

const RIWAYAT_STORE = path.join(DATA_DIR, 'ai-job-history.jsonl')
const RIWAYAT_MAKS = 1000

/** Catat satu job AI — JSONL, dipangkas ke 1000 baris terakhir. */
export function catatRiwayat(entry = {}) {
  try {
    const baris = {
      at: Number(entry.at) || Date.now(),
      op: String(entry.op || 'editfoto'),
      backend: String(entry.backend || 'photoeditor'),
      ok: Boolean(entry.ok),
      code: entry.code ?? null,
      message: String(entry.message || '').slice(0, 200),
      ms: Number(entry.ms) || 0,
    }

    let semua = []
    try {
      semua = fs.readFileSync(RIWAYAT_STORE, 'utf8').split('\n').filter(Boolean)
    } catch {
      semua = []
    }
    semua.push(JSON.stringify(baris))
    if (semua.length > RIWAYAT_MAKS) semua = semua.slice(-RIWAYAT_MAKS)

    fs.mkdirSync(DATA_DIR, { recursive: true })
    const temp = RIWAYAT_STORE + '.' + process.pid + '.tmp'
    fs.writeFileSync(temp, semua.join('\n') + '\n')
    fs.renameSync(temp, RIWAYAT_STORE)
    return true
  } catch {
    return false
  }
}

/** Baca seluruh riwayat job (lokal). */
export function bacaRiwayat() {
  try {
    return fs
      .readFileSync(RIWAYAT_STORE, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((baris) => JSON.parse(baris))
  } catch {
    return []
  }
}

/* ================================================================
   Utilitas media
   ================================================================ */

export function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 10; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

/** Ambil gambar dari pesan saat ini atau pesan yang direply. */
export function cariGambar(m) {
  for (const msg of [m?.quotedMessage?.message, m?.currentMessage]) {
    const isi = unwrapMessage(msg)
    const key = m?.quotedMessage?.key || m?.raw?.key
    if (isi?.imageMessage) return { tipe: 'imageMessage', node: isi.imageMessage, key }
    /* dokumen berupa gambar juga diterima */
    if (isi?.documentMessage && /^image\//i.test(isi.documentMessage.mimetype || '')) {
      return { tipe: 'documentMessage', node: isi.documentMessage, key }
    }
    if (isi?.stickerMessage) return { tipe: 'stickerMessage', node: isi.stickerMessage, key, stiker: true }
  }
  return null
}

export function extDariMime(mimetype, fallback = 'jpg') {
  const mime = String(mimetype || '')
  if (/png/i.test(mime)) return 'png'
  if (/webp/i.test(mime)) return 'webp'
  if (/gif/i.test(mime)) return 'gif'
  if (/jpe?g/i.test(mime)) return 'jpg'
  return fallback
}

export async function unduhGambar(gambar, rawConn) {
  const buffer = await downloadMediaMessage(
    { key: gambar.key, message: { [gambar.tipe]: gambar.node } },
    'buffer',
    {},
    { logger: rawConn?.logger, reuploadRequest: rawConn?.updateMediaMessage }
  )
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('Gambar gagal diunduh.')
  if (buffer.length > MAX_UNDUH) throw new Error('Gambar terlalu besar (maks 12 MB).')
  return buffer
}

/** Unduh gambar dari URL yang dikirim user — supaya bisa ikut jalur multipart. */
export async function unduhUrl(url) {
  const res = await fetchAi(url, {
    headers: { 'user-agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`Gambar tidak bisa diunduh (HTTP ${res.status}).`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (!buffer.length) throw new Error('Gambar kosong.')
  if (buffer.length > MAX_UNDUH) throw new Error('Gambar terlalu besar (maks 12 MB).')
  const ext = extDariMime(res.headers.get('content-type'))
  return { buffer, ext }
}

/* ================================================================
   Host sementara (litterbox → uguu) — dipakai jalur Faa & fallback
   ================================================================ */

async function unggahLitterbox(buffer, ext) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('time', '1h')
  form.append('fileToUpload', new Blob([buffer]), `editfoto.${ext}`)
  const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
    method: 'POST',
    body: form,
    headers: { 'user-agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(60_000),
  })
  const teks = (await res.text()).trim()
  return /^https?:\/\//.test(teks) ? teks : null
}

async function unggahUguu(buffer, ext) {
  const form = new FormData()
  form.append('files[]', new Blob([buffer]), `editfoto.${ext}`)
  const res = await fetch('https://uguu.se/upload?output=json', {
    method: 'POST',
    body: form,
    headers: { 'user-agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(60_000),
  })
  const json = await res.json().catch(() => null)
  const url = json?.files?.[0]?.url
  return typeof url === 'string' && /^https?:\/\//.test(url) ? url : null
}

export async function unggah(buffer, ext) {
  const jalur = [unggahLitterbox, unggahUguu]
  for (const up of jalur) {
    try {
      const url = await up(buffer, ext)
      if (url) return url
    } catch (err) {
      console.error('[AI-FOTO] unggah gagal:', err?.message || err)
    }
  }
  throw new Error('Gagal mengunggah gambar ke server sementara.')
}

/* ================================================================
   Backend Faa (api-faa.my.id) — jalur cadangan
   ================================================================ */

const FAA_API = 'https://api-faa.my.id/faa/editfoto'
const TIMEOUT_API = 200_000

export async function editFoto(url, prompt) {
  const endpoint = `${FAA_API}?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(prompt)}`
  try {
    const res = await fetch(endpoint, {
      headers: { accept: '*/*', 'user-agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(TIMEOUT_API),
    })

    const tipe = res.headers.get('content-type') || ''

    if (res.ok && tipe.startsWith('image/')) {
      const buffer = Buffer.from(await res.arrayBuffer())
      if (!buffer.length) throw new Error('API mengembalikan gambar kosong.')
      catatStatus('faa', true, { code: res.status, message: 'ok' })
      return { buffer, mimetype: tipe.split(';')[0] || 'image/png' }
    }

    let pesan = `API gagal (HTTP ${res.status}).`
    try {
      const json = await res.json()
      pesan = json?.error || json?.message || json?.errors || pesan
      if (typeof pesan !== 'string') pesan = JSON.stringify(pesan)
    } catch {
      /* biarkan pesan default */
    }
    catatStatus('faa', false, { code: res.status, message: pesan })
    throw new Error(pesan)
  } catch (err) {
    if (!err?.message?.startsWith('API gagal')) {
      catatStatus('faa', false, { message: String(err?.message || err) })
    }
    throw err
  }
}

/* ================================================================
   Backend utama: PhotoEditor AI (photoeditorai.io) — multipart langsung
   ================================================================ */

const PE_API = 'https://api.photoeditorai.io/pe/photo-editor'
const PE_HEADERS = {
  Origin: 'https://photoeditorai.io',
  Referer: 'https://photoeditorai.io/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
}
const PE_POLL_MAX = 30
const PE_POLL_DELAY = 5_000

/* Nilai sah sesuai klien web photoeditorai.io (diekstrak dari bundle Nuxt). */
export const PE_RATIOS = [
  'match_input_image', '1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3',
  '21:9', '9:21', '5:4', '4:5', '4:1', '1:4', '8:1', '1:8',
]
export const PE_RESOLUSI = ['1K', '2K', '4K']

function productSerial() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let serial = ''
  for (let i = 0; i < 32; i++) serial += chars.charAt(Math.floor(Math.random() * chars.length))
  return serial
}

export async function editFotoPhotoEditor(buffer, prompt, opts = {}) {
  const ext = opts.ext || 'jpg'
  const ratio = opts.ratio || 'match_input_image'
  const resolution = String(opts.resolution || '1K').toUpperCase()
  if (!PE_RATIOS.includes(ratio)) throw new Error('Ratio tidak didukung: ' + ratio)
  if (!PE_RESOLUSI.includes(resolution)) throw new Error('Resolusi tidak didukung: ' + resolution)

  const serial = productSerial()
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'

  /* FormData bawaan Node + fetch (bukan paket form-data/axios) supaya bisa
     ikut dispatcher proxy dari lib/proxy.js; boundary multipart diurus fetch. */
  const form = new FormData()
  form.append('model_name', 'photoeditor_4.0')
  form.append('feature', 'photo_editor')
  form.append('target_images', new Blob([buffer], { type: mime }), `image-${Date.now()}.${ext}`)
  form.append('prompt', prompt)
  form.append('ratio', ratio)
  form.append('image_resolution', resolution)

  let create
  let createData = null
  try {
    create = await fetchAi(`${PE_API}/create-job`, {
      method: 'POST',
      body: form,
      headers: { ...PE_HEADERS, 'Product-Serial': serial },
      signal: AbortSignal.timeout(60_000),
    })
    createData = await create.json().catch(() => null)
  } catch (err) {
    catatStatus('photoeditor', false, { message: String(err?.message || err) })
    throw err
  }

  const code = createData?.code
  catatStatus('photoeditor', create.ok && code === 100000, { code, message: createData?.message || '' })

  if (!create.ok || code !== 100000) {
    throw new Error('PhotoEditor gagal membuat job: ' + (createData?.message || `HTTP ${create.status}`))
  }
  const jobId = createData.result?.job_id
  if (!jobId) throw new Error('PhotoEditor tidak mengembalikan job_id.')

  for (let i = 0; i < PE_POLL_MAX; i++) {
    await new Promise((resolve) => setTimeout(resolve, PE_POLL_DELAY))

    const res = await fetchAi(`${PE_API}/get-job/${jobId}?feature=photo_editor`, {
      headers: { ...PE_HEADERS, 'Product-Serial': serial },
      signal: AbortSignal.timeout(30_000),
    })
    const resData = await res.json().catch(() => null)
    if (!res.ok || resData?.code !== 100000) {
      throw new Error('PhotoEditor gagal membaca job: ' + (resData?.message || `HTTP ${res.status}`))
    }

    const result = resData.result || {}
    if (result.status === 2) {
      const url = Array.isArray(result.output) ? result.output[0] : result.output
      if (!/^https?:\/\//.test(String(url || ''))) throw new Error('PhotoEditor tidak mengembalikan URL hasil.')

      const img = await fetchAi(url, { signal: AbortSignal.timeout(60_000) })
      if (!img.ok) throw new Error('Gagal mengunduh hasil PhotoEditor (HTTP ' + img.status + ').')
      const out = Buffer.from(await img.arrayBuffer())
      if (!out.length) throw new Error('Hasil PhotoEditor kosong.')
      return { buffer: out, mimetype: 'image/png', url }
    }

    if (result.status === 3 || result.status === 4) {
      throw new Error('PhotoEditor job gagal: ' + (result.error || 'status ' + result.status))
    }
  }

  throw new Error('PhotoEditor kedaluwarsa — job belum selesai dalam batas waktu.')
}

/**
 * Terjemahkan galat backend ke pesan yang enak dibaca user — terutama kuota
 * (400005 Insufficient credits) yang perlu dikomunikasikan sebagai batas
 * backend, bukan kesalahan user.
 */
export function pesanGalatAi(pesan) {
  const teks = String(pesan || '')
  if (/insufficient credits|400005/i.test(teks)) {
    return 'Kuota backend AI sedang habis (Insufficient credits). Coba lagi nanti.'
  }
  if (/abort|timeout|timed out/i.test(teks)) {
    return '⏱️ Server AI terlalu lama merespons. Coba lagi sebentar lagi.'
  }
  return teks
}

/* ================================================================
   Parsing opsi .editfoto (--ratio / --res)
   ================================================================ */

/**
 * Opsi --ratio / --res dikeluarkan dari argumen sebelum prompt dibentuk.
 * Bentuk diterima: `--ratio 16:9`, `--ratio=16:9`, `--res 4K`, `--resolution=2K`.
 */
export function parseOpsiEdit(args) {
  const ops = { ratio: 'match_input_image', resolution: '1K' }
  const sisa = []
  const tokens = []

  for (const token of args) {
    const flag = /^--(ratio|res|resolution)=(.*)$/i.exec(String(token))
    if (flag) tokens.push('--' + flag[1].toLowerCase(), flag[2])
    else tokens.push(token)
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = String(tokens[i]).toLowerCase()
    if (token === '--ratio') {
      const value = String(tokens[++i] ?? '').trim().toLowerCase()
      if (value) ops.ratio = value
      continue
    }
    if (token === '--res' || token === '--resolution') {
      const value = String(tokens[++i] ?? '').trim().toUpperCase()
      if (value) ops.resolution = value
      continue
    }
    sisa.push(String(tokens[i]))
  }

  if (['match', 'auto', 'input', 'default', 'asli'].includes(ops.ratio)) ops.ratio = 'match_input_image'
  return { ops, sisa }
}

/* ================================================================
   Antrean serial + cooldown per user (untuk .upscale)
   ================================================================ */

/**
 * Satu worker, urutan FIFO: job AI berat tidak boleh berjalan berbarengan
 * (hemat kuota backend & tidak saling berebut). Kapasitas dibatasi supaya
 * antrean tidak pernah tumbuh tanpa batas.
 *
 * `masuk(fn)` mengembalikan Promise hasil fn; ditolak dengan pesan
 * 'ANTREAN_PENUH' bila kapasitas terlampaui. Tugas berjalan walau handler
 * pemanggil sudah selesai — hasilnya dikirim lewat fn sendiri.
 */
export function buatAntrean({ kapasitas = 8 } = {}) {
  const antrean = []
  let sibuk = false

  async function jalankan() {
    if (sibuk) return
    sibuk = true
    try {
      while (antrean.length) {
        const tugas = antrean.shift()
        try {
          tugas.hasilkan(await tugas.fn())
        } catch (err) {
          tugas.tolak(err)
        }
      }
    } finally {
      sibuk = false
    }
  }

  return {
    get panjang() {
      return antrean.length
    },
    get sedangJalan() {
      return sibuk
    },
    /** Posisi antrian berikutnya (1 = langsung jalan sekarang juga). */
    posisiBerikut() {
      return antrean.length + (sibuk ? 1 : 0) + 1
    },
    masuk(fn) {
      if (antrean.length >= kapasitas) return Promise.reject(new Error('ANTREAN_PENUH'))
      return new Promise((hasilkan, tolak) => {
        antrean.push({ fn, hasilkan, tolak })
        jalankan()
      })
    },
  }
}

const cooldown = new Map()

/** Sisa waktu cooldown dalam ms; 0 bila lolos. */
export function cekCooldown(key, durasiMs) {
  const terakhir = cooldown.get(key) || 0
  const sisa = terakhir + durasiMs - Date.now()
  return sisa > 0 ? sisa : 0
}

export function setCooldown(key) {
  cooldown.set(key, Date.now())
}

export default {
  catatStatus,
  bacaStatus,
  adalahGalatKuota,
  beritahuOwnerKuota,
  catatRiwayat,
  bacaRiwayat,
  cariGambar,
  unduhGambar,
  unduhUrl,
  extDariMime,
  unggah,
  editFoto,
  editFotoPhotoEditor,
  pesanGalatAi,
  parseOpsiEdit,
  buatAntrean,
  cekCooldown,
  setCooldown,
  PE_RATIOS,
  PE_RESOLUSI,
}
