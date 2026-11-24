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

import { downloadMediaMessage } from '@whiskeysockets/baileys'

function unwrapMessage(message) {
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

function getMediaInfo(message) {
  const content = unwrapMessage(message)

  if (content.imageMessage) {
    return {
      type: 'image',
      message: content.imageMessage,
      mimetype: content.imageMessage.mimetype || 'image/jpeg',
      caption: content.imageMessage.caption || undefined,
    }
  }

  if (content.videoMessage) {
    return {
      type: 'video',
      message: content.videoMessage,
      mimetype: content.videoMessage.mimetype || 'video/mp4',
      caption: content.videoMessage.caption || undefined,
    }
  }

  if (content.audioMessage) {
    return {
      type: 'audio',
      message: content.audioMessage,
      mimetype: content.audioMessage.mimetype || 'audio/mpeg',
      ptt: Boolean(content.audioMessage.ptt),
    }
  }

  if (content.documentMessage) {
    return {
      type: 'document',
      message: content.documentMessage,
      mimetype:
        content.documentMessage.mimetype ||
        'application/octet-stream',
      fileName:
        content.documentMessage.fileName ||
        'rvo-file',
      caption:
        content.documentMessage.caption ||
        undefined,
    }
  }

  return null
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: emoji,
        key: m.raw.key,
      },
    })
  } catch {}
}

async function downloadMedia(quotedMessage) {
  return downloadMediaMessage(
    quotedMessage,
    'buffer',
    {},
    {
      logger: {
        info: () => {},
        debug: () => {},
        error: () => {},
        warn: () => {},
        trace: () => {},
      },
    }
  )
}

const handler = async (m, { conn }) => {
  const quoted = m.quotedMessage

  if (!quoted?.message) {
    await react(conn, m, '❌')

    return m.reply(
      '💬 Reply pesan *View Once* lalu ketik *.rvo*.\n\n' +
      'Contoh: reply foto/video sekali lihat → *.rvo*'
    )
  }

  const media = getMediaInfo(quoted.message)

  if (!media) {
    await react(conn, m, '❌')

    return m.reply(
      '❌ Pesan yang direply bukan media yang bisa dibuka.\n' +
      'Gunakan *.rvo* pada View Once berupa foto, video, audio, atau dokumen.'
    )
  }

  await react(conn, m, '⏳')

  try {
    const buffer = await downloadMedia(quoted)

    if (!Buffer.isBuffer(buffer) || !buffer.length) {
      throw new Error('Media kosong atau gagal diunduh.')
    }

    const content = {
      [media.type]: buffer,
      mimetype: media.mimetype,
    }

    if (media.caption) {
      content.caption = media.caption
    }

    if (media.type === 'audio') {
      content.ptt = media.ptt
    }

    if (media.type === 'document') {
      content.fileName = media.fileName
    }

    await conn.sendMessage(
      m.chat,
      content,
      {
        quoted: m.raw,
      }
    )

    await react(conn, m, '✅')
  } catch (error) {
    console.error('[RVO]', error)

    await react(conn, m, '❌')

    await m.reply(
      '❌ Gagal membuka View Once.\n\n' +
      `> ${error?.message || 'Media tidak dapat diproses.'}`
    )
  }
}

handler.command = /^rvo$/i
handler.help = ['rvo']
handler.tags = ['tools']
handler.category = 'tools'
handler.description =
  'Membuka kembali media WhatsApp View Once dengan reply + .rvo'

handler.limit = false

export default handler