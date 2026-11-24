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
import { enforceCooldown } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { cekPenjara } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])
const MIN_BET = 1000

const BET_TYPES = {
  red: { label: 'MERAH', payout: 2, matches: (n) => REDS.has(n) },
  merah: { label: 'MERAH', payout: 2, matches: (n) => REDS.has(n) },
  black: { label: 'HITAM', payout: 2, matches: (n) => n !== 0 && !REDS.has(n) },
  hitam: { label: 'HITAM', payout: 2, matches: (n) => n !== 0 && !REDS.has(n) },
  even: { label: 'GENAP', payout: 2, matches: (n) => n !== 0 && n % 2 === 0 },
  genap: { label: 'GENAP', payout: 2, matches: (n) => n !== 0 && n % 2 === 0 },
  odd: { label: 'GANJIL', payout: 2, matches: (n) => n !== 0 && n % 2 === 1 },
  ganjil: { label: 'GANJIL', payout: 2, matches: (n) => n !== 0 && n % 2 === 1 },
  low: { label: '1-18', payout: 2, matches: (n) => n >= 1 && n <= 18 },
  high: { label: '19-36', payout: 2, matches: (n) => n >= 19 && n <= 36 },
  kecil: { label: '1-18', payout: 2, matches: (n) => n >= 1 && n <= 18 },
  besar: { label: '19-36', payout: 2, matches: (n) => n >= 19 && n <= 36 },
}

function spinWheel() {
  return Math.floor(Math.random() * 37)
}

function wheelColor(n) {
  if (n === 0) return '🟢'
  return REDS.has(n) ? '🔴' : '⚫'
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const args = m.args || []

  if (args.length < 2) {
    return m.reply(
      `🎡 *Roulette*\n\n` +
      `\`${m.prefix}roulette <taruhan> <pilihan>\`\n\n` +
      `Pilihan: *merah*/*hitam* (2x), *genap*/*ganjil* (2x), *kecil*/*besar* (2x), atau angka *0-36* (35x).\n` +
      `Contoh: \`${m.prefix}roulette 5000 merah\``
    )
  }

  const bet = parseInt(args[0])
  const choice = args[1]?.toLowerCase()

  if (!bet || bet < MIN_BET) {
    return m.reply(`Taruhan minimal ${rupiah(MIN_BET)}.`)
  }

  const numericChoice = /^\d+$/.test(choice) ? parseInt(choice) : null
  const betType = numericChoice === null ? BET_TYPES[choice] : null

  if (numericChoice === null && !betType) {
    return m.reply(`Pilihan *${choice}* tidak valid. Gunakan merah/hitam/genap/ganjil/kecil/besar atau angka 0-36.`)
  }

  if (numericChoice !== null && (numericChoice < 0 || numericChoice > 36)) {
    return m.reply(`Angka roulette hanya 0-36.`)
  }

  if (await enforceCooldown(m, 'roulette', 15_000)) return

  if (user.koin < bet) {
    return m.reply(`Koin kamu tidak cukup. Dompet: ${rupiah(user.koin)}.`)
  }

  user.koin -= bet
  saveUser(m.sender, user)

  await m.react('🎡')
  await new Promise((r) => setTimeout(r, 2500))

  const result = spinWheel()
  let payout = 0
  let expGain = 20

  if (numericChoice !== null) {
    if (numericChoice === result) {
      payout = bet * 35
      expGain = 200
    }
  } else if (betType.matches(result)) {
    payout = bet * betType.payout
    expGain = 80
  }

  user.koin += payout
  trackStat(user, 'gamble')
  if (payout > bet) trackStat(user, 'win')
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)
  const gained = checkAchievements(user)
  if (gained.length) saveUser(m.sender, user)

  const label = numericChoice !== null ? `Angka ${numericChoice}` : betType.label
  const won = payout > 0

  return sendRpgCard(sock, m, {
    type: 'boss',
    headerTitle: 'ROULETTE',
    headerSubtitle: `Hasil: ${result} ${wheelColor(result)}`,
    data: {
      name: 'ROULETTE',
      status: won ? 'MENANG' : 'KALAH',
      hp: result,
      maxHp: 36,
      victory: won,
      damage: bet,
      round: result,
      exp: expGain,
      koin: payout,
      loot: `Taruhan: ${label} · Bola mendarat di ${result} ${wheelColor(result)}`,
      stats: [
        { label: 'Bet', value: rupiah(bet), color: '#e0c17b' },
        { label: 'Hasil', value: `${result} ${wheelColor(result)}`, color: won ? '#98d2b0' : '#e08c8c' },
        { label: 'Payout', value: payout > 0 ? `+${rupiah(payout)}` : '-', color: '#68d5ff' },
      ],
    },
    body: `${won ? '🎉' : '😭'} ${label} · Bola: ${result} ${wheelColor(result)} · ${won ? `Menang +${rupiah(payout)}` : `Kalah -${rupiah(bet)}`}${gained.length ? ` · ${gained.length} achievement baru` : ''}`,
  })
}

handler.command = /^(roulette|rolet)$/i
handler.help = ['roulette', 'rolet']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Main roulette dengan berbagai pilihan taruhan'

export default handler
