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
  requireGroupAdmin,
  resolveTargetJids,
  displayNumber,
  mentionOf,
  findParticipant,
  getParticipantJid,
  isGroupOwnerParticipant,
  sameAsBot,
  isOwner,
  box,
} from '../../lib/grup.js'

const handler = async (m, { rawConn, usedPrefix }) => {
  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const targets = resolveTargetJids(m)
  if (!targets.length) {
    return m.reply(
      box([
        'KICK MEMBER',
        '',
        'Tag atau reply member yang mau dikeluarkan.',
        '',
        'Contoh: ' + usedPrefix + 'kick @user',
        'Bisa lebih dari satu: ' + usedPrefix + 'kick @user1 @user2',
        '',
        'Alias: ' + usedPrefix + 'remove, ' + usedPrefix + 'keluarkan',
      ])
    )
  }

  /* Nothing is sent to WhatsApp until we know every target is legitimate. */
  const allowed = []
  const blocked = []

  for (const target of targets) {
    const participant = findParticipant(gate.metadata, target)
    const label = mentionOf(await displayNumber(target, rawConn, m.chat))

    if (!participant) {
      blocked.push(label + ' bukan member group ini.')
      continue
    }

    const jid = getParticipantJid(participant, target)

    if (sameAsBot(jid, rawConn) || sameAsBot(target, rawConn)) {
      blocked.push('Bot tidak bisa mengeluarkan dirinya sendiri.')
      continue
    }

    if (isGroupOwnerParticipant(participant)) {
      blocked.push(label + ' adalah pemilik group dan tidak bisa dikeluarkan.')
      continue
    }

    let targetIsOwner = false
    try {
      targetIsOwner = await isOwner(jid, rawConn, { groupId: m.chat })
    } catch {
      targetIsOwner = false
    }
    if (targetIsOwner) {
      blocked.push(label + ' adalah owner bot dan tidak bisa dikeluarkan.')
      continue
    }

    allowed.push({ jid, label, number: await displayNumber(jid, rawConn, m.chat) })
  }

  if (!allowed.length) {
    return m.reply(box(['KICK GAGAL', '', ...blocked]))
  }

  try {
    await rawConn.groupParticipantsUpdate(m.chat, allowed.map((entry) => entry.jid), 'remove')
  } catch (err) {
    return m.reply(
      box(['KICK GAGAL', '', String(err?.message || err).slice(0, 200), '', 'Pastikan bot adalah admin group.'])
    )
  }

  /* Verify against fresh metadata instead of trusting the update's response. */
  let after = gate.metadata
  try {
    after = await rawConn.groupMetadata(m.chat)
  } catch {
    // keep the old view; the lines below then report the optimistic result
  }

  const kicked = []
  const failed = []
  for (const entry of allowed) {
    if (findParticipant(after, entry.jid)) failed.push(entry.label)
    else kicked.push(entry.label)
  }

  const lines = ['KICK MEMBER', '']
  if (kicked.length) {
    lines.push('Berhasil dikeluarkan: ' + kicked.length + ' member', '')
    kicked.forEach((label, index) => lines.push((index + 1) + '. ' + label))
  }
  if (failed.length) {
    if (kicked.length) lines.push('')
    lines.push('Gagal: ' + failed.join(', ') + ' (kemungkinan admin lain yang mengeluarkannya)')
  }
  if (blocked.length) {
    lines.push('')
    lines.push(...blocked)
  }

  if (!kicked.length) return m.reply(box(['KICK GAGAL', '', ...lines.slice(2)]))

  await m.reply(box(lines))
}

handler.command = /^(kick|remove|keluarkan)$/i
handler.help = ['kick', 'remove', 'keluarkan']
handler.menuHelp = ['kick']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Keluarkan member dari group (khusus admin group)'
handler.groupOnly = true

export default handler
