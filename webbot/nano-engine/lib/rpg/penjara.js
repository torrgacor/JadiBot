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

import { isJailed, setJail, addWanted } from './database.js'
import { formatDuration } from './cooldown.js'

const WANTED_LABELS = ['Bersih', 'Dicari', 'Buronan', 'Buronan Berbahaya', 'Target Utama', 'Paling Dicari']

function wantedLabel(level) {
  return WANTED_LABELS[Math.min(Math.max(level, 0), WANTED_LABELS.length - 1)]
}

function jailDurationForWanted(level) {
  return Math.max(1, level) * 5 * 60 * 1000
}

function bailCostForWanted(level) {
  return Math.max(1, level) * 5000
}

async function cekPenjara(m, user) {
  if (!isJailed(user)) return false

  const remaining = user.rpg.jail.until - Date.now()
  await m.reply(
    `⛓️ Kamu sedang dipenjara karena *${user.rpg.jail.reason}*.\n` +
    `Sisa waktu: *${formatDuration(remaining)}*.\n\n` +
    `Tunggu sampai bebas, atau bayar bail dengan \`${m.prefix}penjara bail\`.`
  )
  return true
}

async function penjarakan(user, level, reason) {
  const duration = jailDurationForWanted(level)
  setJail(user, duration, reason)
  addWanted(user, 1, reason)
  return duration
}

export {
  cekPenjara,
  penjarakan,
  jailDurationForWanted,
  bailCostForWanted,
  wantedLabel,
  WANTED_LABELS,
}

export default {
  cekPenjara,
  penjarakan,
  jailDurationForWanted,
  bailCostForWanted,
  wantedLabel,
  WANTED_LABELS,
}
