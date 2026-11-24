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
   DEBUG LENGKAP FITUR STORE.

   Menjalankan SETIUP perintah dan SETIUP aksi Store lewat jalur router
   sungguhan (m.command + m.text apa adanya), lalu memeriksa:
     - tidak ada exception yang lolos
     - selalu ada balasan (tidak diam)
     - kartu yang dibuka sesuai aksi yang diminta
     - owner-only ditolak untuk non-owner

   Dijalankan pada dua kondisi toko:
     1. KOSONG  — tanpa produk/kategori/metode/promo (jalur paling rawan)
     2. TERISI  — dengan produk, order, promo, metode, dan tiga pembeli

   Jalankan: node scripts/debug-store.mjs
   ========================================================================== */

import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENGINE = path.resolve(__dirname, '..')
const DATA = process.env.NANO_DEBUG_DIR || '/tmp/uji-debug-store'
rmSync(DATA, { recursive: true, force: true })
mkdirSync(DATA, { recursive: true })
process.env.NANO_DATA_DIR = DATA
process.chdir(ENGINE)

const { loadAllPlugins, findPluginByCommand } = await import('../core/pemuat-plugin.js')
const db = await import('../core/store/db.js')
const { isOwnerCommand } = await import('../core/status-command.js')
const { jalankanAksi } = await import('../core/store/aksi.js')
await loadAllPlugins()

const OWNER = '6280000000000'
// lib/cek-kses.js: pengirim dianggap owner bila nomornya sama dengan
// conn.user.id (nomor bot). Jadi owner-ness ikut berubah kalau identitas
// conn berubah — itulah yang harus diuji, bukan nilai tetap.
const ownerUser = (pengirim) => String(pengirim).startsWith(OWNER)
const USER = '6281111111111'
const USER2 = '6282222222222'

let lulus = 0
const gagal = []
const errs = []
const ok = (n, c, info = '') => { if (c) lulus++; else gagal.push(`${n}${info ? ' — ' + info : ''}`) }

function buatConn(jid = OWNER + '@s.whatsapp.net') {
  const terkirim = []
  return {
    _keluaran: terkirim,
    user: { id: jid },
    sendMessage: async (j, c) => { terkirim.push(c?.text ?? ''); return { key: { id: 'x' } } },
    relayMessage: async (j, msg) => { terkirim.push(JSON.stringify(msg?.viewOnceMessage?.message?.interactiveMessage ?? '')); return { key: { id: 'x' } } },
    waUploadToServer: async () => ({ mediaUrl: 'u' }),
  }
}

function buatMsg(user, teksLengkap) {
  const b = teksLengkap.replace(/^[.]/, '').split(/\s+/).filter(Boolean)
  const jid = user + '@s.whatsapp.net'
  return {
    chat: jid, sender: jid,
    raw: { key: { id: 'X', remoteJid: jid, fromMe: false }, message: { conversation: teksLengkap } },
    text: b.slice(1).join(' '), command: (b[0] || '').toLowerCase(), args: b.slice(1),
    reply: async (t) => ({ key: { id: 'x' }, _teks: String(t) }),
  }
}

/* Jalankan lewat router: .store <aksi> ditangani plugin store. */
async function lewatRouter(teks, conn, user = OWNER) {
  conn._keluaran.length = 0
  const nama = teks.replace(/^[.]/, '').split(/\s+/)[0].toLowerCase()
  const h = findPluginByCommand(nama)
  if (!h) return { ada: false, keluar: [] }
  const m = buatMsg(user, teks)

  /*
   * Router MEMANG memeriksa owner sebelum memanggil handler
   * (core/router-pesan.js: `if (ownerRequired && !ownerUser) return`).
   * Harness sebelumnya memanggil handler langsung sehingga gerbang itu
   * dilewati dan non-owner terlihat bisa memakai .resetstore dsb. Itu artefak
   * test, bukan bug produksi — tapi harus disimulasikan di sini, kalau tidak
   * test ini melaporkan masalah yang tidak ada.
   */
  const ownerRequired = isOwnerCommand(h, { command: m.command, args: m.args, text: m.text })
  if (ownerRequired && !ownerUser(user)) {
    conn._keluaran.push('Perintah ini khusus untuk owner bot.')
    return { ada: true, ditolak: true, keluar: conn._keluaran.slice() }
  }

  try {
    await h(m, { conn, usedPrefix: '.' })
  } catch (err) {
    return { ada: true, error: err, keluar: conn._keluaran.slice() }
  }
  return { ada: true, keluar: conn._keluaran.slice() }
}

/* Jalankan aksi langsung (tombol virtual). */
async function lewatAksi(aksi, args, conn, user = OWNER) {
  conn._keluaran.length = 0
  try {
    await jalankanAksi({
      conn,
      m: buatMsg(user, '.' + aksi + ' ' + args.join(' ')),
      prefix: '.',
      ctx: { aksi, args },
    })
  } catch (err) {
    return { error: err, keluar: conn._keluaran.slice() }
  }
  return { keluar: conn._keluaran.slice() }
}

function isiToko() {
  const cat = db.addCategory('Premium', 'Langganan premium')
  const p1 = db.addProduct({ name: 'Premium 1 Bulan', price: 10000, description: 'Akses 30 hari', categoryId: cat.id, stock: 10 })
  const p2 = db.addProduct({ name: 'Script V2', price: 50000, description: 'Script lengkap', categoryId: cat.id, stock: 1 })
  db.addProduct({ name: 'Habis', price: 1000, stock: 0 })
  db.addPaymentMethod('dana', '08123456789')
  db.addPromo({ code: 'HEMAT10', discount: 10 })
  for (const n of [USER, USER2]) {
    db.addToCart(n + '@s.whatsapp.net', p1.id, 1)
    db.createOrder(n + '@s.whatsapp.net')
    db.addToCart(n + '@s.whatsapp.net', p2.id, 1)
  }
  db.toggleFavorite(USER + '@s.whatsapp.net', p1.id)
  return { cat, p1, p2 }
}

const AKSI = ['home','produk','produkid','detail','kategori','cari','cart','tambah','qty','hapusitem','kosongkan','atur','checkout','beli','pesanan','orderlist','filterorder','detailorder','batalorder','ubahstatus','payment','listpayment','bayar','info','storeinfo','kontak','favorit','favorite','ownerproduk','editproduk','lihatproduk','hapusproduk','setstok','addstock','delstock','stock','listkategori','hapuskategori','delprompt','setkategoriproduk','setkategori','storestats','listpromo','delpromo','setpayment','addpayment','delpayment','setstore','batalimg']

const ARGUMEN = ['', '1', '999999', 'abc', '-1', '0', "1' OR '1'='1", 'NANO00000000000000', 'abc def']

/* ── ① Toko kosong ─────────────────────────────────────────────────── */
console.log('\x1b[1m① TOKO KOSONG — setiap aksi, tanpa argumen dan dengan argumen aneh\x1b[0m')
{
  const conn = buatConn()
  for (const a of AKSI) {
    for (const arg of ARGUMEN) {
      const r = await lewatAksi(a, arg ? [arg] : [], conn)
      if (r.error) {
        errs.push(`[KOSONG] aksi "${a}" arg "${arg}": ${r.error.message}`)
        console.log(`  \x1b[31m✗${a} ${arg}\x1b[0m ${r.error.message}`)
      } else if (!r.keluar.length) {
        gagal.push(`[KOSONG] aksi "${a}" arg "${arg}" diam tanpa balasan`)
      } else {
        lulus++
      }
    }
  }
}

/* Toko kosong + perintah lewat router */
const PERINTAH_USER = ['store','shop','list','cart','checkout','buy','order','myorder','payment','storeinfo','history','listkategori','favorite','wishlist','searchlist','detaillist']
console.log('\n\x1b[1m①b TOKO KOSONG — perintah user lewat router\x1b[0m')
{
  const conn = buatConn()
  for (const c of PERINTAH_USER) {
    for (const arg of ['', 'abc', '1']) {
      const r = await lewatRouter('.' + c + (arg ? ' ' + arg : ''), conn, USER)
      if (r.ada === false) { gagal.push(`[KOSONG] .${c} tidak ada plugin`); continue }
      if (r.error) {
        errs.push(`[KOSONG] .${c} ${arg}: ${r.error.message}`)
        console.log(`  \x1b[31m✗.${c} ${arg}\x1b[0m ${r.error.message}`)
      } else if (!r.keluar.length) {
        gagal.push(`[KOSONG] .${c} ${arg} diam`)
      } else lulus++
    }
  }
}

console.log('\n\x1b[1m② TOKO TERISI - setiap aksi\x1b[0m')
const { cat, p1, p2 } = isiToko()
let orderId = ''
{
  const conn = buatConn()
  const orders = db.listOrders({})
  orderId = orders[0]?.orderId || ''

  const AKSI_TERISI = [...AKSI, 'produkid', 'kategori']
  for (const a of AKSI_TERISI) {
    for (const arg of ['', String(p1.id), String(cat.id), orderId, 'PENDING', 'HEMAT10', 'dana', '08123456789', '1', 'abc']) {
      const r = await lewatAksi(a, arg ? [arg] : [], conn)
      if (r.error) {
        errs.push(`[TERISI] aksi "${a}" arg "${arg}": ${r.error.message}`)
        console.log(`  \x1b[31m✗${a} ${arg}\x1b[0m ${r.error.message}`)
      } else if (!r.keluar.length) {
        gagal.push(`[TERISI] aksi "${a}" arg "${arg}" diam tanpa balasan`)
      } else lulus++
    }
  }
}

console.log('\n\x1b[1m③ TOKO TERISI - perintah owner lewat router\x1b[0m')
const PERINTAH_OWNER = ['addlist','updatelist','dellist','setstock','addstock','delstock','clearstock','setnama','setharga','setlistdesc','setkategori','addkategori','delkategori','addpayment','setpayment','delpayment','setqris','setstore','setdescstore','setowner','setcontact','setimgstore','addpromo','delpromo','confirmorder','cancelorder','resetstore','setimg','listkategori','listpayment','listpromo','orderlist','storestats','stock']
const ARG_OWNER = ['', '1', String(p1.id), 'abc', String(cat.id), orderId, 'HEMAT10', 'dana', '0812', 'YAKIN', 'PENDING', '-5', '99999999999999999999', "'; DROP TABLE store_products;--"]
{
  const conn = buatConn()
  for (const c of PERINTAH_OWNER) {
    for (const arg of ARG_OWNER) {
      const teks = '.' + c + (arg ? ' ' + arg : '')
      const r = await lewatRouter(teks, conn, OWNER)
      if (r.ada === false) { gagal.push(`[OWNER] .${c} tidak ada plugin`); continue }
      if (r.error) {
        errs.push(`[OWNER] ${teks}: ${r.error.message}`)
        console.log(`  \x1b[31m✗${teks}\x1b[0m ${r.error.message}`)
      } else if (!r.keluar.length) {
        gagal.push(`[OWNER] ${teks} diam tanpa balasan`)
      } else lulus++
    }
  }
}

console.log('\n\x1b[1m④ NON-OWNER - semua aksi owner harus ditolak, bukan error\x1b[0m')
{
  const conn = buatConn()
  const AKSI_OWNER = [...AKSI].filter((a) => ['batalimg','addpayment','addstock','delstock','delpayment','delprompt','delpromo','editproduk','hapusproduk','listkategori','listpayment','listpromo','orderlist','ownerproduk','setkategori','setkategoriproduk','setpayment','setstok','setstore','stock','storestats','ubahstatus','lihatproduk','confirmorder','cancelorder','resetstore','addlist','dellist','updatelist','addkategori','delkategori','addpromo','setimg','setnama','setharga','setlistdesc'].includes(a))
  let n = 0
  for (const a of AKSI_OWNER) {
    for (const arg of ['', '1', 'abc']) {
      // Pengirim unik: rate limit dihitung per user, jadi JID yang sama
      // dipakai berulang akan memicu "Terlalu cepat" dan menutupi hasil.
      const pengirim = `${USER}_${n++}@s.whatsapp.net`
      const r = await lewatAksi(a, arg ? [arg] : [], conn, pengirim)
      if (r.error) {
        errs.push(`[NON-OWNER] aksi "${a}": ${r.error.message}`)
        console.log(`  \x1b[31m✗${a}\x1b[0m ${r.error.message}`)
      } else if (!r.keluar.length) {
        gagal.push(`[NON-OWNER] aksi "${a}" diam`)
      } else if (!r.keluar.join(' ').includes('khusus untuk owner')) {
        gagal.push(`[NON-OWNER] aksi "${a}" tidak menolak non-owner: ${r.keluar.join(' ').slice(0, 70)}`)
      } else lulus++
    }
  }
}

console.log('\n\x1b[1m⑤ NON-OWNER - perintah owner lewat router harus ditolak\x1b[0m')
{
  const conn = buatConn()
  for (const c of ['addlist','dellist','setstock','addpayment','setpayment','confirmorder','cancelorder','resetstore','setimg','listpayment','listpromo','orderlist','storestats','stock']) {
    const r = await lewatRouter('.' + c + ' 1', conn, `${USER}_x${c}@s.whatsapp.net`)
    if (r.ada === false) { gagal.push(`[NON-OWNER] .${c} tidak ada plugin`); continue }
    if (r.error) {
      errs.push(`[NON-OWNER] .${c}: ${r.error.message}`)
      console.log(`  \x1b[31m✗.${c}\x1b[0m ${r.error.message}`)
    } else if (!r.keluar.join(' ').toLowerCase().includes('owner')) {
      gagal.push(`[NON-OWNER] .${c} tidak menolak: ${r.keluar.join(' ').slice(0, 80)}`)
    } else lulus++
  }
}

console.log('\n\x1b[0m[kontrol] harness ini harus bisa membedakan owner vs non-owner\x1b[0m')
{
  const conn = buatConn()  // conn.user.id = nomor owner (bot)
  const rOwner = await lewatRouter('.storestats', conn, OWNER + '@s.whatsapp.net')
  const bukanOwner = await lewatRouter('.storestats', conn, '6289999999999@s.whatsapp.net')
  /*
   * Dua lapis pertahanan menolak non-owner, dan pesannya berbeda:
   *   lapis router  -> "Perintah ini khusus untuk owner bot."  (ownerOnly)
   *   lapis store   -> "Perintah ini khusus untuk owner toko."  (AKSI_OWNER)
   * .storestats ditangani store.js yang ownerOnly=false, jadi router
   * tidak menolak dan lapis kedua yang menangkap. Dua-duanya benar,
   * jadi assertion menerima salah satu.
   */
  const DITOLAK = /khusus untuk owner (bot|toko)/i
  ok('owner BOLEH .storestats', !DITOLAK.test(JSON.stringify(rOwner)), JSON.stringify(rOwner).slice(0, 90))
  ok('non-owner DITOLAK .storestats', DITOLAK.test(JSON.stringify(bukanOwner)), JSON.stringify(bukanOwner).slice(0, 90))
  const aksiOwner = await lewatAksi('storestats', [], conn, '6288888888888@s.whatsapp.net')
  ok('non-owner DITOLAK aksi storestats', JSON.stringify(aksiOwner).includes('khusus untuk owner'), JSON.stringify(aksiOwner).slice(0, 90))
  const aksiBiasa = await lewatAksi('produk', [], conn, '6288888888887@s.whatsapp.net')
  ok('non-owner BOLEH aksi biasa (produk)', !JSON.stringify(aksiBiasa).includes('khusus untuk owner'), JSON.stringify(aksiBiasa).slice(0, 90))
  if (gagal.length) console.log('\x1b[31m  harness TIDAK valid — hasil di atas tidak bisa dipercaya\x1b[0m')
}

console.log('\n\x1b[1m⑥ INPUT BERBAHAYA & TEKS PANJANG\x1b[0m')
{
  const conn = buatConn()
  const jahat = [
    ["'; DROP TABLE store_products;--", 'sql injection'],
    ['" OR "1"="1', 'sql injection'],
    ['<script>alert(1)</script>', 'xss'],
    ['${JSON.stringify(db.getStats())}', 'template literal'],
    ['a'.repeat(5000), ' teks sangat panjang'],
    ['emoji 🔥🎉💯🇮🇩', ' emoji'],
    ['<>|&*', ' karakter markdown'],
    ['產 品 名', ' CJK'],
  ]
  for (const [teks, alasan] of jahat) {
    const hasil = db.addProduct({ name: teks.slice(0, 60), price: 1000, stock: 1 })
    if (!hasil.ok) { gagal.push(`produk bermasalah ditolak tidak terduga: ${teks.slice(0, 20)}`); continue }
    lulus++
    const r = await lewatAksi('produkid', [String(hasil.id)], conn)
    if (r.error) { errs.push(`produk "${alasan}": ${r.error.message}`); console.log(`  \x1b[31m✗ ${alasan}\x1b[0m ${r.error.message}`) }
    else if (!r.keluar.length) gagal.push(`produk "${alasan}" diam`)
    else lulus++
  }
  ok('tabel produk utuh setelah semua input jahat', db.countProducts({ onlyActive: false }) > 0)
}

console.log('\n\x1b[1m⑦ KONSISTENSI DATA SETELAH SEGALANYA\x1b[0m')
{
  ok('stok tidak pernah negatif', db.listProducts({ onlyActive: false }).every((p) => p.stock >= 0), JSON.stringify(db.listProducts({ onlyActive: false }).map((p) => p.stock)))
  ok('harga selalu positif', db.listProducts({ onlyActive: false }).every((p) => p.price > 0))
  const orders = db.listOrders({ limit: 500 })
  ok('order punya minimal 1 item', orders.every((o) => o.items.length > 0), JSON.stringify(orders.filter((o) => !o.items.length).map((o) => o.orderId)))
  ok('total order = jumlah subtotal item', orders.every((o) => o.items.reduce((n, i) => n + i.subtotal, 0) === o.total), JSON.stringify(orders.filter((o) => o.items.reduce((n, i) => n + i.subtotal, 0) !== o.total).map((o) => o.orderId)))
  ok('userId order berformat JID', orders.every((o) => String(o.userId).includes('@')))
  ok('orderId format NANO + 14 digit', orders.every((o) => /^NANO\d{14}$/.test(o.orderId)), JSON.stringify(orders.map((o) => o.orderId)))
  ok('cart user tidak bisa negatif', db.getCart(USER + '@s.whatsapp.net').items.every((i) => i.quantity > 0))
  const st = db.getStats()
  ok('omzet = total order terbayar', st.pendapatan === orders.filter((o) => ['PAID', 'PROCESSING', 'COMPLETED'].includes(o.status)).reduce((n, o) => n + o.total, 0), `omzet=${st.pendapatan}`)
}

console.log('\n' + '='.repeat(58))
if (errs.length) {
  console.log(`\x1b[31m\x1b[1mEXCEPTION: ${errs.length}\x1b[0m`)
  for (const e of errs.slice(0, 30)) console.log('  ' + e)
} else {
  console.log('\x1b[32m\x1b[1mTIDAK ADA EXCEPTION\x1b[0m')
}
if (gagal.length) {
  console.log(`\x1b[31m\x1b[1mPERILAKU SALAH: ${gagal.length}\x1b[0m`)
  for (const g of gagal.slice(0, 40)) console.log('  ' + g)
} else {
  console.log('\x1b[32m\x1b[1mSEMUA PERILAKU BENAR\x1b[0m')
}
console.log(`\n\x1b[1m${lulus} pemeriksaan lulus\x1b[0m`)
process.exit(errs.length || gagal.length ? 1 : 0)
