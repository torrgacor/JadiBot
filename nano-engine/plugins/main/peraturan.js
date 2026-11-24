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
import { ButtonV2 } from '../../lib/tombol.js'
import { settings } from '../../config/settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const THUMBNAIL_MENU = path.join(__dirname, '..', '..', 'assets', 'image', settings.menuImage || 'awang.jpg')

const rulesText = [
  '╭───〔 📜 PERATURAN BOT 〕',
  '│',
  '│ 1. Gunakan bot dengan bijak.',
  '│    Jangan mengirim spam atau',
  '│    permintaan berulang secara',
  '│    berlebihan.',
  '│',
  '│ 2. Dilarang menggunakan fitur',
  '│    untuk penipuan, tindakan ilegal,',
  '│    atau aktivitas yang merugikan',
  '│    orang lain.',
  '│',
  '│ 3. Hormati batas penggunaan setiap',
  '│    fitur. Jika suatu fitur sedang',
  '│    bermasalah, tunggu beberapa',
  '│    saat sebelum mencoba kembali.',
  '│',
  '│ 4. Jangan mencoba mengeksploitasi',
  '│    bug, membebani server, atau',
  '│    mengganggu stabilitas bot.',
  '│',
  '│ 5. Untuk fitur yang bekerja di group,',
  '│    ikuti aturan dan kebijakan group',
  '│    masing-masing.',
  '│',
  '│ 6. Jangan membagikan data pribadi',
  '│    atau informasi sensitif melalui',
  '│    bot maupun kepada pengguna lain.',
  '│',
  '│ 7. Beberapa fitur dapat berubah,',
  '│    dibatasi, atau dinonaktifkan',
  '│    sewaktu-waktu untuk pemeliharaan.',
  '│',
  '│ Dengan menggunakan Nano Ai, Anda',
  '│ dianggap telah memahami dan',
  '│ menyetujui peraturan penggunaan.',
  '│',
  '╰───────────────',
].join('\n')

const handler = async (m, { conn, usedPrefix }) => {
  const button = new ButtonV2(conn)
    .setBody(' ')
    .setFooter(rulesText)

  /* Buffer ASLI — ButtonV2 yang menyiapkan ukurannya (header 1024 / lokasi 300). */
  const thumbnail = fs.existsSync(THUMBNAIL_MENU) ? fs.readFileSync(THUMBNAIL_MENU) : null
  if (thumbnail) button.setThumbnail(thumbnail)

  button.addButton('⌂ MENU', `${usedPrefix}menu`)
  button.addButton('✧ DONASI', `${usedPrefix}donasi`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^(peraturan|rules|aturan)$/i
handler.help = ['peraturan', 'rules', 'aturan']
handler.tags = ['main']
handler.description = 'Menampilkan peraturan penggunaan bot'
handler.category = 'main'
handler.hiddenFromCategory = false

export default handler
