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
import {
  isGroupAdmin,
  isBotAdmin,
  findParticipant,
  getParticipantJid,
  participantIsAdmin,
  sameParticipant,
} from './akses-grup.js'

/**
 * Shared plumbing for the group moderation plugins.
 *
 * Everything here is read-only against WhatsApp: it resolves who was targeted
 * and whether the caller (and the bot) may act. The actual mutation stays in
 * the plugin, because that is where the permission decision belongs.
 */

export function getContextInfo(m) {
  const content = m.raw?.message?.ephemeralMessage?.message || m.raw.message
  return (
    content?.extendedTextMessage?.contextInfo ||
    content?.imageMessage?.contextInfo ||
    content?.videoMessage?.contextInfo ||
    content?.documentMessage?.contextInfo ||
    null
  )
}

export function getMentionedJids(m) {
  const ctx = getContextInfo(m)
  return Array.isArray(ctx?.mentionedJid) ? ctx.mentionedJid.filter(Boolean) : []
}

export function getQuotedSender(m) {
  return getContextInfo(m)?.participant || null
}

/**
 * Whichever member the caller pointed at: every mention first, otherwise the
 * sender of the message being replied to. Duplicates are dropped because a
 * mention can arrive twice (LID + phone number) in the same contextInfo.
 */
export function resolveTargetJids(m) {
  const mentions = getMentionedJids(m)
  if (mentions.length) return [...new Set(mentions)]
  const quoted = getQuotedSender(m)
  return quoted ? [quoted] : []
}

/** Display form of a JID — always the 62… number, never a LID. */
export async function displayNumber(jid, conn, groupId = '') {
  try {
    const number = await resolvePhoneNumber(jid, conn, { groupId })
    if (number) return number
  } catch {
    // fall through to the JID's local part
  }
  return String(jid || '').split('@')[0].split(':')[0] || ''
}

export function mentionOf(number) {
  return number ? '@' + number : 'member'
}

/**
 * Gate for every moderation command: the chat must be a group, the caller must
 * be the bot owner or a group admin, and (unless options.requireBotAdmin is
 * false) the bot itself must be an admin.
 *
 * Replies with the reason and returns ok:false so the caller can simply
 * `if (!gate.ok) return`.
 */
export async function requireGroupAdmin(m, conn, metadata = null, options = {}) {
  const requireBotAdmin = options.requireBotAdmin !== false
  if (!m.isGroup) {
    await m.reply('Perintah ini hanya bisa dipakai di dalam group.')
    return { ok: false, metadata: null }
  }

  let data = metadata
  if (!data) {
    try {
      data = await conn.groupMetadata(m.chat)
    } catch (err) {
      await m.reply('Gagal membaca data group.\n' + String(err?.message || err))
      return { ok: false, metadata: null }
    }
  }

  let owner = false
  try {
    owner = await isOwner(m.sender, conn, { alt: m.senderAlt, groupId: m.chat })
  } catch {
    owner = false
  }

  let admin = owner
  if (!admin) {
    try {
      admin = await isGroupAdmin(conn, m.chat, m.sender, data)
    } catch {
      admin = false
    }
  }

  if (!admin) {
    await m.reply('Perintah ini hanya bisa dipakai oleh *owner bot* atau *admin group*.')
    return { ok: false, metadata: data }
  }

  let botAdmin = false
  try {
    botAdmin = await isBotAdmin(conn, m.chat, data)
  } catch {
    botAdmin = false
  }

  if (requireBotAdmin && !botAdmin) {
    await m.reply('Bot harus dijadikan *admin group* dulu supaya bisa menjalankan perintah ini.')
    return { ok: false, metadata: data }
  }

  return { ok: true, metadata: data, owner, admin, botAdmin }
}

/**
 * Turn target JIDs into the JID WhatsApp actually keys that member by.
 *
 * In a LID group the mention arrives as a phone number while the participant
 * record is a LID, so acting on the raw mention would silently do nothing —
 * hence the lookup in metadata first, with the mention as fallback.
 */
export function toParticipantJids(metadata, targets) {
  return targets
    .map((target) => {
      const participant = findParticipant(metadata, target)
      return getParticipantJid(participant, target)
    })
    .filter(Boolean)
}

export function isGroupOwnerParticipant(participant) {
  return participant?.admin === 'superadmin' || participant?.isSuperAdmin === true
}

export function botJid(conn) {
  return String(conn?.user?.id || '')
}

export function sameAsBot(jid, conn) {
  const bot = botJid(conn)
  return bot ? sameParticipant(jid, bot) : false
}

export function box(lines) {
  const title = lines[0] || 'NANO'
  const body = lines.slice(1).map((line) => ('│ ' + line).trimEnd())
  return ['╭─〔 ' + title + ' 〕', ...body, '╰────────────────'].join('\n')
}

export {
  isOwner,
  resolvePhoneNumber,
  isGroupAdmin,
  isBotAdmin,
  findParticipant,
  getParticipantJid,
  participantIsAdmin,
  sameParticipant,
}

export default {
  getContextInfo,
  getMentionedJids,
  getQuotedSender,
  resolveTargetJids,
  displayNumber,
  mentionOf,
  requireGroupAdmin,
  toParticipantJids,
  isGroupOwnerParticipant,
  botJid,
  sameAsBot,
  box,
}
