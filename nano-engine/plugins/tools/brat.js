/*
⌬
┇ ━━━[ 🖼️ BRAT — NANO AI ]━━━━
┇
┇ Bikin gambar "brat" ala Charli XCX: teks rata tengah
┇ di kanvas 1000x1000, font Arial Narrow, emoji Apple.
┇
┇ Cara pakai:
┇   .brat Halo dunia
┇   .brat -g Halo dunia          (tema hijau)
┇   .brat -b Halo dunia          (tema hitam)
┇   .brat -blur 2 Halo dunia     (blur 0-3)
┇   .brat -f Halo dunia          (kirim sebagai foto)
┇   reply/tag pesan + .brat      (pakai teks pesan itu)
┇
┇ Hasil bawaan adalah STIKER, karena itu pemakaian yang paling umum.
┇
┇ Flag bisa digabung: .brat -g -blur 1 halo
┇
┇ Aset (font + emoji) diunduh sekali lalu disimpan di
┇ data/brat/, jadi setelah itu jalan tanpa internet.
┇ Kalau unduhan gagal, font sistem dipakai sebagai
┇ cadangan supaya fitur ini tidak pernah mati.
⌬
*/

import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { createSticker } from '../sticker/sticker.js'
import { settings } from '../../config/settings.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = path.resolve(__dirname, '..', '..', 'data', 'brat')
const FONT_PATH = path.join(CACHE_DIR, 'ARIALN.ttf')
const EMOJI_PATH = path.join(CACHE_DIR, 'emoji-apple.json')

const FONT_URL = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Font/ARIALN.ttf'
const EMOJI_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json'

// Dipakai kalau font brat tidak bisa diunduh, supaya hasilnya tetap
// masuk akal (bukan kotak-kotak) meski bentuk hurufnya berbeda.
const FALLBACK_FONTS = [
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
]

// Semua kode render memakai nama ini, jadi penggantian font
// cadangan tidak perlu mengubah apa pun lagi.
const FONT_FAMILY = 'ArialNarrow'

const SIZE = 1000
const PADDING = 80
const LINE_GAP = 20
const MAX_TEXT = 500
const MAX_BLUR = 3
// Render 1000x1000 itu cukup berat; batasi yang jalan bersamaan
// supaya beberapa permintaan sekaligus tidak membuat CPU melonjak.
const MAX_PARALLEL = 2

const THEMES = {
  white: { bg: '#ffffff', text: '#000000' },
  black: { bg: '#000000', text: '#ffffff' },
  green: { bg: '#8ace00', text: '#000000' },
}

const THEME_FLAGS = {
  '-w': 'white', '--white': 'white', '-white': 'white', '-putih': 'white',
  '-b': 'black', '--black': 'black', '-black': 'black', '-hitam': 'black',
  '-g': 'green', '--green': 'green', '-green': 'green', '-hijau': 'green',
}

// Brat paling sering dipakai sebagai stiker, jadi itu yang jadi bawaan.
// Pakai -f kalau memang mau dikirim sebagai foto.
const STICKER_FLAGS = new Set(['-s', '-stiker', '-sticker', '--sticker'])
const IMAGE_FLAGS = new Set(['-f', '-foto', '-img', '-image', '--image', '-gambar'])
const BLUR_FLAGS = new Set(['-blur', '--blur'])

/* ---------- unduhan aset ---------- */

// Tulis ke file .part lalu ganti nama, supaya file setengah jadi
// tidak pernah terbaca sebagai aset yang sah.
async function download(url, dest) {
  mkdirSync(path.dirname(dest), { recursive: true })
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (!buffer.length) throw new Error('Isi unduhan kosong')
  const tmp = `${dest}.part`
  writeFileSync(tmp, buffer)
  renameSync(tmp, dest)
  return buffer
}

let fontTask = null
let fontSource = 'none'

export function getFontSource() {
  return fontSource
}

function useFont() {
  if (!existsSync(FONT_PATH)) return false
  GlobalFonts.registerFromPath(FONT_PATH, FONT_FAMILY)
  fontSource = 'brat'
  return true
}

function useSystemFont() {
  for (const file of FALLBACK_FONTS) {
    try {
      if (!existsSync(file)) continue
      GlobalFonts.registerFromPath(file, FONT_FAMILY)
      fontSource = 'sistem'
      return true
    } catch {

    }
  }
  fontSource = 'tidak ada'
  return false
}

async function ensureFont() {
  if (!fontTask) {
    fontTask = (async () => {
      try {
        if (useFont()) return
        await download(FONT_URL, FONT_PATH)
        if (useFont()) return
      } catch {

      }
      useSystemFont()
    })()
  }
  return fontTask
}

let emojiMap = null
let emojiTried = false
const emojiImages = new Map()

async function getEmojiMap() {
  if (emojiMap) return emojiMap
  if (emojiTried) return null
  emojiTried = true
  try {
    if (!existsSync(EMOJI_PATH)) await download(EMOJI_URL, EMOJI_PATH)
    emojiMap = JSON.parse(readFileSync(EMOJI_PATH, 'utf8'))
  } catch {
    emojiMap = null
  }
  return emojiMap
}

/* ---------- emoji ---------- */

// String.raw dipakai supaya \uFE0F tidak berubah jadi karakter asli
// sebelum sampai ke RegExp.
const EMOJI_BODY = String.raw`(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)`
const EMOJI_SPLIT = new RegExp(`(${EMOJI_BODY})`, 'gu')
const EMOJI_ANY = new RegExp(EMOJI_BODY, 'u')

const hasEmoji = (text) => EMOJI_ANY.test(String(text))

const isEmoji = (part) => EMOJI_ANY.test(part)

// ❤️ -> '2764-fe0f' (sama dengan kunci di emoji-apple.json)
function emojiKey(emoji) {
  return [...emoji].map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-')
}

async function getEmojiImage(emoji) {
  if (emojiImages.has(emoji)) return emojiImages.get(emoji)
  const map = await getEmojiMap()
  let image = null
  if (map) {
    const base = emojiKey(emoji)
    const plain = base.replace(/-fe0f/gi, '')
    for (const key of [base, plain, `${plain}-fe0f`]) {
      if (!map[key]) continue
      try {
        image = await loadImage(Buffer.from(map[key], 'base64'))
        break
      } catch {
        image = null
      }
    }
  }
  emojiImages.set(emoji, image)
  return image
}

async function drawEmoji(ctx, emoji, x, y, size) {
  const image = await getEmojiImage(emoji)
  if (!image) {
    ctx.fillText(emoji, x, y)
    return
  }
  ctx.drawImage(image, x, y, size, size)
}

/* ---------- ukur & bungkus teks ---------- */

// Emoji dihitung selebar fontSize (bukan lebar glyph font), karena
// digambar sebagai gambar, bukan huruf.
//
// ctx.font WAJIB sudah benar sebelum measureText. Kalau tidak, semua ukuran
// font akan terukur kecil, seluruh kandidat dianggap "muat", pencarian ukuran
// selalu mengembalikan batas maksimum, dan teksnya membesar sampai terpotong
// di tepi kanvas. Karena itu penepatannya ditaruh di sini, satu-satunya tempat
// pengukuran, supaya tidak bisa terlewat lagi.
function measure(ctx, text, fontSize) {
  ctx.font = `${fontSize}px ${FONT_FAMILY}`
  let width = 0
  for (const part of String(text).split(EMOJI_SPLIT)) {
    if (!part) continue
    width += isEmoji(part) ? fontSize : ctx.measureText(part).width
  }
  return width
}

async function drawLine(ctx, text, x, y, fontSize) {
  let cursor = x
  for (const part of String(text).split(EMOJI_SPLIT)) {
    if (!part) continue
    if (isEmoji(part)) {
      await drawEmoji(ctx, part, cursor, y, fontSize)
      cursor += fontSize
    } else {
      ctx.fillText(part, cursor, y)
      cursor += ctx.measureText(part).width
    }
  }
}

function wrap(ctx, text, maxWidth, fontSize) {
  const lines = []
  let current = ''

  // Kata yang sendirian pun lebih lebar dari satu baris (mis. teks tanpa spasi
  // yang sangat panjang) dipecah per huruf, supaya tidak ada teks yang bisa
  // keluar dari tepi kanvas dalam keadaan apa pun.
  const hardBreak = (word) => {
    if (measure(ctx, word, fontSize) <= maxWidth) return [word]
    const parts = []
    let chunk = ''
    for (const char of word) {
      if (chunk && measure(ctx, chunk + char, fontSize) > maxWidth) {
        parts.push(chunk)
        chunk = char
      } else {
        chunk += char
      }
    }
    if (chunk) parts.push(chunk)
    return parts
  }

  for (const word of String(text).split(/\s+/)) {
    if (!word) continue
    const test = current ? `${current} ${word}` : word
    if (measure(ctx, test, fontSize) <= maxWidth) {
      current = test
      continue
    }
    if (current) {
      lines.push(current)
      current = ''
    }
    const parts = hardBreak(word)
    while (parts.length > 1) lines.push(parts.shift())
    current = parts[0] || ''
  }

  if (current) lines.push(current)
  return lines
}

function fits(ctx, text, fontSize, maxWidth, maxHeight) {
  const lines = wrap(ctx, text, maxWidth, fontSize)
  const longestWord = Math.max(0, ...String(text).split(/\s+/).map((word) => measure(ctx, word, fontSize)))
  const height = lines.length * (fontSize + LINE_GAP) - LINE_GAP
  return longestWord <= maxWidth && height <= maxHeight
}

// Ukuran font terbesar yang masih muat: 10..700 px, cari biner.
function bestFontSize(ctx, text, maxWidth, maxHeight) {
  let low = 10
  let high = 700
  let best = low
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (fits(ctx, text, mid, maxWidth, maxHeight)) {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return best
}

/* ---------- render ---------- */

// Mengembalikan Buffer PNG (tidak menulis file) supaya tidak ada
// file sementara yang menumpuk di folder project.
export async function renderBrat({ text, theme = 'white', blur = 0 } = {}) {
  const value = String(text ?? '').trim()
  if (!value) throw new Error('Teksnya kosong.')

  const selected = THEMES[String(theme).toLowerCase()] || THEMES.white
  const amount = Number.isFinite(blur) ? Math.min(MAX_BLUR, Math.max(0, Math.trunc(blur))) : 0

  await ensureFont()
  // Peta emoji (28 MB) hanya dimuat kalau teksnya memang beremoji.
  if (hasEmoji(value)) await getEmojiMap()

  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')
  const maxWidth = SIZE - PADDING * 2
  const maxHeight = SIZE - PADDING * 2

  const fontSize = bestFontSize(ctx, value, maxWidth, maxHeight)
  const lines = wrap(ctx, value, maxWidth, fontSize)

  ctx.fillStyle = selected.bg
  ctx.fillRect(0, 0, SIZE, SIZE)

  ctx.fillStyle = selected.text
  ctx.font = `${fontSize}px ${FONT_FAMILY}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  ctx.save()
  if (amount > 0) ctx.filter = `blur(${amount}px)`

  const totalHeight = lines.length * (fontSize + LINE_GAP) - LINE_GAP
  let y = (SIZE - totalHeight) / 2
  for (const line of lines) {
    await drawLine(ctx, line, PADDING, y, fontSize)
    y += fontSize + LINE_GAP
  }

  ctx.restore()

  return canvas.encode('png')
}

/* ---------- antrean render ---------- */

let running = 0
const waiters = []

function acquire() {
  if (running < MAX_PARALLEL) {
    running++
    return Promise.resolve()
  }
  return new Promise((resolve) => waiters.push(resolve))
}

function release() {
  const next = waiters.shift()
  if (next) next()
  else running--
}

/* ---------- pesan ---------- */

const buildCaption = ({ sender, theme, blur, sticker }) => [
  `🖼️ *BRAT • ${String(settings.botName || 'Nano Ai').toUpperCase()}*`,
  '',
  '> ╭─〔 ★ HASIL 〕',
  `> │ Tema  : *${theme}*`,
  `> │ Blur  : *${blur}*`,
  `> │ Kirim : *${sticker ? 'Stiker' : 'Gambar'}*`,
  `> ╰──────────`,
  '',
  `> 🧑 Pengirim : @${String(sender || '').split('@')[0]}`,
].join('\n')

const GUIDE = [
  '╭─〔 🖼️ NANO • BRAT 〕',
  '│',
  '│ Ketik teksnya setelah .brat,',
  '│ atau reply pesan lalu ketik .brat',
  '│',
  '│ Hasil bawaan: *STIKER*. Pakai -f kalau',
  '│ mau dikirim sebagai foto.',
  '│',
  '│ *PILIHAN*',
  '│ › .brat -w teks   → tema putih',
  '│ › .brat -b teks   → tema hitam',
  '│ › .brat -g teks   → tema hijau',
  '│ › .brat -blur 2 teks → blur 0-3',
  '│ › .brat -f teks   → kirim sebagai foto',
  '│',
  '│ Flag bisa digabung:',
  '│ .brat -g -blur 1 halo dunia',
  '│',
  '╰──────────────',
].join('\n')

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {

  }
}

function unwrap(message) {
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

// Teks dari pesan yang di-reply, dipakai kalau .brat ditulis tanpa teks.
function quotedText(m) {
  const content = unwrap(m.quoted)
  return String(
    content?.conversation ||
    content?.extendedTextMessage?.text ||
    content?.imageMessage?.caption ||
    content?.videoMessage?.caption ||
    content?.documentMessage?.caption ||
    ''
  ).trim()
}

// .brat -g -blur 1 halo dunia  ->  { theme, blur, sticker, text }
export function parseBratArgs(args = []) {
  let theme = 'white'
  let blur = 0
  let sticker = true
  const words = []

  for (let i = 0; i < args.length; i++) {
    const raw = String(args[i] ?? '')
    const flag = raw.toLowerCase()

    if (THEME_FLAGS[flag]) {
      theme = THEME_FLAGS[flag]
      continue
    }

    if (STICKER_FLAGS.has(flag)) {
      sticker = true
      continue
    }

    if (IMAGE_FLAGS.has(flag)) {
      sticker = false
      continue
    }

    if (BLUR_FLAGS.has(flag)) {
      const next = Number.parseInt(args[i + 1], 10)
      if (Number.isFinite(next)) {
        blur = Math.min(MAX_BLUR, Math.max(0, next))
        i++
      }
      continue
    }

    const inline = /^-{1,2}blur([0-3])$/i.exec(raw)
    if (inline) {
      blur = Number(inline[1])
      continue
    }

    words.push(raw)
  }

  return { theme, blur, sticker, text: words.join(' ').trim() }
}

const handler = async (m, { conn }) => {
  const parsed = parseBratArgs(m.args || [])
  let text = parsed.text || quotedText(m)

  if (!text) {
    await conn.sendMessage(m.chat, { text: GUIDE }, { quoted: m.raw })
    return
  }

  if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT).trim()

  await react(conn, m, '⏳')

  let slot = false
  try {
    await acquire()
    slot = true

    const image = await renderBrat({ text, theme: parsed.theme, blur: parsed.blur })
    if (!Buffer.isBuffer(image) || image.length < 100) throw new Error('Hasil gambar tidak valid.')

    const caption = buildCaption({
      sender: m.sender,
      theme: parsed.theme,
      blur: parsed.blur,
      sticker: parsed.sticker,
    })

    if (parsed.sticker) {
      const packName = String(settings.sticker?.pack || settings.botName || 'Nano Ai').trim() || 'Nano Ai'
      const author = String(settings.sticker?.author || settings.ownerName || 'Nano Ai').trim() || 'Nano Ai'
      const sticker = await createSticker(image, packName, author)
      await conn.sendMessage(m.chat, { sticker, mimetype: 'image/webp' }, { quoted: m.raw })
      await react(conn, m, '✅')
      return
    }

    await conn.sendMessage(
      m.chat,
      { image, mimetype: 'image/png', caption, mentions: [m.sender] },
      { quoted: m.raw }
    )
    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 🖼️ NANO • BRAT 〕',
          '│',
          '│ ❌ Gagal membuat gambar:',
          `│ ${error?.message || error}`,
          '│',
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
  } finally {
    if (slot) release()
  }
}

handler.command = /^brat$/i
handler.help = ['brat']
handler.tags = ['sticker']
handler.category = 'sticker'
handler.description = 'Bikin gambar teks gaya "brat" (3 tema warna + blur + mode stiker)'
handler.limit = false

export { THEMES, MAX_BLUR, MAX_TEXT, GUIDE }
export default handler
