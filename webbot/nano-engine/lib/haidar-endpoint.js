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

/* ==========================================================================
   Pabrik handler HaidarApis per kategori.

   Tiap kategori endpoint penyedia jadi SATU plugin sendiri, dan kategori itu
   dipasang ke kategori menu bot yang sepadan, mis.:

     kategori API "downloader" -> menu *DOWNLOAD*  (bareng fitur download lama)
     kategori API "games"      -> menu *GAME*
     kategori API "tools"      -> menu *TOOLS*
     kategori API "ai"         -> menu *AI*

   Karena menu membaca plugin.menuHelp (lihat lib/menu.js), seluruh nama
   perintah di kategori itu ikut tampil — bukan cuma satu baris contoh.

   Berkas pluginnya sendiri dihasilkan oleh:
     node scripts/generate-haidar-commands.mjs
   ========================================================================== */

import { getConfig, loadCommands } from './haidar.js'
import { guardAkses, runEndpoint } from './haidar-aksi.js'

/*
  kategori API -> kategori menu bot.

  Namanya selalu FUNGSI fiturnya, bukan nama penyedia layanannya:
    • CapCut  → hasilnya berkas video       → download
    • iLoveIMG, TextPro → mengolah/membuat gambar → image
    • iLovePDF → mengolah dokumen PDF       → pdf
    • MovieBox → nonton film                → film
    • Spotify  → musik                      → music

  Yang belum terdaftar di sini otomatis memakai nama kategorinya sendiri.
*/
export const KATEGORI_MENU = {
  agility: 'agility',
  ai: 'ai',
  'ai-image': 'ai-image',
  agama: 'agama',
  anime: 'anime',
  aplikasi: 'aplikasi',
  berita: 'news',
  news: 'news',
  capcut: 'download',
  core: 'main',
  dracin: 'dracin',
  downloader: 'download',
  film: 'film',
  games: 'game',
  iloveimg: 'image',
  ilovepdf: 'pdf',
  info: 'info',
  moviebox: 'film',
  primbon: 'primbon',
  random: 'random',
  search: 'search',
  spotify: 'music',
  textpro: 'image',
  tools: 'tools',
}

export function kategoriMenu(apiCategory) {
  return KATEGORI_MENU[apiCategory] || apiCategory
}

/** Semua perintah pada satu kategori endpoint. */
export function perintahKategori(apiCategory) {
  return loadCommands().commands.filter((item) => item.category === apiCategory)
}

/** Daftar kategori endpoint yang punya perintah. */
export function daftarKategoriApi() {
  const seen = new Map()
  for (const item of loadCommands().commands) {
    seen.set(item.category, (seen.get(item.category) || 0) + 1)
  }
  return [...seen.entries()].map(([category, total]) => ({ category, total, menu: kategoriMenu(category) }))
}

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/*
  Bangun handler untuk satu kategori endpoint. Dipakai oleh berkas-berkas
  plugins/haidar/api-<kategori>.js.
*/
export function buatHandlerKategori(apiCategory) {
  const commands = perintahKategori(apiCategory)
  const names = commands.map((item) => item.command)
  const byCommand = new Map(commands.map((item) => [String(item.command).toLowerCase(), item]))
  const menuCategory = kategoriMenu(apiCategory)

  const handler = async (m, { conn, usedPrefix }) => {
    const spec = byCommand.get(String(m.command || '').toLowerCase())
    if (!spec) return

    const { blocked } = await guardAkses(m, conn)
    if (blocked) return

    await runEndpoint(m, conn, spec.path, String(m.args?.join(' ') || ''), usedPrefix || '.')
  }

  handler.command = names.length ? new RegExp(`^(${names.map(escapeRe).join('|')})$`, 'i') : /(?!)/i
  handler.help = names
  handler.menuHelp = names

  /*
    Kategori ai/download/search memang masuk daftar "pakai limit" di bot ini
    (core/status-command.js). Supaya bisa diatur tanpa membongkar kode, nilai
    limit dibaca saat dipakai: owner tinggal kirim ".hai limit on|off".
  */
  Object.defineProperty(handler, 'limit', {
    get: () => getConfig().pakaiLimit !== false,
    enumerable: true,
    configurable: true,
  })
  handler.tags = [menuCategory, 'haidar']
  handler.category = menuCategory
  handler.description = names.length
    ? `${names.length} fitur kategori ${apiCategory} dari HaidarApis`
    : `Kategori ${apiCategory} HaidarApis (belum ada perintah)`

  return handler
}

export default { KATEGORI_MENU, kategoriMenu, perintahKategori, daftarKategoriApi, buatHandlerKategori }
