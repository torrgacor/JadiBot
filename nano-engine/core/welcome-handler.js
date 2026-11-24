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
┇🔸Source Nano Ai - No Comot Ya!!
⌬
*/

import { getLeftMessage, getWelcomeMessage, isWelcomeEnabled, renderMessage } from './welcome.js'
import { normalizeNumber, resolvePhoneNumber } from '../lib/cek-akses.js'
import { settings } from '../config/settings.js'
import { getActivePrefix } from './prefix.js'
import { sendInteractive } from '../lib/tombol.js'
import { renderMemberCard } from './welcome-renderer.js'
import { getUser } from './database-user.js'

const memberNameCache = new Map()
const memberJidCache = new Map()
const contactNameCache = new Map()

function asString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeParticipantKey(value) {
  const text = asString(value).toLowerCase()
  if (!text) return ''
  const [local, domain] = text.split('@')
  if (!domain) return text
  const base = local.split(':')[0]
  return `${base}@${domain}`
}

function cacheKey(groupId, jid) {
  const key = normalizeParticipantKey(jid)
  return `${groupId}:${key || 'unknown'}`
}

function participantNumber(jid) {
  const value = asString(jid)
  if (!/@s\.whatsapp\.net$/i.test(value)) return ''
  const number = normalizeNumber(value)
  return /^\d{7,15}$/.test(number) ? number : ''
}

function looksLikePhoneName(value) {
  const text = asString(value)
  if (!text) return true
  const number = normalizeNumber(text)
  return number && text.replace(/[+\s().-]/g, '') === number
}

function participantName(participant, fallbackJid) {
  if (participant && typeof participant === 'object') {
    const candidates = [
      participant.pushName,
      participant.name,
      participant.notify,
      participant.profileName,
      participant.contactName,
      participant.shortName,
      participant.verifiedName,
      participant.displayName,
      participant.subject,
    ]

    for (const candidate of candidates) {
      const value = asString(candidate)
      if (value && !looksLikePhoneName(value)) return value
    }
  }

  return ''
}

function validParticipantJid(value) {
  const jid = asString(value)
  return /^(?:\d{5,20}@s\.whatsapp\.net|[\w.-]{2,80}@lid)$/i.test(jid)
}

function normalizePhoneJid(value) {
  const jid = asString(value)
  if (!jid) return ''
  if (/^\d{5,20}@s\.whatsapp\.net$/i.test(jid)) return jid
  if (/^\d{5,20}$/.test(jid)) return `${jid}@s.whatsapp.net`
  return ''
}

function normalizeEventParticipant(participant) {
  if (typeof participant === 'string') {
    const direct = normalizePhoneJid(participant)
    if (direct) return { jid: direct, lid: '' }
    const value = asString(participant)
    return validParticipantJid(value) ? { jid: value, lid: value.endsWith('@lid') ? value : '' } : { jid: '', lid: '' }
  }

  if (!participant || typeof participant !== 'object') return { jid: '', lid: '' }

  const phoneCandidates = [
    participant.phoneNumber,
    participant.pn,
    participant.phone,
  ]

  for (const candidate of phoneCandidates) {
    const jid = normalizePhoneJid(candidate)
    if (jid) {
      return {
        jid,
        lid: participantLid(participant) || (asString(participant.id).endsWith('@lid') ? asString(participant.id) : ''),
      }
    }
  }

  const directCandidates = [participant.jid, participant.id]
  for (const candidate of directCandidates) {
    const value = asString(candidate)
    if (!value) continue
    const jid = normalizePhoneJid(value)
    if (jid) return { jid, lid: participantLid(participant) }
  }

  for (const candidate of directCandidates) {
    const value = asString(candidate)
    if (validParticipantJid(value)) {
      return { jid: value, lid: value.endsWith('@lid') ? value : participantLid(participant) }
    }
  }

  return { jid: '', lid: participantLid(participant) }
}

export function extractParticipantJid(participant) {
  return normalizeEventParticipant(participant).jid || normalizeEventParticipant(participant).lid
}

function participantLid(participant) {
  if (typeof participant === 'string') {
    return participant.endsWith('@lid') ? participant.trim() : ''
  }
  if (!participant || typeof participant !== 'object') return ''
  const candidates = [participant.lid, participant.id, participant.jid]
  for (const candidate of candidates) {
    const value = asString(candidate)
    if (value.endsWith('@lid')) return value
  }
  return ''
}

function participantAliases(participant, canonicalJid = '') {
  const aliases = new Set()
  const add = (value) => {
    const normalized = normalizeParticipantKey(value)
    if (normalized) aliases.add(normalized)
  }

  if (typeof participant === 'string') {
    add(participant)
  } else if (participant && typeof participant === 'object') {
    add(participant.id)
    add(participant.jid)
    add(participant.lid)
    add(participant.phoneNumber)
    add(participant.pn)
    add(participant.phone)
  }

  add(canonicalJid)
  return [...aliases]
}

function sameJid(a, b) {
  const left = normalizeParticipantKey(a)
  const right = normalizeParticipantKey(b)
  return Boolean(left && right && left === right)
}

async function resolveParticipantJid(participant, conn) {
  const resolved = normalizeEventParticipant(participant)
  if (resolved.jid && resolved.jid.endsWith('@s.whatsapp.net')) return resolved.jid

  const lid = resolved.lid || (resolved.jid.endsWith('@lid') ? resolved.jid : '')
  if (!lid) return ''

  try {
    const phone = await resolvePhoneNumber(lid, conn)
    const jid = normalizePhoneJid(phone)
    if (jid) return jid
  } catch {
  }

  return lid
}

async function getGroupData(conn, groupId) {
  const metadata = await conn.groupMetadata(groupId)

  for (const participant of metadata?.participants || []) {
    const rawJid = extractParticipantJid(participant)
    const jid = await resolveParticipantJid(participant, conn) || rawJid
    if (!jid) continue

    const name = participantName(participant, jid)
    const aliases = participantAliases(participant, jid)

    for (const alias of aliases) {
      const key = cacheKey(groupId, alias)
      if (name) memberNameCache.set(key, name)
      memberJidCache.set(key, jid)
    }
  }

  return metadata
}

function contactNameFromConnection(conn, jid) {
  const candidates = [
    conn?.store?.contacts?.[jid],
    conn?.contacts?.[jid],
  ]

  for (const contact of candidates) {
    const name = participantName(contact, jid)
    if (name) return name
  }

  return contactNameCache.get(jid) || ''
}

async function findKnownName(groupId, jid, participant = null, conn = null) {
  const direct = participantName(participant, jid)
  if (direct) return direct

  for (const alias of participantAliases(participant, jid)) {
    const connectionName = contactNameFromConnection(conn, alias)
    if (connectionName) return connectionName
  }

  for (const alias of participantAliases(participant, jid)) {
    const cached = memberNameCache.get(cacheKey(groupId, alias))
    if (cached && !looksLikePhoneName(cached)) return cached

    const resolvedJid = memberJidCache.get(cacheKey(groupId, alias))
    const resolvedCached = resolvedJid
      ? memberNameCache.get(cacheKey(groupId, resolvedJid))
      : ''
    if (resolvedCached && !looksLikePhoneName(resolvedCached)) return resolvedCached
  }

  const resolvedJid = normalizePhoneJid(jid) || jid
  try {
    const user = await getUser(resolvedJid)
    const dbName = asString(user?.pushName)
    if (dbName && !looksLikePhoneName(dbName) && dbName.toLowerCase() !== 'kak') return dbName
  } catch {
  }

  return ''
}

function truncateDisplayName(name, maxLength = 32) {
  const value = asString(name)
  const chars = Array.from(value)
  if (!chars.length || chars.length <= maxLength) return value
  return `${chars.slice(0, Math.max(1, maxLength - 3)).join('').trimEnd()}...`
}

function fallbackDisplayName(name) {
  return truncateDisplayName(name, 32) || 'User'
}

function introText({ name, number, groupName, mentionText }) {
  return [
    '⌬ NANO AI • INTRO MEMBER',
    '┇',
    `┇ Nama  : ${name}`,
    `┇ Nomor : ${number ? `+${number}` : 'Tidak tersedia'}`,
    `┇ Group : ${groupName}`,
    '┇',
    `┇ ${mentionText || name}`,
    '┇',
    '┇ Halo, salam kenal.',
    '┇ Semoga betah dan nyaman bersama.',
    '⌬',
  ].join('\n')
}

function buildCaption({ action, name, number, groupName }) {
  const welcome = action === 'welcome'
  const mentionText = number ? `@${number}` : name
  return [
    welcome ? '╭─〔 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 〕' : '╭─〔 👋 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 〕',
    '│',
    `│ ${welcome ? 'Selamat datang,' : 'Sampai jumpa,'} *${mentionText}*.`,
    '│',
    `│ Nama   : ${name}`,
    `│ Nomor  : ${number ? `+${number}` : 'Tidak tersedia'}`,
    `│ Group  : ${groupName}`,
    '│',
    welcome ? '│ Silakan kenalan dan baca peraturan.' : '│ Terima kasih sudah menjadi bagian dari group.',
    welcome ? '│ Semoga betah dan nyaman bersama.' : '│ Semoga sukses selalu di mana pun berada.',
    '│',
    '╰──────────────',
  ].join('\n')
}

/*
  Kalau group punya teks kustom sendiri (.setwelcome / .setleft), pakai teks itu.
  Kalau kosong/gagal dirender, kembali ke kartu bawaan.
*/
function eventCaption({ groupId, action, name, number, groupName, memberCount }) {
  const fallback = () => buildCaption({ action, name, number, groupName })

  let template = ''
  try {
    template = action === 'welcome' ? getWelcomeMessage(groupId) : getLeftMessage(groupId)
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal membaca teks ${action} kustom: ${err.message}`)
  }

  if (!template.trim()) return fallback()

  const rendered = renderMessage(template, {
    name,
    number: number || '-',
    group: groupName,
    mention: number ? `@${number}` : name,
    total: memberCount > 0 ? String(memberCount) : '-',
    bot: settings.botName || 'Bot',
  }).trim()

  if (!rendered) return fallback()

  /* Sambutan custom yang tidak menyebut anggota baru tetap harus menge-tag
     anggotanya — kartu bawaan dan template ber-placeholder {mention} sudah
     menyertakan tag, jadi hanya dilengkapi yang belum ada. */
  if (action === 'welcome' && number && !rendered.includes('@' + number)) {
    return rendered + '\n\n@' + number
  }

  return rendered
}

async function sendMemberEvent(conn, groupId, memberJid, action, groupName, name, usedPrefix, memberCount = 0) {
  const safeJid = asString(memberJid)
  if (!safeJid || (!safeJid.endsWith('@s.whatsapp.net') && !safeJid.endsWith('@lid'))) {
    throw new Error('JID participant tidak valid')
  }

  let number = participantNumber(safeJid)
  if (!number && safeJid.endsWith('@lid')) {
    try {
      const resolved = await resolvePhoneNumber(safeJid, conn)
      if (resolved) number = /^\d{7,15}$/.test(resolved) ? resolved : ''
    } catch {
    }
  }

  const safeName = fallbackDisplayName(name)
  const safeGroupName = asString(groupName) || 'Group'
  const mentionText = number ? `@${number}` : ''
  const intro = introText({
    name: safeName,
    number,
    groupName: safeGroupName,
    mentionText: mentionText || safeName,
  })
  const caption = eventCaption({
    groupId,
    action,
    name: safeName,
    number,
    groupName: safeGroupName,
    memberCount,
  })

  let image = null
  try {
    image = await renderMemberCard({
      conn,
      memberJid: safeJid,
      memberNumber: number,
      groupName: safeGroupName,
      action,
      memberName: safeName,
    })
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Canvas ${action} gagal, lanjut tanpa gambar: ${err.message}`)
  }

  const buttons = action === 'welcome'
    ? [
        { type: 'copy', label: 'SALIN INTRO', id: 'welcome_copy_intro', copyCode: intro },
        { label: 'PERATURAN', command: `${usedPrefix}peraturan` },
      ]
    : [{ type: 'noop', label: 'GOODBYE' }]

  await sendInteractive(
    conn,
    groupId,
    {
      title: '',
      subtitle: safeGroupName,
      body: caption,
      footer: 'Nano Ai  /  Group Assistant',
      image,
      buttons,
      mentions: [safeJid],
    },
    {}
  )
}

export function attachWelcomeHandler(conn) {
  if (!conn?.ev?.on) return conn

  conn.ev.on('contacts.upsert', (contacts = []) => {
    for (const contact of contacts) {
      const jid = asString(contact?.id || contact?.jid)
      const name = participantName(contact, jid)
      if (jid && name) contactNameCache.set(jid, name)
    }
  })

  conn.ev.on('contacts.update', (contacts = []) => {
    for (const contact of contacts) {
      const jid = asString(contact?.id || contact?.jid)
      const name = participantName(contact, jid)
      if (jid && name) contactNameCache.set(jid, name)
    }
  })

  conn.ev.on('group-participants.update', async (update) => {
    try {
      const groupId = asString(update?.id || update?.jid || update?.chatId)
      const action = asString(update?.action).toLowerCase()

      if (!groupId.endsWith('@g.us')) return
      if (!['add', 'remove', 'leave'].includes(action)) return
      if (!isWelcomeEnabled(groupId)) return

      const rawParticipants = Array.isArray(update?.participants) ? update.participants : []
      if (!rawParticipants.length) return

      let metadata = null
      try {
        metadata = await getGroupData(conn, groupId)
      } catch (err) {
        console.log(`  \x1b[33m⚠\x1b[0m  Metadata group tidak tersedia untuk ${groupId}: ${err.message}`)
      }

      const groupName = asString(metadata?.subject) || 'Group'
      let usedPrefix = settings.defaultPrefix
      try {
        usedPrefix = await getActivePrefix(groupId)
      } catch {
      }

      for (const rawParticipant of rawParticipants) {
        const originalJid = extractParticipantJid(rawParticipant)
        if (!originalJid) {
          console.log('  \x1b[33m⚠\x1b[0m  Event participant diabaikan: JID tidak ditemukan')
          continue
        }

        const memberJid = await resolveParticipantJid(rawParticipant, conn) || originalJid
        if (!memberJid || sameJid(memberJid, conn.user?.id)) continue

        const participant = (metadata?.participants || []).find((p) => {
          const aliases = participantAliases(p)
          const targets = participantAliases(rawParticipant, memberJid)
          return aliases.some((alias) => targets.includes(alias))
        })

        const name = await findKnownName(groupId, originalJid, participant || rawParticipant, conn)
        const displayName = fallbackDisplayName(name)

        for (const alias of participantAliases(rawParticipant, memberJid)) {
          const key = cacheKey(groupId, alias)
          if (name) memberNameCache.set(key, name)
          memberJidCache.set(key, memberJid)
        }

        console.log(`  \x1b[36m›\x1b[0m  Group event: ${action} | ${memberJid} | ${displayName}`)

        try {
          await sendMemberEvent(
            conn,
            groupId,
            memberJid,
            action === 'add' ? 'welcome' : 'goodbye',
            groupName,
            displayName,
            usedPrefix,
            (metadata?.participants || []).length
          )
          console.log(`  \x1b[32m✓\x1b[0m  ${action === 'add' ? 'Welcome' : 'Goodbye'} terkirim untuk ${memberJid}`)
        } catch (err) {
          const detail = err instanceof Error ? err.message : JSON.stringify(err)
          console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengirim ${action === 'add' ? 'welcome' : 'goodbye'} ${memberJid}: ${detail}`)
        } finally {
          if (action !== 'add') {
            for (const alias of participantAliases(rawParticipant, memberJid)) {
              const key = cacheKey(groupId, alias)
              memberNameCache.delete(key)
              memberJidCache.delete(key)
            }
          }
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.stack || err.message : JSON.stringify(err)
      console.log(`  \x1b[31m✗\x1b[0m  Welcome handler error: ${detail}`)
    }
  })

  return conn
}

export default { attachWelcomeHandler, extractParticipantJid }
