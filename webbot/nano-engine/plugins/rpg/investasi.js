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
import { enforceCooldown } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { cekPenjara } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const BASE_PRICE = 100
const MIN_TRADE = 500
const TRADE_COOLDOWN = 5_000

function daySeed() {
  const now = new Date()
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
}

function priceHistory(day) {
  const history = []
  let value = BASE_PRICE
  for (let i = day - 30; i <= day; i += 1) {
    const noise = Math.sin(i * 1.7) * 12 + Math.cos(i * 0.6) * 8 + Math.sin(i * 0.31) * 6
    const drift = (i - day + 30) * 0.15
    value = Math.max(45, Math.min(190, Math.round(BASE_PRICE + noise + drift)))
    history.push(value)
  }
  return history
}

function currentPrice(day) {
  const history = priceHistory(day)
  return history[history.length - 1]
}

function ensureInvest(user) {
  if (!user.rpg.invest || typeof user.rpg.invest !== 'object') {
    user.rpg.invest = { units: 0, cost: 0 }
  }
  if (!Array.isArray(user.rpg.invest.units) && typeof user.rpg.invest.units !== 'number') {
    user.rpg.invest.units = 0
  }
  return user.rpg.invest
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const amountStr = args[1]

  const day = daySeed()
  const price = currentPrice(day)
  const history = priceHistory(day)
  const invest = ensureInvest(user)
  const units = Number(invest.units) || 0
  const cost = Number(invest.cost) || 0
  const value = units * price
  const profit = value - cost

  if (action === 'beli' || action === 'buy') {
    const amount = amountStr === 'all' ? user.koin : parseInt(amountStr)

    if (!amount || amount <= 0) return m.reply('Masukkan jumlah koin yang mau diinvestasikan.')
    if (amount < MIN_TRADE) return m.reply(`Minimal investasi ${rupiah(MIN_TRADE)}.`)
    if (user.koin < amount) return m.reply(`Koin tidak cukup. Dompet: ${rupiah(user.koin)}.`)

    if (await enforceCooldown(m, 'invest_trade', TRADE_COOLDOWN)) return

    const bought = amount / price
    user.koin -= amount
    invest.units = units + bought
    invest.cost = cost + amount
    saveUser(m.sender, user)

    trackStat(user, 'marketTrades')
    checkAchievements(user)
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'bank',
      headerTitle: 'INVESTASI',
      headerSubtitle: 'Pembelian unit',
      data: {
        title: 'BELI UNIT',
        subtitle: `Harga ${price} per unit`,
        result: `+${bought.toFixed(2)} unit`,
        victory: true,
        stats: [
          { label: 'Belanja', value: `-${rupiah(amount)}`, color: '#e08c8c' },
          { label: 'Unit', value: (units + bought).toFixed(2), color: '#b9a6f2' },
          { label: 'Nilai', value: rupiah(Math.round((units + bought) * price)), color: '#98d2b0' },
        ],
      },
      body: `Beli ${bought.toFixed(2)} unit @ ${price} · Bayar -${rupiah(amount)} · Nilai portofolio ${rupiah(Math.round((units + bought) * price))}`,
    })
  }

  if (action === 'jual' || action === 'sell') {
    if (!units) return m.reply('Kamu belum punya unit investasi. Beli dulu dengan ' + m.prefix + 'invest beli 10000.')

    const requested = amountStr === 'all' ? units : parseInt(amountStr)
    if (!requested || requested <= 0) return m.reply('Masukkan jumlah unit yang mau dijual (atau *all*).')

    const sold = Math.min(requested, units)
    const income = Math.round(sold * price)
    const soldCost = units > 0 ? cost * (sold / units) : 0
    const earned = income - soldCost

    if (await enforceCooldown(m, 'invest_trade', TRADE_COOLDOWN)) return

    const remainingUnits = units - sold
    invest.units = remainingUnits
    invest.cost = Math.max(0, cost - soldCost)
    user.koin += income
    saveUser(m.sender, user)

    trackStat(user, 'marketTrades')
    checkAchievements(user)
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'bank',
      headerTitle: 'INVESTASI',
      headerSubtitle: 'Penjualan unit',
      data: {
        title: 'JUAL UNIT',
        subtitle: `Harga ${price} per unit`,
        result: earned >= 0 ? `Laba ${rupiah(earned)}` : `Rugi ${rupiah(Math.abs(earned))}`,
        victory: earned >= 0,
        stats: [
          { label: 'Masuk', value: `+${rupiah(income)}`, color: '#98d2b0' },
          { label: 'Unit sisa', value: remainingUnits.toFixed(2), color: '#b9a6f2' },
          { label: 'Selisih', value: (earned >= 0 ? '+' : '-') + rupiah(Math.abs(earned)), color: earned >= 0 ? '#98d2b0' : '#e08c8c' },
        ],
      },
      body: `Jual ${sold.toFixed(2)} unit @ ${price} · +${rupiah(income)} · ${earned >= 0 ? 'Laba' : 'Rugi'} ${rupiah(Math.abs(earned))}`,
    })
  }

  const trend = history[history.length - 1] - history[history.length - 2]
  const trendEmoji = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️'
  const chart = history.slice(-7).join(' → ')

  let txt = `📊 *INVESTASI*\n\n`
  txt += `Harga hari ini: *${price}* ${trendEmoji} (${trend >= 0 ? '+' : ''}${trend})\n`
  txt += `7 hari terakhir: ${chart}\n\n`
  txt += `Portofolio kamu: ${units.toFixed(2)} unit\n`
  txt += `Nilai sekarang: ${rupiah(Math.round(value))}\n`
  txt += `Modal: ${rupiah(Math.round(cost))}\n`
  txt += `Laba/rugi: ${profit >= 0 ? '+' : '-'}${rupiah(Math.abs(Math.round(profit)))} ${profit >= 0 ? '🟢' : '🔴'}\n\n`
  txt += `Beli: ${m.prefix}invest beli <koin>\n`
  txt += `Jual: ${m.prefix}invest jual <unit|all>\n`

  return sendRpgCard(sock, m, {
    type: 'bank',
    headerTitle: 'INVESTASI',
    headerSubtitle: `Harga ${price} ${trendEmoji}`,
    data: {
      title: 'PORTOFOLIO',
      subtitle: `Harga ${price} per unit`,
      result: units ? `${units.toFixed(2)} unit` : 'Belum ada unit',
      victory: profit >= 0,
      stats: [
        { label: 'Harga', value: `${price} ${trend >= 0 ? '+' + trend : String(trend)}`, color: trend >= 0 ? '#98d2b0' : '#e08c8c' },
        { label: 'Unit', value: units.toFixed(2), color: '#b9a6f2' },
        { label: 'Nilai', value: rupiah(Math.round(value)), color: '#98d2b0' },
        { label: 'Laba', value: (profit >= 0 ? '+' : '-') + rupiah(Math.abs(Math.round(profit))), color: profit >= 0 ? '#98d2b0' : '#e08c8c' },
      ],
    },
    body: `${txt.replace(/\n{2,}/g, '\n')}`,
  })
}

handler.command = /^(invest|saham|bursa)$/i
handler.help = ['invest', 'saham', 'bursa']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Investasi unit dengan harga berubah tiap hari'

export default handler
