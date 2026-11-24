/* ⌬
 ┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
 ┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
 ┇ █  █ █ █▀▄ █▄█   █▀█ █
 ┇  ▀█  --N--a--n--o------A--i-----
 ┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
 ┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━
 ┇▫️Author  : Danz nano & Awang Ofc
 ┇▫️Website  : awangofc.my.id
 ┇▫️WhatsApp : wa.me/556184127506
 ┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
 ┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
 ┇🔸Dilarang Menghapus Creadit SC
 ┇🔸Dilarang Menjual Script Nano Ai
 ┇🔸Dilarang Mengatas Namakan Script!!
 ⌬ */

/* Threads downloader — lapisan chat. Mesin scraping-nya ada di lib/threads.js
   (murni, tanpa dependensi WhatsApp) supaya bisa diuji terpisah.
   Media dikirim apa adanya dari CDN: video → 1 pesan, carousel → terbatas
   MAX_IMAGES pesan gambar agar obrolan tidak dibanjiri. */

import { threadsDL, parseUrl, cdnHeaders } from '../../lib/threads.js'
import { fetchBuffer } from '../../lib/http.js'

/* Batas ukuran media yang diambil ke memori — di atas ini WhatsApp akan
   menolak/memperkecil, jadi lebih baik berhenti dengan pesan jelas. */
const MAX_MEDIA = 64 * 1024 * 1024
/* Carousel boleh berisi puluhan gambar; kirim sebagian saja. */
const MAX_IMAGES = 5

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {
    /* abaikan */
  }
}

const fmt = (n) => (Number(n) || 0).toLocaleString('id-ID')

const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 🧵 THREADS 〕',
          '│',
          '│ ❌ Masukkan link Threads!',
          '│',
          `│ Contoh:`,
          `│ ${usedPrefix}threads https://www.threads.com/@user/post/xxxxx`,
          '│',
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
  }

  // Validasi host dulu sebelum memanggil jaringan — parseUrl melempar galat
  // berbahasa Indonesia yang langsung bisa ditampilkan ke pengguna.
  try {
    parseUrl(input)
  } catch (err) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: `❌ ${err.message}` }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  try {
    const r = await threadsDL(input, { verify: false })
    const cap = caption(r)
    const kirim = (payload) => conn.sendMessage(m.chat, payload, { quoted: m.raw })

    let terkirim = 0

    if (r.type === 'video' && r.url.video) {
      // CDN Instagram menolak permintaan tanpa Referer → pakai cdnHeaders().
      const { buffer } = await fetchBuffer(r.url.video, {
        maxBytes: MAX_MEDIA,
        timeout: 90_000,
        headers: cdnHeaders(),
      })
      await sendVideo(conn, m, buffer, cap)
      terkirim++
    } else if (r.media?.images?.length) {
      // Carousel / post gambar: kirim terbatas MAX_IMAGES agar obrolan tidak
      // dibanjiri; sisa jumlahnya tetap dilaporkan di caption.
      for (const u of r.media.images.slice(0, MAX_IMAGES)) {
        const { buffer } = await fetchBuffer(u, {
          maxBytes: MAX_MEDIA,
          timeout: 60_000,
          headers: cdnHeaders(),
        })
        await sendImage(conn, m, buffer, terkirim === 0 ? cap : '')
        terkirim++
      }
    }

    // Tidak ada media sama sekali (post teks) → kirim caption saja.
    if (terkirim === 0) {
      await sendImage(conn, m, null, cap)
    }

    m.limit?.success()
    await react(conn, m, '✅')
  } catch (err) {
    m.limit?.fail()
    console.error('[NANO THREADS ERROR]', err)
    await react(conn, m, '❌')
    await conn.sendMessage(
      m.chat,
      { text: `❌ Gagal mengunduh Threads.\n\nError: ${err.message}` },
      { quoted: m.raw }
    )
    throw err
  }
}

function sendVideo(conn, m, buffer, captionText) {
  return conn.sendMessage(
    m.chat,
    { video: buffer, mimetype: 'video/mp4', caption: captionText || undefined, mentions: [m.sender] },
    { quoted: m.raw }
  )
}

function sendImage(conn, m, buffer, captionText) {
  if (!buffer) {
    return conn.sendMessage(m.chat, { text: captionText, mentions: [m.sender] }, { quoted: m.raw })
  }
  return conn.sendMessage(
    m.chat,
    { image: buffer, mimetype: 'image/jpeg', caption: captionText || undefined, mentions: [m.sender] },
    { quoted: m.raw }
  )
}

handler.command = /^(threads|thdl|threadstdl)$/i
handler.help = ['threads', 'thdl', 'threadstdl']
handler.usage = ['threads <link threads>']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Download media Threads (image/video/carousel) tanpa watermark'
handler.limitCommit = 'manual'

export default handler

function caption(r) {
  const baris = [
    '╭─〔 🧵 THREADS 〕',
    `│ 👤 *@${r.author?.username || 'unknown'}*${r.author?.is_verified ? ' ✅' : ''}`,
    r.caption?.text ? `│ ${String(r.caption.text).replace(/\n+/g, '\n│ ').slice(0, 600)}` : '│ *(tanpa caption)*',
    '│',
    `│ ❤️ ${fmt(r.stats?.like_count)}   💬 ${fmt(r.stats?.comment_count)}   🔁 ${fmt(r.stats?.repost_count)}`,
    r.media?.item_count > 1 ? `│ 🖼️ ${r.media.item_count} media (terkirim ${Math.min(r.media.item_count, MAX_IMAGES)})` : null,
    `│ 📦 Tipe: *${r.type}*`,
    '╰──────────────',
  ]
  return baris.filter(Boolean).join('\n')
}
