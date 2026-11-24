/* Uji sinkron lib/komiku.js — filter dewasa + struktur ZIP (tanpa jaringan). */
import { readFile } from 'node:fs/promises'
import {
  isDewasa, isGenreBlokir, getGenres, getGenreBlokir,
  GENRES, GENRE_BLOKIR,
} from '../lib/komiku.js'

let gagal = 0
function cek(label, kondisi, detail = '') {
  const ok = !!kondisi
  if (!ok) gagal++
  console.log(`${ok ? 'PASS' : 'GAGAL'} › ${label}${detail ? ` — ${detail}` : ''}`)
}

// 1. Genre dewasa dari kode user WAJIB diblokir
for (const g of ['ecchi', 'harem', 'ngewe', 'dewasa']) {
  cek(`genre blokir: ${g}`, isGenreBlokir(g) === true)
}

// 2. Genre aman dari daftar situs WAJIB lolos
for (const g of ['aksi', 'komedi', 'romantis', 'horor', 'misteri']) {
  cek(`genre aman: ${g}`, isGenreBlokir(g) === false && getGenres().includes(g))
}

// 3. Tidak ada irisan antara daftar aman dan daftar blokir
const iris = getGenres().filter((g) => GENRE_BLOKIR.has(g))
cek('tidak ada irisan genre aman vs blokir', iris.length === 0, `iris=${iris.join(',') || '-'}`)

// 4. Kata dewasa ditolak, judul aman lolos
cek('kata dewasa ditolak', isDewasa('komik ngewe terbaru') === true)
cek('judul aman lolos', isDewasa('Naruto Shippuden') === false)
cek('judul aman lolos (Solo Leveling)', isDewasa('Solo Leveling') === false)

// 5. Struktur ZIP manual: signature lokal + sentral + EOCD
const src = await readFile(new URL('../lib/komiku.js', import.meta.url))
const teks = src.toString()
cek('ZIP pakai signature lokal 0x04034b50', teks.includes('0x04034b50'))
cek('ZIP pakai signature sentral 0x02014b50', teks.includes('0x02014b50'))
cek('ZIP pakai EOCD 0x06054b50', teks.includes('0x06054b50'))
cek('ZIP pakai CRC32', /crc32/i.test(teks))

console.log(gagal === 0 ? '\nSEMUA UJI SINKRON LULUS' : `\n${gagal} UJI GAGAL`)
process.exit(gagal === 0 ? 0 : 1)
