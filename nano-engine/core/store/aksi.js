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
   STORE — Handler aksi.

   Setiap tombol Store dikirim sebagai perintah "<prefix>store <aksi> …".
   Modul ini satu-satunya tempat yang menerjemahkan aksi itu jadi
   perubahan data, sehingga tidak ada jalur lain yang bisa mengubah
   keranjang, order, atau stok tanpa lewat sini.

   Pertahanan yang ada di sini:
   - OWNERSHIP: order hanya boleh dilihat/dibayar/dibatalkan pemiliknya.
     Cart selalu milik pemanggil. Aksi owner dicek ulang di sini, bukan
     hanya lewat handler.ownerOnly, karena router hanyaια protecting
     perintah yang Written — aksi come dari tombol yang bisa dipalsukan.
   - ANTI DOUBLE-CLICK: WhatsApp mengirim ulang pesan saat user menekan
     tombol berkali-kali. Setiap aksi yang mengubah data punya "kunci"
     singkat per (user, aksi, target) supaya klik ganda tidak
     menghasilkan dua order atau dua pengurangan stok.
   - RATE LIMIT: keranjang bisa diklik tanpa batas; ini menahan diam-diam.
   - HARGA & STOK: tidak pernah diambil dari argumen. Selalu dibaca ulang
     dari database di core/store/db.js.

   Semua nilai yang masuk dari user (id produk, id order, jumlah) tetap
   divalidasi sebagai integer sebelum dipakai sebagai parameter SQL.
   ═══════════════════════════════════════════════════════════════════ */

import { isOwner } from '../../lib/cek-akses.js'
import * as store from './db.js'
import * as ui from './ui.js'

/* ── Anti double-click & rate limit ────────────────────────────────── */
/*
 * Bot tidak bisa membedakan "user sengaja menekan dua kali" dari
 * "WhatsApp mengirim ulang karena lambat". Yang bisa dilakukan adalah
 * menolak.request kedua dalam jendela waktu pendek — biayanya satu
 * order, Alternatifnya idempoten (balasan sama) tapi owner tetap Selective
 * ribs yang tidakturnstile. Jendela dibuat pendek supaya aksi yang
 * benar-benar disengaja tetap bisa diulang.
 */
const JENDELA_KUNCI = 2_500
const kunciAksi = new Map()

/*
 * Rate limit untuk menahan spam tombol, BUKAN untuk membatasi user
 * yang     toko dengan cepat.
 *
 * Nilainya sengaja longgar (12 aksi / 10 detik) karena pola belanja itu
 * memang beruntun: buka produk → tambah → ubah qty → checkout. Batas
 * terlalu ketat akan membuat alur normallucu error "Terlalu cepat"
 * padahal tidak ada yang salah — lebih buruk daripada tidak ada
 * rate limit sama sekali.
 *
 * Yang dilindungi sebenarnya tetap JENDELA_KUNCI per-aksi di bawah, yang
 * menangkap klik ganda tanpa mengganggu navigasi biasa.
 */
const JENDELA_RATE = 10_000
const hitungAksi = new Map()
const BATAS_RATE = 12

function ambilKunci(pengguna, nama, target) {
  const kunci = `${pengguna}:${nama}:${target ?? ''}`
  const sekarang = Date.now()
  const sebelumnya = kunciAksi.get(kunci)
  if (sebelumnya && sekarang - sebelumnya < JENDELA_KUNCI) return false
  kunciAksi.set(kunci, sekarang)
  /* Pembersihan sesekali supaya Map tidak tumbuh tanpa batas di grup
     yang ramai. */
  if (kunciAksi.size > 500) {
    for (const [k, w] of kunciAksi) if (sekarang - w > 60_000) kunciAksi.delete(k)
  }
  return true
}

function terlaluSering(pengguna) {
  const sekarang = Date.now()
  const ketik = hitungAksi.get(pengguna) || []
  const terbaru = ketik.filter((w) => sekarang - w < JENDELA_RATE)
  if (terbaru.length >= BATAS_RATE) {
    hitungAksi.set(pengguna, terbaru)
    return true
  }
  terbaru.push(sekarang)
  hitungAksi.set(pengguna, terbaru)
  return false
}

/* ── Helper ────────────────────────────────────────────────────────── */
function bilang(nilai) {
  const n = Number(nilai)
  return Number.isInteger(n) && n > 0 ? n : null
}

/*
 * Sama seperti bilang(), tapi menerima 0 sebagai nilai yang sah.
 *
 * Dipakai untuk jumlah item di keranjang, di mana 0 berarti "hapus".
 * Kalau ikut memakai bilang(), nilai 0 akan jadi null dan tidak bisa
 * membedakan "hapus item" dari "argumennya tidak ada" — tombol Hapus
 * di kartu Atur Keranjang jadi tidak berfungsi.
 */
function bilanganJumlah(nilai) {
  if (nilai === undefined || nilai === null || String(nilai).trim() === '') return null
  const n = Number(nilai)
  return Number.isInteger(n) && n >= 0 ? n : null
}

function reply(conn, jid, teks, options = {}) {
  return conn.sendMessage(jid, { text: teks }, options)
}

/* Semua pesan error untuk user ditulis di sini dalam bentuk final —
   tidak pernah ada stack trace atau pesan SQLException yang bocor. */
function gagal(conn, jid, pesan, options = {}) {
  return reply(conn, jid, `❌ ${pesan}`, options)
}

/* ── Nama aksi ─────────────────────────────────────────────────────── */
/*
 * Dipisah dari logika supaya daftar ini bisa dibaca sekilas: aksi
 * OwnerMarked adalah yang mengubah data toko dan WAJIB lewat cek owner.
 * Tidak ada aksi owner yang tidak terdaftar di sini.
 */
export const AKSI_OWNER = new Set([
  'batalimg',
  // katalog
  'addlist', 'updatelist', 'dellist', 'ownerproduk', 'editproduk', 'lihatproduk', 'hapusproduk',
  'setnama', 'setharga', 'setdesc', 'setimg',
  // stok
  'setstok', 'addstock', 'delstock', 'clearstock', 'stock',
  // kategori
  'addkategori', 'delkategori', 'setkategori', 'setkategoriproduk', 'listkategori', 'delprompt',
  // transaksi
  'orderlist', 'confirmorder', 'cancelorder', 'ubahstatus',
  // pembayaran
  'addpayment', 'delpayment', 'listpayment', 'setqris', 'setpayment',
  // promo
  'addpromo', 'delpromo', 'listpromo',
  // pengaturan toko
  'setstore', 'setdescstore', 'setowner', 'setcontact', 'setimgstore', 'storestats', 'resetstore',
])

/* Aksi yang mengubah data → dilindungi kunci anti double-click. */
const AKSI_MUTASI = new Set([
  'beli', 'tambah', 'qty', 'hapusitem', 'kosongkan', 'checkout', 'batalorder', 'ubahstatus', 'favorit',
])

/* ── Parser argumen ────────────────────────────────────────────────── */
/*
 * Perintah router sudah memberi m.args = argumen setelah nama perintah,
 * jadi untuk ".store beli 12" m.args = ["beli","12"]. Argumen user
 * boleh mengandung spasi (mis. kata kunci pencarian), jadi hanya argumen
 * PERTAMA setiap aksi yang diperlakukan sebagai token tunggal.
 */
function token(args, posisi) {
  return String(args[posisi] ?? '').trim()
}

function sisa(args, posisi) {
  return args.slice(posisi).join(' ').trim()
}

/* ── Entry point ───────────────────────────────────────────────────── */
/*
 * Dipanggil dari plugins/store/store.js. Mengembalikan true bila aksi
 * sudah ditangani di sini; false berarti bukan aksi Store (mis. ".store"
 * polos yang ditangani sebagai tampilan beranda oleh plugin).
 *
 * `ctx` membawa data yang sudah dihitung router/pemanggil supaya tidak
 * perluResolve owner dua kali.
 */
export async function jalankanAksi({ conn, m, prefix, ctx }) {
  const nama = String(ctx.aksi || '').toLowerCase()
  if (!nama) return false

  const chat = m.chat
  const user = m.sender
  const opsi = { quoted: m.raw }

  /* Aksi owner: satu titik pemeriksaan, berlaku untuk semua aksi owner
     tanpa kecuali. Pemeriksaan dilakukan di sini (bukan hanya relying
     di ownerOnly router) karena string aksi berasal dari tombol yang
     bisa dikirim siapa saja. */
  if (AKSI_OWNER.has(nama)) {
    const boleh = await isOwner(user, conn, { alt: m.senderAlt, groupId: chat })
    if (!boleh) {
      await reply(conn, chat, '🔒 Perintah ini khusus untuk owner toko.', opsi)
      return true
    }
  }

  if (terlaluSering(user)) {
    await reply(conn, chat, '⏳ Terlalu cepat. Tunggu sebentar sebelum menekan lagi.', opsi)
    return true
  }

  if (AKSI_MUTASI.has(nama)) {
    /*
     * Kunci memakai SELURUH argumen, bukan hanya yang pertama.
     * "qty 1 3" lalu "qty 1 2" adalah dua aksi yang sah dan berbeda —
     * kalau hanya id produk yang jadi kunci, permintaan kedua diam-diam
     * dibuang dan user tidak bisa mengubah jumlah sampai jendela 2,5
     * detik lewat. Ini yang membuat tombol "1 / 2 / 3 / 5 / 10" di kartu
     * Atur Keranjang kadang tidak bereaksi.
     */
    const targetKunci = ctx.args.map((a) => String(a)).join('|')
    if (!ambilKunci(user, nama, targetKunci)) {
      return true // diam: klik ganda diabaikan tanpa pesan tambahan
    }
  }

  const toko = store.getSettings()
  const A = (x, ...args) => ui.aksi(prefix, x, ...args)

  switch (nama) {
    /* ── Navigasi ─────────────────────────────────────────────────── */
    case 'home': {
      const k = ui.kartuBeranda(toko, {
        adaPesanan: store.listActiveOrders(user).length,
        prefix,
        jumlahProduk: store.countProducts(),
        jumlahKategori: store.listCategories().length,
        jumlahPromo: store.listPromos(true).length,
        stokMenipis: store.listLowStock(10).filter((p) => p.stock > 0).length,
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'produk': {
      /* Bentuk: produk [halaman] [kategoriId] — dipakai tombol ◀ ▶ dan
         kartu kategori. Tanpa argumen: halaman 1, semua kategori. */
      const halaman = Math.max(1, bilanganJumlah(token(ctx.args, 0)) ?? 1)
      const categoryId = bilang(token(ctx.args, 1))
      const { items, totalHal, page } = ambilHalaman({ categoryId, halaman })
      if (!items.length) {
        await reply(
          conn,
          chat,
          categoryId
            ? '❌ Kategori ini belum punya produk.'
            : 'ℹ️ Toko belum punya produk yang tersedia.',
          opsi
        )
        return true
      }
      const k = ui.kartuProduk(items, {
        halaman: page,
        totalHal,
        total: store.countProducts({ categoryId }),
        prefix,
        categoryId,
        judul: categoryId ? '📦 PRODUK KATEGORI' : '📦 DAFTAR PRODUK',
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'produkid':
    case 'detail': {
      const p = store.getProduct(bilang(token(ctx.args, 0)))
      if (!p) return gagal(conn, chat, 'Produk tidak ditemukan.', opsi), true
      const cart = store.getCart(user)
      const jumlah = cart.items.find((i) => i.productId === p.id)?.quantity || 0
      const k = ui.kartuDetailProduk(p, { prefix, jumlahDiCart: jumlah })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'kategori': {
      const id = bilang(token(ctx.args, 0))
      if (id) {
        /* Kategori dipilih → langsung tampilkan produk di dalamnya.
           Sengaja tidak memanggil ulang jalankanAksi: pemanggilan rekursif
           akan melewati hitungan rate limit di dalam fungsi ini. */
        const { items, totalHal, page } = ambilHalaman({ categoryId: id, halaman: 1 })
        if (!items.length) {
          await reply(conn, chat, '❌ Kategori ini belum punya produk.', opsi)
          return true
        }
        const k = ui.kartuProduk(items, {
          halaman: page,
          totalHal,
          total: store.countProducts({ categoryId: id }),
          prefix,
          categoryId: id,
          judul: '📦 PRODUK KATEGORI',
        })
        await ui.kirimKartu(conn, chat, k, opsi)
        return true
      }
      const k = ui.kartuKategori(store.listCategories(), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'cari': {
      const keyword = sisa(ctx.args, 0)
      if (!keyword) {
        await reply(
          conn,
          chat,
          `🔎 Cari produk dengan mengetik:\n*${prefix}store cari <kata kunci>*\n\n` +
            'atau legacy: *' + prefix + 'searchlist <kata kunci>*',
          opsi
        )
        return true
      }
      const hasil = store.listProducts({ keyword, limit: ui.PER_HALAMAN })
      if (!hasil.length) {
        const k = ui.kartu({
          title: '🔎 HASIL PENCARIAN',
          lines: [`❌ Produk tidak ditemukan untuk "*${ui.potong(keyword, 30)}*".`, '', 'Coba kata kunci lain.'],
          buttons: [
            { label: '🔄 CARI LAGI', command: A('cari') },
            { label: '📦 LIHAT SEMUA', command: A('produk') },
          ],
        })
        await ui.kirimKartu(conn, chat, k, opsi)
        return true
      }
      const k = ui.kartu({
        title: `🔎 HASIL: ${ui.potong(keyword, 24)}`,
        lines: [`Ditemukan *${hasil.length}* produk.`],
        buttons: [{ label: '📦 LIHAT SEMUA', command: A('produk') }],
        list: {
          listTitle: 'Hasil pencarian',
          sections: [
            {
              title: 'PRODUK',
              rows: hasil.map((p) => ({
                title: ui.potong(p.name, 30),
                description: `${ui.rupiah(p.price)} · stok ${p.stock}`,
                command: A('produkid', p.id),
              })),
            },
          ],
        },
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    /* ── Cart ─────────────────────────────────────────────────────── */
    case 'cart': {
      const k = ui.kartuCart(store.getCart(user), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'tambah': {
      const hasil = store.addToCart(user, bilang(token(ctx.args, 0)), 1)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const cart = store.getCart(user)
      const k = ui.kartuCart(cart, { prefix })
      k.body = `✅ *${hasil.product.name}* ditambahkan ke keranjang.\n\n${k.body}`
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'qty': {
      /* args = [<idProduk>, <jumlah>]. Jumlah tanpa nilai berarti 0,
         yang sudah ditangani removeFromCart (tombol Hapus). */
      const id = bilang(token(ctx.args, 0))
      const qty = bilanganJumlah(token(ctx.args, 1))
      const hasil = qty === null ? store.removeFromCart(user, id) : store.setCartQuantity(user, id, qty)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const cart = store.getCart(user)
      const item = cart.items.find((i) => i.productId === id)
      if (!item) {
        await reply(conn, chat, '🗑️ Produk dihapus dari keranjang.', opsi)
        return true
      }
      const k = ui.kartuAturItem(item, { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'hapusitem': {
      const hasil = store.removeFromCart(user, bilang(token(ctx.args, 0)))
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const k = ui.kartuCart(store.getCart(user), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'kosongkan': {
      const hasil = store.clearCart(user)
      await reply(conn, chat, `🧹 Keranjang dikosongkan (${hasil.removed} produk dihapus).`, opsi)
      return true
    }

    case 'atur': {
      const cart = store.getCart(user)
      const item = cart.items.find((i) => i.productId === bilang(token(ctx.args, 0)))
      if (!item) return gagal(conn, chat, 'Produk itu tidak ada di keranjang.', opsi), true
      const k = ui.kartuAturItem(item, { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    /* ── Checkout ─────────────────────────────────────────────────── */
    case 'checkout': {
      const kodePromo = String(m.text || '').trim().toUpperCase()
      const hasil = store.createOrder(user, { promoCode: kodePromo })
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const k = ui.kartuKonfirmasiCheckout(hasil.order, { prefix, subtotal: hasil.subtotal, diskon: hasil.diskon })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    /* ── Order ────────────────────────────────────────────────────── */
    case 'beli': {
      const id = bilang(token(ctx.args, 0))
      const hasil = store.addToCart(user, id, 1)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const hasilOrder = store.createOrder(user, {})
      if (!hasilOrder.ok) return gagal(conn, chat, hasilOrder.error, opsi), true
      const k = ui.kartuKonfirmasiCheckout(hasilOrder.order, {
        prefix,
        subtotal: hasilOrder.subtotal,
        diskon: hasilOrder.diskon,
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    /*
     * .myorder / .history → HANYA order milik pemanggil.
     *
     * Sebelumnya keduanya memanggil listOrders() tanpa userId, yang
     * mengembalikan order SEMUA pembeli — jadi siapa pun yang mengetik
     * .myorder di grup bisa melihat order orang lain lengkap dengan
     * nominalnya. Ini kebocoran data pembeli, bukan sekadar tampilan.
     *
     * .orderlist (owner) tetap menampilkan semua order, dan sekarang
     * memakai judul yang berbeda supaya tidak tertukar dengan milik user.
     */
    case 'pesanan':
    case 'history': {
      const filter = String(token(ctx.args, 0) || '').toUpperCase()
      if (filter && !store.STATUS_ORDER.includes(filter)) {
        return gagal(conn, chat, `Status tidak dikenal. Pilihan: ${store.STATUS_ORDER.join(', ')}.`, opsi), true
      }
      const milik = store.listOrders({ userId: user, status: filter || null, limit: 20 })
      const k = ui.kartuDaftarOrder(milik, {
        prefix,
        judul: filter ? `📋 PESANAN ${filter}` : '📋 PESANAN SAYA',
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'orderlist': {
      const filter = String(token(ctx.args, 0) || '').toUpperCase()
      const semua = store.listOrders({ status: filter || null, limit: 30 })
      const k = ui.kartuDaftarOrder(semua, {
        prefix,
        judul: filter ? `🧾 SEMUA ORDER ${filter}` : '🧾 SEMUA ORDER',
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'filterorder': {
      const filter = String(token(ctx.args, 0) || '').toUpperCase()
      if (!store.STATUS_ORDER.includes(filter)) {
        return gagal(conn, chat, `Status tidak dikenal. Pilihan: ${store.STATUS_ORDER.join(', ')}.`, opsi), true
      }
      /* Filter dipanggil dari kartu daftar pesanan PEMILIK, jadi tetap
         dibatasi ke order user itu — bukan semua pembeli. */
      const milik = store.listOrders({ userId: user, status: filter, limit: 20 })
      const k = ui.kartuDaftarOrder(milik, { prefix, judul: `📋 PESANAN ${filter}` })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'detailorder': {
      const orderId = String(token(ctx.args, 0) || '').toUpperCase()
      const order = store.getOrder(orderId)
      if (!order) return gagal(conn, chat, 'Order tidak ditemukan.', opsi), true
      /* Kepemilikan diperiksa di sini untuk order milik user. Owner
         boleh melihat semua order lewat panel owner. */
      const ownerBoleh = await isOwner(user, conn, { alt: m.senderAlt, groupId: chat })
      if (String(order.userId) !== String(user) && !ownerBoleh) {
        return gagal(conn, chat, 'Order tidak ditemukan.', opsi), true
      }
      const k = ui.kartuOrder(order, { prefix, untukUser: String(order.userId) === String(user) })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'batalorder': {
      const orderId = String(token(ctx.args, 0) || '').toUpperCase()
      const hasil = store.cancelOwnOrder(user, orderId)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const ket = hasil.stokDikembalikan ? '\nStok produk sudah dikembalikan.' : ''
      await reply(conn, chat, `❌ Order *${orderId}* dibatalkan.${ket}`, opsi)
      return true
    }

    /* Dipakai owner dari panel order. */
    case 'ubahstatus': {
      /* args = [<idOrder>, <status>] */
      const orderId = String(token(ctx.args, 0) || '').toUpperCase()
      const status = String(token(ctx.args, 1) || '').toUpperCase()
      if (!status) {
        return gagal(conn, chat, `Status belum diisi. Pilihan: ${store.STATUS_ORDER.join(', ')}.`, opsi), true
      }
      const hasil = store.updateOrderStatus(orderId, status)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      /* Kabari pemesan supaya tahu statusnya berubah. */
      const order = hasil.order
      try {
        await conn.sendMessage(order.userId, {
          text:
            `🔔 Pembaruan order *${order.orderId}*\n\n` +
            `Status : ${ui.labelStatus(hasil.previous)} → ${ui.labelStatus(order.status)}\n` +
            `Total  : ${ui.rupiah(order.total)}`,
        })
      } catch {
        // user tidak bisa Dichatir — order tetap terupdate
      }
      const k = ui.kartuOrder(order, { prefix, untukUser: false })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    /* ── Pembayaran & info ────────────────────────────────────────── */
    /* .payment = kartu untuk user (metode + cara bayar).
       .listpayment = daftar kelolanya untuk owner (ada tombol hapus per
       metode). Sebelumnya keduanya memakai kartu yang sama, jadi owner
       tidak pernah sampai ke tampilan yang bisa dihapus. */
    case 'payment': {
      const k = ui.kartuPayment(store.listPaymentMethods(), { prefix, toko })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'listpayment': {
      const k = ui.kartuPaymentOwner(store.listPaymentMethods(false), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'bayar': {
      const orderId = String(token(ctx.args, 0) || '').toUpperCase()
      const order = store.getOrder(orderId)
      if (!order || String(order.userId) !== String(user)) {
        return gagal(conn, chat, 'Order tidak ditemukan.', opsi), true
      }
      if (order.status !== 'PENDING') {
        await reply(conn, chat, `⚠️ Order ini sudah *${order.status}*, tidak perlu dibayar lagi.`, opsi)
        return true
      }
      const metode = store.listPaymentMethods()
      if (!metode.length) {
        await reply(
          conn,
          chat,
          '⏳ Belum ada metode pembayaran yang dikonfigurasi owner. Coba lagi nanti.',
          opsi
        )
        return true
      }
      store.addPayment(order.orderId, metode[0].method, order.total)
      const k = ui.kartu({
        title: `🧾 ORDER #${order.orderId}`,
        lines: [
          `Total : *${ui.rupiah(order.total)}*`,
          '',
          'Status : 🟡 MENUNGGU PEMBAYARAN',
          '',
          'Transfer ke salah satu metode:',
          ...metode.map((x) => `• *${x.method}* — ${ui.potong(x.value, 40)}`),
          '',
          'Setelah transfer, kirim bukti ke owner. Order akan dikonfirmasi owner.',
        ],
        footer: toko.store_contact ? `Kontak: ${toko.store_contact}` : '',
        buttons: [
          { label: '📋 PESANAN SAYA', command: A('pesanan') },
          { label: '💳 METODE', command: A('payment') },
          { label: '🏠 BERANDA', command: A('home') },
        ],
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'info':
    case 'storeinfo': {
      const k = ui.kartuInfoToko({ prefix, toko, jumlahProduk: store.countProducts() })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'kontak': {
      await reply(
        conn,
        chat,
        `📞 *KONTAK TOKO*\n\nOwner : ${toko.store_owner}\nKontak : ${toko.store_contact}\nBuka   : ${toko.store_hours}`,
        opsi
      )
      return true
    }

    case 'favorit':
    case 'favorite': {
      const toggleId = bilang(token(ctx.args, 0))
      if (toggleId) {
        if (!store.getProduct(toggleId)) return gagal(conn, chat, 'Produk tidak ditemukan.', opsi), true
        const hasil = store.toggleFavorite(user, toggleId)
        const k = ui.kartuFavorit(store.listFavorites(user), { prefix })
        k.body = `${hasil.favorite ? '💖 Ditambahkan ke favorit.' : '💔 Dihapus dari favorit.'}\n\n${k.body}`
        await ui.kirimKartu(conn, chat, k, opsi)
        return true
      }
      const k = ui.kartuFavorit(store.listFavorites(user), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    /* ── Aksi owner ───────────────────────────────────────────────── */
    case 'ownerproduk': {
      const halaman = Math.max(1, bilang(token(ctx.args, 0)) || 1)
      const semua = store.listProducts({ onlyActive: false, limit: 1000 })
      const totalHal = Math.max(1, Math.ceil(semua.length / ui.PER_HALAMAN))
      const potong = semua.slice((halaman - 1) * ui.PER_HALAMAN, halaman * ui.PER_HALAMAN)
      const k = ui.kartuProdukOwner(potong, { prefix, halaman, totalHal })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'editproduk':
    case 'lihatproduk': {
      const id = bilang(token(ctx.args, 0))
      const p = store.getProduct(id)
      if (!p) return gagal(conn, chat, 'Produk tidak ditemukan.', opsi), true
      const k =
        nama === 'lihatproduk'
          ? ui.kartuDetailProduk(p, { prefix })
          : ui.kartuEditProduk(p, { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'hapusproduk': {
      const id = bilang(token(ctx.args, 0))
      const p = store.getProduct(id)
      if (!p) return gagal(conn, chat, 'Produk tidak ditemukan.', opsi), true
      const hasil = store.deleteProduct(id)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      await reply(conn, chat, `🗑️ Produk *${p.name}* disembunyikan dari etalase.`, opsi)
      return true
    }

    case 'setstok': {
      const id = bilang(token(ctx.args, 0))
      /* args = [<id>, <jumlah>] — jumlah opsional. Tanpa jumlah, kartu
         ubah stok dibuka supaya owner bisa memakai tombol. */
      const nilai = ctx.args[1] !== undefined ? Number(token(ctx.args, 1)) : null
      if (nilai === null || !Number.isInteger(nilai) || nilai < 0) {
        /* Tanpa argumen → buka kartu ubah stok supaya owner bisa pakai tombol. */
        const p = store.getProduct(id)
        if (!p) return gagal(conn, chat, 'Produk tidak ditemukan.', opsi), true
        const k = ui.kartu({
          title: '📊 UBAH STOK',
          subtitle: ui.potong(p.name, 36),
          lines: [
            `Produk : *${ui.potong(p.name, 30)}*`,
            `Stok sekarang : *${p.stock}*`,
            '',
            `Ketik: *${prefix}store setstok ${p.id} <jumlah>*`,
            `atau  *${prefix}store addstock ${p.id} <jumlah>*`,
            `atau  *${prefix}store delstock ${p.id} <jumlah>*`,
          ],
          buttons: [
            { label: '➕ +1', command: A('addstock', p.id, '1') },
            { label: '➖ -1', command: A('delstock', p.id, '1') },
            { label: '📦 PRODUK', command: A('ownerproduk', '0') },
          ],
        })
        await ui.kirimKartu(conn, chat, k, opsi)
        return true
      }
      const hasil = store.setStock(id, nilai)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      await reply(conn, chat, `📊 Stok *${hasil.product.name}* disetel ke *${hasil.product.stock}*.`, opsi)
      return true
    }

    /* Dipakai tombol +/- di kartu Ubah Stok. args = [<id>, <jumlah>].
       Penambahan dan pengurangan sengaja dipisah agar kartu bisa punya
       tombol yang sama-sama cuma satu argumen. */
    case 'addstock':
    case 'delstock': {
      const id = bilang(token(ctx.args, 0))
      const jumlah = bilanganJumlah(token(ctx.args, 1))
      if (!id || jumlah === null) {
        return gagal(conn, chat, `Contoh: \`${prefix}store ${nama} <id> <jumlah>\``, opsi), true
      }
      const hasil = store.adjustStock(id, nama === 'addstock' ? jumlah : -jumlah)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const k = ui.kartu({
        title: '📊 STOK DIPERBARUI',
        lines: [
          `Produk : *${ui.potong(hasil.product.name, 30)}*`,
          `Stok   : *${hasil.product.stock}*`,
        ],
        buttons: [
          { label: '➕ +1', command: A('addstock', id, '1') },
          { label: '➖ -1', command: A('delstock', id, '1') },
          { label: '📦 PRODUK', command: A('ownerproduk', '0') },
        ],
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'stock': {
      const semua = store.listProducts({ onlyActive: false, limit: 1000 })
      if (!semua.length) return reply(conn, chat, 'ℹ️ Belum ada produk.', opsi), true
      const k = ui.kartu({
        title: '📊 KELOLA STOK',
        lines: semua.slice(0, 15).map((p) => `• ${p.id}. *${ui.potong(p.name, 26)}* — ${ui.labelStok(p.stock)}`),
        footer: `Ketik: ${prefix}store setstok <id> <jumlah>`,
        buttons: [{ label: '📦 PRODUK', command: A('ownerproduk', '0') }],
        list: {
          listTitle: 'Pilih produk',
          sections: [
            {
              title: 'PRODUK',
              rows: semua.slice(0, 30).map((p) => ({
                title: ui.potong(p.name, 28),
                description: `stok ${p.stock} · id ${p.id}`,
                command: A('setstok', p.id),
              })),
            },
          ],
        },
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'listkategori': {
      const daftar = store.listCategories()
      const k = ui.kartuKategoriOwner(daftar, { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'hapuskategori': {
      const hasil = store.deleteCategory(bilang(token(ctx.args, 0)))
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      await reply(conn, chat, '🗂️ Kategori dihapus.', opsi)
      return true
    }

    case 'delprompt': {
      /* Kategori masih dipakai → owner diberi tahu, bukan dihapus diam-diam. */
      const c = store.getCategory(bilang(token(ctx.args, 0)))
      if (!c) return gagal(conn, chat, 'Kategori tidak ditemukan.', opsi), true
      const k = ui.kartu({
        title: '⚠️ KATEGORI MASIH DIPAKAI',
        lines: [
          `Kategori : *${c.name}*`,
          '',
          'Kategori ini masih dipakai produk. Pindahkan produknya dulu',
          'lewat `setkategoriproduk <id> <kategori>` atau kosongkan.',
        ],
        buttons: [
          { label: '📦 LIHAT PRODUK', command: A('produk', '1', c.id) },
          { label: '🗂️ KATEGORI', command: A('listkategori') },
        ],
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'setkategoriproduk': {
      const id = bilang(token(ctx.args, 0))
      const p = store.getProduct(id)
      if (!p) return gagal(conn, chat, 'Produk tidak ditemukan.', opsi), true
      const daftar = store.listCategories()
      const k = ui.kartu({
        title: '🗂️ PINDAHKAN KATEGORI',
        subtitle: ui.potong(p.name, 36),
        lines: [`Produk : *${ui.potong(p.name, 28)}*`, `Sekarang : ${p.categoryName || 'tanpa kategori'}`, '', 'Ketik: `' + prefix + 'store setkategoriproduk ' + p.id + ' <nama kategori>`'],
        list: {
          listTitle: 'Pilih kategori',
          sections: [
            {
              title: 'KATEGORI',
              rows: daftar.length
                ? daftar.map((c) => ({
                    title: ui.potong(c.name, 28),
                    description: `${c.jumlah} produk`,
                    command: A('setkategori', p.id, c.id),
                  }))
                : [{ title: 'Belum ada kategori', description: 'Buat dulu di .addkategori', command: A('listkategori') }],
            },
          ],
        },
      })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'setkategori': {
      /* Bentuk: setkategori <idProduk> <idKategori> */
      const id = bilang(token(ctx.args, 0))
      const kategoriId = bilang(token(ctx.args, 1))
      if (!kategoriId) return gagal(conn, chat, 'ID kategori belum diisi.', opsi), true
      const hasil = store.updateProduct(id, { categoryId: kategoriId })
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      await reply(conn, chat, `🗂️ *${hasil.product.name}* dipindahkan ke *${hasil.product.categoryName || 'tanpa kategori'}*.`, opsi)
      return true
    }

    /* Membatalkan sesi set gambar. Sesi-nya sendiri disimpan di
       plugins/store/store-img.js; dari sini kita hanya memberi tahu. */
    case 'batalimg': {
      await reply(conn, chat, '✕ Sesi set gambar dibatalkan.', opsi)
      return true
    }

    case 'storestats': {
      const k = ui.kartuStats(store.getStats(), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'listpromo': {
      const k = ui.kartuPromoOwner(store.listPromos(), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'delpromo': {
      const hasil = store.deletePromo(token(ctx.args, 0))
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      await reply(conn, chat, '🏷️ Promo dihapus.', opsi)
      return true
    }

    /*
     * Dipakai saat owner mengubah metode dari panel, bukan dari perintah
     * langsung. args = [<metode>, <nilai>].
     * .addpayment dan .setpayment dibedakan: yang ini eksplisit
     * (add harus baru, set harus sudah ada).
     */
    case 'addpayment':
    case 'setpayment': {
      const metode = String(token(ctx.args, 0) || '').toLowerCase()
      const nilai = sisa(ctx.args, 1)
      if (!metode || !nilai) {
        return gagal(conn, chat, `Contoh: \`${prefix}store ${nama} <metode> <nomor>\``, opsi), true
      }
      const hasil =
        nama === 'addpayment' ? store.addPaymentMethod(metode, nilai) : store.setPaymentMethod(metode, nilai)
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      const k = ui.kartuPaymentOwner(store.listPaymentMethods(false), { prefix })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    case 'delpayment': {
      const hasil = store.deletePaymentMethod(token(ctx.args, 0))
      if (!hasil.ok) return gagal(conn, chat, hasil.error, opsi), true
      await reply(conn, chat, '💳 Metode pembayaran dihapus.', opsi)
      return true
    }

    case 'setstore': {
      const stats = store.getStats()
      const k = ui.kartuPanelOwner({ prefix, toko, stats })
      await ui.kirimKartu(conn, chat, k, opsi)
      return true
    }

    default:
      /* Aksi tak dikenal tidak diam-diem diabaikan — user diberi tahu
         agar tidak mengira tombolnya berhasil. */
      await reply(conn, chat, `⚠️ Aksi store "${ui.potong(nama, 20)}" tidak dikenal.`, opsi)
      return true
  }
}

/* Helper pagination untuk daftar produk yang dilihat user. Satu sumber
   kebenaran untuk ukuran halaman dan penghitungan total halaman. */
function ambilHalaman({ categoryId = null, halaman = 1 }) {
  const perHalaman = ui.PER_HALAMAN
  const total = store.countProducts({ categoryId })
  const totalHal = Math.max(1, Math.ceil(total / perHalaman))
  const page = Math.min(Math.max(1, halaman), totalHal)
  const items = store.listProducts({ categoryId, limit: perHalaman, offset: (page - 1) * perHalaman })
  return { items, totalHal, page }
}
