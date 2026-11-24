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

/* ==========================================================================
   Threads Downloader — scraper SSR HTML, tanpa login.

   Sumber logika: skrip `threads.js` dari ikyykzy (diadaptasi ke ESM + gaya
   NANO). Cara kerja: ambil HTML halaman postingan (mobile UA), bongkar
   <script type="application/json"> (RelayPrefetchedStreamCache), temukan
   node media utama lewat post_id, lalu kumpulkan CDN url + statistik penuh
   (caption, like, comment/reply, repost, quote, reshare).

   Mendukung: image, video, carousel, text post, dan linked carousel/embed.

   Berkas ini MURNI (tidak tahu WhatsApp) supaya bisa diuji tanpa bot.
   Plugin chat-nya ada di plugins/download/threads.js.
   ========================================================================== */

import axios from 'axios'

const UA_MOBILE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const UA_BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export const THREADS_TIMEOUT_MS = 30000
/* HTML di bawah ambang ini hampir pasti halaman blokir/CF, bukan postingan. */
export const HTML_MIN_LENGTH = 50000
/* Batas node yang dijelajahi: payload Relay bisa raksasa di carousel besar. */
export const WALK_BUDGET = 200000
export const WALK_MAX_DEPTH = 32
/* Script JSON raksasa di-skip agar parse tidak macet. */
export const SCRIPT_MAX_LENGTH = 20 * 1024 * 1024
export const SCRIPTS_MAX_COUNT = 60

const http = axios.create({ timeout: THREADS_TIMEOUT_MS, maxRedirects: 5, validateStatus: (s) => s < 500 })

const htmlHeaders = (referer) => ({
  'User-Agent': UA_MOBILE,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  ...(referer ? { Referer: referer } : {}),
})

export const cdnHeaders = () => ({ 'User-Agent': UA_BROWSER, Referer: 'https://www.threads.com/' })

export function firstDefined(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
  return null
}

export function parseUrl(input) {
  const raw = String(input || '').trim()
  if (!raw) throw new Error('URL kosong')

  let u
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    throw new Error(`URL tidak valid: ${raw}`)
  }

  if (!/(^|\.)threads\.com$/i.test(u.hostname) && !/(^|\.)threads\.net$/i.test(u.hostname)) {
    throw new Error(`Host bukan threads.com: ${u.hostname}`)
  }

  const segs = u.pathname.split('/').filter(Boolean)
  let token = null
  const shareIdx = segs.findIndex((s) => s.toLowerCase() === 'share')
  if (shareIdx >= 0 && segs[shareIdx + 1]) token = segs[shareIdx + 1]
  else if (segs[0] && segs[0].toLowerCase() === 't' && segs[1]) token = segs[1]
  else if (segs.length) token = segs[segs.length - 1]

  return { input: raw, token, permalink: raw.split('?')[0] }
}

export function decodeEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}

export function attrMap(text) {
  const map = {}
  for (const m of String(text).matchAll(/([\w:.-]+)="([^"]*)"/g)) map[m[1]] = m[2]
  return map
}

export function parseDash(manifest) {
  const result = { audio: [], video: [] }
  if (!manifest) return result
  for (const set of String(manifest).matchAll(/<AdaptationSet\b([^>]*)>([\s\S]*?)<\/AdaptationSet>/g)) {
    const setAttrs = attrMap(set[1])
    const contentType = (setAttrs.contentType || '').toLowerCase()
    if (contentType !== 'audio' && contentType !== 'video') continue
    for (const rep of set[2].matchAll(/<Representation\b([^>]*)>([\s\S]*?)<\/Representation>/g)) {
      const repAttrs = attrMap(rep[1])
      const baseUrl = (rep[2].match(/<BaseURL>([\s\S]*?)<\/BaseURL>/) || [])[1]
      if (!baseUrl) continue
      const entry = {
        bandwidth_bps: Number(repAttrs.bandwidth || 0) || null,
        codecs: repAttrs.codecs || null,
        mime_type: repAttrs.mimeType || null,
        width: repAttrs.width ? Number(repAttrs.width) : null,
        height: repAttrs.height ? Number(repAttrs.height) : null,
        quality_label: repAttrs.FBQualityLabel || null,
        url: decodeEntities(baseUrl.trim()),
      }
      if (contentType === 'audio') result.audio.push(entry)
      else result.video.push(entry)
    }
  }
  result.audio.sort((a, b) => (b.bandwidth_bps || 0) - (a.bandwidth_bps || 0))
  result.video.sort((a, b) => (b.bandwidth_bps || 0) - (a.bandwidth_bps || 0))
  return result
}

export function bestImage(node) {
  if (!node || typeof node !== 'object') return null
  const candidates = Array.isArray(node.image_versions2?.candidates) ? node.image_versions2.candidates : []
  let best = null
  for (const c of candidates) {
    if (!c || typeof c.url !== 'string' || !c.url) continue
    const area = (Number(c.width) || 0) * (Number(c.height) || 0)
    if (!best || area > best.area) best = { url: c.url, area, width: c.width ?? null, height: c.height ?? null }
  }
  if (best) return { url: best.url, width: best.width, height: best.height }
  return null
}

export function itemFromNode(node) {
  const dash = parseDash(node?.video_dash_manifest || '')
  const versions = (Array.isArray(node?.video_versions) ? node.video_versions : []).filter(
    (v) => v && typeof v.url === 'string' && v.url,
  )
  const video = versions.length ? versions[0].url : dash.video[0]?.url || null
  const image = video ? null : bestImage(node)
  return {
    pk: firstDefined(node?.pk, null),
    code: firstDefined(node?.code, null),
    media_type: firstDefined(node?.media_type, null),
    is_video: Boolean(video),
    has_audio: firstDefined(node?.has_audio, null),
    video,
    video_versions: versions.map((v) => ({ type: v.type ?? null, url: v.url })),
    audio: dash.audio[0]?.url || null,
    dash_video: dash.video[0]?.url || null,
    dash_audio: dash.audio[0]?.url || null,
    image,
    width: firstDefined(node?.original_width, image?.width, null),
    height: firstDefined(node?.original_height, image?.height, null),
  }
}

export function collectItems(media) {
  if (Array.isArray(media?.carousel_media) && media.carousel_media.length) {
    return media.carousel_media.map(itemFromNode)
  }
  const linked = media?.text_post_app_info?.linked_inline_media
  if (linked && Array.isArray(linked.carousel_media) && linked.carousel_media.length) {
    return linked.carousel_media.map(itemFromNode)
  }
  if (linked && (linked.video_versions || linked.image_versions2)) {
    return [itemFromNode(linked)]
  }
  return [itemFromNode(media)]
}

export function extractTags(text) {
  const hashtags = []
  const mentions = []
  for (const m of String(text || '').matchAll(/#([\p{L}\p{N}_]{1,80})/gu)) {
    if (!hashtags.includes(m[1])) hashtags.push(m[1])
  }
  for (const m of String(text || '').matchAll(/@([A-Za-z0-9._]{1,30})/g)) {
    if (!mentions.includes(m[1])) mentions.push(m[1])
  }
  return { hashtags, mentions }
}

export function toIso(unix) {
  if (unix === null || unix === undefined) return null
  const n = Number(unix)
  if (!Number.isFinite(n)) return null
  const d = new Date(n > 1e12 ? n : n * 1000)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function parseJsonScripts(html) {
  const out = []
  for (const m of String(html).matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)) {
    if (m[1].length > SCRIPT_MAX_LENGTH) continue
    if (out.length >= SCRIPTS_MAX_COUNT) break
    try {
      out.push(JSON.parse(m[1]))
    } catch {
      /* abaikan blok JSON yang rusak */
    }
  }
  return out
}

export function extractPostId(html) {
  const m1 = String(html).match(/"post_id":"(\d+)"/)
  if (m1) return m1[1]
  const m2 = String(html).match(/"targetPostID":"(\d+)"/)
  if (m2) return m2[1]
  const m3 = String(html).match(/"postID":"(\d+)"/)
  if (m3) return m3[1]
  return null
}

/* Anggaran penjelajahan: payload Relay bisa raksasa di carousel besar.
   Tanpa ini, satu postingan besar bisa membuat event loop macet. */
let budgetSisa = 0

export function walkCollect(node, fn, depth = 0, path = '$') {
  if (depth > WALK_MAX_DEPTH || !node || typeof node !== 'object') return
  if (budgetSisa-- <= 0) return
  try {
    fn(node, path)
  } catch {
    /* abaikan */
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) walkCollect(node[i], fn, depth + 1, `${path}[${i}]`)
  } else {
    for (const k of Object.keys(node)) walkCollect(node[k], fn, depth + 1, `${path}.${k}`)
  }
}

export function withBudget(fn) {
  budgetSisa = WALK_BUDGET
  try {
    return fn()
  } finally {
    budgetSisa = 0
  }
}

export function findMainMedia(roots, postId) {
  let best = null
  for (const root of roots) {
    walkCollect(root, (node) => {
      if (!node || typeof node !== 'object' || Array.isArray(node)) return
      if (String(node.pk || '') !== String(postId)) return
      if (typeof node.like_count !== 'number') return
      if (!node.caption || typeof node.caption.text !== 'string') {
        if (!node.text_post_app_info) return
      }
      if (!node.user || typeof node.user !== 'object') return
      const score = Object.keys(node).length + (node.code ? 50 : 0)
      if (!best || score > best.score) best = { node, score }
    })
  }
  return best?.node || null
}

export function findTopReplies(roots, postId, batas = 10) {
  const replies = []
  const seen = new Set()
  for (const root of roots) {
    walkCollect(root, (node, path) => {
      if (!path.includes('direct_replies')) return
      if (!node || typeof node !== 'object' || Array.isArray(node)) return
      if (typeof node.like_count !== 'number') return
      if (!node.caption || typeof node.caption.text !== 'string') return
      if (String(node.pk || '') === String(postId)) return
      if (!node.user) return
      const key = String(node.pk || node.id || node.code)
      if (!key || seen.has(key)) return
      seen.add(key)
      replies.push(node)
    })
  }
  return replies
    .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    .slice(0, batas)
    .map((n) => ({
      pk: firstDefined(n.pk, null),
      code: firstDefined(n.code, null),
      username: firstDefined(n.user?.username, null),
      full_name: firstDefined(n.user?.full_name, null),
      text: n.caption?.text || '',
      like_count: firstDefined(n.like_count, null),
      posted_at: toIso(firstDefined(n.taken_at, null)),
    }))
}

export function detectContainer(buf) {
  if (!buf || buf.length < 12) return { is_container: false, format: null }
  const box = buf.slice(4, 8).toString('latin1')
  if (box === 'ftyp') return { is_container: true, format: 'ISO-BMFF (mp4/mov/m4a)' }
  if (buf.slice(0, 3).toString('latin1') === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) {
    return { is_container: true, format: 'MPEG audio (mp3)' }
  }
  if (buf[0] === 0x89 && buf.slice(1, 4).toString('latin1') === 'PNG') return { is_container: true, format: 'PNG image' }
  if (buf[0] === 0xff && buf[1] === 0xd8) return { is_container: true, format: 'JPEG image' }
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') {
    return { is_container: true, format: 'WebP image' }
  }
  return { is_container: false, format: null }
}

export async function verifyMediaUrl(url, { bytesSampel = 2048 } = {}) {
  const result = { url: url || null, ok: false, head_ok: false, download_ok: false }
  if (!url) {
    result.error = 'URL tidak tersedia'
    return result
  }
  try {
    const head = await http.head(url, { headers: cdnHeaders() })
    result.status = head.status
    result.content_type = head.headers['content-type'] || null
    result.content_length = Number(head.headers['content-length'] || 0) || null
    result.head_ok = head.status === 200 || head.status === 206
  } catch (err) {
    result.error = err.message
  }
  try {
    const res = await http.get(url, {
      headers: { ...cdnHeaders(), Range: `bytes=0-${bytesSampel - 1}` },
      responseType: 'arraybuffer',
    })
    const buf = Buffer.from(res.data || [])
    result.range_status = res.status
    result.bytes_sampled = buf.length
    result.container = detectContainer(buf)
    result.download_ok = (res.status === 200 || res.status === 206) && buf.length > 0
  } catch (err) {
    result.error = result.error || err.message
  }
  result.ok = Boolean((result.head_ok || result.download_ok) && result.container?.is_container)
  return result
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

export function deriveType(media, items) {
  const linked = media?.text_post_app_info?.linked_inline_media
  if (Array.isArray(media?.carousel_media) && media.carousel_media.length) return 'carousel'
  if (linked && Array.isArray(linked.carousel_media) && linked.carousel_media.length) return 'carousel'
  if (items.some((i) => i.is_video)) return items.length > 1 ? 'carousel' : 'video'
  if (items.some((i) => i.image)) return items.length > 1 ? 'carousel' : 'image'
  return 'text'
}

export async function fetchPermalink(target, { timeoutMs = THREADS_TIMEOUT_MS } = {}) {
  const res = await http.get(target.permalink, {
    headers: htmlHeaders('https://www.threads.com/'),
    timeout: timeoutMs,
  })
  if (res.status >= 400) throw new Error(`Gagal fetch Threads (HTTP ${res.status})`)
  const html = String(res.data || '')
  if (html.length < HTML_MIN_LENGTH) throw new Error('HTML terlalu kecil, kemungkinan diblokir/CF')
  return html
}

export function parsePermalinkHtml(html, { target = null } = {}) {
  const permalink = target?.permalink || ''
  const input = target?.input || permalink
  const postId = extractPostId(html)
  if (!postId) throw new Error('post_id tidak ditemukan di HTML (format berubah / post privat)')

  const roots = parseJsonScripts(html)
  const media = withBudget(() => findMainMedia(roots, postId))
  if (!media) throw new Error('Data media utama tidak ditemukan di Relay payload')

  const replies = withBudget(() => findTopReplies(roots, postId))
  const items = collectItems(media)
  const linked = media.text_post_app_info?.linked_inline_media || null

  const videos = items.filter((i) => i.video)
  const images = items.filter((i) => i.image && i.image.url)
  const primaryImage = images[0]?.image?.url || bestImage(media)?.url || null

  const uniq = (arr) => [...new Set(arr.filter(Boolean))]
  const uniqueVideos = uniq(videos.map((v) => v.video))
  const uniqueAudios = uniq(items.map((i) => i.audio))
  const uniqueImages = uniq(images.map((i) => i.image.url))

  const url = {}
  if (uniqueVideos.length === 1) url.video = uniqueVideos[0]
  else if (uniqueVideos.length > 1) url.videos = uniqueVideos
  else url.video = null
  if (uniqueAudios.length === 1) url.audio = uniqueAudios[0]
  else if (uniqueAudios.length > 1) url.audios = uniqueAudios
  else url.audio = null
  url.images = uniqueImages
  if (!uniqueImages.length && primaryImage) url.thumbnail = primaryImage

  const captionText = firstDefined(media.caption?.text, '')
  const tags = extractTags(captionText)
  const owner = media.user || {}
  const info = media.text_post_app_info || {}
  const type = deriveType(media, items)

  const linkedPost = linked ? normalizeLinked(linked, postId) : null

  return {
    permalink,
    source_url: input,
    post_id: String(media.pk || postId),
    code: firstDefined(media.code, null),
    type,
    canonical_url: firstDefined(
      media.canonical_url,
      media.code ? `https://www.threads.com/t/${media.code}` : permalink || null
    ),
    url,
    caption: {
      text: captionText,
      hashtags: tags.hashtags,
      mentions: tags.mentions,
    },
    author: {
      username: firstDefined(owner.username, null),
      full_name: firstDefined(owner.full_name, null),
      avatar_url: firstDefined(owner.profile_pic_url, owner.hd_profile_pic_url_info?.url, null),
      is_verified: Boolean(owner.is_verified),
      is_private: Boolean(owner.is_private),
    },
    posted_at: toIso(firstDefined(media.taken_at, media.device_timestamp, null)),
    stats: {
      like_count: firstDefined(media.like_count, 0) || 0,
      comment_count: firstDefined(
        media.text_post_app_info.direct_reply?.reply_count,
        media.comment_count,
        0
      ) || 0,
      repost_count: firstDefined(media.repost_count, info.repost_count, 0) || 0,
      quote_count: firstDefined(media.quote_count, info.quote_count, 0) || 0,
      reshare_count: firstDefined(media.reshare_count, info.reshare_count, 0) || 0,
      view_count: firstDefined(media.view_count, info.view_count, null),
    },
    media: {
      items,
      video: url.video ?? null,
      videos: url.videos || null,
      audio: url.audio ?? null,
      audios: url.audios || null,
      images: url.images,
      thumbnail: primaryImage,
      has_video: uniqueVideos.length > 0,
      has_image: uniqueImages.length > 0,
      has_audio: uniqueAudios.length > 0,
      item_count: items.length,
    },
    linked_post: linkedPost,
    comments: replies,
    counts: {
      items: items.length,
      comments: replies.length,
      videos: uniqueVideos.length,
      images: uniqueImages.length,
      audios: uniqueAudios.length,
    },
  }
}

/* Normalisasi node linked_inline_media (post yang dikutip / carousel tertanam). */
function normalizeLinked(node, rootPostId) {
  const items = collectItems(node)
  const images = items.map((i) => i.image?.url).filter(Boolean)
  const videos = [...new Set(items.map((i) => i.video).filter(Boolean))]
  return {
    post_id: firstDefined(node.pk, null),
    code: firstDefined(node.code, null),
    permalink:
      firstDefined(
        node.code ? `https://www.threads.com/t/${node.code}` : null,
        node.permalink,
        null
      ),
    text: firstDefined(node.caption?.text, ''),
    username: firstDefined(node.user?.username, null),
    type: deriveType(node, items) || 'text',
    images: videos.length ? images : images,
    video: videos[0] || null,
    is_same_post: String(node.pk || '') === String(rootPostId || ''),
  }
}

/* ── Entry point ───────────────────────────────────────────────────────────── */

/**
 * Unduh metadata + CDN URL postingan Threads.
 *
 * @param {string} input  URL postingan (threads.com / threads.net / l.cdn)
 * @param {object} opts
 * @param {boolean} opts.verify  verifikasi URL media pertama via HEAD + Range GET
 * @returns {Promise<object>} hasil `success:true` bila OK
 */
export async function threadsDL(input, { verify = false } = {}) {
  const started = Date.now()
  const target = parseUrl(input)
  const html = await fetchPermalink(target)
  const data = parsePermalinkHtml(html, { target })

  const hasil = {
    success: true,
    platform: 'threads',
    ...data,
    fetched_at: new Date().toISOString(),
    took_ms: Date.now() - started,
    protection: {
      header_guard: true,
      budget_walk: WALK_BUDGET,
      script_cap: SCRIPT_MAX_LENGTH,
    },
  }

  if (verify) {
    const kandidat =
      (typeof data.url.video === 'string' && data.url.video) ||
      data.url.images?.[0] ||
      data.url.thumbnail ||
      null
    hasil.verification = kandidat
      ? slimCheck(await verifyMediaUrl(kandidat))
      : { ok: false, error: 'Tidak ada URL media untuk diverifikasi' }
  }

  return hasil
}

export default threadsDL


