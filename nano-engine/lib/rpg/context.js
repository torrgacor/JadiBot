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

import { settings } from '../../config/settings.js'
import { formatRpgText } from './format.js'
import { resolveTarget, getMentionedJids, getQuotedSender } from './target.js'

function buildRpgContext(m, { conn, usedPrefix }) {
  const enriched = m

  enriched.prefix = usedPrefix || settings.defaultPrefix
  enriched.mentionedJid = getMentionedJids(m)
  enriched.quoted = enriched.quoted
    ? { sender: getQuotedSender(m), message: enriched.quoted }
    : getQuotedSender(m)
      ? { sender: getQuotedSender(m), message: null }
      : null
  enriched.targetJid = resolveTarget(m)

  enriched.reply = async (text, extra = {}) => {
    const formatted = extra.rpgFormat === false ? text : formatRpgText(text)
    const payload = { text: formatted, ...extra }
    delete payload.rpgFormat
    return conn.sendMessage(m.chat, payload, { quoted: m.raw })
  }

  enriched.react = async (emoji) => {
    try {
      await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
    } catch {

    }
  }

  return { m: enriched, sock: conn }
}

export { buildRpgContext }

export default { buildRpgContext }
