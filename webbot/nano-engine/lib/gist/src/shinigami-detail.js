import axios from "axios";

const BASE_URL = "https://api.shngm.io";
const WEB_URL = "https://g.shinigami.asia";

const DETAIL_INPUT = "https://g.shinigami.asia/series/fc727dec-d1f5-43e8-a77d-37382f636659";

const PAGE = 1;
const PAGE_SIZE = 24;
const SORT_BY = "chapter_number";
const SORT_ORDER = "desc";
const TIMEOUT = 30000;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": `${WEB_URL}/`,
    "Origin": WEB_URL,
    "Content-Type": "application/json"
  },
  validateStatus: () => true
});

function getUuid(input) {
  const text = String(input || "").trim();
  const uuid = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return uuid ? uuid[0] : null;
}

function makeSlug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickTaxonomy(taxonomy, key) {
  if (!taxonomy || !Array.isArray(taxonomy[key])) return [];
  return taxonomy[key].map(v => v.name).filter(Boolean);
}

function makeSeriesUrl(mangaId) {
  return mangaId ? `${WEB_URL}/series/${mangaId}` : null;
}

function makeChapterUrl(chapterId) {
  return chapterId ? `${WEB_URL}/chapter/${chapterId}` : null;
}

function makeChapterName(item) {
  const number = item.chapter_number ?? null;
  const title = String(item.chapter_title || "").trim();

  if (number && title) return `Chapter ${number} - ${title}`;
  if (number) return `Chapter ${number}`;
  if (title) return title;

  return null;
}

function formatDetail(item) {
  return {
    Title: item.title || null,
    Slug: makeSlug(item.title) || null,
    Url: makeSeriesUrl(item.manga_id),
    Manga_id: item.manga_id || null,
    Alternative_title: item.alternative_title || null,
    Description: item.description || null,
    Release_year: item.release_year || null,
    Country: item.country_id || null,
    Status: item.status ?? null,
    Rating: item.user_rate ?? null,
    View_count: item.view_count ?? null,
    Bookmark_count: item.bookmark_count ?? null,
    Cover: item.cover_image_url || null,
    Cover_portrait: item.cover_portrait_url || null,
    Author: pickTaxonomy(item.taxonomy, "Author"),
    Artist: pickTaxonomy(item.taxonomy, "Artist"),
    Format: pickTaxonomy(item.taxonomy, "Format"),
    Genre: pickTaxonomy(item.taxonomy, "Genre"),
    Type: pickTaxonomy(item.taxonomy, "Type"),
    Latest_chapter: {
      Number: item.latest_chapter_number ?? null,
      Id: item.latest_chapter_id || null,
      Url: makeChapterUrl(item.latest_chapter_id),
      Time: item.latest_chapter_time || null
    },
    Updated_at: item.updated_at || null
  };
}

function formatChapter(item) {
  return {
    Title: makeChapterName(item),
    Chapter_number: item.chapter_number ?? null,
    Chapter_title: item.chapter_title || null,
    Chapter_id: item.chapter_id || null,
    Url: makeChapterUrl(item.chapter_id),
    Thumbnail: item.thumbnail_image_url || null,
    View_count: item.view_count ?? null,
    Release_date: item.release_date || null
  };
}

async function getMangaDetail(mangaId) {
  const res = await client.get(`/v1/manga/detail/${mangaId}`);

  return {
    code: res.status,
    json: res.data
  };
}

async function getChapterList(mangaId) {
  const res = await client.get(`/v1/chapter/${mangaId}/list`, {
    params: {
      page: PAGE,
      page_size: PAGE_SIZE,
      sort_by: SORT_BY,
      sort_order: SORT_ORDER
    }
  });

  return {
    code: res.status,
    json: res.data
  };
}

async function detailManga() {
  const start = Date.now();
  const mangaId = getUuid(DETAIL_INPUT);

  if (!mangaId) {
    console.log(JSON.stringify({
      Status: false,
      Code: 400,
      Input: DETAIL_INPUT,
      Error: "Manga ID tidak ditemukan dari URL/input"
    }, null, 2));
    return;
  }

  try {
    const detail = await getMangaDetail(mangaId);

    if (!detail.json || typeof detail.json !== "object") {
      console.log(JSON.stringify({
        Status: false,
        Code: detail.code,
        Input: DETAIL_INPUT,
        Manga_id: mangaId,
        Step: "detail",
        Error: "Response detail bukan JSON",
        Raw: String(detail.json).slice(0, 500),
        Time_ms: Date.now() - start
      }, null, 2));
      return;
    }

    const chapters = await getChapterList(mangaId);

    if (!chapters.json || typeof chapters.json !== "object") {
      console.log(JSON.stringify({
        Status: false,
        Code: chapters.code,
        Input: DETAIL_INPUT,
        Manga_id: mangaId,
        Step: "chapter_list",
        Error: "Response chapter list bukan JSON",
        Raw: String(chapters.json).slice(0, 500),
        Time_ms: Date.now() - start
      }, null, 2));
      return;
    }

    const chapterResult = Array.isArray(chapters.json.data)
      ? chapters.json.data.map(formatChapter)
      : [];

    console.log(JSON.stringify({
      Status: detail.json.retcode === 0 && chapters.json.retcode === 0,
      Code: detail.code,
      Input: DETAIL_INPUT,
      Manga_id: mangaId,
      Message: detail.json.message || null,
      Result: detail.json.data ? formatDetail(detail.json.data) : null,
      Chapters: {
        Page: chapters.json.meta?.page ?? PAGE,
        Page_size: chapters.json.meta?.page_size ?? PAGE_SIZE,
        Total_page: chapters.json.meta?.total_page ?? null,
        Total_record: chapters.json.meta?.total_record ?? null,
        Sort_by: SORT_BY,
        Sort_order: SORT_ORDER,
        Total: chapterResult.length,
        Result: chapterResult
      },
      Request_id: {
        Detail: detail.json.meta?.request_id ?? null,
        Chapter_list: chapters.json.meta?.request_id ?? null
      },
      Time_ms: Date.now() - start
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: DETAIL_INPUT,
      Manga_id: mangaId,
      Error: err.message,
      Time_ms: Date.now() - start
    }, null, 2));
  }
}

detailManga();

/*
CARA SETTING DETAIL + LIST CHAPTER

1. Ganti manga yang mau diambil:
const DETAIL_INPUT = "https://g.shinigami.asia/series/965b599c-54d5-4f91-820a-750d8f252a04";

Bisa juga pakai manga_id langsung:
const DETAIL_INPUT = "965b599c-54d5-4f91-820a-750d8f252a04";

2. Atur halaman list chapter:
const PAGE = 1;

Page 1 biasanya berisi chapter terbaru jika SORT_ORDER = "desc".
Page 2 berarti lanjut ke daftar chapter yang lebih lama.

3. Atur jumlah chapter per request:
const PAGE_SIZE = 24;

Contoh:
PAGE_SIZE = 10 berarti ambil 10 chapter.
PAGE_SIZE = 24 berarti ambil 24 chapter.

4. Atur urutan chapter:
const SORT_ORDER = "desc";

desc = chapter terbaru ke lama.
asc = chapter lama ke terbaru.

5. SORT_BY biarkan seperti ini:
const SORT_BY = "chapter_number";

Karena chapter paling enak diurutkan berdasarkan nomor chapter.

6. Output chapter sudah otomatis punya URL baca:
Url: "https://g.shinigami.asia/chapter/<chapter_id>"

7. Kalau ada chapter baru di web, kode akan mengikuti update saat script dijalankan ulang.
*/