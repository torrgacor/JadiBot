/*
⌬ Nano Ai · Reminder Command
  .reminder <durasi> <pesan>   → buat pengingat
  .reminder                    → daftar pengingat aktif
  .reminder hapus <id>         → hapus pengingat

  Durasi: 30s, 10m, 2h, 1d (gabungan boleh: 1h30m)
  Data di SQLite — tahan restart. Pengingat yang lewat saat bot mati
  tetap dikirim begitu bot online.
*/

import { tambahPengingat, daftarPengingat, hapusPengingat, formatSisa } from '../../lib/pengingat.js'
import { sendBotMessage } from '../../lib/mode-pesan.js'

const SATUAN = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }

/* "1h30m" → 5_400_000 ms ; hasil null = format salah */
function parseDurasi(text = '') {
  const clean = text.toLowerCase().replace(/\s+/g, '')
  if (!clean || !/^\d+(s|m|h|d)(\d+(s|m|h|d))*$/.test(clean)) return null
  let total = 0
  for (const match of clean.matchAll(/(\d+)(s|m|h|d)/g)) {
    total += Number(match[1]) * SATUAN[match[2]]
  }
  return total > 0 ? total : null
}

async function handler(m, { rawConn }) {
  const kirim = async (teks) => sendBotMessage(rawConn, m.chat, { text: teks }, m.raw)
  const argumen = (m.text || '').trim()

  /* tanpa argumen → daftar */
  if (!argumen) {
    const list = daftarPengingat(m.sender)
    if (!list.length) return kirim('📭 Tidak ada pengingat aktif.\nBuat: .reminder 10m beli kopi')
    const baris = ['⏳ PENGINGAT AKTIF', '']
    for (const item of list) {
      baris.push(`#${item.id} — ${item.pesan}`)
      baris.push(`   ⏱ ${formatSisa(item.trigger_at - Date.now())} lagi`)
    }
    baris.push('', 'Hapus: .reminder hapus <id>')
    return kirim(baris.join('\n'))
  }

  /* hapus */
  const hapusMatch = argumen.match(/^hapus\s+(\d+)$/i)
  if (hapusMatch) {
    const r = hapusPengingat(m.sender, Number(hapusMatch[1]))
    return kirim(r.ok ? `🗑 Pengingat #${hapusMatch[1]} dihapus.` : `Pengingat #${hapusMatch[1]} tidak ditemukan.`)
  }

  /* buat: <durasi> <pesan> */
  const match = argumen.match(/^(\S+)\s+([\s\S]+)$/)
  const durasiMs = match ? parseDurasi(match[1]) : parseDurasi(argumen)
  if (!durasiMs) {
    return kirim('❌ Format salah.\nContoh: .reminder 10m beli kopi\nDurasi: 30s · 10m · 2h · 1d (boleh gabung: 1h30m)')
  }
  const pesan = match ? match[2].trim() : ''
  if (!pesan) return kirim('❌ Pesan pengingatnya belum ada.\nContoh: .reminder 10m beli kopi')
  if (pesan.length > 300) pesan = pesan.slice(0, 300)

  const r = tambahPengingat({
    jid: m.sender,
    chat: m.chat,
    pesan,
    triggerAt: Date.now() + durasiMs,
  })
  if (!r.ok) return kirim(`Gagal menyimpan pengingat: ${r.error}`)

  return kirim(`⏰ Pengingat dibuat!\n📝 ${pesan}\n⏱ ${formatSisa(durasiMs)} lagi\n💾 Tersimpan — tahan restart.`)
}

handler.command = /^(reminder|remind|ingatkan)$/i
handler.help = ['reminder <durasi> <pesan>', 'reminder', 'reminder hapus <id>']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Pengingat jadwal — tahan restart, pengingat yang lewat saat bot mati tetap dikirim. Contoh: .reminder 10m beli kopi'
handler.limit = false

export default handler
