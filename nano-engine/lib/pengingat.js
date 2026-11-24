/*
⌬ Nano Ai · Pengingat (Reminder)
  Tersimpan di SQLite (tabel pengingat) — tahan restart/crash.
  Pengecekan tiap detik; pengingat yang lewat saat bot mati tetap dikirim
  begitu bot online ("terlambat X").
  Kirim pakai mode user (iOS polos / Android quoted).
*/

import { getDb } from '../core/sqlite.js'
import { getUserMode } from './mode-pesan.js'

let schemaReady = false

function ensureSchema() {
  if (schemaReady) return
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS pengingat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jid TEXT NOT NULL,
      chat TEXT NOT NULL,
      pesan TEXT NOT NULL,
      trigger_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      sent INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_pengingat_due ON pengingat (sent, trigger_at);
  `)

  schemaReady = true
}

/* ── API ───────────────────────────────────────────────────────────────── */

export function tambahPengingat({ jid, chat, pesan, triggerAt }) {
  try {
    ensureSchema()
    const now = Date.now()
    const info = getDb()
      .prepare('INSERT INTO pengingat (jid, chat, pesan, trigger_at, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(jid, chat, pesan, triggerAt, now)
    return { ok: true, id: info.lastInsertRowid }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export function daftarPengingat(jid) {
  try {
    ensureSchema()
    return getDb()
      .prepare('SELECT id, pesan, trigger_at FROM pengingat WHERE jid = ? AND sent = 0 ORDER BY trigger_at')
      .all(jid)
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  daftarPengingat gagal: ${error.message}`)
    return []
  }
}

export function hapusPengingat(jid, id) {
  try {
    ensureSchema()
    const info = getDb()
      .prepare('DELETE FROM pengingat WHERE id = ? AND jid = ? AND sent = 0')
      .run(id, jid)
    return { ok: info.changes > 0 }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

/* ambil & tandai terkirim secara ATOMIK (anti dobel kirim) */
export function ambilJatuhTempo() {
  try {
    ensureSchema()
    const db = getDb()
    const rows = getDb()
      .prepare('SELECT id, jid, chat, pesan, trigger_at FROM pengingat WHERE sent = 0 AND trigger_at <= ? ORDER BY trigger_at LIMIT 20')
      .all(Date.now())
    const hasil = []
    for (const row of rows) {
      const info = db.prepare('UPDATE pengingat SET sent = 1 WHERE id = ? AND sent = 0').run(row.id)
      if (info.changes > 0) hasil.push(row) // hanya yang benar-benar kita tandai
    }
    return hasil
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m  ambilJatuhTempo gagal: ${error.message}`)
    return []
  }
}

/* ── format durasi sederhana ───────────────────────────────────────────── */
export function formatSisa(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hari = Math.floor(total / 86400)
  const jam = Math.floor((total % 86400) / 3600)
  const menit = Math.floor((total % 3600) / 60)
  const detik = total % 60
  if (hari) return `${hari} hari ${jam} jam`
  if (jam) return `${jam} jam ${menit} menit`
  if (menit) return `${menit} menit ${detik} detik`
  return `${detik} detik`
}

/* ── loop pengecekan (dipanggil sekali dari index.js saat bot online) ──── */
let loopStarted = false

export function mulaiLoopPengingat(conn) {
  if (loopStarted) return
  loopStarted = true

  setInterval(async () => {
    try {
      const due = ambilJatuhTempo()
      if (!due.length) return
      for (const item of due) {
        const terlambat = Date.now() - item.trigger_at
        const teks =
          `⏰ PENGINGAT\n` +
          `📝 ${item.pesan}` +
          (terlambat > 60_000 ? `\n🔜 Terlambat dikirim: ${formatSisa(terlambat)} (bot sedang mati)` : '')
        const hasil = await conn.sendMessage(item.chat, { text: teks })
        /* catat sebagai pesan bot — anti-loop AFK */
        try {
          const { markBotSent } = await import('./afk.js')
          markBotSent(hasil?.key?.id)
        } catch {}
      }
    } catch (error) {
      console.log(`  \x1b[31m✗\x1b[0m  loop pengingat: ${error.message}`)
    }
  }, 1000).unref?.()
}
