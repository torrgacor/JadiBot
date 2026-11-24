/*
⌬ Nano Ai · AFK Command (tanpa .unafk)
  .afk            → status AFK tanpa alasan
  .afk <alasan>   → status AFK dengan alasan (maks 200 karakter)

  Keluar dari AFK: cukup kirim pesan APA PUN di grup yang ada bot-nya —
  status otomatis dinonaktifkan + bot kirim "Welcome Back".
  Data tersimpan di SQLite (data/database/nano.sqlite), tabel `afk`.
  Aman terhadap restart/crash — tidak memakai Map sebagai penyimpanan utama.
*/

import { setAFK, getAFK, MAX_REASON } from '../../lib/afk.js'
import { sendBotMessage } from '../../lib/mode-pesan.js'

async function handler(m, { conn, rawConn }) {
  /* kirim sesuai mode user (ios → polos, android → quoted) */
  const kirim = async (teks) => {
    await sendBotMessage(rawConn, m.chat, { text: teks }, m.raw)
  }

  const existing = getAFK(m.sender)
  if (existing?.isAfk) {
    /* sudah AFK: update alasan/waktu (upsert — tidak membuat record baru) */
    const reason = (m.text || '').trim()
    setAFK(m.sender, reason)
    const alasan = reason ? `\n📝 Alasan: ${reason}` : ''
    await kirim(`💤 Kamu sudah AFK. Alasan diperbarui.${alasan}`)
    return
  }

  const reason = (m.text || '').trim().slice(0, MAX_REASON)
  const result = setAFK(m.sender, reason)
  if (!result.ok) {
    await kirim(`Gagal menyimpan status AFK: ${result.error}`)
    return
  }

  const alasan = reason ? `\n📝 Alasan: ${reason}` : ''
  await kirim(`💤 Kamu sekarang AFK.${alasan}`)
}

handler.command = /^afk$/i
handler.help = ['afk <alasan>']
handler.tags = ['main']
handler.category = 'main'
handler.description = 'Set status AFK (Away From Keyboard) — tersimpan di database, tahan restart. Keluar dari AFK cukup kirim pesan apa pun di grup (auto-unAFK, tanpa command). Orang yang menyebut/membalas kamu akan diberi tahu otomatis (cooldown 1x/menit).'
handler.limit = false

export default handler
