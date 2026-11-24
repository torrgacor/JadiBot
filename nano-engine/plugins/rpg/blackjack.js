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

const SUITS = ['♠️', '♥️', '♦️', '♣️']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const MIN_BET = 1000
const BLACKJACK_PAYOUT = 2.5
const WIN_PAYOUT = 2

function drawCard() {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)]
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)]
  return { suit, rank }
}

function cardValue(rank) {
  if (rank === 'A') return 11
  if (['J', 'Q', 'K'].includes(rank)) return 10
  return Number(rank)
}

function handValue(hand) {
  let total = 0
  let aces = 0
  for (const card of hand) {
    total += cardValue(card.rank)
    if (card.rank === 'A') aces += 1
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

function renderHand(hand) {
  return hand.map((card) => `${card.rank}${card.suit}`).join(' ')
}

function cardPayload(state) {
  return {
    type: 'boss',
    headerTitle: 'BLACKJACK',
    headerSubtitle: state.finished ? state.status : 'Giliranmu',
    data: {
      name: 'BLACKJACK',
      status: state.status,
      hp: handValue(state.player),
      maxHp: 21,
      victory: state.win === true ? true : state.win === false ? false : undefined,
      damage: state.bet,
      round: handValue(state.player),
      exp: state.exp || 0,
      koin: state.payout || 0,
      loot: `Kamu: ${renderHand(state.player)} (${handValue(state.player)})`,
      stats: [
        { label: 'Bet', value: rupiah(state.bet), color: '#e0c17b' },
        { label: 'Total', value: String(handValue(state.player)), color: '#68d5ff' },
        { label: 'Dealer', value: state.finished ? String(handValue(state.dealer)) : `${handValue([state.dealer[0]])}+?`, color: '#b9a6f2' },
      ],
    },
    body: `Kartu kamu: ${renderHand(state.player)} (${handValue(state.player)})\nDealer: ${state.finished ? renderHand(state.dealer) : `${renderHand([state.dealer[0]])} ?`}\n${state.message || ''}`,
  }
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const state = user.rpg.blackjack

  if (action === 'hit' || action === 'stand') {
    if (!state || state.finished) {
      return m.reply(`Tidak ada permainan aktif. Mulai dengan \`${m.prefix}blackjack <taruhan>\`.`)
    }

    if (action === 'hit') {
      state.player.push(drawCard())
      const total = handValue(state.player)

      if (total > 21) {
        state.finished = true
        state.win = false
        state.status = 'BUST!'
        state.message = 'Kamu melebihi 21. Taruhan hangus.'
        saveUser(m.sender, user)
        return sendRpgCard(sock, m, cardPayload(state))
      }

      saveUser(m.sender, user)
      return sendRpgCard(sock, m, cardPayload(state))
    }

    while (handValue(state.dealer) < 17) state.dealer.push(drawCard())

    const playerTotal = handValue(state.player)
    const dealerTotal = handValue(state.dealer)
    const isBlackjack = state.player.length === 2 && playerTotal === 21
    let payout = 0
    let expGain = 0

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      payout = isBlackjack ? Math.floor(state.bet * BLACKJACK_PAYOUT) : state.bet * WIN_PAYOUT
      state.win = true
      state.status = isBlackjack ? 'BLACKJACK!' : 'MENANG!'
      expGain = 100
    } else if (playerTotal === dealerTotal) {
      payout = state.bet
      state.win = null
      state.status = 'SERI'
      expGain = 30
    } else {
      state.win = false
      state.status = 'KALAH'
    }

    user.koin += payout
    state.finished = true
    state.payout = payout
    state.exp = expGain
    state.message = `Dealer: ${dealerTotal} · Kamu: ${playerTotal}`
    trackStat(user, 'gamble')
    if (state.win) trackStat(user, 'win')
    saveUser(m.sender, user)

    if (expGain > 0) await addExpWithLevelCheck(sock, m, user, expGain)
    const gained = checkAchievements(user)
    if (gained.length) saveUser(m.sender, user)

    return sendRpgCard(sock, m, cardPayload(state))
  }

  const bet = parseInt(action)

  if (!bet || bet < MIN_BET) {
    return m.reply(
      `🃏 *Blackjack*\n\n` +
      `\`${m.prefix}blackjack <taruhan>\` — mulai main\n` +
      `\`${m.prefix}blackjack hit\` — tambah kartu\n` +
      `\`${m.prefix}blackjack stand\` — selesai & lihat dealer\n\n` +
      `Taruhan minimal ${rupiah(MIN_BET)}. Blackjack bayaran 2.5x, menang 2x.`
    )
  }

  if (state && !state.finished) {
    return m.reply(`Masih ada permainan berjalan. Selesaikan dulu dengan \`${m.prefix}blackjack stand\`.`)
  }

  if (await enforceCooldown(m, 'blackjack', 10_000)) return

  if (user.koin < bet) {
    return m.reply(`Koin kamu tidak cukup. Dompet: ${rupiah(user.koin)}.`)
  }

  user.koin -= bet
  user.rpg.blackjack = {
    bet,
    player: [drawCard(), drawCard()],
    dealer: [drawCard(), drawCard()],
    finished: false,
    win: null,
    status: 'BERJALAN',
    message: `Ketik \`${m.prefix}blackjack hit\` untuk tambah kartu atau \`${m.prefix}blackjack stand\` untuk selesai.`,
  }

  const started = user.rpg.blackjack

  if (handValue(started.player) === 21) {
    const payout = Math.floor(bet * BLACKJACK_PAYOUT)
    user.koin += payout
    started.finished = true
    started.win = true
    started.status = 'BLACKJACK!'
    started.payout = payout
    started.exp = 100
    started.message = 'Blackjack langsung! Bayaran 2.5x.'
    trackStat(user, 'gamble')
    trackStat(user, 'win')
  } else {
    trackStat(user, 'gamble')
  }

  saveUser(m.sender, user)

  if (started.finished && started.exp) {
    await addExpWithLevelCheck(sock, m, user, started.exp)
    const gained = checkAchievements(user)
    if (gained.length) saveUser(m.sender, user)
  }

  return sendRpgCard(sock, m, cardPayload(started))
}

handler.command = /^(blackjack|bj|21)$/i
handler.help = ['blackjack', 'bj', '21']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Main blackjack melawan dealer bot'

export default handler
