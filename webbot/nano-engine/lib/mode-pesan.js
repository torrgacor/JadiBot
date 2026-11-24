/*
⌬ Nano Ai · Message Mode per-user
  Setiap user punya mode sendiri, tersimpan di SQLite (tabel user_settings,
  jid UNIQUE):
    - android (default) → balasan bot PAKAI quoted
    - ios               → balasan bot TANPA quoted
  Mode ikut siapa pun yang menjalankan command (senderJid), bukan nomor bot
  dan bukan grup. Default user baru = android, jadi perilaku lama tetap sama.
*/

import { getDb } from '../core/sqlite.js'
import { lookupLidPhone } from './cek-akses.js'
import { denganPromo } from '../core/identitas.js'

let schemaReady = false

function ensureSchema() {
  if (schemaReady) return
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jid TEXT NOT NULL UNIQUE,
      message_mode TEXT NOT NULL DEFAULT 'android'
        CHECK (message_mode IN ('android', 'ios')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_user_settings_mode ON user_settings (message_mode);
  `)

  /* migrasi satu kali: record lama bisa punya akhiran perangkat (628xx:62@...)
     — samakan ke bentuk normalisasi supaya lookup konsisten */
  try {
    const rows = getDb().prepare('SELECT id, jid FROM user_settings WHERE jid LIKE \'%:%@%\'').all()
    const update = getDb().prepare('UPDATE user_settings SET jid = ? WHERE id = ?')
    for (const r of rows) {
      const [kiri, server] = String(r.jid).split('@')
      const nomor = kiri.split(':')[0]
      update.run(`${nomor}@${server}`, r.id)
    }
  } catch { /* tabel baru — tidak ada yang dimigrasi */ }

  schemaReady = true
}

/* cache baca kecil — sumber kebenaran tetap database */
const cache = new Map()

/* Normalisasi JID user:
   - buang akhiran perangkat (":62", ":16") — 628xx:62@... === 628xx@...
   - LID coba dipetakan ke nomor asli via registerLidPhonePair
   Hasilnya satu kunci konsisten per user di semua chat (PC/grup). */
export function normalizeUserJid(jid = '') {
  let value = String(jid || '').trim()
  if (!value.includes('@')) return ''
  const [kiri, server] = value.split('@')
  const nomor = kiri.split(':')[0]
  if (server === 'lid' || server === 'hosted.lid') {
    const asli = lookupLidPhone(nomor)
    if (asli) return `${asli}@s.whatsapp.net`
  }
  return `${nomor}@s.whatsapp.net`
}

function isValidJid(jid = '') {
  return String(jid).includes('@')
}

/* ── API mode ──────────────────────────────────────────────────────────── */

export function getUserMode(jid) {
  const key = normalizeUserJid(jid)
  if (!key) return 'android'
  if (cache.has(key)) return cache.get(key)
  try {
    ensureSchema()
    const row = getDb()
      .prepare('SELECT message_mode FROM user_settings WHERE jid = ?')
      .get(key)
    const mode = row?.message_mode === 'ios' ? 'ios' : 'android'
    cache.set(key, mode)
    return mode
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  getUserMode gagal: ${error.message}`)
    return 'android' // gagal db → perilaku lama (quoted)
  }
}

export function setUserMode(jid, mode) {
  const key = normalizeUserJid(jid)
  if (!key) return { ok: false, error: 'invalid_jid' }
  const value = mode === 'ios' ? 'ios' : 'android'
  try {
    ensureSchema()
    const now = Date.now()
    getDb().prepare(`
      INSERT INTO user_settings (jid, message_mode, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(jid) DO UPDATE SET
        message_mode = excluded.message_mode,
        updated_at = excluded.updated_at
    `).run(key, value, now, now)
    cache.set(key, value)
    return { ok: true, mode: value }
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  setUserMode gagal: ${error.message}`)
    return { ok: false, error: error.message }
  }
}

/* dipakai plugin: true = ios (tanpa quoted) */
export function isIosMode(jid) {
  return getUserMode(jid) === 'ios'
}

/* ── helper global ─────────────────────────────────────────────────────── */

/*
  sendBotMessage(conn, jidTujuan, content, sourceMessage)

  Mode ditentukan oleh JID USER yang tercantum di sourceMessage (pesan
  yang sedang dibalas), bukan oleh grup/nomor bot:

    senderJid → mode ios     → kirim TANPA quoted
    senderJid → mode android → kirim DENGAN quoted: sourceMessage

  Bisa dipakai dari plugin mana pun:
    import { sendBotMessage } from '../../lib/mode-pesan.js'
*/
export async function sendBotMessage(conn, jid, content, sourceMessage = null) {
  const senderJid =
    sourceMessage?.sender ||
    sourceMessage?.key?.participant ||
    sourceMessage?.key?.remoteJid ||
    ''

  /* Balasan sistem (mis. .mode, .afk, .reminder) lewat koneksi mentah —
     tidak disentuh lib/reply-style.js — jadi link promosi ditempel di sini. */
  const isi = content && typeof content === 'object'
    ? {
        ...content,
        ...(typeof content.text === 'string' ? { text: denganPromo(content.text) } : {}),
        ...(typeof content.caption === 'string' ? { caption: denganPromo(content.caption) } : {}),
      }
    : content

  if (getUserMode(senderJid) === 'ios') {
    return conn.sendMessage(jid, isi)
  }
  return conn.sendMessage(jid, isi, { quoted: sourceMessage?.raw || sourceMessage })
}

/* diag */
export function modeStats() {
  try {
    ensureSchema()
    const row = getDb().prepare(
      'SELECT message_mode, COUNT(*) AS n FROM user_settings GROUP BY message_mode'
    ).all()
    const out = { ios: 0, android: 0, cache: cache.size }
    for (const r of row) out[r.message_mode] = r.n
    return out
  } catch (error) {
    return { error: error.message }
  }
}
