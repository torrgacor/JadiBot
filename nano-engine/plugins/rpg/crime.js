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

import { getUser, saveUser, addWanted } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/level.js'
import { enforceCooldown } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { cekPenjara, wantedLabel } from '../../lib/rpg/penjara.js'
import { trackStat, setStatMax, checkAchievements } from '../../lib/rpg/achievements.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'crime', 300_000)) return

  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  await m.react('💣')
  await m.reply('💣 Memasang alat peretas di ATM seberang jalan...')
  await new Promise((r) => setTimeout(r, 2500))

  const isSuccess = Math.random() < 0.5

  if (isSuccess) {
    const stolen = Math.floor(Math.random() * 15000) + 5000
    const expGain = Math.floor(stolen / 20)

    user.koin += stolen
    trackStat(user, 'crime')
    trackStat(user, 'win')
    const wantedLevel = addWanted(user, 1, 'Hacking ATM')
    setStatMax(user, 'wantedMax', wantedLevel)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)
    const gained = checkAchievements(user)
    if (gained.length) saveUser(m.sender, user)

    return m.reply(`💻 *Hacking Sukses!*\n\n💰 Hasil: +${rupiah(stolen)}\n📈 EXP: +${expGain}\n🚨 Wanted: ${wantedLevel}/5 (${wantedLabel(wantedLevel)})`)
  }

  const fine = Math.floor(Math.random() * 10000) + 5000
  const actualFine = Math.min(fine, user.koin)

  user.koin = Math.max(0, user.koin - actualFine)
  user.rpg.health = Math.max(0, user.rpg.health - 15)
  const wantedLevel = addWanted(user, 1, 'Hacking gagal')
  setStatMax(user, 'wantedMax', wantedLevel)
  saveUser(m.sender, user)

  return m.reply(`🚨 *Tertangkap Polisi!*\n\n💸 Denda: -${rupiah(actualFine)}\n🤕 HP: -15\n🚔 Wanted: ${wantedLevel}/5 (${wantedLabel(wantedLevel)})`)
}

handler.command = /^crime$/i
handler.help = ['crime', 'jahat']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Melakukan kejahatan membobol ATM (risiko tinggi)'

export default handler
