/*
⌬ Nano Ai · Mesin .addplugins
  Instal plugin langsung dari chat: user tentukan menu (folder), lalu reply
  file .js atau kirim kode — file tersimpan ke plugins/<menu>/ dan langsung
  di-hot-reload oleh watcher (chokidar) yang sudah ada.

  Keamanan:
  - hanya owner (isOwner) yang bisa memulai & melanjutkan sesi
  - nama menu & nama file divalidasi ketat (anti path-traversal)
  - hasil akhir selalu di dalam folder plugins/ (dicek ulang via path.resolve)
  - ukuran maksimal dibatasi, sintaks diverifikasi dengan `node --check`
  - file yang sudah ada tidak pernah ditimpa tanpa konfirmasi eksplisit (.ya)
*/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { isOwner } from '../lib/cek-akses.js'
import { sendStyledReply } from '../lib/reply-style.js'
import { pluginStore } from './pemuat-plugin.js'

const execFileAsync = promisify(execFile)

/* unduhan media bisa diganti di pengujian (default: baileys asli) */
async function unduhMediaBawaan(conn, raw) {
  return downloadMediaMessage(raw, 'buffer', {}, { logger: conn?.logger, reuploadRequest: conn?.updateMediaMessage })
}
let unduhMedia = unduhMediaBawaan
export function setMediaDownloader(fn) {
  unduhMedia = typeof fn === 'function' ? fn : unduhMediaBawaan
}

const DIR_CORE = path.dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = path.resolve(DIR_CORE, '../plugins')

const MAX_FILE_BYTES = 300 * 1024 // 300 KB — plugin beneran tidak perlu lebih
const SESSION_TTL_MS = 5 * 60 * 1000 // sesi hangus setelah 5 menit diam

/* sesi per "chat:sender" — hanya ada satu job instal per pengirim per chat */
const sesi = new Map()

/* ── util ─────────────────────────────────────────────────────────────── */

function unwrapMessage(message) {
  if (!message) return null
  return (
    message.ephemeralMessage?.message ||
    message.viewOnceMessage?.message ||
    message.viewOnceMessageV2?.message ||
    message.documentWithCaptionMessage?.message ||
    message
  )
}

function rapikanNamaFolder(nilai) {
  const nama = String(nilai || '').trim().toLowerCase()
  if (!nama) return { ok: false, alasan: 'Nama menu kosong. Contoh: .addplugins game' }
  if (nama.includes('..') || /[/\\]/.test(nama)) {
    return { ok: false, alasan: `Nama menu "${nama}" tidak aman (jangan pakai / \\ atau ..)` }
  }
  if (!/^[a-z0-9_-]{1,24}$/.test(nama)) {
    return { ok: false, alasan: `Nama menu "${nama}" tidak valid. Pakai huruf/angka/-/_ maks 24 karakter. Contoh: game, downloader, tools` }
  }
  return { ok: true, nama }
}

function rapikanNamaFile(nilai) {
  let nama = String(nilai || '').trim()
  if (!nama) return { ok: false, alasan: 'Nama file tidak terbaca.' }
  nama = path.basename(nama) // buang direktori kalau user kirim "a/b.js"
  nama = nama.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^[-.]+/, '')
  if (!nama) return { ok: false, alasan: 'Nama file tidak valid.' }
  if (!nama.toLowerCase().endsWith('.js')) nama += '.js'
  if (!/^[a-z0-9][a-z0-9_.-]{0,60}\.js$/i.test(nama) || nama.includes('..')) {
    return { ok: false, alasan: `Nama file "${nama}" tidak valid. Pakai nama sederhana, contoh: ytmp3.js` }
  }
  return { ok: true, nama }
}

function targetAman(menu, namaFile) {
  const folder = path.resolve(PLUGIN_ROOT, menu)
  const target = path.resolve(folder, namaFile)
  /* pagar terakhir: hasil resolve wajib tetap di dalam plugins/<menu>/ */
  if (folder !== PLUGIN_ROOT && !folder.startsWith(PLUGIN_ROOT + path.sep)) return null
  if (!target.startsWith(folder + path.sep)) return null
  return { folder, target }
}

function teksMenunggu(namaMenu) {
  return [
    '📥 *ADD PLUGINS*',
    '',
    `Menu tujuan : *${namaMenu}*`,
    `Folder      : plugins/${namaMenu}/`,
    '',
    'Balas pesan ini dengan:',
    '📎 *File .js* (dokumen), atau',
    '✏️ *Kode plugin* (tempel langsung, min. 1 baris kode)',
    '',
    `Ketik *.batal* untuk membatalkan · sesi hangus 5 menit · maks ${(MAX_FILE_BYTES / 1024).toFixed(0)} KB`,
  ].join('\n')
}

function infoBerhasil(namaMenu, namaFile, ukuran, hotReload) {
  return [
    '✅ *PLUGIN TERPASANG*',
    '',
    `📁 Menu    : ${namaMenu}`,
    `📄 File    : ${namaFile}`,
    `📍 Lokasi  : plugins/${namaMenu}/${namaFile}`,
    `📦 Ukuran  : ${ukuran}`,
    hotReload
      ? '♻️ Status  : aktif tanpa restart (hot-reload)'
      : '⚠️ Status  : tersimpan — bot perlu restart agar aktif',
  ].join('\n')
}

async function cekSintaks(filePath) {
  try {
    await execFileAsync(process.execPath, ['--check', filePath], { timeout: 15000 })
    return { ok: true }
  } catch (err) {
    const detail = String(err?.stderr || err?.message || '').trim().split('\n').slice(0, 6).join('\n')
    return { ok: false, detail: detail || 'sintaks tidak valid' }
  }
}

function namaFileDariKode(kode) {
  const cmd = kode.match(/handler\.command\s*=\s*\/?\^?([a-z0-9_-]{2,24})/i)
  if (cmd) return `${cmd[1].toLowerCase()}.js`
  const judul = kode.match(/^\/\*[*!]?\s*([\w-]{2,24})/m)
  if (judul) return `${judul[1].toLowerCase()}.js`
  return `plugin-${Date.now()}.js`
}

async function pasangFile({ conn, chat, raw, sesi: s, namaFileSaran }) {
  const nama = rapikanNamaFile(namaFileSaran)
  if (!nama.ok) {
    await sendStyledReply(conn, chat, `❌ ${nama.alasan}`, { originalMessage: raw })
    return true
  }
  const aman = targetAman(s.menu, nama.nama)
  if (!aman) {
    await sendStyledReply(conn, chat, '❌ Path tujuan tidak aman. Instalasi dibatalkan.', { originalMessage: raw })
    sesi.delete(s.id)
    return true
  }

  /* file sudah ada → jangan timpa diam-diam, minta konfirmasi.
     s.disetujui = owner sudah bilang .ya → lewati pertanyaan kedua. */
  if (fs.existsSync(aman.target) && !s.disetujui) {
    s.pending = { namaFile: nama.nama, buffer: s.buffer }
    s.konfirmasi = true
    await sendStyledReply(
      conn,
      chat,
      `⚠️ File *plugins/${s.menu}/${nama.nama}* sudah ada.\n\nBalas *.ya* untuk menimpa, atau *.batal* untuk membatalkan.`,
      { originalMessage: raw }
    )
    return true
  }

  try {
    fs.mkdirSync(aman.folder, { recursive: true })
    fs.writeFileSync(aman.target, s.buffer)
  } catch (err) {
    await sendStyledReply(conn, chat, `❌ Gagal menyimpan file: ${err.message}`, { originalMessage: raw })
    sesi.delete(s.id)
    return true
  }

  const ukuran = `${(s.buffer.length / 1024).toFixed(1)} KB`
  const cek = await cekSintaks(aman.target)
  if (!cek.ok) {
    try { fs.unlinkSync(aman.target) } catch {}
    await sendStyledReply(
      conn,
      chat,
      `❌ Sintaks plugin tidak valid — file dihapus agar tidak merusak bot.\n\n\`\`\`\n${cek.detail}\n\`\`\``,
      { originalMessage: raw }
    )
    return true
  }

  sesi.delete(s.id)

  /* watcher chokidar memuat file baru; konfirmasi lewat pluginStore */
  const relatif = path.relative(PLUGIN_ROOT, aman.target)
  let hotReload = Boolean(pluginStore.get(relatif))
  if (!hotReload) {
    await new Promise((r) => setTimeout(r, 2500))
    hotReload = Boolean(pluginStore.get(relatif))
  }

  await sendStyledReply(conn, chat, infoBerhasil(s.menu, nama.nama, ukuran, hotReload), { originalMessage: raw })
  return true
}

/* ── mulai sesi (dipanggil plugin .addplugins) ────────────────────────── */

export async function startSession(m, conn) {
  const id = `${m.chat}:${m.sender}`
  const cekMenu = rapikanNamaFolder(m.text)

  if (!cekMenu.ok) {
    const daftar = fs
      .readdirSync(PLUGIN_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
    await m.reply(
      [
        `❌ ${cekMenu.alasan}`,
        '',
        '*Menu yang tersedia:*',
        daftar.map((d) => `▸ ${d}`).join('\n'),
        '',
        'Pakai: .addplugins <nama-menu>',
      ].join('\n')
    )
    return { success: false }
  }

  sesi.set(id, { id, menu: cekMenu.nama, buffer: null, konfirmasi: false, disetujui: false, pending: null, waktu: Date.now() })
  await m.reply(teksMenunggu(cekMenu.nama))
  return { success: true }
}

export function activeSessionCount() {
  return sesi.size
}

/* batalkan sesi milik pasangan chat:sender (untuk .cancelplugin) */
export async function cancelSession(chat, sender, conn) {
  const id = `${chat}:${sender}`
  if (!sesi.has(id)) return { success: false }
  sesi.delete(id)
  try {
    await sendStyledReply(conn, chat, '🚫 Sesi .addplugins dibatalkan.', {})
  } catch {}
  return { success: true }
}

/* ── hook pesan lanjutan (dipanggil router untuk SETIAP pesan masuk) ─────
   Return true bila pesan dikonsumsi (jangan diproses router lagi).        */

export async function handleInstallMessage(conn, raw, { chat, sender, isSelf }) {
  if (isSelf) return false
  const id = `${chat}:${sender}`
  const s = sesi.get(id)
  if (!s) return false

  /* sesi hangus? */
  if (Date.now() - s.waktu > SESSION_TTL_MS) {
    sesi.delete(id)
    return false
  }
  s.waktu = Date.now()

  /* hanya owner yang boleh melanjutkan */
  if (!(await isOwner(sender, conn, { groupId: chat }))) {
    sesi.delete(id)
    await sendStyledReply(conn, chat, 'Sesi .addplugins dihentikan — hanya owner yang boleh melanjutkan.', { originalMessage: raw })
    return true
  }

  const messageContent = unwrapMessage(raw.message) || {}
  const doc = messageContent.documentMessage || null
  const teks = (
    messageContent.conversation ||
    messageContent.extendedTextMessage?.text ||
    messageContent.imageMessage?.caption ||
    messageContent.videoMessage?.caption ||
    ''
  ).trim()

  /* perintah kontrol */
  if (teks) {
    const perintah = teks.toLowerCase().replace(/^[./]/, '')
    if (perintah === 'batal' || perintah === 'cancel') {
      sesi.delete(id)
      await sendStyledReply(conn, chat, '🚫 Instalasi plugin dibatalkan.', { originalMessage: raw })
      return true
    }
    if (s.konfirmasi && perintah === 'ya') {
      const pending = s.pending
      if (!pending?.buffer) {
        sesi.delete(id)
        return true
      }
      s.buffer = pending.buffer
      s.konfirmasi = false
      s.disetujui = true
      s.pending = null
      return pasangFile({ conn, chat, raw, sesi: s, namaFileSaran: pending.namaFile })
    }
  }

  /* 1) reply/kirim DOKUMEN .js */
  if (doc) {
    const namaAsli = String(doc.fileName || '').trim()
    const mime = String(doc.mimetype || '').toLowerCase()
    const ekstensiJs = namaAsli.toLowerCase().endsWith('.js') || mime.includes('javascript')
    if (!ekstensiJs) {
      await sendStyledReply(
        conn,
        chat,
        `❌ File harus *.js* (diterima: ${namaAsli || mime || 'tidak dikenal'}). Kirim ulang file plugin .js atau ketik *.batal*.`,
        { originalMessage: raw }
      )
      return true
    }
    if (Number(doc.fileLength || 0) > MAX_FILE_BYTES) {
      await sendStyledReply(
        conn,
        chat,
        `❌ File terlalu besar (maks ${(MAX_FILE_BYTES / 1024).toFixed(0)} KB, diterima ${(
          Number(doc.fileLength || 0) / 1024
        ).toFixed(0)} KB).`,
        { originalMessage: raw }
      )
      return true
    }
    try {
      const buffer = await unduhMedia(conn, raw)
      if (!buffer?.length) throw new Error('media kosong')
      s.buffer = Buffer.from(buffer)
      return pasangFile({ conn, chat, raw, sesi: s, namaFileSaran: namaAsli })
    } catch (err) {
      await sendStyledReply(conn, chat, `❌ Gagal mengunduh file: ${err.message}`, { originalMessage: raw })
      return true
    }
  }

  /* 2) kode JavaScript ditempel langsung */
  const tampakKode =
    teks.length >= 40 &&
    /(import\s|export\s|const\s+handler|function\s|require\(|=>)/.test(teks) &&
    !teks.startsWith('.')
  if (tampakKode) {
    if (Buffer.byteLength(teks, 'utf8') > MAX_FILE_BYTES) {
      await sendStyledReply(conn, chat, `❌ Kode terlalu besar (maks ${(MAX_FILE_BYTES / 1024).toFixed(0)} KB).`, { originalMessage: raw })
      return true
    }
    s.buffer = Buffer.from(teks, 'utf8')
    return pasangFile({ conn, chat, raw, sesi: s, namaFileSaran: namaFileDariKode(teks) })
  }

  /* pesan lain saat sesi aktif → ingatkan, jangan hentikan sesi */
  await sendStyledReply(
    conn,
    chat,
    '⏳ Masih menunggu *file .js* atau *kode plugin* untuk sesi .addplugins.\nKetik *.batal* jika ingin membatalkan dulu.',
    { originalMessage: raw }
  )
  return true
}
