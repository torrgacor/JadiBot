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
┇▫️Author  : Danz nano
┇▫️WhatsApp : wa.me/6285892928715
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
┇
┇🔸Dilarang Menghapus Creadit SC
⌬
*/

/*
⌬ Nano Ai · PARALOID

  Foto polaroid dari 2 foto yang digabung.
  Mesin: api-faa.my.id/faa/editfoto (gambar sebagai referensi wajah).

  Alur pakai:
    .startpola     → mulai sesi
    kirim foto 1   → bot simpan (reaksi 1️⃣)
    kirim foto 2   → bot simpan (reaksi 2️⃣)
    .polaroid      → kedua foto digabung → hasil polaroid berdua

  Lainnya:
    .batalparaloid → batalkan sesi
    .polaroid <teks> → tambahan permintaan
    .startpola <teks> → mulai sesi + catat tambahan permintaan
*/

import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { unggah, editFoto } from '../../lib/ai-foto.js'
import sharp from 'sharp'

/*
  Prompt utama — SATU-SATUNYA prompt untuk semua jalur.
  Ditempel blok KUNCI_WAJAH agar wajah sama sekali tidak diubah.
*/
const PROMPT_POLAROID = `Buatlah gambar yang diambil dengan kamera polaroid. Foto tanpa ada perubahan wajah. Wajah tersebut harus terlihat jelas dan seperti nyata. Tanpa subjek atau properti yang jelas. Foto tersebut harus terlihat sedikit efek blur dan sumber cahaya yang konsisten, seperti lampu kilat di ruangan yang gelap, yang tersebar di seluruh foto.`

const TAMBAHAN_GABUNG = `Gambar referensi berisi dua orang berdampingan (wajah orang pertama di bagian KIRI, orang kedua di bagian KANAN). Hasil akhirnya adalah foto polaroid berdua: kedua orang dari referensi tampil BERSAMA dalam satu foto, berpose yang mesra dan lucu. Ganti tirai belakang menjadi tirai putih. Jangan ubah wajah.`

/*
  Kunci wajah — ditempel ke SETIAP prompt.
  Tujuannya: identitas wajah dari foto yang dikirim WAJIB tetap sama.
*/
const KUNCI_WAJAH = `PENTING — ATURAN WAJAH (WAJIB DIPATUHI, PRIORITAS TERTINGGI):
- Wajah, bentuk kepala, dan identitas orang di hasil HARUS 100% SAMA dengan foto referensi yang dilampirkan. DILARANG mengganti, mengubah, mempercantik, atau membuat ulang wajah.
- Detail wajah asli dipertahankan penuh: bentuk mata, hidung, mulut, telinga, rahang, garis rambut asli, warna kulit, behel (bila ada), tahi lalat/lesung pipi (bila ada).
- Jangan mengubah usia, jenis kelamin, etnis, atau kepemilikan wajah. Jangan membuat wajah AI/plastik — tetap orang yang sama persis.
- Yang BOLEH disesuaikan hanya: latar belakang, pencahayaan, pose, dan gaya kamera sesuai deskripsi di atas.
- Hasil akhir harus tetap langsung dikenali sebagai orang di foto referensi.`

function teksBantuan() {
  return (
    '📸 *PARALOID — Foto Polaroid 2 Orang*\n\n' +
    'Gabung 2 foto jadi satu foto polaroid (wajah asli, pose mesra & lucu, latar tirai putih).\n\n' +
    '📌 *Langkah-langkah:*\n' +
    '1️⃣ `.startpola` → mulai sesi\n' +
    '2️⃣ kirim *foto pertama*\n' +
    '3️⃣ kirim *foto kedua*\n' +
    '4️⃣ ketik `.polaroid` → hasil jadi\n\n' +
    '✏️ Mau tambahan keinginan? tulis di `.startpola <teks>`\n' +
    '   atau `.polaroid <teks>` saat memproses\n\n' +
    '🗑️ `.batalparaloid` → batalkan sesi\n' +
    '⏱️ Sesi hangus 10 menit'
  )
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw?.key } })
  } catch {}
}

/* ---------- sesi paraloid ---------- */

const SESI = new Map() // key = `${chat}|${pengirim}` → { langkah, foto1, foto2, tambahan, waktu }
const SESI_MAKS = 10 * 60 * 1000 // hangus 10 menit

function kunciSesi(m) {
  const sender = m?.sender || m?.raw?.key?.participant || m?.raw?.key?.remoteJid || 'x'
  return `${m.chat}|${sender}`
}

function sesiBaru(m) {
  const k = kunciSesi(m)
  const s = SESI.get(k)
  if (s && Date.now() - s.waktu > SESI_MAKS) {
    SESI.delete(k)
    return null
  }
  return s
}

function sesiTutup(m) {
  SESI.delete(kunciSesi(m))
}

/* ---------- unduh gambar dari node pesan ---------- */

async function unduhDariNode(tipe, node, key, rawConn) {
  const buffer = await downloadMediaMessage(
    { key, message: { [tipe]: node } },
    'buffer',
    {},
    { logger: rawConn?.logger, reuploadRequest: rawConn?.updateMediaMessage }
  )
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('Gambar gagal diunduh.')
  return buffer
}

/* ---------- deteksi gambar pada pesan (saat ini & reply) ---------- */

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 10; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

function nodeGambarDari(m) {
  for (const [msg, key] of [
    [m?.quotedMessage?.message, m?.quotedMessage?.key || m?.raw?.key],
    [m?.currentMessage, m?.raw?.key],
  ]) {
    const isi = unwrapMessage(msg)
    const ambil = (tipe) => (isi?.[tipe] ? { tipe, node: isi[tipe], key } : null)
    const hasil =
      ambil('imageMessage') ||
      (isi?.documentMessage && /^image\//i.test(isi.documentMessage.mimetype || '')
        ? { tipe: 'documentMessage', node: isi.documentMessage, key }
        : null) ||
      ambil('stickerMessage')
    if (hasil) return hasil
  }
  return null
}

/* ---------- gabung 2 foto jadi satu (side by side, tinggi disamakan) ---------- */

export async function gabungDuaFoto(bufferA, bufferB) {
  const LEBAR = 1024
  const TINGGI = 1024

  const siapkan = async (buf) => {
    const img = sharp(buf, { failOn: 'none' }).rotate()
    return img
      .resize(Math.round(LEBAR / 2), TINGGI, { fit: 'cover', position: 'attention' })
      .png()
      .toBuffer()
  }

  const [kiri, kanan] = await Promise.all([siapkan(bufferA), siapkan(bufferB)])

  return sharp({
    create: { width: LEBAR, height: TINGGI, channels: 3, background: '#ffffff' },
  })
    .composite([
      { input: kiri, left: 0, top: 0 },
      { input: kanan, left: Math.round(LEBAR / 2), top: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer()
}

/* ---------- proses akhir: gabung → unggah → API → kirim ---------- */

async function proses(m, conn, rawConn, { foto1, foto2, tambahan }) {
  await react(conn, m, '📸')

  try {
    const gabungan = await gabungDuaFoto(foto1, foto2)
    const urlGambar = await unggah(gabungan, 'jpg')

    let prompt = PROMPT_POLAROID
    if (tambahan) prompt += `\n\nTambahan permintaan dari pengguna: ${String(tambahan).slice(0, 1000)}`
    prompt += `\n\n${TAMBAHAN_GABUNG}`
    prompt += `\n\n${KUNCI_WAJAH}`

    const hasil = await editFoto(urlGambar, prompt)

    await conn.sendMessage(
      m.chat,
      {
        image: hasil.buffer,
        mimetype: 'image/jpeg',
        caption:
          '✨ *PARALOID*\n' +
          '📷 Foto polaroid · flash ruangan gelap\n' +
          '🧩 2 foto digabung (satu orang per foto)\n' +
          '🙂 Wajah asli tanpa perubahan\n' +
          '🤖 Mesin: Faa AI',
      },
      { quoted: m.raw }
    )

    await react(conn, m, '✅')
  } catch (error) {
    console.error('[PARALOID]', error)
    await react(conn, m, '❌')

    const pesan = String(error?.message || 'Gagal membuat foto.')
    const lambat = /abort|timeout|timed out/i.test(pesan)

    await m.reply(
      '❌ *Gagal membuat foto paraloid.*\n\n' +
        (lambat
          ? '⏱️ Server AI terlalu lama merespons. Coba lagi sebentar lagi.'
          : `> ${pesan}`)
    )
  }
}

/* ---------- handler utama ---------- */

const handler = async (m, { conn, rawConn }) => {
  const cmd = String(m.command || '').toLowerCase()

  /* ---- .startpola : mulai sesi ---- */
  if (cmd === 'startpola') {
    const args = [...(m.args || [])]
    /* URL gambar boleh jadi argumen pertama — langsung proses tanpa sesi */
    if (args[0] && /^https?:\/\//i.test(args[0])) {
      return m.reply('❌ Untuk mode link, gunakan `.polaroid <url1> <url2>` — sedangkan `.startpola` khusus alur kirim foto.\n\n' + teksBantuan())
    }

    const tambahan = args.join(' ').trim().slice(0, 1000)
    const sudah = sesiBaru(m)

    SESI.set(kunciSesi(m), {
      langkah: 1,
      foto1: sudah?.foto1 || null,
      foto2: null,
      tambahan: tambahan || sudah?.tambahan || '',
      waktu: Date.now(),
    })

    await react(conn, m, '📸')

    if (sudah?.foto1) {
      return m.reply(
        '📸 *Sesi dilanjutkan* — foto pertama masih tersimpan.\n\n' +
          'Sekarang kirim *foto kedua*.\n' +
          (tambahan ? `✏️ Tambahan dicatat: ${tambahan}\n` : '') +
          '⏱️ Sesi hangus 10 menit · `.batalparaloid` untuk membatalkan'
      )
    }

    return m.reply(
      '📸 *Sesi PARALOID dimulai!*\n\n' +
        '1️⃣ Kirim *foto pertama*\n' +
        '2️⃣ lalu kirim *foto kedua*\n' +
        '3️⃣ terakhir ketik `.polaroid`\n\n' +
        (tambahan ? `✏️ Tambahan dicatat: ${tambahan}\n` : '') +
        '⏱️ Sesi hangus 10 menit · `.batalparaloid` untuk membatalkan'
    )
  }

  /* ---- .batalparaloid : batalkan sesi ---- */
  if (cmd === 'batalparaloid') {
    const ada = sesiBaru(m)
    sesiTutup(m)
    return m.reply(ada ? '🗑️ Sesi paraloid dibatalkan.' : 'Tidak ada sesi paraloid yang berjalan.')
  }

  /* ---- .polaroid / .paraloid / .pld : proses atau bantuan ---- */
  const args = [...(m.args || [])]

  /* URL gambar boleh jadi argumen pertama */
  let urlGambar = ''
  if (args[0] && /^https?:\/\//i.test(args[0])) urlGambar = args.shift()

  const argTeks = args.join(' ').trim()

  const sesi = sesiBaru(m)

  /* ---- 4a. proses dari sesi lengkap (2 foto tersimpan) ---- */
  if (sesi?.foto1 && sesi?.foto2) {
    sesiTutup(m)
    return proses(m, conn, rawConn, {
      foto1: sesi.foto1,
      foto2: sesi.foto2,
      tambahan: argTeks || sesi.tambahan || '',
    })
  }

  /* ---- 4b. proses satu foto (reply foto / link) — tanpa sesi ---- */
  const gambar = urlGambar ? null : nodeGambarDari(m)
  if (!sesi && (urlGambar || gambar)) {
    let buffer
    if (urlGambar) {
      const res = await fetch(urlGambar, { signal: AbortSignal.timeout(60_000), headers: { 'user-agent': 'Mozilla/5.0' } })
      if (!res.ok) throw new Error(`HTTP ${res.status} saat mengambil gambar.`)
      buffer = Buffer.from(await res.arrayBuffer())
    } else {
      buffer = await unduhDariNode(gambar.tipe, gambar.node, gambar.key, rawConn)
    }

    const urlSatu = await unggah(buffer, /png/i.test(gambar?.node?.mimetype || '') ? 'png' : 'jpg')

    let prompt = PROMPT_POLAROID
    if (argTeks) prompt += `\n\nTambahan permintaan dari pengguna: ${argTeks.slice(0, 1000)}`
    prompt += `\n\n${KUNCI_WAJAH}`

    await react(conn, m, '📸')
    try {
      const hasil = await editFoto(urlSatu, prompt)
      await conn.sendMessage(
        m.chat,
        {
          image: hasil.buffer,
          mimetype: 'image/jpeg',
          caption:
            '✨ *PARALOID*\n' +
            '📷 Foto polaroid · flash ruangan gelap\n' +
            '🙂 Wajah asli tanpa perubahan\n' +
            '🤖 Mesin: Faa AI',
        },
        { quoted: m.raw }
      )
      return react(conn, m, '✅')
    } catch (error) {
      console.error('[PARALOID] satu foto:', error)
      await react(conn, m, '❌')
      const pesan = String(error?.message || 'Gagal membuat foto.')
      return m.reply('❌ *Gagal membuat foto.*\n\n> ' + pesan)
    }
  }

  /* ---- 4c. ada sesi tapi foto belum lengkap → info langkah berikutnya ---- */
  if (sesi) {
    const sisa = !sesi.foto1 ? 'foto *pertama*' : 'foto *kedua*'
    return m.reply(
      `⏳ Sesi berjalan — masih menunggu ${sisa}.\n\n` +
        `Sudah terkirim: ${sesi.foto1 ? '1 foto ✅' : 'belum ada'}\n\n` +
        teksBantuan()
    )
  }

  return m.reply('❌ Belum ada sesi. Mulai dulu dengan `.startpola`\n\n' + teksBantuan())
}/* handler hook untuk menangkap foto yang dikirim TANPA teks (langkah 1 & 2).
   Dipanggil router untuk SETIAP pesan (bentuk conn, raw — sama seperti afk-handler). */
export async function hookParaloidFoto(conn, raw, { chat, sender, isSelf } = {}) {
  try {
    if (!raw?.message || raw.key?.remoteJid === 'status@broadcast') return false

    const isi = unwrapMessage(raw.message)
    const adaGambar = Boolean(
      isi?.imageMessage ||
      (isi?.documentMessage && /^image\//i.test(isi.documentMessage.mimetype || ''))
    )
    if (!adaGambar) return false /* bukan gambar → lewat */

    /* pesan bercaption/teks dianggap bukan foto sesi → lewat */
    const teks = String(isi?.imageMessage?.caption || isi?.documentMessage?.caption || isi?.conversation || isi?.extendedTextMessage?.text || '').trim()
    if (teks) return false

    const mPalsu = {
      chat,
      sender: sender || raw.key?.participant || raw.key?.remoteJid,
      raw,
    }
    const sesiCek = sesiBaru(mPalsu)
    console.log(`[PARALOID] foto polos dari ${mPalsu.sender} di ${chat} → sesi: ${sesiCek ? 'ADA (foto' + (sesiCek.foto1 ? '1 ✓, tunggu foto2' : '1 belum') + ')' : 'TIDAK ADA'}`)

    const sesi = sesiCek
    if (!sesi) return false /* tidak ada sesi .startpola aktif → lewat */

    const key = raw.key
    const tipe = isi.imageMessage ? 'imageMessage' : 'documentMessage'
    const buffer = await unduhDariNode(tipe, isi[tipe], key, conn)

    if (!sesi.foto1) {
      sesi.foto1 = buffer
      sesi.waktu = Date.now()
      await react(conn, { chat, raw }, '1️⃣')
      await conn.sendMessage(chat, {
        text:
          '1️⃣ *Foto pertama tersimpan.*\n\n' +
          '2️⃣ Sekarang kirim *foto kedua*.\n' +
          '⏱️ Sesi hangus 10 menit · `.batalparaloid` untuk membatalkan',
      }, { quoted: raw })
    } else {
      sesi.foto2 = buffer
      sesi.waktu = Date.now()
      await react(conn, { chat, raw }, '2️⃣')
      await conn.sendMessage(chat, {
        text:
          '2️⃣ *Foto kedua tersimpan.*\n\n' +
          'Terakhir, ketik: `.polaroid`\n' +
          '⏱️ Sesi hangus 10 menit · `.batalparaloid` untuk membatalkan',
      }, { quoted: raw })
    }
    return true /* foto dikonsumsi sesi → router berhenti */
  } catch (e) {
    console.error('[PARALOID] hook foto sesi:', e)
    try {
      await conn.sendMessage(raw.key.remoteJid, { text: '❌ Gagal membaca foto. Coba kirim ulang.' }, { quoted: raw })
    } catch {}
    return true
  }
}

handler.command = /^(paraloid|pld|polaroid|startpola|batalparaloid)$/i
handler.help = ['startpola', 'polaroid', 'paraloid', 'pld']
handler.tags = ['tools']
handler.category = 'tools'
handler.description =
  'Foto polaroid 2 orang — .startpola → kirim 2 foto → .polaroid (wajah asli, tirai putih, pose mesra)'
handler.limit = false

export default handler
