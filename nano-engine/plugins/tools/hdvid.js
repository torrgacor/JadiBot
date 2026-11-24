/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ▭▬▭▭▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━
┇
┇▫️Author  : Danz nano & Awang Ofc
┇▫️Website  : awangofc.my.id
┇▫️WhatsApp : wa.me/556184127506
┇
┇ ▭▬▭▬▭▭▬▭▭▭▬▭▭▭▬▭▬▭
┇
┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
┇
┇🔸Dilarang Menghapus Creadit SC
┇🔸Dilarang Menjual Script Nano Ai
┇🔸Dilarang Mengatas Namakan Script!!
⌬
*/

/* HD Video Cleaner — .hdvid
   Video burem + bersuara → dibersihkan lalu dinaikkan ke HD, seluruhnya
   di server ini (ffmpeg). Tidak ada unggah ke pihak ketiga: video user
   tetap privat dan fitur tidak bergantung pada layanan luar.

   Satu proses ffmpeg dengan rangkaian filter:
     hqdn3d  buang grain sumber — dilakukan SEBELUM memperbesar supaya
             noise tidak ikut dikali saat pembesarannya
     scale   Lanczos, dibatasi supaya tidak melebihi kapasitas CPU box
     fps     WhatsApp membatasi 30 fps saat transcode, jadi frame di atas
             itu dibuang di sini agar tidak sia-sia
     unsharp menajamkan tepi lagi setelah diperbesar
     hqdn3d  buang grain yang ditambahkan proses pembesaran

   Pakai: kirim/reply video lalu .hdvid [jelas] [1080p | 720p | 4k | 2x | 3x | clean]

   Tanpa opsi: naikkan ke 2K (tinggi 1440, lebar ikut rasio aspek) +
   bersihkan noise + tajamkan. Tidak ada batas durasi — video berapa
   pun diproses, hanya dibatasi 60 MB.
   Tambahkan "jelas" untuk ketajaman maksimal (video buram berat):
   denoise chroma saja lalu sharpen kuat — paling tajam tapi noise
   naik dari 4,0 ke 6,2 (masih di bawah sumber 10,9).
   Video panjang (>90 detik diproses) dikabar progres tiap menit
   supaya tidak terlihat hang.
   Nama "hdvid" pernah bentrok dengan endpoint /tools/hdvid milik
   haidar (dibangkitkan dari data/haidar-commands.json). Setelah perintah
   ini memakai nama itu, jalankan ulang scripts/generate-haidar-commands.mjs
   supaya nama endpoint haidar otomatis digeser. */

import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import pino from 'pino'
import { getFfmpegBinPath } from '../../lib/ytdlp.js'

const logger = pino({ level: 'silent' })

/* ── Batas ──────────────────────────────────────────────────────────────── */
const MAKS_MB = 60 // ukuran video yang boleh diproses
const TTL_SIMAN = 10 * 60 * 1000 // berapa lama video terakhir diingat
const TIMEOUT_PROSES = 300_000

/* Target yang boleh diketik user. Target disimpan sebagai TINGGI
   (lebar ikut rasio aspek), bukan lebar, supaya berlaku sama untuk video 16:9 maupun
   persegi (lihat catatan di pilihUkuran). "clean" = bersihkan tanpa
   memperbesar. */
function petaTarget(arg) {
  switch (arg) {
    case '':
    case 'auto':
      return null // 2K, dipilih nanti
    case '720p':
      return { tinggi: 720 }
    case '1080p':
      return { tinggi: 1080 }
    case '2k':
    case '1440p':
      return { tinggi: 1440 }
    case '4k':
    case '2160p':
      return { tinggi: 2160 }
    case 'clean':
    case 'asis':
    case 'none':
      return { tinggi: 0 }
    default:
      break
  }
  const kali = arg.match(/^([23])x?$/)
  if (kali) return { kali: Number(kali[1]) }
  return undefined
}

/* Resolusi dan biaya processing harus dihitung dari JUMLAH PIKSEL dan
   dari RASIO ASPEK, bukan dari lebar saja.

   Dua kesalahan lama yang keduanya lahir dari "target = lebar tetap":
     1. 576×576 dengan lebar 2560 jadi 2560×2560 = 6,6 MP, padahal batas
        durasi disusun untuk 2560×1440 = 3,7 MP — video 33 detik ditolak
        padahal akan selesai ~2 menit.
     2. 640×360 jadi 2560×1440 = 3,7 MP, tapi saat memakai budget MP,
        lebarnya ikut menyusut jadi 1442 — artinya "2K" justru lebih
        KECIL dari versi lama untuk video 16:9.

   Jadi sekarang: target ditentukan dari TINGGI (lebar ikut rasio
   aspek), jumlah piksel = lebar × tinggi, dan semua batas/faktor
   dihitung dari jumlah piksel itu. Anchor terukur di box ini:
     3,7 MP ±3,0× durasi · 2,1 MP ±2,4× · 0,9 MP ±1,1× */
const MP_2K = 3.7
const MP_1080 = 2.1
const MP_720 = 0.9

/* Target = tinggi desired; lebar = tinggi × rasio aspek sumber.
   Untuk video persegi (1:1) "2K" berarti 1440×1440 (2,1 MP) — jauh
   lebih murah daripada 2560×2560, dan ini wajar: 2560×2560 bukan 2K,
   itu 6,6 MP. */
function pilihUkuran(info, tinggiTarget) {
  if (!tinggiTarget) return { width: 0, height: 0 }
  const lebar = Math.round((tinggiTarget * info.width) / info.height)
  if (lebar <= info.width) return { width: 0, height: 0 }
  return {
    width: lebar - (lebar % 2),
    height: tinggiTarget - (tinggiTarget % 2),
  }
}

function megapiksel(ukuran) {
  return (ukuran.width * ukuran.height) / 1_000_000
}

/* Kelipatan lebar (2x / 3x) tetap dipakai apa adanya; tingginya
   mengikuti rasio aspek sehingga tetap genap. */
function targetKeTinggi(info, target) {
  if (!target) return 1440 // default: 2K
  if (!target.kali && target.tinggi === 0) return 0 // clean
  if (target.kali) return Math.round((info.height * target.kali) / 2) * 2
  return target.tinggi
}

/* Faktor waktu mengikuti jumlah piksel hasil, bukan tinggi target. */
function faktorWaktu(ukuran) {
  const mp = megapiksel(ukuran)
  if (!mp) return 1
  if (mp <= MP_720) return 1.1
  if (mp <= MP_1080) return 2.4
  if (mp <= MP_2K) return 3
  return 3 * (mp / MP_2K)
}

/* TIDAK ada batas durasi lagi (diminta user): video berapa pun diproses.
   Yang tersisa hanya batas ukuran berkas 60 MB — durasi video sendiri
   bukan masalah, yang mahal itu CPU dan lama nunggu.

   Dua konsekuensi yang harus ditangani, bukan diabaikan:
     - timeout proses juga dibuka. TIMEOUT_PROES dulunya 5 menit, jadi
       video 3 menit akan dibunuh di tengah jalan. Sekarang timeout
       dihitung dari durasi video (lihat timeoutUntuk).
     - proses panjang butuh heartbeat, supaya user tidak melihat bot
       diam 10 menit lalu mengira hang (lihat laporanProses). */

function estimasiDetik(detikVideo, ukuran) {
  if (!detikVideo) return 20
  return Math.max(10, Math.round(detikVideo * faktorWaktu(ukuran)))
}

function panduan(usedPrefix) {
  return [
    '╭─「 🎬 HD VIDEO 」',
    '│',
    '│ Bersihkan video buram jadi HD — dikerjakan di server, video tidak diunggah.',
    '│',
    '│ Cara pakai:',
    '│ 1. Kirim video (atau reply videonya)',
    `│ 2. Ketik ${usedPrefix}hdvid`,
    '│',
    `│ Opsi: ${usedPrefix}hdvid [jelas] [1080p | 720p | 4k | 2x | 3x | clean]`,
    '│   jelas           lebih tajam (cocok video buram berat)',
    '│   1080p / 720p   target lebih ringan (default: 2K / 1440p)',
    '│   4k             resolusi maksimal (maks 10 detik)',
    '│   2x / 3x        naikkan sebanyak itu',
    '│   clean          hanya hilangkan noise, resolusi tetap',
    '╰──────────────',
  ].join('\n')
}

/* ── Ambil video dari pesan (atau pesan yang di-reply) ──────────────────── */
function bukaPesan(message) {
  let current = message
  for (let i = 0; i < 6; i++) {
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

function ambilVideo(m) {
  const kandidat = [
    { key: m.raw?.key, message: m.currentMessage },
    { key: m.quotedMessage?.key, message: m.quotedMessage?.message },
  ]
  for (const k of kandidat) {
    if (!k.key || !k.message) continue
    const dalam = bukaPesan(k.message)
    if (dalam.videoMessage) return { key: k.key, type: 'videoMessage', node: dalam.videoMessage }
    if (dalam.documentMessage && /video\//i.test(String(dalam.documentMessage.mimetype || ''))) {
      return { key: k.key, type: 'documentMessage', node: dalam.documentMessage }
    }
  }

  /* Tidak ada video di pesan ini dan tidak di-reply: pakai video
     terakhir yang dikirim user yang sama (10 menit terakhir). Jadi
     "kirim video" lalu "ketik .hdvid" tetap jalan tanpa reply. */
  const tersimpan = global.hdvidVideo?.get(m.sender)
  if (tersimpan && Date.now() - tersimpan.pada < TTL_SIMAN) return tersimpan

  return null
}

/* Interceptor: hanya INGAT video yang masuk, tidak pernah memakan pesan. */
function ingatVideo(raw, sender) {
  const dalam = bukaPesan(raw?.message)
  let node = null
  let type = ''
  if (dalam.videoMessage) {
    node = dalam.videoMessage
    type = 'videoMessage'
  } else if (dalam.documentMessage && /video\//i.test(String(dalam.documentMessage.mimetype || ''))) {
    node = dalam.documentMessage
    type = 'documentMessage'
  }
  if (!node || !raw?.key) return
  if (!global.hdvidVideo) global.hdvidVideo = new Map()
  global.hdvidVideo.set(sender, { key: raw.key, type, node, pada: Date.now() })
}

function ukuranBytes(n) {
  return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {
    /* abaikan */
  }
}

/* ── ffmpeg ─────────────────────────────────────────────────────────────── */
/* Tanpa batas durasi, timeout proses tidak boleh lagi berupa angka mati:
   video 5 menit butuh ±15 menit CPU dan akan dibunuh kalau timeout-nya
   masih 5 menit. Jadi timeout = 3× perkiraan, minimal 5 menit, maksimal
   2 jam (safety net supaya proses yatim tidak menggantung selamanya). */
function timeoutUntuk(perkiraan) {
  const ms = Math.max(perkiraan, 60) * 3 * 1000
  return Math.min(Math.max(ms, 300_000), 7_200_000)
}

/* Kirim "masih jalan" tiap menit selama proses belum selesai, supaya user
   tidak mengira bot hang — penting karena tidak ada lagi batas durasi
   yang pendek. Return fungsi untuk menghentikan interval. */
function laporanProses(conn, m, perkiraan, target, mulai) {
  if (perkiraan <= 90) return () => {}
  const timer = setInterval(() => {
    const sisa = Math.max(0, perkiraan - Math.round((Date.now() - mulai) / 1000))
    conn
      .sendMessage(
        m.chat,
        { text: `⏳ Masih diproses… ${target}, perkiraan ±${perkiraan} detik${sisa ? ` (sisa ~${sisa} dtk)` : ''}` },
        { quoted: m.raw },
      )
      .catch(() => {})
  }, 60_000)
  timer.unref?.()
  return () => clearInterval(timer)
}

function jalankan(bin, args, timeout = TIMEOUT_PROSES) {
  return new Promise((resolve) => {
    const anak = spawn(bin, args)
    let stderr = ''
    let selesai = false
    const timer = setTimeout(() => {
      if (!selesai) anak.kill('SIGKILL')
    }, timeout)
    anak.stderr.on('data', (d) => {
      if (stderr.length < 40_000) stderr += String(d)
    })
    anak.stdout?.on('data', () => {})
    anak.on('error', (e) => {
      selesai = true
      clearTimeout(timer)
      resolve({ code: -1, stderr: String(e?.message || e) })
    })
    anak.on('close', (code) => {
      selesai = true
      clearTimeout(timer)
      resolve({ code, stderr })
    })
  })
}

/* ffmpeg tanpa output selalu keluar non-zero; informasinya ada di stderr. */
async function probe(bin, file) {
  const { stderr } = await jalankan(bin, ['-hide_banner', '-i', file], 30_000)
  const baris = stderr.split('\n')
  const vLine = baris.find((l) => /Stream #\d+:\d+.*Video:/.test(l) && !/attached pic/i.test(l)) || ''
  const aLine = baris.find((l) => /Stream #\d+:\d+.*Audio:/.test(l)) || ''
  const durasi = stderr.match(/Duration:\s*(\d+):(\d{2}):(\d{2})/)
  return {
    width: Number(vLine.match(/(\d{2,5})x(\d{2,5})/)?.[1]) || 0,
    height: Number(vLine.match(/(\d{2,5})x(\d{2,5})/)?.[2]) || 0,
    fps:
      Number(vLine.match(/([\d.]+)\s*fps/)?.[1] || vLine.match(/([\d.]+)\s*tbr/)?.[1] || 0) || 0,
    hasAudio: Boolean(aLine),
    seconds: durasi ? Number(durasi[1]) * 3600 + Number(durasi[2]) * 60 + Number(durasi[3]) : 0,
  }
}

/* Rantai filter. Penajaman dan denoise itu berlawanan: denoise membuang
   grain tapi ikut menghapus detail, sharpen mengembalikan tepi tapi ikut
   mengangkat noise. Jadi urutan dan kadarnya diukur dulu pada sumber
   buram + ber-noise (640×360 → 2560×1440) dengan dua metrik:
     ketajaman = stddev Laplacian (energi tepi)
     noise     = stddev di patch 32×32 paling datar, antar 3 frame
   (semua diukur pada resolusi sama, 640×360 — kalau diukur pada
   resolusi berbeda angkanya tidak bisa dibandingkan)

     sumber              tajam 50,4  noise 10,88
     denoise saja (lama)  tajam 10,0  noise  3,19
     + sharpen ringan     tajam 14,5  noise  5,01
     + denoise berat      tajam 13,5  noise  4,02   <- dipakai: paling seimbang
     chroma-saja          tajam 16,6  noise  6,18   <- gaya "jelas", paling tajam

   Default memakai denoise luma+chroma yang cukup berat DI AWAL, baru dua
   tahap sharpen (radius 5 untuk tepi besar, radius 3 untuk detail halus),
   ditutup denoise ringan supaya hasil sharpen tidak membawa grain kembali.
   Chroma tetap 0 di kedua tahap unsharp: kalau kromanya ikut ditajamkan,
   tepi warna berkedip kemerahan dan justru terlihat kasar. */
function rantaiFilter(info, ukuran, gaya) {
  const awal = gaya === 'maks' ? 'hqdn3d=2:6:5:10' : 'hqdn3d=6:4:10:7'
  const bagian = [awal]

  if (ukuran.width > info.width) {
    bagian.push(`scale=${ukuran.width}:${ukuran.height}:flags=lanczos`)
    /* SATU tahap unsharp saja, dengan amount kecil. Versi lama memakai
       dua tahap (5:5:1.2 lalu 3:3:0.5) ditambah eq contrast — hasilnya
       video "patah": di setiap tepi muncul cincin putih atau pelangi
       (halo). Penyebabnya bukan noise, tapi overshoot yang menumpuk.
       Tiap tahap unsharp menambahkan Leuwiang (ringan) di sisi terang dan gelap
       tepi, jadi dua tahap dengan amount besar saling menambah.
       Diuji pada 1440×1440: 1.2 + 0.5 + eq = halo jelas, 0.4 = bersih,
       bahkan 1.0 sendirian masih aman. eq ikut dibuang karena
       menaikkan kontras justru memperbesar halo, bukan Cetak detail. */
    bagian.push(`unsharp=5:5:${gaya === 'maks' ? 1.0 : 0.4}:5:5:0.0`)
  } else if (gaya === 'maks') {
    bagian.push('unsharp=5:5:0.5:5:5:0.0')
  }
  if (info.fps > 30.5) bagian.push('fps=30')
  bagian.push(gaya === 'maks' ? 'hqdn3d=2:4:5:10' : 'hqdn3d=3:3:5:7')
  return bagian.join(',')
}
/* ── Inti: bersihkan + perbesar dalam satu proses ffmpeg ───────────────── */
/* Bitrate ikut naik bersama jumlah piksel: 1440p dengan 2200k jelas
   pecah. Video persegi 1920x1920 = 3,7 MP dapat bitrate yang sama
   dengan 2560x1440 karena sama-sama 3,7 MP. */
function bitrateUntuk(ukuran) {
  const mp = megapiksel(ukuran)
  if (mp >= 6) return '9000k'
  if (mp >= 3) return '6000k'
  if (mp >= 1.5) return '3600k'
  return '2200k'
}

async function prosesHd(bin, fileIn, fileOut, info, ukuran, gaya, timeout) {
  const maks = bitrateUntuk(ukuran)
  const args = [
    '-hide_banner',
    '-y',
    '-i',
    fileIn,
    '-vf',
    rantaiFilter(info, ukuran, gaya),
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    // Batasi bitrate supaya hasilnya muat dikirim lewat WhatsApp.
    '-maxrate',
    maks,
    '-bufsize',
    `${parseInt(maks, 10) * 2}k`,
    '-pix_fmt',
    'yuv420p',
  ]
  if (info.hasAudio) args.push('-c:a', 'aac', '-b:a', '128k')
  else args.push('-an')
  args.push('-movflags', '+faststart', fileOut)

  const { code, stderr } = await jalankan(bin, args, timeout)
  if (code !== 0) {
    const baris = (stderr.split('\n').filter((l) => /Error|error/.test(l)).pop() || '').trim()
    throw new Error(`ffmpeg gagal: ${baris.slice(0, 140) || `kode ${code}`}`)
  }
  return readFile(fileOut)
}

/* ── HANDLER ────────────────────────────────────────────────────────────── */
const handler = async (m, { conn, rawConn }) => {
  const arg = String(m.text || '').trim().toLowerCase()
  /* "jelas" boleh muncul sendiri atau digabung dengan target lain
     ("jelas", "jelas 1080p", "1080p jelas"). Sisa kata dibaca sebagai
     target resolusi. */
  const gaya = /\b(jelas|max|sharp|ketajaman)\b/.test(arg) ? 'maks' : 'seimbang'
  const target = petaTarget(arg.replace(/\b(jelas|max|sharp|ketajaman)\b/g, '').trim())

  if (target === undefined) {
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      {
        text:
          `❌ Opsi "${arg}" tidak dikenal.\n\n` +
          `Pakai: ${'.'}hdvid [jelas] [1080p | 720p | 2x | 3x | clean]`,
      },
      { quoted: m.raw },
    )
  }

  const src = ambilVideo(m)
  if (!src) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: panduan(m.command ? '.' : '.') }, { quoted: m.raw })
  }

  const bin = await getFfmpegBinPath()
  if (!bin) {
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      { text: '❌ ffmpeg tidak tersedia di server ini, fitur tidak bisa jalan.' },
      { quoted: m.raw },
    )
  }

  let folder = ''
  try {
    await react(conn, m, '⏳')
    await m.reply('⏳ Mengunduh video...')

    const buffer = await downloadMediaMessage(
      { key: src.key, message: { [src.type]: src.node } },
      'buffer',
      {},
      { logger, reuploadRequest: rawConn?.updateMediaMessage },
    )
    if (!buffer?.length) throw new Error('Media gagal diunduh, kirim ulang videonya.')

    folder = await mkdtemp(path.join(os.tmpdir(), 'nano-hdvid-'))
    const fileAsli = path.join(folder, 'asal.mp4')
    const fileHasil = path.join(folder, 'hasil.mp4')
    await writeFile(fileAsli, buffer)

    const info = await probe(bin, fileAsli)
    if (!info.width) throw new Error('File ini rupanya bukan video yang bisa dibaca.')

    if (buffer.length > MAKS_MB * 1024 * 1024) {
      throw new Error(`Video ${ukuranBytes(buffer.length)} terlalu besar (maks ${MAKS_MB} MB).`)
    }

    const ukuran = pilihUkuran(info, targetKeTinggi(info, target))

    const detik = info.seconds ? ` • ${Math.round(info.seconds)} dtk` : ''
    const ke = ukuran.width ? `${ukuran.width}×${ukuran.height}` : `${info.width}×${info.height}`
    const perkiraan = estimasiDetik(info.seconds, ukuran)
    const lambat = perkiraan > 90
    await conn.sendMessage(
      m.chat,
      {
        text:
          `📥 ${ukuranBytes(buffer.length)} • ${info.width}×${info.height}${detik}\n` +
          `🎬 Proses ±${perkiraan} detik → ${ke} (bersih + tajam)` +
          (lambat ? '\n⏳ Video ini panjang, prosesnya memang lama. Bot akan mengabar progres tiap menit — jangan tutup ya.' : ''),
      },
      { quoted: m.raw },
    )

    const mulai = Date.now()
    const stop = laporanProses(conn, m, perkiraan, ke, mulai)
    let bersih
    try {
      bersih = await prosesHd(bin, fileAsli, fileHasil, info, ukuran, gaya, timeoutUntuk(perkiraan))
    } finally {
      stop()
    }
    const sesudah = await probe(bin, fileHasil)

    const baris = [
      '✅ *Video sudah bersih & HD*',
      `📐 Resolusi: ${info.width}×${info.height} → ${sesudah.width}×${sesudah.height}`,
      ukuran.width > info.width ? '✨ Dibersihkan + ditajamkan + diperbesar (Lanczos)' : '✨ Dibersihkan + ditajamkan (resolusi tetap)',
      `🎚️ Ukuran: ${ukuranBytes(bersih.length)}`,
    ]

    await conn.sendMessage(
      m.chat,
      {
        video: bersih,
        mimetype: 'video/mp4',
        caption: baris.join('\n'),
        jpegThumbnail: src.node.jpegThumbnail || undefined,
      },
      { quoted: m.raw },
    )
    await react(conn, m, '✅')
    m.limit?.success()
  } catch (err) {
    console.error('[HDVID]', err)
    await react(conn, m, '❌')
    await conn.sendMessage(
      m.chat,
      { text: `❌ Gagal membersihkan video.\n\n${err?.message || err}` },
      { quoted: m.raw },
    )
    m.limit?.fail()
  } finally {
    if (folder) await rm(folder, { recursive: true, force: true }).catch(() => {})
  }
}

handler.command = /^(hdvid|hdclean|jernihvid|hdfix)$/i
handler.help = ['hdvid']
handler.usage = ['hdvid [jelas] [1080p|720p|4k|2x|3x|clean]']
handler.tags = ['tools']
handler.description =
  'Bersihkan video buram + bersuara lalu naikkan ke HD (server-side, tanpa upload)'
handler.limitCommit = 'manual'

/* Ingat video terakhir supaya ".hdvid" tanpa reply tetap bisa jalan.
   Selalu return false — pesan ini tidak pernah dimakan. */
handler.before = async function (conn, raw, { chat, sender, isSelf }) {
  if (!isSelf) ingatVideo(raw, sender)
  return false
}

export default handler