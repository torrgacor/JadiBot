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
   STORE — Lapisan tampilan.

   Semua kartu Store dibangun di sini. Dua aturan yang dipegang:

   1. WhatsApp hanya merender 3 tombol per kartu (lihat ingatkanKuotaTombol
      di lib/tombol.js). Kartu yang butuh lebih dari 3 baris TIDAK dipaksakan
      jadi satu kartu; ia dipecah jadi kartu berurutan (mis. halaman
      kategori + navigasi), supaya tidak ada tombol yang tampil tapi tak
      bisa ditekan.

   2. Setiap kartu punya kartu pasangannya untuk mode teks: kirimKartu()
      selalu menyiapkan `teks` berisi nomor menu, dan hanya/tepat saat
      tombol tidak bisa dipakai (user iOS, atau kartu ditolak klien)
      nomor-nomor itulah yang dikirim. Jadi tidak pernah ada alur buntu.

   Format aksi: "<prefix>store <aksi> [argumen]". Prefix ikut di dalam
   string tombol supaya router (core/router-pesan.js) mem-parsenya seperti
   perintah biasa — inilah cara tombol di proyek ini sudah bekerja
   (lihat plugins/search/pins.js), bukan ID Deserialize yang terpisah.
   ═══════════════════════════════════════════════════════════════════ */

import { sendInteractive } from '../../lib/tombol.js'
import { getSettings } from './db.js'

/* ── Format ────────────────────────────────────────────────────────── */
export function rupiah(nilai) {
  const angka = Math.round(Number(nilai) || 0)
  return `Rp${angka.toLocaleString('id-ID')}`
}

export function potong(teks, maks = 60) {
  const isi = String(teks || '').replace(/\s+/g, ' ').trim()
  if (!isi) return ''
  return isi.length > maks ? `${isi.slice(0, maks - 1).trimEnd()}…` : isi
}

export function waktu(epoch) {
  try {
    return new Date(epoch).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    })
  } catch {
    return '-'
  }
}

export function labelStok(stok) {
  const n = Number(stok) || 0
  if (n <= 0) return '🔴 Habis'
  if (n <= 2) return `🟠 Sisa ${n}`
  return `🟢 ${n}`
}

/* Pembatas aman: WhatsApp memotong body kartu. Dipakai supaya tabel
   produk yang panjang tidak jadi satu blok teks raksasa. */
const MAKS_BARIS_BODY = 18

function potongBaris(baris) {
  return baris.length > MAKS_BARIS_BODY ? baris.slice(0, MAKS_BARIS_BODY) : baris
}

/* ── Pembuat aksi ──────────────────────────────────────────────────── */
/* Semua id aksi prefixed. ownerOnly diperiksa di core/store/aksi.js
   berdasarkan daftar aksi, bukan berdasarkan teks tombol — jadi label
   tombol boleh diubah kapan saja tanpa merusak keamanan. */
export function aksi(prefix, nama, ...args) {
  /*
   * PENTING: prefix harus digabung TANPA spasi. `.` + "store" harus jadi
   * ".store", bukan ". store".
   *
   * Tombol dikirim sebagai quick_reply id, dan router (core/router-pesan.js)
   * mem-parsenya dengan parseCommand() yang menolak teks yang tidak
   * startsWith(prefix + namaPerintah) dengan benar. Kalau spiknya salah,
   * parseCommand mengembalikan null, router tidak menemukan plugin, dan
   * setiap tombol toko jadi mati tanpa pesan error — persis gejala
   * "tombol terlihat tapi tidak bisa ditekan" yang paling menyebalkan
   * untuk dicari.
   */
  const bersih = String(prefix || '.').trim()
  /* prefix + 'store' digabung TANPA join — sisanya boleh spasi. */
  const sisa = args.filter((a) => a !== undefined && a !== null && a !== '')
  return [`${bersih}store`, nama, ...sisa].join(' ')
}

/* ── Pengirim ──────────────────────────────────────────────────────── */
/*
 * kirimKartu() adalah satu-satunya jalan keluar Store ke WhatsApp.
 *
 * `teks` WAJIB diisi: nomor menu yang setara dengan isi kartu. Bila kartu
 * interactive ditolak (user iOS, versi WA lama, atau error jaringan),
 * teks inilah yang terkirim sehingga alur tetap bisa diselesaikan dengan
 * mengetik nomornya. Tidak pernah ada tombol mati.
 */
export async function kirimKartu(conn, jid, { title, subtitle = '', body, footer = '', image, buttons = [], list = null, teks }, sendOptions = {}) {
  const kirimTeks = async () =>
    conn.sendMessage(jid, { text: teks }, sendOptions)

  if (!tombolEfektif(buttons, list)) {
    return kirimTeks()
  }

  try {
    await sendInteractive(
      conn,
      jid,
      {
        title,
        subtitle,
        body: potongBaris(body),
        footer,
        ...(image ? { image } : {}),
        buttons: buttons.slice(0, 3),
        ...(list ? { list } : {}),
      },
      sendOptions
    )
    return { ok: true, mode: 'interactive' }
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Kartu store gagal, kirim menu teks: ${err?.stack || err?.message || err}`)
    return kirimTeks()
  }
}

/*
 * Kartu layak dikirim kalau punya tombol quick-reply ATAU list.
 *
 * Catatan penting soal kuota: WhatsApp hanya merender 3 tombol QUICK per
 * kartu. Tombol `single_select` (list) TIDAK ikut dihitung kuota itu —
 * ia tombol terpisah di baris paling bawah. Jadi kartu dengan 3 tombol
 * quick + 1 list tetap sah, dan_checks hanya untuk quick button.
 *
 * Kalau hanya quick button dan jumlahnya > 3, kirimInteractive akan
 * memperingatkan dan klien bisa gagal merender -> kita lebih baik
 * langsung pakai menu teks.
 */
function tombolEfektif(buttons, list) {
  if (list) return true
  return Array.isArray(buttons) && buttons.length > 0 && buttons.length <= 3
}

/* Mengubah daftar tombol + baris teks menjadi satu set lengkap.
   Tidak ada kode yang assembling kartu boleh forgets teks: helper ini
   yang memastikannya. */
export function kartu({ title, subtitle = '', lines = [], buttons = [], list = null, image, footer }) {
  const body = lines.join('\n')

  /*
   * Menu teks fallback.
   *
   * Fallback ini BUKAN hiasan: kartu interactive ditolak WhatsApp pada
   * beberapa kondisi nyata (iOS, WA versi lama, error jaringan). Kalau
   * fallback hanya menampilkan label tombol tanpa memberi tahu perintah
   * apa yang harus diketik, user itu benar-benar buntu — tombolnya
   * terlihat tapi tak bisa dipakai dan tidak ada jalan lain.
   *
   * Karena itu setiap baris menampilkan perintahnya apa adanya, misalnya:
   *   1. PRODUK  ->  ketik: .store produk
   *
   * Baris list ikut disertakan (dibatasi 12 agar tidak jadi pesan
   * kepanjangan) karena menunya justru bagian yang paling dipakai user
   * saat tombol tidak bisa ditekan.
   */
  const menuTeks = []
  const perintahnya = (tipe, cmd) => `   ketik: ${cmd}`
  if (buttons.length) {
    menuTeks.push('', '— Menu (ketik perintahnya) —')
    buttons.forEach((b, i) => {
      menuTeks.push(`${i + 1}. ${bersihLabel(b.label)}${b.command ? perintahnya('quick', b.command) : ''}`)
    })
  }
  if (list?.sections) {
    const baris = list.sections.flatMap((s) => s.rows || [])
    if (baris.length) {
      menuTeks.push('', '— Daftar (ketik perintahnya) —')
      baris.slice(0, 12).forEach((r) => {
        menuTeks.push(`• ${potong(r.title, 34)}${r.command ? perintahnya('row', r.command) : ''}`)
      })
      if (baris.length > 12) menuTeks.push(`… dan ${baris.length - 12} lainnya`)
    }
  }

  /* subtitle boleh kosong — kalau ikut disisipkan apa adanya, muncul
     satu baris kosong dobel di setiap kartu yang tidak punya subtitle
     (daftar produk, kategori, keranjang). */
  const kepala = [title, subtitle].filter((b) => b && b.trim())
  const teks = [...kepala, '', body, ...menuTeks].filter((b) => b !== undefined && b !== null).join('\n')
  return { title, subtitle, body, footer: footer || '', image, buttons, list, teks }
}

function bersihLabel(label) {
  return String(label || '').replace(/[\u25C0\u25B6\uFE0F]/g, '').trim()
}

/* ── Kartu: Beranda ────────────────────────────────────────────────── */
export function kartuBeranda(
  toko = getSettings(),
  { adaPesanan = 0, prefix = '.', jumlahProduk = 0, jumlahKategori = 0, jumlahPromo = 0, stokMenipis = 0 } = {}
) {
  const p = toko.store_footer || ''
  const nama = toko.store_name || 'NANO STORE'

  /*
   * Beranda dulu hanya berisi "pilih menu di bawah" — praktis kosong,
   * dan justru 어디-mana orang pertama kali mendarat. Sekarang kartu ini
   * memberi jawaban yang paling mungkin dibutuhkan sebelum fokusnya
  tombol pertama ditekan: ada berapa produk, kategori apa saja, promo
   * apa yang jalan, jam bukanya kapan, dan ke mana nanya kalau ragu.
   */
  const lines = [`Selamat datang di *${nama}*.`, '']
  lines.push(`📦 *${jumlahProduk}* produk · 🗂️ *${jumlahKategori}* kategori`)

  if (jumlahPromo > 0) {
    lines.push(`🏷️ *${jumlahPromo}* promo sedang berjalan — kode ada di menu promo`)
  }
  if (stokMenipis > 0) {
    lines.push(`⚠️ *${stokMenipis}* produk stoknya menipis, buruan!`)
  }
  if (adaPesanan > 0) {
    lines.push('', `🧾 Kamu punya *${adaPesanan}* pesanan yang belum selesai.`)
  }

  lines.push('', potong(toko.store_desc, 90) || 'Pilih menu di bawah untuk mulai.')
  if (toko.store_hours && toko.store_hours !== '-') lines.push(`🕘 Buka : ${toko.store_hours}`)
  if (toko.store_contact && toko.store_contact !== '-') lines.push(`📞 Kontak : ${toko.store_contact}`)

  return kartu({
    title: `🛍️ ${nama}`,
    subtitle: potong(toko.store_desc, 50),
    image: toko.store_banner || toko.store_thumb || undefined,
    lines,
    footer: p,
    buttons: [
      { label: '📦 PRODUK', command: aksi(prefix, 'produk') },
      { label: '🛒 CART', command: aksi(prefix, 'cart') },
      { label: '📋 PESANAN', command: aksi(prefix, 'pesanan') },
    ],
    list: {
      listTitle: 'Menu toko',
      sections: [
        {
          title: 'NANO STORE',
          rows: [
            { title: '📦 Daftar Produk', description: 'Lihat semua produk yang tersedia', command: aksi(prefix, 'produk') },
            { title: '🗂️ Kategori', description: 'Pilih kategori produk', command: aksi(prefix, 'kategori') },
            { title: '🔎 Cari Produk', description: 'Cari berdasarkan kata kunci', command: aksi(prefix, 'cari') },
          ],
        },
        {
          title: 'TRANSAKSI',
          rows: [
            { title: '🛒 Keranjang', description: 'Lihat isi keranjang kamu', command: aksi(prefix, 'cart') },
            { title: '📋 Pesanan Saya', description: 'Lihat status pesanan', command: aksi(prefix, 'pesanan') },
            { title: '💳 Pembayaran', description: 'Metode pembayaran tersedia', command: aksi(prefix, 'payment') },
          ],
        },
        {
          title: 'LAINNYA',
          rows: [
            { title: '♥️ Favorit', description: 'Produk yang kamu tandai', command: aksi(prefix, 'favorit') },
            { title: 'ℹ️ Info Toko', description: 'Kontak dan jam buka', command: aksi(prefix, 'info') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Daftar produk (dengan pagination) ──────────────────────── */
export const PER_HALAMAN = 8

export function kartuProduk(produk, { halaman = 1, totalHal = 1, total = 0, prefix = '.', judul = '📦 DAFTAR PRODUK', categoryId = null }) {
  /*
   * Body kartu ini yang dibaca user kalau kartu interactive-nya tidak
   * terbaca (iOS, WA lama, atau clipboard). Dulu isinya hanya
   * "nama — harga · stok", sehingga user harus menekan tiap baris satu
   * per satu hanya untuk membandingkan mana yang layak dibuka. Sekarang
   * deskripsi dan kategori ikut dibawa.
   */
  const baris = [
    `Menampilkan *${produk.length}* dari *${total}* produk · halaman ${halaman}/${totalHal}`,
    '',
  ]
  for (const p of produk) {
    baris.push(`• *${potong(p.name, 34)}* — ${rupiah(p.price)} · ${labelStok(p.stock)}`)
    if (p.description) baris.push(`   ${potong(p.description, 46)}`)
    const rincian = [p.categoryName, p.stock === 0 ? 'stok habis' : null].filter(Boolean).join(' · ')
    if (rincian) baris.push(`   ${rincian}`)
  }

  /*
   * categoryId ikut dibawa di setiap perintah navigasi. Kalau tidak,
   * menekan ▶️ di halaman produk kategori akan kembali ke daftar SEMUA
   * produk — filter hilang begitu user berpindah halaman, dan itu terasa
   * sangat membingungkan karena tombolnya kelihatan bekerja.
   */
  const navigasi = [
    ...(halaman > 1
      ? [{ label: '◀️ SEBELUMNYA', command: aksi(prefix, 'produk', String(halaman - 1), ...(categoryId ? [String(categoryId)] : [])) }]
      : []),
    ...(halaman < totalHal
      ? [{ label: '▶️ BERIKUTNYA', command: aksi(prefix, 'produk', String(halaman + 1), ...(categoryId ? [String(categoryId)] : [])) }]
      : []),
  ]

  return kartu({
    title: judul,
    lines: baris,
    buttons: navigasi.length ? navigasi : [{ label: '🔎 CARI', command: aksi(prefix, 'cari') }],
    list: {
      listTitle: 'Pilih produk',
      sections: [
        {
          title: potong(judul.replace(/^\S+\s*/, ''), 22),
          rows: produk.map((p) => ({
            title: potong(p.name, 30),
            description: `${rupiah(p.price)}${p.categoryName ? ` · ${potong(p.categoryName, 14)}` : ''}${p.stock > 0 ? ` · stok ${p.stock}` : ' · 🔴 habis'}`,
            command: aksi(prefix, 'produkid', p.id),
          })),
        },
        {
          title: 'LAINNYA',
          rows: [
            { title: '🔎 Cari produk', description: 'Cari dengan kata kunci', command: aksi(prefix, 'cari') },
            { title: '🗂️ Kategori', description: 'Filter per kategori', command: aksi(prefix, 'kategori') },
            { title: '🏠 Beranda', description: 'Kembali ke menu utama', command: aksi(prefix, 'home') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Detail produk ──────────────────────────────────────────── */
export function kartuDetailProduk(p, { prefix = '.', jumlahDiCart = 0, favorit = false } = {}) {
  const baris = []
  if (p.description) baris.push(`📝 ${potong(p.description, 220)}`, '')
  baris.push(
    `💰 Harga  : *${rupiah(p.price)}*`,
    `📊 Stok   : ${labelStok(p.stock)}${p.stock > 0 ? ` (${p.stock} tersedia)` : ''}`,
    `🗂️ Kategori : ${p.categoryName || 'Tanpa kategori'}`
  )
  if (p.stock === 0) {
    baris.push('', '🔴 Stok habis. Tidak bisa dibeli untuk sekarang.')
  }
  if (jumlahDiCart) baris.push('', `🛒 Di keranjang : *${jumlahDiCart}*`)
  baris.push('', 'Tekan 🛒 BELI untuk langsung pesan, atau ➕ KE KERANJANG untuk menumpuk dulu.')

  return kartu({
    title: '📦 DETAIL PRODUK',
    subtitle: potong(p.name, 40),
    lines: baris,
    image: p.image || undefined,
    footer: 'Pilih aksi di bawah',
    buttons: [
      { label: '🛒 BELI', command: aksi(prefix, 'beli', p.id) },
      { label: '➕ KE KERANJANG', command: aksi(prefix, 'tambah', p.id) },
      { label: '◀️ KEMBALI', command: aksi(prefix, 'produk') },
    ],
  })
}

/* ── Kartu: Kategori ───────────────────────────────────────────────── */
export function kartuKategori(daftar, { prefix = '.' } = {}) {
  if (!daftar.length) {
    return kartu({
      title: '🗂️ KATEGORI',
      lines: [
        'Belum ada kategori di toko ini.',
        'Semua produk masih tampil sebagai "Tanpa kategori".',
        '',
        'Owner bisa menambah lewat `.addkategori Nama`.',
      ],
      buttons: [{ label: '🏠 BERANDA', command: aksi(prefix, 'home') }],
    })
  }
  const totalProduk = daftar.reduce((n, c) => n + (c.jumlah || 0), 0)
  return kartu({
    title: '🗂️ KATEGORI TOKO',
    lines: [
      `Ada *${daftar.length}* kategori dengan *${totalProduk}* produk.`,
      '',
      ...daftar.slice(0, 8).map((c) => `• *${potong(c.name, 24)}* — ${c.jumlah} produk`),
      ...(daftar.length > 8 ? ['', `… dan ${daftar.length - 8} kategori lainnya`] : []),
      '',
      'Pilih kategori di bawah, atau ketik `.store cari <kata kunci>`.',
    ],
    buttons: [{ label: '🏠 BERANDA', command: aksi(prefix, 'home') }],
    list: {
      listTitle: 'Pilih kategori',
      sections: [
        {
          title: 'KATEGORI',
          rows: daftar.map((c) => ({
            title: potong(c.name, 28),
            description: c.jumlah > 0 ? `${c.jumlah} produk` : 'belum ada produk',
            command: aksi(prefix, 'kategori', c.id),
          })),
        },
        {
          title: 'LAINNYA',
          rows: [
            { title: '📦 Semua produk', description: 'Tanpa filter kategori', command: aksi(prefix, 'produk') },
            { title: '🏠 Beranda', description: 'Kembali ke menu utama', command: aksi(prefix, 'home') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Keranjang ─────────────────────────────────────────────── */
export function kartuCart(cart, { prefix = '.' } = {}) {
  if (!cart.items.length) {
    return kartu({
      title: '🛒 KERANJANG',
      lines: ['Keranjang kamu masih kosong.', '', 'Cari produk dulu, lalu tekan BELI.'],
      buttons: [
        { label: '📦 LIHAT PRODUK', command: aksi(prefix, 'produk') },
        { label: '🏠 BERANDA', command: aksi(prefix, 'home') },
      ],
    })
  }

  const totalItem = cart.items.reduce((n, i) => n + i.quantity, 0)
  const baris = [
    `${cart.items.length} produk · ${totalItem} item di keranjang.`,
    '',
  ]
  let bermasalah = 0
  for (const item of cart.items) {
    baris.push(`• *${potong(item.name, 30)}* × ${item.quantity} = ${rupiah(item.subtotal)}`)
    if (item.stock < item.quantity) {
      baris.push(`   ⚠️ stok tinggal *${item.stock}* — kurangi dulu sebelum checkout`)
      bermasalah++
    } else if (item.stock === 0) {
      baris.push('   🔴 stok habis — hapus dari keranjang')
      bermasalah++
    }
  }
  baris.push('', `*Subtotal : ${rupiah(cart.total)}*`)
  baris.push('')
  if (bermasalah) {
    baris.push(`⚠️ ${bermasalah} produk bermasalah dengan stoknya. Checkout akan ditolak sampai diperbaiki.`)
  } else {
    baris.push('✅ Stok semua produk tersedia. Tekan 🧾 CHECKOUT untuk lanjut.')
  }

  return kartu({
    title: '🛒 KERANJANG',
    subtitle: `${cart.items.length} produk`,
    lines: baris,
    footer: 'Total dihitung ulang dari harga terbaru saat checkout',
    buttons: [
      { label: '🧾 CHECKOUT', command: aksi(prefix, 'checkout') },
      { label: '🧹 KOSONGKAN', command: aksi(prefix, 'kosongkan') },
      { label: '📦 PRODUK', command: aksi(prefix, 'produk') },
    ],
    list: {
      listTitle: 'Atur isi keranjang',
      sections: [
        {
          title: 'ISI KERANJANG',
          rows: cart.items.map((item) => ({
            title: potong(item.name, 28),
            description: `x${item.quantity} · ${rupiah(item.subtotal)} · stok ${item.stock}`,
            command: aksi(prefix, 'atur', item.productId),
          })),
        },
        {
          title: 'AKSI',
          rows: [
            { title: '🧾 Checkout', description: 'Beli semua isi keranjang', command: aksi(prefix, 'checkout') },
            { title: '🧹 Kosongkan', description: 'Hapus semua isi keranjang', command: aksi(prefix, 'kosongkan') },
            { title: '🏠 Beranda', description: 'Kembali ke menu utama', command: aksi(prefix, 'home') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Atur item keranjang ───────────────────────────────────── */
export function kartuAturItem(item, { prefix = '.' } = {}) {
  return kartu({
    title: '⚙️ ATUR KERANJANG',
    subtitle: potong(item.name, 40),
    lines: [
      `Produk : *${potong(item.name, 34)}*`,
      `Harga  : ${rupiah(item.price)} per item`,
      `Jumlah : *${item.quantity}*`,
      `Stok   : ${item.stock}`,
      '',
      `Subtotal : *${rupiah(item.price * item.quantity)}*`,
    ],
    buttons: [
      { label: '➕ Tambah 1', command: aksi(prefix, 'qty', item.productId, String(item.quantity + 1)) },
      { label: '➖ Kurang 1', command: aksi(prefix, 'qty', item.productId, String(Math.max(0, item.quantity - 1))) },
      { label: '🗑️ Hapus', command: aksi(prefix, 'hapusitem', item.productId) },
    ],
    list: {
      listTitle: 'Pilih jumlah',
      sections: [
        {
          title: 'JUMLAH',
          rows: [1, 2, 3, 5, 10]
            .filter((n) => n <= item.stock + 1)
            .map((n) => ({
              title: `${n} item`,
              description: n > item.stock ? 'melebihi stok' : `Total ${rupiah(item.price * n)}`,
              command: aksi(prefix, 'qty', item.productId, String(n)),
            })),
        },
        {
          title: 'LAINNYA',
          rows: [
            { title: '🧾 Checkout', description: 'Beli semua isi keranjang', command: aksi(prefix, 'checkout') },
            { title: '🛒 Lihat keranjang', description: 'Kembali ke keranjang', command: aksi(prefix, 'cart') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Konfirmasi checkout ───────────────────────────────────── */
export function kartuKonfirmasiCheckout(order, { prefix = '.', subtotal = 0, diskon = 0 } = {}) {
  const baris = order.items.map((item) => `• *${potong(item.productName, 30)}* × ${item.quantity} = ${rupiah(item.subtotal)}`)
  baris.push('', `🧾 *ORDER #${order.orderId}*`)
  if (diskon > 0) {
    baris.push(`Subtotal : ${rupiah(subtotal)}`, `Promo    : -${rupiah(diskon)}`)
  }
  baris.push(`*Total    : ${rupiah(order.total)}*`)
  baris.push('', 'Status: 🟡 MENUNGGU PEMBAYARAN')

  return kartu({
    title: '🧾 KONFIRMASI ORDER',
    lines: baris,
    footer: 'Stok sudah dikurangi. Batalkan lewat tombol BATAL untuk mengembalikan stok.',
    buttons: [
      { label: '💳 LANJUTKAN BAYAR', command: aksi(prefix, 'bayar', order.orderId) },
      { label: '❌ BATAL ORDER', command: aksi(prefix, 'batalorder', order.orderId) },
      { label: '📋 PESANAN SAYA', command: aksi(prefix, 'pesanan') },
    ],
  })
}

/* ── Kartu: Detail order ──────────────────────────────────────────── */
const WARNA_STATUS = {
  PENDING: '🟡 PENDING',
  PAID: '🔵 PAID',
  PROCESSING: '📦 PROCESSING',
  COMPLETED: '🟢 COMPLETED',
  CANCELLED: '🔴 CANCELLED',
  EXPIRED: '⌛ EXPIRED',
}

export function labelStatus(status) {
  return WARNA_STATUS[String(status).toUpperCase()] || String(status)
}

export function kartuOrder(order, { prefix = '.', untukUser = true } = {}) {
  const baris = order.items.map((item) => `• *${potong(item.productName, 30)}* × ${item.quantity} = ${rupiah(item.subtotal)}`)
  baris.push('', `Total  : *${rupiah(order.total)}*`, `Status : ${labelStatus(order.status)}`, `Dibuat : ${waktu(order.createdAt)}`)

  const tombol = untukUser
    ? [
        { label: '💳 BAYAR', command: aksi(prefix, 'bayar', order.orderId) },
        { label: '❌ BATAL', command: aksi(prefix, 'batalorder', order.orderId) },
        { label: '📋 SEMUA PESANAN', command: aksi(prefix, 'pesanan') },
      ]
    : [
        { label: '✅ CONFIRM', command: aksi(prefix, 'ubahstatus', order.orderId, 'PAID') },
        { label: '📦 PROSES', command: aksi(prefix, 'ubahstatus', order.orderId, 'PROCESSING') },
        { label: '✅ SELESAI', command: aksi(prefix, 'ubahstatus', order.orderId, 'COMPLETED') },
      ]

  return kartu({
    title: `🧾 #${order.orderId}`,
    subtitle: labelStatus(order.status),
    lines: baris,
    footer: untukUser ? 'Pembayaran dikonfirmasi owner' : 'Panel owner',
    buttons: tombol,
  })
}

/* ── Kartu: Daftar pesanan ────────────────────────────────────────── */
export function kartuDaftarOrder(daftar, { prefix = '.', judul = '📋 PESANAN SAYA', untukUser = true } = {}) {
  if (!daftar.length) {
    return kartu({
      title: judul,
      lines: ['Belum ada pesanan.', '', `Buat lewat ${prefix}store → keranjang → checkout.`],
      buttons: [{ label: '🏠 BERANDA', command: aksi(prefix, 'home') }],
    })
  }
  return kartu({
    title: judul,
    lines: [`Ada *${daftar.length}* pesanan.`],
    buttons: [{ label: '🔄 REFRESH', command: aksi(prefix, untukUser ? 'pesanan' : 'orderlist') }],
    list: {
      listTitle: 'Pilih pesanan',
      sections: [
        {
          title: 'PESANAN',
          rows: daftar.map((order) => ({
            title: `#${order.orderId}`,
            description: `${labelStatus(order.status)} · ${rupiah(order.total)} · ${waktu(order.createdAt)}`,
            command: aksi(prefix, 'detailorder', order.orderId),
          })),
        },
        {
          title: 'FILTER',
          rows: ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((s) => ({
            title: `Filter ${s}`,
            description: 'Tampilkan pesanan berstatus ini',
            command: aksi(prefix, 'filterorder', s),
          })),
        },
      ],
    },
  })
}

/* ── Kartu: Pembayaran ────────────────────────────────────────────── */
export function kartuPayment(metode, { prefix = '.', toko = getSettings() } = {}) {
  if (!metode.length) {
    return kartu({
      title: '💳 PEMBAYARAN',
      lines: [
        '⚠️ Belum ada metode pembayaran yang dikonfigurasi owner.',
        '',
        'Jadi toko belum bisa menerima pembayaran.',
        'Coba lagi nanti, atau tanya owner langsung.',
        '',
        'Owner bisa menambah lewat `.addpayment <metode> <nomor>`.',
      ],
      buttons: [{ label: '🏠 BERANDA', command: aksi(prefix, 'home') }],
    })
  }
  return kartu({
    title: '💳 METODE PEMBAYARAN',
    subtitle: toko.store_name,
    lines: [
      ...metode.map((m) => `• *${m.method}* — ${potong(m.value, 40)}`),
      '',
      'Cara bayar:',
      `1. Pilih produk lalu tekan 🛒 BELI (atau 🧾 CHECKOUT dari keranjang).`,
      `2. Transfer *tepat* sejumlah total tagihan ke salah satu metode di atas.`,
      `3. Kirim bukti ke owner, order akan dikonfirmasi manual.`,
      '',
      ...(toko.store_contact && toko.store_contact !== '-' ? [`📞 Contact : ${toko.store_contact}`] : []),
      ...(toko.store_hours && toko.store_hours !== '-' ? [`🕘 Buka  : ${toko.store_hours}`] : []),
    ],
    footer: 'Pembayaran dikonfirmasi owner, bukan otomatis',
    buttons: [{ label: '🏠 BERANDA', command: aksi(prefix, 'home') }],
  })
}

/* ── Kartu: Info toko ─────────────────────────────────────────────── */
export function kartuInfoToko({ prefix = '.', toko = getSettings(), jumlahProduk = 0 } = {}) {
  return kartu({
    title: `🏪 ${toko.store_name}`,
    image: toko.store_banner || toko.store_thumb || undefined,
    lines: [
      `🏪 Nama     : *${toko.store_name}*`,
      `📝 Deskripsi: ${potong(toko.store_desc, 80)}`,
      `👤 Owner    : ${toko.store_owner}`,
      `📞 Kontak  : ${toko.store_contact}`,
      `🕘 Buka    : ${toko.store_hours}`,
      `📦 Produk  : ${jumlahProduk}`,
    ],
    footer: toko.store_footer,
    buttons: [
      { label: '📞 KONTAK', command: aksi(prefix, 'kontak') },
      { label: '💳 BAYARAN', command: aksi(prefix, 'payment') },
      { label: '📦 PRODUK', command: aksi(prefix, 'produk') },
    ],
  })
}

/* ── Kartu: Favorit ───────────────────────────────────────────────── */
export function kartuFavorit(daftar, { prefix = '.' } = {}) {
  if (!daftar.length) {
    return kartu({
      title: '♥️ FAVORIT',
      lines: ['Belum ada produk favorit.', 'Tekan ❓ di detail produk untuk menandai.'],
      buttons: [{ label: '📦 PRODUK', command: aksi(prefix, 'produk') }],
    })
  }
  return kartu({
    title: '♥️ FAVORIT',
    lines: [`Ada *${daftar.length}* produk favorit.`],
    buttons: [{ label: '📦 PRODUK', command: aksi(prefix, 'produk') }],
    list: {
      listTitle: 'Produk favorit',
      sections: [
        {
          title: 'FAVORIT',
          rows: daftar.map((p) => ({
            title: potong(p.name, 30),
            description: `${rupiah(p.price)} · ${labelStok(p.stock)}`,
            command: aksi(prefix, 'produkid', p.id),
          })),
        },
      ],
    },
  })
}

/* ── Kartu: Panel owner ───────────────────────────────────────────── */
export function kartuPanelOwner({ prefix = '.', toko = getSettings(), stats = null } = {}) {
  const baris = [
    `Toko : *${toko.store_name}*`,
    ...(stats
      ? [
          '',
          `📦 Produk   : ${stats.produk.total} (${stats.produk.aktif} aktif)`,
          `🧾 Order    : ${stats.order.total}`,
          `🟡 Pending  : ${stats.order.pending}`,
          `💰 Omzet    : ${rupiah(stats.pendapatan)}`,
        ]
      : []),
  ]
  return kartu({
    title: '🛠️ STORE MANAGEMENT',
    subtitle: 'Panel owner',
    lines: baris,
    footer: 'Khusus owner',
    buttons: [
      { label: '➕ ADD PRODUCT', command: aksi(prefix, 'ownerproduk') },
      { label: '🧾 ORDERS', command: aksi(prefix, 'orderlist') },
      { label: '📊 STATS', command: aksi(prefix, 'storestats') },
    ],
    list: {
      listTitle: 'Menu owner',
      sections: [
        {
          title: 'KATALOG',
          rows: [
            { title: '➕ Tambah produk', description: 'Nama|Harga|Deskripsi|Stok', command: aksi(prefix, 'ownerproduk') },
            { title: '📦 Semua produk', description: 'Termasuk produk disembunyikan', command: aksi(prefix, 'ownerproduk', '0') },
            { title: '📊 Stok', description: 'Tambah, kurang, atau set stok', command: aksi(prefix, 'stock') },
          ],
        },
        {
          title: 'TRANSAKSI',
          rows: [
            { title: '🧾 Semua order', description: 'Kelola status pesanan masuk', command: aksi(prefix, 'orderlist') },
            { title: '💳 Metode bayar', description: 'Kelola metode pembayaran', command: aksi(prefix, 'listpayment') },
            { title: '🏷️ Promo', description: 'Kelola kode promo', command: aksi(prefix, 'listpromo') },
          ],
        },
        {
          title: 'TOKO',
          rows: [
            { title: '🗂️ Kategori', description: 'Kelola kategori produk', command: aksi(prefix, 'listkategori') },
            { title: '⚙️ Pengaturan', description: 'Nama, kontak, jam buka', command: aksi(prefix, 'setstore') },
            { title: '📈 Statistik', description: 'Omzet dan produk terlaris', command: aksi(prefix, 'storestats') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Statistik ──────────────────────────────────────────────── */
export function kartuStats(stats, { prefix = '.' } = {}) {
  const baris = [
    '📊 Total produk : ' + stats.produk.total,
    `   ├ aktif : ${stats.produk.aktif} · disembunyi : ${stats.produk.tersembunyi} · habis : ${stats.produk.habis}`,
    '',
    `🧾 Total order : ${stats.order.total}`,
    `   ├ 🟡 pending   : ${stats.order.pending}`,
    `   ├ 🔵 paid      : ${stats.order.paid}`,
    `   ├ 📦 processing: ${stats.order.processing}`,
    `   ├ 🟢 completed : ${stats.order.completed}`,
    `   └ 🔴 cancelled : ${stats.order.cancelled}`,
    '',
    `💰 *Total omzet : ${rupiah(stats.pendapatan)}*`,
  ]

  if (stats.terlaris.length) {
    baris.push('', '🏆 Produk terlaris:')
    for (const t of stats.terlaris) baris.push(`   • ${potong(t.name, 24)} × ${t.jumlah} (${rupiah(t.omzet)})`)
  }
  if (stats.menipis.length) {
    baris.push('', '⚠️ Stok menipis:')
    for (const p of stats.menipis) baris.push(`   • ${potong(p.name, 24)} — sisa ${p.stock}`)
  }

  return kartu({
    title: '📊 STATISTIK TOKO',
    subtitle: 'Data real dari database',
    lines: baris,
    buttons: [
      { label: '🔄 REFRESH', command: aksi(prefix, 'storestats') },
      { label: '🧾 ORDERS', command: aksi(prefix, 'orderlist') },
      { label: '🏠 BERANDA', command: aksi(prefix, 'home') },
    ],
  })
}

/* ── Kartu: Konfirmasi hapus ──────────────────────────────────────── */
export function kartuKonfirmasiHapus(baris, { prefix = '.', aksiHapus, aksiBatal }) {
  return kartu({
    title: '⚠️ KONFIRMASI HAPUS',
    lines: [...baris, '', 'Tindakan ini tidak bisa dibatalkan.'],
    buttons: [
      { label: '🗑️ HAPUS', command: aksiHapus },
      { label: '❌ BATAL', command: aksiBatal },
    ],
  })
}

/* ── Kartu: Daftar produk owner ───────────────────────────────────── */
export function kartuProdukOwner(daftar, { prefix = '.', halaman = 1, totalHal = 1 } = {}) {
  if (!daftar.length) {
    return kartu({
      title: '📦 PRODUK (OWNER)',
      lines: ['Belum ada produk.', '', 'Tambah dengan `.addlist Nama|Harga|Deskripsi|Stok`.'],
      buttons: [{ label: '➕ TAMBAH', command: aksi(prefix, 'ownerproduk') }],
    })
  }
  const baris = [`Halaman ${halaman}/${totalHal} · total ${daftar.length} produk`, '']
  for (const p of daftar) {
    baris.push(`${p.id}. *${potong(p.name, 28)}* — ${rupiah(p.price)} · ${labelStok(p.stock)}${p.status !== 'active' ? ' · disembunyikan' : ''}`)
  }
  return kartu({
    title: '📦 PRODUK (OWNER)',
    lines: baris,
    buttons: [
      ...(halaman > 1 ? [{ label: '◀️ SEBELUMNYA', command: aksi(prefix, 'ownerproduk', String(halaman - 1)) }] : []),
      ...(halaman < totalHal ? [{ label: '▶️ BERIKUTNYA', command: aksi(prefix, 'ownerproduk', String(halaman + 1)) }] : []),
    ],
    list: {
      listTitle: 'Kelola produk',
      sections: [
        {
          title: 'PRODUK',
          rows: daftar.map((p) => ({
            title: potong(p.name, 28),
            description: `id ${p.id} · ${rupiah(p.price)} · stok ${p.stock}`,
            command: aksi(prefix, 'editproduk', p.id),
          })),
        },
        {
          title: 'AKSI',
          rows: [
            { title: '➕ Tambah produk', description: 'Tambah produk baru', command: aksi(prefix, 'ownerproduk') },
            { title: '📊 Kelola stok', description: 'Tambah / kurang stok', command: aksi(prefix, 'stock') },
            { title: '🗂️ Kategori', description: 'Kelola kategori', command: aksi(prefix, 'listkategori') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Menu edit produk ──────────────────────────────────────── */
export function kartuEditProduk(p, { prefix = '.' } = {}) {
  return kartu({
    title: '✏️ EDIT PRODUK',
    subtitle: potong(p.name, 40),
    lines: [
      `ID : ${p.id}`,
      `Nama : ${potong(p.name, 30)}`,
      `Harga : ${rupiah(p.price)}`,
      `Stok : ${p.stock}`,
      `Kategori : ${p.categoryName || '—'}`,
      `Gambar : ${p.image ? 'ada' : 'belum ada'}`,
      '',
      'Ketik perintah untuk mengubah, misalnya:',
      `  ${prefix}setnama ${p.id} Nama Baru`,
      `  ${prefix}setharga ${p.id} 15000`,
      `  ${prefix}setdesc ${p.id} Deskripsi baru`,
      `  ${prefix}setimg ${p.id} (reply foto)`,
      `  ${prefix}setstok ${p.id} 20`,
    ],
    footer: 'Perubahan langsung tersimpan ke database',
    buttons: [
      { label: '📊 UBAH STOK', command: aksi(prefix, 'setstok', p.id) },
      { label: '🗑️ HAPUS', command: aksi(prefix, 'hapusproduk', p.id) },
      { label: '📦 PRODUK', command: aksi(prefix, 'ownerproduk', '0') },
    ],
    list: {
      listTitle: 'Aksi produk',
      sections: [
        {
          title: 'UBAH',
          rows: [
            { title: '💰 Ubah harga', description: 'Ketik setnama/setnama dan kirim', command: aksi(prefix, 'editproduk', p.id) },
            { title: '📦 Ubah stok', description: 'Tambah, kurang, atau set', command: aksi(prefix, 'setstok', p.id) },
            { title: '🗂️ Ubah kategori', description: 'Pindahkan ke kategori lain', command: aksi(prefix, 'setkategoriproduk', p.id) },
          ],
        },
        {
          title: 'LAINNYA',
          rows: [
            { title: '👁️ Lihat sebagai user', description: 'Pratinjau kartu produk', command: aksi(prefix, 'lihatproduk', p.id) },
            { title: '🗑️ Hapus produk', description: 'Sembunyikan dari etalase', command: aksi(prefix, 'hapusproduk', p.id) },
            { title: '📦 Kembali', description: 'Daftar produk owner', command: aksi(prefix, 'ownerproduk', '0') },
          ],
        },
      ],
    },
  })
}

/* ── Kartu: Daftar kategori owner ─────────────────────────────────── */
export function kartuKategoriOwner(daftar, { prefix = '.' } = {}) {
  if (!daftar.length) {
    return kartu({
      title: '🗂️ KATEGORI (OWNER)',
      lines: ['Belum ada kategori.', 'Tambah dengan `.addkategori Nama [Deskripsi]`.'],
      buttons: [{ label: '🏠 BERANDA', command: aksi(prefix, 'home') }],
    })
  }
  return kartu({
    title: '🗂️ KATEGORI (OWNER)',
    lines: [`Ada *${daftar.length}* kategori.`],
    buttons: [{ label: '🏠 BERANDA', command: aksi(prefix, 'home') }],
    list: {
      listTitle: 'Kelola kategori',
      sections: [
        {
          title: 'KATEGORI',
          rows: daftar.map((c) => ({
            title: `${c.id}. ${potong(c.name, 24)}`,
            description: c.jumlah > 0 ? `${c.jumlah} produk memakai ini` : 'kosong — bisa dihapus',
            command: c.jumlah > 0 ? aksi(prefix, 'delprompt', c.id) : aksi(prefix, 'hapuskategori', c.id),
          })),
        },
      ],
    },
  })
}

/* ── Kartu: Metode pembayaran owner ───────────────────────────────── */
export function kartuPaymentOwner(daftar, { prefix = '.' } = {}) {
  const baris = daftar.length
    ? daftar.map((m) => `• *${m.method}* — ${potong(m.value, 40)}`)
    : ['Belum ada metode terdaftar.']
  return kartu({
    title: '💳 METODE PEMBAYARAN (OWNER)',
    lines: baris,
    footer: 'Tambah dengan `.addpayment <metode> <nomor/QRIS>`',
    buttons: [
      { label: '🔄 REFRESH', command: aksi(prefix, 'listpayment') },
      { label: '🏠 BERANDA', command: aksi(prefix, 'home') },
    ],
    list: daftar.length
      ? {
          listTitle: 'Kelola metode',
          sections: [
            {
              title: 'METODE',
              rows: daftar.map((m) => ({
                title: `Hapus ${m.method}`,
                description: potong(m.value, 30),
                command: aksi(prefix, 'delpayment', m.method),
              })),
            },
          ],
        }
      : null,
  })
}

/* ── Kartu: Promo owner ───────────────────────────────────────────── */
export function kartuPromoOwner(daftar, { prefix = '.' } = {}) {
  const baris = daftar.length
    ? daftar.map((p) => `• *${p.code}* — ${p.kind === 'fixed' ? rupiah(p.discount) : `${p.discount}%`} · dipakai ${p.used}${p.quota >= 0 ? `/${p.quota}` : ''} · ${p.active ? 'aktif' : 'nonaktif'}`)
    : ['Belum ada promo.']
  return kartu({
    title: '🏷️ PROMO (OWNER)',
    lines: baris,
    footer: 'Tambah dengan `.addpromo KODE 10 [kuota]`',
    buttons: [
      { label: '🔄 REFRESH', command: aksi(prefix, 'listpromo') },
      { label: '🏠 BERANDA', command: aksi(prefix, 'home') },
    ],
    list: daftar.length
      ? {
          listTitle: 'Kelola promo',
          sections: [
            {
              title: 'PROMO',
              rows: daftar.map((p) => ({
                title: `Hapus ${p.code}`,
                description: `${p.discount}${p.kind === 'percent' ? '%' : ' rupiah'}`,
                command: aksi(prefix, 'delpromo', p.code),
              })),
            },
          ],
        }
      : null,
  })
}
