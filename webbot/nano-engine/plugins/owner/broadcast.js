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


const handler = async (m, { conn, usedPrefix }) => {
  if (!m.text) {
    await conn.sendMessage(
      m.chat,
      { text: `Cara pakai:\n${usedPrefix}broadcast <pesan>` },
      { quoted: m.raw }
    )
    return
  }

  const chats = Object.keys(conn.chats || {}).filter((jid) => jid.endsWith('@s.whatsapp.net'))

  let success = 0
  for (const jid of chats) {
    try {
      await conn.sendMessage(jid, { text: `📢 *Broadcast*\n\n${m.text}` })
      success++
    } catch {
    }
  }

  await conn.sendMessage(
    m.chat,
    { text: `Broadcast selesai.\nTerkirim ke ${success} dari ${chats.length} chat.` },
    { quoted: m.raw }
  )
}

handler.command = /^broadcast$/i
handler.help = ['broadcast']
handler.tags = ['owner']
handler.description = 'Mengirim pesan ke seluruh chat (owner only)'
handler.ownerOnly = true

export default handler
