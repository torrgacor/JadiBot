/*
⌬ Nano Ai · ALIGHT MOTION BULK

  Generate beberapa akun Alight Motion Premium sekaligus via API Haidar.
    https://api.haidarxd.my.id/api/v1/alight-motion/bulk

  Cara pakai:
    .ambulk        → default 5 akun
    .ambulk 3      → 3 akun
*/

import fetch from 'node-fetch'

const BATAS_MS = 90_000
const MAX_AKUN = 10

const handler = async (m, { conn, usedPrefix = '.' }) => {
  const input = String(m.text ?? '').trim()
  let jumlah = input ? parseInt(input, 10) : 5

  if (isNaN(jumlah) || jumlah < 1) {
    return m.reply(
      'Masukkan jumlah akun yang valid (1–' + MAX_AKUN + ').\n\n' +
      'Contoh:\n' +
      `${usedPrefix}ambulk 5`
    )
  }

  if (jumlah > MAX_AKUN) jumlah = MAX_AKUN

  try {
    conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw?.key } }).catch(() => {})

    const url = `https://api.haidarxd.my.id/api/v1/alight-motion/bulk?jumlah=${jumlah}&apikey=haidaranjay`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': 'haidaranjay',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jumlah: String(jumlah) }),
      signal: AbortSignal.timeout(BATAS_MS),
    })

    if (!res.ok) throw new Error(`API Error: ${res.status}`)

    const json = await res.json()
    if (json.status !== 'success' || !Array.isArray(json.data) || !json.data.length) {
      throw new Error('Gagal mendapatkan akun Alight Motion.')
    }

    const list = json.data
      .map((acc, i) =>
        `*${i + 1}.* 📧 ${acc.email}\n` +
        `   🔗 ${acc.inboxUrl}\n` +
        `   ⏳ ${acc.expiresAt}`
      )
      .join('\n\n')

    const caption =
      `*ALIGHT MOTION PREMIUM BULK*\n` +
      `Jumlah: ${json.data.length} akun\n\n` +
      `${list}\n\n` +
      `_Buka link inbox untuk melihat kode OTP / verifikasi._`

    await m.reply(caption)
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key } }).catch(() => {})
  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw?.key } }).catch(() => {})
    await m.reply(`❌ Gagal mengambil akun Alight Motion.\n\n${e?.message || e}`)
  }
}

handler.command = /^ambulk$/i
handler.help = ['ambulk <jumlah>']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Dapatkan beberapa akun Alight Motion Premium sekaligus (bulk)'
handler.usage = 'ambulk 5'
handler.limit = true

export default handler
