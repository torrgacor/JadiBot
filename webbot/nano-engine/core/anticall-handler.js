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


import { isAnticallActive } from './anticall.js'
import { denganPromo } from './identitas.js'

const ANTICALL_WARNING_TEXT = '*⚠️ SISTEM ANTI CALL AKTIF*\n\nHarap agar tidak call/menelfon bot.'

export function attachAnticallHandler(conn) {
  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status !== 'offer') continue

      try {
        const active = await isAnticallActive()
        if (!active) continue

        await conn.rejectCall(call.id, call.from)
        await conn.sendMessage(call.chatId, { text: denganPromo(ANTICALL_WARNING_TEXT) })
      } catch (err) {
        console.log(`  \x1b[31m✗\x1b[0m  Error di sistem Anti Call: ${err.message}`)
      }
    }
  })
}

export default { attachAnticallHandler }
