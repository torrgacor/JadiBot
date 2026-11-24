import axios from "axios";
import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import path from "node:path";

const CONFIG = {
  BaseUrl: "https://pinedrama.com",
  Query: "Romance",
  SaveFile: "./pinedrama-search.json",
  CacheFile: "./pinedrama-search-cache.json",
  Timeout: 30000
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

function absUrl(url) {
  if (!url) return null;

  try {
    return new URL(url, CONFIG.BaseUrl).href;
  } catch {
    return url;
  }
}

function slugFromUrl(url) {
  if (!url) return null;

  const cleanUrl = url.split("?")[0].replace(/\/$/, "");
  return cleanUrl.split("/").pop() || null;
}

function searchUrl() {
  const query = String(CONFIG.Query || "").trim();

  if (!query) {
    return `${CONFIG.BaseUrl}/search`;
  }

  return `${CONFIG.BaseUrl}/search?q=${encodeURIComponent(query)}`;
}

function uniqueBy(items, key) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const value = item[key];

    if (!value || seen.has(value)) continue;

    seen.add(value);
    result.push(item);
  }

  return result;
}

async function readCache() {
  try {
    return JSON.parse(await fs.readFile(CONFIG.CacheFile, "utf8"));
  } catch {
    return null;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(path.resolve(file)), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function fetchSearch() {
  const url = searchUrl();

  const res = await axios.get(url, {
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      referer: CONFIG.BaseUrl + "/search",
      "user-agent": UA
    }
  });

  if (res.status !== 200) {
    throw new Error(`Gagal membuka search: HTTP ${res.status}`);
  }

  return {
    url,
    html: res.data
  };
}

function parseHotGenres($) {
  const items = [];

  $("main")
    .find('a[href*="/genres/"]')
    .each((_, el) => {
      const a = $(el);
      const name = clean(a.text());
      const url = absUrl(a.attr("href"));

      if (!name || !url) return;
      if (name.match(/^\d+$/)) return;
      if (name === "...") return;

      items.push({
        name,
        slug: slugFromUrl(url),
        url
      });
    });

  return uniqueBy(items, "url");
}

function parseDramaCard($, el, section) {
  const card = $(el);
  const dramaLink = card.find('a[href*="/dramas/"]').first();
  const genreLink = card.find('a[href*="/genres/"]').first();
  const img = card.find("img").first();

  const title = clean(dramaLink.text()) || clean(img.attr("alt"));
  const url = absUrl(dramaLink.attr("href"));
  const image = absUrl(img.attr("src"));
  const genre = clean(genreLink.text()) || null;
  const text = clean(card.text());
  const ratingMatch = text.match(/\b\d(?:\.\d)?\b/);

  if (!title || !url) return null;

  return {
    section,
    title,
    slug: slugFromUrl(url),
    url,
    image,
    genre,
    rating: ratingMatch ? ratingMatch[0] : null
  };
}

function parseMainSearchResults($) {
  const items = [];
  const heading = clean($("#short_drama").text()) || null;
  const area = $("#short_drama").parent();

  area.find('a[href*="/dramas/"]').each((_, el) => {
    const card = $(el).closest("div");
    const item = parseDramaCard($, card, "Search Results");

    if (item) items.push(item);
  });

  return {
    title: heading,
    total: uniqueBy(items, "url").length,
    items: uniqueBy(items, "url")
  };
}

function parseSections($) {
  const sections = [];

  $("h2, h3, div").each((_, heading) => {
    const title = clean($(heading).text());

    if (!title) return;
    if (!["New Short Dramas", "Hot Genre"].includes(title)) return;

    const area = $(heading).parent();
    const items = [];

    area.find('a[href*="/dramas/"]').each((__, a) => {
      const card = $(a).closest("div");
      const item = parseDramaCard($, card, title);

      if (item) items.push(item);
    });

    const unique = uniqueBy(items, "url");

    if (unique.length) {
      sections.push({
        name: title,
        total: unique.length,
        items: unique
      });
    }
  });

  return uniqueBy(sections, "name");
}

function parseAllDramas(searchResult, sections) {
  const items = [];

  for (const item of searchResult.items || []) {
    items.push(item);
  }

  for (const section of sections) {
    for (const item of section.items || []) {
      items.push(item);
    }
  }

  return uniqueBy(items, "url");
}

function compareUpdates(oldData, newData) {
  const oldItems = oldData?.Result?.All || [];
  const newItems = newData?.Result?.All || [];

  const oldSlugs = new Set(oldItems.map(item => item.slug).filter(Boolean));
  const newItemsOnly = newItems.filter(item => item.slug && !oldSlugs.has(item.slug));

  const bySection = {};

  for (const item of newItemsOnly) {
    const key = item.section || "Search";
    if (!bySection[key]) bySection[key] = [];
    bySection[key].push(item);
  }

  return {
    HasUpdate: newItemsOnly.length > 0,
    TotalNew: newItemsOnly.length,
    NewItems: newItemsOnly,
    NewBySection: bySection
  };
}

async function scrapeSearch() {
  const cache = await readCache();
  const { url, html } = await fetchSearch();
  const $ = cheerio.load(html);

  const searchResult = parseMainSearchResults($);
  const sections = parseSections($);
  const hotGenres = parseHotGenres($);
  const all = parseAllDramas(searchResult, sections);

  const data = {
    Status: true,
    Code: 200,
    Input: url,
    Query: CONFIG.Query,
    UpdatedAt: new Date().toISOString(),
    Result: {
      Search: searchResult,
      HotGenres: hotGenres,
      Sections: sections,
      All: all
    }
  };

  data.Update = compareUpdates(cache, data);

  await writeJson(CONFIG.SaveFile, data);
  await writeJson(CONFIG.CacheFile, data);

  return data;
}

scrapeSearch()
  .then(output)
  .catch(error => {
    output({
      Status: false,
      Code: 500,
      Input: searchUrl(),
      Query: CONFIG.Query,
      Result: null,
      Error: error.message
    });
  });