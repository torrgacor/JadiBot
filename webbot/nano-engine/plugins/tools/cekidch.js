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

import { sendInteractive } from '../../lib/tombol.js'
import {
  extractQuotedText,
  formatDateId,
  formatNumber,
  makeNewsletterLink,
  normalizeNewsletterMetadata,
  parseNewsletterInput,
  resolveProfileImage,
} from '../../lib/id-lookup.js'

const HEADER = '╭─〔 NANO CHANNEL INFO 〕'
const FOOTER = '╰──────────────╯'
const PLACEHOLDER = 'channel-placeholder.svg'

function helpText(prefix) {
  return [
    HEADER,
    '│',
    `│ Gunakan : ${prefix}cekidch <link channel>`,
    '│',
    '│ Bisa juga membalas pesan yang berisi link',
    '│ channel untuk memeriksa salurannya.',
    FOOTER,
  ].join('\n')
}

function buildBody(metadata, timezone) {
  const description = metadata.description || 'Tidak tersedia'
  const rows = [
    HEADER,
    '│',
    `│ Nama       : ${metadata.name}`,
    '│ ID Saluran :',
    `│ ${metadata.id}`,
    `│ Pengikut   : ${metadata.subscribers === null ? 'Tidak tersedia' : formatNumber(metadata.subscribers)}`,
    `│ Verifikasi : ${metadata.verification}`,
    `│ Profil     : ${metadata.hasPicture ? 'Tersedia' : 'Belum dipasang'}`,
  ]

  if (metadata.owner) rows.push(`│ Pemilik    : ${metadata.owner}`)
  if (metadata.creationTime) rows.push(`│ Dibuat     : ${formatDateId(metadata.creationTime, timezone)}`)
  rows.push('│', `│ Deskripsi  : ${description}`, '│', '│ ID berasal dari metadata resmi saluran.', FOOTER)
  return rows.join('\n')
}

function react(rawConn, chat, key, text) {
  if (!rawConn?.sendMessage || !key) return
  void rawConn.sendMessage(chat, { react: { text, key } }).catch(() => {})
}

const handler = async (m, { conn, rawConn, usedPrefix, settings }) => {
  const directInput = String(m.args?.join(' ') || '').trim()
  const quotedInput = extractQuotedText(m)
  const rawInput = directInput || quotedInput
  const parsed = parseNewsletterInput(rawInput)

  if (!parsed) {
    await m.reply(helpText(usedPrefix))
    return
  }

  react(rawConn, m.chat, m.raw?.key, '⏳')

  try {
    if (typeof conn.newsletterMetadata !== 'function') {
      throw new Error('Koneksi WhatsApp ini tidak menyediakan pembacaan metadata saluran.')
    }

    const metadataRaw = await conn.newsletterMetadata(parsed.type, parsed.value)
    const metadata = normalizeNewsletterMetadata(metadataRaw, parsed.type === 'jid' ? parsed.value : '')

    if (!metadata.id || !metadata.id.endsWith('@newsletter')) {
      throw new Error('ID saluran tidak ditemukan pada metadata WhatsApp.')
    }

    const image = await resolveProfileImage(
      conn,
      metadata.id,
      metadata.pictureUrl,
      metadata.pictureDirectPath,
      metadata.previewUrl,
      metadata.previewDirectPath,
    )
    metadata.hasPicture = Boolean(image)
    const displayImage = image || PLACEHOLDER
    const link = makeNewsletterLink(metadata, rawInput)
    const buttons = [
      {
        type: 'copy',
        label: 'SALIN ID SALURAN',
        id: `copy_${metadata.id}`,
        copyCode: metadata.id,
      },
    ]

    if (link) {
      buttons.push({
        type: 'url',
        label: 'BUKA SALURAN',
        url: link,
      })
    }

    await sendInteractive(
      conn,
      m.chat,
      {
        title: metadata.name,
        subtitle: 'WhatsApp Channel',
        body: buildBody(metadata, settings?.timezone || 'Asia/Jakarta'),
        footer: 'Nano • Channel Identifier',
        image: displayImage,
        buttons,
      },
      { quoted: m.raw }
    )

    react(rawConn, m.chat, m.raw?.key, '✅')
  } catch (err) {
    react(rawConn, m.chat, m.raw?.key, '⚠️')
    await m.reply([
      HEADER,
      '│',
      '│ Saluran belum berhasil dibaca.',
      `│ ${String(err?.message || err)}`,
      '│',
      '│ Periksa kembali link atau JID saluran.',
      FOOTER,
    ].join('\n'))
  }
}

handler.command = /^cekidch$/i
handler.help = ['cekidch']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengecek ID dan metadata WhatsApp Channel'

export default handler
