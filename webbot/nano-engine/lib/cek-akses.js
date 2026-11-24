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

import { settings } from '../config/settings.js'
import { getDynamicOwners } from '../core/database-owner.js'
import { getDb } from '../core/sqlite.js'

const MIN_PHONE_LENGTH = 7
const MAX_PHONE_LENGTH = 15

export function normalizeNumber(jidOrNumber = '') {
  const withoutDomain = String(jidOrNumber).split('@')[0]
  const withoutDevice = withoutDomain.split(':')[0]
  return withoutDevice.replace(/\D/g, '')
}

/*
  JID bisa berbentuk beberapa "server":
    - 62812xxx@s.whatsapp.net  → nomor telepon asli
    - 62812xxx@hosted          → nomor telepon (akun hosted)
    - 125061478490282@lid      → LID, BUKAN nomor telepon
    - 125061478490282@hosted.lid → LID versi hosted, juga BUKAN nomor telepon
  Sebelumnya hanya "@lid" yang dikenali, sehingga LID `@hosted.lid` dianggap
  nomor telepon asli: pemilik tidak terdeteksi dan nomor LID tampil di log.
*/
function jidServer(jid = '') {
  const value = String(jid || '').trim().toLowerCase()
  const at = value.lastIndexOf('@')
  return at === -1 ? '' : value.slice(at + 1)
}

export function isLidJid(jid = '') {
  const server = jidServer(jid)
  return server === 'lid' || server === 'hosted.lid'
}

function isValidPhoneNumber(number = '') {
  const value = String(number || '')
  return value.length >= MIN_PHONE_LENGTH && value.length <= MAX_PHONE_LENGTH ? value : ''
}

/*
  Pesan masuk membawa pasangan LID ↔ nomor asli langsung dari server WhatsApp
  (key.participantAlt / key.remoteJidAlt). Pasangan itu kita simpan di sini
  supaya seluruh bagian bot (owner, admin grup, antilink, welcome) bisa
  memakai nomor aslinya — termasuk sebelum Baileys selesai menyimpan mapping.
*/
const lidToPhone = new Map()

/* Peta LID ↔ nomor asli DIPERSISTENKAN di SQLite — supaya deteksi nomor
   real (62xxx) tetap jalan setelah bot restart/crash, tidak hilang seperti
   kalau cuma disimpan di memori. */
let lidStoreReady = false

function ensureLidStore() {
  if (lidStoreReady) return
  try {
    const db = getDb()
    db.exec(`
      CREATE TABLE IF NOT EXISTS lid_map (
        lid TEXT PRIMARY KEY,
        phone TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `)
    /* muat semua pasangan yang sudah pernah dipelajari */
    for (const row of db.prepare('SELECT lid, phone FROM lid_map').all()) {
      if (!lidToPhone.has(row.lid)) lidToPhone.set(row.lid, row.phone)
    }
    lidStoreReady = true
  } catch {
    /* db belum siap — peta memori tetap dipakai */
  }
}

/* cari nomor asli dari nomor LID (dipakai mode-pesan & fitur lain) */
export function lookupLidPhone(lidNumber = '') {
  const key = normalizeNumber(lidNumber)
  if (!key) return ''
  ensureLidStore()
  return lidToPhone.get(key) || ''
}

export function registerLidPhonePair(first, second) {
  const lidNumber = isLidJid(first) ? normalizeNumber(first) : isLidJid(second) ? normalizeNumber(second) : ''
  const phone = !isLidJid(first) && isValidPhoneNumber(normalizeNumber(first))
    ? normalizeNumber(first)
    : !isLidJid(second) && isValidPhoneNumber(normalizeNumber(second))
      ? normalizeNumber(second)
      : ''

  if (!lidNumber || !phone || lidNumber === phone) return false

  lidToPhone.set(lidNumber, phone)

  /* simpan permanen */
  try {
    ensureLidStore()
    getDb().prepare(`
      INSERT INTO lid_map (lid, phone, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(lid) DO UPDATE SET phone = excluded.phone, updated_at = excluded.updated_at
    `).run(lidNumber, phone, Date.now())
  } catch { /* gagal simpan tidak fatal — memori tetap terisi */ }

  return true
}

/*
  Ubah JID apa pun menjadi nomor telepon asli.

  options.alt      : JID alternatif dari envelope pesan (participantAlt/remoteJidAlt)
  options.groupId  : dipakai untuk menelusuri metadata grup bila mapping belum ada
*/
export async function resolvePhoneNumber(senderJid, conn, options = {}) {
  const value = String(senderJid || '').trim()
  if (!value) return ''

  if (!isLidJid(value)) {
    return isValidPhoneNumber(normalizeNumber(value))
  }

  const lidNumber = normalizeNumber(value)
  if (!lidNumber) return ''

  // 1) Paling akurat: nomor asli yang dikirim server di pesan yang sedang diproses.
  const alt = String(options?.alt || '').trim()
  if (alt && !isLidJid(alt)) {
    const altNumber = isValidPhoneNumber(normalizeNumber(alt))
    if (altNumber) {
      registerLidPhonePair(value, alt)
      return altNumber
    }
  }

  // 2) Pasangan yang sudah pernah dipelajari (memori + database permanen).
  const known = lookupLidPhone(lidNumber)
  if (known) return known

  // 3) Mapping resmi dari Baileys (butuh tersimpan di sesi).
  try {
    const resolvedPn = await conn?.signalRepository?.lidMapping?.getPNForLID?.(value)
    if (resolvedPn && !isLidJid(resolvedPn)) {
      const number = isValidPhoneNumber(normalizeNumber(resolvedPn))
      if (number) {
        registerLidPhonePair(value, resolvedPn)
        return number
      }
    }
  } catch {

  }

  return ''
}

function participantCandidates(participant) {
  if (!participant || typeof participant !== 'object') return []
  return [
    participant.id,
    participant.jid,
    participant.pn,
    participant.phoneNumber,
    participant.phone,
    participant.lid,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
}

function participantPhoneNumber(participant) {
  const candidates = participantCandidates(participant)
  const preferred = candidates.filter((value) => !isLidJid(value))
  for (const candidate of preferred) {
    const number = isValidPhoneNumber(normalizeNumber(candidate))
    if (number) return number
  }
  return ''
}

function sameJidUser(left, right) {
  const a = normalizeNumber(left)
  const b = normalizeNumber(right)
  return Boolean(a && b && a === b)
}

export async function resolveTargetPhoneNumber(jid, conn, groupId = '', options = {}) {
  const value = String(jid || '').trim()
  if (!value) return ''

  if (!isLidJid(value)) {
    return isValidPhoneNumber(normalizeNumber(value))
  }

  const mapped = await resolvePhoneNumber(value, conn, { alt: options.alt })
  if (mapped) return mapped

  if (!groupId?.endsWith('@g.us') || typeof conn?.groupMetadata !== 'function') return ''

  try {
    const metadata = await conn.groupMetadata(groupId)
    const participants = Array.isArray(metadata?.participants) ? metadata.participants : []

    for (const participant of participants) {
      const candidates = participantCandidates(participant)
      if (!candidates.some((candidate) => sameJidUser(candidate, value))) continue

      const number = participantPhoneNumber(participant)
      if (number) {
        registerLidPhonePair(value, number)
        return number
      }
    }
  } catch {

  }

  return ''
}

export function getAllOwnerEntries() {
  const primary = Array.isArray(settings.ownerNumbers) ? settings.ownerNumbers : []
  const dynamic = getDynamicOwners()
  const entries = new Map()

  for (const owner of primary) {
    const number = normalizeNumber(owner)
    if (number) entries.set(number, { number, name: String(settings.ownerName || 'Owner').trim() || 'Owner', primary: true })
  }

  for (const owner of dynamic) {
    const number = normalizeNumber(owner.number)
    if (!number) continue
    entries.set(number, {
      number,
      name: String(owner.name || 'Owner').trim() || 'Owner',
      primary: false,
    })
  }

  return [...entries.values()]
}

export function getAllOwnerNumbers() {
  return getAllOwnerEntries().map((owner) => owner.number)
}

export async function isOwner(senderJid, conn, options = {}) {
  const senderNumber = await resolvePhoneNumber(senderJid, conn, options)
  const owners = getAllOwnerNumbers()

  const selfNumbers = [
    normalizeNumber(conn?.user?.id || ''),
    normalizeNumber(conn?.user?.lid || ''),
  ].filter(Boolean)

  if (senderNumber && selfNumbers.includes(senderNumber)) return true
  if (owners.includes(senderNumber)) return true

  // Pengirim masih berupa LID: coba kenali lewat LID pemilik yang sudah dikenal,
  // atau lewat nomor aslinya di metadata grup sebelum menolak.
  if (!senderNumber && isLidJid(senderJid)) {
    const lidNumber = normalizeNumber(senderJid)
    if (lidNumber && selfNumbers.includes(lidNumber)) return true

    const number = await resolveTargetPhoneNumber(senderJid, conn, options.groupId || '', options)
    if (number) return owners.includes(number) || selfNumbers.includes(number)
  }

  return false
}

export default {
  isOwner,
  resolvePhoneNumber,
  resolveTargetPhoneNumber,
  normalizeNumber,
  getAllOwnerNumbers,
  getAllOwnerEntries,
  isLidJid,
  registerLidPhonePair,
}
