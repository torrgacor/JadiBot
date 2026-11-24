import axios from "axios";
import * as cheerio from "cheerio";
import { createWriteStream } from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const CONFIG = {
  BaseUrl: "https://pinedrama.com",
  Slug: "cooking-my-way-back-to-love",
  Episode: 2,
  Download: true,
  OutputDir: "./downloads",
  Timeout: 30000,
  DownloadTimeout: 120000,
  RetryOn403: 3,
  RetryDelay: 1000
};

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

function clean(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function absUrl(url) {
  if (!url) return null;

  try {
    return new URL(url, CONFIG.BaseUrl).href;
  } catch {
    return url;
  }
}

function getEpisodes() {
  const value = CONFIG.Episode;

  if (Array.isArray(value)) {
    return [...new Set(value.map(Number).filter(n => Number.isInteger(n) && n > 0))];
  }

  const episode = Number(value);

  if (Number.isInteger(episode) && episode > 0) {
    return [episode];
  }

  return [1];
}

async function fetchHtml(url, referer = CONFIG.BaseUrl + "/") {
  const res = await axios.get(url, {
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      referer,
      "user-agent": UA
    }
  });

  if (res.status !== 200) {
    throw new Error(`Gagal membuka ${url}: HTTP ${res.status}`);
  }

  return res.data;
}

function decodeNextText(html) {
  return html
    .replace(/\\u0026/g, "&")
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\u002f/g, "/")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function parseJsonLd($) {
  const items = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();

    try {
      items.push(JSON.parse(raw));
    } catch {}
  });

  return items;
}

function parseStreamUrls(html) {
  const decoded = decodeNextText(html);
  const items = [];
  const regex = /"episode_id"\s*:\s*(\d+)\s*,\s*"url"\s*:\s*"([^"]+)"/g;

  let match;

  while ((match = regex.exec(decoded)) !== null) {
    items.push({
      Episode: Number(match[1]),
      Url: match[2].replace(/\\u0026/g, "&")
    });
  }

  const seen = new Set();

  return items.filter(item => {
    if (seen.has(item.Episode)) return false;
    seen.add(item.Episode);
    return true;
  });
}

function parseEpisodeDetail(html, url, episode) {
  const $ = cheerio.load(html);
  const jsonLd = parseJsonLd($);
  const schema = jsonLd.find(x => x["@type"] === "TVEpisode") || {};
  const title = schema.partOfSeries?.name || clean($("h1").first().text()) || null;
  const episodeTitle = schema.name || null;
  const image = absUrl(schema.image || $('meta[property="og:image"]').attr("content"));
  const description = clean($('meta[name="description"]').attr("content")) || clean(schema.description) || null;

  const genres = [];

  $('a[href*="/genres/"]').each((_, el) => {
    const a = $(el);
    const name = clean(a.text());
    const href = absUrl(a.attr("href"));

    if (!name || !href) return;
    if (genres.some(x => x.url === href)) return;

    genres.push({
      name,
      url: href
    });
  });

  return {
    Title: title,
    Episode_title: episodeTitle,
    Episode: Number(schema.episodeNumber || episode),
    Url: url,
    Image: image,
    Genres: genres,
    Description: description
  };
}

async function getFreshEpisodeData(episode) {
  const detailUrl = `${CONFIG.BaseUrl}/dramas/${CONFIG.Slug}`;
  const episodeUrl = `${CONFIG.BaseUrl}/dramas/${CONFIG.Slug}/ep${episode}`;
  const html = await fetchHtml(episodeUrl, detailUrl);
  const detail = parseEpisodeDetail(html, episodeUrl, episode);
  const streams = parseStreamUrls(html);
  const selected = streams.find(item => item.Episode === episode) || null;

  return {
    detail,
    streams,
    streamUrl: selected?.Url || null
  };
}

function removeFileSafe(file) {
  return fsp.unlink(file).catch(() => {});
}

async function downloadStreamOnce(url, outputPath) {
  const res = await axios.get(url, {
    responseType: "stream",
    timeout: CONFIG.DownloadTimeout,
    validateStatus: () => true,
    headers: {
      accept: "*/*",
      "accept-encoding": "identity;q=1, *;q=0",
      range: "bytes=0-",
      referer: CONFIG.BaseUrl + "/",
      "user-agent": UA
    }
  });

  if (![200, 206].includes(res.status)) {
    res.data?.destroy?.();

    return {
      Status: false,
      StatusCode: res.status,
      Error: `Download stream gagal: HTTP ${res.status}`
    };
  }

  await fsp.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
  await removeFileSafe(outputPath);

  const writer = createWriteStream(outputPath);

  await new Promise((resolve, reject) => {
    res.data.pipe(writer);
    res.data.on("error", reject);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  const stat = await fsp.stat(outputPath);

  return {
    Status: true,
    Path: outputPath,
    Size: stat.size,
    StatusCode: res.status,
    ContentType: res.headers["content-type"] || null,
    ContentLength: res.headers["content-length"] || null
  };
}

async function downloadWithFreshRetry(episode, firstStreamUrl, outputPath) {
  let streamUrl = firstStreamUrl;
  let lastResult = null;
  let refreshed = false;

  for (let attempt = 1; attempt <= CONFIG.RetryOn403 + 1; attempt++) {
    if (!streamUrl) {
      return {
        Status: false,
        Path: null,
        Attempts: attempt - 1,
        Error: "Stream tidak ditemukan atau episode locked"
      };
    }

    const result = await downloadStreamOnce(streamUrl, outputPath);

    if (result.Status) {
      return {
        ...result,
        Attempts: attempt,
        Refreshed: refreshed,
        Stream_url: streamUrl
      };
    }

    lastResult = result;

    if (result.StatusCode !== 403 || attempt > CONFIG.RetryOn403) {
      break;
    }

    await sleep(CONFIG.RetryDelay);

    const fresh = await getFreshEpisodeData(episode);
    streamUrl = fresh.streamUrl;
    refreshed = true;
  }

  return {
    Status: false,
    Path: outputPath,
    Attempts: CONFIG.RetryOn403 + 1,
    Refreshed: refreshed,
    Stream_url: streamUrl,
    Error: lastResult?.Error || "Download gagal"
  };
}

async function processEpisode(episode) {
  const fresh = await getFreshEpisodeData(episode);
  const detail = fresh.detail;
  const streamUrl = fresh.streamUrl;

  let download = null;

  if (CONFIG.Download) {
    const outputPath = path.resolve(CONFIG.OutputDir, `${CONFIG.Slug}-ep${episode}.mp4`);
    download = await downloadWithFreshRetry(episode, streamUrl, outputPath);
  }

  return {
    ...detail,
    Stream_url: download?.Stream_url || streamUrl,
    Download: download
  };
}

async function main() {
  const episodes = getEpisodes();
  const results = [];

  for (const episode of episodes) {
    results.push(await processEpisode(episode));
  }

  return {
    Status: true,
    Code: 200,
    Input: episodes.length === 1
      ? `${CONFIG.BaseUrl}/dramas/${CONFIG.Slug}/ep${episodes[0]}`
      : episodes.map(ep => `${CONFIG.BaseUrl}/dramas/${CONFIG.Slug}/ep${ep}`),
    Slug: CONFIG.Slug,
    Episode: episodes.length === 1 ? episodes[0] : episodes,
    Result: episodes.length === 1 ? results[0] : results
  };
}

main()
  .then(output)
  .catch(error => {
    const episodes = getEpisodes();

    output({
      Status: false,
      Code: 500,
      Input: episodes.length === 1
        ? `${CONFIG.BaseUrl}/dramas/${CONFIG.Slug}/ep${episodes[0]}`
        : episodes.map(ep => `${CONFIG.BaseUrl}/dramas/${CONFIG.Slug}/ep${ep}`),
      Slug: CONFIG.Slug,
      Episode: episodes.length === 1 ? episodes[0] : episodes,
      Result: null,
      Error: error.message
    });
  });

/**
 * ==============================
 * CARA PAKAI
 * ==============================
 *
 * Ambil slug dari URL drama:
 * https://pinedrama.com/dramas/cooking-my-way-back-to-love
 *
 * Masukkan ke CONFIG:
 * Slug: "cooking-my-way-back-to-love"
 *
 * Pilih episode:
 * Episode: 1
 *
 * Banyak episode:
 * Episode: [1, 2, 3]
 *
 * Jika Download true, file otomatis tersimpan ke OutputDir.
 *
 * Jika download kena 403, script otomatis scrape ulang episode page
 * untuk ambil Stream_url fresh lalu retry download.
 *
 * Hasil stream ada di:
 * Result.Stream_url
 *
 * Hasil download ada di:
 * Result.Download
 * ==============================
 */