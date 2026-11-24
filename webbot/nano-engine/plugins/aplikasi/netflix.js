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
┇▫️Author  : Danz nano & Awang Ofc 
┇▫️Website  : awangofc.my.id
┇▫️WhatsApp : wa.me/556184127506
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
┇🔸Dilarang Menghapus Creadit SC
┇🔸Dilarang Menjual Script Nano Ai
┇🔸Dilarang Mengatas Namakan Script!!
⌬
*/

/*
  .netflix — generator tautan login Netflix (NFToken) · kategori aplikasi · premium.

  Alurnya sengaja TANPA Puppeteer/Chromium (server ini 4 GB tanpa swap, Chromium
  tidak terpasang, dan browser per perintah akan memakan ratusan MB):

    1. POST /api/session                  → token sesi (berlaku 30 menit)
    2. POST /api/random { plan }           → 403 + powChallenge
    3. pecahkan proof-of-work SHA-256      → hash(challenge + n) berawalan '0000'
    4. POST /api/random + X-PoW-Proof      → 200 { url, plan, quality, country,
                                                    expires, pool }
    5. sesi kedaluwarsa → ulangi sekali dengan sesi baru

  Dua hal yang WAJIB ditiru dari halaman aslinya, kalau tidak server menolak
  dengan "Browser verification failed":
    • header bergaya browser (sec/Origin/Referer/Accept-Language) — bukan cuma
      User-Agent;
    • header X-NFToken-Session pada setiap permintaan setelah sesi dibuat.

  Batas server: 3 token/hari per IP plus cooldown "terlalu sering generate".
  Kalau kuota IP server habis, permintaan dicoba ulang lewat pool proxy publik
  (lib/proxy.js) — jadi jumlah yang bisa dihasilkan tidak mentok di 3.

  PENTING untuk jalur proxy: challenge PoW-nya memuat alamat IP peminta, jadi
  SATU proxy harus dipakai untuk seluruh satu percobaan (sesi → challenge →
  proof). Kalau IP-nya berpindah di tengah jalan, server menjawab
  "Invalid proof of work". Karena itu pool proxy di sini di-pin per percobaan,
  bukan dipakai lewat proxiedFetch yang merotasi IP tiap permintaan.
*/

import crypto from 'node:crypto'
import { nextProxy } from '../../lib/proxy.js'
import { sendInteractive } from '../../lib/tombol.js'

const BASE = 'https://nftools.aroshi.my.id'
const HALAMAN = `${BASE}/nftoken`

/* UA ponsel + header se-ish mungkin dengan Chrome asli. Server memeriksa
   ciri-ciri browser, jadi header ini tidak boleh diringkas. */
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
const HEADER_BROWSER = {
  'user-agent': USER_AGENT,
  accept: '*/*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-mode': 'cors',
  'sec-fetch-dest': 'empty',
  origin: BASE,
  referer: HALAMAN,
}

const PLANS = ['premium', 'standard', 'basic']
const LABEL_PLAN = { premium: 'Premium', standard: 'Standard', basic: 'Basic' }
const PLAN_DEFAULT = 'premium'
const MAKS_SEKALI = 5
const TIMEOUT = 25_000
const POW_PREFIX = '0000'
const POW_BATAS = 2_000_000
const COOLDOWN_MS = 8_000
const JEDA_ULANG = 1_000
const PERCOBAAN_PROXY = 3
const JEDA_ANTAR = 1_500

const NAMA_NEGARA = {
  US: 'UNITED STATES', GB: 'UNITED KINGDOM', DE: 'GERMANY', FR: 'FRANCE', JP: 'JAPAN',
  KR: 'SOUTH KOREA', IN: 'INDIA', BR: 'BRAZIL', CA: 'CANADA', AU: 'AUSTRALIA',
  IT: 'ITALY', ES: 'SPAIN', MX: 'MEXICO', PH: 'PHILIPPINES', ID: 'INDONESIA',
  MY: 'MALAYSIA', TH: 'THAILAND', SG: 'SINGAPORE', TR: 'TURKEY', PL: 'POLAND',
  NL: 'NETHERLANDS', SE: 'SWEDEN', NO: 'NORWAY', DK: 'DENMARK', FI: 'FINLAND',
  PT: 'PORTUGAL', AR: 'ARGENTINA', CL: 'CHILE', CO: 'COLOMBIA', PK: 'PAKISTAN',
  BD: 'BANGLADESH', NG: 'NIGERIA', EG: 'EGYPT', ZA: 'SOUTH AFRICA', VN: 'VIETNAM',
  RU: 'RUSSIA', UA: 'UKRAINE',
}

const jeda = (ms) => new Promise((r) => setTimeout(r, ms))

function namaNegara(kode) {
  if (!kode || kode === 'Unknown' || kode === 'NA') return 'Tidak diketahui'
  return `${kode} (${NAMA_NEGARA[kode] || kode})`
}

/* ── satu permintaan ke penyedia ──────────────────────────────────────── */
async function minta(path, { body, method = 'POST', token, proof, dispatcher } = {}) {
  const headers = { ...HEADER_BROWSER, 'content-type': 'application/json' }
  if (token) headers['X-NFToken-Session'] = token
  if (proof) headers['X-PoW-Proof'] = proof

  const init = { method, headers, signal: AbortSignal.timeout(TIMEOUT) }
  if (method === 'POST') init.body = JSON.stringify(body || {})

  const url = BASE + path
  const res = await fetch(url, { ...init, ...(dispatcher ? { dispatcher } : {}) })

  const teks = await res.text()
  let data = null
  try {
    data = teks ? JSON.parse(teks) : null
  } catch {
    data = { error: String(teks || '').slice(0, 160) }
  }
  return { status: res.status, data: data || {} }
}

/* ── proof of work: cari n sampai SHA-256(challenge + n) berawalan '0000' ─ */
function pecahkanPow(challenge, batas = POW_BATAS) {
  for (let n = 0; n < batas; n++) {
    if (crypto.createHash('sha256').update(challenge + n).digest('hex').startsWith(POW_PREFIX)) {
      return `${challenge}:${n}`
    }
  }
  return null
}

/* galat yang masuk akal dicoba ulang (IP lain / waktu lain). */
const BISA_DIULANG = new Set(['limit', 'cooldown', 'pow', 'sesi', 'verifikasi'])

function kelasGalat(pesan = '') {
  if (/limit harian/i.test(pesan)) return 'limit'
  if (/terlalu sering|tunggu sebentar/i.test(pesan)) return 'cooldown'
  if (/proof of work/i.test(pesan)) return 'pow'
  if (/browser verification/i.test(pesan)) return 'verifikasi'
  if (/session tidak valid/i.test(pesan)) return 'sesi'
  return 'lain'
}

/* ── /api/random, lengkap dengan PoW ──────────────────────────────────── */
async function randomDenganPow(token, plan, opsi) {
  let hasil = await minta('/api/random', { body: { plan }, token, ...opsi })

  if (hasil.status === 403 && hasil.data?.powChallenge) {
    const proof = pecahkanPow(hasil.data.powChallenge)
    if (!proof) return { status: 0, data: { error: 'Proof-of-work tidak selesai.' } }
    hasil = await minta('/api/random', { body: { plan }, token, proof, ...opsi })
  }

  return hasil
}

/* ── satu token untuk satu plan ─────────────────────────────────────────
   `opsi.dispatcher` = proxy yang dipakai tetap untuk SELURUH percobaan ini
   (challenge PoW-nya terikat IP). Tanpa dispatcher = jalur langsung. */
async function buatToken(plan, opsi = {}) {
  const sesi = await minta('/api/session', opsi)
  const token = sesi.data?.token
  if (!token) {
    const pesan = sesi.data?.error || `Sesi tidak bisa dibuat (HTTP ${sesi.status}).`
    return { ok: false, kelas: kelasGalat(pesan), pesan }
  }

  let hasil = await randomDenganPow(token, plan, opsi)

  /* sesi bisa kedaluwarsa di tengah jalan → sekali lagi dengan sesi baru */
  if (/session tidak valid/i.test(hasil.data?.error || '')) {
    const sesi2 = await minta('/api/session', opsi)
    if (sesi2.data?.token) hasil = await randomDenganPow(sesi2.data.token, plan, opsi)
  }

  const data = hasil.data || {}
  if (data.success && data.url) return { ok: true, ...data, plan: data.plan || plan }

  const pesan = data.error || `Permintaan gagal (HTTP ${hasil.status}).`
  return { ok: false, kelas: kelasGalat(pesan), pesan }
}

/* Ambil satu proxy dari pool dan pakai sebagai satu jalur tetap. */
async function jalurProxy() {
  const handle = await nextProxy()
  if (!handle?.entry?.agent) return null
  return { dispatcher: handle.entry.agent, entry: handle.entry, drop: handle.drop }
}

/* ── jalur utama + cadangan lewat proxy publik ────────────────────────── */
async function tokenDenganCadangan(plan) {
  let hasil = await buatToken(plan)
  if (hasil.ok) return hasil
  if (!BISA_DIULANG.has(hasil.kelas)) return hasil

  /* "terlalu sering" = jeda per-IP; "proof of work" bisa lolos dengan
     challenge baru — keduanya masuk akal dicoba sekali lagi langsung. */
  await jeda(hasil.kelas === 'cooldown' ? COOLDOWN_MS : JEDA_ULANG)
  hasil = await buatToken(plan)
  if (hasil.ok) return hasil
  if (!BISA_DIULANG.has(hasil.kelas)) return hasil

  /* kuota IP server habis → coba IP lain; satu proxy tetap per percobaan */
  for (let i = 0; i < PERCOBAAN_PROXY; i++) {
    const jalur = await jalurProxy()
    if (!jalur) break

    const cadangan = await buatToken(plan, { dispatcher: jalur.dispatcher }).catch(() => null)
    if (cadangan?.ok) return cadangan

    /* proxy ini tidak menolong (kuotanya juga habis atau challenge ditolak)
       → buang dari pool supaya percobaan berikutnya pakai IP lain. */
    if (!cadangan || cadangan.kelas === 'limit' || cadangan.kelas === 'pow') jalur.drop(jalur.entry)

    if (cadangan && !BISA_DIULANG.has(cadangan.kelas)) return cadangan
    hasil = cadangan || hasil
  }

  return hasil
}

/* ── tampilan ─────────────────────────────────────────────────────────── */
function barisToken(token, nomor) {
  const judul = nomor ? `🎬 NETFLIX TOKEN #${nomor}` : '🎬 NETFLIX TOKEN'
  return [
    `╭─〔 ${judul} 〕`,
    '│',
    `│ 📦 Plan     : *${token.plan || '-'}*`,
    `│ 🎞️ Kualitas : *${token.quality || '-'}*`,
    `│ 🌍 Wilayah  : *${namaNegara(token.country)}*`,
    `│ ⏱️ Aktif    : *${token.expires || '-'}*`,
    `│ 🗄️ Pool     : *${token.pool?.available ?? '-'} tersedia*`,
    '│',
    '│ 🔗 Tautan login:',
    `│ ${token.url}`,
    '╰───────────────',
  ].join('\n')
}

function panduan(usedPrefix = '.') {
  return [
    '╭─〔 🎬 NETFLIX TOKEN 〕',
    '│',
    '│ Tautan login Netflix (NFToken) siap pakai —',
    '│ dibuat langsung dari penyedia, satu tautan',
    '│ per akun.',
    '│',
    '│ *Cara pakai*',
    `│ • ${usedPrefix}netflix             → 1 tautan premium`,
    `│ • ${usedPrefix}netflix 3           → 3 tautan premium`,
    `│ • ${usedPrefix}netflix standard    → pakai plan standard`,
    `│ • ${usedPrefix}netflix 2 basic     → 2 tautan plan basic`,
    '│',
    `│ *Plan* : ${PLANS.join(' · ')}`,
    `│ *Maks* : ${MAKS_SEKALI} tautan sekali perintah`,
    '│',
    '│ Ⓟ Fitur khusus pengguna premium.',
    '╰───────────────',
  ].join('\n')
}

function bacaArgumen(args = []) {
  const bersih = (Array.isArray(args) ? args : []).map((a) => String(a || '').toLowerCase()).filter(Boolean)
  let plan = PLAN_DEFAULT
  let jumlah = 1
  let adaPlan = false
  let planSalah = ''

  for (const arg of bersih) {
    if (/^\d+$/.test(arg)) {
      jumlah = Math.min(Math.max(parseInt(arg, 10), 1), MAKS_SEKALI)
      continue
    }
    const cocok = PLANS.find((p) => p === arg || p.startsWith(arg))
    if (cocok) {
      plan = cocok
      adaPlan = true
      continue
    }
    planSalah = arg
  }

  return { plan, jumlah, adaPlan, planSalah }
}

const handler = async (m, { conn, rawConn, usedPrefix }) => {
  const reaksi = (teks) => {
    try {
      void rawConn.sendMessage(m.chat, { react: { text: teks, key: m.raw?.key } }).catch(() => {})
    } catch {
      /* reaksi gagal bukan masalah */
    }
  }

  const { plan, jumlah, planSalah } = bacaArgumen(m.args)

  /* panduan: .netflix help · .netflix panduan · .netflix cara */
  const mintaPanduan = (m.args || []).some((a) => /^(help|panduan|cara|bantuan)$/i.test(String(a || '')))
  if (mintaPanduan) {
    await m.reply(panduan(usedPrefix))
    return
  }

  if (planSalah) {
    await m.reply([
      `Plan *${planSalah}* tidak dikenal.`,
      '',
      `Pilihan yang tersedia: ${PLANS.join(' · ')}`,
    ].join('\n'))
    return
  }

  reaksi('⏳')

  const hasil = []
  let galat = null

  for (let i = 0; i < jumlah; i++) {
    const satu = await tokenDenganCadangan(plan)
    if (!satu.ok) {
      galat = satu
      break
    }
    hasil.push(satu)
    if (i < jumlah - 1) await jeda(JEDA_ANTAR)
  }

  if (!hasil.length) {
    reaksi('⚠️')
    const pesan = galat?.pesan || 'Tidak ada tautan yang bisa dibuat.'
    const saran = galat?.kelas === 'limit'
      ? 'Kuota harian penyedia sedang penuh (3x/hari per IP) dan jalur proxy belum berhasil. Coba lagi beberapa menit lagi.'
      : galat?.kelas === 'cooldown'
        ? 'Penyedia sedang membatasi permintaan cepat. Tunggu sebentar lalu coba lagi.'
        : 'Kalau ini terjadi terus, penyedianya mungkin sedang bermasalah.'
    await m.reply([
      '╭─〔 🎬 NETFLIX TOKEN 〕',
      '│',
      '│ ❌ Gagal membuat tautan.',
      `│ ${pesan}`,
      '│',
      `│ ${saran}`,
      '╰───────────────',
    ].join('\n'))
    return
  }

  reaksi('✅')

  /* Satu tautan → kartu dengan tombol salin/buka (tautan terlalu panjang
     untuk disalin manual). Lebih dari satu → teks biasa berisi semuanya. */
  if (hasil.length === 1) {
    const token = hasil[0]
    await sendInteractive(conn, m.chat, {
      title: '🎬 Netflix Token',
      subtitle: `${token.plan || 'Premium'} · ${token.quality || '-'}`,
      body: [
        barisToken(token, 0),
        '',
        '💡 Ketuk *SALIN* kalau tautannya mau dipakai di HP lain.',
      ].join('\n'),
      footer: `Nano Ai · NFToken · ${namaNegara(token.country)}`,
      buttons: [
        { type: 'copy', label: '📋 SALIN TAUTAN', id: 'nftoken_copy', copyCode: token.url },
        { type: 'url', label: '🚀 BUKA', url: token.url },
      ],
    }, { quoted: m.raw })
    return
  }

  await conn.sendMessage(m.chat, {
    text: [
      `╭─〔 🎬 NETFLIX TOKEN · ${hasil.length} TAUTAN 〕`,
      '│',
      `│ Plan : *${LABEL_PLAN[plan] || plan}*`,
      '╰───────────────',
      '',
      ...hasil.map((token, i) => barisToken(token, i + 1)),
      '',
      '⚠️ Kuota penyedia 3x/hari per IP — sisanya lewat jalur proxy.',
    ].join('\n'),
  }, { quoted: m.raw })
}

handler.command = /^(netflix|nftoken)$/i
handler.help = ['netflix', 'nftoken']
handler.tags = ['aplikasi']
handler.category = 'aplikasi'
handler.premium = true
handler.description = 'Membuat tautan login Netflix (NFToken) — premium'
handler.helpText = panduan()

export default handler
