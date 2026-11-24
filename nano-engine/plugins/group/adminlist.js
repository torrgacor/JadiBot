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

import {
  displayNumber,
  mentionOf,
  getParticipantJid,
  participantIsAdmin,
  isGroupOwnerParticipant,
  sameAsBot,
  isBotAdmin,
  box,
} from '../../lib/grup.js'

const handler = async (m, { rawConn }) => {
  if (!m.isGroup) {
    return m.reply('Perintah ini hanya bisa dipakai di dalam group.')
  }

  let metadata
  try {
    metadata = await rawConn.groupMetadata(m.chat)
  } catch (err) {
    return m.reply('Gagal membaca data group.\n' + String(err?.message || err))
  }

  const participants = Array.isArray(metadata.participants) ? metadata.participants : []
  const owner = participants.find((participant) => isGroupOwnerParticipant(participant)) || null
  const admins = participants.filter(
    (participant) => participantIsAdmin(participant) && participant !== owner
  )

  const lines = ['DAFTAR ADMIN', '', 'Group: ' + (metadata.subject || '-'), '']
  const mentions = []
  let index = 0

  if (owner) {
    index += 1
    const jid = getParticipantJid(owner, owner.id)
    mentions.push(jid)
    lines.push(index + '. ' + mentionOf(await displayNumber(jid, rawConn, m.chat)) + ' — pemilik group')
  }

  for (const participant of admins) {
    index += 1
    const jid = getParticipantJid(participant, participant.id)
    mentions.push(jid)
    const badge = sameAsBot(jid, rawConn) ? ' — bot' : ''
    lines.push(index + '. ' + mentionOf(await displayNumber(jid, rawConn, m.chat)) + badge)
  }

  if (!index) lines.push('Tidak ada admin terdaftar.')

  let botAdmin = false
  try {
    botAdmin = await isBotAdmin(rawConn, m.chat, metadata)
  } catch {
    botAdmin = false
  }

  lines.push('')
  lines.push('Admin : ' + index)
  lines.push('Member: ' + participants.length)
  lines.push('Bot   : ' + (botAdmin ? 'admin ✓' : 'bukan admin ✕'))

  return m.reply(box(lines), { mentions })
}

handler.command = /^(adminlist|admins|listadmin)$/i
handler.help = ['adminlist', 'admins', 'listadmin']
handler.menuHelp = ['adminlist', 'admins']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Daftar admin group beserta jumlah member'
handler.groupOnly = true

export default handler
