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
   STORE — Plugin penghubung perintah.

   Dua perintah utama yang dilihat user:
     .store / .shop   pusat toko (juga menerima sub-aksi dari tombol)
     .list            shortcut daftar produk (menuju kartu produk)

   Semua perintah lain (.cart, .checkout, .order, .searchlist, .payment,
   .myorder, .storeinfo, .history, …) sengaja TIDAK punya handler sendiri.
   Semuanya mencapai core/store/aksi.js lewat .store <aksi> atau .store
   agar hanya ada SATU tempat yang mengubah data — bukan dua jalur yang
   bisa berbeda perilakunya.

   Konflik nama yang diketahui, dan cara menyelesaikannya:
     - .store / .shop sebelumnya dipakai plugins/rpg/shop.js (toko game RPG).
       Sesuai permintaan, .store/.shop kini milik Store. Toko RPG tetap bisa
       dipakai lewat .beli / .jual / .toko, jadi tidak ada fitur yang hilang.
     - .kategori tetap milik plugins/main/kategori.js (kategori plugin).
       Kategori Store memakai .listkategori dan tombol KATEGORI.
   ═══════════════════════════════════════════════════════════════════ */

import * as store from '../../core/store/db.js'
import * as ui from '../../core/store/ui.js'
import { jalankanAksi } from '../../core/store/aksi.js'

/* Perintah Store yang meneruskan ke aksi. Semua bisa dipanggil langsung
   (mis. ".cart") maupun lewat tombol (".store cart"). */
const SHORTCUT = {
  list: 'produk',
  cart: 'cart',
  checkout: 'checkout',
  buy: 'beli',
  order: 'detailorder',
  myorder: 'pesanan',
  payment: 'payment',
  storeinfo: 'info',
  history: 'pesanan',
  favorite: 'favorit',
  wishlist: 'favorit',
  searchlist: 'cari',
  detaillist: 'produkid',
}

/* Perintah yang HANYA boleh dipanggil owner. Daftarnya sudah termasuk
   AKSI_OWNER di core/store/aksi.js, jadi authorization dicek ulang di
   sana — bukan hanya oleh flag ownerOnly di router. */
/*
 * Perintah berawalan "list" yang tampilannya mengelola (bukan sekadar
 * melihat). Semuanya owner: .listpayment, .listpromo, .listkategori.
 * .listkategori sebelumnya diarahkan ke kartu kategori versi user, jadi
 * owner tidak pernah sampai ke daftar yang bisa dihapus per kategori —
 * padahal itu satu-satunya gunanya. Untuk melihat kategori saja, tombol
 * 🗂️ Kategori di .store atau .kategori sudah cukup.
 */
const SHORTCUT_OWNER = {
  orderlist: 'orderlist',
  storestats: 'storestats',
  listpayment: 'listpayment',
  listpromo: 'listpromo',
  listkategori: 'listkategori',
  stock: 'stock',
  setkategoriproduk: 'setkategoriproduk',
  editproduk: 'editproduk',
  hapusproduk: 'hapusproduk',
}

const handler = async (m, { conn, usedPrefix }) => {
  const prefix = usedPrefix || '.'

  /*
   * DASAR DISINI: m.command, BUKAN kata pertama dari m.text.
   *
   * Router (core/router-pesan.js) mengisi m.text = argumen TANPA nama
   * perintah. Jadi untuk ".cart" tanpa argumen, m.text = '' dan m.command
   * = 'cart'. Versi lama mengambil aksi dari m.text, yang membuat
   * .cart / .payment / .myorder / .listpayment / .orderlist / .stock /
   * .listpromo / .listkategori yang diketik TANPA argumen membuka kartu
   * BERANDA, bukan kartunya sendiri — command kelihatan jalan, hasilnya
   * di tempat yang salah.
   */
  const perintah = String(m.command || '').toLowerCase()
  const args = String(m.text || '').trim().split(/\s+/).filter(Boolean)

  /* Pintu masuk yang menerima sub-aksi: ".store produk", ".store cart 3".
     Lainnya setelah perintah ini dibaca sebagai AKSI, bukan argumen. */
  if (perintah === 'store' || perintah === 'shop') {
    const aksi = args[0] ? args[0].toLowerCase() : 'home'
    return jalankanAksi({ conn, m, prefix, ctx: { aksi, args: args.slice(1) } })
  }

  /* .list = daftar produk (bukan "tombol nomor"). Tanpa argumen masih
     menampilkan halaman pertama. */
  if (perintah === 'list') {
    return jalankanAksi({ conn, m, prefix, ctx: { aksi: 'produk', args } })
  }

  /* .searchlist butuh kata kunci utuh karena bisa mengandung spasi. */
  if (perintah === 'searchlist') {
    const keyword = args.join(' ')
    if (!keyword) {
      return conn.sendMessage(
        m.chat,
        { text: `🔎 Contoh: *${prefix}searchlist premium*\nAtau pakai tombol: *${prefix}store* → 🔎 Cari Produk` },
        { quoted: m.raw }
      )
    }
    return jalankanAksi({ conn, m, prefix, ctx: { aksi: 'cari', args: [keyword] } })
  }

  /* .detaillist <id> → kartu detail produk. */
  if (perintah === 'detaillist') {
    return jalankanAksi({ conn, m, prefix, ctx: { aksi: 'produkid', args } })
  }

  /* Perintah Managean — dicek owner di core/store/aksi.js. */
  if (SHORTCUT_OWNER[perintah]) {
    return jalankanAksi({ conn, m, prefix, ctx: { aksi: SHORTCUT_OWNER[perintah], args } })
  }

  /* Shortcut=user. */
  if (SHORTCUT[perintah]) {
    return jalankanAksi({ conn, m, prefix, ctx: { aksi: SHORTCUT[perintah], args } })
  }

  /* Sisanya: sub-aksi tombol yang datang lewat .store (sudah tertangkap
     di atas), atau perintah store lain. m disusun ulang supaya argumennya
     tidak lagi memuat nama aksi. */
  return jalankanAksi({
    conn,
    m: { ...m, text: args.join(' '), args },
    prefix,
    ctx: { aksi: perintah, args },
  })
}

handler.command = /^(store|shop|list|cart|checkout|buy|order|myorder|payment|storeinfo|history|listkategori|favorite|wishlist|searchlist|detaillist|orderlist|storestats|listpayment|listpromo|stock|setkategoriproduk|editproduk|hapusproduk)$/i
/*
 * menuHelp menentukan apa yang tampil di `.kategori store`.
 *
 * getPluginMenuCommands() di lib/menu.js hanya menampilkan menuHelp, atau
 * help[0] kalau menuHelp tidak ada — jadi tanpa daftar ini, satu plugin
 * Store cuma menyumbang SATU baris ke menu kategori. Semua perintah yang
 * tidak ada di sini praktis tidak bisa ditemukan dari dalam bot.
 *
 * Dipisah dari store-owner.js supaya owner/user tidak perlu menggali satu
 * kategori penuh perintah yang tidak bisa mereka jalankan.
 */
handler.menuHelp = [
  'store', 'shop',
  'list', 'searchlist', 'detaillist',
  'cart', 'checkout', 'buy',
  'order', 'myorder', 'history',
  'payment', 'storeinfo', 'favorite',
  'orderlist', 'storestats', 'listpayment', 'listpromo', 'listkategori', 'stock',
]
handler.help = ['store', 'shop', 'list', 'cart', 'checkout', 'buy', 'order', 'myorder', 'payment', 'storeinfo', 'history', 'listkategori', 'favorite', 'searchlist', 'detaillist', 'orderlist', 'storestats', 'listpayment', 'listpromo', 'stock']
handler.tags = ['store']
handler.category = 'store'
handler.description = 'Toko digital lengkap: produk, keranjang, checkout, dan pesanan'
handler.keywords = ['toko', 'beli produk', 'jualan']

export default handler
