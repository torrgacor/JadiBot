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

import { isOwner, resolvePhoneNumber } from './cek-akses.js'
import { isGroupAdmin } from './akses-grup.js'
import { settings } from '../config/settings.js'
import {
  MAX_MESSAGE_LENGTH,
  MESSAGE_PLACEHOLDERS,
  clearLeftMessage,
  clearWelcomeMessage,
  getLeftConfig,
  getLeftMessage,
  getWelcomeConfig,
  getWelcomeMessage,
  renderMessage,
  setLeftMessage,
  setWelcomeMessage,
} from '../core/welcome.js'

const RESET_WORDS = ['reset', 'default', 'bawaan', 'hapus', 'clear']
const VIEW_WORDS = ['lihat', 'get', 'status', 'cek']

const TARGETS = {
  welcome: {
    commands: ['setwelcome', 'setwlc'],
    boxTitle: 'SETWELCOME',
    label: 'welcome',
    noun: 'sambutan member baru',
    read: getWelcomeMessage,
    write: setWelcomeMessage,
    clear: clearWelcomeMessage,
    config: getWelcomeConfig,
    example: 'Selamat datang {mention}\\ndi {group} 🎉\\nKamu member ke-{total}',
  },
  left: {
    commands: ['setleft', 'setgoodbye'],
    boxTitle: 'SETLEFT',
    label: 'perpisahan',
    noun: 'perpisahan member keluar',
    read: getLeftMessage,
    write: setLeftMessage,
    clear: clearLeftMessage,
    config: getLeftConfig,
    example: 'Selamat jalan {mention} 👋\\nSemoga sukses di luar {group}\\nSisa {total} member di sini',
  },
}

function resolveTarget(name) {
  return TARGETS[name] || TARGETS.welcome
}

/*
  Ambil teks asli dari pesan (bukan hasil pemisahan spasi router) supaya
  admin boleh menulis teks beberapa baris langsung dari WhatsApp.
*/
function bodyText(m, usedPrefix, commands) {
  const raw = String(
    m?.currentMessage?.conversation ||
    m?.currentMessage?.extendedTextMessage?.text ||
    ''
  ).trim()

  if (raw) {
    const prefix = String(usedPrefix || '')
    const withoutPrefix = prefix && raw.startsWith(prefix) ? raw.slice(prefix.length) : raw
    const spaceAt = withoutPrefix.search(/\s/)
    const command = (spaceAt === -1 ? withoutPrefix : withoutPrefix.slice(0, spaceAt)).toLowerCase()

    if (commands.includes(command)) {
      return spaceAt === -1 ? '' : withoutPrefix.slice(spaceAt + 1).trim()
    }
  }

  return String(m?.text || '').trim()
}

async function groupInfo(conn, groupId) {
  try {
    const metadata = await conn.groupMetadata(groupId)
    return {
      name: String(metadata?.subject || '').trim() || 'Group',
      total: Array.isArray(metadata?.participants) ? metadata.participants.length : 0,
    }
  } catch {
    return { name: 'Group', total: 0 }
  }
}

async function previewValues(m, conn, group) {
  let number = String(m.senderNumber || '').replace(/\D/g, '')
  if (!number) {
    try {
      number = await resolvePhoneNumber(m.sender, conn)
    } catch {
      number = ''
    }
  }

  const name = String(m.pushName || '').trim() || 'Kamu'

  return {
    name,
    number: number || '-',
    group: group.name,
    mention: number ? `@${number}` : name,
    total: group.total > 0 ? String(group.total) : '-',
    bot: settings.botName || 'Bot',
  }
}

function guideText(usedPrefix, config, target) {
  return [
    `╭─〔 NANO • ${target.boxTitle} 〕`,
    '│',
    `│ Status  : *${config.enabled ? 'AKTIF' : 'NONAKTIF'}*`,
    `│ Teks    : *${config.message ? 'KUSTOM' : 'BAWAAN'}*`,
    '│',
    '│ *CARA PAKAI*',
    `│ ▸ ${usedPrefix}${target.commands[0]} <teks>`,
    `│ ▸ ${usedPrefix}${target.commands[0]} reset`,
    `│ ▸ ${usedPrefix}${target.commands[0]} lihat`,
    '│',
    '│ *PLACEHOLDER*',
    '│ ▸ {name}     nama member',
    '│ ▸ {number}   nomor member',
    '│ ▸ {group}    nama group',
    '│ ▸ {mention}  tag member',
    '│ ▸ {total}    jumlah member',
    '│ ▸ {bot}      nama bot',
    '│',
    `│ Maksimal ${MAX_MESSAGE_LENGTH} karakter.`,
    '│ Tulis \\n untuk baris baru, atau kirim',
    '│ pesan beberapa baris langsung.',
    '│',
    '│ *CONTOH*',
    `│ ${usedPrefix}${target.commands[0]} ${target.example}`,
    '│',
    '│ *TEKS LAIN*',
    `│ ▸ ${usedPrefix}setwelcome  sambutan member masuk`,
    `│ ▸ ${usedPrefix}setleft     perpisahan member keluar`,
    '│',
    `│ ⚠ Teks ini baru terkirim kalau welcome`,
    `│ group AKTIF → *${usedPrefix}welcome on*`,
    '╰──────────────',
  ].join('\n')
}

export async function runSetMessage(m, { conn, usedPrefix }, targetName) {
  const target = resolveTarget(targetName)

  const owner = await isOwner(m.sender, conn, { groupId: m.chat })
  const admin = owner || await isGroupAdmin(conn, m.chat, m.sender)

  if (!admin) {
    await conn.sendMessage(
      m.chat,
      { text: 'Perintah ini hanya dapat diatur oleh *owner bot* atau *admin group*.' },
      { quoted: m.raw }
    )
    return
  }

  const body = bodyText(m, usedPrefix, target.commands)
  const firstWord = body.split(/\s+/)[0]?.toLowerCase() || ''
  const config = target.config(m.chat)

  if (RESET_WORDS.includes(firstWord)) {
    target.clear(m.chat)
    await conn.sendMessage(
      m.chat,
      {
        text: [
          `╭─〔 NANO • ${target.boxTitle} 〕`,
          '│',
          `│ ✅ Teks ${target.label} kustom dihapus.`,
          '│ Kartu bawaan dipakai lagi.',
          '│',
          `│ Aktif/nonaktif : *${usedPrefix}welcome on|off*`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
    return
  }

  if (!body || VIEW_WORDS.includes(firstWord)) {
    if (!config.message) {
      await conn.sendMessage(m.chat, { text: guideText(usedPrefix, config, target) }, { quoted: m.raw })
      return
    }

    const group = await groupInfo(conn, m.chat)
    const preview = renderMessage(config.message, await previewValues(m, conn, group))
    await conn.sendMessage(
      m.chat,
      {
        text: [
          `╭─〔 NANO • TEKS ${target.boxTitle} AKTIF 〕`,
          '│',
          preview,
          '╰──────────────',
          guideText(usedPrefix, config, target),
        ].join('\n'),
      },
      { quoted: m.raw }
    )
    return
  }

  try {
    const saved = target.write(m.chat, body)
    const group = await groupInfo(conn, m.chat)
    const preview = renderMessage(saved, await previewValues(m, conn, group))

    await conn.sendMessage(
      m.chat,
      {
        text: [
          `╭─〔 NANO • ${target.boxTitle} 〕`,
          '│',
          `│ ✅ Teks ${target.noun} tersimpan.`,
          `│ Panjang : *${saved.length}/${MAX_MESSAGE_LENGTH}*`,
          '│',
          '│ *PRATINJAU*',
          preview,
          '│',
          `│ Placeholder : ${MESSAGE_PLACEHOLDERS.join(' ')}`,
          `│ Ubah lagi   : *${usedPrefix}${target.commands[0]} <teks>*`,
          `│ Kembalikan  : *${usedPrefix}${target.commands[0]} reset*`,
          config.enabled
            ? '│ Status      : *AKTIF ✓*'
            : `│ Status      : *NONAKTIF* → *${usedPrefix}welcome on*`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
  } catch (err) {
    await conn.sendMessage(
      m.chat,
      {
        text: [
          `╭─〔 NANO • ${target.boxTitle} 〕`,
          '│',
          `│ ❌ Teks ${target.label} gagal disimpan.`,
          `│ ${err?.message || 'Alasan tidak diketahui'}`,
          '│',
          `│ Maksimal ${MAX_MESSAGE_LENGTH} karakter.`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
  }
}

export default { runSetMessage }
