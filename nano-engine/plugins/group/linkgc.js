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

const handler = async (m, { rawConn, usedPrefix }) => {
  const action = String(m.command || '').toLowerCase()
  const revoking = action === 'revoke' || action === 'revokelink'

  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const subject = gate.metadata.subject || 'Group'

  if (revoking) {
    let code = ''
    try {
      const revoked = await rawConn.groupRevokeInvite(m.chat)
      // Baileys hands back the new code; only fall back to a separate read if
      // it does not, so we never echo the link we just invalidated.
      if (typeof revoked === 'string' && revoked) code = revoked
    } catch (err) {
      return m.reply(
        box(['RESET LINK GAGAL', '', String(err?.message || err).slice(0, 200), '', 'Hanya admin group yang bisa mereset link.'])
      )
    }

    if (!code) {
      try {
        code = (await rawConn.groupInviteCode(m.chat)) || ''
      } catch {
        // WhatsApp sometimes withholds the fresh code right after a reset
      }
    }

    const lines = ['RESET LINK BERHASIL', '', 'Link lama sudah *dicabut* dan tidak berlaku lagi.', '', 'Target: ' + subject]
    if (code) {
      lines.push('', 'Link baru:', 'https://chat.whatsapp.com/' + code)
    } else {
      lines.push('', 'Link baru belum bisa dibaca. Coba ' + usedPrefix + 'link beberapa saat lagi.')
    }
    return m.reply(box(lines))
  }

  try {
    const code = await rawConn.groupInviteCode(m.chat)
    if (!code) throw new Error('Link undangan tidak tersedia.')

    return m.reply(
      box([
        'LINK GROUP',
        '',
        'Nama: ' + subject,
        '',
        'https://chat.whatsapp.com/' + code,
        '',
        '⚠ Link ini bisa dipakai siapa saja untuk masuk.',
        'Reset dengan: ' + usedPrefix + 'revoke',
      ])
    )
  } catch (err) {
    return m.reply(
      box([
        'LINK GROUP GAGAL',
        '',
        String(err?.message || err).slice(0, 200),
        '',
        'Bot harus *admin group* untuk membaca link undangan.',
      ])
    )
  }
}

handler.command = /^(link|grouplink|tautangc|revoke|revokelink)$/i
handler.help = ['link', 'revoke', 'grouplink', 'revokelink']
handler.menuHelp = ['link', 'revoke']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Lihat atau reset link undangan group'
handler.groupOnly = true

export default handler
