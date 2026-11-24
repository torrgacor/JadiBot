/*
⌬ Nano Ai · .addplugins
  Owner-only. Pasang plugin langsung dari chat.

  Cara pakai:
    .addplugins game
    → bot minta file/kode → reply dokumen .js ATAU tempel kode plugin
    → tersimpan di plugins/game/ + hot-reload otomatis

  Kontrol:
    .ya      → konfirmasi timpa file yang sudah ada
    .batal   → batalkan sesi
    .cancelplugin → batalkan sesi yang mungkin masih menggantung
*/

import { startSession, cancelSession } from '../../core/plugin-install.js'

async function handler(m, context) {
  if (/^cancelplugin$/i.test(m.command || '')) {
    return cancelSession(m.chat, m.sender, context?.rawConn)
  }
  return startSession(m, context?.rawConn)
}

handler.command = /^(addplugins?|cancelplugin)$/i
handler.help = ['addplugins <menu>', 'cancelplugin']
handler.tags = ['owner']
handler.category = 'owner'
handler.description = 'Pasang plugin langsung dari chat: reply file .js atau tempel kode ke folder menu tujuan'
handler.ownerOnly = true

export default handler
