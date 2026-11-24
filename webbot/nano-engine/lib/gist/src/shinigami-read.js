import axios from "axios";

const BASE_URL = "https://api.shngm.io";
const WEB_URL = "https://g.shinigami.asia";

const READ_INPUT = "https://g.shinigami.asia/chapter/0a338442-9b00-4c4a-b80e-93ce34cd0cd0";

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

function isSeriesUrl(input) {
  return String(input || "").includes("/series/");
}

function isChapterUrl(input) {
  return String(input || "").includes("/chapter/");
}

function makeSeriesUrl(mangaId) {
  return mangaId ? `${WEB_URL}/series/${mangaId}` : null;
}

function makeChapterUrl(chapterId) {
  return chapterId ? `${WEB_URL}/chapter/${chapterId}` : null;
}

function makeChapterTitle(data) {
  const number = data.chapter_number ?? null;
  const title = String(data.chapter_title || "").trim();

  if (number && title) return `Chapter ${number} - ${title}`;
  if (number) return `Chapter ${number}`;
  if (title) return title;

  return null;
}

function makeImages(data) {
  const base = data.base_url || data.base_url_low || null;
  const chapter = data.chapter || {};
  const path = chapter.path || "";
  const files = Array.isArray(chapter.data) ? chapter.data : [];

  if (!base || !path || !files.length) return [];

  return files.map((file, index) => ({
    Page: index + 1,
    File: file,
    Url: `${base}${path}${file}`
  }));
}

async function getLatestChapterIdFromSeries(mangaId) {
  const res = await client.get(`/v1/manga/detail/${mangaId}`);
  const json = res.data;

  if (!json || typeof json !== "object") {
    return {
      ok: false,
      code: res.status,
      error: "Response detail manga bukan JSON",
      raw: String(res.data).slice(0, 500)
    };
  }

  if (json.retcode !== 0 || !json.data) {
    return {
      ok: false,
      code: res.status,
      error: json.message || "Gagal mengambil detail manga",
      raw: json
    };
  }

  return {
    ok: true,
    code: res.status,
    manga: json.data,
    chapterId: json.data.latest_chapter_id || null
  };
}

async function getChapterDetail(chapterId) {
  const res = await client.get(`/v1/chapter/detail/${chapterId}`);

  return {
    code: res.status,
    json: res.data
  };
}

async function readChapter() {
  const start = Date.now();
  const inputId = getUuid(READ_INPUT);

  if (!inputId) {
    console.log(JSON.stringify({
      Status: false,
      Code: 400,
      Input: READ_INPUT,
      Error: "UUID tidak ditemukan dari input"
    }, null, 2));
    return;
  }

  let mangaId = null;
  let chapterId = null;
  let source = null;
  let mangaData = null;

  try {
    if (isSeriesUrl(READ_INPUT)) {
      mangaId = inputId;
      source = "series_url_latest_chapter";

      const latest = await getLatestChapterIdFromSeries(mangaId);

      if (!latest.ok) {
        console.log(JSON.stringify({
          Status: false,
          Code: latest.code,
          Input: READ_INPUT,
          Source: source,
          Manga_id: mangaId,
          Error: latest.error,
          Raw: latest.raw ?? null,
          Time_ms: Date.now() - start
        }, null, 2));
        return;
      }

      mangaData = latest.manga;
      chapterId = latest.chapterId;

      if (!chapterId) {
        console.log(JSON.stringify({
          Status: false,
          Code: latest.code,
          Input: READ_INPUT,
          Source: source,
          Manga_id: mangaId,
          Error: "latest_chapter_id tidak ditemukan di detail manga",
          Time_ms: Date.now() - start
        }, null, 2));
        return;
      }
    } else if (isChapterUrl(READ_INPUT)) {
      chapterId = inputId;
      source = "chapter_url";
    } else {
      chapterId = inputId;
      source = "chapter_id";
    }

    const { code, json } = await getChapterDetail(chapterId);

    if (!json || typeof json !== "object") {
      console.log(JSON.stringify({
        Status: false,
        Code: code,
        Input: READ_INPUT,
        Source: source,
        Manga_id: mangaId,
        Chapter_id: chapterId,
        Error: "Response chapter bukan JSON",
        Raw: String(json).slice(0, 500),
        Time_ms: Date.now() - start
      }, null, 2));
      return;
    }

    const data = json.data || {};
    const images = makeImages(data);
    const finalMangaId = data.manga_id || mangaId || null;
    const finalChapterId = data.chapter_id || chapterId;

    console.log(JSON.stringify({
      Status: json.retcode === 0,
      Code: code,
      Input: READ_INPUT,
      Source: source,
      Manga_title: mangaData?.title || null,
      Series_url: makeSeriesUrl(finalMangaId),
      Read_url: makeChapterUrl(finalChapterId),
      Title: makeChapterTitle(data),
      Manga_id: finalMangaId,
      Chapter_id: finalChapterId,
      Chapter_number: data.chapter_number ?? null,
      Chapter_title: data.chapter_title || null,
      Thumbnail: data.thumbnail_image_url || null,
      View_count: data.view_count ?? null,
      Prev_chapter_id: data.prev_chapter_id || null,
      Prev_chapter_number: data.prev_chapter_number ?? null,
      Prev_chapter_url: makeChapterUrl(data.prev_chapter_id),
      Next_chapter_id: data.next_chapter_id || null,
      Next_chapter_number: data.next_chapter_number ?? null,
      Next_chapter_url: makeChapterUrl(data.next_chapter_id),
      Release_date: data.release_date || null,
      Created_at: data.created_at || null,
      Updated_at: data.updated_at || null,
      Base_url: data.base_url || null,
      Base_url_low: data.base_url_low || null,
      Path: data.chapter?.path || null,
      Total_pages: images.length,
      Images: images,
      Request_id: json.meta?.request_id ?? null,
      Message: json.message || null,
      Time_ms: Date.now() - start
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: READ_INPUT,
      Source: source,
      Manga_id: mangaId,
      Chapter_id: chapterId,
      Error: err.message,
      Time_ms: Date.now() - start
    }, null, 2));
  }
}

readChapter();

/*
CARA SETTING READ_INPUT

1. Baca chapter tertentu pakai URL chapter:
const READ_INPUT = "https://g.shinigami.asia/chapter/4ebbbf6b-2758-4c64-b985-ea7bf65854aa";

2. Baca chapter tertentu pakai chapter_id langsung:
const READ_INPUT = "4ebbbf6b-2758-4c64-b985-ea7bf65854aa";

3. Baca chapter terbaru dari URL series:
const READ_INPUT = "https://g.shinigami.asia/series/965b599c-54d5-4f91-820a-750d8f252a04";

Catatan:
- Kalau input URL chapter atau chapter_id, kode membaca chapter itu langsung.
- Kalau input URL series, kode mengambil latest_chapter_id dari detail manga, lalu membaca chapter terbaru.
- URL series tidak bisa langsung memilih chapter nomor tertentu tanpa endpoint list chapter.
*/