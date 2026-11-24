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
⌬ Nano Ai · PRESET ALIGHT MOTION FINDER

  Ambil preset Alight Motion dari sebuah link TikTok. Sumbernya API publik
  bintangapi.my.id: ia membalas metadata video (creator, caption, views, like,
  komentar, durasi) plus daftar tautan unduhan preset.

  Cara pakai:
    .amfind <link tiktok>
    .amfinder <link tiktok>

  Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
  Url    : https://bintangapi.my.id
*/

import axios from 'axios'

const ENDPOINT = 'https://bintangapi.my.id/api/amfind/'
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw?.key } })
  } catch {}
}

/* Terima angka, string, null — apa pun dari API — dan selalu beri string aman. */
function formatNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num.toLocaleString('id-ID') : '0'
}

const handler = async (m, { conn, usedPrefix }) => {
  const url = m.text?.trim()

  if (!url) {
    return m.reply(
      `❌ Masukkan link TikTok.\n\n` +
      `Contoh:\n${usedPrefix}${m.command} https://vt.tiktok.com/ZSb5ce1L7/`
    )
  }

  if (!/tiktok\.com/i.test(url)) {
    return m.reply('❌ URL harus berupa link TikTok yang valid.')
  }

  await react(conn, m, '⏳')

  try {
    const { data } = await axios.get(ENDPOINT, {
      params: { url },
      headers: {
        Accept: '*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        Connection: 'keep-alive',
        Origin: 'https://starlabs.biz.id',
        Referer: 'https://starlabs.biz.id/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent': UA,
      },
      timeout: 30000,
    })

    if (!data?.success || !data?.data) {
      throw new Error('Preset tidak ditemukan.')
    }

    const result = data.data || {}
    const video = result.video || {}
    const user = result.user || {}
    const preset = result.preset || {}

    /* Fallback: API TikTok kadang memakai nama field yang berbeda-beda. */
    const views = Number(video.views ?? video.play_count ?? video.playCount ?? result.views ?? result.play_count ?? 0) || 0
    const likes = Number(video.likes ?? video.digg_count ?? video.diggCount ?? result.likes ?? result.digg_count ?? 0) || 0
    const comments = Number(video.comments ?? video.comment_count ?? video.commentCount ?? result.comments ?? result.comment_count ?? 0) || 0

    const duration = video.duration ?? 0
    const caption = video.caption ?? '-'

    const items = Array.isArray(preset.items) ? preset.items : []

    let resultText =
`╭─「 *ALIGHT MOTION PRESET* 」
│
│ 👤 *Creator:* ${user.display_name || '-'}
│ 🔗 *Username:* @${user.username || '-'}
│
│ 🎬 *Caption:*
│ ${caption}
│
│ 👁️ *Views:* ${formatNumber(views)}
│ ❤️ *Likes:* ${formatNumber(likes)}
│ 💬 *Comments:* ${formatNumber(comments)}
│ ⏱️ *Duration:* ${duration}s
│
│ 📦 *Preset:*
│ ${preset.is_reply ? 'Reply Comment' : 'Comment'}
│ ${preset.is_author ? 'Author' : 'User'}
╰─────────────────`

    if (items.length > 0) {
      resultText += `\n\n╭─「 *DOWNLOAD PRESET* 」`
      for (const item of items) {
        if (!item?.url) continue
        resultText += `\n│ 📁 *${item.label || 'Preset'}*\n│ 🔗 ${item.url}\n`
      }
      resultText += `╰─────────────────`
    }

    if (video.url) {
      resultText += `\n\n🎥 *TikTok:*\n${video.url}`
    }

    if (result.thumbnail) {
      try {
        await conn.sendMessage(
          m.chat,
          { image: { url: result.thumbnail }, caption: resultText },
          { quoted: m.raw }
        )
      } catch {
        await m.reply(resultText)
      }
    } else {
      await m.reply(resultText)
    }

    m.limit?.success()
    await react(conn, m, '✅')
  } catch (e) {
    m.limit?.fail()
    await react(conn, m, '❌')

    const error = e.response?.data
      ? (typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data, null, 2))
      : e.message

    return m.reply(`❌ Terjadi kesalahan:\n${error}`)
  }
}

handler.command = /^(amfind|amfinder)$/i
handler.help = ['amfind', 'amfinder']
handler.usage = ['amfind <link tiktok>', 'amfinder <link tiktok>']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Cari preset Alight Motion dari link TikTok'
handler.limitCommit = 'manual'

export default handler
