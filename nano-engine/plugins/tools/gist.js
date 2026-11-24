/*
⌬ Nano Ai · Mesin fitur scrape
  Satu mesin untuk SEMUA fitur hasil scrape (command dibangun otomatis dari
  lib/gist/manifest.json, slug → cmd). Contoh: .qrcodetext <teks> ·
  .npmsearch <query> · .8upload (reply media).

  Alur: command → ambil input (teks / media dari reply) → jalankan snippet
  di proses terisolasi (lib/gist/jalankan.mjs) → kirim hasil (file/URL/teks).

  Berkas ini mengekspor BANYAK handler: satu untuk tiap kategori menu, supaya
  fitur download duduk di menu DOWNLOAD, pembuat stiker di menu STICKER, dan
  seterusnya. Kategorinya ditentukan FUNGSI fitur — lib/gist/kategori.js.
*/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { jalankanSnippet, bacaKode } from '../../lib/gist/jalankan.mjs'
import { downloadMedia } from '../../lib/haidar.js'
import { createSticker } from '../sticker/sticker.js'
import { kategoriSlug, dilewati } from '../../lib/gist/kategori.js'

/* akses modul CJS untuk ffmpeg-installer */
import { createRequire as __gistReq } from 'node:module'
const requireCjs = __gistReq(import.meta.url)

/*
  Video mp4 → stiker WebP animasi (loop, tanpa audio).
  Tangga turun bertahap bila melebihi batas ukuran WhatsApp:
  fps ↓ dulu (jumlah frame = penyumbang terbesar), lalu resolusi & kualitas.
  Dengan ini video bratvid sepanjang apa pun tetap jadi STIKER animasi,
  bukan jatuh ke fallback video.
*/
function videoKeSticker(mp4Path, { durasiMaks = 0 } = {}) {
  const { path: ffmpegPath } = requireCjs('@ffmpeg-installer/ffmpeg')
  const { execFile } = requireCjs('node:child_process')
  const percobaan = [
    { fps: 12, scale: 512, quality: 75 },
    { fps: 10, scale: 512, quality: 70 },
    { fps: 8, scale: 480, quality: 65 },
    { fps: 6, scale: 448, quality: 60 },
    { fps: 5, scale: 400, quality: 55 },
    { fps: 4, scale: 352, quality: 50 },
    { fps: 3, scale: 320, quality: 45 },
    /* langkah pamungkas: pangkas durasi — dijamin muat walau videonya sangat panjang */
    { fps: 3, scale: 288, quality: 40, dur: 8 },
    { fps: 2, scale: 256, quality: 40, dur: 5 },
    { fps: 2, scale: 224, quality: 35, dur: 3 },
  ]
  return new Promise((resolve, reject) => {
    let i = 0
    const coba = () => {
      if (i >= percobaan.length) return reject(new Error('Stiker terlalu besar / gagal dikonversi'))
      const { fps, scale, quality, dur } = percobaan[i++]
      const out = `${mp4Path}-${Date.now()}-${i}.webp`
      const args = [
        '-y', '-i', mp4Path,
        ...(dur ? ['-t', String(dur)] : []),
        ...(durasiMaks ? ['-t', String(durasiMaks)] : []),
        '-vcodec', 'libwebp',
        '-filter:v', `fps=${fps},scale=${scale}:${scale}:force_original_aspect_ratio=decrease,pad=${scale}:${scale}:-1:-1:color=white@0.0,format=rgba`,
        '-loop', '0', '-an', '-vsync', '0', '-quality', String(quality),
        '-preset', 'default',
        out,
      ]
      execFile(ffmpegPath, args, { timeout: 120_000, maxBuffer: 16 * 1024 * 1024 }, (err) => {
        if (err) { try { fs.unlinkSync(out) } catch {} ; return coba() }
        try {
          const buf = fs.readFileSync(out)
          fs.unlinkSync(out)
          if (buf.length > 1_100_000) return coba()
          resolve(buf)
        } catch (e) { coba() }
      })
    }
    coba()
  })
}

const DIR = path.dirname(fileURLToPath(import.meta.url))
const MANIFEST = JSON.parse(fs.readFileSync(path.join(DIR, '../../lib/gist/manifest.json'), 'utf8'))
const BY_CMD = new Map(MANIFEST.map((x) => [x.cmd, x]))

/* snippet berat → timeout lebih panjang */
const TIMEOUT_BERAT = new Set([
  'ocr', 'audio2txt', 'vocal-remover', 'upscale-video', 'wink-upscale-video',
  'iloveimg-compressor', 'krakenfiles', 'wink-hd-image', 'upscale-cloudinary',
  'murotal-quran', 'edge-tts', 'google-tts', 'pinvid-dl', 'pinvid-dl2',
])

const MAX_PARALEL = 3
let aktif = 0

const MIME_EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav',
}

function extDariMime(mimetype, fileName = '') {
  const byMime = MIME_EXT[String(mimetype || '').toLowerCase()]
  if (byMime) return byMime
  const m = String(fileName || '').match(/\.([a-z0-9]{2,5})$/i)
  return m ? m[1].toLowerCase() : 'bin'
}

/* node media dari pesan sekarang atau pesan yang di-reply */
function cariNodeMedia(m) {
  const daftar = [m?.quotedMessage?.message, m?.currentMessage]
  for (const msg of daftar) {
    if (!msg) continue
    for (const tipe of ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage']) {
      if (msg[tipe]) return { tipe, node: msg[tipe], key: m?.quotedMessage?.key || m?.raw?.key }
    }
  }
  return null
}

function ambilTeksQuoted(m) {
  const q = m?.quotedMessage?.message
  if (!q) return ''
  return (
    q.conversation ||
    q.extendedTextMessage?.text ||
    q.imageMessage?.caption ||
    q.videoMessage?.caption ||
    q.documentMessage?.caption ||
    ''
  ).trim()
}

function kindFile(namaFile) {
  const ext = path.extname(namaFile).toLowerCase()
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) return 'image'
  if (['.mp3', '.m4a', '.wav', '.ogg'].includes(ext)) return 'audio'
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video'
  return 'document'
}

function kontenFile(namaFile) {
  const kind = kindFile(namaFile)
  const buf = fs.readFileSync(namaFile)
  const ext = path.extname(namaFile).replace('.', '')
  if (kind === 'image') return { image: buf, mimetype: `image/${ext === 'jpg' ? 'jpeg' : ext}` }
  if (kind === 'audio') return { audio: buf, mimetype: 'audio/mpeg' }
  if (kind === 'video') return { video: buf, mimetype: 'video/mp4' }
  return { document: buf, filename: path.basename(namaFile), mimetype: ext === 'pdf' ? 'application/pdf' : 'application/octet-stream' }
}

async function kirimUrls(conn, m, urls) {
  let terkirim = 0
  for (const url of urls.slice(0, 4)) {
    try {
      const { buffer, contentType } = await downloadMedia(url, { timeout: 60_000, maxBytes: 60 * 1024 * 1024 })
      if (!buffer?.length) continue
      const ext = extDariMime(contentType, url)
      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
        await conn.sendMessage(m.chat, { image: buffer, mimetype: `image/${ext === 'jpg' ? 'jpeg' : ext}` }, { quoted: m.raw })
      } else if (['mp3', 'm4a', 'wav', 'ogg'].includes(ext)) {
        await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m.raw })
      } else if (['mp4', 'webm', 'mov'].includes(ext)) {
        await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4' }, { quoted: m.raw })
      } else {
        await conn.sendMessage(m.chat, { document: buffer, filename: `hasil-${Date.now()}.${ext}` }, { quoted: m.raw })
      }
      terkirim++
    } catch {}
  }
  return terkirim
}

function ringkasStdout(stdout) {
  let teks = stdout.trim()
  /* payload JSON → rapihkan */
  try {
    const j = JSON.parse(teks)
    teks = JSON.stringify(j, null, 2)
  } catch {}
  if (teks.length > 3800) teks = teks.slice(0, 3800) + '\n…'
  return teks
}

async function eksekusiGist(m, { conn, rawConn, settings }) {
  const entry = BY_CMD.get(m.command)
  if (!entry) return

  if (aktif >= MAX_PARALEL) {
    return conn.sendMessage(m.chat, { text: '⏳ Proses lain masih berjalan, tunggu sebentar lalu coba lagi.' }, { quoted: m.raw })
  }

  const react = (e) => { try { void rawConn.sendMessage(m.chat, { react: { text: e, key: m.raw?.key } }) } catch {} }
  react('⏳')
  aktif++

  let file = ''
  let fileSementara = ''
  try {
    /* 1. kumpulkan input */
    /* teks user = args TANPA nama command (jangan ikutkan .bratvid dll) */
    const teksUser = [...(m.args || [])].join(' ').trim().slice(0, 2000)
    const nodeMedia = entry.media ? cariNodeMedia(m) : null

    if (nodeMedia) {
      const buffer = await downloadMediaMessage(
        { key: nodeMedia.key, message: { [nodeMedia.tipe]: nodeMedia.node } },
        'buffer',
        {},
        { logger: rawConn?.logger, reuploadRequest: rawConn?.updateMediaMessage }
      )
      if (buffer?.length) {
        const ext = extDariMime(nodeMedia.node.mimetype, nodeMedia.node.fileName)
        fileSementara = path.join(DIR, '../../tmp', `gist-in-${Date.now()}-${m.command}.${ext}`)
        fs.mkdirSync(path.dirname(fileSementara), { recursive: true })
        fs.writeFileSync(fileSementara, buffer)
        file = fileSementara
      }
    }

    const teks = teksUser || ambilTeksQuoted(m)
    const butuhFile = Boolean(entry.media)
    /* snippet butuh teks bila punya konstanta TEXT/QUERY/INPUT-teks di kodenya */
    let butuhTeks = false
    if (!butuhFile) {
      try {
        const kode = bacaKode(entry.slug)
        if (/^const (TEXT|PROMPT|TEKS|QUERY|QUERY_1|USERNAME|NICKNAME|URL|TARGET|LINK|q)\s*=\s*['"][^'"]+['"]/m.test(kode)) {
          butuhTeks = true
        } else if (/^const INPUT\s*=\s*(['"])([^'"/]*)\1/m.test(kode)) {
          const nilai = kode.match(/^const INPUT\s*=\s*(['"])([^'"/]*)\1/m)[2]
          butuhTeks = nilai.trim().length > 0 && !/\.(png|jpe?g|webp|mp3|mp4|pdf)$/i.test(nilai)
        } else if (!/^const (INPUT|TEXT|QUERY)/m.test(kode) && /process\.argv/.test(kode)) {
          butuhTeks = true
        }
      } catch {}
    }

    if (butuhFile && !file) {
      react('ℹ️')
      return conn.sendMessage(
        m.chat,
        { text: `Kirim/reply *foto/video/audio* dengan caption atau balasan:\n.${entry.cmd}` },
        { quoted: m.raw }
      )
    }
    if (butuhTeks && !teks) {
      react('ℹ️')
      return conn.sendMessage(m.chat, { text: `Contoh pakai:\n.${entry.cmd} <teks/query>` }, { quoted: m.raw })
    }

    /* 2. jalankan snippet terisolasi */
    const timeoutMs = TIMEOUT_BERAT.has(entry.slug) ? 240_000 : 120_000
    const hasil = await jalankanSnippet(entry.slug, { teks, file, timeoutMs })
    console.log(`[GIST] ${entry.slug} → status=${hasil.status} files=${hasil.files.length} urls=${hasil.urls.length}${hasil.catatan ? ' catatan=' + String(hasil.catatan).slice(0, 120) : ''}`)

    /* 3. kirim hasil */
    let ada = false

    /* stiker: bisa jadi snippet menulis bg+hasil — ambil file TERBARU saja */
    let files = hasil.files
    if (entry.sticker && files.length > 1) {
      files = [...files].sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs).slice(0, 1)
    }

    for (const namaFile of files.slice(0, 3)) {
      try {
        /* snippet stiker → mp4 WAJIB jadi stiker WebP ANIMASI — tidak pernah
           boleh jatuh ke fallback kirim video (tangga turun dijamin muat) */
        if (entry.sticker && /\.mp4$/i.test(namaFile)) {
          let webp
          try {
            webp = await videoKeSticker(namaFile)
          } catch {
            /* langkah pamungkas: pangkas ke 5 detik — dijamin lolos batas ukuran */
            webp = await videoKeSticker(namaFile, { durasiMaks: 5 })
          }
          await conn.sendMessage(m.chat, { sticker: webp, mimetype: 'image/webp', animated: true }, { quoted: m.raw })
          ada = true
          continue
        }
        /* snippet stiker → png/jpg jadi stiker WebP STATIS (exif pack bot) */
        if (entry.sticker && /\.(png|jpe?g|webp)$/i.test(namaFile)) {
          const buf = fs.readFileSync(namaFile)
          const packName = String(settings?.sticker?.pack || settings?.botName || 'Nano Ai').trim() || 'Nano Ai'
          const author = String(settings?.sticker?.author || settings?.ownerName || 'Nano Ai').trim() || 'Nano Ai'
          const webp = await createSticker(buf, packName, author)
          await conn.sendMessage(m.chat, { sticker: webp, mimetype: 'image/webp' }, { quoted: m.raw })
          ada = true
          continue
        }
        await conn.sendMessage(m.chat, kontenFile(namaFile), { quoted: m.raw })
        ada = true
      } catch {
        /* fallback HANYA untuk gambar (foto biasa) — untuk snippet stiker dengan
           mp4, fallback video dinonaktifkan agar hasil selalu stiker animasi */
        try {
          if (/\.(png|jpe?g|webp)$/i.test(namaFile)) {
            await conn.sendMessage(m.chat, kontenFile(namaFile), { quoted: m.raw })
            ada = true
          }
        } catch {}
      }
    }

    if (hasil.urls.length) {
      const n = await kirimUrls(conn, m, hasil.urls)
      if (n > 0) ada = true
      /* URL non-media yang tersisa → teks */
      const lain = hasil.urls.filter((u) => !/\.(mp4|mp3|m4a|png|jpe?g|webp|gif|pdf|webm|wav)/i.test(u))
      if (lain.length) {
        await conn.sendMessage(m.chat, { text: lain.slice(0, 3).join('\n') }, { quoted: m.raw })
        ada = true
      }
    }

    if (!ada && hasil.stdout.trim()) {
      await conn.sendMessage(m.chat, { text: ringkasStdout(hasil.stdout) }, { quoted: m.raw })
      ada = true
    }

    if (!ada) {
      const catatan = hasil.catatan || 'tidak ada hasil dari layanan'
      await conn.sendMessage(m.chat, { text: `⚠️ Gagal: ${catatan}` }, { quoted: m.raw })
    }

    react(hasil.ok || ada ? '✅' : '❌')
  } catch (err) {
    react('❌')
    console.log(`[GIST] ${entry?.slug || '?'} ERROR: ${String(err?.message || err).slice(0, 200)}`)
    try {
      await conn.sendMessage(m.chat, { text: `⚠️ Error: ${String(err?.message || err).slice(0, 200)}` }, { quoted: m.raw })
    } catch {}
  } finally {
    aktif--
    if (fileSementara) { try { fs.unlinkSync(fileSementara) } catch {} }
  }
}

const escapeCmdRe = (teks) => String(teks).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/*
  Satu handler per kategori menu. Semuanya memakai mesin yang sama
  (eksekusiGist) — yang berbeda hanya daftar perintah, kategori, dan label
  di menu, sehingga fitur download selalu muncul di menu DOWNLOAD.
*/
function buatHandler(entries) {
  const names = entries.map((x) => x.cmd)
  const kategori = kategoriSlug(entries[0].slug)

  const plugin = async (m, context) => eksekusiGist(m, context)

  plugin.command = new RegExp(`^(${names.map(escapeCmdRe).join('|')})$`, 'i')
  plugin.help = names
  plugin.menuHelp = names
  plugin.tags = [kategori]
  plugin.category = kategori
  plugin.description = `${names.length} fitur ${kategori} — ketik .gist untuk daftar lengkap`
  /*
    Sengaja TIDAK memasang `limit` sendiri, supaya aturan limit bot yang
    berlaku: kategori download/search/ai ikut memakai limit persis seperti
    fitur sejenis dari penyedia lain, sedangkan kategori lain tetap gratis.
  */
  plugin.accessModeControl = true

  return plugin
}

const GRUP = new Map()
for (const entry of MANIFEST) {
  if (dilewati(entry.cmd)) continue
  const kategori = kategoriSlug(entry.slug)
  if (!GRUP.has(kategori)) GRUP.set(kategori, [])
  GRUP.get(kategori).push(entry)
}

const handlers = [...GRUP.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([, entries]) => buatHandler(entries))

export { eksekusiGist }
export default handlers
