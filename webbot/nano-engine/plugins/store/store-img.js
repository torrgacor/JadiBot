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


/* ═══════════════════════════════════════════════════════════════════
   STORE — Gambar produk (.setimg).

   ownerOnly. Owner mengirim foto (dengan atau tanpa reply ke produk),
   bot menyimpan salinannya ke folder data per-bot dan menulis PATH-nya
   ke kolom image produk. Kartu produk/detail lalu memakai path itu sebagai
   header gambar — jadi produk benar-benar tampil bergambar, bukan sekadar
   kolom teks.

   Gambar DISALIN ke folder data, bukan dicatat ke cache WhatsApp: kalau
   hanya menyimpan URL sementara, gambar akan hilang setelah cache
   WhatsApp kedaluwarsa (biasanya beberapa hari). Folder ikut
   dibersihkan oleh .resetstore dan dibersihkan penuh saat start ulang.
   ═══════════════════════════════════════════════════════════════════ */

import path from 'node:path'
import { mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import pino from 'pino'
import * as store from '../../core/store/db.js'
import * as ui from '../../core/store/ui.js'
import { isOwner } from '../../lib/cek-akses.js'

const logger = pino({ level: 'silent' })

/* Folder gambar produk. NANO_DATA_DIR dipakai agar tiap bot di gateway
   punya foldernya sendiri — sama seperti database-nya (lihat core/sqlite.js). */
const FOLDER = process.env.NANO_DATA_DIR
  ? path.resolve(process.env.NANO_DATA_DIR, 'store-images')
  : path.resolve('data', 'store-images')

/* Batas ukuran gambar yang disimpan. Lebih besar dari ini tidak masuk
   katalog — bukan karena format, tapi karena file sebesar itu akan
   memperlambat setiap kartu produk yang memuatnya. */
const MAKS_MB = 3

/* Sesi singkat: owner menekan setimg untuk produk X, lalu mengirim
   foto (dengan atau tanpa reply). Sesi ini hanya hidup 5 menit dan
   milik JID owner itu saja — foto milik orang lain tidak akan
   sampai ke produk toko. */
const TTL_SESIMIN = 5 * 60 * 1000
const sesi = new Map()

function ambilSesi(user) {
  const s = sesi.get(user)
  if (!s) return null
  if (Date.now() - s.waktu > TTL_SESIMIN) {
    sesi.delete(user)
    return null
  }
  return s
}

function namaAman(nama) {
  return String(nama)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'produk'
}

/* ── .setimg <id|nama> : buka sesi, tunggu foto ─────────────────────── */
async function mulaiSetImg(m, conn, prefix) {
  const target = String(m.text || '').trim()
  const produk = store.getProduct(Number(target)) || store.getProductByName(target)
  if (!produk) {
    return conn.sendMessage(
      m.chat,
      { text: `❌ Produk tidak ditemukan: *${target}*.\n\nCek daftar produk: *${prefix}store* → 📦 Daftar Produk` },
      { quoted: m.raw }
    )
  }

  sesi.set(m.sender, { productId: produk.id, waktu: Date.now() })

  const k = ui.kartu({
    title: '🖼️ SET GAMBAR PRODUK',
    lines: [
      `Produk : *${ui.potong(produk.name, 40)}*`,
      '',
      'Sekarang kirim foto untuk produk ini.',
      'Boleh dengan atau tanpa reply.',
      `Sesi berlaku 5 menit.`,
    ],
    footer: 'Kirim foto, atau tekan BATAL',
    buttons: [
      { label: '✕ BATAL', command: ui.aksi(prefix, 'batalimg') },
      { label: '📦 PRODUK', command: ui.aksi(prefix, 'ownerproduk', '0') },
    ],
  })
  return ui.kirimKartu(conn, m.chat, k, { quoted: m.raw })
}

/* ── Interceptor: foto owner saat sesi setimg aktif ─────────────────── */
/*
 * Dipasang sebagai `before` pada plugin. Router memanggil before untuk
 * SEMUA pesan sebelum dievaluasi sebagai perintah — itu yang dipakai di
 * sini, karena foto tidak punya prefix sama sekali.
 *
 * Mengembalikan true = pesan sudah dikonsumsi (hentikan pemrosesan).
 * Mengembalikan false = bukan milik Store, biarkan router lanjut.
 */
export async function before(conn, raw, { chat, sender, isSelf }) {
  if (isSelf) return false

  const teks = String(raw?.message?.conversation || raw?.message?.extendedTextMessage?.text || '').trim()
  if (teks) {
    /* Perintah pembatal dari tombol. */
    if (/^\.store\s+batalimg$/i.test(teks)) {
      if (!ambilSesi(sender)) return false
      sesi.delete(sender)
      await conn.sendMessage(chat, { text: '✕ Sesi set gambar dibatalkan.' }, { quoted: raw })
      return true
    }
    return false
  }

  const gambar = raw?.message?.imageMessage
  if (!gambar) return false

  const s = ambilSesi(sender)
  if (!s) return false

  /* Owner-only diulang di sini: `before` dijalankan router untuk semua
     orang, termasuk sebelum pemeriksaan owner. */
  const boleh = await isOwner(sender, conn, { groupId: chat })
  if (!boleh) {
    await conn.sendMessage(chat, { text: '🔒 Hanya owner toko yang bisa mengatur gambar produk.' }, { quoted: raw })
    return true
  }

  const produk = store.getProduct(s.productId)
  if (!produk) {
    sesi.delete(sender)
    await conn.sendMessage(chat, { text: '❌ Produk sudah tidak ada. Ulangi `.setimg`.' }, { quoted: raw })
    return true
  }

  try {
    const buffer = await downloadMediaMessage(
      { key: raw.key, message: { imageMessage: gambar } },
      'buffer',
      {},
      { logger, reuploadRequest: conn.updateMediaMessage }
    )
    if (!buffer?.length) throw new Error('unduhan kosong')
    if (buffer.length > MAKS_MB * 1024 * 1024) {
      throw new Error(`ukuran ${(buffer.length / 1024 / 1024).toFixed(1)} MB melebihi batas ${MAKS_MB} MB`)
    }

    mkdirSync(FOLDER, { recursive: true })
    const file = path.join(FOLDER, `${produk.id}-${namaAman(produk.name)}.jpg`)
    const { writeFile } = await import('node:fs/promises')
    await writeFile(file, buffer)

    /* Path absolut disimpan apa adanya. resolveImageBuffer di lib/tombol.js
       menerima path absolut, dan folder ini milik bot sendiri — tidak
       ada input user yang ikut menentukan lokasi file. */
    store.updateProduct(produk.id, { image: file })
    sesi.delete(sender)

    await conn.sendMessage(
      chat,
      { text: `✅ Gambar disimpan untuk *${produk.name}*.\n\nFile: \`${file}\`` },
      { quoted: raw }
    )
    const k = ui.kartuDetailProduk(store.getProduct(produk.id), { prefix: '.' })
    await ui.kirimKartu(conn, chat, k, {})
    return true
  } catch (err) {
    sesi.delete(sender)
    await conn.sendMessage(
      chat,
      { text: `❌ Gagal menyimpan gambar: ${err.message || err}` },
      { quoted: raw }
    )
    return true
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const perintah = String(m.command || '').toLowerCase()

  if (perintah === 'setimg') return mulaiSetImg(m, conn, prefix)

  /* Semua perintah setimg lain hanya relevan lewat .store. */
  return false
}

handler.command = /^setimg$/i
handler.help = ['setimg']
handler.tags = ['owner', 'store']
/* Sama seperti store-owner.js: ini perintah toko, jadi tampil di .kategori
   store. Badge Ⓞ tetap muncul dari handler.ownerOnly. */
handler.category = 'store'
handler.ownerOnly = true
handler.before = before
handler.description = 'Pasang gambar produk (kirim foto setelahnya)'
handler.usage = 'setimg <id|nama produk>'

/* Bersihkan gambar produk yang produknya sudah dihapus. Dipanggil dari
   .resetstore supaya folder tidak tumbuh tanpa batas. */
export function bersihkanGambarYatim() {
  try {
    if (!existsSync(FOLDER)) return 0
    let dihapus = 0
    for (const file of readdirSync(FOLDER)) {
      const id = Number(String(file).split('-')[0])
      if (!Number.isInteger(id)) continue
      const produk = store.getProduct(id)
      if (!produk || !produk.image) {
        unlinkSync(path.join(FOLDER, file))
        dihapus++
      }
    }
    return dihapus
  } catch {
    return 0
  }
}

export default handler
