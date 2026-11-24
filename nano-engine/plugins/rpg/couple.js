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
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { cekPenjara } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const DATE_COST = 2000
const DATE_DAILY_LIMIT = 3
const QUEST_TARGET = 3
const DAY_MS = 86_400_000

function todayKey() {
  return new Date().toDateString()
}

function ensureDaily(user) {
  if (!user.rpg.couple || user.rpg.couple.day !== todayKey()) {
    user.rpg.couple = { day: todayKey(), dates: 0 }
  }
  return user.rpg.couple
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const spouseJid = user.rpg.spouse

  if (!spouseJid) {
    return m.reply(
      '💍 Kamu belum menikah.\n' +
      'Kencan butuh pasangan — cari dulu dengan ' + m.prefix + 'marry @user.'
    )
  }

  const spouse = getUser(spouseJid)
  const daily = ensureDaily(user)
  const spouseDaily = ensureDaily(spouse)

  if (action === 'kencan' || action === 'date') {
    if (daily.dates >= DATE_DAILY_LIMIT) {
      return m.reply(`💗 Batas kencan hari ini (${DATE_DAILY_LIMIT}x) sudah habis. Kembali besok.`)
    }

    if (user.koin < DATE_COST) {
      return m.reply(`Kencan butuh ${rupiah(DATE_COST)}. Dompet kamu ${rupiah(user.koin)}.`)
    }

    user.koin -= DATE_COST
    user.rpg.love = (user.rpg.love || 0) + 15
    spouse.rpg.love = (spouse.rpg.love || 0) + 15
    daily.dates += 1
    spouseDaily.dates += 1
    trackStat(user, 'win')
    trackStat(spouse, 'win')

    saveUser(m.sender, user)
    saveUser(spouseJid, spouse)

    await addExpWithLevelCheck(sock, m, user, 200)
    await addExpWithLevelCheck(sock, m, spouse, 150)
    checkAchievements(user)
    checkAchievements(spouse)
    saveUser(m.sender, user)
    saveUser(spouseJid, spouse)

    const questDone = daily.dates >= QUEST_TARGET

    return sendRpgCard(sock, m, {
      type: 'reward',
      headerTitle: 'COUPLE QUEST',
      headerSubtitle: 'Kencan selesai',
      data: {
        title: 'KENCAN SUKSES',
        subtitle: `Bersama @${spouseJid.split('@')[0]}`,
        result: `Kencan ${daily.dates}/${DATE_DAILY_LIMIT} hari ini`,
        victory: true,
        stats: [
          { label: 'Biaya', value: `-${rupiah(DATE_COST)}`, color: '#e0c17b' },
          { label: 'Love', value: `+15 (${user.rpg.love})`, color: '#e08c8c' },
          { label: 'Quest', value: `${daily.dates}/${QUEST_TARGET}`, color: '#98d2b0' },
        ],
      },
      body: `Kencan ${daily.dates}/${DATE_DAILY_LIMIT} · Love +15 (${user.rpg.love}) · EXP +200${questDone ? ' · Quest harian selesai!' : ''}`,
      mentions: [spouseJid, m.sender],
    })
  }

  const days = user.rpg.marriedAt ? Math.max(1, Math.floor((Date.now() - user.rpg.marriedAt) / DAY_MS)) : 0
  const questDone = daily.dates >= QUEST_TARGET

  let txt = `💍 *COUPLE QUEST*\n\n`
  txt += `Pasangan: @${spouseJid.split('@')[0]}\n`
  txt += `Hari bersama: ${days} hari\n`
  txt += `Love kamu: ${user.rpg.love || 0} · Love pasangan: ${spouse.rpg.love || 0}\n\n`
  txt += `*Quest harian*: kencan ${QUEST_TARGET}x\n`
  txt += `Progres: ${daily.dates}/${QUEST_TARGET} ${questDone ? '✅' : '⬜'}\n`
  txt += `Kencan hari ini: ${daily.dates}/${DATE_DAILY_LIMIT}\n\n`
  txt += `Mulai kencan: ${m.prefix}couple kencan (${rupiah(DATE_COST)})\n`

  if (questDone) {
    txt += `\n✅ Quest harian selesai — besarnya pasangan tinggal kencan untuk ikut terisi.`
  }

  return sendRpgCard(sock, m, {
    type: 'profile',
    headerTitle: 'COUPLE QUEST',
    headerSubtitle: `Hari ke-${days}`,
    data: {
      title: `@${spouseJid.split('@')[0]}`,
      subtitle: `${days} hari bersama`,
      result: `Love ${user.rpg.love || 0}`,
      victory: questDone,
      stats: [
        { label: 'Love', value: String(user.rpg.love || 0), color: '#e08c8c' },
        { label: 'Quest', value: `${daily.dates}/${QUEST_TARGET}`, color: '#98d2b0' },
        { label: 'Kencan', value: `${daily.dates}/${DATE_DAILY_LIMIT}`, color: '#e0c17b' },
        { label: 'Hari', value: String(days), color: '#b9a6f2' },
      ],
    },
    body: `${txt.replace(/\n{2,}/g, '\n')}`,
    mentions: [spouseJid, m.sender],
  })
}

handler.command = /^(couple|pasangan|kencan)$/i
handler.help = ['couple', 'pasangan', 'kencan']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Quest harian bersama pasangan (kencan & love)'

export default handler
