import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import FormData from "form-data";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const BASE = "https://www.upload.ee";
const INPUT = "/home/container/example/carbon-code (1).png";

const jar = new CookieJar();

const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  validateStatus: () => true
}));

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".txt": "text/plain",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg"
};

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".avif"
]);

function decodeHtml(text = "") {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function getFileInfo(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const isImage = IMAGE_EXT.has(ext) || mime.startsWith("image/");

  return {
    ext,
    mime,
    isImage,
    category: isImage ? "cat_picture" : "cat_file"
  };
}

function toDirectImageUrl(url) {
  if (!url) return null;

  let result = decodeHtml(url);

  result = result.replace("/files/", "/image/");

  if (result.endsWith(".html")) {
    result = result.slice(0, -5);
  }

  return result;
}

async function getUploadId() {
  const rnd = Date.now();

  const res = await client.get(`${BASE}/ubr_link_upload.php?rnd_id=${rnd}`, {
    headers: {
      "User-Agent": UA,
      "Accept": "*/*",
      "Referer": `${BASE}/?`
    }
  });

  const body = String(res.data || "");
  const match = body.match(/startUpload\("([^"]+)"/);

  if (!match) throw new Error("Upload ID tidak ditemukan");

  return match[1];
}

async function uploadUploadEe(input = INPUT) {
  const filePath = path.resolve(input);

  if (!fs.existsSync(filePath)) {
    return {
      Status: false,
      Code: 404,
      Input: input,
      Type: null,
      Result_url: null,
      Error: "File tidak ditemukan"
    };
  }

  const info = getFileInfo(filePath);

  try {
    await client.get(`${BASE}/?`, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Referer": BASE
      }
    });

    const uploadId = await getUploadId();

    const form = new FormData();

    form.append("upfile_0", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: info.mime
    });
    form.append("link", "");
    form.append("email", "");
    form.append("category", info.category);
    form.append("big_resize", "none");
    form.append("small_resize", "120x90");

    const uploadUrl = `${BASE}/cgi-bin/ubr_upload.pl?X-Progress-ID=${uploadId}&upload_id=${uploadId}`;

    const uploadRes = await client.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Origin": BASE,
        "Referer": `${BASE}/?`
      }
    });

    const finishedUrl = `${BASE}/?page=finished&upload_id=${uploadId}`;

    const finishedRes = await client.get(finishedUrl, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Referer": uploadUrl
      }
    });

    const finishedHtml = String(finishedRes.data || "");

    const fileSrcMatch = finishedHtml.match(/id=["']file_src["'][^>]*value=["']([^"']+)["']/i);
    const viewMatch = finishedHtml.match(/View file:\s*<br\s*\/?>\s*<a href=["']?([^"'>\s]+)["']?/i);

    const rawUrl = fileSrcMatch?.[1] || viewMatch?.[1] || null;
    const viewUrl = rawUrl ? decodeHtml(rawUrl) : null;

    if (!viewUrl) throw new Error("View file URL tidak ditemukan");

    let resultUrl = null;
    let code = finishedRes.status || uploadRes.status;

    if (info.isImage) {
      resultUrl = toDirectImageUrl(viewUrl);
    } else {
      const filePageRes = await client.get(viewUrl, {
        headers: {
          "User-Agent": UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Referer": finishedUrl
        }
      });

      code = filePageRes.status || code;

      const fileHtml = String(filePageRes.data || "");
      const downloadMatch = fileHtml.match(/<a[^>]+id=["']d_l["'][^>]+href=["']([^"']+)["']/i);
      resultUrl = downloadMatch ? decodeHtml(downloadMatch[1]) : null;
    }

    return {
      Status: Boolean(resultUrl),
      Code: code,
      Input: input,
      Type: info.isImage ? "image" : "file",
      Result_url: resultUrl
    };
  } catch (err) {
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: input,
      Type: info.isImage ? "image" : "file",
      Result_url: null,
      Error: err.message
    };
  }
}

uploadUploadEe().then(result => {
  console.log(JSON.stringify(result, null, 2));
});

export { uploadUploadEe };