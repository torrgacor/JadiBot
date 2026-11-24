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

import { getUser, saveUser, getMeta, setMeta } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/level.js'
import { enforceCooldown } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { cekPenjara } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const META_KEY = 'worldboss'
const ATTACK_COOLDOWN = 600_000
const MIN_PARTICIPANT_SHARE = 500

const BOSSES = [
  { name: 'Naga Tenggelam', hp: 5000 },
  { name: 'Titan Batu', hp: 9000 },
  { name: 'Penjelajah Kosong', hp: 16000 },
  { name: 'Raja Belalang', hp: 26000 },
  { name: 'Penjaga Gerbang', hp: 40000 },
]

function currentBoss() {
  let boss = getMeta(META_KEY)
  if (boss && !boss.dead) return boss

  const level = boss ? (boss.level || 1) + 1 : 1
  const template = BOSSES[Math.min(level - 1, BOSSES.length - 1)]

  boss = {
    level,
    name: level > BOSSES.length ? `${template.name} (Lv.${level})` : template.name,
    hp: template.hp + (level - 1) * 3000,
    maxHp: template.hp + (level - 1) * 3000,
    contributors: {},
    spawnedAt: Date.now(),
    dead: false,
  }
  setMeta(META_KEY, boss)
  return boss
}

function damageFor(user) {
  const base = (user.rpg.attack || 10) * 2 + (user.level || 1) * 6
  const crit = Math.random() < 0.15
  return {
    amount: Math.max(1, Math.round(base + Math.random() * base * 0.6)),
    crit,
  }
}

function payout(damage, level) {
  return {
    coin: Math.min(60000, Math.round(damage * 1.5) + level * 500),
    exp: Math.min(4000, Math.round(damage / 2) + level * 100),
  }
}

async function settle(conn, sender, boss) {
  const results = []
  const entries = Object.entries(boss.contributors || {})
    .sort((a, b) => b[1] - a[1])

  for (const [jid, damage] of entries) {
    if (damage < MIN_PARTICIPANT_SHARE) continue

    const reward = payout(damage, boss.level)
    const user = getUser(jid)
    user.koin += reward.coin
    trackStat(user, 'win')
    trackStat(user, 'boss')
    saveUser(jid, user)

    const fakeM = { sender: jid, chat: sender.chat, pushName: jid.split('@')[0], raw: sender.raw }
    await addExpWithLevelCheck(conn, fakeM, user, reward.exp)
    checkAchievements(user)
    saveUser(jid, user)

    results.push({ jid, damage, ...reward })
  }

  return results
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const boss = currentBoss()

  if (action === 'serang' || action === 'attack' || action === 'hantam') {
    if (await enforceCooldown(m, 'worldboss', ATTACK_COOLDOWN)) return

    const hit = damageFor(user)
    const applied = Math.min(boss.hp, hit.amount)
    boss.hp -= applied
    boss.contributors = boss.contributors || {}
    const jid = user.jid
    boss.contributors[jid] = (boss.contributors[jid] || 0) + applied

    const killed = boss.hp <= 0
    const reward = payout(applied, boss.level)
    user.koin += reward.coin
    trackStat(user, 'win')
    trackStat(user, 'boss')

    if (killed) {
      boss.dead = true
      boss.deadAt = Date.now()
    }

    setMeta(META_KEY, boss)
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, reward.exp)
    checkAchievements(user)
    saveUser(m.sender, user)

    if (killed) await settle(sock, m, boss)

    return sendRpgCard(sock, m, {
      type: 'boss',
      headerTitle: 'WORLD BOSS',
      headerSubtitle: killed ? `${boss.name} dikalahkan!` : `${boss.name} masih berdiri`,
      data: {
        name: boss.name,
        status: killed ? 'MUSNAH' : (hit.crit ? 'CRIT!' : 'Pukulan mendarat'),
        hp: Math.max(0, boss.hp),
        maxHp: boss.maxHp,
        victory: true,
        damage: applied,
        round: boss.level,
        exp: reward.exp,
        koin: reward.coin,
        loot: killed
          ? `World Boss musnah · Pemenang dibagikan hadiah`
          : `Sisa HP ${Math.max(0, boss.hp)}/${boss.maxHp} · Kontribusi ${boss.contributors[jid]}`,
        stats: [
          { label: 'Damage', value: String(applied), color: '#e08c8c' },
          { label: 'Coin', value: `+${rupiah(reward.coin)}`, color: '#e0c17b' },
          { label: 'EXP', value: `+${reward.exp}`, color: '#68d5ff' },
          { label: 'Sisa HP', value: String(Math.max(0, boss.hp)), color: '#b9a6f2' },
        ],
      },
      body: `${boss.name} menerima ${applied} damage${hit.crit ? ' (CRIT!)' : ''} · +${rupiah(reward.coin)} · EXP +${reward.exp}${killed ? ' · Boss berhasil dikalahkan!' : ''}`,
    })
  }

  const sorted = Object.entries(boss.contributors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  let txt = `🐲 *WORLD BOSS* — ${boss.name}\n\n`
  txt += `Level: ${boss.level}\n`
  txt += `HP: ${Math.max(0, boss.hp)} / ${boss.maxHp}\n`
  txt += `Bonus serang: ${m.prefix}worldboss serang (cd 10 menit)\n\n`

  if (sorted.length) {
    txt += `👑 *Pemberontak teratas*:\n`
    for (const [index, [jid, damage]] of sorted.entries()) {
      txt += `${index + 1}. @${jid} — ${damage} damage\n`
    }
    txt += '\n'
  } else {
    txt += `Belum ada yang menyerang. Jadilah yang pertama!\n\n`
  }

  const myDamage = boss.contributors?.[user.jid] || 0
  txt += `Kontribusi kamu: ${myDamage} damage`

  return m.reply(txt, { mentions: sorted.map(([jid]) => `${jid}@s.whatsapp.net`) })
}

handler.command = /^(worldboss|wb|dunia)$/i
handler.help = ['worldboss', 'wb', 'dunia']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Boss dunia global: semua pemain menyerang bareng'

export default handler
