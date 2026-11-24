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

import { requireGroupAdmin, box } from '../../lib/grup.js'

const MAX_SUBJECT = 100
const MAX_DESCRIPTION = 2000

const handler = async (m, { rawConn, usedPrefix }) => {
  const action = String(m.command || '').toLowerCase()
  const renaming = action === 'setname' || action === 'gantinama'

  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const subject = gate.metadata.subject || 'Group'
  const value = (m.text || '').trim()
  const limit = renaming ? MAX_SUBJECT : MAX_DESCRIPTION

  if (!value) {
    return m.reply(
      box([
        renaming ? 'GANTI NAMA GROUP' : 'GANTI DESKRIPSI',
        '',
        renaming ? 'Nama group belum diisi.' : 'Deskripsi belum diisi.',
        '',
        'Contoh: ' + usedPrefix + (renaming ? 'setname Nano Bot Indonesia' : 'setdesc Aturan group: no spam.'),
        '',
        'Maksimal ' + limit + ' karakter.',
      ])
    )
  }

  if (value.length > limit) {
    return m.reply(
      box([
        'TERLALU PANJANG',
        '',
        'Karakter: ' + value.length + ' (maksimal ' + limit + ').',
        '',
        'Pendekkan dulu lalu coba lagi.',
      ])
    )
  }

  try {
    if (renaming) await rawConn.groupUpdateSubject(m.chat, value)
    else await rawConn.groupUpdateDescription(m.chat, value)
  } catch (err) {
    return m.reply(
      box([
        renaming ? 'GANTI NAMA GAGAL' : 'GANTI DESKRIPSI GAGAL',
        '',
        String(err?.message || err).slice(0, 200),
        '',
        'Bot harus *admin group* untuk mengubah ini.',
      ])
    )
  }

  /* Read back so the confirmation reports what WhatsApp actually stored. */
  let after = gate.metadata
  try {
    after = await rawConn.groupMetadata(m.chat)
  } catch {
    // keep the pre-update metadata
  }

  if (renaming) {
    return m.reply(
      box(['NAMA GROUP DIUBAH', '', 'Sebelum: ' + subject, 'Sekarang: ' + (after.subject || value)])
    )
  }

  const stored = String(after.description || '')
  const preview = stored.length > 160 ? stored.slice(0, 160) + '…' : stored
  return m.reply(
    box(['DESKRIPSI DIUBAH', '', 'Target: ' + subject, '', preview || '(kosong)'])
  )
}

handler.command = /^(setname|gantinama|setdesc|setdeskripsi)$/i
handler.help = ['setname', 'setdesc', 'gantinama', 'setdeskripsi']
handler.menuHelp = ['setname', 'setdesc']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Ubah nama atau deskripsi group'
handler.groupOnly = true

export default handler
