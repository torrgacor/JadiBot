/*
⌬ Nano Ai · AFK Service Layer
  Status AFK tersimpan di SQLite (satu DB utama project), bukan memori.
  Memori hanya cache baca dengan pembatalan otomatis saat tulis.
*/

import { getDb } from '../core/sqlite.js'
import { settings } from '../config/settings.js'

let schemaReady = false

function ensureSchema() {
  if (schemaReady) return
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS afk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jid TEXT NOT NULL UNIQUE,
      is_afk INTEGER NOT NULL DEFAULT 0,
      reason TEXT NOT NULL DEFAULT '',
      afk_since INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_afk_active ON afk (is_afk);
  `)

  schemaReady = true
}

/* ── cache baca (optimasi; sumber kebenaran tetap database) ────────────── */
const cache = new Map() // jid -> record | null
let cacheMissCount = 0

/* ── validasi & sanitasi ───────────────────────────────────────────────── */
export const MAX_REASON = 200

export function isValidJid(jid = '') {
  return /^(?:\d{5,25}|[^@\s]{1,80})@(?:s\.whatsapp\.net|g\.us|lid|newsletter)$/.test(String(jid))
}

function sanitizeReason(reason = '') {
  const clean = String(reason)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_REASON)
  return clean
}

function normalizeRecord(row) {
  if (!row) return null
  return {
    jid: row.jid,
    isAfk: Boolean(row.is_afk),
    reason: row.reason || '',
    afkSince: row.afk_since || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/* ── API utama ─────────────────────────────────────────────────────────── */

export function setAFK(jid, reason = '') {
  if (!isValidJid(jid)) return { ok: false, error: 'invalid_jid' }
  try {
    ensureSchema()
    const db = getDb()
    const now = Date.now()
    const clean = sanitizeReason(reason)
    db.prepare(`
      INSERT INTO afk (jid, is_afk, reason, afk_since, created_at, updated_at)
      VALUES (?, 1, ?, ?, ?, ?)
      ON CONFLICT(jid) DO UPDATE SET
        is_afk = 1,
        reason = excluded.reason,
        afk_since = excluded.afk_since,
        updated_at = excluded.updated_at
    `).run(jid, clean, now, now, now)
    cache.delete(jid)
    return { ok: true, record: getAFK(jid) }
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  AFK setAFK gagal: ${error.message}`)
    return { ok: false, error: error.message }
  }
}

export function getAFK(jid) {
  if (!isValidJid(jid)) return null
  if (cache.has(jid)) return cache.get(jid)
  cacheMissCount++
  try {
    ensureSchema()
    const row = getDb().prepare('SELECT * FROM afk WHERE jid = ?').get(jid)
    const record = normalizeRecord(row)
    cache.set(jid, record)
    return record
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  AFK getAFK gagal: ${error.message}`)
    return null
  }
}

export function isAFK(jid) {
  return Boolean(getAFK(jid)?.isAfk)
}

export function updateAFK(jid, data = {}) {
  if (!isValidJid(jid)) return { ok: false, error: 'invalid_jid' }
  try {
    ensureSchema()
    const db = getDb()
    const now = Date.now()
    const sets = ['updated_at = ?']
    const vals = [now]
    if (typeof data.isAfk === 'boolean') { sets.push('is_afk = ?'); vals.push(data.isAfk ? 1 : 0) }
    if (data.reason !== undefined) { sets.push('reason = ?'); vals.push(sanitizeReason(data.reason)) }
    if (data.afkSince !== undefined) { sets.push('afk_since = ?'); vals.push(data.afkSince) }
    vals.push(jid)
    const info = db.prepare(`UPDATE afk SET ${sets.join(', ')} WHERE jid = ?`).run(...vals)
    cache.delete(jid)
    return { ok: info.changes > 0 }
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  AFK updateAFK gagal: ${error.message}`)
    return { ok: false, error: error.message }
  }
}

export function removeAFK(jid) {
  if (!isValidJid(jid)) return { ok: false, error: 'invalid_jid' }
  try {
    ensureSchema()
    const info = getDb().prepare('DELETE FROM afk WHERE jid = ?').run(jid)
    cache.delete(jid)
    return { ok: info.changes > 0 }
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  AFK removeAFK gagal: ${error.message}`)
    return { ok: false, error: error.message }
  }
}

/* nonaktifkan secara ATOMIK: hanya sukses jika record masih AFK.
   Mengembalikan record sebelum deaktivasi (untuk hitung durasi) + apakah
   benar-benar berubah — dipakai untuk mencegah double-response. */
export function deactivateAFK(jid) {
  try {
    ensureSchema()
    const db = getDb()
    const prev = getAFK(jid)
    const now = Date.now()
    const info = db
      .prepare('UPDATE afk SET is_afk = 0, updated_at = ? WHERE jid = ? AND is_afk = 1')
      .run(now, jid)
    cache.delete(jid)
    return { ok: info.changes > 0, changed: info.changes > 0, previous: prev }
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  AFK deactivateAFK gagal: ${error.message}`)
    return { ok: false, changed: false, previous: null, error: error.message }
  }
}

/* ── format waktu & durasi (timezone bot) ──────────────────────────────── */
const TZ = settings.timezone || 'Asia/Jakarta'

function timeFormatter() {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatClock(ts) {
  try {
    return timeFormatter().format(new Date(ts))
  } catch {
    return new Date(ts).toISOString()
  }
}

export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hari = Math.floor(total / 86400)
  const jam = Math.floor((total % 86400) / 3600)
  const menit = Math.floor((total % 3600) / 60)
  const detik = total % 60

  if (hari > 0) return `${hari} hari ${jam} jam ${menit} menit`
  if (jam > 0) return `${jam} jam ${menit} menit`
  if (menit > 0) return `${menit} menit${detik ? ` ${detik} detik` : ''}`
  return `${detik} detik`
}

/* ── catatan pesan yang dikirim OTOMATIS oleh bot ────────────────────────
   Nomor bot = nomor owner → pesan fromMe bisa berarti dua hal: output bot
   (tidak boleh memicu unAFK owner) atau owner mengetik manual (pemicu sah).
   Bedanya: ID pesan. Output bot dicatat di sini saat dikirim; fromMe yang
   ID-nya TIDAK ada di catatan = ketikan manual owner. */
const botSentIds = new Map() // keyId -> timestamp
const BOT_SENT_TTL = 10 * 60_000

export function markBotSent(keyId) {
  const id = String(keyId || '')
  if (!id) return
  botSentIds.set(id, Date.now())
  if (botSentIds.size > 2000) {
    const cutoff = Date.now() - BOT_SENT_TTL
    for (const [k, t] of botSentIds) if (t < cutoff) botSentIds.delete(k)
  }
}

export function isBotSent(keyId) {
  return botSentIds.has(String(keyId || ''))
}

/* ── diag ──────────────────────────────────────────────────────────────── */
export function afkStats() {
  try {
    ensureSchema()
    const row = getDb().prepare(
      'SELECT COUNT(*) AS total, SUM(is_afk) AS aktif FROM afk'
    ).get()
    return { total: row.total || 0, aktif: row.aktif || 0, cacheSize: cache.size, cacheMiss: cacheMissCount }
  } catch (error) {
    return { total: 0, aktif: 0, error: error.message }
  }
}
