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
⌬ Nano Ai · UNBLUR (AI)

  Tajamkan / hilangkan blur sebuah foto pakai layanan unblurimg.ai.
  Alur: foto → minta presigned URL (Next server action) → upload → proses
        → hasil dikirim sebagai foto.

  Cara pakai:
    .unblur                 (reply/kirim foto)
    .unblur <url gambar>

  Catatan: helper ambil-foto dipakai bersama .editfoto agar tidak duplikat.
*/

import { cariGambar, unduhGambar } from './editfoto.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const NEXT_ACTION = 'f5c9f94f5b370b337d1195b4e3e09f3fc73ce571'
const MAX_UNDUH = 12 * 1024 * 1024

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw?.key } })
  } catch {}
}

/* Ambil gambar dari sebuah URL (dipakai kalau user kirim link). */
async function unduhDariUrl(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Gagal mengunduh gambar (HTTP ${res.status}).`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (!buffer.length) throw new Error('Gambar dari link kosong.')
  if (buffer.length > MAX_UNDUH) throw new Error('Gambar terlalu besar (maks 12 MB).')
  return buffer
}

/* Proses unblur via unblurimg.ai. Mengembalikan URL hasil. */
async function prosesUnblur(buffer, mimetype = 'image/jpeg') {
  const fileId = Date.now().toString()

  const actionRes = await fetch('https://unblurimg.ai/', {
    method: 'POST',
    body: JSON.stringify([mimetype, buffer.length, fileId]),
    headers: {
      'Next-Action': NEXT_ACTION,
      'Content-Type': 'text/plain;charset=UTF-8',
      'User-Agent': UA,
    },
    signal: AbortSignal.timeout(60_000),
  })

  const teks = await actionRes.text()
  const matchUrl = teks.match(/"url":"(https:\/\/[^"]+)"/)
  const matchKey = teks.match(/"key":"([^"]+)"/)
  if (!matchUrl || !matchKey) {
    throw new Error('Gagal mendapatkan upload presigned URL dari unblurimg.ai')
  }

  const putUrl = matchUrl[1].replace(/\\u0026/g, '&')
  const objectKey = matchKey[1]

  const putRes = await fetch(putUrl, {
    method: 'PUT',
    body: buffer,
    headers: { 'Content-Type': mimetype },
    signal: AbortSignal.timeout(60_000),
  })
  if (!putRes.ok) throw new Error(`Gagal mengunggah gambar (HTTP ${putRes.status}).`)

  const processRes = await fetch('https://unblurimg.ai/api/smart-tools/unblur-image', {
    method: 'POST',
    body: JSON.stringify({ originImageUrl: objectKey }),
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://unblurimg.ai',
      Referer: 'https://unblurimg.ai/',
      'User-Agent': UA,
    },
    signal: AbortSignal.timeout(120_000),
  })

  const json = await processRes.json().catch(() => null)
  if (!json || json.code !== 0 || !json?.data?.generatedImageUrl) {
    throw new Error(json?.message || 'Gagal memproses unblur gambar')
  }

  return {
    original: json.data.originImageUrl,
    result: json.data.generatedImageUrl,
  }
}

/* Unduh hasil ke buffer supaya pengiriman tidak bergantung pada hotlink URL. */
async function ambilHasil(url) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(60_000),
    })
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    return buffer.length ? buffer : null
  } catch {
    return null
  }
}

const handler = async (m, { conn, rawConn }) => {
  const args = [...(m.args || [])]

  let urlGambar = ''
  if (args[0] && /^https?:\/\//i.test(args[0])) urlGambar = args.shift()

  const gambar = urlGambar ? null : cariGambar(m)

  if (!urlGambar && !gambar) {
    return m.reply(
      '🔎 *UNBLUR / TAJAMKAN FOTO*\n\n' +
      'Hilangkan blur dan pertajam detail foto pakai AI.\n\n' +
      '📌 *Cara pakai:*\n' +
      '1. Reply/kirim foto, tulis caption:\n' +
      '   `.unblur`\n' +
      '2. Atau pakai link gambar:\n' +
      '   `.unblur https://link.jpg`'
    )
  }

  await react(conn, m, '🔎')

  try {
    const mimetype = gambar?.node?.mimetype || 'image/jpeg'
    const buffer = urlGambar
      ? await unduhDariUrl(urlGambar)
      : await unduhGambar(gambar, rawConn)

    const hasil = await prosesUnblur(buffer, mimetype)

    const keluaran = await ambilHasil(hasil.result)
    const caption = '✅ *Foto selesai ditajamkan*\n🤖 AI: unblurimg.ai'

    if (keluaran) {
      await conn.sendMessage(
        m.chat,
        { image: keluaran, mimetype: 'image/jpeg', caption },
        { quoted: m.raw }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        { image: { url: hasil.result }, mimetype: 'image/jpeg', caption },
        { quoted: m.raw }
      )
    }

    await react(conn, m, '✅')
  } catch (error) {
    console.error('[UNBLUR]', error)
    await react(conn, m, '❌')

    const pesan = String(error?.message || 'Gagal memproses gambar.')
    const lambat = /abort|timeout|timed out/i.test(pesan)

    await m.reply(
      '❌ *Gagal menajamkan foto.*\n\n' +
      (lambat
        ? '⏱️ Server AI terlalu lama merespons. Coba lagi sebentar lagi.'
        : `> ${pesan}`)
    )
  }
}

handler.command = /^unblur$/i
handler.help = ['unblur']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Hilangkan blur & tajamkan foto dengan AI (reply foto atau kirim link)'
handler.limit = true

export default handler
