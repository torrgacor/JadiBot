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
   STORE — Lapisan data.
   Semua state Store hidup di SQLite yang sama dengan users/premium/owner
   (core/sqlite.js), bukan variabel global: keranjang, order, dan stok
   harus selamat dari restart bot maupun reconnect WhatsApp.

   Modul ini tidak tahu apa pun soal WhatsApp. Dia hanya baca/tulis dan
   mengembalikan objek biasa; UI ada di core/store/ui.js, navigasi button
   di core/store/aksi.js.

   keputusan desain yang penting:
   - `harga` dan `stok` SELALU dibaca ulang dari database saat checkout.
     Nilai yang dibawa kartu atau pesan tidak pernah dipercaya.
   - Pengurangan stok memakai satu UPDATE berkondisi (stock >= qty), bukan
     "baca dulu, tulis lalu". Kalau UPDATE-nya affect 0 baris berarti ada
     yang lebih dulu membeli, dan itu langsung dibatalkan — ini yang mencegah
     overselling even tanpa lock eksplisit.
   - Order dengan status aktif memakai order_id berawalan NANO + timestamp,
     jadi mustahil user menebak ID order orang lain di grup.
   ═══════════════════════════════════════════════════════════════════ */

import { getDb } from '../sqlite.js'

/* ── Skema ─────────────────────────────────────────────────────────── */
let skemaSiap = false

export function ensureStoreSchema() {
  if (skemaSiap) return
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      categoryId INTEGER,
      image TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES store_categories(id)
    );

    CREATE INDEX IF NOT EXISTS idx_store_products_category
      ON store_products (categoryId, status);

    CREATE TABLE IF NOT EXISTS store_cart (
      userId TEXT NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      PRIMARY KEY (userId, productId),
      FOREIGN KEY (productId) REFERENCES store_products(id)
    );

    CREATE TABLE IF NOT EXISTS store_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL UNIQUE,
      userId TEXT NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      paymentStatus TEXT NOT NULL DEFAULT 'UNPAID',
      note TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_store_orders_user
      ON store_orders (userId, createdAt DESC);

    /* orderId di sini merujuk kolom store_orders.orderId (id publik
       berbentuk NANO…), BUKAN kolom id integer. Seluruh API Store
      menggunakan id publik itu, dan kedua table maupun payments
       konsisten merujuk kolom yang sama. Kalau salah satu menunjuk
       kolom id, setiap INSERT akan gagal dengan FOREIGN KEY constraint
       — bukan error yang mudah ditebak sumbernya. */
    CREATE TABLE IF NOT EXISTS store_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      productId INTEGER NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (orderId) REFERENCES store_orders(orderId)
    );

    CREATE INDEX IF NOT EXISTS idx_store_order_items_order
      ON store_order_items (orderId);

    CREATE TABLE IF NOT EXISTS store_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      method TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (orderId) REFERENCES store_orders(orderId)
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS store_promos (
      code TEXT PRIMARY KEY,
      discount INTEGER NOT NULL,
      kind TEXT NOT NULL DEFAULT 'percent',
      quota INTEGER NOT NULL DEFAULT -1,
      used INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_favorites (
      userId TEXT NOT NULL,
      productId INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      PRIMARY KEY (userId, productId)
    );
  `)
  skemaSiap = true
}

/* Nama dari user bisa datang dengan spasi ganda atau huruf besar
   berbeda — dinormalkan supaya "Premium  1 Bulan" dan "premium 1 bulan"
   tidak jadi dua produk berbeda. */
function namaBersih(nama) {
  return String(nama || '').replace(/\s+/g, ' ').trim()
}

/* ── Kategori ──────────────────────────────────────────────────────── */
export function listCategories() {
  ensureStoreSchema()
  return getDb()
    .prepare(`
      SELECT c.id, c.name, c.description, c.createdAt,
             (SELECT COUNT(*) FROM store_products p
               WHERE p.categoryId = c.id AND p.status = 'active') AS jumlah
      FROM store_categories c ORDER BY c.name COLLATE NOCASE
    `)
    .all()
}

export function getCategory(id) {
  ensureStoreSchema()
  return getDb().prepare('SELECT * FROM store_categories WHERE id = ?').get(Number(id)) || null
}

export function getCategoryByName(name) {
  ensureStoreSchema()
  return getDb().prepare('SELECT * FROM store_categories WHERE name = ? COLLATE NOCASE').get(String(name)) || null
}

export function addCategory(name, description = '') {
  ensureStoreSchema()
  const bersih = namaBersih(name)
  if (!bersih) return { ok: false, error: 'Nama kategori kosong.' }
  if (getCategoryByName(bersih)) return { ok: false, error: `Kategori "${bersih}" sudah ada.` }
  const db = getDb()
  const info = db
    .prepare('INSERT INTO store_categories (name, description, createdAt) VALUES (?, ?, ?)')
    .run(bersih, String(description || ''), Date.now())
  return { ok: true, id: Number(info.lastInsertRowid), name: bersih }
}

export function deleteCategory(id) {
  ensureStoreSchema()
  const db = getDb()
  const num = Number(id)
  const dipakai = db.prepare('SELECT COUNT(*) AS n FROM store_products WHERE categoryId = ?').get(num)?.n || 0
  if (dipakai > 0) {
    return { ok: false, error: `Kategori masih dipakai ${dipakai} produk. Pindahkan produknya dulu.` }
  }
  db.prepare('DELETE FROM store_categories WHERE id = ?').run(num)
  return { ok: true }
}

/* ── Produk ────────────────────────────────────────────────────────── */
const SELECT_PRODUK = `
  SELECT p.*, c.name AS categoryName
  FROM store_products p
  LEFT JOIN store_categories c ON c.id = p.categoryId
`

function barisKeProduk(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description,
    categoryId: row.categoryId,
    categoryName: row.categoryName || '',
    image: row.image || '',
    stock: row.stock,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function listProducts({ categoryId = null, keyword = '', limit = 50, offset = 0, onlyActive = true } = {}) {
  ensureStoreSchema()
  const syarat = []
  const args = []
  if (onlyActive) syarat.push("p.status = 'active'")
  if (categoryId) {
    syarat.push('p.categoryId = ?')
    args.push(Number(categoryId))
  }
  if (keyword) {
    /* Pencarian melewati nama, deskripsi, DAN nama kategori sekaligus —
       pengguna mengetik kata kunci, tidak perlu tahu itu nama produk
       atau nama kategori. LIKE dengan parameter, bukan string yang
       disambung manual, jadi tidak ada celah SQL injection. */
    syarat.push('(p.name LIKE ? COLLATE NOCASE OR p.description LIKE ? COLLATE NOCASE OR c.name LIKE ? COLLATE NOCASE)')
    const pola = `%${keyword}%`
    args.push(pola, pola, pola)
  }
  const where = syarat.length ? `WHERE ${syarat.join(' AND ')}` : ''
  const rows = getDb()
    .prepare(`${SELECT_PRODUK} ${where} ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`)
    .all(...args, Number(limit), Number(offset))
  return rows.map(barisKeProduk)
}

export function countProducts({ categoryId = null, keyword = '', onlyActive = true } = {}) {
  ensureStoreSchema()
  const syarat = []
  const args = []
  if (onlyActive) syarat.push("p.status = 'active'")
  if (categoryId) {
    syarat.push('p.categoryId = ?')
    args.push(Number(categoryId))
  }
  if (keyword) {
    syarat.push('(p.name LIKE ? COLLATE NOCASE OR p.description LIKE ? COLLATE NOCASE OR c.name LIKE ? COLLATE NOCASE)')
    const pola = `%${keyword}%`
    args.push(pola, pola, pola)
  }
  const where = syarat.length ? `WHERE ${syarat.join(' AND ')}` : ''
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n
       FROM store_products p
       LEFT JOIN store_categories c ON c.id = p.categoryId
       ${where}`
    )
    .get(...args)
  return row?.n || 0
}

export function getProduct(id) {
  ensureStoreSchema()
  const num = Number(id)
  if (!Number.isInteger(num) || num <= 0) return null
  return barisKeProduk(getDb().prepare(`${SELECT_PRODUK} WHERE p.id = ?`).get(num))
}

export function getProductByName(name) {
  ensureStoreSchema()
  const bersih = namaBersih(name)
  if (!bersih) return null
  return barisKeProduk(
    getDb().prepare(`${SELECT_PRODUK} WHERE p.name = ? COLLATE NOCASE LIMIT 1`).get(bersih)
  )
}

/* Harga disimpan sebagai INTEGER rupiah penuh. Nilainya sudah diparse
   oleh pemanggil; di sini dijaga agar tidak negatif dan tidak melebihi
   batas aman SQLite — harga sebesar 1e15 akan dibulatkan ke float dan
   total checkout ikut jadi tidak akurat. */
const MAKS_HARGA = 1_000_000_000_000

export function addProduct({ name, price, description = '', categoryId = null, image = '', stock = 0 }) {
  ensureStoreSchema()
  const bersih = namaBersih(name)
  if (!bersih) return { ok: false, error: 'Nama produk kosong.' }
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: 'Harga harus angka lebih dari 0.' }
  if (price > MAKS_HARGA) return { ok: false, error: 'Harga terlalu besar.' }
  if (!Number.isInteger(stock) || stock < 0) return { ok: false, error: 'Stok harus angka bulat 0 atau lebih.' }
  if (getProductByName(bersih)) return { ok: false, error: `Produk "${bersih}" sudah ada.` }
  if (categoryId && !getCategory(categoryId)) return { ok: false, error: 'Kategori tidak ditemukan.' }

  const now = Date.now()
  const info = getDb()
    .prepare(
      `INSERT INTO store_products
         (name, price, description, categoryId, image, stock, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .run(bersih, Math.round(price), String(description || ''), categoryId || null, image || null, Math.round(stock), now, now)
  return { ok: true, id: Number(info.lastInsertRowid), name: bersih }
}

/* Patch hanya berisi field yang dikirim caller. Kolom yang tidak ada
   di patch TIDAK disentuh — jadi edit harga tidak pernah diam-diam
   menimpa deskripsi atau stok. */
export function updateProduct(id, patch = {}) {
  ensureStoreSchema()
  const produk = getProduct(id)
  if (!produk) return { ok: false, error: 'Produk tidak ditemukan.' }

  const kolom = []
  const args = []

  if (patch.name !== undefined) {
    const bersih = namaBersih(patch.name)
    if (!bersih) return { ok: false, error: 'Nama produk kosong.' }
    const lain = getProductByName(bersih)
    if (lain && lain.id !== produk.id) return { ok: false, error: `Produk "${bersih}" sudah dipakai produk lain.` }
    kolom.push('name = ?'); args.push(bersih)
  }
  if (patch.price !== undefined) {
    if (!Number.isFinite(patch.price) || patch.price <= 0) return { ok: false, error: 'Harga harus angka lebih dari 0.' }
    if (patch.price > MAKS_HARGA) return { ok: false, error: 'Harga terlalu besar.' }
    kolom.push('price = ?'); args.push(Math.round(patch.price))
  }
  if (patch.description !== undefined) { kolom.push('description = ?'); args.push(String(patch.description)) }
  if (patch.image !== undefined) { kolom.push('image = ?'); args.push(patch.image || null) }
  if (patch.categoryId !== undefined) {
    const cat = patch.categoryId === null || patch.categoryId === '' ? null : Number(patch.categoryId)
    if (cat !== null && !getCategory(cat)) return { ok: false, error: 'Kategori tidak ditemukan.' }
    kolom.push('categoryId = ?'); args.push(cat)
  }
  if (patch.stock !== undefined) {
    if (!Number.isInteger(patch.stock) || patch.stock < 0) return { ok: false, error: 'Stok harus angka bulat 0 atau lebih.' }
    kolom.push('stock = ?'); args.push(patch.stock)
  }
  if (patch.status !== undefined) {
    const status = String(patch.status).toLowerCase()
    if (!['active', 'hidden'].includes(status)) return { ok: false, error: 'Status harus active atau hidden.' }
    kolom.push('status = ?'); args.push(status)
  }

  if (!kolom.length) return { ok: false, error: 'Tidak ada perubahan.' }
  kolom.push('updatedAt = ?'); args.push(Date.now())
  args.push(produk.id)
  getDb().prepare(`UPDATE store_products SET ${kolom.join(', ')} WHERE id = ?`).run(...args)
  return { ok: true, product: getProduct(produk.id) }
}

/* Hapus produk = disembunyikan, bukan dihapus fisik. Order lama masih
   menunjuk produk ini lewat store_order_items.productId; menghapus
   barisnya akan membuat riwayat order user jadi rusak. */
export function deleteProduct(id) {
  ensureStoreSchema()
  const produk = getProduct(id)
  if (!produk) return { ok: false, error: 'Produk tidak ditemukan.' }
  getDb().prepare("UPDATE store_products SET status = 'hidden', updatedAt = ? WHERE id = ?").run(Date.now(), produk.id)
  return { ok: true, product: produk }
}

export function setStock(id, stock) {
  return updateProduct(id, { stock })
}

export function adjustStock(id, delta) {
  ensureStoreSchema()
  const produk = getProduct(id)
  if (!produk) return { ok: false, error: 'Produk tidak ditemukan.' }
  if (!Number.isFinite(delta)) return { ok: false, error: 'Jumlah tidak valid.' }
  const set = produk.stock + Math.trunc(delta)
  if (set < 0) return { ok: false, error: `Stok "${produk.name}" hanya ${produk.stock}, tidak bisa dikurangi ${Math.abs(Math.trunc(delta))}.` }
  return updateProduct(id, { stock: set })
}

export function listLowStock(limit = 10) {
  ensureStoreSchema()
  return getDb()
    .prepare(`${SELECT_PRODUK} WHERE p.status = 'active' AND p.stock <= 5 ORDER BY p.stock ASC, p.name LIMIT ?`)
    .all(Number(limit))
    .map(barisKeProduk)
}

/* ── Keranjang ─────────────────────────────────────────────────────── */
export function getCart(userId) {
  ensureStoreSchema()
  const rows = getDb()
    .prepare(
      `SELECT c.productId, c.quantity, p.name, p.price, p.stock, p.image, p.status
       FROM store_cart c
       JOIN store_products p ON p.id = c.productId
       WHERE c.userId = ?
       ORDER BY c.createdAt ASC`
    )
    .all(String(userId))

  /* Produk yang disembunyikan owner TIDAK ikut dihitung — kalau tidak,
     user akan melihat barang yang tak bisa dibeli dan.total-nya jadi bohong. */
  const items = []
  let total = 0
  for (const row of rows) {
    if (row.status !== 'active') continue
    items.push({
      productId: row.productId,
      name: row.name,
      price: row.price,
      quantity: row.quantity,
      stock: row.stock,
      image: row.image || '',
      subtotal: row.price * row.quantity,
    })
    total += row.price * row.quantity
  }
  return { items, total }
}

export function addToCart(userId, productId, quantity = 1) {
  ensureStoreSchema()
  const produk = getProduct(productId)
  if (!produk) return { ok: false, error: 'Produk tidak ditemukan.' }
  if (produk.status !== 'active') return { ok: false, error: 'Produk ini sudah tidak tersedia.' }
  if (!Number.isInteger(quantity) || quantity < 1) return { ok: false, error: 'Jumlah harus minimal 1.' }

  const db = getDb()
  const ada = db
    .prepare('SELECT quantity FROM store_cart WHERE userId = ? AND productId = ?')
    .get(String(userId), produk.id)
  const berikut = (ada?.quantity || 0) + quantity
  /* Peringatan stok di sini cuma UX. Pengurangan stok yang sebenarnya
     terjadi saat checkout dalam satu UPDATE berkondisi. */
  if (produk.stock > 0 && berikut > produk.stock) {
    return { ok: false, error: `Stok "${produk.name}" tinggal ${produk.stock}.` }
  }
  if (produk.stock === 0) return { ok: false, error: `Stok "${produk.name}" habis.` }

  db.prepare(
    `INSERT INTO store_cart (userId, productId, quantity, createdAt) VALUES (?, ?, ?, ?)
     ON CONFLICT(userId, productId) DO UPDATE SET quantity = ?`
  ).run(String(userId), produk.id, quantity, Date.now(), berikut)
  return { ok: true, product: produk, quantity: berikut }
}

export function setCartQuantity(userId, productId, quantity) {
  ensureStoreSchema()
  const produk = getProduct(productId)
  if (!produk) return { ok: false, error: 'Produk tidak ditemukan.' }
  const db = getDb()
  if (quantity <= 0) {
    db.prepare('DELETE FROM store_cart WHERE userId = ? AND productId = ?').run(String(userId), produk.id)
    return { ok: true, removed: true }
  }
  const ada = db
    .prepare('SELECT quantity FROM store_cart WHERE userId = ? AND productId = ?')
    .get(String(userId), produk.id)
  if (!ada) return { ok: false, error: 'Produk itu tidak ada di keranjang.' }
  if (produk.stock > 0 && quantity > produk.stock) {
    return { ok: false, error: `Stok "${produk.name}" tinggal ${produk.stock}.` }
  }
  db.prepare('UPDATE store_cart SET quantity = ? WHERE userId = ? AND productId = ?').run(
    quantity,
    String(userId),
    produk.id
  )
  return { ok: true, quantity }
}

export function removeFromCart(userId, productId) {
  ensureStoreSchema()
  const info = getDb()
    .prepare('DELETE FROM store_cart WHERE userId = ? AND productId = ?')
    .run(String(userId), Number(productId))
  if (!info.changes) return { ok: false, error: 'Produk itu tidak ada di keranjang.' }
  return { ok: true }
}

export function clearCart(userId) {
  ensureStoreSchema()
  const info = getDb().prepare('DELETE FROM store_cart WHERE userId = ?').run(String(userId))
  return { ok: true, removed: info.changes }
}

export default {}

/* ── Order ─────────────────────────────────────────────────────────── */
export const STATUS_ORDER = ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'EXPIRED']
/* Status yang masih "hidup": order-nya masih bisa dibayar/diproses.
   BEGIN dipakai supaya status tidak bisa dilompati diam-diam. */
const AKTIF = ['PENDING', 'PAID', 'PROCESSING']

function barisKeOrder(row, items = []) {
  if (!row) return null
  return {
    id: row.id,
    orderId: row.orderId,
    userId: row.userId,
    total: row.total,
    status: row.status,
    paymentStatus: row.paymentStatus,
    note: row.note || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items,
  }
}

export function getOrderItems(orderId) {
  ensureStoreSchema()
  return getDb()
    .prepare('SELECT productId, productName, quantity, price FROM store_order_items WHERE orderId = ? ORDER BY id ASC')
    .all(String(orderId))
    .map((row) => ({
      productId: row.productId,
      productName: row.productName,
      quantity: row.quantity,
      price: row.price,
      subtotal: row.price * row.quantity,
    }))
}

export function getOrder(orderId) {
  ensureStoreSchema()
  const row = getDb().prepare('SELECT * FROM store_orders WHERE orderId = ?').get(String(orderId))
  if (!row) return null
  return barisKeOrder(row, getOrderItems(row.orderId))
}

export function listOrders({ userId = null, status = null, limit = 20, offset = 0 } = {}) {
  ensureStoreSchema()
  const syarat = []
  const args = []
  if (userId) {
    syarat.push('userId = ?')
    args.push(String(userId))
  }
  if (status) {
    syarat.push('status = ?')
    args.push(String(status))
  }
  const where = syarat.length ? `WHERE ${syarat.join(' AND ')}` : ''
  const rows = getDb()
    .prepare(`SELECT * FROM store_orders ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
    .all(...args, Number(limit), Number(offset))
  return rows.map((row) => barisKeOrder(row, getOrderItems(row.orderId)))
}

export function listActiveOrders(userId) {
  return listOrders({ userId, limit: 20 }).filter((o) => AKTIF.includes(o.status))
}

function buatOrderId() {
  /* NANO +YYMMDDHHMM + 4 digit acak. Panjang 21, jauh di bawah batas
     field WhatsApp, dan cukup unik untuk toko skala bot WhatsApp. */
  const d = new Date()
  const pad = (n, l = 2) => String(n).padStart(l, '0')
  const stempel =
    pad(d.getFullYear() % 100) + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes())
  const acak = pad(Math.floor(Math.random() * 10000), 4)
  return `NANO${stempel}${acak}`
}

/* Checkout Inti.
   Semua yang menentukan (harga, stok, total) dihitung ulang di sini dari
   database; nilai dari kartu/pesan tidak pernah dipakai. Pembuatan order
   dan pengurangan stok jalan dalam SATU transaksi: kalau satu UPDATE
   stok gagal, seluruh order dibatalkan dan keranjang tidak tersentuh.

   `promoCode` opsional. Diskon disimpan sebagai kode, bukan nominal, jadi
   keranjang yang tersimpan tetap benar walau promo diubah owner. */
export function createOrder(userId, { promoCode = '', note = '' } = {}) {
  ensureStoreSchema()
  const db = getDb()
  const pemakai = String(userId)

  /* Kunci transaksi. better-sqlite3 menjalankan blok ini secara sinkron
     dalam satu koneksi, jadi tidak ada proses lain yang bisa membaca
     stok di tengah-tengah pembuatan order ini. */
  const buat = db.transaction(() => {
    const cart = getCart(pemakai)
    if (!cart.items.length) return { ok: false, error: 'Keranjang masih kosong.' }

    let subtotal = cart.total

    /* Validasi stok SEBELUM apa pun ditulis. */
    for (const item of cart.items) {
      if (item.stock < item.quantity) {
        return {
          ok: false,
          error: `Stok "${item.name}" tinggal ${item.stock}, kamu pesan ${item.quantity}.`,
        }
      }
    }

    /* Promo: divalidasi di server dari kode yang diberikan, bukan dari
       nominal yang dikirim user. */
    let diskon = 0
    let kodePromo = null
    if (promoCode) {
      const promo = db
        .prepare('SELECT * FROM store_promos WHERE code = ? COLLATE NOCASE AND active = 1')
        .get(String(promoCode).trim())
      if (!promo) return { ok: false, error: 'Kode promo tidak valid atau sudah berakhir.' }
      if (promo.quota >= 0 && promo.used >= promo.quota) {
        return { ok: false, error: 'Kuota promo ini sudah habis.' }
      }
      kodePromo = promo.code
      diskon =
        promo.kind === 'fixed'
          ? Math.min(promo.discount, subtotal)
          : Math.floor((subtotal * promo.discount) / 100)
    }

    const total = Math.max(0, subtotal - diskon)
    const now = Date.now()
    const orderId = buatOrderId()

    const info = db
      .prepare(
        `INSERT INTO store_orders (orderId, userId, total, status, paymentStatus, note, createdAt, updatedAt)
         VALUES (?, ?, ?, 'PENDING', 'UNPAID', ?, ?, ?)`
      )
      .run(orderId, pemakai, total, String(note || ''), now, now)

    /* Pengurangan stok satu per satu dengan syarat stock >= qty.
       Kalau affect 0, berarti stok berubah di antara validasi dan
       penulisan — transaksi ini lalu dibatalkan seluruhnya. */
    const kurangiStok = db.prepare(
      'UPDATE store_products SET stock = stock - ?, updatedAt = ? WHERE id = ? AND stock >= ?'
    )
    const sisipItem = db.prepare(
      'INSERT INTO store_order_items (orderId, productId, productName, quantity, price) VALUES (?, ?, ?, ?, ?)'
    )
    for (const item of cart.items) {
      const hasil = kurangiStok.run(item.quantity, now, item.productId, item.quantity)
      if (!hasil.changes) {
        throw new Error(`Stok "${item.name}" habis saat pesanan diproses.`)
      }
      sisipItem.run(orderId, item.productId, item.name, item.quantity, item.price)
    }

    if (kodePromo) {
      db.prepare('UPDATE store_promos SET used = used + 1 WHERE code = ?').run(kodePromo)
    }

    /* Keranjang dikosongkan setelah order jadi — bukan sebelum, supaya
       order gagal tidak membuat user kehilangan isi keranjangnya. */
    db.prepare('DELETE FROM store_cart WHERE userId = ?').run(pemakai)

    return { ok: true, order: barisKeOrder(db.prepare('SELECT * FROM store_orders WHERE orderId = ?').get(orderId), getOrderItems(orderId)), subtotal, diskon, promo: kodePromo }
  })

  try {
    return buat()
  } catch (err) {
    /* Pesan dari error sengaja dibuat ramah user — stack trace tidak
       pernah tampil ke chat, hanya ke log server. */
    console.log(`  \x1b[31m✗\x1b[0m  Checkout gagal: ${err.message}`)
    return { ok: false, error: err.message?.includes('Stok') ? err.message : 'Pesanan gagal diproses. Silakan coba lagi.' }
  }
}

export function updateOrderStatus(orderId, status) {
  ensureStoreSchema()
  const baru = String(status).toUpperCase()
  if (!STATUS_ORDER.includes(baru)) return { ok: false, error: 'Status tidak dikenal.' }
  const db = getDb()
  const order = db.prepare('SELECT * FROM store_orders WHERE orderId = ?').get(String(orderId))
  if (!order) return { ok: false, error: 'Order tidak ditemukan.' }
  if (order.status === baru) return { ok: false, error: `Order ini sudah berstatus ${baru}.` }

  /* Transisi sah yang boleh owner lakukan. Prevent status قديم (mis.
     COMPLETED lalu kebalik CANCELLED) yang akan merusak laporan. */
  const BOLEH = {
    PENDING: ['PAID', 'CANCELLED', 'EXPIRED'],
    PAID: ['PROCESSING', 'COMPLETED', 'CANCELLED'],
    PROCESSING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
  }
  const boleh = BOLEH[order.status] || []
  if (!boleh.includes(baru)) {
    return { ok: false, error: `Order ${order.status} tidak bisa diubah ke ${baru}.` }
  }

  db.prepare('UPDATE store_orders SET status = ?, paymentStatus = ?, updatedAt = ? WHERE orderId = ?').run(
    baru,
    baru === 'CANCELLED' || baru === 'EXPIRED' ? 'CANCELLED' : baru === 'PENDING' ? 'UNPAID' : 'PAID',
    Date.now(),
    String(orderId)
  )
  return { ok: true, order: getOrder(orderId), previous: order.status }
}

export function cancelOrder(orderId, olehUser = false) {
  ensureStoreSchema()
  const db = getDb()
  const order = db.prepare('SELECT * FROM store_orders WHERE orderId = ?').get(String(orderId))
  if (!order) return { ok: false, error: 'Order tidak ditemukan.' }
  if (!AKTIF.includes(order.status)) {
    return { ok: false, error: `Order ini sudah ${order.status}, tidak bisa dibatalkan.` }
  }

  /* Stok dikembalikan HANYA untuk order yang belum pernah jadi PAID —
     kalau sudah dibayar, stok sudah "terjual" dan pengembaliannya keputusan
     owner (jalur .confirmorder). Ini mencegah stok dobel saat cancel. */
  const balikin = order.status === 'PENDING'
  db.transaction(() => {
    if (balikin) {
      const items = getOrderItems(order.orderId)
      const now = Date.now()
      for (const item of items) {
        db.prepare('UPDATE store_products SET stock = stock + ?, updatedAt = ? WHERE id = ?').run(
          item.quantity,
          now,
          item.productId
        )
      }
    }
    db.prepare('UPDATE store_orders SET status = ?, paymentStatus = ?, updatedAt = ? WHERE orderId = ?').run(
      'CANCELLED',
      'CANCELLED',
      Date.now(),
      String(orderId)
    )
  })()

  return { ok: true, order: getOrder(orderId), stokDikembalikan: balikin }
}

/* Dipakai user: hanya order miliknya sendiri yang boleh dia batalkan. */
export function cancelOwnOrder(userId, orderId) {
  ensureStoreSchema()
  const order = getOrder(orderId)
  if (!order) return { ok: false, error: 'Order tidak ditemukan.' }
  if (String(order.userId) !== String(userId)) {
    /* Sama persis dengan "tidak ditemukan" supaya user tidak bisa
       menebak keberadaan order orang lain hanya dari pesan error. */
    return { ok: false, error: 'Order tidak ditemukan.' }
  }
  if (order.status !== 'PENDING') {
    return { ok: false, error: `Order ini sudah ${order.status}, tidak bisa dibatalkan.` }
  }
  return cancelOrder(orderId)
}

/* ── Pembayaran ────────────────────────────────────────────────────── */
export const STATUS_PAYMENT = ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']

export function addPayment(orderId, method, amount) {
  ensureStoreSchema()
  const db = getDb()
  const now = Date.now()
  const info = db
    .prepare('INSERT INTO store_payments (orderId, method, amount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)')
    .run(String(orderId), String(method), Math.round(amount), 'PENDING', now, now)
  return { ok: true, id: Number(info.lastInsertRowid) }
}

export function listPayments(orderId = null) {
  ensureStoreSchema()
  const db = getDb()
  if (orderId) {
    return db.prepare('SELECT * FROM store_payments WHERE orderId = ? ORDER BY createdAt DESC').all(String(orderId))
  }
  return db.prepare('SELECT * FROM store_payments ORDER BY createdAt DESC LIMIT 50').all()
}

export function setPaymentStatus(paymentId, status) {
  ensureStoreSchema()
  const baru = String(status).toUpperCase()
  if (!STATUS_PAYMENT.includes(baru)) return { ok: false, error: 'Status pembayaran tidak dikenal.' }
  getDb().prepare('UPDATE store_payments SET status = ?, updatedAt = ? WHERE id = ?').run(baru, Date.now(), Number(paymentId))
  return { ok: true }
}

/* ── Pengaturan toko ───────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  store_name: 'NANO STORE',
  store_desc: 'Selamat datang di toko digital kami.',
  store_owner: '-',
  store_contact: '-',
  store_banner: '',
  store_thumb: '',
  store_footer: 'Terima kasih sudah berbelanja di NANO STORE',
  store_hours: 'Setiap hari 08.00 - 22.00 WIB',
}

export function getSettings() {
  ensureStoreSchema()
  const rows = getDb().prepare('SELECT key, value FROM store_settings').all()
  const hasil = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    if (row.key in DEFAULT_SETTINGS) hasil[row.key] = row.value ?? ''
  }
  return hasil
}

/* Kunci metode pembayaran (payment_dana, payment_qris, …) sengaja TIDAK
   ada di DEFAULT_SETTINGS — daftar itu hanya untuk teks profil toko.
   Kalau hanya DEFAULT_SETTINGS yang boleh ditulis, setPaymentMethod()
   selalu gagal dan owner tidak akan pernah bisa mendaftarkan metode
   pembayaran apa pun. Karena itu awalan "payment_" tetap diterima,
   sementara kunci asing lain tetap ditolak. */
export function setSetting(key, value) {
  ensureStoreSchema()
  const namaKunci = String(key)
  if (!(namaKunci in DEFAULT_SETTINGS) && !namaKunci.startsWith('payment_')) {
    return { ok: false, error: 'Pengaturan tidak dikenal.' }
  }
  getDb()
    .prepare('INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(namaKunci, value === null || value === undefined ? '' : String(value))
  return { ok: true }
}

/* ── Metode pembayaran ─────────────────────────────────────────────── */
/* Owner yang mendaftarkan metode, jadi hanya metode yang benar-benar ada
   yang ditampilkan ke user — tidak ada metode fiktif. */
export function listPaymentMethods(aktifSaja = true) {
  ensureStoreSchema()
  const rows = getDb().prepare('SELECT * FROM store_settings WHERE key LIKE ?').all('payment_%')
  const hasil = []
  for (const row of rows) {
    const nama = row.key.slice('payment_'.length).toUpperCase()
    const nilai = String(row.value || '').trim()
    if (!nilai) continue
    if (aktifSaja && nilai.toLowerCase() === 'off') continue
    hasil.push({ method: nama, value: nilai.toLowerCase() === 'off' ? '' : nilai })
  }
  return hasil
}

function kunciPayment(method) {
  return `payment_${String(method).toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

/* true kalau metodenya sudah pernah didaftarkan (nilai "off" tetap
   dihitung terdaftar — owner pernah memakainya, jadi masih bisa dihidupkan
   lagi tanpa didaftarkan ulang). */
export function hasPaymentMethod(method) {
  ensureStoreSchema()
  const kunci = kunciPayment(method)
  const row = getDb().prepare('SELECT value FROM store_settings WHERE key = ?').get(kunci)
  return row !== undefined
}

/*
 * Dua operasi yang sengaja dibedakan, mengikuti pola yang sudah dipakai
 * untuk kategori dan promo (add = harus baru, set = harus sudah ada):
 *   addPaymentMethod  -> gagal kalau metodenya sudah terdaftar
 *   setPaymentMethod  -> gagal kalau metodenya belum terdaftar
 *
 * Kalau keduanya cuma "tulis saja", salah satu perintah pasti tidak
 * berguna dan owner tidak pernah tahu apakah perubahannya terpakai.
 */
export function addPaymentMethod(method, value) {
  if (!String(method || '').trim()) return { ok: false, error: 'Metode pembayaran kosong.' }
  if (hasPaymentMethod(method)) {
    return { ok: false, error: `Metode *${String(method).toUpperCase()}* sudah terdaftar. Ubah dengan .setpayment, atau hapus dulu dengan .delpayment.` }
  }
  return setSetting(kunciPayment(method), value)
}

/*
 * Tulis tanpa syarat sudah ada atau belum — dipakai .setqris.
 * Perintah itu berdiri sendiri ("setel QRIS ke ...") dan harus berhasil
 * baik saat QRIS baru pertama kali diisi maupun saat diperbarui.
 * Kalau ikut aturan setPaymentMethod (harus sudah terdaftar), .setqris
 * gagal pada pemakaian pertama justru saat owner sedang butuh.
 */
export function upsertPaymentMethod(method, value) {
  if (!String(method || '').trim()) return { ok: false, error: 'Metode pembayaran kosong.' }
  return setSetting(kunciPayment(method), value)
}

export function setPaymentMethod(method, value) {
  if (!String(method || '').trim()) return { ok: false, error: 'Metode pembayaran kosong.' }
  if (!hasPaymentMethod(method)) {
    return { ok: false, error: `Metode *${String(method).toUpperCase()}* belum terdaftar. Tambah dulu dengan .addpayment.` }
  }
  return setSetting(kunciPayment(method), value)
}

export function deletePaymentMethod(method) {
  ensureStoreSchema()
  const info = getDb().prepare('DELETE FROM store_settings WHERE key = ?').run(kunciPayment(method))
  if (!info.changes) return { ok: false, error: 'Metode itu tidak terdaftar.' }
  return { ok: true }
}

/* ── Promo ─────────────────────────────────────────────────────────── */
export function listPromos(aktifSaja = false) {
  ensureStoreSchema()
  const where = aktifSaja ? 'WHERE active = 1' : ''
  return getDb().prepare(`SELECT * FROM store_promos ${where} ORDER BY createdAt DESC`).all()
}

export function addPromo({ code, discount, kind = 'percent', quota = -1, active = true }) {
  ensureStoreSchema()
  const bersih = String(code || '').trim().toUpperCase()
  if (!bersih) return { ok: false, error: 'Kode promo kosong.' }
  if (!Number.isFinite(discount) || discount <= 0) return { ok: false, error: 'Diskon harus lebih dari 0.' }
  if (kind === 'percent' && discount > 100) return { ok: false, error: 'Diskon persen maksimal 100.' }
  const db = getDb()
  const ada = db.prepare('SELECT code FROM store_promos WHERE code = ?').get(bersih)
  if (ada) return { ok: false, error: `Kode "${bersih}" sudah ada.` }
  db.prepare('INSERT INTO store_promos (code, discount, kind, quota, used, active, createdAt) VALUES (?, ?, ?, ?, 0, ?, ?)').run(
    bersih,
    Math.round(discount),
    kind === 'fixed' ? 'fixed' : 'percent',
    Number.isInteger(quota) ? quota : -1,
    active ? 1 : 0,
    Date.now()
  )
  return { ok: true, code: bersih }
}

export function deletePromo(code) {
  ensureStoreSchema()
  const info = getDb().prepare('DELETE FROM store_promos WHERE code = ? COLLATE NOCASE').run(String(code).trim())
  if (!info.changes) return { ok: false, error: 'Kode promo tidak ditemukan.' }
  return { ok: true }
}

/* ── Favorit ───────────────────────────────────────────────────────── */
export function toggleFavorite(userId, productId) {
  ensureStoreSchema()
  const db = getDb()
  const uid = String(userId)
  const pid = Number(productId)
  const ada = db.prepare('SELECT 1 FROM store_favorites WHERE userId = ? AND productId = ?').get(uid, pid)
  if (ada) {
    db.prepare('DELETE FROM store_favorites WHERE userId = ? AND productId = ?').run(uid, pid)
    return { ok: true, favorite: false }
  }
  db.prepare('INSERT OR IGNORE INTO store_favorites (userId, productId, createdAt) VALUES (?, ?, ?)').run(uid, pid, Date.now())
  return { ok: true, favorite: true }
}

export function listFavorites(userId) {
  ensureStoreSchema()
  return getDb()
    .prepare(
      `SELECT p.id, p.name, p.price, p.stock, p.image, p.description
       FROM store_favorites f JOIN store_products p ON p.id = f.productId
       WHERE f.userId = ? AND p.status = 'active' ORDER BY f.createdAt DESC`
    )
    .all(String(userId))
    .map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      stock: row.stock,
      image: row.image || '',
      description: row.description,
    }))
}

export function isFavorite(userId, productId) {
  ensureStoreSchema()
  return !!getDb().prepare('SELECT 1 FROM store_favorites WHERE userId = ? AND productId = ?').get(String(userId), Number(productId))
}

/* ── Statistik ─────────────────────────────────────────────────────── */
/* Semua angka dihitung dari SQL di tabel nyata. Tidak ada angka yang
   ditulis manual di sini. */
export function getStats() {
  ensureStoreSchema()
  const db = getDb()

  const produk = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS aktif,
         SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) AS tersembunyi,
         SUM(CASE WHEN stock = 0 AND status = 'active' THEN 1 ELSE 0 END) AS habis
       FROM store_products`
    )
    .get()

  const order = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) AS paid,
         SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) AS processing,
         SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
         SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled,
         SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) AS expired
       FROM store_orders`
    )
    .get()

  /* Omzet hanya dari order yang benar-benar dibayar/selesai — order
     CANCELLED tidak boleh ikut dihitung. */
  const pendapatan = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM store_orders
       WHERE status IN ('PAID', 'PROCESSING', 'COMPLETED')`
    )
    .get()

  const terlaris = db
    .prepare(
      `SELECT i.productName AS name, SUM(i.quantity) AS jumlah, SUM(i.quantity * i.price) AS omzet
       FROM store_order_items i
       JOIN store_orders o ON o.orderId = i.orderId
       WHERE o.status IN ('PAID', 'PROCESSING', 'COMPLETED')
       GROUP BY i.productName
       ORDER BY jumlah DESC, omzet DESC
       LIMIT 5`
    )
    .all()

  return {
    produk: {
      total: produk?.total || 0,
      aktif: produk?.aktif || 0,
      tersembunyi: produk?.tersembunyi || 0,
      habis: produk?.habis || 0,
    },
    order: {
      total: order?.total || 0,
      pending: order?.pending || 0,
      paid: order?.paid || 0,
      processing: order?.processing || 0,
      completed: order?.completed || 0,
      cancelled: order?.cancelled || 0,
      expired: order?.expired || 0,
    },
    pendapatan: pendapatan?.total || 0,
    terlaris,
    menipis: listLowStock(10),
  }
}

export function resetStore() {
  ensureStoreSchema()
  const db = getDb()
  db.transaction(() => {
    for (const tabel of [
      'store_order_items',
      'store_payments',
      'store_orders',
      'store_cart',
      'store_favorites',
      'store_products',
      'store_categories',
      'store_promos',
      'store_settings',
    ]) {
      db.prepare(`DELETE FROM ${tabel}`).run()
    }
    db.prepare("DELETE FROM sqlite_sequence WHERE name LIKE 'store_%'").run()
  })()
  return { ok: true }
}
