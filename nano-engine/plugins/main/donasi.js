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

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { settings } from '../../config/settings.js'
import { ButtonV2 } from '../../lib/tombol.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const QRIS_PATH = path.join(__dirname, '..', '..', 'assets', 'image', settings.donation.qrisImage || 'qris.jpg')
const THUMBNAIL_MENU = path.join(__dirname, '..', '..', 'assets', 'image', settings.menuImage || 'awang.jpg')

const donationMenuText = [
  '╭───〔 💝 DONASI NANO AI 〕',
  '│',
  '│ Terima kasih sudah mendukung',
  '│ perkembangan dan pemeliharaan',
  '│ Nano Ai.',
  '│',
  '│ Dukungan Anda membantu biaya',
  '│ server, pengembangan fitur,',
  '│ serta menjaga bot tetap aktif.',
  '│',
  '╰──────────────',
  '',
  'Silakan pilih metode pembayaran di bawah ini.',
].join('\n')

const formatDanaNumber = (number) => {
  if (!number) return 'Belum dikonfigurasi'
  return String(number).replace(/\s+/g, '')
}

const handler = async (m, { conn, usedPrefix }) => {
  const action = String(m.args?.[0] || '').toLowerCase()

  if (action === 'dana') {
    const number = formatDanaNumber(settings.donation?.danaNumber)
    const name = settings.donation?.danaName || settings.ownerName

    const text = [
      '╭───〔 💳 DANA 〕',
      '│',
      `│ Nama   : ${name}`,
      `│ Nomor  : ${number}`,
      '│',
      '│ Silakan kirim donasi sesuai',
      '│ kemampuan Anda. Terima kasih',
      '│ atas dukungannya! 🙏',
      '╰──────────────',
    ].join('\n')

    await conn.sendMessage(m.chat, { text }, { quoted: m.raw })
    return
  }

  if (action === 'qris') {
    if (!(await fs.pathExists(QRIS_PATH))) {
      await conn.sendMessage(
        m.chat,
        { text: `❌ Gambar QRIS tidak ditemukan. Pastikan file tersedia di assets/image/${settings.donation?.qrisImage || 'qris.jpg'}.` },
        { quoted: m.raw }
      )
      return
    }

    const image = await fs.readFile(QRIS_PATH)
    const caption = [
      '╭───〔 📱 QRIS 〕',
      '│',
      '│ Scan QRIS di atas menggunakan',
      '│ aplikasi pembayaran yang',
      '│ mendukung QRIS.',
      '│',
      '│ Terima kasih atas dukungan',
      '│ Anda untuk Nano Ai. 🙏',
      '╰──────────────',
    ].join('\n')

    await conn.sendMessage(
      m.chat,
      { image, caption },
      { quoted: m.raw }
    )
    return
  }

  const button = new ButtonV2(conn)
    .setBody(' ')
    .setFooter(donationMenuText)

  /* Buffer ASLI — ButtonV2 yang menyiapkan ukurannya (header 1024 / lokasi 300). */
  const thumbnail = fs.existsSync(THUMBNAIL_MENU) ? fs.readFileSync(THUMBNAIL_MENU) : null
  if (thumbnail) button.setThumbnail(thumbnail)

  button.addButton('𝚿 DANA', `${usedPrefix}donasi dana`)
  button.addButton('▣ QRIS', `${usedPrefix}donasi qris`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^donasi$/i
handler.help = ['donasi']
handler.tags = ['main']
handler.description = 'Menampilkan pilihan metode donasi'
handler.category = 'main'
handler.hiddenFromCategory = false

export default handler
