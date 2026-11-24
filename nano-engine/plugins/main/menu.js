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
import { settings } from '../../config/settings.js'
import { buildMenuFooter, buildCategoryList, getGreeting } from '../../lib/menu.js'
import { ButtonV2 } from '../../lib/tombol.js'
import { isOwner, resolvePhoneNumber } from '../../lib/cek-akses.js'
import { getUser } from '../../core/database-user.js'
import { creatorWatermark } from '../../core/identitas.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUDIO_MENU = path.join(__dirname, '..', '..', 'assets', 'audio', 'awang.mp3')
const THUMBNAIL_MENU = path.join(__dirname, '..', '..', 'assets', 'image', settings.menuImage || 'awang.jpg')

const handler = async (m, { conn, usedPrefix }) => {
  const isOwnerUser = await isOwner(m.sender, conn)
  const user = await getUser(m.sender)
  const contactNumber = await resolvePhoneNumber(m.sender, conn)


  const footerLong = buildMenuFooter({
    prefix: usedPrefix,
    pushName: m.pushName,
    contactNumber,
    isOwnerUser,
    registeredAt: user?.registeredAt,
  }) + '\n\n' + creatorWatermark()


  const rawSections = buildCategoryList({ prefix: usedPrefix }).sections
  const sections = rawSections.map((section) => ({
    title: section.title,
    highlight_label: section.highlightLabel || '',
    rows: section.rows.map((row) => ({
      header: row.header || '',
      title: row.title,
      description: row.description || '',
      id: row.command,
    })),
  }))

  const audioPath = AUDIO_MENU
  if (fs.existsSync(audioPath)) {
    await conn.sendMessage(
      m.chat,
      {
        audio: fs.readFileSync(audioPath),
        mimetype: 'audio/mp4',
        ptt: false,
      },
      { quoted: m.raw }
    )
  }

  const button = new ButtonV2(conn)
    .setBody(' ') .setFooter(footerLong)

  /* Buffer ASLI gambar menu — ButtonV2 yang mengurus ukurannya: 1024 kotak
     1:1 untuk header gambar, 300 kotak untuk header lokasi. */
  const thumbnail = fs.existsSync(THUMBNAIL_MENU) ? fs.readFileSync(THUMBNAIL_MENU) : null
  if (thumbnail) button.setThumbnail(thumbnail)

  button.addButton('♕ OWNER BOT', `${usedPrefix}owner`)

  button.addRawButton({
    buttonText: { displayText: '☰ LIST MENU' },
    buttonId: 'menu',
    /* type 2 = NATIVE_FLOW: tanpa ini daftar kategori tidak pernah terbuka */
    type: 2,
    nativeFlowInfo: {
      name: 'single_select',
      paramsJson: JSON.stringify({
        title: `${settings.botName} Menu`,
        sections: sections,
      }),
    },
  })

  /* Promo cukup baris teks di footer (creatorWatermark) — tanpa tombol. */
  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^menu$/i
handler.help = ['menu']
handler.tags = ['main']
handler.description = 'Menampilkan menu utama bot'

export default handler