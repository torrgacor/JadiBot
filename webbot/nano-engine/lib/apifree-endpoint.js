/* ==========================================================================
   Pabrik handler API GRATIS per kategori.

   Tiap kategori endpoint jadi satu plugin (plugins/apifree/api-<kategori>.js)
   dan dipasang ke kategori menu bot yang sepadan, jadi seluruh nama
   perintahnya ikut tampil di menu — bukan cuma satu baris contoh.

   Berkas pluginnya dibuat oleh:
     node scripts/generate-apifree-commands.mjs
   ========================================================================== */

import { loadCommands, KATEGORI_MENU, kategoriMenu } from './apifree.js'
import { guardAkses, runEndpoint, getConfig } from './apifree-aksi.js'

export { KATEGORI_MENU, kategoriMenu }

/*
  Pengelompokan memakai kategori MENU, bukan kategori katalog, supaya satu
  kelompok fitur hanya jadi satu plugin & satu baris kategori di menu.
  Contoh: canvas + canvas-maker + maker + image semuanya di plugin api-image.
*/
export function perintahKategori(kategori) {
  const key = String(kategori || '').trim().toLowerCase()
  return loadCommands().commands.filter(
    (item) => String(item.menu || kategoriMenu(item.category)).toLowerCase() === key,
  )
}

export function daftarKategori() {
  const bucket = new Map()
  for (const item of loadCommands().commands) {
    const menu = String(item.menu || kategoriMenu(item.category)).toLowerCase()
    const isi = bucket.get(menu) || { kategori: menu, total: 0, katalog: new Set() }
    isi.total++
    isi.katalog.add(item.category)
    bucket.set(menu, isi)
  }
  return [...bucket.values()].map((k) => ({ kategori: k.kategori, total: k.total, menu: k.kategori, katalog: [...k.katalog] }))
}

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function buatHandlerKategori(kategori) {
  const commands = perintahKategori(kategori)
  const names = commands.map((item) => item.command)
  const byCommand = new Map(commands.map((item) => [String(item.command).toLowerCase(), item]))
  const menu = String(kategori || '').trim().toLowerCase() || kategoriMenu(kategori)

  const handler = async (m, { conn, usedPrefix }) => {
    const spec = byCommand.get(String(m.command || '').toLowerCase())
    if (!spec) return

    const { blocked } = await guardAkses(m, conn)
    if (blocked) return

    // penyedia ikut dikirim: path bisa kembar antar penyedia
    await runEndpoint(m, conn, spec.path, String(m.args?.join(' ') || ''), usedPrefix || '.', spec.command, spec.provider)
  }

  handler.command = names.length ? new RegExp(`^(${names.map(escapeRe).join('|')})$`, 'i') : /(?!)/i
  handler.help = names
  handler.menuHelp = names
  handler.tags = [menu, 'apifree']
  handler.category = menu
  handler.description = names.length
    ? `${names.length} fitur kategori ${kategori} dari API Gratis`
    : `Kategori ${kategori} API Gratis (kosong)`

  /* Kategori ai/download/search ikut aturan "pakai limit" bot ini; nilainya
     dibaca saat dipakai supaya owner bisa ubah tanpa restart. */
  Object.defineProperty(handler, 'limit', {
    get: () => getConfig().pakaiLimit !== false,
    enumerable: true,
    configurable: true,
  })

  return handler
}

export default { KATEGORI_MENU, kategoriMenu, perintahKategori, daftarKategori, buatHandlerKategori }
