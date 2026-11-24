/* <3 Welcome Break >*

<>
[ INFO ]
Author  : Danz nano & Awang Ofc
Website : awangofc.my.id
WhatsApp: wa.me/556184127506
<>

<>
CAUTION
Do not delete copyright SC
Do not sell the script!
<>

 * /

import { parseTweetUrl, scrapeTwitter, cdnHeaders } from '../../lib/x.js'
import { fetchBuffer } from '../../lib/http.js'

/* Batas ukuran media yang diambil — di atas ini WhatsApp biasanya menolak. */
const MAX_MEDIA = 64 * 1024 * 1024
/* Galat dari sumber tertentu (biasanya vxtwitter 403) dicatat, bukan gagalkan
   seluruh permintaan. */
const INGAT_GALAT = new Set()

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {
    /* abaikan */
  }
}

function fmt(n) {
  return (Number(n) || 0).toLocaleString('id-ID')
}

function caption(r) {
  const baris = [
    '╭─〔 🐦 X / TWITTER 〕',
    `│ 👤 *@${r.author?.username || 'unknown'}*${r.author?.verified ? ' ✅' : ''}`,
    r.text ? String(r.text).replace(/\n+/g, '\n│ ').slice(0, 700) : '│ *(tanpa teks)*',
    '│',
    `│ ❤️ ${fmt(r.stats?.likes || 0)}   🔁 ${fmt(r.stats?.retweets || 0)}   💬 ${fmt(r.stats?.replies || 0)}   👁️ ${fmt(r.stats?.views || 0)}`,
    r.media?.jumlah > 1 ? `│ 🖼️ ${r.media.jumlah} media (terkirim ${Math.min(r.media.jumlah, MAX_MEDIA ? 5 : r.media.jumlah)})` : null,
    `│ 📦 Tipe : *${r.type}*`,
    `│ Sumber: ${r.sumber ? r.sumber.join(', ') : '-'}`,
    '╰──────────────',
  ]
  return baris.filter(Boolean).join('\n')
}
const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 🐦 X / TWITTER 〕',
          '│',
          '│ ❌ Masukkan link tweet!',
          '│',
          `│ Contoh:`,
          `│ ${usedPrefix}xdl https://x.com/nasa/status/1234567890`,
          '│',
          '│ Bisa juga: twitter.com, x.com, fxtwitter.com, vxtwitter.com, fixupx.com, fixvx.com',
          '│',
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
  }

  // Validasi host dulu — Error berbahasa Indonesia yang langsung bisa ditampilkan.
  try {
    parseTweetUrl(input)
  } catch (err) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: `❌ ${err.message}` }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  try {
    const r = await scrapeTwitter(input, { verify: false })
    const cap = caption(r)
    let terkirim = 0

    if (r.type === 'video' && r.media.video) {
      const url = r.media.video
      const { buffer } = await fetchBuffer(url, {
        maxBytes: MAX_MEDIA,
        timeout: 90_000,
        headers: cdnHeaders(),
      })
      await conn.sendMessage(
        m.chat,
        { video: buffer, mimetype: 'video/mp4', caption: cap, mentions: [m.sender] },
        { quoted: m.raw }
      )
      terkirim++
    } else if (r.media.items?.length) {
      /* Gambar/gif/carousel: kirim terbatas 5 agar obrolan tidak
         dihanyutkan. Jumlah sebenarnya tetap dilaporkan di caption. */
      for (const u of r.media.gambar.slice(0, 5)) {
        const { buffer } = await fetchBuffer(u, {
          maxBytes: MAX_MEDIA,
          timeout: 60_000,
          headers: cdnHeaders(),
        })
        await conn.sendMessage(
          m.chat,
          { image: buffer, mimetype: 'image/jpeg', caption: terkirim === 0 ? cap : '', mentions: [m.sender] },
          { quoted: m.raw }
        )
        terkirim++
      }
    }

    if (terkirim === 0) {
      await conn.sendMessage(m.chat, { text: cap, mentions: [m.sender] }, { quoted: m.raw })
    }

    m.limit?.success()
    await react(conn, m, '✅')
  } catch (err) {
    m.limit?.fail()
    console.error('[NANO X ERROR]', err)
    await react(conn, m, '❌')
    await conn.sendMessage(
      m.chat,
      { text: `❌ Gagal mengunduh X.\n\nError: ${err.message}` },
      { quoted: m.raw }
    )
    throw err
  }
}

handler.command = /^(x|twitter|twitterdl|xdl|xdown|tweetdl|tdl|twdl)$/i
handler.help = ['twitter', 'x', 'xdl', 'xdown', 'tweetdl', 'tdl', 'twdl']
handler.usage = ['xdl <link x/twitter>']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Download media X/Twitter (image/video/gif/carousel)'
handler.limitCommit = 'manual'

export default handler

