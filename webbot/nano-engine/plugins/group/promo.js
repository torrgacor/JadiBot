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
import { requireGroupAdmin, box } from '../../lib/grup.js'
import { extractMessageText } from '../../core/antilink.js'

const silentLogger = {
  info: () => {},
  debug: () => {},
  error: () => {},
  warn: () => {},
  trace: () => {},
}

function unwrap(message) {
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

/** Kenali media pesan yang direply supaya bisa dikirim ulang bersama caption tag. */
function mediaOf(message) {
  const content = unwrap(message)

  if (content.imageMessage) {
    return { kind: 'image', mimetype: content.imageMessage.mimetype || 'image/jpeg', caption: content.imageMessage.caption || '' }
  }
  if (content.videoMessage) {
    return { kind: 'video', mimetype: content.videoMessage.mimetype || 'video/mp4', caption: content.videoMessage.caption || '' }
  }
  if (content.documentMessage) {
    return {
      kind: 'document',
      mimetype: content.documentMessage.mimetype || 'application/octet-stream',
      fileName: content.documentMessage.fileName || 'promo-file',
      caption: content.documentMessage.caption || '',
    }
  }
  if (content.stickerMessage) return { kind: 'sticker' }
  if (content.audioMessage) return { kind: 'audio', ptt: Boolean(content.audioMessage.ptt) }
  return null
}

const handler = async (m, { rawConn, usedPrefix }) => {
  /* Broadcast ke semua member tidak butuh bot sebagai admin — cukup pemanggil
     yang admin atau owner bot. */
  const gate = await requireGroupAdmin(m, rawConn, null, { requireBotAdmin: false })
  if (!gate.ok) return

  const participants = (gate.metadata.participants || []).map((participant) => participant.id).filter(Boolean)
  const text = String(m.text || '').trim()
  const quoted = m.quotedMessage?.message || null

  const usage = box([
    'PROMO HIDETAG',
    '',
    'Kirim pesan promo ke seluruh member dengan',
    'tag tersembunyi (semua member di-mention,',
    'tapi tag-nya tidak berjubel di chat).',
    '',
    'Tulis langsung:',
    '  ' + usedPrefix + 'promo Diskon 50% hari ini!',
    '',
    'Reply pesan/foto/video promo:',
    '  reply → ' + usedPrefix + 'promo',
    '',
    'Syarat: admin group. Bot tidak perlu admin.',
  ])

  if (!text && !quoted) return m.reply(usage)

  const sendTagged = async (payload) => {
    await rawConn.sendMessage(m.chat, { text: payload, mentions: participants }, { quoted: m.raw })
  }

  if (quoted) {
    const media = mediaOf(quoted)

    if (media && media.kind !== 'sticker' && media.kind !== 'audio') {
      try {
        const buffer = await downloadMediaMessage(m.quotedMessage, 'buffer', {}, {
          logger: silentLogger,
          reuploadRequest: rawConn.updateMediaMessage,
        })
        const caption = [text, media.caption].filter(Boolean).join('\n') || '📢 PROMO'
        const content = { [media.kind]: buffer, mimetype: media.mimetype, caption, mentions: participants }
        if (media.kind === 'document' && media.fileName) content.fileName = media.fileName
        await rawConn.sendMessage(m.chat, content, { quoted: m.raw })
        return
      } catch (err) {
        return m.reply(box(['PROMO GAGAL', '', 'Media gagal diunggah ulang: ' + String(err?.message || err).slice(0, 200)]))
      }
    }

    if (media && (media.kind === 'sticker' || media.kind === 'audio')) {
      /* Stiker/audio tidak bisa membawa caption: kirim medianya dulu, lalu
         pesan tag terpisah supaya semua member tetap di-mention. */
      try {
        const buffer = await downloadMediaMessage(m.quotedMessage, 'buffer', {}, {
          logger: silentLogger,
          reuploadRequest: rawConn.updateMediaMessage,
        })
        const content = media.kind === 'sticker' ? { sticker: buffer } : { audio: buffer, ptt: media.ptt }
        await rawConn.sendMessage(m.chat, content, { quoted: m.raw })
      } catch (err) {
        return m.reply(box(['PROMO GAGAL', '', 'Media gagal diunggah ulang: ' + String(err?.message || err).slice(0, 200)]))
      }
      await sendTagged(text || '📢 PROMO')
      return
    }

    const quotedText = extractMessageText(quoted).trim()
    const payload = text || quotedText
    if (!payload) {
      return m.reply(box(['PROMO GAGAL', '', 'Pesan yang direply tidak punya teks atau media yang bisa dikirim ulang.']))
    }
    await sendTagged(payload)
    return
  }

  await sendTagged(text)
}

handler.command = /^promo$/i
handler.help = ['promo <teks>', 'promo (reply pesan)']
handler.menuHelp = ['promo']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Broadcast promo ke semua member dengan hidetag'
handler.groupOnly = true

export default handler
