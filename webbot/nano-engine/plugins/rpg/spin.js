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
import { addExpWithLevelCheck } from '../../lib/rpg/level.js'
import { formatDuration } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { cekPenjara } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const SPIN_COOLDOWN = 86_400_000

const PRIZES = [
  { id: 'coin_small', label: 'Koin receh', weight: 25, coin: 2000, exp: 50, message: 'Mendarat di koin receh!' },
  { id: 'coin_mid', label: 'Koin lumayan', weight: 18, coin: 8000, exp: 120, message: 'Koin lumayan masuk dompet!' },
  { id: 'coin_big', label: 'Koin besar', weight: 8, coin: 25000, exp: 300, message: 'Jackpot koin kecil-kecilan!' },
  { id: 'exp_small', label: 'EXP', weight: 20, coin: 0, exp: 500, message: 'Kumpulan EXP!' },
  { id: 'exp_big', label: 'EXP besar', weight: 8, coin: 0, exp: 2000, message: 'EXP berlimpah!' },
  { id: 'potion', label: 'Health Potion', weight: 10, coin: 0, exp: 80, item: { key: 'potion', qty: 5 }, message: 'Potion langsung masuk tas!' },
  { id: 'stamina', label: 'Stamina terisi', weight: 7, coin: 0, exp: 60, stamina: 40, message: 'Stamina kamu dipulihkan!' },
  { id: 'nothing', label: 'Zonk', weight: 4, coin: 0, exp: 25, message: 'Bolong. Zonk, tapi masih dapat EXP.' },
]

function pickPrize() {
  const total = PRIZES.reduce((sum, prize) => sum + prize.weight, 0)
  let roll = Math.random() * total
  for (const prize of PRIZES) {
    roll -= prize.weight
    if (roll <= 0) return prize
  }
  return PRIZES[PRIZES.length - 1]
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const lastSpin = user.rpg.lastSpin || 0
  const remaining = SPIN_COOLDOWN - (Date.now() - lastSpin)

  if (remaining > 0) {
    return m.reply(`🎡 Roda harian belum siap. Tunggu *${formatDuration(remaining)}* lagi.`)
  }

  const prize = pickPrize()

  user.rpg.lastSpin = Date.now()
  user.koin += prize.coin
  if (prize.stamina) {
    user.rpg.stamina = Math.min(user.rpg.maxStamina, user.rpg.stamina + prize.stamina)
  }
  if (prize.item) {
    user.inventory[prize.item.key] = (user.inventory[prize.item.key] || 0) + prize.item.qty
  }
  trackStat(user, 'win')
  saveUser(m.sender, user)

  await m.react('🎡')
  await new Promise((resolve) => setTimeout(resolve, 2200))

  await addExpWithLevelCheck(sock, m, user, prize.exp)
  const gained = checkAchievements(user)
  if (gained.length) saveUser(m.sender, user)

  const summary = []
  if (prize.coin) summary.push(`+${rupiah(prize.coin)} koin`)
  if (prize.exp) summary.push(`+${prize.exp} EXP`)
  if (prize.stamina) summary.push(`+${prize.stamina} stamina`)
  if (prize.item) summary.push(`${prize.item.key} x${prize.item.qty}`)

  return sendRpgCard(sock, m, {
    type: 'reward',
    headerTitle: 'SPIN HARIAN',
    headerSubtitle: prize.label,
    data: {
      title: 'HASIL SPIN',
      subtitle: prize.label,
      result: prize.message,
      victory: prize.id !== 'nothing',
      stats: [
        { label: 'Hadiah', value: prize.label, color: '#e0c17b' },
        { label: 'Coin', value: prize.coin ? `+${rupiah(prize.coin)}` : '-', color: '#98d2b0' },
        { label: 'EXP', value: `+${prize.exp}`, color: '#68d5ff' },
        { label: 'Jeda', value: formatDuration(SPIN_COOLDOWN), color: '#b9a6f2' },
      ],
    },
    body: `${summary.join(' · ')}${gained.length ? ` · ${gained.length} achievement baru` : ''} · Berikutnya dalam ${formatDuration(SPIN_COOLDOWN)}`,
  })
}

/*
 * .spin DIHAPUS (2026-10-05): plugins/rpg/lottery.js (gacha) memegangnya
 * lebih dulu karena termuat lebih awal, jadi versi roda ini tidak pernah
 * terpakai. .roda dan .putar tetap utuh.
 *
 * Perhatikan: berkasnya bernama "spin" tapi command-nya bukan .spin.
 * Itu kebetulan urutan muat, bukan pilihan. Kalau .spin mau milik roda
 * di sini, .spin harus diambil dari lottery.js — tapi itu mengubah
 * perilaku .spin yang sekarang sudah jadi gacha.
 */
handler.command = /^(roda|putar)$/i
handler.help = ['roda', 'putar']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Roda keberuntungan harian (gratis sekali sehari)'

export default handler
