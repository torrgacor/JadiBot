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
⌬ Nano Ai · EDIT FOTO (AI)

  Ubah / tambah isi sebuah foto pakai AI **hanya** lewat PhotoEditor AI
  (photoeditorai.io) — multipart langsung, tanpa host sementara dan tanpa
  API Faa, sesuai permintaan owner.

  Helper (media, backend, parsing opsi) ada di lib/ai-foto.js supaya import
  antar-plugin tidak stale saat hot-reload. Export di bawah dipertahankan
  untuk plugin lain (paraloid, unblur) yang dulu mengimpor dari file ini.

  Cara pakai:
    .editfoto tambahkan gunung      (reply/kirim foto, prompt dari teks)
    .editfoto <url gambar> tambahkan gunung
    .editfoto --ratio 9:16 --res 2K jadi anime
*/

import {
  cariGambar,
  unduhGambar,
  unduhUrl,
  extDariMime,
  editFotoPhotoEditor,
  parseOpsiEdit,
  pesanGalatAi,
  catatRiwayat,
  beritahuOwnerKuota,
  PE_RATIOS,
  PE_RESOLUSI,
} from '../../lib/ai-foto.js'

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw?.key } })
  } catch {}
}

const handler = async (m, { conn, rawConn }) => {
  const args = [...(m.args || [])]

  /* URL gambar boleh jadi argumen pertama */
  let urlGambar = ''
  if (args[0] && /^https?:\/\//i.test(args[0])) urlGambar = args.shift()

  const { ops, sisa } = parseOpsiEdit(args)
  const prompt = sisa.join(' ').trim().slice(0, 600)

  if (!PE_RATIOS.includes(ops.ratio)) {
    return m.reply(
      '❌ *Ratio tidak dikenal:* `' + ops.ratio + '`\n\n' +
      'Pilihan `--ratio`: ' + PE_RATIOS.join(', ') + '\n' +
      'Alias: `match` (ikuti gambar — default).'
    )
  }
  if (!PE_RESOLUSI.includes(ops.resolution)) {
    return m.reply(
      '❌ *Resolusi tidak dikenal:* `' + ops.resolution + '`\n\n' +
      'Pilihan `--res`: ' + PE_RESOLUSI.join(', ')
    )
  }

  if (!prompt) {
    return m.reply(
      '🎨 *EDIT FOTO AI*\n\n' +
      'Ubah atau tambahkan isi foto pakai AI.\n\n' +
      '📌 *Cara pakai:*\n' +
      '1. Reply/kirim foto, tulis caption:\n' +
      '   `.editfoto tambahkan gunung`\n' +
      '2. Atau pakai link gambar:\n' +
      '   `.editfoto https://link.jpg jadikan anime`\n\n' +
      '⚙️ *Opsi (opsional):*\n' +
      '   `--ratio 16:9` → rasio hasil; pilihan: ' + PE_RATIOS.filter((r) => r !== 'match_input_image').join(', ') + '\n' +
      '   `--res 4K` → resolusi hasil (1K, 2K, 4K; default 1K)\n' +
      '   Contoh: `.editfoto --ratio 9:16 --res 2K jadi anime`\n\n' +
      'Contoh prompt: `tambahkan gunung`, `ubah jadi kartun`, `ganti latar jadi pantai`, `jadikan gaya anime`'
    )
  }

  const gambar = urlGambar ? null : cariGambar(m)
  if (!urlGambar && !gambar) {
    return m.reply(
      '❌ Kirim atau reply *foto* dulu, baru ketik:\n`.editfoto ' + prompt + '`'
    )
  }

  await react(conn, m, '🎨')

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

    const hasil = await editFotoPhotoEditor(buffer, prompt, {
      ext,
      ratio: ops.ratio,
      resolution: ops.resolution,
    })

    const opsiTeks =
      ops.ratio !== 'match_input_image' || ops.resolution !== '1K'
        ? `\n📐 Ratio: ${ops.ratio === 'match_input_image' ? 'ikuti gambar' : ops.ratio} · Res: ${ops.resolution}`
        : ''

    await conn.sendMessage(
      m.chat,
      {
        image: hasil.buffer,
        mimetype: hasil.mimetype || 'image/png',
        caption:
          '✅ *Foto selesai diedit*\n' +
          `📝 Prompt: ${prompt}\n` +
          opsiTeks +
          '🤖 Editor: PhotoEditor AI',
      },
      { quoted: m.raw }
    )

    catatRiwayat({ op: 'editfoto', backend: 'photoeditor', ok: true, ms: Date.now() - mulai })
    await react(conn, m, '✅')
  } catch (error) {
    console.error('[EDITFOTO]', error)
    await react(conn, m, '❌')

    catatRiwayat({
      op: 'editfoto',
      backend: 'photoeditor',
      ok: false,
      message: String(error?.message || ''),
      ms: Date.now() - mulai,
    })

    // Kuota habis adalah kondisi yang owner perlu tahu (dibatasi 6 jam sekali).
    await beritahuOwnerKuota(rawConn, 'photoeditor', error?.message || '')

    await m.reply('❌ *Gagal mengedit foto.*\n\n> ' + pesanGalatAi(error?.message || 'Gagal mengedit foto.'))
  }
}

/* Re-export helper dari lib/ai-foto.js — dipertahankan untuk plugin lain
   (paraloid, unblur) yang dulu mengimpor dari file ini. Catatan: editfoto
   sendiri TIDAK memakai unggah/editFoto (jalur Faa) — hanya ikut diekspor
   agar import lama tetap hidup. */
export {
  cariGambar,
  unduhGambar,
  unduhUrl,
  extDariMime,
  editFotoPhotoEditor,
  parseOpsiEdit,
  pesanGalatAi,
  unggah,
  editFoto,
} from '../../lib/ai-foto.js'

handler.command = /^(editfoto|editimg|aiedit|editgambar)$/i
handler.help = ['editfoto', 'editimg', 'aiedit', 'editgambar']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Edit foto dengan AI — tambah objek, ganti gaya/latar (reply foto + prompt)'
handler.limit = false

export default handler
