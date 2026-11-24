/*
⌬ Nano Ai · Katalog plugin (dibaca panel)

  Memuat SEMUA plugin dengan pemuat asli bot (core/pemuat-plugin.js), lalu
  mencetak katalognya sebagai satu baris JSON ke stdout dengan penanda
  `===KATALOG===`. Panel NANO GATEWAY yang memakainya untuk halaman
  "Kemampuan Bot" dan daftar Perintah.

  Kenapa harus memuat, bukan membaca isi berkas? Karena kategori, daftar
  perintah, dan status limit sebuah plugin sering BARU diketahui saat handler-nya
  dibentuk (mis. plugin kategori API memakai lib/*-endpoint.js). Pemindai yang
  membaca teks berkas akan salah menghitung plugin seperti itu — dan panel jadi
  beda angka dengan menu bot. Di sini yang dipakai adalah hasil pemuatan yang
  sama persis dengan yang bot jalankan.

  Dua daftar per handler:
    • commands — persis yang tampil di menu bot (`menuHelp`, atau `help[0]` bila
      plugin tidak menentukan menuHelp). SEMUA angka di panel dihitung dari
      daftar ini, jadi angkanya sama dengan .allmenu bot.
    • aliases  — sisa nama yang tetap dijawab bot tapi tidak dipamerkan di menu.
      Tetap ikut dicari di halaman Perintah, tidak dihitung sebagai fitur.

  Pemakaian:
    node scripts/katalog-plugin.mjs            # cetak katalog (JSON)
    node scripts/katalog-plugin.mjs --ringkas  # cetak ringkasan yang mudah dibaca
*/

import path from 'node:path'
import { loadAllPlugins, pluginStore } from '../core/pemuat-plugin.js'
import { getCommandStatus } from '../core/status-command.js'

const ringkas = process.argv.includes('--ringkas')

const { total, loaded, handlers } = await loadAllPlugins()

function namaUnik(...daftar) {
  const unik = new Set()
  for (const nilai of daftar.flat()) {
    if (typeof nilai !== 'string') continue
    const bersih = nilai.trim()
    if (bersih) unik.add(bersih)
  }
  return [...unik]
}

/*
  Sama dengan aturan lib/menu.js: menuHelp bila ada, kalau tidak cukup nama
  pertama dari help. Sengaja disamakan supaya angka panel tidak pernah beda
  dengan yang dilihat pengguna di bot.
*/
function perintahMenu(handler) {
  if (Array.isArray(handler.menuHelp)) return namaUnik(handler.menuHelp)
  const help = Array.isArray(handler.help) ? handler.help : [handler.help]
  return namaUnik(help.slice(0, 1))
}

function namaAlias(handler) {
  const help = Array.isArray(handler.help) ? handler.help : [handler.help]
  const menuHelp = Array.isArray(handler.menuHelp) ? handler.menuHelp : []
  const menu = perintahMenu(handler)
  return namaUnik(help, menuHelp).filter((nama) => !menu.includes(nama))
}

/* berapa handler per berkas → untuk memberi id unik pada berkas multi-kategori */
const perBerkas = new Map()
for (const key of pluginStore.keys()) {
  const file = key.split('#')[0]
  perBerkas.set(file, (perBerkas.get(file) || 0) + 1)
}

const plugins = []
const kategori = new Map()

for (const [key, handler] of pluginStore) {
  const file = key.split('#')[0]
  const name = path.basename(file, '.js')
  const category = String(handler.category || 'umum').trim().toLowerCase() || 'umum'
  const commands = perintahMenu(handler)
  const aliases = namaAlias(handler)
  const status = getCommandStatus(handler)

  plugins.push({
    id: perBerkas.get(file) > 1 ? `${file}#${category}` : file,
    file,
    name: perBerkas.get(file) > 1 ? `${name} · ${category}` : name,
    category,
    commands,
    aliases,
    help: commands,
    tags: Array.isArray(handler.tags) ? handler.tags.map(String) : [],
    description: typeof handler.description === 'string' ? handler.description : null,
    /* `unlimited` = plugin TIDAK memakai limit harian, menurut aturan yang
       ditegakkan bot (core/status-command.js) — bukan tebakan dari teks. */
    unlimited: !status.limit,
    groupOnly: Boolean(status.group),
    ownerOnly: Boolean(status.owner),
    /* `premium` = perintah hanya untuk pengguna premium (handler.premium),
       dibaca dari aturan yang sama dengan yang ditegakkan router. */
    premium: Boolean(status.premium),
    privateOnly: handler.privateOnly === true || handler.onlyPc === true,
    adminOnly: handler.adminOnly === true || handler.isAdmin === true,
    valid: true,
  })

  const isi = kategori.get(category) || { berkas: new Set(), commands: 0 }
  isi.berkas.add(file)
  isi.commands += commands.length
  kategori.set(category, isi)
}

const categories = [...kategori.entries()]
  .map(([name, isi]) => ({ name, count: isi.berkas.size, commands: isi.commands }))
  .sort((a, b) => b.commands - a.commands || a.name.localeCompare(b.name))

const hasil = {
  files: { total, loaded },
  handlers,
  totalCommands: [...kategori.values()].reduce((jumlah, isi) => jumlah + isi.commands, 0),
  categories,
  plugins,
}

if (ringkas) {
  console.log(`berkas plugin : ${loaded}/${total} terdaftar · handler: ${handlers}`)
  console.log(`kategori      : ${categories.length} · perintah menu: ${hasil.totalCommands}`)
  for (const k of categories) {
    console.log(`  ${k.name.padEnd(12)} berkas=${String(k.count).padStart(3)}  perintah=${String(k.commands).padStart(4)}`)
  }
  const alias = plugins.reduce((jumlah, p) => jumlah + p.aliases.length, 0)
  console.log(`alias (tidak dihitung, tetap bisa diketik): ${alias}`)
} else {
  console.log(`===KATALOG===${JSON.stringify(hasil)}`)
}

/*
  Keluar sendiri: sebagian plugin meninggalkan timer/koneksi di latar saat
  diimpor, dan proses ini memang cuma sekali jalan — menunggu event loop kosong
  bisa menggantung selamanya.
*/
process.exit(0)
