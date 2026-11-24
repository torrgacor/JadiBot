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

/* Pinterest image search — .pins <query>
   Satu gambar per hasil dikirim sebagai kartu tombol; tombol NEXT /
   PREV / STOP menggeser hasil (id tombol ber-prefix supaya router
   mem-parsenya sebagai perintah .pins lagi).

   Pencarian memakai resource API Pinterest (BaseSearchResource).
   Catatan: endpoint WAJIB mengirim header lengkap (x-app-version,
   x-pinterest-*, x-requested-with) — tanpa itu Pinterest balas 403
   "Invalid Resource Request". Pakai got-scraping supaya fingerprint
   TLS-nya menyerupai browser. */

import { gotScraping } from 'got-scraping'
import { sendInteractive } from '../../lib/tombol.js'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0'
const TIMEOUT = 20_000
const TTL_SESI = 15 * 60 * 1000
const TTL_COOKIE = 10 * 60 * 1000
const MAKS_HASIL = 30

/* =========================================================
 * SESI — per user, per proses bot (RAM).
 * ========================================================= */
if (!global.pinSearchSession) global.pinSearchSession = {}

function ambilSesi(jid) {
  const sesi = global.pinSearchSession[jid]
  if (!sesi) return null
  if (Date.now() - sesi.dibuat > TTL_SESI) {
    delete global.pinSearchSession[jid]
    return null
  }
  return sesi
}

/* =========================================================
 * PENCARIAN — resource API Pinterest.
 * ========================================================= */
let cookieCache = { nilai: '', pada: 0 }

async function ambilCookie() {
  if (cookieCache.nilai && Date.now() - cookieCache.pada < TTL_COOKIE) {
    return cookieCache.nilai
  }
  const res = await gotScraping({
    url: 'https://id.pinterest.com/',
    throwHttpErrors: false,
    timeout: { request: TIMEOUT },
    headers: { 'user-agent': UA },
  })
  const setCookies = res.headers['set-cookie'] || []
  cookieCache = {
    nilai: setCookies.map((c) => String(c).split(';')[0]).join('; '),
    pada: Date.now(),
  }
  return cookieCache.nilai
}

function headerApi(cookie) {
  return {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': UA,
    'x-requested-with': 'XMLHttpRequest',
    'x-app-version': '8048c97',
    'x-pinterest-appstate': 'active',
    'x-pinterest-source-url': '/',
    'x-pinterest-pws-handler': 'www/index.js',
    'screen-dpr': '1.25',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    referer: 'https://id.pinterest.com/',
    ...(cookie ? { cookie } : {}),
  }
}

async function cariPinterest(query) {
  const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`
  const data = JSON.stringify({
    options: {
      query,
      scope: 'pins',
      appliedProductFilters: '---',
      source_url: sourceUrl,
      rs: 'typed',
      redux_normalize_feed: true,
    },
    context: {},
  })

  const coba = async (cookie) =>
    gotScraping({
      url:
        'https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=' +
        encodeURIComponent(sourceUrl) +
        '&data=' +
        encodeURIComponent(data) +
        '&_=' +
        Date.now(),
      throwHttpErrors: false,
      timeout: { request: TIMEOUT },
      headers: headerApi(cookie),
    })

  let cookie = await ambilCookie()
  let res = await coba(cookie)

  /* cookie kadaluarsa / ditolak → segarkan sekali lalu coba lagi */
  if (res.statusCode !== 200) {
    cookieCache = { nilai: '', pada: 0 }
    cookie = await ambilCookie()
    res = await coba(cookie)
  }

  if (res.statusCode !== 200) {
    throw new Error(`Pinterest menolak permintaan (HTTP ${res.statusCode}).`)
  }

  let json
  try {
    json = JSON.parse(String(res.body))
  } catch {
    throw new Error('Respons Pinterest bukan JSON.')
  }

  const hasil = (json?.resource_response?.data?.results || [])
    .map((pin) => {
      const gambar =
        pin?.images?.orig?.url || pin?.images?.['736x']?.url || pin?.images?.['236x']?.url
      if (!gambar) return null
      return {
        gambar,
        judul: pin?.grid_title || pin?.title || pin?.description || '',
        pembuat: pin?.pinner?.full_name || pin?.domain || '',
        tautan: pin?.link ? `https://id.pinterest.com${pin.link}` : '',
      }
    })
    .filter(Boolean)
    .slice(0, MAKS_HASIL)

  if (!hasil.length) throw new Error('Tidak ada gambar untuk kata kunci itu.')
  return hasil
}
async function ambilBufferGambar(url) {
  try {
    const res = await gotScraping({
      url,
      throwHttpErrors: false,
      timeout: { request: TIMEOUT },
      responseType: 'buffer',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        referer: 'https://www.pinterest.com/',
      },
    })
    if (res.statusCode !== 200) return null
    const buffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(String(res.body))
    return buffer.length > 1024 ? buffer : null
  } catch {
    return null
  }
}

function potong(teks, maks) {
  const isi = String(teks || '').replace(/\s+/g, ' ').trim()
  return isi.length > maks ? `${isi.slice(0, maks - 1)}…` : isi
}

/* =========================================================
 * KIRIM — kartu tombol berisi satu gambar.
 * ========================================================= */
async function kirimGambar(conn, m, sesi, prefix) {
  const pin = sesi.hasil[sesi.idx]
  const buffer = await ambilBufferGambar(pin.gambar)

  const baris = [
    `🔍 *${sesi.query}*`,
    `📸 Foto *${sesi.idx + 1}* dari *${sesi.hasil.length}*`,
  ]
  if (pin.judul) baris.push(`📌 ${potong(pin.judul, 90)}`)
  if (pin.pembuat) baris.push(`👤 ${potong(pin.pembuat, 50)}`)

  const buttons = [
    { label: '▶️ NEXT', id: `${prefix}pins next` },
    ...(sesi.idx > 0 ? [{ label: '◀️ PREV', id: `${prefix}pins prev` }] : []),
    { label: '✕ STOP', id: `${prefix}pins stop` },
  ]

  /* image: Buffer → jadi header asli; kalau gagal ambil, pakai URL
     (kartu tetap jalan dengan pratinjau URL). */
  await sendInteractive(
    conn,
    m.chat,
    {
      title: '📌 Pinterest',
      subtitle: sesi.query,
      body: baris.join('\n'),
      footer: 'Ketuk NEXT untuk foto berikutnya',
      image: buffer || pin.gambar,
      buttons,
    },
    { quoted: m.raw },
  )
}

/* =========================================================
 * HANDLER — .pins <query> | .pins next | .pins prev | .pins stop
 * ========================================================= */
const handler = async (m, { conn, usedPrefix = '.' }) => {
  const aksi = String(m.text || '').trim().toLowerCase()
  const sender = m.sender
  const sesi = ambilSesi(sender)

  if (aksi === 'stop' || aksi === 'selesai' || aksi === 'batal') {
    if (sesi) delete global.pinSearchSession[sender]
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      {
        text: sesi
          ? '✅ Pencarian Pinterest ditutup.'
          : 'ℹ️ Tidak ada pencarian Pinterest yang aktif.',
      },
      { quoted: m.raw },
    )
  }

  if (aksi === 'next' || aksi === 'lanjut') {
    if (!sesi) {
      m.limit?.fail()
      return conn.sendMessage(
        m.chat,
        { text: `ℹ️ Tidak ada hasil aktif. Jalankan ${usedPrefix}pins <kata kunci>.` },
        { quoted: m.raw },
      )
    }
    if (sesi.idx >= sesi.hasil.length - 1) {
      m.limit?.fail()
      return conn.sendMessage(
        m.chat,
        {
          text:
            `🏁 Ini foto terakhir dari *${sesi.hasil.length}* hasil untuk *${sesi.query}*.\n` +
            `Cari kata kunci lain dengan ${usedPrefix}pins <kata kunci>.`,
        },
        { quoted: m.raw },
      )
    }
    sesi.idx++
  } else if (aksi === 'prev' || aksi === 'sebelumnya') {
    if (!sesi || sesi.idx <= 0) {
      m.limit?.fail()
      return conn.sendMessage(m.chat, { text: 'ℹ️ Ini sudah foto pertama.' }, { quoted: m.raw })
    }
    sesi.idx--
  } else if (!aksi) {
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      {
        text:
          '🔎 *Pinterest Search*\n\n' +
          'Contoh:\n' +
          `${usedPrefix}pins anime wallpaper\n` +
          `${usedPrefix}pins financial landscape`,
      },
      { quoted: m.raw },
    )
  }

  try {
    const geser = ['next', 'lanjut', 'prev', 'sebelumnya'].includes(aksi)
    if (geser) {
      await kirimGambar(conn, m, sesi, usedPrefix)
    } else {
      await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.raw?.key } }).catch(() => {})
      const hasil = await cariPinterest(aksi)
      global.pinSearchSession[sender] = { query: aksi, hasil, idx: 0, dibuat: Date.now() }
      await kirimGambar(conn, m, global.pinSearchSession[sender], usedPrefix)
    }
    m.limit?.success()
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key } }).catch(() => {})
  } catch (error) {
    m.limit?.fail()
    console.error('[PINS SEARCH]', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw?.key } }).catch(() => {})
    await conn.sendMessage(
      m.chat,
      { text: `❌ Gagal mencari gambar.\n\n${error.message}` },
      { quoted: m.raw },
    )
  }
}

handler.command = /^(pins|pinsearch|psearch)$/i
handler.help = ['pins <kata kunci>', 'pins next', 'pins stop']
handler.usage = ['pins <kata kunci>']
handler.tags = ['search']
handler.category = 'search'
handler.description =
  'Cari gambar di Pinterest — kirim satu per satu, ada tombol NEXT/PREV/STOP'
handler.limitCommit = 'manual'

export default handler