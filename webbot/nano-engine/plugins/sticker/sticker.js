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

import crypto from 'crypto'
import sharp from 'sharp'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { settings } from '../../config/settings.js'

const MAX_STICKER_SIZE = 1024 * 1024
const STICKER_SIZE = 512
const qualities = [85, 78, 70, 62, 55]

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 8; i++) {
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

function getImageMessage(message) {
  const content = unwrapMessage(message)
  return content?.imageMessage || null
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const buffer = Buffer.concat(chunks)
  if (!buffer.length) throw new Error('Media gambar kosong.')
  return buffer
}

async function downloadImage(imageMessage) {
  const stream = await downloadContentFromMessage(imageMessage, 'image')
  return streamToBuffer(stream)
}

async function imageToWebp(input, quality) {
  return sharp(input, { failOn: 'error' })
    .rotate()
    .resize(STICKER_SIZE, STICKER_SIZE, {
      fit: 'contain',
      position: 'centre',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer()
}

/* Bit flag di dalam chunk 'VP8X' (urutan dari MSB, sesuai spesifikasi WebP).
   Metadata (EXIF) HANYA sah di dalam format WebP "extended", yang wajib diawali
   chunk 'VP8X'; tanpa itu, chunk 'EXIF' yang ditempelkan di belakang file membuat
   filenya tidak sah dan WhatsApp menolaknya (stiker tampil kosong). */
const VP8X_FLAG_ICC = 0x20
const VP8X_FLAG_ALPHA = 0x10
const VP8X_FLAG_EXIF = 0x08
const VP8X_FLAG_XMP = 0x04

// Ukuran kanvas dibaca dari bitstream, karena VP8X belum tentu ada.
function readCanvasSize(type, data) {
  try {
    if (type === 'VP8X' && data.length >= 10) {
      return { w: data.readUIntLE(4, 3) + 1, h: data.readUIntLE(7, 3) + 1 }
    }
    if (type === 'VP8L' && data.length >= 5 && data[0] === 0x2f) {
      const bits = data.readUInt32LE(1)
      return { w: (bits & 0x3fff) + 1, h: ((bits >>> 14) & 0x3fff) + 1 }
    }
    if (type === 'VP8 ' && data.length >= 10) {
      return { w: data.readUInt16LE(6) & 0x3fff, h: data.readUInt16LE(8) & 0x3fff }
    }
  } catch {

  }
  return null
}

// VP8X: 8 byte header + 10 byte payload (flag, 3 byte reserved, lebar-1, tinggi-1)
function makeVp8x({ w, h }, flags) {
  const chunk = Buffer.alloc(18)
  chunk.write('VP8X', 0, 4, 'ascii')
  chunk.writeUInt32LE(10, 4)
  chunk[8] = flags
  chunk.writeUIntLE(Math.max(0, w - 1), 12, 3)
  chunk.writeUIntLE(Math.max(0, h - 1), 15, 3)
  return chunk
}

function addStickerExif(webp, packName, author) {
  if (!Buffer.isBuffer(webp) || webp.length < 16) throw new Error('Hasil WebP tidak valid.')
  if (webp.toString('ascii', 0, 4) !== 'RIFF' || webp.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Format WebP tidak valid.')
  }

  const json = {
    'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
    'sticker-pack-name': packName,
    'sticker-pack-publisher': author,
    emojis: ['✨'],
  }
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exifHeader = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00,
    0x00, 0x00,
  ])
  const exif = Buffer.concat([exifHeader, jsonBuffer])
  exif.writeUInt32LE(jsonBuffer.length, 14)

  const exifChunk = Buffer.alloc(8 + exif.length + (exif.length % 2))
  exifChunk.write('EXIF', 0, 4, 'ascii')
  exifChunk.writeUInt32LE(exif.length, 4)
  exif.copy(exifChunk, 8)

  // Kumpulkan chunk yang sudah ada, sekaligus buang EXIF lama supaya tidak dobel.
  const chunks = []
  let offset = 12
  while (offset + 8 <= webp.length) {
    const type = webp.toString('ascii', offset, offset + 4)
    const size = webp.readUInt32LE(offset + 4)
    const end = offset + 8 + size
    if (end > webp.length) throw new Error('Struktur WebP tidak lengkap.')
    const pad = size % 2
    if (type !== 'EXIF') {
      chunks.push({ type, data: webp.subarray(offset + 8, end), raw: Buffer.from(webp.subarray(offset, end + pad)) })
    }
    offset = end + pad
  }
  if (offset !== webp.length) throw new Error('Struktur WebP tidak valid.')

  // VP8X wajib ada, wajib paling depan, dan flag EXIF-nya wajib menyala.
  const existingVp8x = chunks.find((c) => c.type === 'VP8X')
  const imageChunk = chunks.find((c) => c.type === 'VP8 ' || c.type === 'VP8L')
  const source = existingVp8x || imageChunk
  const canvas = source ? readCanvasSize(source.type, source.data) : null
  if (!canvas || !canvas.w || !canvas.h) throw new Error('Ukuran kanvas WebP tidak terbaca.')

  const flags = (existingVp8x ? existingVp8x.data[0] : 0) | VP8X_FLAG_EXIF

  const output = Buffer.concat([
    webp.subarray(0, 12),
    makeVp8x(canvas, flags),
    ...chunks.filter((c) => c.type !== 'VP8X').map((c) => c.raw),
    exifChunk,
  ])
  output.writeUInt32LE(output.length - 8, 4)
  return output
}

export async function createSticker(input, packName, author) {
  for (const quality of qualities) {
    const webp = await imageToWebp(input, quality)
    const sticker = addStickerExif(webp, packName, author)
    if (sticker.length <= MAX_STICKER_SIZE || quality === qualities[qualities.length - 1]) return sticker
  }
  throw new Error('Gagal membuat stiker.')
}

function getStickerSource(m) {
  const direct = getImageMessage(m.raw?.message)
  if (direct) return direct
  return getImageMessage(m.quoted)
}

const handler = async (m, { conn }) => {
  const imageMessage = getStickerSource(m)

  if (!imageMessage) {
    await react(conn, m, '❌')
    return conn.sendMessage(m.chat, {
      text: '❌ Kirim gambar dengan caption .s / .stiker atau reply pesan bergambar dengan .s / .stiker.'
    }, { quoted: m.raw })
  }

  const packName = String(settings.sticker?.pack || settings.botName || 'Nano Ai').trim() || 'Nano Ai'
  const author = String(settings.sticker?.author || settings.ownerName || 'Awang Official').trim() || 'Awang Official'

  await react(conn, m, '⏳')

  try {
    const input = await downloadImage(imageMessage)
    const sticker = await createSticker(input, packName, author)

    if (!Buffer.isBuffer(sticker) || sticker.length < 100 || sticker.length > MAX_STICKER_SIZE) {
      throw new Error('Hasil stiker tidak valid atau melebihi batas ukuran.')
    }

    const metadata = await sharp(sticker, { failOn: 'error' }).metadata()
    if (metadata.format !== 'webp' || metadata.width !== STICKER_SIZE || metadata.height !== STICKER_SIZE) {
      throw new Error('Hasil stiker kosong atau dimensinya tidak valid.')
    }

    await conn.sendMessage(m.chat, {
      sticker,
      mimetype: 'image/webp',
    }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal membuat stiker.\n\n${error?.message || 'Terjadi kesalahan saat memproses gambar.'}`
    }, { quoted: m.raw })
  }
}

handler.command = /^(s|stiker)$/i
handler.help = ['s', 'stiker']
handler.tags = ['sticker']
handler.category = 'sticker'
handler.description = 'Membuat stiker dari gambar'
handler.limit = false

export default handler
