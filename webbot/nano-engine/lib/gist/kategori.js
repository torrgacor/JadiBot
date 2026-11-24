/*
⌬ Nano Ai · Kategori menu untuk fitur hasil scrape

  Aturannya cuma satu: kategori ditentukan oleh FUNGSI fiturnya, bukan dari
  mana API/scrape-nya diambil. Jadi perintah download apa pun duduk di menu
  DOWNLOAD, stalk di STALKER, pembuat stiker di STICKER, dan seterusnya.

  Berkas ini jadi satu-satunya sumber kebenaran:
    • plugins/tools/gist.js          → memecah handler per kategori (menu bot)
    • lib/gist/buat-manifest.mjs     → ikut menulis kategori ke manifest.json
    • plugins/tools/gist-list.js     → mengelompokkan daftar .gist
*/

/* perintah yang menarik berkas/media dari sebuah tautan */
const DOWNLOAD = [
  'fsaver', 'githubdl', 'hitubfbdl', 'igdl1', 'mcpedldetail', 'npmdl', 'pindl', 'pinviddl',
  'snaptik', 'threadsdl', 'threadsdl1', 'threadsdl2', 'threadsdl3', 'threadsdl4', 'threadsdl5',
]

/* intip/menyalin data akun atau profil milik orang lain */
const STALKER = ['stalkff', 'stalkig', 'stalkml']

/* brat & quote WhatsApp → hasilnya stiker */
const STICKER = [
  'brat3', 'bratgojo', 'bratimg', 'bratvermeil',
  'bratvid', 'bratvidgojo', 'bratvidv2', 'bratvidvermeil',
  'iqc', 'iqcdark', 'iqcimage',
]

/* pencarian & daftar (query → hasil) */
const SEARCH = [
  'azlyric', 'devicecomparison', 'githubsearch', 'mcpedlsearch', 'npmsearch', 'phonespecs',
  'pinsearch', 'pinedramasearch', 'pinvidsearch', 'shinigamisearch', 'tokopediasearch',
  'ttsearchphoto', 'ttsearchvid', 'wikipedia',
]

/* bacaan/komik & gambar anime */
const ANIME = ['pixiv', 'waifupicker', 'shinigamidetail', 'shinigamiread']

/* drama pendek */
const DRACIN = ['pinedramadetail']

/* berita */
const NEWS = ['kompascanvas']

/* AI teks & AI gambar */
const AI = ['asyntai']
const AI_IMAGE = ['qbtext2img']

/* alat olah gambar (dulu satu menu terpisah memakai nama layanannya) */
const ALAT_GAMBAR = ['iloveimgcompressor', 'iloveimghd', 'iloveimgremovebg']

/* alat olah PDF */
const ALAT_PDF = ['ilovepdfcompres']

/* keagamaan */
const AGAMA = ['murotalquran']

/* meme & kata-kata (isi hiburan) */
const RANDOM = [
  'animequotes', 'philosopherquotes', 'quoteanime', 'quotesbulge', 'tokohquotes',
  'beautifulmeme', 'drakememe', 'jarvismeme', 'twobuttonsmeme',
]

/* sisanya: alat bantu — unggah berkas, tangkapan layar, olah gambar, OCR, TTS, dst. */
const TOOLS = [
  '8upload', 'aceimg', 'audio2txt', 'beautyplus', 'bypassunlock', 'carboncode', 'catbox',
  'deepeditor', 'edgetts', 'fakecallandro', 'fakecallios', 'fakechios', 'fakedana', 'fakeff',
  'fakegcios', 'fakeml', 'fakeovo', 'faketeleprofil', 'fancytext', 'filekiwi',
  'googletranslate', 'googletts', 'imageconverter', 'kalender', 'kappauploader', 'krakenfiles',
  'leoparduploader', 'litterbox', 'nasalandsatname', 'ocr', 'ocrstruk', 'poneuploader',
  'qrcodefile', 'qrcodetext', 'quilbot', 'removewm', 'shortlink', 'shzuploader', 'ssweb',
  'ssweb1', 'ssweb2', 'strukgenerator', 'systeminfo', 'timpateks', 'tinypng', 'tmpfiles',
  'top4top', 'topixel', 'uguuuploder', 'uploadee', 'upscalecloudinary', 'upscalevideo',
  'vocalremover', 'webfetcher', 'winkhdimage', 'winkupscalevideo', 'wisecurrencyconverter',
]

/* slug → kategori menu */
export const KATEGORI_GIST = {
  download: DOWNLOAD,
  stalker: STALKER,
  sticker: STICKER,
  search: SEARCH,
  anime: ANIME,
  dracin: DRACIN,
  news: NEWS,
  ai: AI,
  'ai-image': AI_IMAGE,
  image: ALAT_GAMBAR,
  pdf: ALAT_PDF,
  agama: AGAMA,
  random: RANDOM,
  tools: TOOLS,
}

/* slug di manifest masih bergaris (`github-dl`), sedangkan command-nya tidak
   (`githubdl`). Samakan dulu supaya peta ini bisa dipakai keduanya. */
function norm(nama) {
  return String(nama || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

const PETA = new Map()
for (const [kategori, daftar] of Object.entries(KATEGORI_GIST)) {
  for (const slug of daftar) PETA.set(norm(slug), kategori)
}

/*
  Perintah yang sudah dipegang plugin lain. Bot memakai plugin PERTAMA
  yang cocok (findPluginByCommand), jadi versi gist-nya tidak akan pernah
  jalan — lebih baik tidak didaftarkan daripada menampilkan nama perintah
  kembar di menu yang seharusnya mengarah ke fitur lebih lengkap.

  Setiap nama di sini harus benar-benar ada di plugin pemangku. Kalau
  ternyata tidak ada, perintahnya hilang tanpa sebab.

    ocr, kalender, pixiv  -> plugin HaidarApis
    pindl                -> plugins/download/pindl.js (Pinterest HD)
    pinsearch            -> plugins/search/pins.js (kartu Pinterest)

  Audit: node scripts/audit-konflik-perintah.mjs
*/
export const DILEWATI = new Set(['ocr', 'kalender', 'pixiv', 'pindl', 'pinsearch'])

/** Kategori menu untuk satu slug/command fitur. Yang belum terdaftar → `bawaan`. */
export function kategoriSlug(nama, bawaan = 'tools') {
  return PETA.get(norm(nama)) || bawaan
}

/** true kalau perintahnya sudah dipegang plugin lain. */
export function dilewati(nama) {
  return DILEWATI.has(norm(nama))
}

export default { KATEGORI_GIST, DILEWATI, kategoriSlug, dilewati }
