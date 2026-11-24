/*
⌬ Nano Ai · Generator manifest gist
  Membaca lib/gist/src + hasil uji (hasil-uji.json) + daftar command existing
  → menghasilkan manifest.json: [{ slug, cmd, kat, media, timeout }]
  Yang masuk: snippet berstatus 'ok' atau 'butuh-input-asli' (layanan hidup).
  Slug yang bentrok dengan command existing di-rename (suffix -dz / -v2 dst).
*/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
/* kategori menu tiap fitur — satu sumber kebenaran, lihat lib/gist/kategori.js */
import { kategoriSlug, DILEWATI } from './kategori.js'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(DIR, 'src')
const OUT = path.join(DIR, 'manifest.json')
const ROOT = path.join(DIR, '..', '..')

/* slug → nama command dasar (tanpa prefix) */
function slugKeCmd(slug) {
  return slug.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/*
  Downloader besar yang fiturnya SUDAH ADA di bot (ytmp3/ttdl/spotify/play/dll)
  → dibuang total dari manifest, bukan di-rename.
*/
const SLUG_BUANG = new Set([
  'ytmp3', 'ytmp3-1', 'qybte-ytdl', 'siputzx-ytdl', 'y2mate', 'y2mate-2',
  'ttdl', 'tikmate', 'tiktok-downloader', 'musically-tikdl', 'aio-downloader',
  'rednotedl', 'spotify-dl', 'spotify-dl-1', 'spotify-dl-2', 'spotyloader', 'play-music',
])

/* snippet yang hasilnya dikirim sebagai STIKER — video→webp animasi, gambar→webp statis */
const SLUG_STIKER = new Set([
  'bratvid', 'bratvid-gojo', 'bratvid-vermeil', 'bratvid-v2',
  'brat-3', 'brat-gojo', 'brat-img', 'brat-vermeil',
  'iqc', 'iqc-dark', 'iqc-image',
])

/* uploader file: terima media apa pun (foto/video/audio/dok) */
const MEDIA_ANY = new Set([
  '8upload', 'file-kiwi', 'topixel', 'catbox', 'kappa-uploader', 'leopard-uploader',
  'litterbox', 'pone-uploader', 'shz-uploader', 'tmpfiles', 'top4top', 'uguu-uploder',
  'uploadee', 'iloveimg-compressor', 'remove-wm',
])

/* baca semua command existing dari plugins/ */
function kumpulkanCommandExisting() {
  const set = new Set()
  const walk = (dir) => {
    let entri = []
    try { entri = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entri) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name.endsWith('.js')) {
        try {
          const kode = fs.readFileSync(p, 'utf8')
          const m = kode.match(/handler\.command\s*=\s*(\/.+\/[a-z]*|'[^']+'|"[^"]+")/)
          if (m) {
            const sumber = m[1]
            if (sumber.startsWith('/')) {
              const body = sumber.slice(1, sumber.lastIndexOf('/')).replace(/^\^/, '').replace(/\$$/, '').replace(/[()]/g, '')
              if (/^[a-z0-9_|-]+$/i.test(body)) body.split('|').forEach((c) => set.add(c.toLowerCase()))
            } else {
              set.add(sumber.slice(1, -1).toLowerCase())
            }
          }
          for (const mm of kode.matchAll(/handler\.help\s*=\s*\[([^\]]*)\]/g)) {
            for (const h of mm[1].matchAll(/['"]([^'"]+)['"]/g)) set.add(h[1].toLowerCase().split(' ')[0])
          }
        } catch {}
      }
    }
  }
  walk(path.join(ROOT, 'plugins'))
  return set
}

function deteksiMedia(kode) {
  const c = kode.match(/^const (INPUT_FILE_PATH|VIDEO_PATH|IMAGE_PATH|AUDIO_PATH|FILE_PATH|INPUT)\s*=\s*(['"])([^'"]*)\2/m)
  const bacaFile = /(createReadStream|readFileSync|readFile)\s*\(|\bexistsSync\s*\([^)]*\b(INPUT_FILE_PATH|VIDEO_PATH|IMAGE_PATH|AUDIO_PATH|FILE_PATH|INPUT)\b/.test(kode)
  const dipassKeFungsi = c && /(?:\(|,\s*)\bINPUT_FILE_PATH\b|\bVIDEO_PATH\b|\bIMAGE_PATH\b|\bAUDIO_PATH\b|\bFILE_PATH\b\s*[,)]/.test(kode) || (c && c[1] !== 'INPUT' && /(?:\(|,\s*)\bINPUT\b\s*[,)]/.test(kode))

  if (c) {
    const [, nama, , nilai] = c
    const pathLike = /[\\/]/.test(nilai) || /\.(png|jpe?g|webp|mp3|mp4|pdf)$/i.test(nilai)
    if (nama === 'IMAGE_PATH') return 'image'
    if (nama === 'VIDEO_PATH') return 'video'
    if (nama === 'AUDIO_PATH') return 'audio'
    if (nama === 'INPUT') {
      /* INPUT bernilai path + benar-benar dibaca/dipass → media */
      if (pathLike && bacaFile) return 'any'
      return '' /* INPUT teks / dipass ke fungsi non-file */
    }
    if (bacaFile || dipassKeFungsi) return 'any'
  }
  return ''
}

const hasilUji = fs.existsSync(path.join(DIR, 'hasil-uji.json'))
  ? JSON.parse(fs.readFileSync(path.join(DIR, 'hasil-uji.json'), 'utf8'))
  : []
const statusSlug = new Map(hasilUji.map((r) => [r.slug, r.status]))

const existing = kumpulkanCommandExisting()
const dipakai = new Set(existing)
const daftar = fs.readdirSync(SRC).filter((f) => f.endsWith('.js')).sort()

const manifest = []
const dilewati = []
for (const f of daftar) {
  const slug = f.replace(/\.js$/, '')
  if (SLUG_BUANG.has(slug)) {
    dilewati.push({ slug, alasan: 'duplikat fitur bot (downloader existing)' })
    continue
  }
  /* perintah yang sudah dipegang plugin lain (mis. .ocr, .kalender, .pixiv
     dari penyedia API lain) — bot hanya memakai yang pertama cocok */
  if (DILEWATI.has(slug)) {
    dilewati.push({ slug, alasan: 'perintah sudah ada di plugin lain' })
    continue
  }
  const status = statusSlug.get(slug)
  if (status && !['ok', 'butuh-input-asli'].includes(status)) {
    dilewati.push({ slug, alasan: status })
    continue
  }
  let kode = ''
  try { kode = fs.readFileSync(path.join(SRC, f), 'utf8') } catch { continue }

  let cmd = slugKeCmd(slug)
  /* rename bila bentrok */
  if (dipakai.has(cmd)) {
    let i = 2
    while (dipakai.has(`${cmd}${i}`)) i++
    cmd = `${cmd}${i}`
  }
  dipakai.add(cmd)

  const kat = kategoriSlug(slug)
  const media = MEDIA_ANY.has(slug) ? 'any' : deteksiMedia(kode)
  manifest.push({
    slug,
    cmd,
    kat,
    media,
    sticker: SLUG_STIKER.has(slug),
    status: status || 'belum-diuji',
  })
}

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2))
console.log(`manifest: ${manifest.length} snippet → ${OUT}`)
console.log(`dilewati (gagal/timeout): ${dilewati.length}`)
for (const d of dilewati) console.log(`  - ${d.slug} (${d.alasan})`)
const bentrok = manifest.filter((m) => !m.cmd.startsWith(slugKeCmd(m.slug)))
console.log(`rename anti-bentrok: ${bentrok.length}`)
for (const b of bentrok.slice(0, 10)) console.log(`  - ${b.slug} → ${b.cmd}`)
