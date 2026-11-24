import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import axios from "axios";

const TARGET_URL = "https://ditzzx.my.id";
const OUTPUT_DIR = "web-fetcher";
const TIMEOUT = 60000;

function safeName(input) {
  return String(input || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 180);
}

function getSiteName(hostname) {
  const clean = hostname
    .replace(/^www\./, "")
    .replace(/:\d+$/, "");

  const parts = clean.split(".").filter(Boolean);

  if (parts.length >= 3 && parts.at(-2) === "my" && parts.at(-1) === "id") {
    return parts.at(-3);
  }

  if (parts.length >= 2) {
    return parts.at(-2);
  }

  return parts[0] || "output";
}

function getExtFromContentType(contentType) {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();

  const map = {
    "text/html": ".html",
    "text/plain": ".txt",
    "text/css": ".css",
    "text/javascript": ".js",
    "application/javascript": ".js",
    "application/x-javascript": ".js",
    "application/json": ".json",
    "application/xml": ".xml",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/x-icon": ".ico",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
    "font/ttf": ".ttf",
    "font/otf": ".otf",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/wav": ".wav",
    "application/pdf": ".pdf",
    "application/zip": ".zip"
  };

  return map[type] || "";
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFileName(url, contentType) {
  const parsed = new URL(url);
  const siteName = getSiteName(parsed.hostname);

  let pathname = decodeURIComponent(parsed.pathname || "");
  let base = path.basename(pathname);

  if (!base || base === "/" || base === ".") {
    const ext = getExtFromContentType(contentType) || ".html";
    return safeName(siteName + ext);
  }

  if (!path.extname(base)) {
    const ext = getExtFromContentType(contentType) || ".html";
    base += ext;
  }

  return safeName(base);
}

function getReferer(url) {
  const parsed = new URL(url);
  return parsed.origin + "/";
}

async function main() {
  const parsed = new URL(TARGET_URL);
  const baseUrl = parsed.origin;
  const referer = getReferer(TARGET_URL);
  const siteName = getSiteName(parsed.hostname);

  const folder = path.join(OUTPUT_DIR, siteName);
  ensureDir(folder);

  const res = await axios.get(TARGET_URL, {
    responseType: "arraybuffer",
    timeout: TIMEOUT,
    maxRedirects: 5,
    validateStatus: () => true,
    headers: {
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      "accept": "*/*",
      "referer": referer
    }
  });

  const contentType = res.headers["content-type"] || "";

  if (res.status < 200 || res.status >= 300) {
    throw new Error("Fetch gagal: " + res.status);
  }

  const buffer = Buffer.from(res.data);
  let filename = getFileName(TARGET_URL, contentType);
  let filePath = path.join(folder, filename);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const hash = crypto.createHash("md5").update(TARGET_URL).digest("hex").slice(0, 8);

    filename = name + "_" + hash + ext;
    filePath = path.join(folder, filename);
  }

  fs.writeFileSync(filePath, buffer);

  console.log(JSON.stringify({
    Status: true,
    Code: res.status,
    Url: TARGET_URL,
    Base_url: baseUrl,
    Referer: referer,
    Content_type: contentType,
    Folder: folder,
    File: filePath,
    Size: buffer.length
  }, null, 2));
}

main().catch(function (err) {
  console.log(JSON.stringify({
    Status: false,
    Code: 500,
    Url: TARGET_URL,
    File: "",
    Error: String(err && err.message ? err.message : err)
  }, null, 2));
});