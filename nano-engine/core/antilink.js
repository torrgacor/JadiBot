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

import { getDb } from './sqlite.js'
import { isOwner, resolvePhoneNumber } from '../lib/cek-akses.js'
import {
  MAX_WARN,
  ANTILINK_SOURCE,
  addWarn,
  clearMember,
  clearSource,
  countSource,
} from '../lib/warn-store.js'
import { findParticipant, participantIsAdmin, getParticipantJid, isBotAdmin } from '../lib/akses-grup.js'
import { denganPromo } from './identitas.js'

const GROUP_LINK_RE = /(?:https?:\/\/)?(?:www\.)?chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i
const CHANNEL_LINK_RE = /(?:https?:\/\/)?(?:www\.)?(?:whatsapp\.com\/channel\/|wa\.me\/channel\/)[A-Za-z0-9_-]+/i
const metadataCache = new Map()
const noticeCache = new Map()

function asText(value) {
  return typeof value === 'string' ? value : ''
}

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 8; i++) {
    if (!current || typeof current !== 'object') break
    const next = current.ephemeralMessage?.message || current.viewOnceMessage?.message || current.viewOnceMessageV2?.message || current.documentWithCaptionMessage?.message || current
    if (next === current) break
    current = next
  }
  return current || {}
}

export function extractMessageText(message) {
  const content = unwrapMessage(message)
  const texts = [
    content.conversation,
    content.extendedTextMessage?.text,
    content.imageMessage?.caption,
    content.videoMessage?.caption,
    content.documentMessage?.caption,
    content.documentWithCaptionMessage?.message?.documentMessage?.caption,
    content.buttonsResponseMessage?.selectedButtonId,
    content.listResponseMessage?.singleSelectReply?.selectedRowId,
    content.templateButtonReplyMessage?.selectedId,
  ]
  return texts.filter((value) => typeof value === 'string' && value.trim()).join('\n')
}

export function detectLinkType(text) {
  const value = asText(text)
  if (GROUP_LINK_RE.test(value)) return 'gc'
  if (CHANNEL_LINK_RE.test(value)) return 'ch'
  return null
}

export function getAntiLinkStatus(groupId) {
  const row = getDb().prepare('SELECT gc_enabled, ch_enabled FROM group_antilink WHERE chatId = ?').get(groupId)
  return {
    gc: Boolean(row?.gc_enabled),
    ch: Boolean(row?.ch_enabled),
  }
}

export function setAntiLinkStatus(groupId, type, enabled) {
  const column = type === 'gc' ? 'gc_enabled' : 'ch_enabled'
  const db = getDb()
  db.prepare(`
    INSERT INTO group_antilink (chatId, gc_enabled, ch_enabled)
    VALUES (?, ?, ?)
    ON CONFLICT(chatId) DO UPDATE SET ${column} = excluded.${column}
  `).run(groupId, type === 'gc' ? (enabled ? 1 : 0) : 0, type === 'ch' ? (enabled ? 1 : 0) : 0)
  if (!enabled) {
    // Mematikan anti-link mereset hitungan pelanggarannya — sekarang lewat
    // gate peringatan bersama, jadi entri bertanda 'antilink' yang dibuang.
    clearSource(groupId, ANTILINK_SOURCE)
  }
  return getAntiLinkStatus(groupId)
}

/*
  Bentrok tidak lagi punya counter sendiri: hitungannya menumpuk di
  lib/warn-store.js bersama peringatan manual (.warn) sehingga .warns dan
  batas 3x berlaku untuk keduanya. Parameter `type` dipertahankan agar
  kompatibel dengan pemanggil lama.
*/
export function getAntiLinkStrike(groupId, senderJid, type = '') {
  return countSource(groupId, senderJid, ANTILINK_SOURCE)
}

async function getMetadata(conn, groupId) {
  const cached = metadataCache.get(groupId)
  if (cached && cached.expiresAt > Date.now()) return cached.metadata
  const metadata = await conn.groupMetadata(groupId)
  metadataCache.set(groupId, { metadata, expiresAt: Date.now() + 15000 })
  return metadata
}

async function resolveSenderJid(senderJid, conn) {
  const value = asText(senderJid)
  if (!value) return ''
  if (value.includes('@s.whatsapp.net')) return value
  try {
    const number = await resolvePhoneNumber(value, conn)
    if (number) return `${number}@s.whatsapp.net`
  } catch {
  }
  return value
}

async function canBypass(conn, groupId, senderJid, metadata) {
  if (await isOwner(senderJid, conn)) return true
  const participant = findParticipant(metadata, senderJid)
  if (participant && participantIsAdmin(participant)) return true
  const resolved = await resolveSenderJid(senderJid, conn)
  const resolvedParticipant = findParticipant(metadata, resolved)
  return Boolean(resolvedParticipant && participantIsAdmin(resolvedParticipant))
}

async function sendBotAdminNotice(conn, groupId, type) {
  const key = `${groupId}:${type}`
  const last = noticeCache.get(key) || 0
  if (Date.now() - last < 30 * 60 * 1000) return
  noticeCache.set(key, Date.now())
  await conn.sendMessage(groupId, {
    text: denganPromo([
      '╭─〔 ANTI LINK 〕',
      '│',
      '│ Moderasi belum dapat berjalan.',
      '│ Bot harus menjadi admin group',
      '│ agar dapat menghapus pesan dan',
      '│ mengeluarkan pelanggar.',
      '╰──────────────',
    ].join('\n')),
  })
}

async function deleteMessage(conn, raw) {
  try {
    await conn.sendMessage(raw.key.remoteJid, { delete: raw.key })
    return true
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal menghapus pesan anti-link: ${err.message}`)
    return false
  }
}

async function removeParticipant(conn, groupId, participantJid) {
  const jid = asText(participantJid)
  if (!jid) return false
  try {
    await conn.groupParticipantsUpdate(groupId, [jid], 'remove')
    return true
  } catch (firstError) {
    try {
      const number = await resolvePhoneNumber(jid, conn)
      if (number) {
        await conn.groupParticipantsUpdate(groupId, [`${number}@s.whatsapp.net`], 'remove')
        return true
      }
    } catch {
    }
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengeluarkan member anti-link: ${firstError.message}`)
    return false
  }
}

function violationText(type, strike, max) {
  const label = type === 'gc' ? 'link group' : 'link saluran WhatsApp'
  if (strike >= max) {
    return [
      '╭─〔 ANTI LINK 〕',
      '│',
      `│ Pelanggaran ${label} — total peringatan ${strike}/${max}.`,
      '│ Pesan telah dihapus.',
      '│ Member akan dikeluarkan dari group.',
      '╰──────────────',
    ].join('\n')
  }
  return [
    '╭─〔 ANTI LINK 〕',
    '│',
    `│ ${label} terdeteksi dan dihapus.`,
    `│ Peringatan : ${strike}/${max}`,
    '│',
    '│ Mohon jangan mengirim link tersebut',
    '│ selama fitur ini sedang aktif.',
    '╰──────────────',
  ].join('\n')
}

export async function handleAntiLinkMessage(conn, raw) {
  const groupId = asText(raw?.key?.remoteJid)
  if (!groupId.endsWith('@g.us')) return false
  if (raw?.key?.fromMe) return false
  if (!raw?.message) return false

  const status = getAntiLinkStatus(groupId)
  if (!status.gc && !status.ch) return false

  const text = extractMessageText(raw.message)
  const type = detectLinkType(text)
  if (!type || (type === 'gc' ? !status.gc : !status.ch)) return false

  const senderJid = asText(raw?.key?.participant || raw?.key?.participantAlt || raw?.participant || '')
  if (!senderJid) return false

  let metadata
  try {
    metadata = await getMetadata(conn, groupId)
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Metadata anti-link tidak tersedia: ${err.message}`)
    return false
  }

  if (await canBypass(conn, groupId, senderJid, metadata)) return false

  const botAdmin = await isBotAdmin(conn, groupId, metadata)
  if (!botAdmin) {
    await sendBotAdminNotice(conn, groupId, type)
    return false
  }

  const resolvedSender = await resolveSenderJid(senderJid, conn)
  const participant = findParticipant(metadata, senderJid) || findParticipant(metadata, resolvedSender)
  const targetJid = getParticipantJid(participant, resolvedSender) || senderJid
  await deleteMessage(conn, raw)

  const max = MAX_WARN
  const label = type === 'gc' ? 'link group' : 'link saluran WhatsApp'
  const added = addWarn(groupId, targetJid, { by: ANTILINK_SOURCE, reason: 'Mengirim ' + label })
  const strike = added.count

  if (strike >= max) {
    await conn.sendMessage(groupId, { text: denganPromo(violationText(type, strike, max)) })
    const removed = await removeParticipant(conn, groupId, targetJid)
    if (!removed && targetJid !== senderJid) {
      await removeParticipant(conn, groupId, senderJid)
    } else if (removed) {
      clearMember(groupId, targetJid)
    }
    return true
  }

  await conn.sendMessage(groupId, { text: denganPromo(violationText(type, strike, max)), mentions: [targetJid] })
  return true
}

export function clearAntiLinkCache(groupId = '') {
  if (groupId) {
    metadataCache.delete(groupId)
    noticeCache.delete(`${groupId}:gc`)
    noticeCache.delete(`${groupId}:ch`)
    return
  }
  metadataCache.clear()
  noticeCache.clear()
}

export default { getAntiLinkStatus, setAntiLinkStatus, getAntiLinkStrike, handleAntiLinkMessage, detectLinkType, extractMessageText, clearAntiLinkCache }
