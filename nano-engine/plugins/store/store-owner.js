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
   STORE — Perintah tulis untuk owner.

   Perintah-perintah di sini hanya MENERIMA input dan mem-parsingnya;
   perubahan data tetap dilakukan core/store/db.js. Semua ownerOnly, dan
   router sudah menolak non-owner sebelum handler ini dipanggil.

   Format input mengikuti yang diminta:
     .addlist Nama Produk|Harga|Deskripsi|Stok
   Field bersifat opsional setelah harga: boleh dikosongkan ("||"), dan
   produk bisa diberi kategori lewat .setkategori / .setkategoriproduk.
   ═══════════════════════════════════════════════════════════════════ */

import * as store from '../../core/store/db.js'
import * as ui from '../../core/store/ui.js'
import { bersihkanGambarYatim } from './store-img.js'

/* "10000", "10.000", "Rp10.000", "10k" → 10000.
   Tanpa ini owner akan mengetik format Indonesia dan produk ditolak
   karena NaN, padahal maksudnya jelas. */
function parseHarga(masukan) {
  const mentah = String(masukan || '').toLowerCase().replace(/rp/g, '').replace(/[.\s]/g, '')
  if (!mentah) return NaN
  const match = mentah.match(/^(\d+)(k)?$/)
  if (!match) return NaN
  const angka = Number(match[1])
  return match[2] ? angka * 1000 : angka
}

function parseAngka(masukan) {
  const bersih = String(masukan || '').replace(/[.\s]/g, '')
  if (!bersih || !/^\d+$/.test(bersih)) return NaN
  return Number(bersih)
}

async function kirim(conn, m, teks) {
  return conn.sendMessage(m.chat, { text: teks }, { quoted: m.raw })
}

/* ── .addlist ──────────────────────────────────────────────────────── */
async function tambahProduk(conn, m, prefix) {
  const raw = String(m.text || '').trim()
  if (!raw) {
    return kirim(
      conn,
      m,
      `📝 *Cara tambah produk*\n\nFormat:\n\`${prefix}addlist Nama Produk|Harga|Deskripsi|Stok\`\n\n` +
        `Contoh:\n\`${prefix}addlist Premium 1 Bulan|10000|Akses premium 30 hari|10\`\n\n` +
        'Nama, harga, dan deskripsi wajib. Stok boleh dikosongkan (default 0).'
    )
  }

  const bagian = raw.split('|').map((b) => b.trim())
  const [nama, hargaStr, deskripsi = '', stokStr = '0'] = bagian

  const harga = parseHarga(hargaStr)
  if (!Number.isFinite(harga)) {
    return kirim(conn, m, `❌ Harga tidak valid: *${hargaStr || '(kosong)'}*.\nHarga harus angka, boleh ditulis 10000, 10.000, atau 10k.`)
  }

  let stok = 0
  if (stokStr) {
    stok = parseAngka(stokStr)
    if (!Number.isInteger(stok) || stok < 0) {
      return kirim(conn, m, `❌ Stok tidak valid: *${stokStr}*. Stok harus angka bulat 0 atau lebih.`)
    }
  }

  /* Kategori sengaja TIDAK diisi dari format di atas: kolom input hanya
     empat (nama|harga|deskripsi|stok) sesuai format yang diminta. Produk
     baru muncul di kategori "Tanpa kategori" sampai owner memindahkannya
     lewat .setkategori atau .setkategoriproduk. */
  const hasil = store.addProduct({
    name: nama,
    price: harga,
    description: deskripsi,
    stock: stok,
  })
  if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)

  const p = store.getProduct(hasil.id)
  const k = ui.kartu({
    title: '✅ PRODUK DITAMBAHKAN',
    lines: [
      `📦 *${p.name}*`,
      `💰 Harga : ${ui.rupiah(p.price)}`,
      `📊 Stok  : ${ui.labelStok(p.stock)}`,
      ...(p.description ? [`📝 ${ui.potong(p.description, 80)}`] : []),
    ],
    footer: `ID produk : ${p.id}`,
    buttons: [
      { label: '👁️ LIHAT', command: ui.aksi(prefix, 'lihatproduk', p.id) },
      { label: '✏️ EDIT', command: ui.aksi(prefix, 'editproduk', p.id) },
      { label: '📦 STOCK', command: ui.aksi(prefix, 'setstok', p.id) },
    ],
  })
  return ui.kirimKartu(conn, m.chat, k, { quoted: m.raw })
}

/* ── .updatelist ───────────────────────────────────────────────────── */
async function updateProduk(conn, m, prefix) {
  const bagian = String(m.text || '').trim().split('|').map((b) => b.trim())
  const [target, nama, hargaStr, deskripsi] = bagian

  const produk =
    store.getProduct(parseAngka(target)) || store.getProductByName(target)
  if (!produk) return kirim(conn, m, `❌ Produk tidak ditemukan: *${target}*.`)

  const patch = {}
  if (nama) patch.name = nama
  if (hargaStr !== undefined && hargaStr !== '') {
    const harga = parseHarga(hargaStr)
    if (!Number.isFinite(harga)) return kirim(conn, m, `❌ Harga tidak valid: *${hargaStr}*.`)
    patch.price = harga
  }
  if (deskripsi !== undefined) patch.description = deskripsi

  const hasil = store.updateProduct(produk.id, patch)
  if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)

  const p = hasil.product
  await kirim(conn, m, `✅ Produk diperbarui.\n\n📦 *${p.name}*\n💰 ${ui.rupiah(p.price)} · 📊 ${ui.labelStok(p.stock)}\n\n${ui.rupiah(p.price)} tersimpan ke database.`)
  return true
}

/* ── Perintah lain ─────────────────────────────────────────────────── */
const PETUNJUK = `🛠️ *PERINTAH OWNER TOKO*\n\n` +
  '*.addlist* Nama|Harga|Deskripsi|Stok\n' +
  '*.updatelist* <id|nama>|Nama Baru|Harga Baru|Deskripsi Baru\n' +
  '*.dellist* <id|nama>\n' +
  '*.setstock* <id|nama> <jumlah>\n' +
  '*.addstock* <id|nama> <jumlah>\n' +
  '*.delstock* <id|nama> <jumlah>\n' +
  '*.clearstock* <id|nama>\n' +
  '*.setnama* <id> <nama>\n' +
  '*.setharga* <id> <harga>\n' +
  '*.setlistdesc* <id> <deskripsi>\n' +
  '*.setimg* <id|nama>\n' +
  '*.addkategori* Nama [deskripsi]\n' +
  '*.delkategori* <id>\n' +
  '*.setkategori* <id produk> <id kategori>\n' +
  '*.addpayment* <metode> <nomor/QRIS>   (tambah metode baru)\n' +
  '*.setpayment* <metode> <nomor/QRIS>   (ubah metode yang sudah ada)\n' +
  '*.delpayment* <metode>\n' +
  '*.setqris* <isi>\n' +
  '*.addpromo* KODE <diskon> [kuota] [fixed]\n' +
  '*.delpromo* KODE\n' +
  '*.setstore* <nama toko>\n' +
  '*.setdescstore* <deskripsi>\n' +
  '*.setowner* <nama>\n' +
  '*.setcontact* <kontak>\n' +
  '*.setimgstore* <url banner>\n' +
  '*.confirmorder* <id order> [status]\n' +
  '*.cancelorder* <id order>\n' +
  '*.resetstore* YAKIN\n\n' +
  'Semua bisa juga lewat tombol: *store* → 🛠️ Store Management'

const handler = async (m, { conn, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const perintah = String(m.command || '').toLowerCase()
  const teks = String(m.text || '').trim()

  switch (perintah) {
    case 'addlist':
      return tambahProduk(conn, m, prefix)

    case 'updatelist':
      return updateProduk(conn, m, prefix)

    case 'dellist': {
      const target = teks.split('|')[0].trim()
      const p = store.getProduct(parseAngka(target)) || store.getProductByName(target)
      if (!p) return kirim(conn, m, `❌ Produk tidak ditemukan: *${target}*.`)
      const hasil = store.deleteProduct(p.id)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🗑️ Produk *${p.name}* disembunyikan dari etalase.\nOrder lama yang sudah dibuat tetap utuh.`)
    }

    case 'setstock':
    case 'addstock':
    case 'delstock':
    case 'clearstock': {
      const bagian = teks.split(/\s+/)
      const target = bagian.shift() || ''
      const p = store.getProduct(parseAngka(target)) || store.getProductByName(target)
      if (!p) return kirim(conn, m, `❌ Produk tidak ditemukan: *${target}*.`)

      if (perintah === 'clearstock') {
        const hasil = store.setStock(p.id, 0)
        if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
        return kirim(conn, m, `🧹 Stok *${p.name}* disetel ke 0.`)
      }
      const delta = parseAngka(bagian.join(''))
      if (!Number.isInteger(delta) || delta < 0) {
        return kirim(conn, m, `❌ Jumlah tidak valid. Contoh: \`${prefix}${perintah} ${p.id} 5\``)
      }
      const hasil =
        perintah === 'setstock'
          ? store.setStock(p.id, delta)
          : perintah === 'addstock'
            ? store.adjustStock(p.id, delta)
            : store.adjustStock(p.id, -delta)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `📊 Stok *${hasil.product.name}* sekarang *${hasil.product.stock}*.`)
    }

    case 'setnama': {
      const bagian = teks.split(/\s+/)
      const id = parseAngka(bagian.shift())
      const nama = bagian.join(' ').trim()
      if (!nama) return kirim(conn, m, `❌ Nama baru belum ditulis.\nContoh: \`${prefix}setnama ${id} Nama Baru\``)
      const hasil = store.updateProduct(id, { name: nama })
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `✏️ Nama diubah jadi *${hasil.product.name}*.`)
    }

    case 'setharga': {
      const bagian = teks.split(/\s+/)
      const id = parseAngka(bagian.shift())
      const harga = parseHarga(bagian.join(''))
      if (!Number.isFinite(harga)) return kirim(conn, m, `❌ Harga tidak valid. Contoh: \`${prefix}setharga ${id} 15000\``)
      const hasil = store.updateProduct(id, { price: harga })
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `💰 Harga *${hasil.product.name}* jadi *${ui.rupiah(harga)}*.`)
    }

    case 'setlistdesc': {
      const bagian = teks.split(/\s+/)
      const id = parseAngka(bagian.shift())
      const deskripsi = bagian.join(' ').trim()
      if (!deskripsi) return kirim(conn, m, `❌ Deskripsi belum ditulis.`)
      const hasil = store.updateProduct(id, { description: deskripsi })
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `📝 Deskripsi *${hasil.product.name}* diperbarui.`)
    }

    case 'setkategori': {
      /* Bentuk: setkategori <idProduk> <idKategori> */
      const bagian = teks.split(/\s+/)
      const idProduk = parseAngka(bagian.shift())
      const idKategori = parseAngka(bagian.shift())
      if (!idProduk || !idKategori) {
        return kirim(conn, m, `❌ Contoh: \`${prefix}setkategori 3 1\`\n\nID produk 3 dipindahkan ke kategori 1.`)
      }
      const hasil = store.updateProduct(idProduk, { categoryId: idKategori })
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🗂️ *${hasil.product.name}* dipindahkan ke *${hasil.product.categoryName || 'tanpa kategori'}*.`)
    }

    case 'addkategori': {
      const bagian = teks.split(/\s+/)
      const nama = bagian.shift() || ''
      if (!nama) return kirim(conn, m, `❌ Nama kategori belum ditulis.\nContoh: \`${prefix}addkategori Premium\``)
      const hasil = store.addCategory(nama, bagian.join(' '))
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🗂️ Kategori *${hasil.name}* dibuat (id ${hasil.id}).`)
    }

    case 'delkategori': {
      const id = parseAngka(teks.split(/\s+/)[0])
      const hasil = store.deleteCategory(id)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🗂️ Kategori dihapus.`)
    }

    /*
     * .addpayment = TAMBA metode baru (gagal kalau sudah ada).
     * .setpayment = UBAH metode yang sudah ada (gagal kalau belum ada).
     * Pemisahan ini mengikuti pola yang sama dengan addkategori/addpromo
     * di file ini, dan mencegah "kenapa perubahanku tidak berlaku".
     */
    case 'addpayment':
    case 'setpayment': {
      const bagian = teks.split(/\s+/)
      const metode = (bagian.shift() || '').toLowerCase()
      const nilai = bagian.join(' ').trim()
      if (!metode || !nilai) {
        return kirim(
          conn,
          m,
          `❌ Contoh:\n\`${prefix}addpayment dana 08123456789\` — menambah metode baru\n` +
            `\`${prefix}setpayment dana 081298765432\` — mengubah metode yang sudah ada\n` +
            'Atau QRIS: `' + prefix + 'setqris <isi QRIS>`'
        )
      }
      const hasil =
        perintah === 'addpayment'
          ? store.addPaymentMethod(metode, nilai)
          : store.setPaymentMethod(metode, nilai)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)

      const k = ui.kartuPaymentOwner(store.listPaymentMethods(false), { prefix })
      return ui.kirimKartu(conn, m.chat, k, { quoted: m.raw })
    }

    case 'delpayment': {
      const metode = teks.trim().toLowerCase()
      const hasil = store.deletePaymentMethod(metode)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🗑️ Metode *${metode.toUpperCase()}* dihapus.`)
    }

    case 'setqris': {
      /* upsert, bukan set: .setqris harus berhasil baik saat QRIS baru
         diisi pertama kali maupun saat diperbarui. */
      const hasil = store.upsertPaymentMethod('qris', teks)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `💳 QRIS diperbarui.`)
    }

    case 'setstore':
    case 'setdescstore':
    case 'setowner':
    case 'setcontact': {
      if (!teks) return kirim(conn, m, PETUNJUK)
      const kunci = {
        setstore: 'store_name',
        setdescstore: 'store_desc',
        setowner: 'store_owner',
        setcontact: 'store_contact',
      }[perintah]
      const hasil = store.setSetting(kunci, teks)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `⚙️ Tersimpan.\n\n${ui.kartuInfoToko({ prefix }).body}`)
    }

    case 'setimgstore': {
      const hasil = store.setSetting('store_banner', teks)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🖼️ Banner toko diperbarui.`)
    }

    case 'addpromo': {
      const bagian = teks.split(/\s+/)
      const code = (bagian.shift() || '').toUpperCase()
      const diskon = parseAngka(bagian.shift() || '')
      if (!code || !Number.isFinite(diskon)) {
        return kirim(conn, m, `❌ Contoh: \`${prefix}addpromo HEMAT10 10\` (10%) atau \`${prefix}addpromo POTONG 5000 0 fixed\` (rpiah)`)
      }
      const sisa = bagian.filter(Boolean)
      const hasil = store.addPromo({
        code,
        discount: diskon,
        kind: sisa.includes('fixed') ? 'fixed' : 'percent',
        quota: sisa.find((x) => /^\d+$/.test(x)) !== undefined ? parseAngka(sisa.find((x) => /^\d+$/.test(x))) : -1,
      })
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🏷️ Promo *${hasil.code}* dibuat (${diskon}${sisa.includes('fixed') ? ' rupiah' : '%'}).\n\nUser pakai: *${prefix}checkout KODE*`)
    }

    case 'delpromo': {
      const code = teks.trim()
      const hasil = store.deletePromo(code)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      return kirim(conn, m, `🏷️ Promo *${code.toUpperCase()}* dihapus.`)
    }

    case 'confirmorder': {
      const bagian = teks.split(/\s+/)
      const orderId = (bagian.shift() || '').toUpperCase()
      const status = (bagian.shift() || 'PAID').toUpperCase()
      if (!orderId) return kirim(conn, m, `❌ Contoh: \`${prefix}confirmorder NANO123456789012\`\nStatus: PAID / PROCESSING / COMPLETED`)
      const hasil = store.updateOrderStatus(orderId, status)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      try {
        await conn.sendMessage(hasil.order.userId, {
          text: `✅ Order *${hasil.order.orderId}* dikonfirmasi owner.\n\nStatus : ${ui.labelStatus(status)}\nTotal  : ${ui.rupiah(hasil.order.total)}`,
        })
      } catch {
        // user tidak bisa dichat — status tetap tersimpan
      }
      const k = ui.kartuOrder(hasil.order, { prefix, untukUser: false })
      return ui.kirimKartu(conn, m.chat, k, { quoted: m.raw })
    }

    case 'cancelorder': {
      const orderId = (teks.split(/\s+/)[0] || '').toUpperCase()
      const hasil = store.cancelOrder(orderId)
      if (!hasil.ok) return kirim(conn, m, `❌ ${hasil.error}`)
      try {
        await conn.sendMessage(hasil.order.userId, {
          text: `❌ Order *${hasil.order.orderId}* dibatalkan owner.\n\n${hasil.stokDikembalikan ? 'Stok sudah dikembalikan.' : ''}`,
        })
      } catch {
        // abaikan
      }
      return kirim(conn, m, `❌ Order *${orderId}* dibatalkan.${hasil.stokDikembalikan ? ' Stok dikembalikan.' : ' Stok TIDAK dikembalikan (order sudah dibayar).'}`)
    }

    case 'resetstore': {
      if (teks.toUpperCase() !== 'YAKIN') {
        return kirim(
          conn,
          m,
          `⚠️ *RESET STORE*\n\nPerintah ini menghapus SEMUA produk, kategori, order, keranjang, promo, dan pengaturan toko.\n\n` +
            `Untuk melanjutkan ketik:\n\`${prefix}resetstore YAKIN\``
        )
      }
      store.resetStore()
      /* Gambar produk ikut dibersihkan. Kalau tidak, file gambar menumpuk
         di folder data selamanya — tiap .resetstore akan menambah satu
         folder penuh foto yang tidak lagi dirujuk produk mana pun. */
      const gambar = bersihkanGambarYatim()
      return kirim(
        conn,
        m,
        `🧹 Store sudah direset.

Semua produk, kategori, order, keranjang, promo, dan pengaturan toko dihapus.` +
          (gambar ? `
${gambar} file gambar produk ikut dibersihkan.` : '')
      )
    }

    default:
      return kirim(conn, m, PETUNJUK)
  }
}

handler.command = /^(addlist|updatelist|dellist|setstock|addstock|delstock|clearstock|setnama|setharga|setlistdesc|setkategori|addkategori|delkategori|addpayment|setpayment|delpayment|setqris|setstore|setdescstore|setowner|setcontact|setimgstore|addpromo|delpromo|confirmorder|cancelorder|resetstore)$/i
handler.help = ['addlist', 'updatelist', 'dellist', 'setstock', 'addstock', 'delstock', 'clearstock', 'setnama', 'setharga', 'setlistdesc', 'setkategori', 'addkategori', 'delkategori', 'addpayment', 'setpayment', 'delpayment', 'setqris', 'setstore', 'setdescstore', 'setowner', 'setcontact', 'addpromo', 'delpromo', 'confirmorder', 'cancelorder', 'resetstore']
handler.tags = ['owner', 'store']
/*
 * Kategori = 'store', BUKAN 'owner'.
 *
 * Semua perintah di file ini adalah perintah toko. Dulu semuanya
 * dikategorikan 'owner' dengan kategori tetap 'owner', sehingga di
 * .kategori store hanya appear 9 perintah untuk user — dan di
 * .kategori owner pun hanya muncul 1 (help[0]), karena
 * getPluginMenuCommands() di lib/menu.js hanya menampilkan menuHelp
 * atau help[0] per plugin. Dari 28 perintah owner toko, 26 tidak
 * terlihat di menu mana pun.
 *
 * Badge Ⓞ tetap muncul karena formatCommandWithStatus() membaca
 * handler.ownerOnly, bukan nama kategorinya — jadi tidak ada informasi
 * bahwa perintah ini khusus owner yang ikut hilang.
 */
handler.category = 'store'
handler.ownerOnly = true
/*
 * Semua 28 perintah ditampilkan di menu. Sengaja penuh: tidak ada cara
 * mencari perintah toko lain dari dalam bot, jadi kalau tidak ditampilkan
 * di sini, owner harus hafal dari luar.
 */
handler.menuHelp = [
  'addlist', 'updatelist', 'dellist',
  'setstock', 'addstock', 'delstock', 'clearstock', 'stock',
  'setnama', 'setharga', 'setlistdesc', 'setimg', 'setkategori',
  'addkategori', 'delkategori',
  'addpayment', 'setpayment', 'delpayment', 'setqris',
  'addpromo', 'delpromo',
  'setstore', 'setdescstore', 'setowner', 'setcontact', 'setimgstore',
  'confirmorder', 'cancelorder', 'resetstore',
]
handler.description = 'Kelola produk, stok, kategori, pembayaran, dan pesanan toko'
handler.usage = 'addlist Nama|Harga|Deskripsi|Stok'

export default handler
