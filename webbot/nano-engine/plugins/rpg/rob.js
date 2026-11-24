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

  const target = m.targetJid

  if (!target) {
    return m.reply(`Tag atau reply target yang mau dirampok.\nContoh: \`${m.prefix}rob @user\``)
  }

  if (target === m.sender) {
    return m.reply(`Tidak bisa merampok diri sendiri.`)
  }

  if (await enforceCooldown(m, 'rob', 600_000)) return

  const robber = getUser(m.sender)
  if (await cekPenjara(m, robber)) return
  const victim = getUser(target)

  if ((victim.koin || 0) < 1000) {
    return m.reply(`Target ini terlalu miskin untuk dirampok (koin di bawah Rp 1.000).`)
  }

  if (robber.rpg.health < 30) {
    return m.reply(`❤️ HP kamu terlalu rendah untuk beraksi. Minimal *30 HP*, HP kamu sekarang *${robber.rpg.health}*.`)
  }

  await m.react('🦹')
  await m.reply('🦹 Bersembunyi di gang gelap, menunggu target lewat...')
  await new Promise((r) => setTimeout(r, 2500))

  const isSuccess = Math.random() < 0.4

  if (isSuccess) {
    const maxSteal = Math.floor(victim.koin * 0.3)
    const stolen = Math.floor(Math.random() * maxSteal) + 1000

    victim.koin -= stolen
    robber.koin += stolen
    trackStat(robber, 'crime')
    trackStat(robber, 'win')
    const wantedLevel = addWanted(robber, 1, 'Perampokan')
    setStatMax(robber, 'wantedMax', wantedLevel)
    saveUser(target, victim)
    saveUser(m.sender, robber)

    const expGain = 300
    await addExpWithLevelCheck(sock, m, robber, expGain)
    const gained = checkAchievements(robber)
    if (gained.length) saveUser(m.sender, robber)

    return m.reply(
      `🦹 *Rampokan Berhasil!*\n\nBerhasil merampok @${target.split('@')[0]}.\n💰 Hasil: +${rupiah(stolen)}\n📈 EXP: +${expGain}\n🚨 Wanted: ${wantedLevel}/5 (${wantedLabel(wantedLevel)})`,
      { mentions: [target] }
    )
  }

  const fine = Math.floor(Math.random() * 10000) + 5000
  const actualFine = Math.min(fine, robber.koin)
  const healthLoss = 25

  robber.koin = Math.max(0, robber.koin - actualFine)
  robber.rpg.health = Math.max(0, robber.rpg.health - healthLoss)
  const wantedLevel = addWanted(robber, 1, 'Perampokan gagal')
  setStatMax(robber, 'wantedMax', wantedLevel)
  saveUser(m.sender, robber)

  return m.reply(`🚨 *Ketahuan Warga!*\n\nDihajar warga sekitar.\n💸 Denda: -${rupiah(actualFine)}\n🤕 HP: -${healthLoss}\n🚔 Wanted: ${wantedLevel}/5 (${wantedLabel(wantedLevel)})`)
}

handler.command = /^rob$/i
handler.help = ['rob', 'rampok', 'mug']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.description = 'Merampok koin player lain (berisiko)'
handler.groupOnly = true

export default handler
