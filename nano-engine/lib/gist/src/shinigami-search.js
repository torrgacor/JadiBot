import axios from "axios";

const BASE_URL = "https://api.shngm.io";
const WEB_URL = "https://g.shinigami.asia";
const QUERY = "comedy";
const PAGE = 1;
const PAGE_SIZE = 5;
const TIMEOUT = 30000;

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

async function searchManga() {
  const start = Date.now();

  try {
    const res = await axios.get(`${BASE_URL}/v1/manga/list`, {
      timeout: TIMEOUT,
      params: {
        page: PAGE,
        page_size: PAGE_SIZE,
        q: QUERY
      },
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

    const json = res.data;

    if (!json || typeof json !== "object") {
      console.log(JSON.stringify({
        Status: false,
        Code: res.status,
        Input: QUERY,
        Error: "Response bukan JSON",
        Raw: String(res.data).slice(0, 500),
        Time_ms: Date.now() - start
      }, null, 2));
      return;
    }

    const result = Array.isArray(json.data) ? json.data.map(item => {
      const slug = makeSlug(item.title);
      const url = item.manga_id ? `${WEB_URL}/series/${item.manga_id}` : null;

      return {
        Title: item.title || null,
        Slug: slug || null,
        Url: url,
        Manga_id: item.manga_id || null,
        Alternative_title: item.alternative_title || null,
        Description: item.description || null,
        Release_year: item.release_year || null,
        Country: item.country_id || null,
        Status: item.status ?? null,
        Rating: item.user_rate ?? null,
        View_count: item.view_count ?? null,
        Bookmark_count: item.bookmark_count ?? null,
        Latest_chapter: item.latest_chapter_number ?? null,
        Latest_chapter_id: item.latest_chapter_id || null,
        Latest_chapter_time: item.latest_chapter_time || null,
        Cover: item.cover_image_url || null,
        Cover_portrait: item.cover_portrait_url || null,
        Author: pickTaxonomy(item.taxonomy, "Author"),
        Artist: pickTaxonomy(item.taxonomy, "Artist"),
        Format: pickTaxonomy(item.taxonomy, "Format"),
        Genre: pickTaxonomy(item.taxonomy, "Genre"),
        Type: pickTaxonomy(item.taxonomy, "Type"),
        Updated_at: item.updated_at || null,
        Created_at: item.created_at || null
      };
    }) : [];

    console.log(JSON.stringify({
      Status: json.retcode === 0,
      Code: res.status,
      Input: QUERY,
      Page: json.meta?.page ?? PAGE,
      Page_size: json.meta?.page_size ?? PAGE_SIZE,
      Total_page: json.meta?.total_page ?? null,
      Total_record: json.meta?.total_record ?? null,
      Request_id: json.meta?.request_id ?? null,
      Message: json.message || null,
      Total: result.length,
      Result: result,
      Time_ms: Date.now() - start
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: QUERY,
      Error: err.message,
      Time_ms: Date.now() - start
    }, null, 2));
  }
}

searchManga();

/*
CARA SETTING SEARCH

1. Ganti keyword pencarian:
const QUERY = "comedy";

Contoh lain:
const QUERY = "romance";
const QUERY = "action";
const QUERY = "eleceed";
const QUERY = "solo leveling";

2. Atur halaman pencarian:
const PAGE = 1;

PAGE = 1 berarti halaman pertama.
PAGE = 2 berarti halaman kedua.
PAGE = 3 berarti halaman ketiga.

3. Atur jumlah hasil per halaman:
const PAGE_SIZE = 5;

PAGE_SIZE = 5 berarti ambil 5 manga.
PAGE_SIZE = 10 berarti ambil 10 manga.
PAGE_SIZE = 24 berarti ambil 24 manga.

4. Output Url otomatis dibuat dari manga_id:
https://g.shinigami.asia/series/<manga_id>

5. Kalau data di web/API update, hasil search juga ikut update saat script dijalankan ulang.
*/