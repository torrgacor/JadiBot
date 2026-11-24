/*
⌬ Nano Ai · FAKE FF DUO

  Kartu lobby Free Fire bertema duo dengan dua nama, digambar oleh API Rin:
    https://apiii-xrina.vercel.app/canvas/fakeffduo?name1=…&name2=…

  49 tamplate secara rendom — pemilihannya dilakukan acak oleh API di sisi
  server, jadi plugin ini tidak mengirim parameter apa pun selain dua nama.

  Cara pakai:
    .fakeffduo Nama1|Nama2
*/

import fetch from 'node-fetch'

/* API menggambar di sisi server; tanpa batas waktu, satu upstream yang menggantung
   akan menahan handler ini selamanya. */
const BATAS_MS = 60_000

const handler = async (m, { conn, usedPrefix = '.' }) => {
  /*
    Router memanggil handler dengan `plugin(m, { conn, rawConn, usedPrefix, settings })`
    — argumen teks TIDAK dikirim, teks setelah perintah ada di `m.text`.
  */
  const input = String(m.text ?? '').trim()

  if (!input) {
    return m.reply(
      'Masukkan 2 nama!\n\n' +
      'Contoh:\n' +
      `${usedPrefix}fakeffduo Nama1|Nama2`
    )
  }

  const [name1, name2] = input.split('|').map((v) => v.trim())

  if (!name1 || !name2) {
    return m.reply(
      'Format salah!\n\n' +
      'Gunakan:\n' +
      `${usedPrefix}fakeffduo Nama1|Nama2`
    )
  }

  try {
    const url =
      'https://apiii-xrina.vercel.app/canvas/fakeffduo' +
      `?name1=${encodeURIComponent(name1)}` +
      `&name2=${encodeURIComponent(name2)}`

    const res = await fetch(url, { signal: AbortSignal.timeout(BATAS_MS) })

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`)
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    if (!buffer.length) throw new Error('API mengembalikan gambar kosong.')

    const type = res.headers.get('content-type') || 'image/png'

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        mimetype: type,
        caption: `🎮 Fake FF Duo\n\n👤 ${name1}\n👤 ${name2}`,
      },
      /* `quoted` butuh WAMessage asli — objek `m` hanya pembungkus. */
      { quoted: m.raw }
    )
  } catch (e) {
    console.error(e)
    await m.reply(`❌ Gagal membuat gambar.\n\n${e?.message || e}`)
  }
}

handler.command = /^fakeffduo$/i
handler.help = ['fakeffduo <nama1>|<nama2>']
handler.tags = ['tools']
handler.category = 'tools'
handler.description =
  'Kartu lobby Free Fire duo dengan dua nama — template dipilih acak oleh API'
handler.limit = false

export default handler
