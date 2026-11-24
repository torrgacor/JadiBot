/* ⌬
 ┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
 ┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
 ┇ █  █ █ █▀▄ █▄█   █▀█ █
 ┇  ▀█  --N--a--n--o------A--i-----
 ┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
 ┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━
 ┇▫️Author  : Danz nano & Awang Ofc
 ┇▫️Website  : awangofc.my.id
 ┇▫️WhatsApp : wa.me/556184127506
 ┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
 ┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
 ┇🔸Dilarang Menghapus Creadit SC
 ┇🔸Dilarang Menjual Script Nano Ai
 ┇🔸Dilarang Mengatas Namakan Script!!
 ⌬ */

/* ==========================================================================
   Komiku Downloader — VERSI AMAN, scraper SSR HTML komiku.online.

   Berkas ini MURNI (tidak tahu WhatsApp) supaya bisa diuji tanpa bot.
   Plugin chat-nya ada di plugins/download/komiku.js.

   KEBIJAKAN KONTEN — dibaca dulu sebelum diubah:
   Komiku memuat genre dewasa. Modul ini HANYA melayani konten aman:
     • GENRE_BLOKIR = daftar genre/slug dewasa — DITOLAK di semua jalur.
     • Saring judul/genre/metadata/URL hasil terhadap kata dewasa.
     • Tidak ada jalur khusus dewasa, tidak ada flag untuk melewati filter.
   ========================================================================== */

import * as cheerio from 'cheerio'

const BASE_URL = 'https://komiku.online'

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  Referer: 'https://komiku.online/',
}

export const KOMIKU_TIMEOUT_MS = 30000
export const HTML_MAX_LENGTH = 5 * 1024 * 1024
export const HASIL_MAX = 20
export const GAMBAR_MAX = 200
export const ZIP_MAX_BYTES = 64 * 1024 * 1024
export const UNDUH_CONCURRENCY = 5


/* Genre dewasa — DITOLAK di semua jalur. Jangan dihapus tanpa persetujuan. */
export const GENRE_BLOKIR = new Set([
  'ecchi', 'harem', 'ngewe', 'dewasa', 'hentai',
  'yaoi', 'yuri', 'smut', 'doujinshi', 'adult',
  'porn', 'sex', 'erotis', 'erotica', 'lemon',
])

/* Kata dewasa untuk saring judul/metadata/URL (substring, lowercase). */
const KATA_BLOKIR = [
  'ngewe', 'hentai', 'yaoi', 'yuri', 'smut', 'doujinshi',
  'porn', 'porno', 'seks', 'sex ', 'memek', 'kontol', 'telanjang',
  'bugil', 'bokep', 'ecchi', 'harem', 'dewasa', '18+', 'r18',
]

/* Genre aman yang ditawarkan ke pengguna (turunan daftar situs, minus dewasa). */
export const GENRES = [
  'aksi', 'komedi', 'romantis', 'drama', 'shounen', 'petualangan',
  'school-life', 'slice-of-life', 'seinen', 'supernatural', 'bela-diri',
  'shoujo', 'misteri', 'sejarah', 'sihir', 'fiksi-ilmiah', 'psikologis',
  'horor', 'reinkarnasi', 'tragedi',
]

function formatUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

function extractSlug(urlOrSlug) {
  if (!urlOrSlug) return ''
  return urlOrSlug
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/baca\//, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
}

/* true bila teks mengandung kata dewasa. */
export function isDewasa(teks) {
  const t = ` ${String(teks || '').toLowerCase()} `
  return KATA_BLOKIR.some((k) => t.includes(k))
}

/* true bila slug genre termasuk daftar blokir. */
export function isGenreBlokir(slug) {
  return GENRE_BLOKIR.has(String(slug || '').trim().toLowerCase())
}

/* Lempar bila item mengandung konten dewasa. */
function tolakDewasa(item, konteks = '') {
  const gabung = [item?.title, item?.genre, item?.meta, item?.url, item?.slug].join(' ')
  if (isDewasa(gabung)) {
    throw new Error(`Konten dewasa ditolak${konteks ? ` (${konteks})` : ''}.`)
  }
  for (const g of item?.genres || []) {
    if (isGenreBlokir(g.slug) || isDewasa(g.name)) {
      throw new Error(`Genre dewasa ditolak${konteks ? ` (${konteks})` : ''}.`)
    }
  }
}

/* Ambil HTML dengan batas ukuran + timeout. */
async function ambilHtml(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), KOMIKU_TIMEOUT_MS)
  try {
    const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ct = String(res.headers.get('content-type') || '')
    if (ct && !/text\/html|application\/xhtml/i.test(ct)) {
      throw new Error('Respons bukan HTML.')
    }
    const html = await res.text()
    if (!html || html.length < 500) throw new Error('Halaman kosong.')
    if (html.length > HTML_MAX_LENGTH) throw new Error('Halaman terlalu besar.')
    return html
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('Permintaan ke Komiku timeout.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/* Hanya URL komiku.online yang diterima. */
function wajibKomiku(url) {
  let u
  try {
    u = new URL(url)
  } catch {
    throw new Error('URL tidak valid.')
  }
  if (!/(^|\.)komiku\.online$/i.test(u.hostname)) {
    throw new Error('Hanya tautan komiku.online yang diterima.')
  }
  return u
}


function parseCard($, el) {
  const linkEl = $(el).find('a').first()
  const rawUrl = linkEl.attr('href') || $(el).attr('href') || ''
  const url = formatUrl(rawUrl)
  const slug = extractSlug(rawUrl)

  const title = $(el).find('.kmk-kartu-judul').text().trim() || linkEl.attr('title') || ''
  const thumbnail = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || ''
  const meta = $(el).find('.kmk-kartu-meta').text().replace(/\s+/g, ' ').trim()
  const chText = $(el).find('.kmk-kartu-ch').text().trim()

  let genre = ''
  let totalChapters = ''
  if (meta.includes('·')) {
    const parts = meta.split('·')
    genre = parts[0].trim()
    totalChapters = parts[1].trim()
  } else {
    genre = meta
  }

  return { title, slug, url, thumbnail, genre, total_chapters: totalChapters || chText, meta }
}

function parseDaftar(html) {
  const $ = cheerio.load(html)
  const items = []
  $('.kmk-kartu').each((_, el) => {
    try {
      const card = parseCard($, el)
      if (!card.title) return
      if (isDewasa([card.title, card.genre, card.meta, card.url].join(' '))) return
      items.push(card)
    } catch { /* lewati kartu rusak */ }
  })
  return items.slice(0, HASIL_MAX)
}

export async function getHome() {
  const html = await ambilHtml(BASE_URL)
  const items = parseDaftar(html)
  return { total: items.length, latest: items.slice(0, 20), popular: items.slice(20), items }
}

export async function getPopular(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pagePath = page > 1 ? `page/${page}/` : ''
  const html = await ambilHtml(`${BASE_URL}/populer/${pagePath}`)
  const items = parseDaftar(html)
  return { page, total: items.length, items }
}

export async function getLatest(page = 1) {
  const pageNum = Math.max(1, Number(page) || 1)
  const pagePath = pageNum > 1 ? `page/${pageNum}/` : ''
  const html = await ambilHtml(`${BASE_URL}/terbaru/${pagePath}`)
  const items = parseDaftar(html)
  return { page: pageNum, total: items.length, items }
}

export async function search(keyword, options = {}) {
  if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
    throw new Error('Kata kunci pencarian wajib diisi.')
  }
  if (isDewasa(keyword)) throw new Error('Kata kunci dewasa ditolak.')
  const page = Math.max(1, Number(options.page) || 1)
  const queryParams = new URLSearchParams({ s: keyword.trim() })
  if (page > 1) queryParams.set('paged', String(page))
  const html = await ambilHtml(`${BASE_URL}/?${queryParams.toString()}`)
  const results = parseDaftar(html)
  return { keyword: keyword.trim(), page, total: results.length, results }
}

export async function getByType(type = 'manhwa', options = {}) {
  const cleanType = String(type || '').trim().toLowerCase()
  const validTypes = ['manga', 'manhwa', 'manhua']
  const selectedType = validTypes.includes(cleanType) ? cleanType : 'manhwa'
  const page = Math.max(1, Number(options.page) || 1)
  const pagePath = page > 1 ? `page/${page}/` : ''
  const html = await ambilHtml(`${BASE_URL}/${selectedType}/${pagePath}`)
  const items = parseDaftar(html)
  return { type: selectedType, page, total: items.length, items }
}

export async function getByGenre(genreSlug, options = {}) {
  if (!genreSlug || typeof genreSlug !== 'string' || !genreSlug.trim()) {
    throw new Error('Slug genre wajib diisi.')
  }
  const cleanSlug = genreSlug.trim().toLowerCase()
  if (isGenreBlokir(cleanSlug)) throw new Error(`Genre "${cleanSlug}" tidak tersedia di mode aman.`)
  if (!GENRES.includes(cleanSlug)) throw new Error(`Genre tidak dikenal: "${cleanSlug}".`)
  const page = Math.max(1, Number(options.page) || 1)
  const pagePath = page > 1 ? `page/${page}/` : ''
  const html = await ambilHtml(`${BASE_URL}/genre/${cleanSlug}/${pagePath}`)
  const items = parseDaftar(html)
  return { genre: cleanSlug, page, total: items.length, items }
}

export async function getDetail(slugOrUrl) {
  if (!slugOrUrl || typeof slugOrUrl !== 'string' || !slugOrUrl.trim()) {
    throw new Error('Slug komik wajib diisi.')
  }
  let targetUrl = slugOrUrl.trim()
  if (!/^https?:\/\//i.test(targetUrl)) {
    const slug = extractSlug(targetUrl)
    if (!slug || isDewasa(slug)) throw new Error('Slug komik tidak valid.')
    targetUrl = `${BASE_URL}/${slug}/`
  }
  wajibKomiku(targetUrl)

  const html = await ambilHtml(targetUrl)
  const $ = cheerio.load(html)

  const rawTitle = $('h1').first().text().trim()
  const title = rawTitle.replace(/^Komik\s+/i, '').trim()
  const slug = extractSlug(targetUrl)
  if (isDewasa(title)) throw new Error('Konten dewasa ditolak.')

  const thumbnail = $('img[src*="poster"]').first().attr('src') || $('img').first().attr('src') || ''
  const metaText = $('p:contains("adalah"), p:contains("bergenre")').first().text().replace(/\s+/g, ' ').trim()

  let type = 'Manga'
  if (/manhwa/i.test(metaText)) type = 'Manhwa'
  else if (/manhua/i.test(metaText)) type = 'Manhua'

  let status = 'Ongoing'
  if (/tamat|completed/i.test(metaText)) status = 'Completed'

  const genres = []
  $('a[href*="/genre/"]').each((_, a) => {
    const gName = $(a).text().trim()
    const gHref = $(a).attr('href') || ''
    if (gName && !genres.some((g) => g.name === gName)) {
      genres.push({ name: gName, slug: extractSlug(gHref), url: formatUrl(gHref) })
    }
  })

  const synopsis = $('p:contains("adalah")').text().trim() || $('p').eq(1).text().trim()

  const chapters = []
  $(`a[href*="/baca/${slug}-chapter-"], a[href*="/baca/"]`).each((_, a) => {
    const chHref = $(a).attr('href') || ''
    if (chHref.includes(`/baca/${slug}-chapter-`)) {
      const chTitle = $(a).text().replace(/\s+/g, ' ').trim()
      if (!chapters.some((c) => c.url === chHref)) {
        chapters.push({ title: chTitle, slug: extractSlug(chHref), url: formatUrl(chHref) })
      }
    }
  })

  const hasil = {
    title, slug, url: targetUrl, thumbnail, type, status, genres, synopsis,
    first_chapter: chapters.length ? chapters[0] : null,
    latest_chapter: chapters.length ? chapters[1] || chapters[0] : null,
    total_chapters: chapters.length, chapters,
  }
  tolakDewasa({ ...hasil, meta: metaText }, 'detail')
  return hasil
}

export async function getChapter(slugOrUrl) {
  if (!slugOrUrl || typeof slugOrUrl !== 'string' || !slugOrUrl.trim()) {
    throw new Error('Slug chapter wajib diisi.')
  }
  let targetUrl = slugOrUrl.trim()
  const slug = extractSlug(targetUrl)
  if (!slug || isDewasa(slug)) throw new Error('Slug chapter tidak valid.')
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `${BASE_URL}/baca/${slug}/`
  }
  wajibKomiku(targetUrl)

  let html
  try {
    html = await ambilHtml(targetUrl)
  } catch (err) {
    if (/HTTP 404/.test(err?.message || '')) {
      throw new Error(`Chapter "${slug}" tidak ditemukan. Pakai slug dari getDetail()/getHome().`)
    }
    throw err
  }
  const $ = cheerio.load(html)

  const title = $('h1').first().text().trim()
  if (isDewasa(title)) throw new Error('Konten dewasa ditolak.')

  let prevChapterUrl = null
  let nextChapterUrl = null
  let mangaUrl = null
  $('a').each((_, a) => {
    const text = $(a).text().trim()
    const href = formatUrl($(a).attr('href') || '')
    if (text.includes('Sebelumnya') || text.includes('‹')) prevChapterUrl = href
    else if (text.includes('Selanjutnya') || text.includes('›')) nextChapterUrl = href
    else if (text.includes('Semua Chapter')) mangaUrl = href.replace(/#chapter$/, '')
  })

  const images = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (!src) return
    if (/logo|favicon|assets|theme|banner|iklan/i.test(src)) return
    if (/^https?:\/\//i.test(src)) images.push(src.trim())
  })

  return {
    title, slug: extractSlug(targetUrl), url: targetUrl, manga_url: mangaUrl,
    prev_chapter_url: prevChapterUrl, next_chapter_url: nextChapterUrl,
    total_images: images.length, images: images.slice(0, GAMBAR_MAX),
  }
}

export async function getRandom(options = {}) {
  const home = await getHome()
  const items = home.items || []
  if (!items.length) throw new Error('Belum ada komik aman yang tersedia.')
  const randomItem = items[Math.floor(Math.random() * items.length)]
  if (options.detail !== false && randomItem?.slug) {
    return getDetail(randomItem.slug)
  }
  return randomItem
}

export function getGenres() {
  return [...GENRES]
}

export function getGenreBlokir() {
  return [...GENRE_BLOKIR]
}


/* ── ZIP manual (tanpa dependensi baru; gambar sudah terkompresi) ── */

function crc32(buf) {
  let table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0 ^ -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF]
  return (crc ^ -1) >>> 0
}

function createZipBuffer(files) {
  const localHeaders = []
  const centralHeaders = []
  let offset = 0
  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8')
    const dataBuf = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data)
    const crc = crc32(dataBuf)
    const size = dataBuf.length

    const lh = Buffer.alloc(30 + nameBuf.length)
    lh.writeUInt32LE(0x04034b50, 0)
    lh.writeUInt16LE(20, 4)
    lh.writeUInt16LE(0, 6)
    lh.writeUInt16LE(0, 8)
    lh.writeUInt16LE(0, 10)
    lh.writeUInt16LE(0, 12)
    lh.writeUInt32LE(crc, 14)
    lh.writeUInt32LE(size, 18)
    lh.writeUInt32LE(size, 22)
    lh.writeUInt16LE(nameBuf.length, 26)
    lh.writeUInt16LE(0, 28)
    nameBuf.copy(lh, 30)

    const ch = Buffer.alloc(46 + nameBuf.length)
    ch.writeUInt32LE(0x02014b50, 0)
    ch.writeUInt16LE(20, 4)
    ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(0, 8)
    ch.writeUInt16LE(0, 10)
    ch.writeUInt16LE(0, 12)
    ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(size, 20)
    ch.writeUInt32LE(size, 24)
    ch.writeUInt16LE(nameBuf.length, 28)
    ch.writeUInt16LE(0, 30)
    ch.writeUInt16LE(0, 32)
    ch.writeUInt16LE(0, 34)
    ch.writeUInt16LE(0, 36)
    ch.writeUInt32LE(0, 38)
    ch.writeUInt32LE(offset, 42)
    nameBuf.copy(ch, 46)

    localHeaders.push(lh, dataBuf)
    centralHeaders.push(ch)
    offset += lh.length + dataBuf.length
  }
  const centralDir = Buffer.concat(centralHeaders)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(files.length, 8)
  eocd.writeUInt16LE(files.length, 10)
  eocd.writeUInt32LE(centralDir.length, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)
  return Buffer.concat([...localHeaders, centralDir, eocd])
}

/* Unduh gambar chapter (maksimal + batas ZIP), tanpa menulis file permanen. */
export async function downloadChapter(slugOrUrl, options = {}) {
  const chapter = await getChapter(slugOrUrl)
  const batasGambar = Math.max(1, Math.min(GAMBAR_MAX, Number(options.maxImages) || GAMBAR_MAX))
  const imageUrls = (chapter.images || []).slice(0, batasGambar)
  if (!imageUrls.length) throw new Error('Tidak ada gambar aman yang ditemukan.')

  const concurrency = Math.max(1, Math.min(10, Number(options.concurrency) || UNDUH_CONCURRENCY))
  const downloadedFiles = new Array(imageUrls.length)
  let totalBytes = 0

  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const chunk = imageUrls.slice(i, i + concurrency)
    await Promise.all(
      chunk.map(async (url, idx) => {
        const fileIdx = i + idx
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), KOMIKU_TIMEOUT_MS)
        try {
          const res = await fetch(url, {
            headers: { 'User-Agent': DEFAULT_HEADERS['User-Agent'], Referer: BASE_URL },
            signal: controller.signal,
          })
          if (!res.ok) return
          const buf = Buffer.from(await res.arrayBuffer())
          if (!buf.length || buf.length > 10 * 1024 * 1024) return
          if (totalBytes + buf.length > ZIP_MAX_BYTES) return
          totalBytes += buf.length
          const ext = String(url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg').slice(0, 4) || 'jpg'
          downloadedFiles[fileIdx] = { name: `${String(fileIdx + 1).padStart(3, '0')}.${ext}`, data: buf }
        } catch { /* lewati gambar gagal */ } finally {
          clearTimeout(timer)
        }
      })
    )
  }

  const validFiles = downloadedFiles.filter(Boolean)
  if (!validFiles.length) throw new Error('Semua gambar chapter gagal diunduh.')
  return {
    success: true, title: chapter.title, slug: chapter.slug,
    total_images: validFiles.length, zip_buffer: createZipBuffer(validFiles),
  }
}

export default {
  getHome, getPopular, getLatest, search, getByType,
  getByGenre, getDetail, getChapter, getRandom,
  getGenres, getGenreBlokir, downloadChapter,
  isDewasa, isGenreBlokir,
}

