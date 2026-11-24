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

import { getUser, saveUser, getWantedLevel, clearWanted } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/level.js'
import { enforceCooldown } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { cekPenjara, penjarakan, wantedLabel } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const target = m.targetJid

  if (!target) {
    return m.reply(`Tag atau reply buronan yang mau ditangkap.\nLihat daftar: \`${m.prefix}wanted\``)
  }

  if (target === m.sender) {
    return m.reply(`Kamu tidak bisa menangkap diri sendiri.`)
  }

  const hunter = getUser(m.sender)
  if (await cekPenjara(m, hunter)) return
  if (await enforceCooldown(m, 'tangkap', 300_000)) return

  const targetUser = getUser(target)
  const wanted = getWantedLevel(targetUser)

  if (wanted <= 0) {
    return m.reply(`@${target.split('@')[0]} bukan buronan. Wanted level mereka 0.`, { mentions: [target] })
  }

  const staminaCost = 15
  if (hunter.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${hunter.rpg.stamina}*.`)
  }

  hunter.rpg.stamina -= staminaCost

  await m.react('🚔')
  await m.reply(`🚔 Memburu @${target.split('@')[0]} (${wanted}/5 ${wantedLabel(wanted)})...`, { mentions: [target] })
  await new Promise((r) => setTimeout(r, 2500))

  const successChance = Math.min(85, 40 + wanted * 8 + (hunter.rpg.luck || 0))
  const isSuccess = Math.random() * 100 < successChance

  if (isSuccess) {
    const bounty = 2000 + wanted * 3000
    const expGain = 100 + wanted * 50

    hunter.koin += bounty
    trackStat(hunter, 'win')
    trackStat(hunter, 'bounty', 1)
    clearWanted(targetUser)
    const duration = await penjarakan(targetUser, wanted, `Ditangkap @${m.sender.split('@')[0]}`)
    saveUser(target, targetUser)
    saveUser(m.sender, hunter)
    await addExpWithLevelCheck(sock, m, hunter, expGain)

    const gained = checkAchievements(hunter)
    if (gained.length) saveUser(m.sender, hunter)

    return sendRpgCard(sock, m, {
      type: 'boss',
      headerTitle: 'TANGKAP BURONAN',
      headerSubtitle: 'Berhasil menangkap',
      data: {
        name: `@${target.split('@')[0]}`,
        status: 'TERTANGKAP',
        hp: 1,
        maxHp: 1,
        victory: true,
        damage: Math.round(successChance),
        round: wanted,
        exp: expGain,
        koin: bounty,
        loot: `${wantedLabel(wanted)} · Penjara ${Math.round(duration / 60000)} menit`,
        stats: [
          { label: 'Bounty', value: `+${rupiah(bounty)}`, color: '#e0c17b' },
          { label: 'EXP', value: `+${expGain}`, color: '#68d5ff' },
          { label: 'Wanted', value: `${wanted}/5`, color: '#e08c8c' },
        ],
      },
      body: `@${target.split('@')[0]} ditangkap · Bounty +${rupiah(bounty)} · EXP +${expGain}${gained.length ? ` · ${gained.length} achievement baru` : ''}`,
      mentions: [target, m.sender],
    })
  }

  const healthLoss = 10 + wanted * 5
  hunter.rpg.health = Math.max(0, hunter.rpg.health - healthLoss)
  saveUser(m.sender, hunter)

  return m.reply(
    `💥 *Gagal Menangkap!*\n\n@${target.split('@')[0]} melawan dan kabur.\n` +
    `🤕 HP: -${healthLoss}\n⚡ Stamina: -${staminaCost}`,
    { mentions: [target] }
  )
}

handler.command = /^(tangkap|arrest|bounty)$/i
handler.help = ['tangkap', 'arrest', 'bounty']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menangkap buronan untuk mendapat bounty'

export default handler
