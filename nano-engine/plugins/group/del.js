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

import { requireGroupAdmin, getContextInfo, sameParticipant, botJid, box } from '../../lib/grup.js'

/**
 * Delete a quoted message.
 *
 * WhatsApp only lets an admin remove other people's messages, so this is
 * gated on both caller-admin and bot-admin. The key is rebuilt from the
 * contextInfo of the message being replied to — that is the only place the
 * stanza id of the quoted message is available.
 */
const handler = async (m, { rawConn, usedPrefix }) => {
  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const ctx = getContextInfo(m)
  const stanzaId = ctx?.stanzaId
  const participant = ctx?.participant

  if (!stanzaId || !participant) {
    return m.reply(
      box([
        'HAPUS PESAN',
        '',
        'Reply pesan yang mau dihapus lalu jalankan perintah ini.',
        '',
        'Contoh: ' + usedPrefix + 'del',
        '',
        'Bot harus admin group karena pesan itu milik orang lain.',
      ])
    )
  }

  const key = {
    remoteJid: m.chat,
    fromMe: sameParticipant(participant, botJid(rawConn)),
    id: stanzaId,
    participant,
  }

  try {
    await rawConn.sendMessage(m.chat, { delete: key })
  } catch (err) {
    return m.reply(
      box([
        'HAPUS PESAN GAGAL',
        '',
        String(err?.message || err).slice(0, 200),
        '',
        'Biasanya karena bot bukan admin, atau pesan terlalu lama (batas 24 jam untuk admin).',
      ])
    )
  }

  await m.reply('🗑️ Pesan sudah dihapus.', { quoted: false })
}

handler.command = /^(del|delete|hapus|batalpesan)$/i
handler.help = ['del', 'delete', 'hapus']
handler.menuHelp = ['del']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Hapus pesan orang lain (reply dulu, bot harus admin)'
handler.groupOnly = true

export default handler
