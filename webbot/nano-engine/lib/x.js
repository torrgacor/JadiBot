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
   X/Twitter Downloader — tanpa API key.

   Tiga sumber dicoba berurutan, lalu hasilnya DIGABUNG supaya satu sumber
   yang parsial tidak menggugurkan sumber lain:

     1. fxtwitter  — api.fxtwitter.com, paling lengkap (variant banyak,
                     author, statistik). Sering paling awal berhasil.
     2. syndication — cdn.syndication.twimg.com/tweet-result, milik X sendiri
                      sehingga tidak diblokir, tapi pilihan variant terbatas.
     3. vxtwitter  — api.vxtwitter.com, cadangan terakhir.

   Kalau SEMUA gagal baru lempar galat; pesannya menyebut ketiga sumber
   sehingga bug mudah dilacak.

   Berkas ini MURNI (tidak tahu WhatsApp) supaya bisa diuji tanpa bot.
   Plugin chat-nya ada di plugins/download/x.js.
   ========================================================================== */

import axios from 'axios'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

export const X_TIMEOUT_MS = 30000
/* Di atas ini WhatsApp akan menolak/memperkecil, jadi berhenti dengan jelas. */
export const MAX_MEDIA_BYTES = 64 * 1024 * 1024

const http = axios.create({
  timeout: X_TIMEOUT_MS,
  maxRedirects: 5,
  validateStatus: (s) => s < 500,
  headers: { 'User-Agent': UA, Accept: '*/*' },
})

/* ── Validasi URL ──────────────────────────────────────────────────────────── */

/**
 * Terima apa pun yang menyerupai tautan tweet → objek { id, status_url }.
 * Melempar Error berbahasa Indonesia kalau bukan URL tweet.
 */
export function parseTweetUrl(input) {
  const raw = String(input || '').trim()
  if (!raw) throw new Error('URL kosong')

  // Beberapa pengguna menempel teks panjang; ambil potongan yang menyerupai URL.
  const ditemukan = raw.match(/https?:\/\/[^\s<>"']+/i)
  const kandidat = ditemukan ? ditemukan[0] : raw

  let u
  try {
    u = new URL(/^https?:\/\//i.test(kandidat) ? kandidat : `https://${kandidat}`)
  } catch {
    throw new Error(`URL tidak valid: ${kandidat}`)
  }

  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile|twitter|x)\./, '')
  const boleh = ['twitter.com', 'x.com', 'fxtwitter.com', 'vxtwitter.com', 'fixupx.com', 'fixvx.com']
  if (!boleh.includes(host) && !boleh.includes(u.hostname.toLowerCase().replace(/^www\./, ''))) {
    throw new Error(`Host bukan X/Twitter: ${u.hostname}`)
  }

  // /username/status/1234567890 (opsional param sharing)
  // ID tweet lama bisa sangat pendek (tweet pertama Twitter = 20), jadi tidak
  // diberi batas digit bawah; segmen /status/ itu sendiri sudah cukup spesifik.
  const m = u.pathname.match(/\/status(?:es)?\/(\d{1,25})(?:\/|$|\?)/i)
  if (!m) throw new Error('URL bukan tautan tweet (tidak ada /status/<nomor>)')

  const id = m[1]
  return {
    input: raw,
    id,
    username: (u.pathname.match(/^\/([A-Za-z0-9_]{1,15})\//) || [])[1] || null,
    status_url: `https://x.com/i/status/${id}`,
  }
}

/* ── Pengambilan dari tiap sumber ──────────────────────────────────────────── */

async function ambil(url, { referer } = {}) {
  const res = await http.get(url, {
    headers: { ...(referer ? { Referer: referer } : {}) },
    timeout: X_TIMEOUT_MS,
  })
  if (res.status >= 400) throw new Error(`HTTP ${res.status}`)
  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  if (!data || typeof data !== 'object') throw new Error('balasan bukan JSON')
  return data
}

/* api.fxtwitter.com — paling lengkap, paling sering berhasil. */
export async function fetchFx(id) {
  const d = await ambil(`https://api.fxtwitter.com/i/status/${id}`)
  const t = d?.tweet
  if (!t) throw new Error('tidak ada field tweet')
  const media = Array.isArray(t.media?.all) ? t.media.all : []
  return {
    sumber: 'fxtwitter',
    author: {
      username: t.author?.screen_name || null,
      name: t.author?.name || null,
      avatar: t.author?.avatar_url || null,
      verified: Boolean(t.author?.verified),
    },
    text: t.text || '',
    created_at: t.created_at || null,
    stats: {
      likes: t.likes ?? null,
      retweets: t.retweets ?? null,
      replies: t.replies ?? null,
      views: t.views ?? null,
    },
    media: media.map((m) => ({
      type: m.type === 'video' ? 'video' : m.type === 'gif' ? 'gif' : 'image',
      url: m.url || null,
      poster: m.thumbnail_url || null,
      width: m.width || null,
      height: m.height || null,
      duration: m.duration || null,
      variants: Array.isArray(m.video_variants)
        ? m.video_variants.map((v) => ({ url: v.url, bitrate: Number(v.bitrate) || 0 })).filter((v) => v.url)
        : [],
    })),
  }
}

/* cdn.syndication.twimg.com — milik X sendiri, jarang diblokir, variant terbatas. */
export async function fetchSynd(id) {
  // Token dihitung dari id; tanpa token ini endpoint membalas 404.
  const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '')
  const d = await ambil(
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}&lang=en`
  )
  if (!d || !d.user) throw new Error('balasan tanpa field user')

  const photos = Array.isArray(d.photos) ? d.photos : []
  const vid = d.video || {}
  const variants = Array.isArray(vid.variants) ? vid.variants : []
  const mp4 = variants
    .filter((v) => String(v.content_type || '').includes('mp4'))
    .map((v) => ({ url: v.url, bitrate: Number(v.bitrate) || 0 }))
    .filter((v) => v.url)
    .sort((a, b) => b.bitrate - a.bitrate)

  const media = photos.map((p) => ({
    type: 'image',
    url: p.url || null,
    poster: p.url || null,
    width: p.width || null,
    height: p.height || null,
    duration: null,
    variants: [],
  }))

  if (mp4.length) {
    media.unshift({
      type: vid.type === 'animated_gif' ? 'gif' : 'video',
      url: mp4[0].url,
      poster: photos[0]?.url || null,
      width: null,
      height: null,
      duration: vid.duration_ms ? vid.duration_ms / 1000 : null,
      variants: mp4,
    })
  }

  return {
    sumber: 'syndication',
    author: {
      username: d.user.screen_name || null,
      name: d.user.name || null,
      avatar: d.user.profile_image_url_https || null,
      verified: Boolean(d.user.verified),
    },
    text: d.text || '',
    created_at: d.created_at || null,
    stats: {
      likes: d.favorite_count ?? null,
      retweets: d.conversation_count ?? null,
      replies: d.conversation_count ?? null,
      views: null,
    },
    media,
  }
}

/* api.vxtwitter.com — cadangan terakhir. */
export async function fetchVx(id) {
  const d = await ambil(`https://api.vxtwitter.com/Twitter/status/${id}`)
  if (!d || !d.user_name) throw new Error('balasan tanpa field user_name')

  const media = []
  const urls = []
  if (Array.isArray(d.media_url)) urls.push(...d.media_url)
  else if (d.media_url) urls.push(d.media_url)

  for (const u of urls) {
    media.push({
      type: String(d.media_type || '').includes('video') ? 'video' : 'image',
      url: u,
      poster: null,
      width: null,
      height: null,
      duration: null,
      variants: [],
    })
  }
  if (d.video_url && !media.some((m) => m.url === d.video_url)) {
    media.unshift({
      type: 'video',
      url: d.video_url,
      poster: urls[0] || null,
      width: null,
      height: null,
      duration: d.video_duration || null,
      variants: [],
    })
  }

  return {
    sumber: 'vxtwitter',
    author: {
      username: d.user_screen_name || null,
      name: d.user_name || null,
      avatar: d.user_profile_image_url_https || null,
      verified: false,
    },
    text: d.text || '',
    created_at: d.created_at || null,
    stats: {
      likes: d.likes ?? null,
      retweets: d.retweets ?? null,
      replies: d.replies ?? null,
      views: d.views ?? null,
    },
    media,
  }
}


/* ── Penggabungan hasil ────────────────────────────────────────────────────── */

/*
 * Gabungkan hasil dari beberapa sumber: ambil nilai pertama yang terisi,
 * dan gabungkan daftar media tanpa duplikat (URL sama dihapus).
 *
 * Kenapa digabung: fxtwitter bisa punya variant video terlengkap tapi
 * statistiknya kadang 0, syndication sebaliknya. Menggabung berarti tidak
 * ada satu sumber pun yang menggugurkan informasi dari sumber lain.
 */
export function gabung(daftarHasil) {
  const hasil = daftarHasil.filter(Boolean)
  if (!hasil.length) return null

  const pertama = (kunci) => {
    for (const h of hasil) {
      const v = h[kunci]
      if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)) return v
    }
    return null
  }

  const author = {}
  for (const k of ['username', 'name', 'avatar', 'verified']) {
    author[k] = null
    for (const h of hasil) {
      const v = h.author?.[k]
      // false (verified) sengaja dilewati supaya tidak menimpa true dari sumber lain
      if (v !== undefined && v !== null && v !== '' && v !== false) {
        author[k] = v
        break
      }
    }
  }

  const stats = {}
  for (const k of ['likes', 'retweets', 'replies', 'views']) {
    stats[k] = null
    for (const h of hasil) {
      const v = h.stats?.[k]
      if (v !== undefined && v !== null) {
        stats[k] = v
        break
      }
    }
  }

  // Media: URL dipakai sebagai kunci; pertahankan urutan demi-tiap sumber.
  const terlihat = new Set()
  const items = []
  for (const h of hasil) {
    for (const m of h.media || []) {
      if (!m?.url || terlihat.has(m.url)) continue
      terlihat.add(m.url)
      items.push(m)
    }
  }

  const video = items.find((m) => m.type === 'video' || m.type === 'gif') || null
  const gambar = items
    .filter((m) => m.type === 'image')
    .sort((a, b) => (b.width || 0) - (a.width || 0))

  return {
    sumber: hasil.map((h) => h.sumber),
    author: {
      username: author.username || null,
      name: author.name || null,
      avatar: author.avatar || null,
      verified: Boolean(author.verified),
    },
    text: pertama('text') || '',
    created_at: pertama('created_at'),
    stats,
    media: {
      utama: items[0] || null,
      items,
      gambar,
      video,
      poster: items.find((m) => m.poster)?.poster || null,
      jumlah: items.length,
      has_video: Boolean(video),
      has_image: gambar.length > 0,
    },
  }
}

/* ── Verifikasi CDN ────────────────────────────────────────────────────────── */

export async function verifyCdn(url, { bytesSampel = 2048 } = {}) {
  const hasil = { url: url || null, ok: false, head_ok: false, download_ok: false }
  if (!url) {
    hasil.error = 'URL tidak tersedia'
    return hasil
  }
  try {
    const head = await http.head(url, { timeout: X_TIMEOUT_MS })
    hasil.status = head.status
    hasil.content_type = head.headers['content-type'] || null
    hasil.content_length = Number(head.headers['content-length'] || 0) || null
    hasil.head_ok = head.status === 200 || head.status === 206
  } catch (err) {
    hasil.error = err.message
  }
  try {
    const res = await http.get(url, {
      headers: { Range: `bytes=0-${bytesSampel - 1}` },
      responseType: 'arraybuffer',
      timeout: X_TIMEOUT_MS,
    })
    const buf = Buffer.from(res.data || [])
    hasil.range_status = res.status
    hasil.bytes_sampled = buf.length
    hasil.download_ok = (res.status === 200 || res.status === 206) && buf.length > 0
    hasil.container = deteksiContainer(buf)
  } catch (err) {
    hasil.error = hasil.error || err.message
  }
  hasil.ok = Boolean((hasil.head_ok || hasil.download_ok) && hasil.container?.is_container)
  return hasil
}

/* Kenali container dari beberapa byte pertama — memastikan bukan halaman HTML error. */
export function deteksiContainer(buf) {
  if (!buf || buf.length < 12) return { is_container: false, format: null }
  if (buf.slice(4, 8).toString('latin1') === 'ftyp') return { is_container: true, format: 'ISO-BMFF (mp4/mov)' }
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return { is_container: true, format: 'MPEG audio' }
  if (buf[0] === 0x89 && buf.slice(1, 4).toString('latin1') === 'PNG') return { is_container: true, format: 'PNG image' }
  if (buf[0] === 0xff && buf[1] === 0xd8) return { is_container: true, format: 'JPEG image' }
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') {
    return { is_container: true, format: 'WebP image' }
  }
  if (buf.slice(0, 3).toString('latin1') === 'GIF') return { is_container: true, format: 'GIF image' }
  // HTML = kemungkinan besar halaman galat, bukan media.
  const kepala = buf.slice(0, 32).toString('latin1').toLowerCase()
  if (kepala.includes('<!doctype') || kepala.includes('<html')) {
    return { is_container: false, format: 'HTML (bukan media)' }
  }
  return { is_container: false, format: null }
}

export function slimCheck(r) {
  if (!r) return null
  return {
    ok: Boolean(r.ok),
    status: r.status ?? null,
    content_type: r.content_type ?? null,
    content_length: r.content_length ?? null,
    error: r.error ?? null,
  }
}

/* ── Entry point ───────────────────────────────────────────────────────────── */

/**
 * Ambil metadata + CDN URL tweet.
 *
 * Tiga sumber dicoba berurutan dan hasilnya digabung; galat hanya dilempar
 * kalau ketiganya gagal.
 *
 * @param {string} input   URL tweet apa pun (x.com/twitter.com/vxtwitter dst.)
 * @param {object} opts
 * @param {boolean} opts.verify  verifikasi URL media pertama via HEAD + Range GET
 */
export async function scrapeTwitter(input, { verify = false } = {}) {
  const mulai = Date.now()
  const target = parseTweetUrl(input)

  const sumber = [
    ['fxtwitter', fetchFx],
    ['syndication', fetchSynd],
    ['vxtwitter', fetchVx],
  ]

  const sukses = []
  const galat = []

  // Jalankan paralel: kalau satu sumber lambat/mati, yang lain tetap diambil.
  await Promise.all(
    sumber.map(async ([nama, fn]) => {
      try {
        const r = await fn(target.id)
        if (r?.media !== undefined || r?.author?.username) sukses.push(r)
        else galat.push(`${nama}: balasan tidak berisi media/author`)
      } catch (err) {
        galat.push(`${nama}: ${err.message}`)
      }
    })
  )

  const gabisan = gabung(sukses)
  if (!gabisan) {
    throw new Error(`Semua sumber gagal — ${galat.join(' | ')}`)
  }

  const jenis = gabisan.media.map((m) => m.type)
  const tipe = !gabisan.media.length
    ? 'text'
    : gabisan.media.length > 1
      ? 'carousel'
      : jenis[0] === 'video' || jenis[0] === 'gif'
        ? 'video'
        : 'image'

  const hasil = {
    success: true,
    platform: 'x',
    id: target.id,
    status_url: `https://x.com/i/status/${target.id}`,
    source_url: target.input,
    type: tipe,
    author: gabisan.author,
    text: gabisan.text,
    created_at: gabisan.created_at,
    stats: gabisan.stats,
    media: {
      utama: gabisan.media.utama?.url || null,
      items: gabisan.media.items,
      gambar: gabisan.media.gambar.map((m) => m.url),
      video: gabisan.media.video?.url || null,
      poster: gabisan.media.poster || null,
      jumlah: gabisan.media.jumlah,
      has_video: gabisan.media.has_video,
      has_image: gabisan.media.has_image,
    },
    sumber: gabisan.sumber,
    galat_sumber: galat,
    fetched_at: new Date().toISOString(),
    took_ms: Date.now() - mulai,
  }

  if (verify) {
    const kandidat = hasil.media.video || hasil.media.gambar[0] || hasil.media.poster
    hasil.verification = kandidat
      ? slimCheck(await verifyCdn(kandidat))
      : { ok: false, error: 'Tidak ada URL media untuk diverifikasi' }
  }

  return hasil
}

export default scrapeTwitter
