import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const BASE = "https://www.azlyrics.com";
const QUERY = process.argv.slice(2).join(" ") || "Duvet";

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const jar = new CookieJar();

const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  timeout: 30000,
  decompress: true,
  validateStatus: () => true,
  headers: {
    "user-agent": UA,
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
  }
}));

function cleanText(text = "") {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.trim().replace(/[ \t]{2,}/g, " "))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeHtml(html = "") {
  const $ = cheerio.load(`<div id="x">${html}</div>`);
  return $("#x").text();
}

function printPlain(data) {
  if (!data.Status) {
    console.log(`Title  : -
Artist : -

Lirik:
${data.Error || data.Message || "Lirik tidak ditemukan"}`);
    return;
  }

  console.log(`Title  : ${data.Top_Result.Title}
Artist : ${data.Top_Result.Artist}

Lirik:
${data.Result}`);
}

function getGeoToken(js = "") {
  const match = js.match(/name["']\s*,\s*["']x["'][\s\S]*?value["']\s*,\s*["']([^"']+)/i);
  if (match) return match[1];

  const fallback = js.match(/setAttribute\(["']value["'],\s*["']([^"']+)["']\)/i);
  if (fallback) return fallback[1];

  return null;
}

function parseAutocomplete(text = "") {
  const match = text.match(/^"(.+?)"\s*-\s*(.+)$/);
  return {
    title: match?.[1]?.trim() || null,
    artist: match?.[2]?.trim() || null
  };
}

function parseLyrics(html = "") {
  const titleMatch = html.match(/SongName\s*=\s*"([^"]+)"/);
  const artistMatch = html.match(/ArtistName\s*=\s*"([^"]+)"/);

  const lyricMatch = html.match(/<!--\s*Usage of azlyrics\.com content[\s\S]*?-->\s*([\s\S]*?)<\/div>/i);
  const rawLyrics = lyricMatch ? lyricMatch[1] : "";

  const normalizedLyrics = rawLyrics
    .replace(/\r?\n/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "");

  const lyrics = cleanText(decodeHtml(normalizedLyrics));

  return {
    title: titleMatch?.[1] || null,
    artist: artistMatch?.[1] || null,
    lyrics
  };
}

async function getToken() {
  await client.get(BASE, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  const geo = await client.get(`${BASE}/geo.js`, {
    headers: {
      accept: "*/*",
      referer: `${BASE}/`
    }
  });

  if (geo.status !== 200) {
    throw new Error(`Gagal ambil geo.js: ${geo.status}`);
  }

  const token = getGeoToken(String(geo.data));

  if (!token) {
    throw new Error("Token x tidak ditemukan dari geo.js");
  }

  return token;
}

async function searchTop(query) {
  const token = await getToken();

  const url = `${BASE}/suggest/?q=${encodeURIComponent(query)}&x=${encodeURIComponent(token)}`;

  const res = await client.get(url, {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "x-requested-with": "XMLHttpRequest",
      referer: `${BASE}/`
    }
  });

  if (res.status !== 200) {
    throw new Error(`Search gagal: ${res.status}`);
  }

  let json;

  try {
    json = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
  } catch {
    throw new Error("Response search bukan JSON valid");
  }

  const top = json?.songs?.[0] || json?.lyrics?.[0];

  if (!top?.url) {
    return null;
  }

  return {
    url: top.url.replace(/\\\//g, "/"),
    autocomplete: top.autocomplete,
    ...parseAutocomplete(top.autocomplete)
  };
}

async function getLyrics(url) {
  const res = await client.get(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      referer: `${BASE}/`
    }
  });

  if (res.status !== 200) {
    throw new Error(`Gagal ambil halaman lyrics: ${res.status}`);
  }

  const parsed = parseLyrics(String(res.data));

  if (!parsed.lyrics) {
    throw new Error("Lirik tidak ditemukan atau struktur halaman berubah");
  }

  return parsed;
}

async function azlyrics(query = QUERY) {
  const top = await searchTop(query);

  if (!top) {
    return {
      Status: false,
      Code: 404,
      Input: query,
      Message: "Hasil tidak ditemukan",
      Result: null
    };
  }

  const lyrics = await getLyrics(top.url);

  return {
    Status: true,
    Code: 200,
    Input: query,
    Top_Result: {
      Title: lyrics.title || top.title || "-",
      Artist: lyrics.artist || top.artist || "-"
    },
    Result: lyrics.lyrics
  };
}

azlyrics()
  .then(printPlain)
  .catch(err => {
    printPlain({
      Status: false,
      Code: err.response?.status || 500,
      Input: QUERY,
      Error: err.message
    });
  });