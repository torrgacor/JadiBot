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

import { getUser, saveUser, getGuild, saveGuild } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/level.js'
import { enforceCooldown, formatDuration } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { cekPenjara } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const RAID_COOLDOWN = 1_800_000
const STAMINA_COST = 30

const BOSSES = [
  { name: 'Naga Bayangan', hp: 500, power: 60, reward: 8000 },
  { name: 'Golem Kuno', hp: 800, power: 75, reward: 12000 },
  { name: 'Raja Iblis', hp: 1200, power: 90, reward: 18000 },
  { name: 'Kraken Laut Dalam', hp: 1600, power: 105, reward: 25000 },
]

function powerOf(user) {
  return (user.level || 1) * 12 + (user.rpg.attack || 10) * 2 + (user.rpg.luck || 0)
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  if (!user.rpg.guildId) {
    return m.reply(`Kamu belum punya guild. Buat/join guild dulu dengan \`${m.prefix}guild\`.`)
  }

  const guild = getGuild(user.rpg.guildId)
  if (!guild) {
    user.rpg.guildId = null
    saveUser(m.sender, user)
    return m.reply(`Guild kamu tidak ditemukan. Status guild direset.`)
  }

  const args = m.args || []
  const action = args[0]?.toLowerCase()

  if (action === 'info' || action === 'boss') {
    const boss = BOSSES[Math.min(BOSSES.length - 1, Math.max(0, guild.level - 1))]
    let txt = `🏰 *Guild Raid*\n\n`
    txt += `Guild: *${guild.name}* (Lv.${guild.level})\n`
    txt += `Boss target: *${boss.name}*\n`
    txt += `HP Boss: ${boss.hp} | Power: ${boss.power}\n`
    txt += `Hadiah: ${rupiah(boss.reward)} + EXP\n\n`
    txt += `Mulai raid: \`${m.prefix}raid\` (butuh ${STAMINA_COST} stamina, cooldown ${formatDuration(RAID_COOLDOWN)})`
    return m.reply(txt)
  }

  if (user.rpg.stamina < STAMINA_COST) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${STAMINA_COST}*, sisa *${user.rpg.stamina}*.`)
  }

  if (await enforceCooldown(m, 'raid', RAID_COOLDOWN)) return

  const boss = BOSSES[Math.min(BOSSES.length - 1, Math.max(0, guild.level - 1))]

  user.rpg.stamina -= STAMINA_COST

  await m.react('🏰')
  await m.reply(`🏰 Guild *${guild.name}* menyerbu sarang *${boss.name}*...`)
  await new Promise((r) => setTimeout(r, 2500))

  const teamPower = powerOf(user) + guild.members.length * 15 + guild.level * 20
  const successChance = Math.min(90, Math.round((teamPower / (boss.power * 3)) * 100))
  const isSuccess = Math.random() * 100 < successChance

  if (isSuccess) {
    const memberShare = Math.floor(boss.reward / 2)
    const expGain = 500 + guild.level * 100

    user.koin += memberShare
    guild.treasury += boss.reward - memberShare
    guild.exp = (guild.exp || 0) + boss.hp / 4
    guild.raidWins = (guild.raidWins || 0) + 1

    const expNeeded = guild.level * 5000
    if (guild.exp >= expNeeded && guild.level < 50) {
      guild.level += 1
      guild.exp = 0
    }

    saveGuild(guild.id, guild)
    trackStat(user, 'raidWins')
    trackStat(user, 'win')
    trackStat(user, 'boss')
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, expGain)
    const gained = checkAchievements(user)
    if (gained.length) saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'boss',
      headerTitle: 'GUILD RAID',
      headerSubtitle: `${guild.name} menang!`,
      data: {
        name: boss.name,
        status: 'DIKALAHKAN',
        hp: 0,
        maxHp: boss.hp,
        victory: true,
        damage: teamPower,
        round: guild.members.length,
        exp: expGain,
        koin: memberShare,
        loot: `${boss.name} tumbang · Kas guild +${rupiah(boss.reward - memberShare)}`,
        stats: [
          { label: 'Boss', value: boss.name, color: '#e08c8c' },
          { label: 'Share', value: `+${rupiah(memberShare)}`, color: '#e0c17b' },
          { label: 'EXP', value: `+${expGain}`, color: '#68d5ff' },
          { label: 'Guild Lv', value: String(guild.level), color: '#b9a6f2' },
        ],
      },
      body: `${boss.name} dikalahkan! · +${rupiah(memberShare)} · EXP +${expGain} · Guild Lv.${guild.level} · Kas ${rupiah(guild.treasury)}`,
    })
  }

  user.rpg.health = Math.max(0, user.rpg.health - 30)
  saveUser(m.sender, user)

  return m.reply(
    `💀 *Raid Gagal!*\n\n*${boss.name}* terlalu kuat. Guild mundur dengan luka.\n` +
    `🤕 HP: -30\n⚡ Stamina: -${STAMINA_COST}\n\n` +
    `Tips: ajak lebih banyak anggota & naikkan level guild untuk menang.`
  )
}

handler.command = /^(raid|guildwar|guildraid|perang)$/i
handler.help = ['raid', 'guildwar', 'guildraid']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Raid boss bersama guild untuk hadiah besar'

export default handler
