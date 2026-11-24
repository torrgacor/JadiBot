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
┇ ━━━[ 🎵 UPCH — NANO AI ]━━━━
┇
┇ Upload musik ke Saluran WhatsApp (channel).
┇ Balas sebuah audio / dokumen audio, lalu ketik .upch
┇
┇ Cara pakai:
┇   • Reply audio lalu ketik        : .upch
┇   • Kirim audio + caption         : .upch
┇   • Kasih judul sendiri           : .upch Judul Lagunya
┇   • Kirim ke saluran lain         : .upch https://whatsapp.com/channel/xxxx Judul
┇   • Saluran lain lewat JID        : .upch 12036xxxxx@newsletter Judul
┇
┇ Saluran default diambil dari settings.links.channelId.
┇ Bisa dioverride di config/settings.js:
┇   upch: {
┇     channelId: '12036xxxxx@newsletter',
┇     brand: 'NANO MUSIC',
┇     maxBytes: 67108864,   // batas ukuran audio (byte)
┇     postTitle: true,      // kirim judul sebagai pesan teks setelah audio
┇     forceMp3: false       // true = semua audio dikonversi ke mp3 dulu
┇   }
┇
┇ Catatan: WhatsApp TIDAK mendukung caption pada pesan audio,
┇ jadi kalau ada judul, judul dikirim sebagai pesan teks
┇ setelah audionya (bisa dimatikan lewat postTitle: false).
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

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import pino from 'pino'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { settings } from '../../config/settings.js'
import { normalizeNewsletterMetadata } from '../../lib/id-lookup.js'

const logger = pino({ level: 'silent' })

const HEADER = '╭─〔 NANO • UPCH 〕'
const FOOTER = '╰──────────────╯'

const BRAND = String(settings.upch?.brand || 'NANO MUSIC').trim() || 'NANO MUSIC'
const DEFAULT_CHANNEL = String(settings.upch?.channelId || settings.links?.channelId || '').trim()
const MAX_BYTES = Number(settings.upch?.maxBytes) > 0 ? Number(settings.upch.maxBytes) : 64 * 1024 * 1024
const POST_TITLE = settings.upch?.postTitle !== false
const FORCE_MP3 = settings.upch?.forceMp3 === true

// Format yang sudah "siap musik" — tidak perlu dikonversi.
const MUSIC_MIMES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/wav',
  'audio/x-wav',
])

const MIME_EXT = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/m4a': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/opus': 'opus',
  'audio/webm': 'webm',
  'audio/amr': 'amr',
  'audio/3gpp': '3gp',
}

const CHANNEL_LINK_RE = /https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[A-Za-z0-9_-]+/i
const NEWSLETTER_JID_RE = /\b[0-9]{6,}@newsletter\b/i

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

function hasContent(node) {
  return !!node && typeof node === 'object' && Object.keys(node).length > 0
}

// Audio = audioMessage (musik / voice note), atau dokumen ber-mimetype audio
// (mp3/m4a/flac yang dikirim sebagai file).
function classify(type, node) {
  if (!hasContent(node)) return null
  if (type === 'audioMessage') return 'audio'
  if (type === 'documentMessage' && String(node.mimetype || '').toLowerCase().startsWith('audio/')) return 'audio'
  return null
}

function pickFrom(container, key) {
  if (!container) return null
  const inner = unwrap(container)
  for (const type of ['audioMessage', 'documentMessage']) {
    const node = inner[type]
    const kind = classify(type, node)
    if (kind) return { kind, type, node, key }
  }
  return null
}

// Cari audio: dari pesan sendiri (caption .upch) atau dari pesan yang di-reply
export function pickAudio(m) {
  return (
    pickFrom(m?.currentMessage, m?.raw?.key) ||
    pickFrom(m?.quotedMessage?.message, m?.quotedMessage?.key) ||
    null
  )
}

// Tautan/JID saluran boleh ditulis paling depan; sisanya jadi judul.
// Kata biasa TIDAK pernah dianggap saluran (biar judul satu kata tetap aman).
export function parseTarget(text) {
  const raw = String(text || '').trim()
  if (!raw) return { target: '', caption: '' }

  const link = raw.match(CHANNEL_LINK_RE)
  if (link) {
    return { target: link[0], caption: raw.replace(link[0], ' ').replace(/\s+/g, ' ').trim() }
  }

  const jid = raw.match(NEWSLETTER_JID_RE)
  if (jid) {
    return { target: jid[0], caption: raw.replace(jid[0], ' ').replace(/\s+/g, ' ').trim() }
  }

  return { target: '', caption: raw }
}

export function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '0 B'
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${value} B`
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  if (!total) return ''
  const menit = Math.floor(total / 60)
  const detik = total % 60
  return menit > 0 ? `${menit}:${String(detik).padStart(2, '0')}` : `${detik} dtk`
}

export function cleanTitle({ caption, node, fallback = 'Audio Nano Ai' }) {
  const custom = String(caption || '').trim()
  if (custom) return custom.slice(0, 120)
  const fileName = String(node?.fileName || '').trim()
  if (fileName) {
    const stripped = fileName.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim()
    if (stripped) return stripped.slice(0, 120)
  }
  return fallback
}

export function buildCaption({ title, seconds, size }) {
  const baris = []
  const durasi = formatDuration(seconds)
  const info = [durasi ? `⏱️ ${durasi}` : '', size ? `📦 ${formatBytes(size)}` : ''].filter(Boolean)
  if (info.length) baris.push(info.join(' • '))
  return [`🎵 *${title}*`, ...baris, `✦ ${BRAND}`].join('\n')
}

function extensionOf(mimetype, fileName) {
  const byMime = MIME_EXT[String(mimetype || '').toLowerCase()]
  if (byMime) return byMime
  const fromName = String(fileName || '').match(/\.([a-z0-9]{2,5})$/i)
  return fromName ? fromName[1].toLowerCase() : 'bin'
}

function needsConvert(node, mimetype) {
  if (FORCE_MP3) return true
  // Voice note (opus/ogg) diputar sebagai voice note; untuk posting musik
  // di saluran lebih aman & universal kalau jadi mp3.
  if (node?.ptt === true) return true
  return !MUSIC_MIMES.has(String(mimetype || '').toLowerCase())
}

let ffmpegModule = null

async function loadFfmpeg() {
  if (ffmpegModule) return ffmpegModule

  const [{ default: ffmpeg }, { default: ffmpegInstaller }] = await Promise.all([
    import('fluent-ffmpeg'),
    import('@ffmpeg-installer/ffmpeg'),
  ])

  ffmpeg.setFfmpegPath(ffmpegInstaller.path)
  ffmpegModule = ffmpeg
  return ffmpeg
}

// Konversi ke mp3 128 kbps; berkas sementara selalu dibersihkan.
async function convertToMp3(buffer, extension) {
  const ffmpeg = await loadFfmpeg()
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'nano-upch-'))
  const input = path.join(dir, `input.${extension || 'bin'}`)
  const output = path.join(dir, 'output.mp3')

  try {
    await fs.promises.writeFile(input, buffer)

    await new Promise((resolve, reject) => {
      ffmpeg(input)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .audioChannels(2)
        .format('mp3')
        .on('error', (err) => reject(new Error(`Konversi audio gagal: ${err.message}`)))
        .on('end', () => resolve(output))
        .save(output)
    })

    const hasil = await fs.promises.readFile(output)
    if (!hasil?.length) throw new Error('Hasil konversi mp3 kosong.')
    return hasil
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

// Saluran tujuan: JID langsung, atau tautan/kode undangan (perlu dibaca dulu).
async function resolveChannel(rawConn, target) {
  const wanted = String(target || DEFAULT_CHANNEL).trim()
  if (!wanted) return null

  if (/@newsletter$/i.test(wanted)) return { jid: wanted, name: '', link: '' }

  const kode = (wanted.match(/channel\/([A-Za-z0-9_-]+)/i) || [])[1] || wanted
  if (typeof rawConn?.newsletterMetadata !== 'function') {
    throw new Error('Koneksi WhatsApp ini tidak bisa membaca metadata saluran.')
  }

  const metadata = normalizeNewsletterMetadata(await rawConn.newsletterMetadata('invite', kode))
  if (!metadata.id || !metadata.id.endsWith('@newsletter')) {
    throw new Error('Saluran tidak dikenali dari tautan itu.')
  }

  return {
    jid: metadata.id,
    name: metadata.name && metadata.name !== 'Tanpa nama' ? metadata.name : '',
    link: metadata.invite ? `https://whatsapp.com/channel/${metadata.invite}` : '',
  }
}

// Nama & tautan saluran (kalau tujuannya ditulis sebagai JID) — opsional.
async function describeChannel(rawConn, jid) {
  try {
    const metadata = normalizeNewsletterMetadata(await rawConn.newsletterMetadata('jid', jid), jid)
    return {
      name: metadata.name && metadata.name !== 'Tanpa nama' ? metadata.name : '',
      link: metadata.invite ? `https://whatsapp.com/channel/${metadata.invite}` : '',
    }
  } catch {
    return { name: '', link: '' }
  }
}

// reason: '' (tanpa balasan) | 'bukan-audio' (dibalas tapi bukan audio)
function guideText(prefix, reason = '') {
  const p = prefix || '.'
  const saluran = DEFAULT_CHANNEL || 'belum diatur di settings.links.channelId'
  const baris = [
    HEADER,
    '│',
    '│ 📌 *TATA CARA UPLOAD MUSIK KE SALURAN*',
  ]

  if (reason === 'bukan-audio') {
    baris.push('│', '│ ❌ Pesan yang kamu balas bukan audio.', '│ Balas pesan *musik/audio*-nya, bukan pesan lain.')
  } else if (reason === 'tanpa-balasan') {
    baris.push('│', '│ ⚠️ Kamu belum membalas pesan audio.', '│ Pesan audio tidak bisa diberi caption, jadi', '│ audionya WAJIB dibalas dulu (langkah 2).')
  }

  baris.push(
    '│',
    '│ *1)* Siapkan pesan musiknya',
    '│     (audio, voice note, atau file',
    '│      mp3/m4a/aac/wav/flac yang dikirim',
    '│      sebagai dokumen)',
    '│',
    '│ *2)* Tekan & tahan pesan itu → pilih',
    '│     *Balas (Reply)*',
    '│',
    `│ *3)* Ketik *${p}upch* lalu kirim`,
    '│     (bot unduh audionya, lalu posting',
    '│      ke saluran)',
    '│',
    '│ *4)* Tunggu tanda ✅ dari bot',
    '│     → musik sudah terbit di saluran',
    '│',
    '│ *TAMBAHAN*',
    `│ ▸ Judul sendiri : ${p}upch Judul Lagunya`,
    `│ ▸ Saluran lain  : ${p}upch <link channel> Judul`,
    '│',
    `│ 📻 Saluran : ${saluran}`,
    `│ 📦 Batas   : ${formatBytes(MAX_BYTES)}`,
    '│ 🎧 Format  : mp3, m4a, aac, wav, ogg, opus,',
    '│              flac, amr — atau apa pun yang',
    '│              masuk sebagai pesan audio',
    '│',
    '│ ℹ️ Voice note otomatis diubah ke mp3, dan',
    '│    judul dikirim sebagai pesan teks karena',
    '│    WhatsApp tidak mendukung caption audio.',
    '│',
    '│ 🔒 Perintah ini khusus owner bot.',
    FOOTER
  )

  return baris.join('\n')
}

function successText({ title, size, seconds, converted, note, channel }) {
  return [
    HEADER,
    '│',
    '│ ✅ Musik berhasil diupload',
    '│',
    `│ 🎵 Judul   : ${title}`,
    `│ 📦 Ukuran  : ${formatBytes(size)}`,
    `│ ⏱️ Durasi  : ${formatDuration(seconds) || '-'}`,
    `│ 📡 Saluran : ${channel.name || channel.jid}`,
    converted ? '│ 🔄 Format  : dikonversi ke mp3' : '',
    note ? `│ ⚠️ ${note}` : '',
    channel.link ? `│` : '',
    channel.link ? `│ ${channel.link}` : '',
    FOOTER,
  ]
    .filter(Boolean)
    .join('\n')
}

function errorText(message) {
  return [
    HEADER,
    '│',
    '│ ❌ Gagal upload musik',
    '│',
    `│ ${String(message || 'Terjadi kesalahan.')}`,
    '│',
    '│ Pastikan bot admin di saluran itu,',
    '│ lalu coba lagi.',
    FOOTER,
  ].join('\n')
}

function react(rawConn, chat, key, emoji) {
  if (!rawConn?.sendMessage || !key) return
  void rawConn.sendMessage(chat, { react: { text: emoji, key } }).catch(() => {})
}

const handler = async (m, { conn, rawConn, usedPrefix }) => {
  const { target, caption } = parseTarget(m.text)
  const src = pickAudio(m)

  if (!src) {
    // dibedakan supaya orang tahu KENAPA perintahnya belum jalan
    const reason = m.quotedMessage || m.quoted ? 'bukan-audio' : 'tanpa-balasan'
    await conn.sendMessage(m.chat, { text: guideText(usedPrefix || '.', reason) }, { quoted: m.raw })
    return
  }

  react(rawConn, m.chat, m.raw?.key, '⏳')

  let note = ''

  try {
    const buffer = await downloadMediaMessage(
      { key: src.key, message: { [src.type]: src.node } },
      'buffer',
      {},
      { logger, reuploadRequest: rawConn?.updateMediaMessage }
    )

    if (!buffer?.length) throw new Error('Audio gagal diunduh, coba kirim ulang.')
    if (buffer.length > MAX_BYTES) {
      throw new Error(`Ukuran audio ${formatBytes(buffer.length)} melebihi batas ${formatBytes(MAX_BYTES)}.`)
    }

    const channel = await resolveChannel(rawConn, target)
    if (!channel) {
      throw new Error('Saluran belum diatur. Isi settings.links.channelId, atau sertakan tautan saluran.')
    }

    const mimetypeAsli = String(src.node.mimetype || 'audio/mpeg').toLowerCase()
    let payload = buffer
    let mimetype = mimetypeAsli
    let converted = false

    if (needsConvert(src.node, mimetypeAsli)) {
      try {
        payload = await convertToMp3(buffer, extensionOf(mimetypeAsli, src.node.fileName))
        mimetype = 'audio/mpeg'
        converted = true
      } catch (err) {
        note = `Audio dikirim apa adanya (${err.message})`
      }
    }

    const title = cleanTitle({ caption, node: src.node })
    const seconds = Number(src.node.seconds) || 0

    await rawConn.sendMessage(channel.jid, { audio: payload, mimetype, ptt: false }, {})

    if (POST_TITLE) {
      await rawConn.sendMessage(channel.jid, { text: buildCaption({ title, seconds, size: payload.length }) }, {})
    }

    const info = channel.name || channel.link ? channel : { ...channel, ...(await describeChannel(rawConn, channel.jid)) }

    // jejak di log supaya bisa dipastikan kirimannya benar-benar keluar
    console.log(
      `  \x1b[32m✓\x1b[0m  UPCH: ${formatBytes(payload.length)}${converted ? ' (mp3)' : ''} → ${channel.jid} oleh ${String(m.sender || '').split('@')[0]}`
    )

    react(rawConn, m.chat, m.raw?.key, '✅')
    await conn.sendMessage(
      m.chat,
      {
        text: successText({
          title,
          size: payload.length,
          seconds,
          converted,
          note,
          channel: info,
        }),
      },
      { quoted: m.raw }
    )
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m  UPCH gagal: ${err?.message || err}`)
    react(rawConn, m.chat, m.raw?.key, '⚠️')
    await conn.sendMessage(m.chat, { text: errorText(err?.message || err) }, { quoted: m.raw })
  }
}

handler.command = /^upch$/i
handler.help = ['upch', 'uploadch', 'musikch']
handler.tags = ['owner']
handler.category = 'owner'
handler.description = 'Upload musik/audio yang di-reply ke Saluran WhatsApp (channel)'
handler.ownerOnly = true
handler.limit = false

export { convertToMp3, extensionOf, needsConvert, resolveChannel, guideText, successText, errorText }
export default handler
