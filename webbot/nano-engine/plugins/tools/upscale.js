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

/*
⌬ Nano Ai · UPSCALE / HD

  Naikkan resolusi & ketajaman foto lewat PhotoEditor AI dengan
  image_resolution pilihan (1K/2K/4K) dan rasio yang mengikuti gambar.

  Job berjalan SERIAL lewat antrean di lib/ai-foto.js (satu job pada satu
  waktu, kapasitas 8) plus cooldown per user — supaya job AI tidak berjembatan
  dan kuota backend tidak terbakar oleh spam. Backend HANYA PhotoEditor AI
  (tanpa jalur cadangan Faa, seragam dengan .editfoto); bila kuota habis,
  owner diberi tahu lewat DM dan user mendapat pesan yang jelas.

  Endpoint upscancer dedicated mereka (/pe/ai-enhance/*) buta kredit
  (400005 Insufficient credits), jadi job dijalankan lewat photo-editor
  dengan prompt enhance — hasilnya tetap PNG resolusi target.

  Cara pakai:
    .upscale           (reply/kirim foto — default 2K)
    .upscale 4k        (target 4K)
    .upscale https://link.jpg 4k
*/

import {
  cariGambar,
  unduhGambar,
  unduhUrl,
  extDariMime,
  editFotoPhotoEditor,
  pesanGalatAi,
  catatRiwayat,
  beritahuOwnerKuota,
  buatAntrean,
  cekCooldown,
  setCooldown,
} from '../../lib/ai-foto.js'

const TARGET = ['1K', '2K', '4K']
const COOLDOWN_MS = 60_000
const KAPASITAS_ANTREAN = 8

/* Antrean & cooldown hidup di lib/ (cache modul) supaya tetap utuh walau
   plugin ini kena hot-reload di tengah antrian. */
const antrean = buatAntrean({ kapasitas: KAPASITAS_ANTREAN })

const PROMPT_UPSCALE =
  'Upscale this image to a higher resolution. Enhance sharpness, fine detail and clarity, ' +
  'reduce noise and compression artifacts. Keep the image identical: same content, same colors, ' +
  'same composition, no added or removed elements.'

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw?.key } })
  } catch {}
}

const handler = async (m, { conn, rawConn }) => {
  const args = [...(m.args || [])]

  /* URL gambar boleh jadi argumen pertama (sama seperti .editfoto) */
  let urlGambar = ''
  if (args[0] && /^https?:\/\//i.test(args[0])) urlGambar = args.shift()

  const target = String(args[0] || '2k').toLowerCase().replace(/p$/, '')
  const resolution = target === '1k' ? '1K' : target === '4k' ? '4K' : target === '2k' ? '2K' : ''

  if (!resolution) {
    return m.reply(
      '❌ *Resolusi tidak dikenal:* `' + args[0] + '`\n\n' +
      'Pilihan: `1k`, `2k` (default), `4k`.'
    )
  }

  const gambar = urlGambar ? null : cariGambar(m)
  if (!urlGambar && !gambar) {
    return m.reply(
      '🔍 *UPSCALE / HD FOTO*\n\n' +
      'Naikkan resolusi & ketajaman foto pakai AI.\n\n' +
      '📌 *Cara pakai:*\n' +
      '1. Reply/kirim foto lalu:\n' +
      '   `.upscale`\n' +
      '2. Pilih resolusi target:\n' +
      '   `.upscale 4k` (1k / 2k / 4k — default 2k)\n' +
      '3. Atau pakai link gambar:\n' +
      '   `.upscale https://link.jpg 4k`\n\n' +
      '⏳ Cooldown 60 detik per user; hasil menyusul otomatis bila antrean sibuk.'
    )
  }

  const sisaCooldown = cekCooldown(m.sender, COOLDOWN_MS)
  if (sisaCooldown) {
    return m.reply(
      '⏳ *Cooldown aktif*\n\n' +
      'Tunggu ' + Math.ceil(sisaCooldown / 1000) + ' detik lagi sebelum upscale berikutnya.'
    )
  }

  /* Tugas dieksekusi lewat antrean: handler tidak menunggu job selesai,
     jadi pesan lain tetap bisa diproses selama AI mengerjakan gambar ini. */
  const jalankan = async () => {
    await react(conn, m, '🔍')
    const mulai = Date.now()

    try {
      let buffer = null
      let ext = 'jpg'

      if (gambar) {
        buffer = await unduhGambar(gambar, rawConn)
        ext = gambar.stiker ? 'png' : extDariMime(gambar.node.mimetype)
      } else {
        const unduhan = await unduhUrl(urlGambar)
        buffer = unduhan.buffer
        ext = unduhan.ext
      }

      const hasil = await editFotoPhotoEditor(buffer, PROMPT_UPSCALE, {
        ext,
        ratio: 'match_input_image',
        resolution,
      })

      await conn.sendMessage(
        m.chat,
        {
          image: hasil.buffer,
          mimetype: hasil.mimetype || 'image/png',
          caption:
            '✅ *Upscale selesai*\n' +
            `🔎 Target: ${resolution} · rasio mengikuti gambar\n` +
            `📏 Gambar: ${buffer.length} → ${hasil.buffer.length} byte\n` +
            '🤖 Editor: PhotoEditor AI',
        },
        { quoted: m.raw }
      )

      catatRiwayat({ op: 'upscale', backend: 'photoeditor', ok: true, ms: Date.now() - mulai })
      await react(conn, m, '✅')
    } catch (error) {
      console.error('[UPSCALE]', error)
      await react(conn, m, '❌')

      catatRiwayat({
        op: 'upscale',
        backend: 'photoeditor',
        ok: false,
        message: String(error?.message || ''),
        ms: Date.now() - mulai,
      })

      await beritahuOwnerKuota(rawConn, 'photoeditor', error?.message || '')

      await m.reply('❌ *Gagal upscale foto.*\n\n> ' + pesanGalatAi(error?.message || 'Gagal meng upscale foto.'))
    }
  }

  const posisi = antrean.posisiBerikut()
  if (posisi > KAPASITAS_ANTREAN) {
    return m.reply(
      '⏳ *Antrean penuh*\n\n' +
      'Semua slot upscale sedang terisi. Coba lagi beberapa menit lagi.'
    )
  }

  /* Cooldown dicatat saat masuk antrean (bukan saat selesai) supaya spam
     perintah tidak bisa mengantre beruntun. */
  setCooldown(m.sender)

  const janji = antrean.masuk(jalankan)
  janji.catch((err) => {
    if (err?.message === 'ANTREAN_PENUH') {
      return m.reply('⏳ *Antrean penuh* — coba lagi beberapa menit lagi.')
    }
    console.error('[UPSCALE] galat antrean:', err)
  })

  if (posisi > 1) {
    await m.reply(
      '⏳ *Masuk antrean*\n\n' +
      'Backend AI sedang sibuk — permintaanmu nomor ' + posisi + '.\n' +
      'Hasilnya otomatis dikirim ke chat ini begitu selesai.'
    )
  }
}

handler.command = /^(upscale|hd|remini)$/i
handler.help = ['upscale', 'upscale 4k', 'hd', 'remini']
handler.menuHelp = ['upscale', 'upscale 4k']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Upscale/HD foto dengan AI — target resolusi 1k/2k/4k (reply foto)'
handler.limit = false

export default handler
