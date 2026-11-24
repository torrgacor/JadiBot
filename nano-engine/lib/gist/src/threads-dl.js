import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const INPUT_URL = "https://www.threads.com/@lovingerie_soft/post/DZc1pluiA6j";
const BASE_URL = "https://threadster.app";

const jar = new CookieJar();

const client = wrapper(axios.create({
  baseURL: BASE_URL,
  jar,
  withCredentials: true,
  timeout: 60000,
  maxRedirects: 5,
  validateStatus: () => true,
  headers: {
    "cache-control": "max-age=0",
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": `"Android"`,
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "navigate",
    "sec-fetch-user": "?1",
    "sec-fetch-dest": "document",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "origin": "null",
    "priority": "u=0, i"
  }
}));

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function absolutize(url) {
  if (!url) return null;
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return BASE_URL + url;
  return url;
}

function parseResult(html) {
  const $ = cheerio.load(html);
  const title = cleanText($("title").first().text());
  const items = [];

  $(".download_item").each((index, el) => {
    const item = $(el);
    const video = item.find("video").first().attr("src");
    const thumb = item.find(".download__item__thumb img").first().attr("src");
    const download = item.find("a.download__item__download_btn").first().attr("href");
    const author = cleanText(item.find(".download__item__profile_pic span").first().text()).replace(/^@/, "");
    const profile = item.find(".download__item__profile_pic img").first().attr("src");
    const caption = cleanText(item.find(".download__item__caption__text").first().text());
    const tab = cleanText($(`.download__items_tabs__item[data-index="${index}"]`).first().text());
    const type = video ? "video" : "image";

    if (download || video || thumb) {
      items.push({
        Index: index + 1,
        Type: tab.toLowerCase().includes("video") ? "video" : type,
        Author: author || null,
        Caption: caption || null,
        Thumbnail: absolutize(thumb || video),
        Profile: absolutize(profile),
        Result_url: absolutize(download || video || thumb)
      });
    }
  });

  return {
    Title: title || null,
    Total: items.length,
    Result: items
  };
}

async function main() {
  const started = Date.now();

  try {
    await client.get("/");

    const body = new URLSearchParams({
      url: INPUT_URL
    }).toString();

    const res = await client.post("/download", body, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "referer": BASE_URL + "/"
      },
      responseType: "text"
    });

    const html = String(res.data || "");
    const parsed = parseResult(html);

    const output = {
      Status: res.status >= 200 && res.status < 300 && parsed.Total > 0,
      Code: res.status,
      Input: INPUT_URL,
      ...parsed,
      Time_ms: Date.now() - started
    };

    if (!output.Status) {
      output.Error = cleanText($?.("body").text?.() || "") || "Result tidak ditemukan";
    }

    console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: INPUT_URL,
      Result: [],
      Error: err.message,
      Time_ms: Date.now() - started
    }, null, 2));
  }
}

main();