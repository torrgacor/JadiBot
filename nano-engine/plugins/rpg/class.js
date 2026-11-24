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

const SWITCH_COST = 5000
const SWITCH_COOLDOWN = 86_400_000

const CLASSES = {
  warrior: {
    key: 'warrior',
    name: 'Warrior',
    icon: '⚔️',
    desc: 'Petarung garis depan dengan HP dan serangan besar.',
    bonus: { maxHealth: 30, attack: 5, defense: 3 },
    perk: 'HP ekstra & serangan kuat',
  },
  mage: {
    key: 'mage',
    name: 'Mage',
    icon: '🔮',
    desc: 'Pengguna sihir dengan mana melimpah dan damage tinggi.',
    bonus: { maxMana: 30, attack: 8 },
    perk: 'Mana ekstra & damage sihir',
  },
  archer: {
    key: 'archer',
    name: 'Archer',
    icon: '🏹',
    desc: 'Penembak jitu yang mengandalkan kecepatan dan keberuntungan.',
    bonus: { speed: 6, luck: 8 },
    perk: 'Kecepatan & luck tinggi',
  },
  rogue: {
    key: 'rogue',
    name: 'Rogue',
    icon: '🗡️',
    desc: 'Pencuri lincah, ahli dalam aksi berisiko.',
    bonus: { luck: 10, speed: 5 },
    perk: 'Bonus keberuntungan besar',
  },
  merchant: {
    key: 'merchant',
    name: 'Merchant',
    icon: '💰',
    desc: 'Pedagang ulung yang mendapat lebih banyak koin.',
    bonus: { luck: 5 },
    buffs: { koinPercent: 15 },
    perk: '+15% koin dari semua aktivitas',
  },
  healer: {
    key: 'healer',
    name: 'Healer',
    icon: '💚',
    desc: 'Penyembuh dengan vitalitas dan mana seimbang.',
    bonus: { maxHealth: 20, maxMana: 20 },
    perk: 'HP & mana ekstra',
  },
}

function formatBonus(bonus = {}) {
  const labels = {
    maxHealth: 'Max HP',
    maxMana: 'Max Mana',
    maxStamina: 'Max Stamina',
    attack: 'ATK',
    defense: 'DEF',
    speed: 'SPD',
    luck: 'LUCK',
  }
  return Object.entries(bonus)
    .map(([key, value]) => `+${value} ${labels[key] || key}`)
    .join(', ')
}

function applyClass(user, classKey) {
  const definition = CLASSES[classKey]
  if (!definition) return

  user.rpg.buffs = user.rpg.buffs && typeof user.rpg.buffs === 'object' ? user.rpg.buffs : {}

  // Remove bonuses/buffs from the previous class so switching never stacks them.
  const previous = CLASSES[user.rpg.class]
  if (previous) {
    for (const [key, value] of Object.entries(previous.bonus || {})) {
      user.rpg[key] = Math.max(0, (Number(user.rpg[key]) || 0) - value)
    }
    for (const key of Object.keys(previous.buffs || {})) {
      delete user.rpg.buffs[key]
    }
  }

  user.rpg.class = classKey
  user.rpg.classChosenAt = Date.now()

  for (const [key, value] of Object.entries(definition.bonus || {})) {
    user.rpg[key] = (Number(user.rpg[key]) || 0) + value
  }

  for (const [key, value] of Object.entries(definition.buffs || {})) {
    user.rpg.buffs[key] = { value, expiresAt: Number.MAX_SAFE_INTEGER }
  }

  user.rpg.health = Math.min(user.rpg.health, user.rpg.maxHealth)
  user.rpg.mana = Math.min(user.rpg.mana, user.rpg.maxMana)
  user.rpg.stamina = Math.min(user.rpg.stamina, user.rpg.maxStamina)
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const chosen = user.rpg.class

  if (!action || action === 'list') {
    let txt = `🎭 *Job Class*\n\n`
    for (const definition of Object.values(CLASSES)) {
      txt += `${definition.icon} *${definition.name}*\n`
      txt += `${definition.desc}\n`
      txt += `Bonus: ${formatBonus(definition.bonus)}${definition.buffs?.koinPercent ? `, +${definition.buffs.koinPercent}% koin` : ''}\n\n`
    }
    txt += chosen
      ? `Kelas kamu sekarang: *${CLASSES[chosen]?.name || chosen}*`
      : `Kamu belum memilih kelas. Pilih dengan \`${m.prefix}class choose <nama>\``

    return m.reply(txt)
  }

  if (action === 'info') {
    if (!chosen || !CLASSES[chosen]) {
      return m.reply(`Kamu belum punya kelas. Lihat daftar dengan \`${m.prefix}class list\`.`)
    }
    const definition = CLASSES[chosen]
    return sendRpgCard(sock, m, {
      type: 'profile',
      headerTitle: 'JOB CLASS',
      headerSubtitle: definition.name,
      data: {
        title: definition.name,
        subtitle: definition.perk,
        result: definition.perk,
        victory: true,
        stats: [
          { label: 'Class', value: definition.name, color: '#9b8cff' },
          { label: 'Bonus', value: formatBonus(definition.bonus), color: '#68d5ff' },
          { label: 'Perk', value: definition.perk, color: '#e0c17b' },
        ],
      },
      body: `${definition.icon} ${definition.name} · ${definition.perk}`,
    })
  }

  if (action === 'choose' || action === 'pilih') {
    const classKey = (args[1] || '').toLowerCase()
    const definition = CLASSES[classKey]

    if (!definition) {
      return m.reply(`Kelas *${args[1] || ''}* tidak ada. Pilihan: ${Object.keys(CLASSES).join(', ')}.`)
    }

    if (chosen === classKey) {
      return m.reply(`Kamu sudah memakai kelas *${definition.name}*.`)
    }

    if (chosen) {
      if (await enforceCooldown(m, 'class_switch', SWITCH_COOLDOWN)) return
      if (user.koin < SWITCH_COST) {
        return m.reply(`Ganti kelas butuh ${rupiah(SWITCH_COST)}. Koin kamu ${rupiah(user.koin)}.`)
      }
      user.koin -= SWITCH_COST
    }

    applyClass(user, classKey)
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'profile',
      headerTitle: 'JOB CLASS',
      headerSubtitle: 'Kelas dipilih',
      data: {
        title: 'CLASS SELECTED',
        subtitle: definition.name,
        result: `${definition.icon} ${definition.name}`,
        victory: true,
        stats: [
          { label: 'Class', value: definition.name, color: '#9b8cff' },
          { label: 'Bonus', value: formatBonus(definition.bonus), color: '#68d5ff' },
          ...(chosen ? [{ label: 'Cost', value: `-${rupiah(SWITCH_COST)}`, color: '#e0c17b' }] : []),
        ],
      },
      body: `${definition.icon} ${definition.name} · ${definition.perk}${chosen ? ` · Biaya -${rupiah(SWITCH_COST)}` : ''}`,
    })
  }
}

handler.command = /^(class|kelas|job)$/i
handler.help = ['class', 'kelas', 'job']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Pilih job class dengan bonus statistik'

export default handler
