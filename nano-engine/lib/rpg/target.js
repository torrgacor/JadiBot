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

function getContextInfo(m) {
  const content = m.raw?.message?.ephemeralMessage?.message || m.raw?.message
  return (
    content?.extendedTextMessage?.contextInfo ||
    content?.imageMessage?.contextInfo ||
    content?.videoMessage?.contextInfo ||
    null
  )
}

function getMentionedJids(m) {
  const ctx = getContextInfo(m)
  return Array.isArray(ctx?.mentionedJid) ? ctx.mentionedJid : []
}

function getQuotedSender(m) {
  const ctx = getContextInfo(m)
  return ctx?.participant || null
}

function resolveTarget(m) {
  return getMentionedJids(m)[0] || getQuotedSender(m) || null
}

export { getMentionedJids, getQuotedSender, resolveTarget }

export default { getMentionedJids, getQuotedSender, resolveTarget }
