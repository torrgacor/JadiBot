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
import {
  MAX_WARN,
  getMember,
  listMembers,
  addWarn,
  reduceWarn,
  clearMember,
} from '../../lib/warn-store.js'

/**
 * Peringatan disimpan di lib/warn-store.js (JSON, atomik) supaya anti-link
 * bisa menumpuk di gate yang sama dan .warns menampilkan semuanya.
 */

/** Reason text: everything after the mention / number in the command. */
function reasonFrom(m) {
  const tokens = (m.args || []).filter(
    (token) => !/^@\d/.test(token) && !/^\d{7,15}$/.test(token)
  )
  return tokens.join(' ').trim()
}

const handler = async (m, { rawConn, usedPrefix }) => {
  const action = String(m.command || '').toLowerCase()
  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const groupId = m.chat

  if (action === 'warns') {
    const targets = resolveTargetJids(m)

    if (targets.length) {
      const jid = targets[0]
      const record = getMember(groupId, jid)
      const number = await displayNumber(jid, rawConn, groupId)

      if (!record || !record.count) {
        return m.reply(box(['RIWAYAT PERINGATAN', '', mentionOf(number) + ' tidak punya peringatan.']))
      }

      const lines = [
        'RIWAYAT PERINGATAN',
        '',
        'Member: ' + mentionOf(number),
        'Total : ' + record.count + '/' + MAX_WARN,
        '',
      ]
      const entries = (record.entries || []).slice(-5)
      entries.forEach((entry, index) => {
        const when = new Date(entry.at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        lines.push(
          (index + 1) + '. ' + (entry.reason || '(tanpa alasan)') +
          ' — oleh @' + String(entry.by || '').split('@')[0].split(':')[0] +
          ' · ' + when
        )
      })

      const mentions = [jid]
      return m.reply(box(lines), { mentions })
    }

    const rows = Object.entries(listMembers(groupId))
    if (!rows.length) {
      return m.reply(box(['RIWAYAT PERINGATAN', '', 'Belum ada member yang kena peringatan.']))
    }

    const lines = ['DAFTAR PERINGATAN', '', 'Batas: ' + MAX_WARN + ' peringatan → dikeluarkan.', '']
    const mentions = []
    for (const [jid, record] of rows.slice(0, 15)) {
      mentions.push(jid)
      lines.push('• ' + mentionOf(await displayNumber(jid, rawConn, groupId)) + ' — ' + record.count + '/' + MAX_WARN)
    }

    return m.reply(box(lines), { mentions })
  }

  const targets = resolveTargetJids(m)
  if (!targets.length) {
    return m.reply(
      box([
        action === 'unwarn' ? 'HAPUS PERINGATAN' : 'BERI PERINGATAN',
        '',
        'Tag atau reply member yang dituju.',
        '',
        'Contoh: ' + usedPrefix + (action === 'unwarn' ? 'unwarn @user' : 'warn @user spam berlebihan'),
        '',
        'Lihat daftar: ' + usedPrefix + 'warns',
      ])
    )
  }

  const jid = targets[0]
  const participant = findParticipant(gate.metadata, jid)
  if (!participant) {
    return m.reply(box(['TIDAK ADA', '', 'Target bukan member group ini.']))
  }

  if (isGroupOwnerParticipant(participant) || sameAsBot(jid, rawConn)) {
    return m.reply(box(['TIDAK BISA', '', 'Pemilik group dan bot tidak bisa diberi peringatan.']))
  }

  let targetIsOwner = false
  try {
    targetIsOwner = await isOwner(jid, rawConn, { groupId })
  } catch {
    targetIsOwner = false
  }
  if (targetIsOwner) {
    return m.reply(box(['TIDAK BISA', '', 'Owner bot tidak bisa diberi peringatan.']))
  }

  const number = await displayNumber(jid, rawConn, groupId)
  const record = getMember(groupId, jid)

  if (action === 'unwarn') {
    if (!record || !record.count) {
      return m.reply(box(['TIDAK ADA PERINGATAN', '', mentionOf(number) + ' bersih.']))
    }

    const result = reduceWarn(groupId, jid)
    if (!result) {
      return m.reply(box(['TIDAK ADA PERINGATAN', '', mentionOf(number) + ' bersih.']))
    }
    if (!result.ok) {
      return m.reply('Peringatan tersimpan, tapi gagal menulis ke disk. Coba lagi.')
    }

    return m.reply(
      box([
        'PERINGATAN DIHAPUS',
        '',
        'Member : ' + mentionOf(number),
        'Sisa   : ' + result.count + '/' + MAX_WARN,
      ]),
      { mentions: [jid] }
    )
  }

  const reason = reasonFrom(m)
  const added = addWarn(groupId, jid, { by: m.sender, reason })
  if (!added.ok) return m.reply('Gagal menulis peringatan ke disk. Coba lagi.')

  const reached = added.reached

  const lines = [
    'PERINGATAN DIBERIKAN',
    '',
    'Member : ' + mentionOf(number),
    'Total  : ' + added.count + '/' + MAX_WARN,
    reason ? 'Alasan : ' + reason : '',
    '',
    reached
      ? '⚠ Batas tercapai — member dikeluarkan otomatis.'
      : 'Sisa ' + (MAX_WARN - added.count) + ' peringatan sebelum dikeluarkan.',
  ].filter(Boolean)

  await m.reply(box(lines), { mentions: [jid] })

  if (!reached) return

  const jidActual = getParticipantJid(participant, jid)
  try {
    await rawConn.groupParticipantsUpdate(groupId, [jidActual], 'remove')
  } catch (err) {
    return m.reply(
      box([
        'AUTO KICK GAGAL',
        '',
        String(err?.message || err).slice(0, 200),
        '',
        'Peringatan ' + added.count + '/' + MAX_WARN + ' tetap tercatat.',
      ])
    )
  }

  clearMember(groupId, jid)

  await m.reply(
    box([
      'DIKELUARKAN OTOMATIS',
      '',
      mentionOf(number) + ' mencapai ' + MAX_WARN + ' peringatan.',
      'Catatan peringatannya sudah direset.',
    ]),
    { mentions: [jid] }
  )
}

handler.command = /^(warn|unwarn|warns)$/i
handler.help = ['warn @user alasan', 'unwarn @user', 'warns']
handler.menuHelp = ['warn', 'unwarn', 'warns']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Sistem peringatan member — 3x otomatis dikeluarkan'
handler.groupOnly = true

export default handler
