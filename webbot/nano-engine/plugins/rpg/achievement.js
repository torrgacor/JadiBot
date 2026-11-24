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

import { getUser, saveUser } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { listAchievements, checkAchievements } from '../../lib/rpg/achievements.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()

  if (action === 'cek' || action === 'check') {
    const gained = checkAchievements(user)
    if (!gained.length) {
      return m.reply(`Tidak ada achievement baru. Terus mainkan fitur RPG untuk membukanya!`)
    }

    saveUser(m.sender, user)

    let txt = `🎉 *ACHIEVEMENT BARU!*\n\n`
    let totalReward = 0
    for (const achievement of gained) {
      totalReward += achievement.reward || 0
      txt += `${achievement.icon} *${achievement.name}* — ${achievement.desc}\n+${rupiah(achievement.reward || 0)}\n\n`
    }
    txt += `💰 Total hadiah: *${rupiah(totalReward)}*`

    return m.reply(txt)
  }

  const achievements = listAchievements(user)
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length

  if (action === 'lencana' || action === 'badge') {
    const unlocked = achievements.filter((achievement) => achievement.unlocked)
    if (!unlocked.length) {
      return m.reply(`Belum ada lencana yang terbuka. Lihat daftar dengan \`${m.prefix}achievement\`.`)
    }
    let txt = `🏅 *Lencana Terbuka (${unlockedCount}/${achievements.length})*\n\n`
    for (const achievement of unlocked) {
      txt += `${achievement.icon} ${achievement.name}\n`
    }
    return m.reply(txt)
  }

  const visible = achievements.slice(0, 12)
  const bodyLines = visible.map((achievement) => {
    const status = achievement.unlocked ? '✅' : `(${achievement.progress}/${achievement.goal || 1})`
    return `${achievement.icon} ${achievement.name} ${status}`
  })

  return sendRpgCard(sock, m, {
    type: 'leaderboard',
    headerTitle: 'ACHIEVEMENT',
    headerSubtitle: `${unlockedCount}/${achievements.length} terbuka`,
    data: {
      category: 'Lencana & Achievement',
      players: visible.map((achievement) => ({
        name: `${achievement.icon} ${achievement.name}`,
        value: achievement.unlocked ? 'TERBUKA' : `${achievement.progress}/${achievement.goal || 1}`,
      })),
    },
    body: `${bodyLines.join('\n')}\n\nCek achievement baru: ${m.prefix}achievement cek`,
  })
}

handler.command = /^(achievement|achieve|achv|lencana|badge)$/i
handler.help = ['achievement', 'lencana', 'badge']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Melihat achievement/lencana yang sudah dibuka'

export default handler
