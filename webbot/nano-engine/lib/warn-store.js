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

/**
 * Satu penyimpanan peringatan untuk semua pelanggaran — manual (.warn) dan
 * otomatis (anti-link) — supaya semuanya menumpuk di satu gate 3-peringatan
 * dan terlihat bersama di .warns.
 *
 * Disimpan sebagai JSON (bukan SQLite) karena berada di lapisan lib: bisa
 * diedit tanpa restart session. Ditulis lewat file sementara + rename supaya
 * dua session yang berbagi folder data tidak pernah meninggalkan file
 * setengah jadi.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATA_DIR = process.env.NANO_DATA_DIR
  ? path.resolve(process.env.NANO_DATA_DIR)
  : path.join(__dirname, '..', 'data')
const STORE = path.join(DATA_DIR, 'group-warnings.json')

export const MAX_WARN = 3

/** Penanda sumber pelanggaran untuk entri otomatis (dipakai anti-link). */
export const ANTILINK_SOURCE = 'antilink'

const MAX_ENTRIES = 10

function loadStore() {
  try {
    if (!fs.existsSync(STORE)) return {}
    const parsed = JSON.parse(fs.readFileSync(STORE, 'utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveStore(store) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const temp = STORE + '.' + process.pid + '.tmp'
    fs.writeFileSync(temp, JSON.stringify(store, null, 2))
    fs.renameSync(temp, STORE)
    return true
  } catch {
    return false
  }
}

function groupOf(store, groupId) {
  const group = store[groupId]
  return group && typeof group === 'object' && !Array.isArray(group) ? group : null
}

function recordOf(group, jid) {
  const record = group?.[jid]
  return record && typeof record === 'object' ? record : null
}

function normalizeRecord(record) {
  return {
    count: Math.max(0, Number(record?.count) || 0),
    entries: Array.isArray(record?.entries) ? record.entries : [],
  }
}

/** Rekaman satu member: { count, entries } atau null bila tidak ada. */
export function getMember(groupId, jid) {
  const record = recordOf(groupOf(loadStore(), groupId), jid)
  if (!record) return null
  const normalized = normalizeRecord(record)
  return normalized.count ? normalized : null
}

/** Semua member yang sedang kena peringatan di satu group: { jid: record }. */
export function listMembers(groupId) {
  const group = groupOf(loadStore(), groupId)
  if (!group) return {}

  const out = {}
  for (const [jid, record] of Object.entries(group)) {
    const normalized = normalizeRecord(record)
    if (normalized.count > 0) out[jid] = normalized
  }
  return out
}

/**
 * Tambah satu peringatan. Mengembalikan { ok, count, entries, reached } —
 * ok:false berarti peringatan tercatat di memori tapi gagal ditulis ke disk.
 */
export function addWarn(groupId, jid, { by = '', reason = '' } = {}) {
  const store = loadStore()
  let group = groupOf(store, groupId)
  if (!group) group = store[groupId] = {}

  const record = normalizeRecord(recordOf(group, jid))
  record.count += 1
  record.entries.push({ by: String(by || ''), at: Date.now(), reason: String(reason || '') })
  if (record.entries.length > MAX_ENTRIES) record.entries = record.entries.slice(-MAX_ENTRIES)
  group[jid] = record

  return {
    ok: saveStore(store),
    count: record.count,
    entries: record.entries,
    reached: record.count >= MAX_WARN,
  }
}

/** Kurangi satu peringatan (.unwarn). null bila member memang bersih. */
export function reduceWarn(groupId, jid) {
  const store = loadStore()
  const group = groupOf(store, groupId)
  const record = recordOf(group, jid)
  if (!record) return null

  const { count, entries } = normalizeRecord(record)
  if (!count) return null

  const next = { count: Math.max(0, count - 1), entries: [...entries] }
  next.entries.pop()
  if (next.count === 0) delete group[jid]
  else group[jid] = next

  return { ok: saveStore(store), count: next.count, entries: next.entries }
}

/** Hapus seluruh catatan peringatan satu member (dipakai setelah auto-kick). */
export function clearMember(groupId, jid) {
  const store = loadStore()
  const group = groupOf(store, groupId)
  if (!group || !Object.prototype.hasOwnProperty.call(group, jid)) return false
  delete group[jid]
  return saveStore(store)
}

/**
 * Hapus semua entri dari sumber tertentu (mis. saat anti-link dimatikan) dan
 * turunkan hitungannya. Mengembalikan jumlah entri yang dibuang.
 */
export function clearSource(groupId, source) {
  const store = loadStore()
  const group = groupOf(store, groupId)
  if (!group) return 0

  let removed = 0
  for (const [jid, raw] of Object.entries(group)) {
    const { count, entries } = normalizeRecord(raw)
    const kept = entries.filter((entry) => entry?.by !== source)
    const drop = entries.length - kept.length
    if (!drop) continue

    removed += drop
    const nextCount = Math.max(0, count - drop)
    if (nextCount === 0) delete group[jid]
    else group[jid] = { count: nextCount, entries: kept }
  }

  if (removed) saveStore(store)
  return removed
}

/** Jumlah entri dari sumber tertentu untuk satu member. */
export function countSource(groupId, jid, source) {
  const record = getMember(groupId, jid)
  if (!record) return 0
  return record.entries.filter((entry) => entry?.by === source).length
}

export default {
  MAX_WARN,
  ANTILINK_SOURCE,
  getMember,
  listMembers,
  addWarn,
  reduceWarn,
  clearMember,
  clearSource,
  countSource,
}
