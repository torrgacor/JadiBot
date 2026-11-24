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
   Bagian "jalankan endpoint lalu balas ke WhatsApp" untuk HaidarApis.
   Dipakai plugins/haidar/haidar.js (.hai …) dan plugins/haidar/shortcut.js
   (.gpt, .cuaca, .gempa, …) supaya aturannya cuma ada di satu tempat:
   validasi parameter wajib, batas pemakaian, penyamaran kunci, pengiriman
   lampiran, dan seluruh teks balasan.
   ========================================================================== */

import fs from 'fs-extra'
import { isOwner } from './cek-akses.js'
import {
  BATAS_KIRIM,
  REGISTER_URL,
  callEndpoint,
  findEndpoint,
  findMedia,
  pickAnswer,
  readable,
  downloadMediaToFile,
  tebakTipe,
  missingRequired,
  parseParams,
  exampleCommand,
  getConfig,
  isProviderUrl,
  stripProviderUrls,
} from './haidar.js'

export const HEADER = '╭─〔 🌐 HAIDARAPIS 〕'
export const FOOTER = '╰──────────────╯'
const MAX_TEXT = 3400
const MAX_MEDIA = 2
/* Di atas ini WhatsApp mengecilkan/menolak kalau dikirim sebagai video/gambar —
   jadi berkasnya dikirim sebagai dokumen apa adanya. */
const BATAS_MEDIA_INLINE = 64 * 1024 * 1024
/* Di atas ini unduhannya bisa berjalan lama, jadi pengguna diberi kabar. */
const BATAS_KABARI_UNDUH = 20 * 1024 * 1024

const EKSTENSI = {
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
}

function namaBerkas(mimetype, sebutan = 'berkas') {
  const tipe = String(mimetype || '').split(';')[0].trim().toLowerCase()
  const ext = EKSTENSI[tipe]
  return ext ? `${sebutan}-${Date.now()}.${ext}` : `${sebutan}-${Date.now()}`
}

/* Tipe asli ditebak dari beberapa byte pertama berkasnya, bukan dari header
   content-type yang kadang cuma application/octet-stream. */
async function tebakTipeBerkas(berkas) {
  try {
    const handle = await fs.open(berkas, 'r')
    try {
      const head = Buffer.alloc(16)
      const { bytesRead } = await handle.read(head, 0, head.length, 0)
      return tebakTipe(head.subarray(0, bytesRead))
    } finally {
      await handle.close()
    }
  } catch {
    return ''
  }
}

function muatanLampiran(item, caption) {
  const nama = item.fileName || namaBerkas(item.ct)
  const isi = { url: item.file }
  const muatInline = item.bytes <= BATAS_MEDIA_INLINE

  if (item.kind === 'image' && muatInline) return { image: isi, caption }
  if (item.kind === 'video' && muatInline) return { video: isi, mimetype: item.ct || 'video/mp4', fileName: nama, caption }
  if (item.kind === 'audio' && muatInline) return { audio: isi, mimetype: item.ct || 'audio/mpeg', ptt: false, caption }
  return { document: isi, mimetype: item.ct || 'application/octet-stream', fileName: nama, caption }
}

export function box(lines) {
  return [HEADER, ...lines.map((l) => (l ? `│ ${l}` : '│')), FOOTER].join('\n')
}

export function cut(text, max = MAX_TEXT) {
  let out = stripProviderUrls(text)
  if (out.length <= max) return out
  return `${out.slice(0, max)}\n… (balasan dipotong)`
}

/*
  Gerbang akses bersama. Setelan bawaannya "semua" (siapa saja boleh pakai),
  tapi owner bisa membatasinya jadi "owner" saja supaya kuota kuncinya aman.
*/
export async function guardAkses(m, conn) {
  let owner = false
  try {
    owner = await isOwner(m.sender, conn)
  } catch {
    owner = false
  }
  if (getConfig().access === 'owner' && !owner) {
    await m.reply('🔒 Fitur ini sedang dibatasi hanya untuk owner bot.')
    return { owner, blocked: true }
  }
  return { owner, blocked: false }
}

/* ── batas pemakaian per pengguna ────────────────────────────────────────── */

const hits = new Map()

export function rateLimit(sender) {
  const limit = getConfig().perUserPerMinute
  const now = Date.now()
  const box_ = hits.get(sender) || { count: 0, reset: now + 60000 }
  if (now > box_.reset) {
    box_.count = 0
    box_.reset = now + 60000
  }
  box_.count++
  hits.set(sender, box_)
  return { allowed: box_.count <= limit, wait: Math.ceil((box_.reset - now) / 1000), limit }
}

/* ── teks balasan ────────────────────────────────────────────────────────── */

export function errorText(error, prefix = '.') {
  const lines = [`⚠️ ${String(error?.message || error)}`]
  if (error?.code === 'nokey') {
    lines.push(
      '',
      '*CARA AMBIL KUNCI (gratis)*',
      '1. Buka situs penyedia → daftar akun gratis',
      '2. Masuk Dashboard → API Keys → buat kunci baru',
      `3. Kirim ke bot: ${prefix}hai kunci haidarapis-xxxx`,
    )
  } else if (error?.code === 'unauthorized') {
    lines.push('', `Perbarui kuncinya lewat: ${prefix}hai kunci <apikey>`)
  } else if (error?.code === 'forbidden') {
    lines.push('', 'Fitur ini butuh plan berbayar dari penyedianya, bukan salah kuncimu.')
  } else if (error?.code === 'ratelimit') {
    lines.push('', 'Tunggu beberapa detik lalu coba lagi.')
  } else if (error?.code === 'upstream') {
    lines.push('', 'Ini blokir dari sumber di balik penyedia, bukan kunci kita. Biasanya pulih sendiri — coba lagi beberapa saat lagi.')
  }
  return cut(lines.join('\n'))
}

/*
  Semua fitur HaidarApis: yang dikirim hanya isi balasannya. Tidak ada nama
  fitur, metode, kode HTTP, waktu, maupun catatan jalur — itu teks tambahan
  yang tidak berguna di chat.
  Balasan berkolom banyak (cuaca, game, OCR, dll) tetap ditampilkan sebagai
  "nama: isi" supaya datanya tidak hilang, tapi tanpa bungkus apa pun.
  Catatan jalur cadangan tetap dicatat, cuma di log bot — bukan di chat.
*/
export function resultText(result) {
  const { data } = result

  if (result.via) console.log(`[haidar] ${result.endpoint?.path} dialihkan ke ${result.via.path}`)

  const answer = pickAnswer(data)
  if (answer && !isProviderUrl(answer.value)) return cut(answer.value)

  const lines = readable(data, { maxLines: 55, skip: Object.values(result.params || {}) })
  return cut(lines.length ? lines.join('\n') : '(balasan kosong)')
}

/* Isi balasan untuk pesan berlampiran (gambar/video/berkas) — tanpa judul. */
function captionFor(result, media = []) {
  const { data } = result
  const answer = pickAnswer(data)
  /* Tautan yang sedang dikirim sebagai lampiran tidak perlu diulang lagi di
     caption — caption cukup memuat nama, ukuran, dan info berguna lain. */
  const skip = [...Object.values(result.params || {}), ...media.map((item) => item.url)]
  if (answer && !isProviderUrl(answer.value)) return cut(answer.value, 900)
  const lines = readable(data, { maxLines: 12, skip })
    /* Sisa tautan mentah (mis. kolom streamUrl yang tidak dikirim) dibuang:
       kalau berkasnya benar-benar terkirim, tautannya tidak ada gunanya lagi. */
    .filter((line) => !/:\s*https?:\/\//i.test(line))
  return lines.length ? cut(lines.join('\n'), 900) : ''
}

export async function sendMedia(conn, m, items, caption) {
  /* Diunduh dulu semuanya supaya tipe aslinya diketahui dari isinya — banyak
     endpoint mengirim tautan tanpa ekstensi (mis. proxy /ssstik/1234).
     Berkasnya mendarat di disk, bukan di RAM: video dari penyedia ini bisa
     ratusan MB sedangkan memori bot cuma beberapa GB tanpa swap. */
  const siap = []
  const gagal = []
  let sudahDikabari = false
  for (const item of items.slice(0, MAX_MEDIA)) {
    try {
      /* Berkas penyedia downloader bisa ratusan MB dan butuh beberapa menit.
         Pengguna dikabari sekali saja (lampiran pertama), bukan per berkas. */
      const unduhan = await downloadMediaToFile(item.url, {
        onMulai: async ({ bytes }) => {
          if (bytes < BATAS_KABARI_UNDUH || sudahDikabari) return
          sudahDikabari = true
          await m.reply(`⏳ Berkasnya ${(bytes / 1024 / 1024).toFixed(1)} MB — sedang diunduh, tunggu ya (jangan di-spam).`)
        },
      })
      /* Kalau penyedia cuma bilang octet-stream, tipe aslinya ditebak dari isi
         berkas — supaya video tidak terkirim sebagai dokumen. */
      const dariServer = String(unduhan.contentType || '')
      const generic = !dariServer || /^application\/(octet-stream|x-www-form-urlencoded)/i.test(dariServer)
      const ct = generic ? (await tebakTipeBerkas(unduhan.file)) || dariServer : dariServer
      const kind = /^image\//i.test(ct) ? 'image' : /^video\//i.test(ct) ? 'video' : /^audio\//i.test(ct) ? 'audio' : item.kind
      siap.push({ ...unduhan, url: item.url, ct, kind })
    } catch (err) {
      err.url = item.url
      gagal.push(err)
    }
  }

  /* Video sudah membawa suaranya, jadi trek audio terpisah tidak perlu dikirim. */
  const adaVideo = siap.some((x) => x.kind === 'video')
  const kirim = adaVideo ? siap.filter((x) => x.kind !== 'audio') : siap
  const dibuang = siap.filter((item) => !kirim.includes(item))

  let sent = 0
  try {
    for (const item of kirim) {
      await conn.sendMessage(m.chat, muatanLampiran(item, sent === 0 ? caption : ''), { quoted: m.raw })
      sent++
    }
  } finally {
    /* Berkas sementaranya selalu dibersihkan, termasuk saat pengiriman gagal. */
    for (const item of kirim.concat(dibuang)) await fs.remove(item.file).catch(() => {})
  }

  /* Yang gagal karena kelewat besar tetap dapat tautannya, jadi pengguna tidak
     kehilangan apa-apa selain lampirannya. */
  for (const err of gagal) {
    if (err?.code === 'toobig') {
      const mb = err.bytes ? `${(err.bytes / 1024 / 1024).toFixed(1)} MB` : 'melebihi batas'
      await m.reply(cut(`⚠️ Berkasnya ${mb} — terlalu besar untuk dikirim lewat WhatsApp (batas ${Math.round(BATAS_KIRIM / 1024 / 1024)} MB).\n\n🔗 ${err.url}`, 1200))
    } else {
      await m.reply(cut(`⚠️ Lampiran gagal diunduh (${String(err?.message || err).slice(0, 80)}).`, 200))
    }
  }

  return sent
}

/* ── susun parameter ─────────────────────────────────────────────────────── */

/* Nama parameter yang lazim menampung teks bebas dari pengguna. */
const TEXT_PARAMS = new Set([
  'message',
  'prompt',
  'query',
  'q',
  'text',
  'url',
  'link',
  'teks',
  'pesan',
  'nama',
  'name',
  'kata',
  'keyword',
  'kota',
  'city',
  'wilayah',
  'negara',
  'judul',
  'lagu',
  'kode',
  'alamat',
])

/*
  Teks sisa (yang bukan bentuk nama=nilai) dipakai mengisi parameter wajib
  pertama — jadi ".hai /ai/chatgpt halo dunia" sama dengan
  ".hai /ai/chatgpt message=halo dunia".
*/
export function resolveParams(endpoint, rest) {
  const { params, free } = parseParams(rest)
  let missing = missingRequired(endpoint, params)

  if (free && missing.length) {
    params[missing[0].name] = free
    missing.shift()
  } else if (free && !missing.length) {
    // tidak ada parameter wajib: taruh teks bebas di parameter yang paling
    // mungkin menerimanya (urut sesuai dokumentasi endpoint)
    const guess = (endpoint.params || []).find((p) => TEXT_PARAMS.has(String(p.name).toLowerCase()))
    if (guess && params[guess.name] === undefined) params[guess.name] = free
  }

  // Sebagian endpoint menulis alias di deskripsinya (mis. "Alias dari message"),
  // jadi prompt=… sama sahnya dengan message=…
  const provided = new Set(Object.keys(params))
  missing = missing.filter((p) => {
    const alias = (endpoint.params || []).find(
      (q) => provided.has(q.name) && new RegExp(`alias dari\\s+${p.name}\\b`, 'i').test(String(q.description || '')),
    )
    return !alias
  })

  return { params, missing }
}

/*
  Isi parameter wajib yang belum ada memakai nilai contoh dari dokumentasi.
  Dipakai pintasan seperti ".gempa" dan ".tekateki" yang sering cuma punya
  satu parameter wajib berupa kata kunci.
*/
export function fillFromExample(endpoint, params, target) {
  const next = { ...params }
  const wanted = target
    ? (endpoint.params || []).filter((p) => p.name === target)
    : (endpoint.params || []).filter((p) => p.required)

  for (const param of wanted) {
    if (next[param.name] !== undefined && next[param.name] !== '') continue
    if (param.example !== undefined && param.example !== null && String(param.example) !== '') {
      next[param.name] = param.example
    } else if (param.enum?.length) {
      next[param.name] = param.enum[0]
    }
  }
  return next
}

/* ── jalankan ────────────────────────────────────────────────────────────── */

export async function execute(m, conn, endpoint, params, prefix = '.') {
  const limit = rateLimit(m.sender)
  if (!limit.allowed) {
    await m.reply(`⏳ Terlalu sering dipakai. Coba lagi ${limit.wait} detik lagi (batas ${limit.limit}×/menit).`)
    return { skipped: true }
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw?.key } }).catch(() => {})

  /* Endpoint pembuat media (video/gambar AI) butuh waktu lama — beri batas
     waktu lebih longgar daripada permintaan biasa, dan kabari pengguna
     kalau prosesnya molor. */
  const generator = /\b(image|video|img|vid|t2v|enhance|upscale|restore|animate|cartoon|toon)\b/i.test(
    `${endpoint.path} ${endpoint.name || ''}`,
  )
  const options = generator ? { timeout: 240000 } : {}
  const pembuatVideo = /\b(video|vid|t2v|animate)\b/i.test(endpoint.path)
  if (pembuatVideo) {
    await m.reply('⏳ Sedang membuat video… ini butuh waktu 1–3 menit, jangan di-spam ya.')
  }
  const result = await callEndpoint(endpoint, params, options)

  if (!result.ok) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.raw?.key } }).catch(() => {})
    await m.reply(errorText(result.error, prefix))
    return { failed: true, result }
  }

  const media = findMedia(result.data)
  if (media.length) {
    const terkirim = await sendMedia(conn, m, media, captionFor(result, media))
    /* Lampirannya ada tapi tidak satu pun berhasil dikirim (mis. kelewat
       besar) — kirim datanya sebagai teks supaya informasinya tidak hilang. */
    if (!terkirim) await m.reply(resultText(result))
  } else {
    await m.reply(resultText(result))
  }

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key } }).catch(() => {})
  return { ok: true, result }
}

/* Alur lengkap untuk perintah ".hai <path> [nama=nilai …]" */
export async function runEndpoint(m, conn, query, rest, prefix = '.') {
  const endpoint = findEndpoint(query)

  if (!endpoint) {
    await m.reply(`Endpoint *${query}* tidak ada di katalog.\nCari dulu: ${prefix}hai cari ${query}`)
    return
  }
  if (endpoint.ambiguous) {
    await m.reply(['Endpoint yang kamu maksud ada beberapa:', ...endpoint.ambiguous.map((e) => `▸ ${e.path} — ${e.name}`)].join('\n'))
    return
  }

  const { params, missing } = resolveParams(endpoint, rest)
  if (missing.length) {
    // Parameter berupa berkas (unggahan) tidak bisa dikirim dari chat — katakan
    // apa adanya supaya tidak bingung kenapa perintahnya "tidak jalan".
    const berkas = missing.filter(
      (p) => /^(file|image|audio|video|photo|foto)$/i.test(p.name) || /(unggah|upload|multipart|berkas|file )/i.test(String(p.description || '')),
    )
    await m.reply(
      [
        `⚠️ *${endpoint.name}* butuh parameter:`,
        ...missing.map((p) => `▸ ${p.name} — ${p.description || p.type}`),
        ...(berkas.length ? ['ℹ️ Parameter di atas butuh berkas yang diunggah, jadi belum bisa dari WhatsApp.', 'Isi pakai URL kalau endpoint menyediakan opsi url.'] : []),
        `Contoh: ${exampleCommand(endpoint, prefix, m.command)}`,
      ].join('\n'),
    )
    return
  }

  return execute(m, conn, endpoint, params, prefix)
}

export default {
  HEADER,
  FOOTER,
  box,
  cut,
  guardAkses,
  rateLimit,
  errorText,
  resultText,
  sendMedia,
  resolveParams,
  fillFromExample,
  execute,
  runEndpoint,
}
