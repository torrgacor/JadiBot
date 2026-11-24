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

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildCategoryText } from '../../lib/menu.js'
import { getPluginsByCategory } from '../../core/pemuat-plugin.js'
import { ButtonV2 } from '../../lib/tombol.js'
import { settings } from '../../config/settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const THUMBNAIL_MENU = path.join(__dirname, '..', '..', 'assets', 'image', settings.menuImage || 'awang.jpg')

const handler = async (m, { conn, usedPrefix }) => {
  const categoryKey = m.args[0]

  if (!categoryKey || !getPluginsByCategory(categoryKey).length) {
    await conn.sendMessage(
      m.chat,
      { text: `Kategori tidak ditemukan. Ketik ${usedPrefix}menu untuk melihat daftar kategori yang tersedia.` },
      { quoted: m.raw }
    )
    return
  }

  const categoryText = buildCategoryText(categoryKey, { prefix: usedPrefix })

  const button = new ButtonV2(conn)
    .setBody(' ')
    .setFooter(categoryText) 

  /* Buffer ASLI — ButtonV2 yang menyiapkan ukurannya (header 1024 / lokasi 300). */
  const thumbnail = fs.existsSync(THUMBNAIL_MENU) ? fs.readFileSync(THUMBNAIL_MENU) : null
  if (thumbnail) button.setThumbnail(thumbnail)

  button.addButton('❀ SEMUA MENU', `${usedPrefix}allmenu`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^(kategori|listmenu)$/i
handler.help = ['kategori', 'listmenu']
handler.tags = ['main']
handler.description = 'Menampilkan detail fitur dalam satu kategori'

export default handler
