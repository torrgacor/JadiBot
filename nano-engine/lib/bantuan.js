/*
⌬ Nano Ai · PANDUAN PAKAI (helper terpusat)

  Banyak fitur hanya bekerja kalau diberi argumen. Kalau pengguna cuma mengetik
  namanya (mis. ".amfind") dan plugin-nya tidak menangani kasus itu, bot akan
  diam — dan pengguna bingung. Helper ini menyusun "tata cara pakai" dari
  metadata plugin, supaya router bisa mengirimnya otomatis saat sebuah perintah
  dipanggil tanpa argumen dan plugin-nya tidak mengirim balasan apa pun.

  Sumber teks, berurutan:
    1. handler.usage    — contoh lengkap (string atau array), boleh tanpa prefix
    2. handler.contoh   — alias
    3. handler.example  — alias
    4. entri handler.help yang sudah memuat argumen (mengandung spasi atau '<')

  Kalau tak ada satu pun, panduan tetap dibuat dengan contoh generik
  "<argumen>" asalkan nama perintahnya diketahui — supaya prinsipnya "tidak ada
  fitur yang diam-diam tanpa petunjuk".
*/

const PREFIX_BAWAAN = '.'

/** Buang prefix yang sudah tertulis, lalu pasang prefix aktif sekali saja. */
function rapikan(contoh, prefix) {
  const p = prefix || PREFIX_BAWAAN
  let teks = String(contoh ?? '').trim()
  if (!teks) return ''
  if (teks.startsWith(p)) teks = teks.slice(p.length).trim()
  return teks ? `${p}${teks}` : ''
}

/** Kumpulkan daftar contoh pemakaian untuk sebuah handler. */
export function contohPakai(handler, prefix) {
  const daftar = []
  const tambah = (nilai) => {
    if (nilai === undefined || nilai === null) return
    if (Array.isArray(nilai)) {
      nilai.forEach(tambah)
      return
    }
    if (typeof nilai !== 'string') return
    const teks = rapikan(nilai, prefix)
    if (teks && !daftar.includes(teks)) daftar.push(teks)
  }

  tambah(handler?.usage ?? handler?.contoh ?? handler?.example)

  // Fallback: sebagian plugin menuliskan contohnya di help, mis. "reminder 10m beli kopi".
  if (!daftar.length && Array.isArray(handler?.help)) {
    for (const item of handler.help) {
      if (typeof item === 'string' && /[\s<]/.test(item)) tambah(item)
    }
  }

  return daftar
}

/**
 * Apakah panduan perlu dikirim?
 *
 * Syaratnya: plugin belum mengirim balasan apa pun, plugin tidak menjawab
 * tertunda, perintahnya dipanggil tanpa argumen, dan tidak ada teks sisa.
 */
export function perluPanduan({ sent, deferred, args, text } = {}) {
  if (sent || deferred) return false
  if (Array.isArray(args) && args.length) return false
  if (String(text ?? '').trim()) return false
  return true
}

/**
 * Susun pesan tata cara pakai. Mengembalikan `null` kalau tidak ada bahan sama
 * sekali, supaya router tidak pernah mengirim kotak kosong.
 */
export function buatPanduan(handler, { prefix, command } = {}) {
  const contoh = contohPakai(handler, prefix)
  const deskripsi = typeof handler?.description === 'string' ? handler.description.trim() : ''
  const nama = typeof command === 'string' && command
    ? command
    : (Array.isArray(handler?.help) ? handler.help[0] : '')

  if (!contoh.length && !deskripsi && !nama) return null

  const baris = ['╭─「 *CARA PAKAI* 」']

  if (contoh.length) {
    for (const c of contoh) baris.push(`│ ${c}`)
  } else if (nama) {
    baris.push(`│ ${(prefix || PREFIX_BAWAAN)}${nama} <argumen>`)
  }

  if (deskripsi) {
    if (contoh.length || nama) baris.push('│')
    baris.push(`│ ${deskripsi}`)
  }

  baris.push('╰────────────')
  return baris.join('\n')
}
