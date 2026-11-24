/*
⌬ Nano Ai · Message Mode per-user
  .modeios      → balasan bot ke kamu TANPA quoted (cocok untuk iPhone)
  .modeandroid  → balasan bot ke kamu PAKAI quoted (default)
  .mode         → lihat mode kamu saat ini

  Mode tersimpan per JID user di SQLite (tabel user_settings) — persistent,
  tidak bocor ke user lain, dan berlaku di private chat maupun grup mana pun.
*/

import { setUserMode, getUserMode, modeStats } from '../../lib/mode-pesan.js'
import { sendBotMessage } from '../../lib/mode-pesan.js'

async function handler(m, { conn, rawConn }) {
  const kirim = async (teks) => {
    /* kirim sesuai mode user yang BARU disimpan:
       ios → polos, android → quoted (pakai rawConn + helper sendBotMessage) */
    await sendBotMessage(rawConn, m.chat, { text: teks }, m.raw)
  }

  if (m.command === 'modeios') {
    const r = setUserMode(m.sender, 'ios')
    if (!r.ok) return kirim(`Gagal menyimpan mode: ${r.error}`)
    return kirim('✅ Mode berhasil diubah ke iOS.\n📱 Response bot sekarang tanpa quoted.')
  }

  if (m.command === 'modeandroid') {
    const r = setUserMode(m.sender, 'android')
    if (!r.ok) return kirim(`Gagal menyimpan mode: ${r.error}`)
    return kirim('✅ Mode berhasil diubah ke Android.\n📱 Response bot sekarang dengan quoted.')
  }

  /* .mode — lihat mode saat ini */
  const mode = getUserMode(m.sender)
  const isIos = mode === 'ios'
  return kirim(
    [
      '📱 Message Mode',
      `Mode kamu: ${isIos ? 'iOS' : 'Android'}`,
      `Quoted: ${isIos ? 'OFF' : 'ON'}`,
      'Gunakan:',
      '.modeios',
      '.modeandroid',
    ].join('\n'),
  )
}

handler.command = /^(modeios|modeandroid|mode)$/i
handler.help = ['modeios', 'modeandroid', 'mode']
handler.tags = ['main']
handler.category = 'main'
handler.description = 'Atur gaya balasan bot per-user: iOS = tanpa quoted (teks polos), Android = dengan quoted. Tersimpan permanen per user, berlaku di semua chat.'
handler.limit = false

export default handler
