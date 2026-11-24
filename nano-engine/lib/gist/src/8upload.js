import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import fs from "node:fs";
import path from "node:path";

const API = "https://8upload.com";
const INPUT = "/home/container/assets/IMG-20260522-WA0102.jpg";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const jar = new CookieJar();

const client = wrapper(
  axios.create({
    baseURL: API,
    jar,
    withCredentials: true,
    timeout: 120000,
    validateStatus: () => true,
    headers: {
      "user-agent": UA,
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  })
);

function normalizeUploadPath(data) {
  if (typeof data !== "string") return null;

  const text = data.trim();

  if (text.startsWith("/uploads/")) return text;

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string" && parsed.startsWith("/uploads/")) {
      return parsed;
    }
  } catch {}

  const match = text.match(/\/uploads\/[a-zA-Z0-9]+/);
  return match ? match[0] : null;
}

function parseHotlink(html) {
  const $ = cheerio.load(String(html || ""));
  let result = null;

  $("label").each((_, el) => {
    const text = $(el).text().trim();

    if (text.includes("Hotlink") || text.includes("Direct-Link")) {
      result = $(el).next("input").attr("value")?.trim() || null;
    }
  });

  if (result) return result;

  const inputUrl = $('input[value^="https://i.8upload.com/image/"]').attr("value")?.trim();
  if (inputUrl) return inputUrl;

  const regex = String(html || "").match(/https:\/\/i\.8upload\.com\/image\/[^'"<>\s]+/);
  if (regex) return regex[0];

  const preview = $("img.istatus").attr("src")?.trim();
  if (preview) return preview.replace("/preview/", "/image/");

  return null;
}

async function initSession() {
  await client.get("/", {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      referer: `${API}/`
    }
  });
}

async function getPreviewHtml(pathname) {
  const res = await client.get(pathname, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      referer: `${API}/`,
      "upgrade-insecure-requests": "1",
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "navigate",
      "sec-fetch-user": "?1",
      "sec-fetch-dest": "document"
    }
  });

  return res.data || "";
}

async function upload() {
  await initSession();

  const form = new FormData();

  form.append("images[]", fs.createReadStream(INPUT), {
    filename: path.basename(INPUT),
    contentType: "application/octet-stream"
  });

  const res = await client.post("/upload/mt/", form, {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    headers: {
      ...form.getHeaders(),
      accept: "application/json, text/javascript, */*; q=0.01",
      origin: API,
      referer: `${API}/`,
      "x-requested-with": "XMLHttpRequest",
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty"
    }
  });

  let html = res.data || "";
  const uploadPath = normalizeUploadPath(html);

  if (uploadPath) {
    html = await getPreviewHtml(uploadPath);
  }

  const resultUrl = parseHotlink(html);

  return {
    Status: res.status === 200 && !!resultUrl,
    Code: res.status,
    Input: INPUT,
    Result_url: resultUrl || {
      message: "Hotlink / Direct-Link not found",
      upload_path: uploadPath,
      raw: typeof res.data === "string" ? res.data.slice(0, 300) : res.data
    }
  };
}

upload()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: err.response?.status || 500,
          Input: INPUT,
          Result_url: err.message
        },
        null,
        2
      )
    );
  });