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
  participantIsAdmin,
  isGroupOwnerParticipant,
  sameAsBot,
  box,
} from '../../lib/grup.js'

const MODES = {
  promote: 'add',
  jadikanadmin: 'add',
  demote: 'remove',
  cabutadmin: 'remove',
}

const handler = async (m, { rawConn, usedPrefix }) => {
  const action = String(m.command || '').toLowerCase()
  const makingAdmin = (MODES[action] || 'add') === 'add'
  const verb = makingAdmin ? 'Dijadikan admin' : 'Dicabut admin'

  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const targets = resolveTargetJids(m)
  if (!targets.length) {
    return m.reply(
      box([
        makingAdmin ? 'PROMOTE MEMBER' : 'DEMOTE MEMBER',
        '',
        'Tag atau reply member yang statusnya mau diubah.',
        '',
        'Contoh: ' + usedPrefix + (makingAdmin ? 'promote @user' : 'demote @user'),
        '',
        'Alias lain: ' + (makingAdmin ? 'jadikanadmin' : 'cabutadmin'),
      ])
    )
  }

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
      blocked.push('Status admin bot diatur otomatis, tidak bisa diubah manual.')
      continue
    }

    if (isGroupOwnerParticipant(participant)) {
      blocked.push(label + ' adalah pemilik group, statusnya tidak bisa diubah.')
      continue
    }

    const currentlyAdmin = participantIsAdmin(participant)
    if (currentlyAdmin === makingAdmin) {
      blocked.push(label + (makingAdmin ? ' sudah menjadi admin.' : ' memang bukan admin.'))
      continue
    }

    allowed.push({ jid, label })
  }

  if (!allowed.length) {
    return m.reply(box([makingAdmin ? 'PROMOTE GAGAL' : 'DEMOTE GAGAL', '', ...blocked]))
  }

  try {
    await rawConn.groupParticipantsUpdate(
      m.chat,
      allowed.map((entry) => entry.jid),
      makingAdmin ? 'promote' : 'demote'
    )
  } catch (err) {
    return m.reply(box([makingAdmin ? 'PROMOTE GAGAL' : 'DEMOTE GAGAL', '', String(err?.message || err).slice(0, 200)]))
  }

  let after = gate.metadata
  try {
    after = await rawConn.groupMetadata(m.chat)
  } catch {
    // fall back to the pre-update view
  }

  const done = []
  const failed = []
  for (const entry of allowed) {
    const participant = findParticipant(after, entry.jid)
    const ok = participantIsAdmin(participant) === makingAdmin
    if (ok) done.push(entry.label)
    else failed.push(entry.label)
  }

  const lines = [makingAdmin ? 'PROMOTE MEMBER' : 'DEMOTE MEMBER', '']

  if (done.length) {
    lines.push(verb + ': ' + done.length + ' member', '')
    done.forEach((label, index) => lines.push((index + 1) + '. ' + label))
  }
  if (failed.length) {
    if (done.length) lines.push('')
    lines.push('Gagal: ' + failed.join(', '))
  }
  if (blocked.length) {
    lines.push('')
    lines.push(...blocked)
  }

  if (!done.length) return m.reply(box([makingAdmin ? 'PROMOTE GAGAL' : 'DEMOTE GAGAL', '', ...lines.slice(2)]))

  await m.reply(box(lines))
}

handler.command = /^(promote|demote|jadikanadmin|cabutadmin)$/i
handler.help = ['promote', 'demote', 'jadikanadmin', 'cabutadmin']
handler.menuHelp = ['promote', 'demote']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Jadikan admin atau cabut admin member group'
handler.groupOnly = true

export default handler
