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

/* ==========================================================================
   .spotify — Spotify di dalam chat.

     .spotify never gonna give you up   → cari lagu (daftar bisa diketuk)
     .spotify <tautan/URI Spotify>      → lagu dikirim sebagai pesan audio
     .spotify putar <tautan>            → sama

   SATU pesan saja, dikirim sebagai BALASAN (quoted) dari perintahnya: berkas
   mp3 dari penyedia, tanpa encode ulang (mutu penuh), ukurannya tidak dibatasi
   seperti kartu rich message.

   Detail lagunya digabung ke pesan itu:
     • judul        : jadi judul pesan tombol + nama berkas "Artis - Judul.mp3"
     • thumbnail    : sampul album (header lampiran)
     • lampiran     : mp3-nya sendiri — ketuk untuk memutar
     • tombol       : "Buka di Spotify"
     • tag ID3      : judul, artis, album, tahun + sampul tertanam

   Protokol WhatsApp tidak punya bidang caption/thumbnail di AudioMessage, jadi
   gelembung audio murni mustahil menampilkan sampul/teks. Yang punya keduanya
   adalah pesan TOMBOL (interactiveMessage: header bisa membawa lampiran
   ber-thumbnail) dan dokumen. Dipakai mode 'tombol'; ubah KIRIM_SEBAGAI kalau
   mau balik ke 'dokumen' atau gelembung pemutar murni ('audio').
   ========================================================================== */

import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { callEndpoint, findEndpoint, downloadMedia } from '../../lib/apifree.js'
import { callEndpoint as haidarCall, getKey as haidarKey } from '../../lib/haidar.js'
import { sendInteractive } from '../../lib/tombol.js'
import { getFfmpegBinPath } from '../../lib/ytdlp.js'

/* Batas unduhan dari penyedia (lagu 3–5 menit biasanya 5–10 MB). */
const BATAS_UNDUH = 48 * 1024 * 1024
/* Batas audio WhatsApp ±16 MB — di atas itu otomatis dikirim sebagai dokumen. */
const BATAS_AUDIO = 16 * 1024 * 1024
/* Cara pengiriman:
     'tombol'  → pesan tombol (interactive) ber-header lampiran audio: satu pesan
                 memuat thumbnail sampul + judul lagu + lampiran yang bisa
                 diputar + tombol. Ini yang dipakai sekarang.
     'dokumen' → gelembung dokumen ber-caption (thumbnail + judul).
     'audio'   → gelembung pemutar murni: WhatsApp tidak punya bidang thumbnail/
                 caption di AudioMessage, jadi detailnya cuma di nama berkas. */
const KIRIM_SEBAGAI = 'tombol'

const TAUTAN_RE =
  /^(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|artist)\/([A-Za-z0-9]+)/i
const URI_RE = /^spotify:(track|album|playlist|episode|artist):([A-Za-z0-9]+)$/i

/* Nama/berkas tidak boleh memuat karakter terlarang sistem berkas. */
const bersihkanNama = (teks) =>
  String(teks || '').replace(/[\\/:*?"<>|\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()

const potong = (teks, maks) => {
  const isi = String(teks || '').trim()
  return isi.length <= maks ? isi : `${isi.slice(0, maks - 1)}…`
}

/* Terima tautan Spotify maupun URI (spotify:track:xxxx) → selalu jadi tautan web. */
function bacaTautan(teks) {
  const bersih = String(teks || '').trim().replace(/[<>]/g, '')
  const uri = bersih.match(URI_RE)
  if (uri) return `https://open.spotify.com/${uri[1].toLowerCase()}/${uri[2]}`
  const tautan = bersih.match(TAUTAN_RE)
  if (tautan) return `https://open.spotify.com/${tautan[1].toLowerCase()}/${tautan[2]}`
  return ''
}

/* "3:33" → 213 detik. */
function detikDurasi(durasi) {
  const cocok = String(durasi || '').match(/^(\d+):(\d{2})(?::(\d{2}))?$/)
  if (!cocok) return 0
  return cocok[3]
    ? Number(cocok[1]) * 3600 + Number(cocok[2]) * 60 + Number(cocok[3])
    : Number(cocok[1]) * 60 + Number(cocok[2])
}

function jalankanFfmpeg(ffmpeg, argumen, timeout = 60000) {
  return new Promise((resolve) => {
    let selesai = false
    let galat = ''
    const proc = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...argumen], {
      windowsHide: true,
      stdio: ['ignore', 'ignore', 'pipe'],
    })

    const selesaiDengan = (hasil) => {
      if (selesai) return
      selesai = true
      clearTimeout(timer)
      resolve(hasil)
    }

    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL') } catch { /* sudah mati */ }
      selesaiDengan({ ok: false, galat: 'FFmpeg timeout.' })
    }, timeout)

    proc.stderr.on('data', (chunk) => {
      galat += chunk.toString()
      if (galat.length > 2000) galat = galat.slice(-2000)
    })
    proc.on('error', (error) => selesaiDengan({ ok: false, galat: error.message }))
    proc.on('close', (code) =>
      code === 0 ? selesaiDengan({ ok: true }) : selesaiDengan({ ok: false, galat: galat.trim() || `FFmpeg keluar (${code})` }),
    )
  })
}

/* Cek isi berkas: banyak penyedia mengirim audio tanpa ekstensi/tipe yang benar. */
function tebakJenisAudio(buffer, contentType) {
  const ct = String(contentType || '').toLowerCase()
  const kepala = buffer.subarray(0, 12)
  const id3 = kepala.subarray(0, 3).toString('latin1') === 'ID3'
  const mp3Sync = kepala[0] === 0xff && (kepala[1] & 0xe0) === 0xe0
  const m4a = kepala.subarray(4, 8).toString('latin1') === 'ftyp'
  if (id3 || mp3Sync || ct.includes('mpeg') || ct.includes('mp3')) return { ext: 'mp3', mime: 'audio/mpeg' }
  if (m4a || ct.includes('mp4') || ct.includes('m4a')) return { ext: 'm4a', mime: 'audio/mp4' }
  if (ct.includes('ogg') || ct.includes('opus')) return { ext: 'ogg', mime: 'audio/ogg' }
  return { ext: 'mp3', mime: ct.startsWith('audio/') ? ct : 'audio/mpeg' }
}

/* Sampul album: dipakai untuk thumbnail gelembung audio. */
async function siapkanSampul(sampul) {
  if (!sampul) return { kecil: null, sedang: null }
  try {
    const { buffer } = await downloadMedia(sampul, { timeout: 20000, maxBytes: 6 * 1024 * 1024 })
    const kecil = await sharp(buffer).resize(90, 90, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer()
    const sedang = await sharp(buffer).resize(320, 320, { fit: 'cover' }).jpeg({ quality: 78 }).toBuffer()
    return { kecil, sedang }
  } catch {
    return { kecil: null, sedang: null }
  }
}

/* Metadata + sampul + tautan audio lagu. Jalur utama: satu panggilan Haidar
   (±2,8 detik, sekaligus memberi tautan audionya). Cadangan: fareza. */
async function ambilLagu(tautan) {
  const id = (String(tautan).match(/[/:]([A-Za-z0-9]{22})(?:\?|$)/) || [])[1] || ''

  /* Sampul resmi Spotify lewat oEmbed — cepat (±0,2 detik) dan tidak ikut lambat. */
  const resmi = fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(tautan)}`, {
    signal: AbortSignal.timeout(4000),
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  let lagu = null

  if (haidarKey()) {
    try {
      const hasil = await haidarCall('/spotify/track', { url: tautan })
      const data = hasil.data?.data ?? hasil.data
      if (hasil.ok && data?.download_url && data?.title) {
        lagu = {
          id: data.id || id,
          title: data.title,
          artist: data.artist,
          album: data.album,
          duration: data.duration,
          releaseDate: data.releaseDate,
          cover: data.cover,
          downloadLink: data.download_url,
        }
      }
    } catch {
      /* lanjut ke fareza */
    }
  }

  if (!lagu) {
    const endpoint = findEndpoint('/download/spotify', 'fareza')
    if (!endpoint) throw new Error('Sumber Spotify tidak tersedia.')

    const hasil = await callEndpoint(endpoint, { url: tautan })
    if (!hasil.ok) throw new Error(String(hasil.error?.message || `HTTP ${hasil.status}`).slice(0, 160))

    const data = hasil.data?.result || {}
    if (!data.title) throw new Error('Lagu tidak ditemukan dari tautan itu.')
    if (!data.downloadLink) throw new Error('Tautan audionya tidak tersedia untuk lagu ini.')

    lagu = {
      id,
      title: data.title,
      artist: data.artist,
      album: data.album,
      duration: data.duration,
      releaseDate: data.releaseDate,
      cover: data.cover,
      downloadLink: data.downloadLink,
    }
  }

  const jalurResmi = await resmi
  if (jalurResmi?.thumbnail_url) lagu.cover = jalurResmi.thumbnail_url
  if (!lagu.title && jalurResmi?.title) lagu.title = jalurResmi.title

  return lagu
}

/* Menulis detail lagu ke tag ID3 (dan menempelkan sampul) TANPA encode ulang
   (-c copy) supaya mutunya utuh dan cepat. Kalau gagal, berkas asli dipakai. */
async function tagiAudio(buffer, jenis, lagu, sampul) {
  const ffmpeg = await getFfmpegBinPath()
  if (!ffmpeg || jenis.ext !== 'mp3') return buffer

  const token = randomUUID()
  const masuk = path.join(os.tmpdir(), `nano-lagu-${token}.mp3`)
  const keluar = path.join(os.tmpdir(), `nano-lagu-${token}-tag.mp3`)
  const gambar = path.join(os.tmpdir(), `nano-lagu-${token}.jpg`)

  const judul = bersihkanNama(lagu.title) || 'Lagu'
  const artis = bersihkanNama(lagu.artist) || 'Spotify'
  const album = bersihkanNama(lagu.album)
  const tahun = String(lagu.releaseDate || '').slice(0, 4)

  try {
    await fs.writeFile(masuk, buffer)

    const argumen = ['-i', masuk]
    const peta = ['-map', '0:a', '-c:a', 'copy']

    if (sampul?.sedang?.length) {
      await fs.writeFile(gambar, sampul.sedang)
      argumen.push('-i', gambar)
      peta.push('-map', '1:v', '-c:v', 'copy', '-disposition:v', 'attached_pic')
    }

    /* Hanya tag yang datanya kita punya yang ditulis — kalau tidak, tag bawaan
       dari penyedia (album/tahun) malah tertimpa jadi kosong. */
    argumen.push(...peta)
    if (judul) argumen.push('-metadata', `title=${judul}`)
    if (artis) argumen.push('-metadata', `artist=${artis}`)
    if (album) argumen.push('-metadata', `album=${album}`)
    if (tahun) argumen.push('-metadata', `date=${tahun}`)
    argumen.push('-id3v2_version', '3', keluar, '-y')

    const hasil = await jalankanFfmpeg(ffmpeg, argumen)
    if (!hasil.ok) throw new Error(hasil.galat)

    const bertag = await fs.readFile(keluar)
    return bertag.length ? bertag : buffer
  } catch (error) {
    console.log(`  \x1b[33m⚠\x1b[0m  Spotify gagal menulis tag ID3: ${error?.message}`)
    return buffer
  } finally {
    await Promise.all([
      fs.rm(masuk, { force: true }).catch(() => {}),
      fs.rm(keluar, { force: true }).catch(() => {}),
      fs.rm(gambar, { force: true }).catch(() => {}),
    ])
  }
}

/* Rincian lagu — dipakai untuk nama berkas, caption, dan isi kartu tombol. */
function rincian(lagu) {
  const judul = potong(bersihkanNama(lagu.title) || 'Lagu', 70)
  const artis = potong(bersihkanNama(lagu.artist) || 'Tidak diketahui', 50)
  const album = potong(bersihkanNama(lagu.album), 60)
  const tahun = String(lagu.releaseDate || '').slice(0, 4)

  return {
    judul,
    artis,
    nama: `${artis} - ${judul}`,
    baris: [
      `💿 ${album}${tahun ? ` · ${tahun}` : ''}`.trim(),
      lagu.duration ? `⏱️ ${lagu.duration}` : '',
    ].filter((baris) => baris !== ''),
  }
}

/* Pesan TOMBOL (interactive message): header-nya membawa lampiran audionya,
   jadi satu pesan memuat thumbnail sampul + judul lagu + lampiran yang bisa
   diputar + tombol. Ini format yang dipakai helper tombol project —
   sendInteractive() mengirim interactiveMessage dengan documentMessage di
   header + jpegThumbnail (lihat lib/tombol.js).

   Catatan penting: helper itu DIAM-DIAM turun ke pesan teks kalau gagal
   (akibatnya musiknya hilang tanpa peringatan). relayMessage mengembalikan
   id pesan berupa string, sedangkan jalur cadangan mengembalikan objek pesan —
   dari situ kita tahu apakah kartu tombolnya benar-benar terkirim. */
async function kirimTombol(conn, m, lagu, sampul, audio, jenis, tautan, prefix) {
  const { judul, artis, nama, baris } = rincian(lagu)

  const hasil = await sendInteractive(
    conn,
    m.chat,
    {
      title: `🎵 ${judul}`,
      subtitle: artis,
      /* Artis ditulis di isi pesan juga, bukan cuma subtitle header — beberapa
         klien WhatsApp tidak merender subtitle. */
      body: [`🎤 ${artis}`, ...baris, '', '▶️ Ketuk lampirannya untuk memutar.'].join('\n'),
      footer: 'Nano • Spotify',
      document: audio,
      documentFileName: `${nama}.${jenis.ext}`,
      documentMimetype: jenis.mime,
      documentThumbnail: sampul.sedang,
      buttons: [
        { type: 'url', label: '🌐 Buka di Spotify', url: tautan },
        /* Jalan keluar kalau kartunya tidak dirender di HP penerima. */
        { type: 'quick', label: '🎧 Kirim sebagai audio', command: `${prefix}spotify audio ${tautan}` },
      ],
    },
    { quoted: m.raw },
  )

  return typeof hasil === 'string'
}

/* Satu pesan: audionya + detailnya. Tidak ada encode ulang, mutu penuh. */
async function kirimLagu(conn, m, lagu, sampul, audio, jenis, tautan, prefix, modePaksa) {
  const mode = modePaksa || KIRIM_SEBAGAI
  const { judul, artis, nama, baris } = rincian(lagu)
  const detik = detikDurasi(lagu.duration)
  const kecil = sampul.kecil ? sampul.kecil.toString('base64') : undefined
  const sedang = sampul.sedang ? sampul.sedang.toString('base64') : kecil

  /* Cara utama: pesan tombol ber-lampiran audio (thumbnail + judul tampil). */
  if (mode === 'tombol') {
    try {
      if (await kirimTombol(conn, m, lagu, sampul, audio, jenis, tautan, prefix)) {
        return { mode: 'tombol' }
      }
      console.log('  \x1b[33m⚠\x1b[0m  Spotify: kartu tombol ditolak, musiknya dikirim sebagai dokumen')
    } catch (error) {
      console.log(`  \x1b[33m⚠\x1b[0m  Spotify kartu tombol gagal: ${error?.message}`)
    }
  }

  const caption = [`🎵 *${judul}*`, `🎤 ${artis}`, ...baris, '', '▶️ Ketuk berkasnya untuk memutar.'].join('\n')
  const sebagaiDokumen = mode !== 'audio' || audio.length > BATAS_AUDIO

  /* Dikirim sebagai BALASAN (quoted) supaya nyambung dengan perintahnya. */
  if (sebagaiDokumen) {
    await conn.sendMessage(
      m.chat,
      {
        document: audio,
        mimetype: jenis.mime,
        fileName: `${nama}.${jenis.ext}`,
        caption,
        jpegThumbnail: sedang,
      },
      { quoted: m.raw },
    )
    return { mode: 'dokumen' }
  }

  await conn.sendMessage(
    m.chat,
    {
      audio,
      mimetype: jenis.mime,
      ptt: false,
      fileName: `${nama}.${jenis.ext}`,
      seconds: detik || undefined,
      jpegThumbnail: kecil,
    },
    { quoted: m.raw },
  )
  return { mode: 'audio' }
}

/* --------------------------------------------------------------------------
   Putar / kirim lagu
   -------------------------------------------------------------------------- */

async function putar(m, conn, prefix, teks, { mode } = {}) {
  const tautan = bacaTautan(teks)
  if (!tautan) {
    await m.reply(
      [
        '⚠️ Tautan Spotify tidak dikenali.',
        `Contoh: ${prefix}spotify https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT`,
        `Atau cari saja: ${prefix}spotify judul lagu`,
      ].join('\n'),
    )
    return
  }

  await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.raw?.key } }).catch(() => {})

  const lagu = await ambilLagu(tautan)
  const janjiSampul = siapkanSampul(lagu.cover)

  const { buffer, contentType } = await downloadMedia(lagu.downloadLink, {
    timeout: 90000,
    maxBytes: BATAS_UNDUH,
  })

  const jenis = tebakJenisAudio(buffer, contentType)
  const sampul = await janjiSampul

  /* Tag ID3 ditulis supaya pemutar menampilkan judul & artis, bukan nama acak. */
  const audio = await tagiAudio(buffer, jenis, lagu, sampul)

  const hasil = await kirimLagu(conn, m, lagu, sampul, audio, jenis, tautan, prefix, mode)

  console.log(
    `  Spotify terkirim sebagai ${hasil.mode}: ${rincian(lagu).nama} · ${(audio.length / 1048576).toFixed(1)}MB ${jenis.mime}`,
  )

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key } }).catch(() => {})
}

/* --------------------------------------------------------------------------
   Pencarian: daftar hasil, diketuk → lagunya dikirim sebagai audio
   -------------------------------------------------------------------------- */

async function cari(m, conn, prefix, kata) {
  const endpoint = findEndpoint('/search/spotify', 'fareza')
  if (!endpoint) {
    await m.reply('⚠️ Pencarian Spotify tidak ada di katalog.')
    return
  }

  const hasil = await callEndpoint(endpoint, { q: kata, limit: 10 })
  if (!hasil.ok) {
    await m.reply(`⚠️ ${String(hasil.error?.message || `HTTP ${hasil.status}`).slice(0, 160)}`)
    return
  }

  const daftar = (hasil.data?.result?.result?.top_results || hasil.data?.result?.top_results || []).filter(
    (item) => String(item?.type || '').toLowerCase() === 'track' && item?.url,
  )

  if (!daftar.length) {
    await m.reply(`Tidak ada lagu yang cocok dengan *${kata}*. Coba kata kunci lain.`)
    return
  }

  /* Cuma satu hasil → langsung kirim audionya, tidak perlu daftar. */
  if (daftar.length === 1) {
    await putar(m, conn, prefix, daftar[0].url)
    return
  }

  const rows = daftar.slice(0, 10).map((item) => ({
    title: potong(item.name || 'Tanpa judul', 24),
    description: potong(
      [item.artists || item.artist || item.type || 'Track', 'ketuk untuk memutar']
        .filter(Boolean)
        .join(' · '),
      70,
    ),
    command: `${prefix}spotify ${item.url}`,
  }))

  const kartu = {
    title: '🎵 Spotify',
    subtitle: potong(`Hasil untuk "${kata}"`, 60),
    body: 'Ketuk tombol *Pilih lagu* untuk memutar.',
    footer: 'Nano • Spotify',
    list: { listTitle: '🎧 Pilih lagu', sections: [{ title: 'HASIL PENCARIAN', rows }] },
  }

  const sampul = daftar[0]?.thumbnail || daftar[0]?.image || daftar[0]?.cover

  try {
    await sendInteractive(conn, m.chat, kartu, { quoted: m.raw })
    return
  } catch {
    /* daftar lewat tombol gagal → kirim sebagai teks */
  }

  const teks = ['🎵 *Hasil Spotify*', '', ...rows.map((r, i) => `${i + 1}. ${r.title}\n   ${r.command}`)].join('\n')
  if (sampul) {
    try {
      await conn.sendMessage(m.chat, { image: { url: sampul }, caption: teks }, { quoted: m.raw })
      return
    } catch {
      /* jatuh ke teks saja */
    }
  }
  await m.reply(teks)
}

function bantuan(prefix) {
  return [
    '🎵 *SPOTIFY*',
    '',
    `▸ ${prefix}spotify <judul lagu> — cari lagu`,
    `▸ ${prefix}spotify <tautan Spotify> — kirim lagunya (audio, detail digabung)`,
    `▸ ${prefix}spotify putar <tautan> — sama`,
    `▸ ${prefix}spotify audio <tautan> — kirim sebagai gelembung audio biasa`,
    `Contoh: ${prefix}spotify rick astley`,
  ].join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const teks = String(m.text ?? m.args?.join(' ') ?? '').trim()
  const [kataPertama, ...sisaKata] = teks.split(/\s+/)
  const perintah = String(kataPertama || '').toLowerCase()

  try {
    if (!teks) {
      await m.reply(bantuan(prefix))
      return
    }

    if (perintah === 'putar' || perintah === 'play' || perintah === 'main' || perintah === 'audio') {
      const sisa = sisaKata.join(' ').trim()
      if (!sisa) {
        await m.reply(`Format: ${prefix}spotify <tautan Spotify>`)
        return
      }
      /* "putar <judul>" tanpa tautan → anggap pencarian */
      if (!bacaTautan(sisa)) {
        await cari(m, conn, prefix, sisa)
        return
      }
      /* "audio" → gelembung pemutar murni (tanpa kartu), dipakai lewat tombol
         "Kirim sebagai audio" kalau kartunya tidak dirender di HP penerima. */
      await putar(m, conn, prefix, sisa, perintah === 'audio' ? { mode: 'audio' } : {})
      return
    }

    /* teksnya berupa tautan Spotify → langsung kirim audionya */
    if (bacaTautan(teks)) {
      await putar(m, conn, prefix, teks)
      return
    }

    await cari(m, conn, prefix, teks)
  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw?.key } }).catch(() => {})
    await m.reply(`⚠️ Gagal mengambil lagu dari Spotify.\n${String(error?.message || error).slice(0, 160)}`)
  }
}

handler.command = /^spotify$/i
handler.help = ['spotify']
handler.usage = ['spotify <link atau judul>']
handler.menuHelp = ['spotify']
handler.tags = ['download', 'music']
handler.category = 'download'
handler.description = 'Spotify: cari lagu + kirim lagunya sebagai pesan audio (detail digabung)'
handler.limitCommit = 'manual'

export default handler
