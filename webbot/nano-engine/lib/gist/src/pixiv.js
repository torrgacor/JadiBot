import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const QUERY = "Hinata Hyuga";
const LANG = "en";
const TYPE = "artworks";
const PAGE = 1;
const RANDOM_PAGE = true;
const MAX_RANDOM_PAGE = 5;
const RANDOM_PICK = true;
const PICK_INDEX = null;
const MODE = "all";
const ORDER = "date_d";
const S_MODE = "s_tag";
const DOWNLOAD_IMAGE = true;
const DOWNLOAD_COVER = false;
const OUTPUT_DIR = "./pixiv-downloads";
const MAX_DOWNLOAD_IMAGES = 10;
const DOWNLOAD_DELAY_MS = 800;
const DOWNLOAD_RETRY = 2;
const COOKIE = process.env.PIXIV_COOKIE || "";

const BASE_URL = "https://www.pixiv.net";
const AVAILABLE_TYPES = ["artworks", "novels"];

const jar = new CookieJar();

if (COOKIE) {
  for (const item of COOKIE.split(";")) {
    const cookie = item.trim();
    if (cookie) await jar.setCookie(cookie, BASE_URL);
  }
}

const api = wrapper(axios.create({
  baseURL: BASE_URL,
  jar,
  withCredentials: true,
  timeout: 60000,
  validateStatus: () => true,
  decompress: true,
  headers: {
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": `"Android"`
  }
}));

function validateType(type) {
  if (!AVAILABLE_TYPES.includes(type)) {
    throw new Error(`Type tidak valid: ${type}. Available types: ${AVAILABLE_TYPES.join(", ")}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldRetryStatus(code) {
  return code === 408 || code === 429 || code === 500 || code === 502 || code === 503 || code === 504;
}

function getSelectedPage() {
  if (!RANDOM_PAGE) return PAGE;
  const max = Math.max(1, Number(MAX_RANDOM_PAGE) || 1);
  return Math.floor(Math.random() * max) + 1;
}

function decodeText(text) {
  return String(text || "")
    .replace(/\\\//g, "/")
    .replace(/&quot;/g, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function cleanText(text) {
  return decodeText(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeImage(url) {
  if (!url) return null;
  return String(url).replace(/\\\//g, "/");
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }
  return value;
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(tag => {
    if (typeof tag === "string") return tag;
    return tag?.translation?.en || tag?.translation || tag?.tag_translation || tag?.tag || tag?.name || tag?.romaji || null;
  }).filter(Boolean);
}

function joinTags(tags, max = 15) {
  if (!Array.isArray(tags) || !tags.length) return null;
  return tags.slice(0, max).join(", ");
}

function isChallenge(data) {
  return typeof data === "string" && /just a moment|cloudflare|cf-browser-verification|challenge-platform|turnstile/i.test(data);
}

function extFromUrl(url, contentType = "") {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname);

  if (ext) return ext;
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";

  return ".jpg";
}

function filenameFromUrl(url, contentType = "") {
  const pathname = new URL(url).pathname;
  const base = path.basename(pathname);
  const ext = extFromUrl(url, contentType);

  if (base && base.includes(".")) return base;

  return `${crypto.randomBytes(8).toString("hex")}${ext}`;
}

async function req(method, url, headers = {}) {
  const started = Date.now();

  try {
    const res = await api.request({
      method,
      url,
      headers
    });

    return {
      Status: res.status >= 200 && res.status < 300,
      Code: res.status,
      Url: new URL(url, BASE_URL).href,
      Content_type: res.headers?.["content-type"] || null,
      Data: res.data,
      Time_ms: Date.now() - started
    };
  } catch (error) {
    return {
      Status: false,
      Code: error.response?.status || 500,
      Url: new URL(url, BASE_URL).href,
      Error: error.message,
      Time_ms: Date.now() - started
    };
  }
}

async function getHome() {
  return req("GET", `/${LANG}/`, {
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "upgrade-insecure-requests": "1"
  });
}

async function searchPixiv(type, query, page) {
  const params = new URLSearchParams({
    word: query,
    order: ORDER,
    mode: MODE,
    p: String(page),
    s_mode: S_MODE,
    type: "all",
    lang: LANG
  });

  return req("GET", `/ajax/search/${type}/${encodeURIComponent(query)}?${params.toString()}`, {
    accept: "application/json",
    referer: `${BASE_URL}/${LANG}/tags/${encodeURIComponent(query)}`,
    "x-requested-with": "XMLHttpRequest",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty"
  });
}

async function getArtworkDetail(id) {
  const detail = await req("GET", `/ajax/illust/${id}`, {
    accept: "application/json",
    referer: `${BASE_URL}/${LANG}/artworks/${id}`,
    "x-requested-with": "XMLHttpRequest",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty"
  });

  const pages = await req("GET", `/ajax/illust/${id}/pages`, {
    accept: "application/json",
    referer: `${BASE_URL}/${LANG}/artworks/${id}`,
    "x-requested-with": "XMLHttpRequest",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty"
  });

  return {
    Status: detail.Status,
    Code: detail.Code,
    Detail: detail.Status && detail.Data?.body ? detail.Data.body : null,
    Pages: pages.Status && Array.isArray(pages.Data?.body) ? pages.Data.body : []
  };
}

async function getNovelDetail(id) {
  const detail = await req("GET", `/ajax/novel/${id}`, {
    accept: "application/json",
    referer: `${BASE_URL}/${LANG}/novel/show.php?id=${id}`,
    "x-requested-with": "XMLHttpRequest",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty"
  });

  return {
    Status: detail.Status,
    Code: detail.Code,
    Detail: detail.Status && detail.Data?.body ? detail.Data.body : null
  };
}

async function downloadPixivImage(url, id = "pixiv", page = 0) {
  const started = Date.now();
  let lastError = null;

  for (let attempt = 1; attempt <= DOWNLOAD_RETRY + 1; attempt++) {
    try {
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 60000,
        validateStatus: () => true,
        headers: {
          "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
          "referer": BASE_URL + "/",
          "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
      });

      const contentType = res.headers?.["content-type"] || "";

      if (res.status < 200 || res.status >= 300) {
        lastError = `Download gagal dengan status ${res.status}`;

        if (attempt <= DOWNLOAD_RETRY && shouldRetryStatus(res.status)) {
          await sleep(1000 * attempt);
          continue;
        }

        return {
          Status: false,
          Code: res.status,
          Page: page,
          Url: url,
          File: null,
          Error: lastError,
          Attempt: attempt,
          Content_type: contentType,
          Time_ms: Date.now() - started
        };
      }

      if (!contentType.startsWith("image/")) {
        return {
          Status: false,
          Code: res.status,
          Page: page,
          Url: url,
          File: null,
          Error: "Response bukan image",
          Content_type: contentType,
          Preview: Buffer.from(res.data).toString("utf8").slice(0, 300),
          Attempt: attempt,
          Time_ms: Date.now() - started
        };
      }

      fs.mkdirSync(OUTPUT_DIR, { recursive: true });

      const originalName = filenameFromUrl(url, contentType);
      const filename = originalName.startsWith(id)
        ? originalName
        : `${id}_p${page}_${originalName}`;

      const filepath = path.join(OUTPUT_DIR, filename);

      fs.writeFileSync(filepath, Buffer.from(res.data));

      return {
        Status: true,
        Code: res.status,
        Page: page,
        Url: url,
        File: filepath,
        Filename: filename,
        Size_bytes: Buffer.byteLength(res.data),
        Content_type: contentType,
        Attempt: attempt,
        Time_ms: Date.now() - started
      };
    } catch (error) {
      lastError = error.message;

      if (attempt <= DOWNLOAD_RETRY) {
        await sleep(1000 * attempt);
        continue;
      }

      return {
        Status: false,
        Code: 500,
        Page: page,
        Url: url,
        File: null,
        Error: lastError,
        Attempt: attempt,
        Time_ms: Date.now() - started
      };
    }
  }
}

async function downloadAllPixivImages(urls, id = "pixiv") {
  const started = Date.now();
  const allUrls = [...new Set((urls || []).filter(Boolean))];
  const list = allUrls.slice(0, MAX_DOWNLOAD_IMAGES);
  const skipped = Math.max(0, allUrls.length - list.length);
  const files = [];

  for (let i = 0; i < list.length; i++) {
    const downloaded = await downloadPixivImage(list[i], id, i);
    files.push(downloaded);

    if (i < list.length - 1 && DOWNLOAD_DELAY_MS > 0) {
      await sleep(DOWNLOAD_DELAY_MS);
    }
  }

  return {
    Status: files.some(item => item.Status),
    Total: list.length,
    Success: files.filter(item => item.Status).length,
    Failed: files.filter(item => !item.Status).length,
    Skipped: skipped,
    Limit: MAX_DOWNLOAD_IMAGES,
    Delay_ms: DOWNLOAD_DELAY_MS,
    Files: files,
    Time_ms: Date.now() - started
  };
}

function normalizeArtwork(item, detail) {
  const d = detail.Detail || {};
  const pages = Array.isArray(detail.Pages) ? detail.Pages : [];
  const pageImages = pages
    .map(x => normalizeImage(x?.urls?.original || x?.urls?.regular || x?.urls?.small))
    .filter(Boolean);

  const images = pageImages.length ? pageImages : [
    normalizeImage(d?.urls?.original),
    normalizeImage(d?.urls?.regular),
    normalizeImage(d?.urls?.small),
    normalizeImage(item?.url)
  ].filter(Boolean);

  return removeUndefined({
    Type: "artwork",
    Id: String(d.id || item.id || ""),
    Title: d.title || item.title || null,
    Description: cleanText(d.description || item.description || item.titleCaption),
    Author: d.userName || item.userName || null,
    Username: d.userAccount || item.userAccount || null,
    Author_id: d.userId ? String(d.userId) : item.userId ? String(item.userId) : null,
    Images: images,
    Tags: joinTags(normalizeTags(d.tags?.tags || d.tags || item.tags)),
    Stats: {
      Views: safeNumber(d.viewCount || item.viewCount),
      Likes: safeNumber(d.likeCount || item.likeCount),
      Bookmarks: safeNumber(d.bookmarkCount || item.bookmarkCount),
      Comments: safeNumber(d.commentCount || item.commentCount)
    },
    Size: {
      Width: safeNumber(d.width || item.width),
      Height: safeNumber(d.height || item.height),
      Page_count: safeNumber(d.pageCount || item.pageCount || images.length)
    },
    Dates: {
      Created: d.createDate || item.createDate || null,
      Uploaded: d.uploadDate || null,
      Updated: item.updateDate || null
    },
    Restrict: {
      X_restrict: d.xRestrict ?? item.xRestrict ?? null,
      Sl: d.sl ?? item.sl ?? null,
      Ai_type: d.aiType ?? item.aiType ?? null
    }
  });
}

function normalizeNovel(item, detail) {
  const d = detail.Detail || {};

  return removeUndefined({
    Type: "novel",
    Id: String(d.id || item.id || ""),
    Title: d.title || item.title || null,
    Description: cleanText(d.description || item.description),
    Text: cleanText(d.content || d.text),
    Author: d.userName || item.userName || null,
    Username: d.userAccount || item.userAccount || null,
    Author_id: d.userId ? String(d.userId) : item.userId ? String(item.userId) : null,
    Cover: normalizeImage(d.coverUrl || item.coverUrl || item.url),
    Tags: joinTags(normalizeTags(d.tags?.tags || d.tags || item.tags)),
    Stats: {
      Views: safeNumber(d.viewCount || item.viewCount),
      Likes: safeNumber(d.likeCount || item.likeCount),
      Bookmarks: safeNumber(d.bookmarkCount || item.bookmarkCount),
      Comments: safeNumber(d.commentCount || item.commentCount),
      Text_count: safeNumber(d.textCount || item.textCount),
      Text_length: safeNumber(d.textLength || d.textCount || item.textCount),
      Word_count: safeNumber(d.wordCount || item.wordCount),
      Reading_time: safeNumber(d.readingTime || item.readingTime)
    },
    Dates: {
      Created: d.createDate || item.createDate || null,
      Uploaded: d.uploadDate || null,
      Updated: item.updateDate || null
    }
  });
}

function pickResult(type, data) {
  const body = data?.body || {};
  let items = [];
  let total = 0;

  if (type === "artworks") {
    items = body.illustManga?.data || [];
    total = safeNumber(body.illustManga?.total) || items.length;
  }

  if (type === "novels") {
    items = body.novel?.data || body.novels?.data || [];
    total = safeNumber(body.novel?.total || body.novels?.total) || items.length;
  }

  if (!items.length) {
    return {
      Total: total,
      Count: 0,
      Picked_index: null,
      Item: null
    };
  }

  let index = 0;

  if (typeof PICK_INDEX === "number") {
    index = Math.max(0, Math.min(PICK_INDEX, items.length - 1));
  } else if (RANDOM_PICK) {
    index = Math.floor(Math.random() * items.length);
  }

  return {
    Total: total,
    Count: items.length,
    Picked_index: index,
    Item: items[index]
  };
}

async function main() {
  const started = Date.now();

  validateType(TYPE);

  const selectedPage = getSelectedPage();

  await getHome();

  const search = await searchPixiv(TYPE, QUERY, selectedPage);

  if (isChallenge(search.Data)) {
    console.log(JSON.stringify({
      Status: false,
      Code: search.Code,
      Input: QUERY,
      Type: TYPE,
      Page: selectedPage,
      Error: "Kena Cloudflare challenge",
      Warning: "Isi env PIXIV_COOKIE dengan cookie valid dari browser"
    }, null, 2));
    return;
  }

  const picked = pickResult(TYPE, search.Data);

  if (!picked.Item) {
    console.log(JSON.stringify({
      Status: false,
      Code: search.Code,
      Input: QUERY,
      Type: TYPE,
      Page: selectedPage,
      Random_pick: RANDOM_PICK,
      Random_page: RANDOM_PAGE,
      Total: picked.Total,
      Page_result_count: picked.Count,
      Result: null,
      Error: "Hasil tidak ditemukan"
    }, null, 2));
    return;
  }

  let result;
  let downloaded = null;

  if (TYPE === "artworks") {
    const detail = await getArtworkDetail(picked.Item.id);
    result = normalizeArtwork(picked.Item, detail);

    if (DOWNLOAD_IMAGE && Array.isArray(result.Images) && result.Images.length) {
      downloaded = await downloadAllPixivImages(result.Images, result.Id);
    }
  }

  if (TYPE === "novels") {
    const detail = await getNovelDetail(picked.Item.id);
    result = normalizeNovel(picked.Item, detail);

    if (DOWNLOAD_COVER && result.Cover) {
      downloaded = await downloadAllPixivImages([result.Cover], result.Id);
    }
  }

  console.log(JSON.stringify(removeUndefined({
    Status: true,
    Code: search.Code,
    Input: QUERY,
    Available_types: AVAILABLE_TYPES,
    Selected_type: TYPE,
    Page: selectedPage,
    Random_page: RANDOM_PAGE,
    Max_random_page: MAX_RANDOM_PAGE,
    Random_pick: RANDOM_PICK,
    Picked_index: picked.Picked_index,
    Page_result_count: picked.Count,
    Total_search: picked.Total,
    Result: result,
    Downloaded: downloaded,
    Note: "Tetap ambil 1 author/result saja. Untuk bot WA, kirim Downloaded.Files yang Status true sebagai image dan Result sebagai caption.",
    Time_ms: Date.now() - started
  }), null, 2));
}

main().catch(error => {
  console.log(JSON.stringify({
    Status: false,
    Code: 500,
    Input: QUERY,
    Available_types: AVAILABLE_TYPES,
    Selected_type: TYPE,
    Error: error.message
  }, null, 2));
});

/*
CARA ATUR CONFIG

QUERY
- Isi keyword/tag yang mau dicari.
- Contoh:
  const QUERY = "Sakura";
  const QUERY = "Hinata Hyuga";
  const QUERY = "Naruto";

TYPE
- Pilih jenis hasil yang mau diambil.
- Type yang tersedia:
  artworks = ambil 1 artwork/gambar
  novels   = ambil 1 novel
- Contoh:
  const TYPE = "artworks";
  const TYPE = "novels";

PAGE
- Halaman search Pixiv yang dipakai kalau RANDOM_PAGE false.
- Contoh:
  const PAGE = 1;

RANDOM_PAGE
- true  = halaman search akan diacak dari 1 sampai MAX_RANDOM_PAGE.
- false = selalu pakai PAGE.
- Contoh:
  const RANDOM_PAGE = true;

MAX_RANDOM_PAGE
- Batas halaman random.
- Contoh:
  const MAX_RANDOM_PAGE = 5;
  Artinya page random antara 1 sampai 5.

RANDOM_PICK
- true  = ambil 1 item random dari hasil search page terpilih.
- false = ambil item pertama atau PICK_INDEX.
- Tetap cuma ambil 1 result/author saja.
- Contoh:
  const RANDOM_PICK = true;

PICK_INDEX
- Pakai index tertentu dari hasil search.
- null = ikut RANDOM_PICK.
- 0    = hasil pertama.
- 5    = hasil ke-6.
- Contoh:
  const PICK_INDEX = null;

DOWNLOAD_IMAGE
- Khusus TYPE artworks.
- true  = semua gambar di Result.Images akan didownload.
- false = hanya ambil URL image tanpa download.

MAX_DOWNLOAD_IMAGES
- Batas maksimal gambar yang akan didownload dari 1 artwork.
- Ini penting agar server/bot tidak hang kalau artwork punya banyak halaman.
- Contoh:
  const MAX_DOWNLOAD_IMAGES = 5;
  const MAX_DOWNLOAD_IMAGES = 10;

DOWNLOAD_DELAY_MS
- Delay antar download image.
- Gunanya agar request tidak brutal dan lebih aman dari rate limit.
- Contoh:
  const DOWNLOAD_DELAY_MS = 800;
  const DOWNLOAD_DELAY_MS = 1500;

DOWNLOAD_RETRY
- Jumlah retry kalau download gagal karena status sementara seperti 429/500/503.
- Contoh:
  const DOWNLOAD_RETRY = 2;

DOWNLOAD_COVER
- Khusus TYPE novels.
- true  = cover novel didownload ke folder OUTPUT_DIR.
- false = hanya ambil URL cover.

OUTPUT_DIR
- Folder tempat menyimpan hasil download image/cover.
- Folder akan dibuat otomatis kalau belum ada.
- Contoh:
  const OUTPUT_DIR = "./pixiv-downloads";

COOKIE / PIXIV_COOKIE
- Opsional.
- Dipakai kalau Pixiv kena Cloudflare, login, atau butuh session.
- Bisa isi lewat environment:
  PIXIV_COOKIE="PHPSESSID=xxx; cf_clearance=xxx" node pixiv.mjs
- Kalau tidak butuh, biarkan:
  const COOKIE = process.env.PIXIV_COOKIE || "";

MODE
- Filter mode Pixiv.
- all  = semua
- safe = safe mode
- r18  = konten R-18 jika session/cookie mengizinkan.
- Contoh:
  const MODE = "all";

ORDER
- Urutan hasil.
- date_d = terbaru
- date   = terlama
- popular_d = populer, biasanya butuh Pixiv Premium/login.
- Contoh:
  const ORDER = "date_d";

S_MODE
- Mode pencarian tag.
- s_tag      = search berdasarkan tag
- s_tag_full = tag exact/full match
- s_tc       = search title/caption
- Contoh:
  const S_MODE = "s_tag";

OUTPUT UNTUK BOT WA
- Tetap hanya ambil 1 result/author.
- Kalau TYPE artworks dan DOWNLOAD_IMAGE true:
  Downloaded.Files berisi semua file gambar dari artwork tersebut.
- Kirim file yang Status true:
  Downloaded.Files[0].File
  Downloaded.Files[1].File
  dst.
- Caption bisa ambil dari:
  Result.Title
  Result.Author
  Result.Username
  Result.Description
  Result.Tags
  Result.Stats

CATATAN IMAGE PIXIV
- URL i.pximg.net biasanya wajib pakai header Referer:
  referer: "https://www.pixiv.net/"
- Karena itu gambar didownload dulu ke file agar lebih aman untuk bot WA/Telegram.
*/