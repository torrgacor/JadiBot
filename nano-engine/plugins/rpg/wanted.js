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

import { getUser, getAllUsers, getWantedLevel } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { wantedLabel } from '../../lib/rpg/penjara.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const ownLevel = getWantedLevel(user)

  const buronan = getAllUsers()
    .map((candidate) => ({ jid: candidate.jid, level: getWantedLevel(candidate) }))
    .filter((entry) => entry.level > 0)
    .sort((a, b) => b.level - a.level)
    .slice(0, 7)

  const bodyLines = buronan.length
    ? buronan.map((entry, index) => `${index + 1}. @${entry.jid} — ${entry.level}/5`).join('\n')
    : 'Tidak ada buronan saat ini. Semua warga bersih.'

  return sendRpgCard(sock, m, {
    type: 'leaderboard',
    headerTitle: 'DAFTAR BURONAN',
    headerSubtitle: `Wanted kamu ${ownLevel}/5`,
    data: {
      category: 'Wanted List',
      players: buronan.map((entry) => ({
        name: `@${entry.jid}`,
        value: `${entry.level}/5 ${wantedLabel(entry.level)}`,
      })),
    },
    body: `${bodyLines}\n\nWanted kamu: ${ownLevel}/5 (${wantedLabel(ownLevel)})\nTangkap buronan: ${m.prefix}tangkap @user`,
    mentions: buronan.map((entry) => `${entry.jid}@s.whatsapp.net`),
  })
}

handler.command = /^(wanted|buronan|dicari)$/i
handler.help = ['wanted', 'buronan', 'dicari']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Melihat daftar buronan dan wanted level'

export default handler
