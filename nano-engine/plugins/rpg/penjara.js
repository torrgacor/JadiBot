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

import { getUser, saveUser, isJailed, clearWanted } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { rupiah } from '../../lib/rpg/format.js'
import { formatDuration } from '../../lib/rpg/cooldown.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { bailCostForWanted, wantedLabel } from '../../lib/rpg/penjara.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const jailed = isJailed(user)

  if (action === 'bail' || action === 'tebus' || action === 'bayar') {
    if (!jailed) {
      return m.reply(`Kamu tidak sedang dipenjara.`)
    }

    const level = user.rpg.wanted?.level || 1
    const cost = bailCostForWanted(level)

    if (user.koin < cost) {
      return m.reply(
        `Bail butuh *${rupiah(cost)}*. Koin kamu hanya ${rupiah(user.koin)}.\n` +
        `Tunggu *${formatDuration(user.rpg.jail.until - Date.now())}* lagi untuk bebas gratis.`
      )
    }

    user.koin -= cost
    user.rpg.jail = null
    clearWanted(user)
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'bank',
      headerTitle: 'PENJARA',
      headerSubtitle: 'Bail dibayar',
      data: {
        title: 'BEBAS DENGAN BAIL',
        subtitle: 'Kamu keluar dari penjara',
        result: 'Bail dibayar',
        victory: true,
        stats: [
          { label: 'Bail', value: `-${rupiah(cost)}`, color: '#e0c17b' },
          { label: 'Coin', value: rupiah(user.koin), color: '#98d2b0' },
        ],
      },
      body: `Bail -${rupiah(cost)} · Wanted direset · Coin ${rupiah(user.koin)}`,
    })
  }

  if (!jailed) {
    const wanted = user.rpg.wanted?.level || 0
    let txt = `🚔 *Status Hukum*\n\n`
    txt += `Status: *Bebas*\n`
    txt += `Wanted: *${wanted}/5* (${wantedLabel(wanted)})\n\n`
    txt += `Kejahatan (rob, crime, maling, steal) akan menaikkan wanted level.\n`
    txt += `Semakin tinggi wanted, semakin lama hukuman bila tertangkap.\n\n`
    txt += `Cek buronan: \`${m.prefix}wanted\``
    return m.reply(txt)
  }

  const remaining = user.rpg.jail.until - Date.now()
  const level = user.rpg.wanted?.level || 1
  const cost = bailCostForWanted(level)

  return sendRpgCard(sock, m, {
    type: 'boss',
    headerTitle: 'PENJARA',
    headerSubtitle: 'Kamu sedang dipenjara',
    data: {
      name: 'PENJARA',
      status: 'DIPENJARA',
      hp: remaining,
      maxHp: user.rpg.jail.until - user.rpg.jail.at,
      victory: false,
      stats: [
        { label: 'Alasan', value: user.rpg.jail.reason || 'Kriminal', color: '#e08c8c' },
        { label: 'Sisa', value: formatDuration(remaining), color: '#e0c17b' },
        { label: 'Bail', value: rupiah(cost), color: '#98d2b0' },
        { label: 'Wanted', value: `${level}/5`, color: '#b9a6f2' },
      ],
    },
    body: `Alasan: ${user.rpg.jail.reason || 'Kriminal'} · Sisa ${formatDuration(remaining)} · Bail ${rupiah(cost)}`,
  })
}

handler.command = /^(penjara|jail|bui)$/i
handler.help = ['penjara', 'jail', 'bui']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Cek status penjara dan bayar bail'

export default handler
