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
  makeGroupLink,
  normalizeGroupMetadata,
  parseGroupInput,
  resolveProfileImage,
} from '../../lib/id-lookup.js'

const HEADER = '╭─〔 NANO GROUP INFO 〕'
const FOOTER = '╰──────────────╯'
const PLACEHOLDER = 'channel-placeholder.svg'

function helpText(prefix) {
  return [
    HEADER,
    '│',
    `│ Gunakan : ${prefix}cekidgc <link group>`,
    '│',
    '│ Bisa juga membalas pesan yang berisi link',
    '│ group untuk memeriksa metadata group.',
    FOOTER,
  ].join('\n')
}

function buildBody(metadata, timezone) {
  const description = metadata.description || 'Tidak tersedia'
  const rows = [
    HEADER,
    '│',
    `│ Nama       : ${metadata.subject}`,
    '│ ID Group   :',
    `│ ${metadata.id}`,
    `│ Anggota    : ${formatNumber(metadata.memberCount)}`,
    `│ Profil     : ${metadata.hasPicture ? 'Tersedia' : 'Belum dipasang'}`,
  ]

  if (metadata.owner) rows.push(`│ Pemilik    : ${metadata.owner}`)
  if (metadata.creation) rows.push(`│ Dibuat     : ${formatDateId(metadata.creation, timezone)}`)
  rows.push('│', `│ Deskripsi  : ${description}`, '│', '│ ID berasal dari metadata resmi group.', FOOTER)
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
  const parsed = parseGroupInput(rawInput)

  if (!parsed) {
    await m.reply(helpText(usedPrefix))
    return
  }

  react(rawConn, m.chat, m.raw?.key, '⏳')

  try {
    let metadataRaw
    let groupId
    let inviteLink = ''

    if (parsed.type === 'jid') {
      groupId = parsed.value
      metadataRaw = await conn.groupMetadata(groupId)
    } else {
      if (typeof conn.groupGetInviteInfo !== 'function') {
        throw new Error('Koneksi WhatsApp ini tidak menyediakan pencarian group dari link.')
      }
      metadataRaw = await conn.groupGetInviteInfo(parsed.value)
      groupId = metadataRaw?.id || metadataRaw?.jid || ''
      inviteLink = makeGroupLink(parsed.value)
    }

    const metadata = normalizeGroupMetadata(metadataRaw, groupId)
    if (!metadata.id || !metadata.id.endsWith('@g.us')) {
      throw new Error('ID group tidak ditemukan pada metadata WhatsApp.')
    }

    const image = await resolveProfileImage(conn, metadata.id)
    metadata.hasPicture = Boolean(image)
    const displayImage = image || PLACEHOLDER
    if (!inviteLink && parsed.type === 'jid' && typeof conn.groupInviteCode === 'function') {
      try {
        const code = await conn.groupInviteCode(groupId)
        inviteLink = makeGroupLink(code)
      } catch {}
    }

    const buttons = [
      {
        type: 'copy',
        label: 'SALIN ID GROUP',
        id: `copy_${metadata.id}`,
        copyCode: metadata.id,
      },
    ]

    if (inviteLink) {
      buttons.push({
        type: 'url',
        label: 'BUKA GROUP',
        url: inviteLink,
      })
    }

    await sendInteractive(
      conn,
      m.chat,
      {
        title: metadata.subject,
        subtitle: 'WhatsApp Group',
        body: buildBody(metadata, settings?.timezone || 'Asia/Jakarta'),
        footer: 'Nano • Group Identifier',
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
      '│ Group belum berhasil dibaca.',
      `│ ${String(err?.message || err)}`,
      '│',
      '│ Periksa kembali link atau JID group.',
      FOOTER,
    ].join('\n'))
  }
}

handler.command = /^cekidgc$/i
handler.help = ['cekidgc']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengecek ID dan metadata WhatsApp Group'

export default handler
