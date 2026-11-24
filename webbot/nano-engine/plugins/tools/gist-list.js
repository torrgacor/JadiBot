/*
⌬ Nano Ai · Daftar fitur scrape
  .gist / .gistlist → daftar semua command hasil scrape, dikelompokkan per
  KATEGORI MENU (download, stiker, tools, …) — kelompok yang sama dengan menu
  bot, jadi tidak ada lagi pengelompokan yang dinamai dari sumbernya.

  Perintah ini sengaja tidak ditampilkan di menu: ia cuma daftar pendukung,
  bukan fitur. Ketik .gist kapan saja untuk melihat seluruh daftarnya.
*/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kategoriSlug, dilewati, KATEGORI_GIST } from '../../lib/gist/kategori.js'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const MANIFEST = JSON.parse(fs.readFileSync(path.join(DIR, '../../lib/gist/manifest.json'), 'utf8'))

/* judul tiap kelompok di dalam daftar */
const NAMA_KAT = {
  download: '⬇️ Download',
  stalker: '🕵️ Stalker',
  sticker: '🧩 Stiker',
  search: '🔍 Pencarian',
  anime: '🌸 Anime',
  dracin: '🎬 Drama',
  news: '📰 Berita',
  ai: '🤖 AI',
  'ai-image': '🖼️ AI Gambar',
  image: '🖼️ Gambar',
  pdf: '📄 PDF',
  agama: '🕌 Islami',
  random: '🎲 Hiburan',
  tools: '🛠️ Tools',
}

async function handler(m, { conn }) {
  const perKat = new Map()
  for (const x of MANIFEST) {
    if (dilewati(x.cmd)) continue
    const kat = kategoriSlug(x.slug)
    if (!perKat.has(kat)) perKat.set(kat, [])
    perKat.get(kat).push(x)
  }

  const bagian = []
  let total = 0

  /* urutan kelompok mengikuti urutan kategori di lib/gist/kategori.js */
  for (const kat of Object.keys(KATEGORI_GIST)) {
    const list = perKat.get(kat)
    if (!list?.length) continue

    total += list.length
    const baris = [...list]
      .sort((a, b) => a.cmd.localeCompare(b.cmd))
      .map((x) => `.${x.cmd}${x.media ? ' 📎' : ''}`)

    bagian.push(`*${NAMA_KAT[kat] || `📁 ${kat}`}* (${list.length})`)
    /* pecah per 6 per baris grup agar tidak terlalu panjang vertikal */
    for (let i = 0; i < baris.length; i += 6) {
      bagian.push(baris.slice(i, i + 6).join('  ·  '))
    }
    bagian.push('')
  }

  const teks = [
    '🌐 *DAFTAR FITUR*',
    `Total *${total}* fitur · 📎 = kirim/reply media`,
    '',
    ...bagian,
    '_Ketik command di atas langsung, contoh: .npmsearch baileys_',
  ].join('\n')

  return conn.sendMessage(m.chat, { text: teks }, { quoted: m.raw })
}

handler.command = /^(gist|gistlist)$/i
handler.help = ['gist', 'gistlist']
handler.tags = ['tools']
handler.category = 'tools'
/* menuHelp kosong = tidak ikut tampil di daftar menu */
handler.menuHelp = []
handler.description = 'Daftar semua fitur hasil scrape, dikelompokkan per kategori menu'
handler.limit = false

export default handler
