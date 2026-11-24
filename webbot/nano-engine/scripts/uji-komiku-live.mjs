/* Uji live terbatas lib/komiku.js — parsing daftar + tolak dewasa (tanpa unduh gambar). */
import { getPopular, getLatest, getByGenre, getGenres } from '../lib/komiku.js'

let gagal = 0
function cek(label, kondisi, detail = '') {
  const ok = !!kondisi
  if (!ok) gagal++
  console.log(`${ok ? 'PASS' : 'GAGAL'} › ${label}${detail ? ` — ${detail}` : ''}`)
}

// 1. Populer live
try {
  const r = await getPopular({ page: 1 })
  cek('populer live ada hasil', r.items.length > 0, `total=${r.items.length}`)
  const contoh = r.items[0]
  cek('populer: ada judul+slug+url', !!(contoh.title && contoh.slug && contoh.url), contoh.title?.slice(0, 60))
} catch (e) {
  cek('populer live ada hasil', false, e.message)
}

// 2. Terbaru live
try {
  const r = await getLatest(1)
  cek('terbaru live ada hasil', r.items.length > 0, `total=${r.items.length}`)
} catch (e) {
  cek('terbaru live ada hasil', false, e.message)
}

// 3. Genre aman live
try {
  const r = await getByGenre('aksi', { page: 1 })
  cek('genre aksi live ada hasil', r.items.length > 0, `total=${r.items.length}`)
} catch (e) {
  cek('genre aksi live ada hasil', false, e.message)
}

// 4. Genre dewasa WAJIB ditolak tanpa menyentuh jaringan
for (const g of ['ecchi', 'harem', 'ngewe', 'dewasa']) {
  try {
    await getByGenre(g)
    cek(`genre ${g} ditolak`, false, 'tidak melempar!')
  } catch (e) {
    cek(`genre ${g} ditolak`, /tidak tersedia di mode aman/i.test(e.message), e.message.slice(0, 60))
  }
}

// 5. Daftar genre aman tidak bocor
cek('getGenres() bersih dari dewasa', !getGenres().some((g) => ['ecchi', 'harem', 'ngewe', 'dewasa'].includes(g)))

console.log(gagal === 0 ? '\nSEMUA UJI LIVE TERBATAS LULUS' : `\n${gagal} UJI GAGAL`)
process.exit(gagal === 0 ? 0 : 1)
