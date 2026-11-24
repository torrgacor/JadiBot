import fetch from 'node-fetch'

const BATAS_MS = 60_000

const handler = async (m, { conn }) => {
  try {
    // Memberikan reaksi loading
    conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw?.key } }).catch(() => {})

    const url = 'https://api.haidarxd.my.id/api/v1/alight-motion/auto?apikey=haidaranjay'
    const res = await fetch(url, { signal: AbortSignal.timeout(BATAS_MS) })

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`)
    }

    const json = await res.json()
    if (json.status !== 'success' || !json.data) {
      throw new Error('Gagal mendapatkan akun Alight Motion.')
    }

    const { email, inboxUrl, expiresAt } = json.data

    const caption = `*ALIGHT MOTION PREMIUM*
    
📧 *Email:* ${email}
🔗 *Inbox:* ${inboxUrl}
⏳ *Aktif:* ${expiresAt}

_Buka link inbox di atas untuk melihat kode OTP / verifikasi._`

    await m.reply(caption)
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key } }).catch(() => {})
  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw?.key } }).catch(() => {})
    await m.reply(`❌ Gagal mengambil akun Alight Motion.\n\n${e?.message || e}`)
  }
}

handler.command = /^amprem$/i
handler.help = ['amprem']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Dapatkan akun Alight Motion Premium otomatis'
handler.limit = true

export default handler
