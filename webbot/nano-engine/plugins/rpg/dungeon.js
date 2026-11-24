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

const ENTRY_COST = 20
const MOVE_COOLDOWN = 15_000

const ROOMS = [
  { name: 'Gerbang Hutan', mob: 'Serigala Hutan', hp: 60, atk: 6, coin: 2500, exp: 300 },
  { name: 'Gua Kelelawar', mob: 'Ratu Kelelawar', hp: 110, atk: 10, coin: 5000, exp: 600 },
  { name: 'Ruang Racun', mob: 'Siluman Racun', hp: 170, atk: 15, coin: 9000, exp: 1100 },
  { name: 'Aula Ratu', mob: 'Ksatria Bayangan', hp: 260, atk: 22, coin: 15000, exp: 1800 },
  { name: 'Trono Kuno', mob: 'Raja Iblis', hp: 400, atk: 32, coin: 30000, exp: 3500 },
]

const HEAL_PER_ROOM = 0.25

const LOOT_TABLE = [
  { id: 'potion', label: 'Health Potion', chance: 25, qty: 3 },
  { id: 'diamond', label: 'Berlian', chance: 12, qty: 1 },
  { id: 'gold', label: 'Emas', chance: 30, qty: 2 },
  { id: 'elixir', label: 'Elixir', chance: 6, qty: 1 },
  { id: 'uncommon', label: 'Uncommon Crate', chance: 15, qty: 1 },
]

function rollLoot() {
  for (const entry of LOOT_TABLE) {
    if (Math.random() * 100 < entry.chance) return entry
  }
  return null
}

function startRun(user) {
  const runHp = Math.max(user.rpg.maxHealth, Math.round(user.rpg.maxHealth * 1.5))
  user.rpg.dungeon = {
    room: 0,
    hp: runHp,
    maxHp: runHp,
    coin: 0,
    exp: 0,
    loot: {},
    startedAt: Date.now(),
  }
  return user.rpg.dungeon
}

function lootText(run) {
  return Object.entries(run.loot)
    .map(([key, qty]) => `${key} x${qty}`)
    .join(', ')
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const run = user.rpg.dungeon

  if (action === 'mundur' || action === 'withdraw' || action === 'kabur') {
    if (!run) return m.reply('Kamu tidak sedang menjalankan dungeon.')

    const bankedCoin = run.coin
    const bankedExp = run.exp
    const bankedLoot = lootText(run)

    user.koin += bankedCoin
    trackStat(user, 'win')
    user.rpg.dungeon = null
    saveUser(m.sender, user)
    if (bankedExp > 0) await addExpWithLevelCheck(sock, m, user, bankedExp)
    checkAchievements(user)
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'reward',
      headerTitle: 'DUNGEON',
      headerSubtitle: 'Kamu mundur dengan selamat',
      data: {
        title: 'RUN SELESAI',
        subtitle: 'Hasil dibawa pulang',
        result: `Berakhir di ruang ${run.room + 1}`,
        victory: true,
        stats: [
          { label: 'Coin', value: `+${rupiah(bankedCoin)}`, color: '#e0c17b' },
          { label: 'EXP', value: `+${bankedExp}`, color: '#68d5ff' },
          { label: 'Ruang', value: `${run.room}/${ROOMS.length}`, color: '#b9a6f2' },
        ],
      },
      body: `Coins +${rupiah(bankedCoin)} · EXP +${bankedExp}${bankedLoot ? ' · Loot: ' + bankedLoot : ''}`,
    })
  }

  if (action === 'lanjut' || action === 'next' || action === 'lawan') {
    if (!run) return m.reply('Kamu belum mulai dungeon. Mulai dengan ' + m.prefix + 'dungeon mulai.')

    if (await enforceCooldown(m, 'dungeon_move', MOVE_COOLDOWN)) return

    if (run.room >= ROOMS.length) return m.reply('Semua ruangan sudah ditaklukkan. Mundur untuk mengambil hadiah.')

    const room = ROOMS[run.room]
    const playerAtk = (user.rpg.attack || 10) + (user.level || 1) * 3
    const playerDef = (user.rpg.defense || 5) + (user.level || 1)
    const levelScale = 1 + (user.level - 1) * 0.12
    const monsterHp = Math.round(room.hp * levelScale)
    const monsterAtk = room.atk

    let mobHp = monsterHp
    let heroHp = run.hp
    let rounds = 0

    while (mobHp > 0 && heroHp > 0 && rounds < 40) {
      rounds += 1
      const heroDamage = Math.max(15, Math.round(playerAtk * 2.5 - monsterAtk * 0.1) + Math.floor(Math.random() * 20))
      mobHp -= heroDamage
      if (mobHp <= 0) break
      const mobDamage = Math.max(2, Math.round(monsterAtk * 0.7 - playerDef * 0.3) + Math.floor(Math.random() * 8))
      heroHp -= mobDamage
    }

    run.hp = Math.max(0, heroHp)

    if (heroHp <= 0) {
      const lost = Math.floor(run.coin / 2)
      run.coin -= lost
      user.koin += run.coin
      user.rpg.health = Math.max(1, Math.floor(user.rpg.maxHealth / 4))
      user.rpg.dungeon = null
      trackStat(user, 'boss')
      saveUser(m.sender, user)

      return sendRpgCard(sock, m, {
        type: 'boss',
        headerTitle: 'DUNGEON',
        headerSubtitle: 'Run gagal',
        data: {
          name: room.mob,
          status: 'KAMU TERJATUH',
          hp: 0,
          maxHp: monsterHp,
          victory: false,
          damage: playerAtk,
          round: rounds,
          exp: 0,
          koin: run.coin,
          loot: `Runtuh di ${room.name}`,
        },
        body: `Kamu kalah dari ${room.mob} · Selamatkan ${rupiah(run.coin)} · Hilang ${rupiah(lost)}`,
      })
    }

    run.room += 1
    run.coin += room.coin
    run.exp += room.exp
    const healed = Math.round(run.maxHp * HEAL_PER_ROOM)
    run.hp = Math.min(run.maxHp, run.hp + healed)
    trackStat(user, 'win')

    const loot = rollLoot()
    if (loot) run.loot[loot.id] = (run.loot[loot.id] || 0) + loot.qty

    const clearedAll = run.room >= ROOMS.length
    user.rpg.dungeon = run
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'boss',
      headerTitle: 'DUNGEON',
      headerSubtitle: clearedAll ? 'Semua ruangan ditaklukkan!' : `Ruang ${run.room} selesai`,
      data: {
        name: room.mob,
        status: clearedAll ? 'RUN BEREH' : 'RANTAI MENANG',
        hp: run.hp,
        maxHp: run.maxHp,
        victory: true,
        damage: playerAtk,
        round: rounds,
        exp: run.exp,
        koin: run.coin,
        loot: loot ? `Loot: ${loot.label} x${loot.qty}` : `Kunci ruang berikutnya: ${m.prefix}dungeon lanjut`,
        stats: [
          { label: 'Coin', value: `+${rupiah(run.coin)}`, color: '#e0c17b' },
          { label: 'EXP', value: `+${run.exp}`, color: '#68d5ff' },
          { label: 'Ruang', value: `${run.room}/${ROOMS.length}`, color: '#b9a6f2' },
          { label: 'HP', value: `${run.hp}/${run.maxHp}`, color: '#e08c8c' },
        ],
      },
      body: `${room.mob} dikalahkan · Coins ${rupiah(run.coin)} · EXP ${run.exp} · HP ${run.hp}/${run.maxHp} · +${healed} HP${clearedAll ? ` · Mundur dengan ${m.prefix}dungeon mundur` : ''}`,
    })
  }

  if (action === 'mulai' || action === 'start') {
    if (run) return m.reply('Kamu masih punya run berjalan. Selesaikan atau mundur dulu dengan ' + m.prefix + 'dungeon mundur.')

    if (user.rpg.stamina < ENTRY_COST) {
      return m.reply(`⚡ Stamina tidak cukup. Butuh *${ENTRY_COST}*, sisa *${user.rpg.stamina}*.`)
    }

    if (await enforceCooldown(m, 'dungeon_start', 600_000)) return

    user.rpg.stamina -= ENTRY_COST
    startRun(user)
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'reward',
      headerTitle: 'DUNGEON',
      headerSubtitle: 'Run dimulai',
      data: {
        title: 'MASUK DUNGEON',
        subtitle: `${ROOMS.length} ruangan menanti`,
        result: `Ruang 1: ${ROOMS[0].mob}`,
        victory: true,
        stats: [
          { label: 'Ruang', value: `0/${ROOMS.length}`, color: '#b9a6f2' },
          { label: 'HP', value: `${user.rpg.maxHealth}/${user.rpg.maxHealth}`, color: '#e08c8c' },
          { label: 'Biaya', value: `-${ENTRY_COST} stamina`, color: '#68d5ff' },
        ],
      },
      body: `Masuk dungeon · ${m.prefix}dungeon lanjut untuk melawan · ${m.prefix}dungeon mundur untuk mengambil hadiah`,
    })
  }

  let txt = '🏰 *DUNGEON RUN*\n\n'
  txt += `Masuk butuh *${ENTRY_COST} stamina*.\n\n`
  for (const [index, room] of ROOMS.entries()) {
    txt += `${index + 1}. ${room.name} — ${room.mob} (HP ${room.hp})\n`
    txt += `   Hadiah ${rupiah(room.coin)} + ${room.exp} EXP\n\n`
  }
  txt += `Perintah:\n`
  txt += `  ${m.prefix}dungeon mulai\n`
  txt += `  ${m.prefix}dungeon lanjut\n`
  txt += `  ${m.prefix}dungeon mundur\n\n`

  if (run) {
    txt += `📍 Run berjalan: ruang ${run.room}/${ROOMS.length} · HP ${run.hp}/${run.maxHp} · Kumpulan ${rupiah(run.coin)}`
  } else {
    txt += `Belum ada run berjalan.`
  }

  return m.reply(txt)
}

handler.command = /^(dungeon|dng|ruin)$/i
handler.help = ['dungeon', 'dng', 'ruin']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Dungeon run berantai: 5 ruangan, boss terakhir'

export default handler
