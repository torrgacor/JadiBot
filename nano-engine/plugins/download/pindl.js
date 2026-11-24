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

/* Pinterest video downloader — ssspin.io (ssspin.io/action/token → /action).
   vtoken dipakai sekali per permintaan; hasil di-scrape dari HTML:
   video src, link HD, cover, judul, author. Kandidat media diurutkan
   dari yang paling andal dan .m3u8 (HLS) dikecualikan — WhatsApp hanya
   menerima mp4. */

import axios from 'axios'
import * as cheerio from 'cheerio'
import formData from 'form-data'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { getFfmpegBinPath } from '../../lib/ytdlp.js'

const BASE = 'https://ssspin.io'
const TIMEOUT = 20_000
const UNDUH_TIMEOUT = 90_000
const MAKS_UNDUH = 100 * 1024 * 1024
const FPS_TARGET = 30
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'

const klien = axios.create({ timeout: TIMEOUT, headers: { 'user-agent': UA } })

function headerForm(form) {
  return {
    ...form.getHeaders(),
    origin: BASE,
    referer: `${BASE}/`,
    'user-agent': UA,
    'x-requested-with': 'XMLHttpRequest',
  }
}

/* DNS/resolver box ini sesekali gagal sesaat (ENOTFOUND/EAI_AGAIN) —
   ulangi sampai 3 kali dengan jeda sebelum menyerah. */
async function denganCoba(fn) {
  let galat
  for (let percobaan = 0; percobaan < 3; percobaan++) {
    try {
      return await fn()
    } catch (e) {
      galat = e
      const kode = `${e?.code || ''} ${e?.message || ''}`
      const sementara =
        /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EPIPE|socket hang up|Network Error/i.test(kode)
      if (!sementara || percobaan === 2) break
      await new Promise((r) => setTimeout(r, 1200 * (percobaan + 1)))
    }
  }
  throw galat
}

function jaringanGagal(error) {
  const kode = `${error?.code || ''} ${error?.message || ''}`
  return /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EPIPE|socket hang up|Network Error/i.test(kode)
}

async function ambilDataPinterest(url) {
  /* 1. token (minta vtoken sekali pakai) */
  const formToken = new formData()
  formToken.append('url', url)
  formToken.append('lang', 'id')

  const tokenRes = await denganCoba(() =>
    klien.post(`${BASE}/action/token`, formToken, { headers: headerForm(formToken) }),
  )
  if (!tokenRes.data?.success) {
    throw new Error('ssspin.io tidak memberi token — coba lagi nanti.')
  }
  const vtoken = tokenRes.data.vtoken

  /* 2. ambil hasil */
  const form = new formData()
  form.append('lang', 'id')
  form.append('url', url)
  form.append('vtoken', vtoken)

  const res = await denganCoba(() =>
    klien.post(`${BASE}/action`, form, { headers: headerForm(form) }),
  )
  const html = res.data?.html
  if (!html) throw new Error('Respons ssspin.io kosong — coba lagi nanti.')

  const $ = cheerio.load(html)
  const videoHDUrl = $('.result_actions a[title="Download Video HD"]').attr('href')
  const videoUrl2 = $('.result_actions a[title="Link Download [2]"]').attr('href')
  const videoUrl = $('video').attr('src')
  const coverUrl = $('video').attr('poster')
  const title = $('.title').text().trim()
  const author = $('.result_author').text().trim()

  const kandidat = [videoHDUrl, videoUrl2, videoUrl].filter(Boolean)
  const playable = kandidat.filter((u) => !/\.m3u8(\?|$)/i.test(u))
  /* Utamakan file asli Pinterest (pinimg) — link sspin cuma proxy
     atas file yang sama, dan tokennya cepat kedaluwarsa. */
  const media = playable.find((u) => /pinimg\.com/i.test(u)) || playable[0]
  if (!media) {
    throw new Error(
      kandidat.length
        ? 'Video hanya tersedia sebagai HLS (.m3u8) dan tidak bisa dikirim.'
        : 'Pin ini bukan video — tidak ada video yang bisa diunduh.',
    )
  }
  const cadangan = playable.find((u) => u !== media) || ''

  return { media, cadangan, coverUrl, title, author }
}

/* =========================================================
 * VIDEO — unduh utuh, cek kompatibilitas, normalisasi seperlunya.
 *
 * Kenapa ada normalisasi: WhatsApp mem-transcode video saat pengiriman
 * dan plafonnya 30 fps, jadi sumber 50 fps (banyak pin
 * Pinterest) ikut dibuang frame-nya → playback "patah-patah" di
 * penerima. File yang sudah H.264 ≤30 fps justru DIKIRIM APA
 * ADANYA (tanpa kompresi); hanya yang perlu baru di-encode ulang
 * (H.264, yuv420p, dimensi genap, faststart, CRF 20).
 * ========================================================= */
function namaTemp(ext) {
  return path.join(
    os.tmpdir(),
    `nano-pindl-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`,
  )
}

function jalankan(bin, args) {
  return new Promise((resolve) => {
    const anak = spawn(bin, args)
    let stderr = ''
    anak.stderr.on('data', (d) => {
      if (stderr.length < 20_000) stderr += String(d)
    })
    anak.on('error', (e) => resolve({ code: -1, stderr: String(e?.message || e) }))
    anak.on('close', (code) => resolve({ code, stderr }))
  })
}

async function unduhVideo(url) {
  const res = await denganCoba(() =>
    klien.get(url, {
      responseType: 'arraybuffer',
      timeout: UNDUH_TIMEOUT,
      maxRedirects: 5,
      headers: { 'user-agent': UA, referer: 'https://www.pinterest.com/' },
    }),
  )
  if (res.status !== 200) throw new Error(`Server video menjawab HTTP ${res.status}.`)
  const buffer = Buffer.from(res.data)
  if (!buffer.length) throw new Error('Video kosong.')
  if (buffer.length > MAKS_UNDUH) {
    throw new Error(`Video terlalu besar (${(buffer.length / 1048576).toFixed(1)} MB).`)
  }
  return buffer
}

async function probeVideo(bin, file) {
  const { stderr } = await jalankan(bin, ['-hide_banner', '-i', file])
  const baris = stderr.split('\n').find((l) => /Stream #\d+:\d+.*Video:/.test(l)) || ''
  return {
    codec: baris.match(/Video:\s*([a-zA-Z0-9_]+)/)?.[1] || '',
    fps: parseFloat(baris.match(/([\d.]+)\s*fps/)?.[1] || '0') || 0,
    ukuran: baris.match(/(\d{2,5})x(\d{2,5})/)?.[0] || '',
    audio: /Stream #\d+:\d+.*Audio:/.test(stderr),
  }
}

async function siapkanVideo(url, cadangan) {
  let buffer
  try {
    buffer = await unduhVideo(url)
  } catch (e) {
    if (!cadangan) throw e
    console.error('[PINDL FALLBACK]', e?.message || e)
    buffer = await unduhVideo(cadangan)
  }

  const bin = (await getFfmpegBinPath()) || 'ffmpeg'
  const fileIn = namaTemp('mp4')
  const fileOut = namaTemp('mp4')

  try {
    await fs.promises.writeFile(fileIn, buffer)
    const info = await probeVideo(bin, fileIn)

    if (/h264|avc1/i.test(info.codec) && info.fps && info.fps <= FPS_TARGET + 0.5) {
      return { buffer, catatan: '' } // sudah cocok → kirim tanpa kompresi
    }

    const args = [
      '-hide_banner',
      '-y',
      '-i',
      fileIn,
      '-vf',
      `fps=${FPS_TARGET},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
      '-c:v',
      'libx264',
      '-profile:v',
      'high',
      '-preset',
      'veryfast',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
    ]
    if (info.audio) args.push('-c:a', 'aac', '-b:a', '128k')
    else args.push('-an')
    args.push('-movflags', '+faststart', fileOut)

    const { code, stderr } = await jalankan(bin, args)
    if (code !== 0) {
      throw new Error(`ffmpeg gagal (${code}): ${(stderr.split('\n').pop() || '').slice(0, 120)}`)
    }

    const hasil = await fs.promises.readFile(fileOut)
    if (!hasil.length) throw new Error('Hasil normalisasi kosong.')
    return {
      buffer: hasil,
      catatan: info.fps
        ? `${info.codec || 'video'} ${Math.round(info.fps)}fps → H.264 ${FPS_TARGET}fps`
        : `${info.codec || 'video'} → H.264 ${FPS_TARGET}fps`,
    }
  } finally {
    await fs.promises.rm(fileIn, { force: true }).catch(() => {})
    await fs.promises.rm(fileOut, { force: true }).catch(() => {})
  }
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch (error) {
    console.error('[PINDL REACT]', error)
  }
}

const handler = async (m, { conn, usedPrefix = '.' }) => {
  const teks = String(m.text || '').trim()

  if (!teks) {
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      {
        text:
          '❌ Masukkan link Pinterest!\n\nContoh:\n' +
          `${usedPrefix}pindl https://id.pinterest.com/pin/608830443366641592/`,
      },
      { quoted: m.raw },
    )
  }

  const cocok = teks.match(/https?:\/\/\S+/i)
  let urlPin
  try {
    urlPin = new URL(cocok ? cocok[0] : `https://${teks}`)
  } catch {
    urlPin = null
  }

  if (!urlPin) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: '❌ URL Pinterest tidak valid.' }, { quoted: m.raw })
  }

  if (!/(^|\.)pinterest\./i.test(urlPin.hostname)) {
    m.limit?.fail()
    return conn.sendMessage(
      m.chat,
      { text: '❌ Link tersebut bukan link Pinterest.' },
      { quoted: m.raw },
    )
  }

  await react(conn, m, '⏳')

  try {
    const data = await ambilDataPinterest(urlPin.href)
    await m.reply('⏳ Menyiapkan video (bisa 20–60 detik)...')
    const { buffer, catatan } = await siapkanVideo(data.media, data.cadangan)
    await conn.sendMessage(
      m.chat,
      {
        video: buffer,
        mimetype: 'video/mp4',
        caption:
          `🎬 ${data.title || 'Pinterest Video'}\n👤 ${data.author || '-'}` +
          (catatan ? `\n⚙️ ${catatan}` : '') +
          `\n\n🔗 ${urlPin.href}`,
      },
      { quoted: m.raw },
    )
    m.limit?.success()
    await react(conn, m, '✅')
  } catch (error) {
    m.limit?.fail()
    console.error('[PINDL ERROR]', error)
    const pesan = jaringanGagal(error)
      ? 'Koneksi ke ssspin.io gagal — coba lagi beberapa saat.'
      : error.message
    await react(conn, m, '❌')
    await conn.sendMessage(
      m.chat,
      { text: `❌ Gagal mengunduh video Pinterest.\n\n${pesan}` },
      { quoted: m.raw },
    )
  }
}

handler.command = /^(pindl|pinterestdl|pinvidl)$/i
handler.help = ['pindl <link pinterest>']
handler.usage = ['pindl <link pinterest>']
handler.tags = ['download']
handler.description = 'Download video dari Pinterest (HD) lewat ssspin.io'
handler.limitCommit = 'manual'

export default handler
