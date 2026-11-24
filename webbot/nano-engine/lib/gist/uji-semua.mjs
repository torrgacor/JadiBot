/*
⌬ Nano Ai · Uji massal snippet gist (v4)
  Engine = lib/gist/jalankan.mjs (satu sumber kebenaran dengan plugin).
  - Override input per-slug (TikTok/Spotify/Pinterest/file lokal)
  - Merge: hasil slug lain yang sudah ada di hasil-uji.json dipertahankan
  - Argumen filter: node uji-semua.mjs slug1,slug2 → hanya uji slug itu
*/
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { jalankanSnippet } from './jalankan.mjs'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(DIR, 'hasil-uji.json')
const SRC = path.join(DIR, 'src')

const TIKTOK_URL = 'https://www.tiktok.com/@tiktok/video/7106594312292453675'
const SPOTIFY_URL = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'
const PINTEREST_URL = 'https://id.pinterest.com/pin/155602935223517044/'

/* ── sampel media lokal (diunduh sekali, dipakai semua slug) ── */
const SAMPEL = path.join(os.tmpdir(), 'gist-sampel')
fs.mkdirSync(SAMPEL, { recursive: true })
async function siapkanSampel(nama, sumber) {
  const p = path.join(SAMPEL, nama)
  if (fs.existsSync(p) && fs.statSync(p).size > 10_000) return p
  for (const u of sumber) {
    try {
      const r = await fetch(u)
      if (!r.ok) continue
      fs.writeFileSync(p, Buffer.from(await r.arrayBuffer()))
      return p
    } catch {}
  }
  throw new Error(`sampel ${nama} gagal semua sumber`)
}
const sampelJpg = await siapkanSampel('contoh.jpg', [
  'https://picsum.photos/id/237/480/320.jpg',
  'https://www.w3schools.com/html/img_chania.jpg',
])
const sampelMp3 = await siapkanSampel('contoh.mp3', ['https://download.samplelib.com/mp3/sample-3s.mp3'])
const sampelMp4 = await siapkanSampel('contoh.mp4', [
  'https://download.samplelib.com/mp4/sample-5s.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
])

/* ── override input per slug ── */
const OVERRIDE = {
  'ocr-struk': { file: sampelJpg },
  catbox: { file: sampelJpg },
  'image-converter': { file: sampelJpg },
  'wink-hd-image': { file: sampelJpg },
  'remove-background': { file: sampelJpg },
  topixel: { file: sampelJpg },
  tinypng: { file: sampelJpg },
  tikmate: { teks: TIKTOK_URL },
  ttdl: { teks: TIKTOK_URL },
  'tiktok-downloader': { teks: TIKTOK_URL },
  ttqc: { teks: TIKTOK_URL },
  'tt-search-vid': { teks: 'kucing lucu' },
  'tt-search-photo': { teks: 'kucing lucu' },
  'spotify-dl-1': { teks: SPOTIFY_URL },
  'spotify-dl-2': { teks: SPOTIFY_URL },
  'spotify-dl': { teks: SPOTIFY_URL },
  spotyloader: { teks: SPOTIFY_URL },
  'play-music': { teks: SPOTIFY_URL },
  'pinvid-dl': { teks: PINTEREST_URL },
  'pin-dl': { teks: PINTEREST_URL },
  'pinvid-search': { teks: 'aesthetic wallpaper' },
  'wink-upscale-video': { file: sampelMp4 },
  'upscale-video': { file: sampelMp4 },
  'vocal-remover': { file: sampelMp3 },
}

const TIMEOUT_OVERRIDES = {
  'ocr': 300_000,
  'ocr-struk': 240_000,
  'audio2txt': 240_000,
  'vocal-remover': 240_000,
  'upscale-video': 300_000,
  'wink-upscale-video': 300_000,
  'wink-hd-image': 240_000,
  'iloveimg-compressor': 240_000,
  'krakenfiles': 240_000,
  'siputzx-ytdl': 240_000,
  'aio-downloader': 240_000,
  'play-music': 240_000,
  'murotal-quran': 240_000,
}

const daftarAll = fs.readdirSync(SRC).filter((f) => f.endsWith('.js')).sort()
const filterArg = process.argv[2] ? process.argv[2].split(',').map((s) => s.trim()) : null
const daftar = filterArg ? daftarAll.filter((f) => filterArg.includes(f.replace(/\.js$/, ''))) : daftarAll

/* manifest → slug yang masih dipasang + tipe media (untuk auto-input file) */
const manifestPath = path.join(DIR, 'manifest.json')
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : []
const mediaSlug = new Map(manifest.filter((x) => x.media).map((x) => [x.slug, x.media]))

function sampelUntuk(tipe) {
  if (tipe === 'audio') return sampelMp3
  if (tipe === 'video') return sampelMp4
  return sampelJpg
}

const lama = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : []
const byslug = new Map(lama.map((r) => [r.slug, r]))
const hasil = []

for (let i = 0; i < daftar.length; i++) {
  const f = daftar[i]
  const slug = f.replace(/\.js$/, '')
  const ov = OVERRIDE[slug] || {}
  process.stdout.write(`[${i + 1}/${daftar.length}] ${slug} ... `)
  /* auto-input file: slug bertipe media dapat sampel sesuai tipenya */
  const fileAuto = ov.file || (mediaSlug.get(slug) ? sampelUntuk(mediaSlug.get(slug)) : '')
  const r = await jalankanSnippet(slug, {
    teks: ov.teks || '',
    file: fileAuto,
    timeoutMs: TIMEOUT_OVERRIDES[slug] || 120_000,
  })
  let status = r.status
  let catatan = r.catatan
  if (status === 'ok' && r.files.length) catatan = `${r.files.length} file`
  else if (status === 'ok' && r.urls.length) catatan = `${r.urls.length} url`
  else if (status === 'ok') catatan = 'teks'
  const baris = { slug, status, url: r.urls, files: r.files.map((p) => path.basename(p)), catatan }
  byslug.set(slug, baris)
  hasil.push(baris)
  console.log(status, catatan ? `· ${catatan.slice(0, 70)}` : '')
}

fs.writeFileSync(OUT, JSON.stringify([...byslug.values()], null, 2))
const semua = [...byslug.values()]
const by = {}
for (const r of semua) by[r.status] = (by[r.status] || 0) + 1
console.log(`\nSELESAI: ${JSON.stringify(by)} / total ${semua.length}`)
