/*
⌬
┇ ━━━[ 🎬 SW HD — NANO AI ]━━━━
┇
┇ Kirim ulang video/dokumen, lossless kalau memungkinkan:
┇   • MP4 yang sudah faststart   → diteruskan apa adanya (byte-identik)
┇   • Container lain / belum faststart → di-remux ke MP4 faststart
┇     TANPA re-encode: codec, resolusi, fps & bitrate 100% asli,
┇     yang dipindah hanya container/box-nya.
┇   • Video >50 MB / >30 fps → dikompres AGAR MUAT batas pesan
┇     video WhatsApp (±50 MB), RESOLUSI TETAP ASLI — 4K tetap 4K,
┇     tidak pernah di-downscale; fps maks 30. Hasilnya dikirim
┇     sebagai PESAN VIDEO, bukan dokumen.
┇   • Kalau server tetap menolak video (di luar kendali batas
┇     server) → hasil yang sama dikirim sebagai dokumen;
┇     kalau kompresi gagal → file asli.
┇   • Dokumen apa pun (pdf, zip, apk)  → diteruskan apa adanya
┇
┇ Cara pakai:
┇   • reply sebuah video/dokumen + ketik .swhd
┇   • atau kirim video/dokumen dengan caption .swhd
┇
┇ Opsi bisa diatur lewat settings.swhd di config/settings.js
⌬
*/

import pino from 'pino'
import { execFile, spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { settings } from '../../config/settings.js'
import { getFfmpegBinPath } from '../../lib/ytdlp.js'

const logger = pino({ level: 'silent' })

const SWHD = settings.swhd || {}
const BRAND = SWHD.brand || 'NANO SW HD V8'

// Batas waktu remux (copy codec — tidak ada encode, jadi relatif cepat).
const REMUX_TIMEOUT = (Number(SWHD.remuxTimeout) || 120) * 1000

const isVideoMime = (mime) => String(mime || '').toLowerCase().startsWith('video/')

/*
 * Plafon frame rate saat video DIKIRIM lewat WhatsApp.
 *
 * WhatsApp selalu transcode ulang video yang dikirim, dan plafonnya 30 fps.
 * Video sumber 60 fps yang dikirim apa adanya justru frame-nya DIBUANG oleh
 * WhatsApp secara sembrono di tengah jalan → playback "patah-patah" di
 * penerima. Pemilihan frame yang berantakan ini juga terjadi pada sumber
 * VFR (screen recording / kamera adaptif), yang rata-ratanya terbaca ≤30 tapi
 * jarak antar-frame-nya tidak beraturan.
 *
 * Jadi "tanpa re-encode, fps asli" ternyata menjamin hal yang TIDAK bisa
 * dijamin: yang menentukan akhir adalah WhatsApp sendiri. Langkah yang benar
 * adalah membuang frame lebih dahulu dengan pemilihan merata (filter `fps`),
 * karena frame yang dibuang di server kita teratur dan tidak terlihat —
 * jauh lebih halus daripada frame yang dibuang acak saat transcode WA.
 *
 * Resep di bawah sengaja sama dengan plugins/download/pindl.js yang sudah
 * terbukti: fps 30, H.264, yuv420p, dimensi genap, faststart.
 */
const FPS_TARGET = 30

/* Batas media WhatsApp untuk pesan video ±50 MB. Jika hasil kompresi masih
 * di atas batas ini, server akan menolak pesan video — jadi ukuran hasil
 * HARUS berada di bawahnya supaya benar-benar terkirim sebagai video. */
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

/* Target aman: sisakan ±4% untuk overhead container/metadata supaya file
 * tidak mepet ke 50 MB dan ditolak server. */
const TARGET_VIDEO_BYTES = Math.floor(MAX_VIDEO_BYTES * 0.96)

/* Batas atas ukuran hasil: minimal 25% lebih kecil dari sumber
 * (0.75 = 75% ukuran asli) DAN wajib muat batas video WhatsApp.
 * Resolusi tidak pernah diturunkan — video 4K tetap 4K. */
const KOMPRES_RASIO = Number(SWHD.kompresRasio) > 0 && Number(SWHD.kompresRasio) < 1
  ? Number(SWHD.kompresRasio)
  : 0.75

const hasContent = (node) => !!node && typeof node === 'object' && Object.keys(node).length > 0

// Video = videoMessage biasa, atau dokumen ber-mimetype video (.mov dll).
// Selain itu dianggap dokumen biasa (pdf, zip, audio, dll).
function classify(type, node) {
  if (!hasContent(node)) return null
  if (type === 'videoMessage') return 'video'
  if (type === 'documentMessage') return isVideoMime(node.mimetype) ? 'video' : 'document'
  return null
}

// Buka pesan yang dibungkus (viewOnce / ephemeral / documentWithCaption)
function unwrap(message) {
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

function pickFrom(container, key) {
  if (!container) return null
  const inner = unwrap(container)
  for (const type of ['videoMessage', 'documentMessage']) {
    const node = inner[type]
    if (!node) continue
    const kind = classify(type, node)
    if (kind) return { kind, type, node, key }
  }
  return null
}

// Cari media: dari pesan sendiri (caption .swhd) atau dari pesan yang di-reply
function pickMedia(m) {
  return (
    pickFrom(m.currentMessage, m.raw?.key) ||
    pickFrom(m.quotedMessage?.message, m.quotedMessage?.key) ||
    null
  )
}

// Durasi: metadata pesan → box 'mvhd' (mp4/mov/m4v) → header EBML (mkv/webm)
function mp4Duration(buffer) {
  const idx = buffer.indexOf('mvhd')
  if (idx === -1) return 0
  try {
    const version = buffer[idx + 4]
    const timescale = version === 1 ? buffer.readUInt32BE(idx + 24) : buffer.readUInt32BE(idx + 16)
    const duration = version === 1
      ? Number(buffer.readBigUInt64BE(idx + 28))
      : buffer.readUInt32BE(idx + 20)
    return timescale > 0 && duration > 0 ? Math.round(duration / timescale) : 0
  } catch {
    return 0
  }
}

// Sederhana: baca elemen Info/Duration (0x4489) di container Matroska/WebM
function webmDuration(buffer) {
  if (buffer.length < 4 || buffer.readUInt32BE(0) !== 0x1a45dfa3) return 0
  try {
    const idx = buffer.indexOf(Buffer.from([0x44, 0x89]))
    if (idx === -1) return 0
    const size = buffer[idx + 2]
    if (size === 4) return Math.round(buffer.readFloatBE(idx + 3))
    if (size === 8) return Math.round(buffer.readDoubleBE(idx + 3))
    return 0
  } catch {
    return 0
  }
}

function mediaDuration(buffer) {
  const mp4 = mp4Duration(buffer)
  return mp4 > 0 ? mp4 : webmDuration(buffer)
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '0 B'
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`
  if (value >= 1024) return `${(value / 1024).toFixed(2)} KB`
  return `${value} B`
}

// ── FFmpeg: probe & remux ────────────────────────────────────────────────

// Probe codec memakai binary ffmpeg (bukan ffprobe, yang tidak tersedia):
// jalankan `ffmpeg -i file` lalu parse stderr-nya.
// ffmpeg selalu exit non-zero untuk mode ini — info justru ada di stderr.
function probeVideo(bin, filePath) {
  return new Promise((resolve) => {
    execFile(
      bin,
      ['-hide_banner', '-i', filePath],
      { timeout: 20_000, maxBuffer: 4 * 1024 * 1024, windowsHide: true },
      (_err, _stdout, stderr) => {
        const out = String(stderr || '')
        if (!out) return resolve(null)

        const durasi = out.match(/Duration:\s*(\d+):(\d{2}):(\d{2}(?:\.\d+)?)/)
        const duration = durasi
          ? Number(durasi[1]) * 3600 + Number(durasi[2]) * 60 + Number(durasi[3])
          : 0

        const bersih = (s) => String(s || '').replace(/\(.*?\)/g, '').trim().toLowerCase()
        const lines = out.split('\n').filter((l) => /Stream #\d+:\d+/.test(l))
        const vLine = lines.find((l) => /Video:/.test(l) && !/attached pic/i.test(l)) || ''
        const aLine = lines.find((l) => /Audio:/.test(l)) || ''

        // "Video: h264 (High), yuv420p(tv, bt709), 1280x720 ..."
        const bagian = vLine.split(/Video:/)[1]?.split(',') || []
        const ukuran = vLine.match(/(\d{2,5})x(\d{2,5})/)

        // Frame rate sumber, mis. "30 fps" / "59.94 fps" (fallback ke tbr).
        const fpsRaw = Number(vLine.match(/(\d+(?:\.\d+)?)\s*fps/)?.[1]
          || vLine.match(/(\d+(?:\.\d+)?)\s*tbr/)?.[1] || 0)
        const fps = fpsRaw > 0 && fpsRaw <= 240 ? Math.round(fpsRaw * 100) / 100 : 0

        resolve({
          videoCodec: bagian.length ? bersih(bagian[0]) : '',
          pixFmt: bagian.length > 1 ? bersih(bagian[1]) : '',
          audioCodec: aLine ? bersih(aLine.split(/Audio:/)[1]?.split(',')[0]) : '',
          width: Number(ukuran?.[1]) || 0,
          height: Number(ukuran?.[2]) || 0,
          fps,
          duration,
          hasAudio: !!aLine,
        })
      }
    )
  })
}

const MIME_EXT = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'video/webm': 'webm',
  'video/3gpp': '3gp',
  'video/3gpp2': '3g2',
  'video/x-msvideo': 'avi',
  'video/mpeg': 'mpeg',
  'video/mp2t': 'ts',
}

function guessExt(node) {
  const fromName = String(node.fileName || '').match(/\.([a-z0-9]{2,5})$/i)
  if (fromName) return fromName[1].toLowerCase()
  return MIME_EXT[String(node.mimetype || '').toLowerCase()] || 'mp4'
}

function isMp4Container(buffer) {
  return buffer.length > 11 && buffer.readUInt32BE(4) === 0x66747970 // 'ftyp'
}

// MP4 faststart = box 'moov' ada sebelum 'mdat' (bisa diputar saat mengalir)
function isFaststart(buffer) {
  const moov = buffer.indexOf('moov')
  if (moov === -1) return false
  const mdat = buffer.indexOf('mdat')
  if (mdat === -1) return true
  return moov < mdat
}

// Jalankan ffmpeg ke file output, dengan timeout & pesan galat terakhir.
function runFfmpeg(bin, args, timeoutMs) {
  return new Promise((resolve) => {
    let selesai = false
    let galat = ''
    const proc = spawn(bin, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
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
      selesaiDengan({ ok: false, error: 'FFmpeg timeout.' })
    }, timeoutMs)

    proc.stderr.on('data', (chunk) => {
      galat += chunk.toString()
      if (galat.length > 2000) galat = galat.slice(-2000)
    })
    proc.on('error', (error) => selesaiDengan({ ok: false, error: error.message }))
    proc.on('close', (code) =>
      code === 0
        ? selesaiDengan({ ok: true })
        : selesaiDengan({ ok: false, error: galat.trim().split('\n').pop() || `FFmpeg keluar (${code})` })
    )
  })
}

async function makeThumbnail(bin, input, outPath, probe) {
  const at = probe?.duration > 2 ? 1 : 0
  const hasil = await runFfmpeg(
    bin,
    ['-ss', String(at), '-i', input, '-map', '0:v:0', '-frames:v', '1', '-vf', 'scale=320:-2', '-q:v', '3', outPath],
    20_000
  )
  if (!hasil.ok) return undefined
  const jpg = await readFile(outPath).catch(() => null)
  return jpg?.length ? jpg : undefined
}

/*
 * Hitung target ukuran & bitrate kompresi.
 *
 * Prioritas:
 *   1. HASIL HARUS MUAT batas pesan video WhatsApp (±50 MB) agar terkirim
 *      sebagai video, bukan dokumen.
 *   2. Ukuran tetap turun minimal seperti `kompresRasio` (default 25%).
 *   3. Resolusi TIDAK diturunkan — 4K tetap 4K. Yang dikorbankan hanya
 *      bitrate, karena resolusi + batas ukuran adalah dua hal yang saling
 *      bertentangan untuk video besar/panjang.
 *
 * Audio diturunkan lebih dulu (128 → 96 → 64 kbps) supaya porsi bitrate
 * video tetap sebesar mungkin; kualitas gambar lebih terasa daripada audio.
 */
function hitungTargetKompresi(probe, ukuranAsli) {
  const durasi = Math.max(1, Number(probe?.duration) || 0)
  const targetBytes = Math.min(
    Math.round(ukuranAsli * KOMPRES_RASIO),
    TARGET_VIDEO_BYTES
  )
  const totalKbps = (targetBytes * 8) / 1000 / durasi
  const audioKbps = probe?.hasAudio
    ? (totalKbps > 700 ? 128 : totalKbps > 350 ? 96 : 64)
    : 0
  return {
    targetBytes,
    videoKbps: Math.max(100, Math.floor(totalKbps - audioKbps)),
    audioKbps,
  }
}

function filterKompresi(fpsAsli) {
  // Resolusi TIDAK diturunkan: hanya dimensi ganjil yang dibulatkan ke genap
  // supaya H.264/yuv420p valid. 4K tetap 4K, 1440p tetap 1440p.
  const skala = 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
  return fpsAsli > FPS_TARGET + 0.5 ? `fps=${FPS_TARGET},${skala}` : skala
}

async function kompresVideo(bin, input, output, thumbPath, probe, ukuranAsli) {
  const fpsAsli = Number(probe?.fps) || 0
  const durasi = Number(probe?.duration) || 60
  const { targetBytes, audioKbps } = hitungTargetKompresi(probe, ukuranAsli)
  let videoKbps = Math.max(100, Math.floor((targetBytes * 8) / 1000 / Math.max(1, durasi) - audioKbps))

  /* Encode penuh (bukan copy) bisa beberapa kali durasi video di 2 vCPU.
   * Video 4K butuh ±4x lebih lama dari 1080p, jadi anggaran waktu ikut
   * dikalikan jumlah piksel (maks 30 menit). */
  const piksel = (Number(probe?.width) || 1920) * (Number(probe?.height) || 1080)
  const faktorPiksel = Math.max(1, piksel / (1920 * 1080))
  const timeout = Math.min(
    1_800_000,
    Math.max(300_000, Math.round(durasi * 12_000 * faktorPiksel))
  )

  /* Preset lebih rapat (medium) memberi kualitas lebih baik pada bitrate yang
   * sama — penting karena bitrate dipangkas agar muat batas video. Untuk
   * resolusi di atas 1080p tetap dipakai veryfast supaya tidak kehabisan
   * waktu encode di server 2 vCPU. */
  const preset = piksel > 1920 * 1080 ? 'veryfast' : 'medium'

  // Ukuran hasil WAJIB ≤ target (yang sudah di bawah 50 MB), bukan sekadar
  // "25% lebih kecil" — kalau lebih besar, server menolak pesan video.
  const batasAtas = targetBytes

  for (let percobaan = 1; percobaan <= 3; percobaan++) {
    const args = [
      '-i', input,
      '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', filterKompresi(fpsAsli),
      '-c:v', 'libx264',
      '-preset', preset,
      '-b:v', `${videoKbps}k`,
      '-maxrate', `${Math.round(videoKbps * 1.1)}k`,
      '-bufsize', `${videoKbps * 2}k`,
      '-pix_fmt', 'yuv420p',
    ]

    if (probe?.hasAudio) args.push('-c:a', 'aac', '-b:a', `${audioKbps}k`)
    else args.push('-an')
    args.push('-movflags', '+faststart', output)

    console.log(
      `[SWHD] kompres ${percobaan}: target ${formatBytes(targetBytes)} ` +
      `(${Math.round(KOMPRES_RASIO * 100)}% dari ${formatBytes(ukuranAsli)}, maks 50 MB) ` +
      `video ${videoKbps}k audio ${audioKbps}k preset ${preset}`
    )

    const hasil = await runFfmpeg(bin, args, timeout)
    if (!hasil.ok) {
      console.log('[SWHD] kompres gagal:', hasil.error)
      return hasil
    }

    const out = await readFile(output).catch(() => null)
    if (!out?.length) return { ok: false, error: 'Hasil kompresi kosong.' }

    const rasio = out.length / ukuranAsli
    console.log(
      `[SWHD] hasil kompresi: ${formatBytes(ukuranAsli)} → ${formatBytes(out.length)} ` +
      `(turun ${Math.round((1 - rasio) * 100)}%)`
    )

    if (out.length <= batasAtas) {
      return {
        ok: true,
        buffer: out,
        rasio,
        thumbnail: await makeThumbnail(bin, input, thumbPath, probe),
      }
    }

    /* Overshoot → koreksi bitrate proporsional terhadap kelebihan ukuran,
     * bukan sekadar -15%, supaya percobaan berikutnya langsung tepat sasaran. */
    const koreksi = (batasAtas / out.length) * 0.97
    videoKbps = Math.max(100, Math.floor(videoKbps * koreksi))
  }

  return { ok: false, error: 'Hasil kompresi belum muat batas video WhatsApp.' }
}

// Proses video:
//   • perlu kompresi (besar / >30 fps) → kompres SAMPAI MUAT batas video
//     WhatsApp (±50 MB) dengan resolusi asli, lalu dikirim sebagai pesan video.
//   • MP4 faststart             → diteruskan apa adanya (byte-identik)
//   • selain itu                → di-remux ke MP4 faststart (copy codec)
//   • remux gagal               → kirim media asli apa adanya
async function processVideo(buffer, { node, ffmpegBin }) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'swhd-'))
  try {
    const input = path.join(dir, `in.${guessExt(node)}`)
    const output = path.join(dir, 'out.mp4')
    const normOutput = path.join(dir, 'norm.mp4')
    const thumbPath = path.join(dir, 'thumb.jpg')
    await writeFile(input, buffer)

    const probe = await probeVideo(ffmpegBin, input)
    // Beberapa container tidak menyimpan durasi yang bisa dibaca `ffmpeg -i`;
    // metadata pesan WhatsApp (`seconds`) jadi cadangan agar video besar tetap
    // bisa dihitung bitrate-nya dan dikirim sebagai video, bukan dokumen.
    if (probe && !probe.duration && Number(node?.seconds) > 0) {
      probe.duration = Number(node.seconds)
    }
    // Resolusi sumber — dipakai di caption; encoding TIDAK menurunkan resolusi.
    const dimensi = { width: probe?.width || 0, height: probe?.height || 0 }

    // Tidak ada track video (mis. audio di file berekstensi video)
    // → biarkan handler mengirimnya sebagai dokumen.
    if (probe && !probe.videoCodec) return { buffer, notVideo: true }

    /*
     * Kompresi hanya dilakukan kalau memang perlu:
     *   • file > 50 MB (tidak akan diterima sebagai pesan video WhatsApp),
     *   • fps > 30 (WhatsApp membuang frame acak → patah-patah).
     * Resolusi TIDAK dijadikan alasan kompresi dan TIDAK pernah diturunkan:
     * video 4K tetap 4K. Kalau sudah memenuhi syarat, video dikirim apa
     * adanya / di-remux supaya kualitas 100% utuh.
     */
    const fpsAsli = probe?.fps || 0
    const terlaluBesar = buffer.length > MAX_VIDEO_BYTES
    const fpsTinggi = fpsAsli > FPS_TARGET + 0.5

    if (terlaluBesar || fpsTinggi) {
      if (!probe?.duration) {
        console.log('[SWHD] durasi tidak diketahui — tidak bisa menghitung bitrate kompresi')
        if (terlaluBesar) {
          return { buffer, mode: 'asli', oversized: true, duration: 0, thumbnail: node.jpegThumbnail || undefined, fpsAsli, ...dimensi }
        }
      } else {
        const hasil = await kompresVideo(ffmpegBin, input, normOutput, thumbPath, probe, buffer.length)
        if (hasil.ok) {
          return {
            buffer: hasil.buffer,
            mode: 'kompres',
            rasio: hasil.rasio,
            duration: probe.duration,
            thumbnail: hasil.thumbnail || node.jpegThumbnail || undefined,
            fpsAsli,
            ...dimensi,
          }
        }

        console.log('[SWHD] kompresi gagal:', hasil.error)
        // Kompresi gagal & file kebesaran → jangan kirim sebagai video (pasti ditolak).
        if (terlaluBesar) {
          return { buffer, mode: 'asli', oversized: true, duration: probe.duration, thumbnail: node.jpegThumbnail || undefined, fpsAsli, ...dimensi }
        }
        // Masih di bawah 50 MB → lanjut jalur lossless di bawah.
      }
    }

    // MP4 yang sudah faststart: kirim apa adanya, jangan disentuh sama sekali.
    if (isMp4Container(buffer) && isFaststart(buffer)) {
      return {
        buffer,
        mode: 'asli',
        duration: probe?.duration || 0,
        thumbnail: node.jpegThumbnail || undefined,
        fpsAsli,
        ...dimensi,
      }
    }

    // Remux: kemas ulang ke MP4 faststart TANPA re-encode (kualitas 100% asli).
    const remux = await runFfmpeg(ffmpegBin, [
      '-i', input,
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c', 'copy',
      '-movflags', '+faststart',
      output,
    ], REMUX_TIMEOUT)

    if (remux.ok) {
      const out = await readFile(output)
      if (out.length) {
        return {
          buffer: out,
          mode: 'remux',
          duration: probe?.duration || 0,
          thumbnail: await makeThumbnail(ffmpegBin, input, thumbPath, probe),
          fpsAsli,
          ...dimensi,
        }
      }
    }

    // Remux gagal (mis. codec tak bisa masuk MP4) → kirim media asli apa adanya.
    return {
      buffer,
      mode: 'asli',
      duration: probe?.duration || 0,
      thumbnail: node.jpegThumbnail || undefined,
      fpsAsli,
      ...dimensi,
    }
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

// ── Caption & UI ─────────────────────────────────────────────────────────

const EXTRA_LINE = {
  kompres: (fps, rasio) => {
    const persen = rasio > 0 ? Math.round((1 - rasio) * 100) : 25
    return `*Dikirim sebagai Video:* resolusi tetap asli (tidak di-downscale), ${fps > FPS_TARGET + 0.5 ? `${fps} → ${FPS_TARGET} fps, ` : ''}H.264 — ukuran turun ${persen}% agar muat batas video WhatsApp`
  },
  remux: () => '*Remux Lossless:* Codec, resolusi & fps 100% asli — container dirapikan ke MP4 faststart (tanpa re-encode)',
  asli: () => '*Lossless:* File MP4 sudah faststart, dikirim apa adanya tanpa diproses',
}

const labelResolusi = (width, height) => {
  if (!width || !height) return 'Asli'
  if (width >= 3840 || height >= 3840) return `${width}×${height} (4K)`
  if (width >= 2560 || height >= 2560) return `${width}×${height} (1440p)`
  if (width >= 1920 || height >= 1920) return `${width}×${height} (1080p)`
  return `${width}×${height}`
}

const buildCaption = ({ sender, size, seconds, mode = 'asli', fpsAsli = 0, rasio = 0, width = 0, height = 0 }) => `🔥 ❮ *${BRAND} SUKSES!* ❯
━━━━━━━━━━━━━━━━━━━━━
👤 *Pengirim    :* @${sender}
📊 *Sisa Limit  :* *∞ Unlimited*
📦 *Ukuran File :* *${size}*
⏱️ *Durasi      :* *${seconds > 0 ? `${seconds} Detik` : '-'}*
🎞️ *Resolusi    :* *${labelResolusi(width, height)}*
━━━━━━━━━━━━━━━━━━━━━
✨ *KEUNGGULAN:*
▸ *MP4 Faststart:* Langsung diputar tanpa buffering
▸ ${EXTRA_LINE[mode]?.(fpsAsli, rasio) || EXTRA_LINE.asli()}
${mode === 'kompres' && fpsAsli > FPS_TARGET + 0.5 ? `▸ *Sumber asli:* ${fpsAsli} fps — lebih tinggi dari plafon WA (30 fps)` : ''}
━━━━━━━━━━━━━━━━━━━━━
📖 *CARA PASANG KE STATUS WA:*
1. Tekan & tahan video ini di dalam grup.
2. Klik tombol *Teruskan (Forward)* di pojok atas.
3. Pilih *Status Saya* lalu kirim!`

const buildDocCaption = ({ sender, size, fileName }) => `🔥 ❮ *${BRAND} SUKSES!* ❯
━━━━━━━━━━━━━━━━━━━━━
👤 *Pengirim    :* @${sender}
📊 *Sisa Limit  :* *∞ Unlimited*
📦 *Ukuran File :* *${size}*
📄 *Nama File   :* *${fileName}*
━━━━━━━━━━━━━━━━━━━━━
✨ *KEUNGGULAN:*
▸ *Lossless:* File dikirim apa adanya, tanpa kompres
▸ *Universal Format:* Bisa dibuka di Android, iOS & PC`

const GUIDE = [
  '╭─〔 NANO • SW HD 〕',
  '│',
  '│ Reply sebuah video atau dokumen,',
  '│ lalu ketik .swhd',
  '│',
  '│ Support: mp4, mov, mkv, webm, 3gp,',
  '│ avi, dan dokumen lain (pdf, zip, apk)',
  '│',
  '│ Video di-remux ke MP4 faststart TANPA',
  '│ re-encode — resolusi, fps & kualitas',
  '│ tetap 100% asli, langsung bisa diputar.',
  '│',
  '│ Video >50 MB / >30 fps dikompres',
  '│ SECUKUPNYA agar muat batas pesan',
  '│ video WhatsApp (±50 MB).',
  '│ Resolusi TETAP ASLI (4K tetap 4K,',
  '│ tidak di-downscale). Yang diturunkan',
  '│ hanya bitrate supaya ukurannya kecil.',
  '│ Hasil SELALU dikirim sebagai VIDEO.',
  '│',
  '│ Catatan: video >30 fps diturunkan ke',
  '│ 30 fps, karena WhatsApp membuang frame',
  '│ acak saat transcode — hasilnya justru',
  '│ patah-patah. Video sangat panjang tetap',
  '│ video, tapi detail gambar bisa berkurang',
  '│ karena batas ukuran WhatsApp.',
  '│',
  '╰──────────────',
].join('\n')

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw?.key } })
  } catch { /* abaikan */ }
}

const handler = async (m, { conn, rawConn }) => {
  const src = pickMedia(m)

  if (!src) {
    await conn.sendMessage(m.chat, { text: GUIDE }, { quoted: m.raw })
    return
  }

  try {
    const buffer = await downloadMediaMessage(
      { key: src.key, message: { [src.type]: src.node } },
      'buffer',
      {},
      { logger, reuploadRequest: rawConn?.updateMediaMessage }
    )

    if (!buffer?.length) throw new Error('Media gagal diunduh, coba kirim ulang.')

    const sender = String(m.sender || '').split('@')[0]

    const kirimDokumen = async (mediaBuffer, catatan = '') => {
      const fileName = src.node.fileName
        || (src.kind === 'video' ? `video-${Date.now()}.${guessExt(src.node)}` : `file-${Date.now()}`)
      const caption = buildDocCaption({
        sender,
        size: formatBytes(mediaBuffer.length),
        fileName,
      }) + catatan

      await conn.sendMessage(
        m.chat,
        {
          document: mediaBuffer,
          mimetype: src.node.mimetype || 'application/octet-stream',
          fileName,
          caption,
          mentions: [m.sender],
          jpegThumbnail: src.node.jpegThumbnail || undefined,
        },
        { quoted: m.raw }
      )
    }

    if (src.kind === 'video') {
      let result = { buffer, mode: 'asli', duration: 0, thumbnail: src.node.jpegThumbnail || undefined }

      const ffmpegBin = await getFfmpegBinPath()
      if (ffmpegBin) {
        await react(conn, m, '⏳')
        try {
          result = await processVideo(buffer, { node: src.node, ffmpegBin })
        } catch { /* gagal proses → pakai media asli */ }
      }

      if (!result.notVideo && !result.oversized) {
        const seconds = Number(src.node.seconds) || result.duration || mediaDuration(result.buffer)
        const caption = buildCaption({
          sender,
          size: formatBytes(result.buffer.length),
          seconds,
          mode: result.mode,
          fpsAsli: result.fpsAsli || 0,
          rasio: result.rasio || 0,
          width: result.width || 0,
          height: result.height || 0,
        })

        console.log(
          `[SWHD] mencoba kirim video: mode=${result.mode} ` +
          `ukuran=${formatBytes(result.buffer.length)}`
        )
        try {
          await conn.sendMessage(
            m.chat,
            {
              video: result.buffer,
              mimetype: 'video/mp4',
              caption,
              mentions: [m.sender],
              jpegThumbnail: result.thumbnail || undefined,
            },
            { quoted: m.raw }
          )
          await react(conn, m, '✅')
          return
        } catch (kirimErr) {
          // Server menolak (mis. di luar batas yang bisa kami kendalikan) →
          // kirim hasil yang sama sebagai dokumen supaya file tetap sampai.
          console.log(`[SWHD] server menolak video: ${kirimErr?.message || kirimErr}`)
          await react(conn, m, '⚠️')
          const persen = Math.max(0, Math.round((1 - result.buffer.length / buffer.length) * 100))
          await kirimDokumen(result.buffer, [
            '',
            '━━━━━━━━━━━━━━━━━━━━━',
            '⚠️ *DIKIRIM SEBAGAI DOKUMEN*',
            `Server WhatsApp menolak pesan video *${formatBytes(result.buffer.length)}* — kemungkinan melebihi batas video (±50 MB).`,
            persen > 0
              ? `File sudah dikompres ${persen}% — unduh lalu putar seperti biasa.`
              : 'File dikirim apa adanya — unduh lalu putar seperti biasa.',
          ].join('\n'))
          return
        }
      }

      // Bukan video / kompresi gagal / masih terlalu besar → dokumen.
      const catatanBesar = result.oversized
        ? [
            '',
            '━━━━━━━━━━━━━━━━━━━━━',
            '⚠️ *DIKIRIM SEBAGAI DOKUMEN*',
            `Video *${formatBytes(buffer.length)}* gagal dikompres atau masih terlalu besar untuk pesan video.`,
            'File dikirim apa adanya — unduh lalu putar seperti biasa.',
          ].join('\n')
        : ''
      await kirimDokumen(buffer, catatanBesar)
      return
    }

    await kirimDokumen(buffer)
  } catch (err) {
    await react(conn, m, '❌')
    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 NANO • SW HD 〕',
          '│',
          `│ ❌ Gagal memproses media:`,
          `│ ${err?.message || err}`,
          '│',
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
  }
}

handler.command = /^swhd$/i
handler.help = ['swhd', 'hd', 'sw']
handler.description = 'Kirim ulang video/dokumen — hasil video SELALU dikirim sebagai pesan video, ukuran dikecilkan agar muat batas WA tanpa menurunkan resolusi'
handler.limit = false
handler.free = true

export {
  buildCaption,
  buildDocCaption,
  mp4Duration,
  webmDuration,
  mediaDuration,
  pickMedia,
  probeVideo,
  isFaststart,
  hitungTargetKompresi,
  kompresVideo,
  processVideo,
}
export default handler
