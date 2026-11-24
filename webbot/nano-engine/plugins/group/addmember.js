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

import { requireGroupAdmin, findParticipant, box } from '../../lib/grup.js'

/**
 * Add a member by number.
 *
 * The number has to be given in full international form — guessing a country
 * code would silently add a stranger, so it is rejected instead.
 */
const handler = async (m, { rawConn, usedPrefix }) => {
  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const input = (m.args[0] || m.text || '').trim()
  const digits = input.replace(/\D/g, '')

  if (!digits) {
    return m.reply(
      box([
        'TAMBAH MEMBER',
        '',
        'Masukkan nomor tujuan dengan kode negara.',
        '',
        'Contoh: ' + usedPrefix + 'add 6281234567890',
        '',
        'Nomor lokal tanpa kode negara tidak diproses supaya tidak salah sasaran.',
      ])
    )
  }

  if (digits.length < 7 || digits.length > 15) {
    return m.reply(box(['NOMOR TIDAK VALID', '', 'Panjang angka: ' + digits.length + ' (harus 7–15 digit).']))
  }

  const jid = digits + '@s.whatsapp.net'

  if (findParticipant(gate.metadata, jid)) {
    return m.reply(box(['SUDAH MEMBER', '', 'Nomor ' + digits + ' sudah berada di group ini.']))
  }

  try {
    await rawConn.groupParticipantsUpdate(m.chat, [jid], 'add')
  } catch (err) {
    return m.reply(
      box([
        'TAMBAH MEMBER GAGAL',
        '',
        String(err?.message || err).slice(0, 200),
        '',
        'Kemungkinan: nomor tidak aktif, privasi grup, atau bot bukan admin.',
      ])
    )
  }

  let after = gate.metadata
  try {
    after = await rawConn.groupMetadata(m.chat)
  } catch {
    // keep the previous view
  }

  if (!findParticipant(after, jid)) {
    return m.reply(
      box([
        'TAMBAH MEMBER GAGAL',
        '',
        digits + ' tidak masuk group.',
        '',
        'Kemungkinan nomor tidak aktif, grup dalam mode privasi, atau bot bukan admin.',
      ])
    )
  }

  const total = Array.isArray(after.participants) ? after.participants.length : 0
  return m.reply(
    box([
      'MEMBER DITAMBAHKAN',
      '',
      'Nomor : ' + digits,
      'Total : ' + total + ' member',
      '',
      'Sapa dengan ' + usedPrefix + 'hidetag kalau mau member baru kelihatan.',
    ])
  )
}

handler.command = /^(add|tambah|invite)$/i
handler.help = ['add 628xxx', 'tambah 628xxx']
handler.menuHelp = ['add']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Tambahkan nomor ke group lewat kode negara'
handler.groupOnly = true

export default handler
