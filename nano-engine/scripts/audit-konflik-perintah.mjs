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
┇▫️Author  : Awang OfficiaL
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
   AUDIT KONFLIK PERINTAH.

   Yang dicek:
     1. Dua plugin (atau lebih) yang mendeklarasikan nama perintah yang SAMA.
        Router (core/router-pesan.js) memakai findPluginByCommand() yang
        mengembalikan plugin PERTAMA di pluginStore — yaitu plugin yang
        termuat duluan, bukan yang "lebih benar". Akibatnya plugin kedua
        jadi kode mati: perintahnya tetap terdaftar di help dan menu, tapi
        tidak pernah terpanggil.

        Ini yang pernah terjadi nyata: ".list" dimakan /dracin/list dari
        data/haidar-commands.json, jadi .store list produk malah membuka
        daftar drama Melolo. Pluginnya tidak error, tidak ada log — hanya
        hasil yang salah.

     2. Nama perintah plugin yang juga dipakai command hasil generator
        haidar (data/haidar-commands.json).

     3. Nama perintah plugin yang bentrok dengan RESERVED_EXTRA generator.

   Jalankan:  node scripts/audit-konflik-perintah.mjs
   Keluar:    tabel konflik. Exit 1 kalau ada konflik plugin-vs-plugin
              (yang harus diperbaiki manual), 0 kalau bersih.

   Script ini hanya MEMBACA. Tidak mengubah apa pun.
   ========================================================================== */

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pluginStore, loadAllPlugins, findPluginByCommand } from '../core/pemuat-plugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENGINE = path.resolve(__dirname, '..')

/* Plugin yang memang berhak memakai nama RESERVED_EXTRA. */
const RESERVED_PEMILIK = {
  hai: /haidar[/\\]haidar\.js$/,
  haidar: /haidar[/\\]haidar\.js$/,
  menu: /main[/\\]menu\.js$/,
  ping: /main[/\\]ping\.js$/,
  owner: /owner[/\\]owner\.js$/,
}

/* Ekstrak nama-nama perintah dari RegExp handler.command.
 *
 * Hanya bentuk yang dipakai repo ini yang dipahami: /^a|b|c$/i dan
 * /^(a|b|c)$/i. Bentuk lain dilaporkan sebagai "TIDAK TERPARSE" dan
 * diabaikan dengan suara keras — lebih baik terlihat mata daripada
 * diam-diam terlewat, karena plugin yang terlewat berarti audit ini
 * tidak bisa dipercaya. */
function namaDariRegex(re) {
  if (!(re instanceof RegExp)) return null
  let sumber = re.source
  // (?:... ) adalah group non-tangkap; audit ini tidak butuh penangkapan,
  // jadi perlakukan sama dengan (...) agar tidak ikut terlewat.
  sumber = sumber.replace(/^\^\(\?:/, '^(').replace(/\(\?:/, '(')
  const dalam = sumber.match(/^\^?\((.*)\)\$?$/)
  const badan = dalam ? dalam[1] : sumber.replace(/^\^/, '').replace(/\$$/, '')
  // "?" sesudah huruf = opsional (tutorialaddplugins? = tutorialaddplugin +
  // tutorialaddplugins)._lazy sedikit-delete supaya terbaca sebagai
  // dua nama, bukan regex yang gagal dimengerti.
  const bersih = badan.replace(/([a-z0-9])\?/gi, '$1')
  if (/[()[\]{}*+?\\^$|]/.test(bersih.replace(/\|/g, ''))) {
    return { tidakTerparse: re.source }
  }
  const nama = bersih.split('|').map((s) => s.trim().toLowerCase()).filter(Boolean)
  return { nama }
}

async function muatHaidar() {
  const f = path.join(ENGINE, 'data', 'haidar-commands.json')
  if (!existsSync(f)) return []
  try {
    const data = JSON.parse(await readFile(f, 'utf8'))
    const list = Array.isArray(data) ? data : data.commands || []
    return list.map((c) => ({ command: String(c.command || '').toLowerCase(), path: c.path, category: c.category }))
  } catch {
    return []
  }
}

const { loaded, total } = await loadAllPlugins()
console.log(`\n\x1b[36mPlugin termuat: ${loaded}/${total}\x1b[0m`)

/* Kumpulkan setiap nama perintah -> daftar plugin pemiliknya.
   pluginStore adalah Map dan iterasinya mengikuti urutan muat (= urutan
   kemunculan di filesystem), jadi urutan daftar di bawah ini persis
   urutan yang dipakai router untuk memilih pemenang. */
const pemilik = new Map()
const gagalParse = []

for (const [key, handler] of pluginStore.entries()) {
  const hasil = namaDariRegex(handler.command)
  const file = String(handler.filePath || key || '?')
  if (!hasil) continue
  if (hasil.tidakTerparse) {
    gagalParse.push({ file, sumber: hasil.tidakTerparse })
    continue
  }
  for (const nama of hasil.nama) {
    if (!pemilik.has(nama)) pemilik.set(nama, [])
    pemilik.get(nama).push({ file, handler })
  }
}

let konflikPlugin = 0
const Winners = []

console.log('\n\x1b[1m\x1b[33m① KONFLIK ANTAR PLUGIN\x1b[0m')
const bentrok = [...pemilik.entries()].filter(([, list]) => list.length > 1).sort((a, b) => a[0].localeCompare(b[0]))
if (!bentrok.length) {
  console.log('  \x1b[32m✓ tidak ada\x1b[0m')
} else {
  for (const [nama, list] of bentrok) {
    konflikPlugin++
    const pemenang = findPluginByCommand(nama)
    const filePemenang = String(pemenang?.filePath || '?')
    console.log(`\n  \x1b[31m✗ .${nama}\x1b[0m  dimiliki ${list.length} plugin`)
    for (const p of list) {
      const menang = p.file === filePemenang
      console.log(`      ${menang ? '\x1b[32m→ MENANG\x1b[0m' : '\x1b[31m✗ KALAH\x1b[0m '} ${p.file.replace(ENGINE + '/', '')}`)
    }
    const kalah = list.filter((p) => p.file !== filePemenang)
    console.log(`      perintah .${nama} milik yang menang: ${filePememing(filePemenang)}`)
    console.log(`      mati total: ${kalah.map((p) => p.file.replace(ENGINE + '/', '')).join(', ')}`)
  }
}

function filePememing(f) {
  return f.replace(ENGINE + '/', '')
}

/* ② plugin vs command generator haidar ---------------------------------- */
/*
 * Plugin di plugins/haidar/api-*.js ADALAH hasil generator itu sendiri —
 * mereka dibuat persis dari data/haidar-commands.json. Membandingkan
 * mereka dengan data yang sama selalu cocok, dan itu BUKAN konflik.
 * Yang berbahaya justru kebalikannya: command haidar yang namanya sama
 * dengan plugin biasa di luar folder haidar. Jadi hanya yang luar yang
 * dicek di sini.
 */
const DARI_HAIDAR = /[/\\]plugins[/\\]haidar[/\\]/
const haidar = await muatHaidar()
const namaHaidar = new Map(haidar.map((h) => [h.command, h]))
let konflikHaidar = 0
console.log('\n\x1b[1m\x1b[33m② PLUGIN NON-HAIDAR VS COMMAND HAIDAR\x1b[0m')
const tabrakanHaidar = [...pemilik.keys()].filter((n) => namaHaidar.has(n) && !pemilik.get(n).every((p) => DARI_HAIDAR.test(p.file))).sort()
if (!tabrakanHaidar.length) {
  console.log('  \x1b[32m✓ tidak ada\x1b[0m')
} else {
  for (const n of tabrakanHaidar) {
    konflikHaidar++
    const h = namaHaidar.get(n)
    console.log(`  \x1b[31m✗ .${n}\x1b[0m  plugin: ${filePememing(String(pemilik.get(n)[0].file))}`)
    console.log(`      haidar: ${h.path} (kategori ${h.category})`)
    console.log(`      \x1b[33m— generate-haidar-commands.mjs perlu dijalankan ulang\x1b[0m`)
  }
}

/* ③ RESERVED_EXTRA ------------------------------------------------------ */
let konflikReserved = 0
console.log('\n\x1b[1m\x1b[33m③ RESERVED (hai/haidar/menu/ping/owner)\x1b[0m')
/* RESERVED_EXTRA ada supaya GENERATOR tidak memakai nama itu. Plugin
   utamanya memang buang sprintf memakainya — itu disengaja, bukan
   konflik. Yangeri jadi masalah kalau ada plugin LAIN yang juga
   mengambil nama yang sama. */
const daftarReserved = ['hai', 'haidar', 'menu', 'ping', 'owner']
const bentrokReserved = daftarReserved.filter((n) => {
  const list = pemilik.get(n) || []
  return list.length > 1 || (list.length === 1 && !RESERVED_PEMILIK[n]?.test(list[0].file))
})
if (!bentrokReserved.length) {
  console.log('  \x1b[32m✓ tiap nama dipakai satu plugin yang memang pemiliknya\x1b[0m')
} else {
  konflikReserved = bentrokReserved.length
  for (const n of bentrokReserved) {
    console.log(`  \x1b[31m✗ .${n}\x1b[0m`)
    for (const p of pemilik.get(n)) console.log(`      ${filePememing(p.file)}`)
  }
}

/* ④ regex yang tidak berhasil diparse ---------------------------------- */
console.log('\n\x1b[1m\x1b[33m④ REGEX TIDAK TERPARSE\x1b[0m')
if (!gagalParse.length) {
  console.log('  \x1b[32m✓ semua pola dipahami\x1b[0m')
} else {
  for (const g of gagalParse) console.log(`  \x1b[33m! ${g.file.replace(ENGINE + '/', '')}: /${g.sumber}/`)
  console.log('  \x1b[33m  pola di atas TIDAK ikut diaudit\x1b[0m')
}

const totalKonflik = konflikPlugin + konflikHaidar + konflikReserved
console.log(`\n\x1b[1mRINGKASAN\x1b[0m`)
console.log(`  nama perintah plugin : ${pemilik.size}`)
console.log(`  konflik antar plugin  : ${konflikPlugin}`)
console.log(`  konflik vs haidar     : ${konflikHaidar}`)
console.log(`  konflik vs reserved   : ${konflikReserved}`)
console.log(`  regex tidak terparse  : ${gagalParse.length}`)

if (totalKonflik) {
  console.log(`\n\x1b[31m\x1b[1mADA ${totalKonflik} KONFLIK.\x1b[0m Plugin yang kalah tidak akan pernah terpanggil.`)
  process.exit(1)
}
console.log('\n\x1b[32m\x1b[1mBERSIH — tidak ada nama perintah yang bertabrakan.\x1b[0m')
process.exit(gagalParse.length ? 2 : 0)
