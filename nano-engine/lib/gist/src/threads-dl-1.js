import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const INPUT_URL = "https://www.threads.com/@frsyazliin/post/DZeCW99kwHO";
const LANG = "id";
const BASE_URL = "https://threadsmate.com";

const jar = new CookieJar();

const client = wrapper(axios.create({
  baseURL: BASE_URL,
  jar,
  withCredentials: true,
  timeout: 60000,
  maxRedirects: 5,
  validateStatus: () => true,
  headers: {
    "sec-ch-ua-platform": `"Android"`,
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "sec-ch-ua-mobile": "?1",
    "accept": "*/*",
    "origin": BASE_URL,
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": `${BASE_URL}/${LANG}`,
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "priority": "u=1, i"
  }
}));

function cleanText(text) {
  return String(text || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function absoluteUrl(url) {
  if (!url) return null;
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return BASE_URL + url;
  return url;
}

function getType(el, $) {
  const title = cleanText($(el).find("a").first().attr("title"));
  const icon = $(el).find(".format-icon i").attr("class") || "";
  if (/video/i.test(title) || /dlvideo/i.test(icon)) return "video";
  if (/foto|photo|image/i.test(title) || /dlimage/i.test(icon)) return "image";
  return "unknown";
}

function parseHtml(html) {
  const $ = cheerio.load(html);
  const caption = cleanText($("h3 [title]").first().attr("title") || $("h3").first().text());
  const author = cleanText($(".threadsmate-downloader-middle p span").first().text()).replace(/^@/, "");
  const profile = absoluteUrl($(".threadsmate-downloader-left > img").first().attr("src"));
  const result = [];

  $(".download-box > li").each((i, el) => {
    const type = getType(el, $);
    const thumb = absoluteUrl($(el).find(".download-items__thumb img").first().attr("data-src") || $(el).find(".download-items__thumb img").first().attr("src"));
    const button = $(el).find(".download-items__btn a").first();
    const mainUrl = absoluteUrl(button.attr("href"));
    const title = cleanText(button.attr("title") || button.text());
    const qualities = [];

    $(el).find("select option").each((_, opt) => {
      const label = cleanText($(opt).text());
      const url = absoluteUrl($(opt).attr("value"));
      if (url) qualities.push({ Quality: label || null, Url: url });
    });

    if (mainUrl || qualities.length || thumb) {
      result.push({
        Index: i + 1,
        Type: type,
        Title: title || null,
        Thumbnail: thumb,
        Result_url: mainUrl,
        Qualities: qualities
      });
    }
  });

  return {
    Author: author || null,
    Caption: caption || null,
    Profile: profile,
    Total: result.length,
    Result: result
  };
}

async function getToken() {
  const res = await client.get(`/${LANG}`, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    }
  });

  const html = String(res.data || "");
  const $ = cheerio.load(html);

  let tokenName = null;
  let tokenValue = null;

  $("input").each((_, el) => {
    const name = $(el).attr("name");
    const value = $(el).attr("value");
    if (name && value && name !== "url" && name !== "lang") {
      tokenName = name;
      tokenValue = value;
      return false;
    }
  });

  return {
    Code: res.status,
    Name: tokenName || "_kICly",
    Value: tokenValue || "eb64fb3e458c4139a8d02fe545147505"
  };
}

async function main() {
  const started = Date.now();

  try {
    const token = await getToken();

    const form = new FormData();
    form.append("url", INPUT_URL);
    form.append(token.Name, token.Value);
    form.append("lang", LANG);

    const res = await client.post("/action", form, {
      headers: {
        ...form.getHeaders(),
        "referer": `${BASE_URL}/${LANG}`
      }
    });

    const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    const parsed = parseHtml(data?.html || "");

    console.log(JSON.stringify({
      Status: res.status >= 200 && res.status < 300 && data?.error === false && parsed.Total > 0,
      Code: res.status,
      Input: INPUT_URL,
      Target: BASE_URL,
      Token: token.Name,
      ...parsed,
      Error: data?.error === false ? null : data?.message || data?.msg || null,
      Time_ms: Date.now() - started
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: INPUT_URL,
      Target: BASE_URL,
      Result: [],
      Error: err.message,
      Time_ms: Date.now() - started
    }, null, 2));
  }
}

main();