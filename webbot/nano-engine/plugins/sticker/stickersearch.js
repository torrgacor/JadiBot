/*
⌬ Nano Ai · STICKER TELEGRAM SEARCH (SigStick)

  Cari dan kirim sticker pack dari Telegram via sigstick.com.

  Cara pakai:
    .stickersearch anya
    .sigstick blue archive
    → Muncul daftar pack, balas angka 1-10 untuk mengirim pack.

  Sumber: https://www.sigstick.com
*/

import axios from 'axios'

const baseURL = 'https://www.sigstick.com'

if (!global.sigstickSession) {
  global.sigstickSession = {}
}

const uaHeaders = {
  'user-agent':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const axiosInstance = axios.create({
  timeout: 20_000,
  headers: uaHeaders,
})

// ============================================================
// BUILD ID — di-cache 15 menit
// ============================================================
let cachedBuildId = null
let cachedBuildTime = 0

async function getBuildId() {
  if (cachedBuildId && Date.now() - cachedBuildTime < 15 * 60 * 1000) {
    return cachedBuildId
  }

  const { data: html } = await axiosInstance.get(`${baseURL}/stickers`)

  let match = html.match(/"buildId":"([a-zA-Z0-9_-]+)"/)
  if (!match?.[1]) {
    match = html.match(/data-build-id="([a-zA-Z0-9_-]+)"/)
  }

  if (!match?.[1]) throw new Error('Build ID tidak ditemukan.')

  cachedBuildId = match[1]
  cachedBuildTime = Date.now()
  return cachedBuildId
}

// ============================================================
// SEARCH
// ============================================================
async function searchPack(keyword) {
  const buildId = await getBuildId()
  const url = `${baseURL}/_next/data/${buildId}/stickers.json`

  const { data } = await axiosInstance.get(url, {
    params: { keyword },
    headers: {
      ...uaHeaders,
      'x-nextjs-data': '1',
      referer: `${baseURL}/stickers?keyword=${encodeURIComponent(keyword)}`,
    },
  })

  return data?.pageProps?.packs || []
}

// ============================================================
// GET PACK PAGE
// ============================================================
async function getPack(pack) {
  let url = ''

  if (pack.id) {
    url = `${baseURL}/pack/${pack.id}`
  } else if (pack.url) {
    url = pack.url
  }

  if (!url) throw new Error('URL pack tidak ditemukan.')

  const { data: html } = await axiosInstance.get(url)

  const regex = /https?:\/\/cdn2\.cdnstep\.com\/[^"'\\\s<>]+/g
  let urls = html.match(regex) || []

  urls = urls
    .map((u) =>
      u
        .replace(/\\u0026/g, '&')
        .replace(/\\u002F/g, '/')
        .replace(/\\\//g, '/'),
    )
    .filter((u) => /\.(webp|png|jpg|jpeg)(\?.*)?$/i.test(u))

  /* Halaman pack juga menanam URL pack terkait + og/cover/thumbnail.
     Saring dulu punya pack ini sendiri, lalu hanya stiker ukuran penuh
     `<indeks>.webp` — bukan `.thumbNN`, `cover-*`, atau `og-*`. */
  const idPack = pack.id || url.match(/\/pack\/([A-Za-z0-9_-]+)/)?.[1] || ''
  const milik = idPack ? urls.filter((u) => u.includes(`/${idPack}/`)) : []
  const kandidat = milik.length ? milik : urls

  let stickers = [
    ...new Set(kandidat.filter((u) => /\/\d+-\d+\.webp(\?.*)?$/i.test(u))),
  ]
  if (!stickers.length) {
    /* cadangan: webp apa pun selain thumbnail/cover */
    stickers = [
      ...new Set(
        kandidat.filter(
          (u) =>
            /\.webp(\?.*)?$/i.test(u) &&
            !/\.thumb\d+\./i.test(u) &&
            !/\/(og|cover)-/i.test(u),
        ),
      ),
    ]
  }

  /* urutkan: 0-1.webp, 1-1.webp, 2-1.webp, … */
  stickers.sort(
    (a, b) =>
      (parseInt(a.split('/').pop(), 10) || 0) -
      (parseInt(b.split('/').pop(), 10) || 0),
  )

  if (!stickers.length) throw new Error('URL sticker tidak ditemukan pada pack.')

  return { url, stickers }
}

// ============================================================
// HANDLER — .stickersearch / .sigstick / .stickerfind
// ============================================================
const handler = async (m, { conn, usedPrefix = '.' }) => {
  const query = String(m.text ?? '').trim()

  if (!query) {
    return m.reply(
      '🔎 *Sticker Search*\n\n' +
        'Contoh:\n' +
        `${usedPrefix}${m.command} anya\n` +
        `${usedPrefix}${m.command} blue archive`,
    )
  }

  try {
    conn.sendMessage(m.chat, { react: { text: '🔎', key: m.raw?.key } }).catch(() => {})

    const packs = await searchPack(query)

    if (!packs.length) {
      return m.reply(`❌ Tidak ada sticker pack untuk *${query}*.`)
    }

    const results = packs.slice(0, 10)

    // Simpan sesi pencarian per sender
    global.sigstickSession[m.sender] = results

    let teks =
      `╭─「 *SIGSTICK SEARCH* 」\n` +
      `│ 🔎 Query: *${query}*\n` +
      `│ 📦 Total: *${packs.length}*\n` +
      `╰────────────────\n\n`

    results.forEach((p, i) => {
      teks += `*${i + 1}. ${p.title || 'Tanpa Judul'}*\n`
      if (p.status) teks += ` Status: ${p.status}\n`
      if (p.id) teks += ` ID: ${p.id}\n`
      if (p.telegramUrl) teks += ` Telegram: ${p.telegramUrl}\n`
      teks += '\n'
    })

    teks += `Reply angka *1-${results.length}* untuk mengirim pack.`

    await m.reply(teks)
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key } }).catch(() => {})
  } catch (e) {
    console.error('[SIGSTICK SEARCH]', e)
    conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw?.key } }).catch(() => {})
    await m.reply(`❌ Gagal mencari sticker pack.\n\n${e.message}`)
  }
}

// ============================================================
// INTERCEPTOR — reply angka 1-10 tanpa prefix (handler.before)
//
// Signature engine: before(conn, raw, { chat, sender, isSelf })
// Return true = pesan dikonsumsi (router berhenti).
// ============================================================
handler.before = async function (conn, raw, { chat, sender }) {
  const session = global.sigstickSession?.[sender]
  if (!session) return false

  // Ekstrak teks dari pesan mentah
  const text = extractTextPesan(raw.message).trim()
  if (!text) return false

  // Hanya terima angka 1-10
  if (!/^(10|[1-9])$/.test(text)) return false

  const number = Number(text)
  const pack = session[number - 1]
  if (!pack) return false

  // Hapus sesi agar tidak merespons lagi
  delete global.sigstickSession[sender]

  // Buat objek m minimal untuk reply
  const m = { key: raw.key, chat, sender, raw, text }
  m.reply = async (t) => {
    const { sendStyledReply } = await import('../../lib/reply-style.js')
    return sendStyledReply(conn, chat, t, { originalMessage: raw })
  }

  await m.reply(`📦 Mengambil pack *${pack.title || 'Sticker Pack'}*...`)

  try {
    const result = await getPack(pack)
    const stickers = result.stickers || []

    if (!stickers.length) {
      await m.reply('❌ Sticker dalam pack tidak ditemukan.')
      return true
    }

    /* Batasi 30 sticker agar tidak terlalu berat.
       Bentuk pack ({ cover, stickers, name, publisher }) tidak didukung
       generateWAMessageContent di Baileys fork ini — jatuh ke
       prepareWAMessageMedia → "Invalid media type" — jadi kirim per sticker. */
    const limited = stickers.slice(0, 30)
    let terkirim = 0
    let gagal = 0
    let alasan = ''

    for (let i = 0; i < limited.length; i++) {
      try {
        await conn.sendMessage(
          chat,
          { sticker: { url: limited[i] }, mimetype: 'image/webp' },
          i === 0 ? { quoted: raw } : undefined,
        )
        terkirim++
      } catch (err) {
        gagal++
        alasan = err?.message || String(err)
        console.error('[SIGSTICK STICKER]', alasan)
      }
      if (i < limited.length - 1) await new Promise((r) => setTimeout(r, 400))
    }

    if (!terkirim) throw new Error(alasan || 'Tidak ada sticker yang terkirim.')
    const judul = pack.title || 'Sticker Pack'
    await m.reply(
      `✅ Pack *${judul}* terkirim: ${terkirim} sticker` +
        (gagal ? ` (${gagal} gagal: ${alasan})` : '') +
        '.',
    )
  } catch (e) {
    console.error('[SIGSTICK PACK]', e)
    await m.reply(`❌ Gagal mengambil sticker pack.\n\n${e.message}`)
  }

  return true
}

/* Ekstrak teks dari WAMessage mentah — interceptor berjalan sebelum router
   mengekstrak teks, jadi harus ekstrak sendiri. */
function extractTextPesan(message) {
  let current = message || {}
  for (let i = 0; i < 6; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return (
    current?.conversation ||
    current?.extendedTextMessage?.text ||
    current?.imageMessage?.caption ||
    current?.videoMessage?.caption ||
    ''
  )
}

// ============================================================
// METADATA
// ============================================================
handler.command = /^(stickersearch|stickerfind|sigstick)$/i
handler.help = ['stickersearch <keyword>', 'sigstick <keyword>']
handler.tags = ['sticker']
handler.category = 'sticker'
handler.description =
  'Cari sticker pack Telegram via SigStick — balas angka untuk mengirim pack'
handler.limit = true

export default handler
