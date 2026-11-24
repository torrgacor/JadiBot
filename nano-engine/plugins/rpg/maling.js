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

const OUTCOMES = [
  { success: true, type: 'big', money: 20000, exp: 500, weight: 5, msg: 'Dapat dompet berisi uang gepokan!' },
  { success: true, type: 'medium', money: 8000, exp: 200, weight: 20, msg: 'Dapat dompet kulit isi lumayan.' },
  { success: true, type: 'small', money: 2000, exp: 50, weight: 30, msg: 'Dapat dompet isi recehan, tapi lumayan.' },
  { success: false, type: 'caught', fine: 15000, health: 30, weight: 15, msg: 'Ketahuan dan dihajar massa!' },
  { success: false, type: 'police', fine: 25000, health: 10, weight: 10, msg: 'Ditangkap polisi menyamar!' },
  { success: false, type: 'fail', fine: 0, health: 0, weight: 20, msg: 'Target sadar, gagal total.' },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'maling', 180_000)) return

  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return
  user.rpg.health = user.rpg.health || 100

  if (user.rpg.health < 40) {
    return m.reply(`🤒 HP kamu terlalu rendah untuk beraksi. Minimal *40 HP*, sekarang *${user.rpg.health} HP*.`)
  }

  await m.react('🦹')
  await m.reply('🦹 Nyempil di keramaian pasar, mengincar tas...')
  await new Promise((r) => setTimeout(r, 2500))

  const rand = Math.random() * 100
  let cumulative = 0
  let outcome = OUTCOMES[OUTCOMES.length - 1]
  for (const o of OUTCOMES) {
    cumulative += o.weight
    if (rand <= cumulative) {
      outcome = o
      break
    }
  }

  let txt = ''

  if (outcome.success) {
    user.koin += outcome.money
    trackStat(user, 'crime')
    trackStat(user, 'win')
    const wantedLevel = addWanted(user, 1, 'Mencopet')
    setStatMax(user, 'wantedMax', wantedLevel)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, outcome.exp)
    const gained = checkAchievements(user)
    if (gained.length) saveUser(m.sender, user)

    txt = `🦹 *Operasi Berhasil*\n\n${outcome.msg}\n\n💰 Koin: +${rupiah(outcome.money)}\n📈 EXP: +${outcome.exp}\n🚨 Wanted: ${wantedLevel}/5 (${wantedLabel(wantedLevel)})`
  } else {
    const actualFine = Math.min(outcome.fine, user.koin)
    user.koin = Math.max(0, user.koin - actualFine)
    user.rpg.health = Math.max(0, user.rpg.health - outcome.health)
    const wantedLevel = addWanted(user, 1, 'Copet tertangkap')
    setStatMax(user, 'wantedMax', wantedLevel)

    txt = `🚨 *Ketahuan!*\n\n${outcome.msg}\n`
    if (outcome.fine > 0) txt += `\n💸 Denda: -${rupiah(actualFine)}`
    if (outcome.health > 0) txt += `\n🤕 HP: -${outcome.health}`
    txt += `\n🚔 Wanted: ${wantedLevel}/5 (${wantedLabel(wantedLevel)})`

    if (user.rpg.health <= 0) {
      user.rpg.health = 0
      user.exp = Math.floor((user.exp || 0) / 2)
      txt += `\n\n💀 Kamu pingsan digebuk massa. EXP hangus 50%.`
    }

    saveUser(m.sender, user)
  }

  await m.reply(txt)
}

handler.command = /^(maling|copet)$/i
handler.help = ['maling', 'copet']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mencopet orang di pasar (lebih berisiko dari crime)'

export default handler
