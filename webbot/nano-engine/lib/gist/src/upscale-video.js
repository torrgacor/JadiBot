import axios from "axios";
import FormData from "form-data";
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const API = "https://api.unwatermark.ai";
const WEB = "https://unblurimage.ai";

const VIDEO_PATH = "/home/container/assets/tt_9256.mp4";
const RESOLUTION = "2k";
const IS_PREVIEW = "false";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const PRODUCT_CODE = "067003";
const PRODUCT_SERIAL = randomProductSerial();
const REQUEST_ID = crypto.randomUUID();

function randomProductSerial() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";

  for (let i = 0; i < 6; i++) {
    out += chars[crypto.randomInt(chars.length)];
  }

  return out;
}

function extToMime(file) {
  const ext = path.extname(file).toLowerCase();

  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mkv") return "video/x-matroska";

  return "application/octet-stream";
}

function baseHeaders(extra = {}) {
  return {
    accept: "*/*",
    origin: WEB,
    referer: `${WEB}/`,
    "user-agent": UA,
    "product-code": PRODUCT_CODE,
    "product-serial": PRODUCT_SERIAL,
    "x-request-id": REQUEST_ID,
    "sec-ch-ua-platform": "\"Android\"",
    "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
    "sec-ch-ua-mobile": "?1",
    ...extra
  };
}

async function postForm(endpoint, fields) {
  const form = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

  const res = await axios.post(`${API}${endpoint}`, form, {
    headers: baseHeaders(form.getHeaders()),
    validateStatus: () => true
  });

  return {
    status: res.status,
    data: res.data
  };
}

async function getJson(endpoint) {
  const res = await axios.get(`${API}${endpoint}`, {
    headers: baseHeaders({
      "content-type": "application/json; charset=UTF-8"
    }),
    validateStatus: () => true
  });

  return {
    status: res.status,
    data: res.data
  };
}

async function putFileToSignedUrl(uploadUrl, filePath) {
  const stat = await fsp.stat(filePath);
  const mime = extToMime(filePath);

  const res = await axios.put(uploadUrl, fs.createReadStream(filePath), {
    headers: {
      "content-type": mime,
      "content-length": stat.size
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true
  });

  return {
    status: res.status,
    data: res.data
  };
}

function cleanPublicUrl(url) {
  return String(url || "").split("?")[0];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createUploadUrl(filePath) {
  const videoFileName = path.basename(filePath);

  const result = await postForm("/api/web/common/upload/video", {
    video_file_name: videoFileName
  });

  if (result.status >= 400 || result.data?.code !== 100000) {
    throw new Error(`Gagal ambil upload url: ${JSON.stringify(result.data)}`);
  }

  return result.data.result;
}

async function createJob(originalVideoUrl) {
  const result = await postForm("/api/web/unblurimage/v1/video-enhancer/create-job", {
    original_video_url: originalVideoUrl,
    resolution: RESOLUTION,
    is_preview: IS_PREVIEW
  });

  if (result.status >= 400 || !result.data?.result?.job_id) {
    throw new Error(`Gagal create job: ${JSON.stringify(result.data)}`);
  }

  return result.data.result;
}

async function getJob(jobId) {
  return await getJson(`/api/web/unblurimage/v1/video-enhancer/get-job/${jobId}`);
}

async function waitJob(jobId, maxTry = 80, delayMs = 5000) {
  let last = null;

  for (let i = 1; i <= maxTry; i++) {
    const result = await getJob(jobId);
    last = result.data;

    const status = result.data?.result?.status;
    const outputUrl = result.data?.result?.output_url;

    if (Array.isArray(outputUrl) && outputUrl.length > 0) {
      return result.data;
    }

    if (status === 1) {
      return result.data;
    }

    await sleep(delayMs);
  }

  throw new Error(`Job belum selesai: ${JSON.stringify(last)}`);
}

async function main() {
  if (!fs.existsSync(VIDEO_PATH)) {
    throw new Error(`File tidak ditemukan: ${VIDEO_PATH}`);
  }

  const upload = await createUploadUrl(VIDEO_PATH);
  const signedUrl = upload.url;
  const publicUrl = cleanPublicUrl(upload.url);

  const put = await putFileToSignedUrl(signedUrl, VIDEO_PATH);

  if (put.status >= 400) {
    throw new Error(`Upload file gagal HTTP ${put.status}: ${typeof put.data === "string" ? put.data : JSON.stringify(put.data)}`);
  }

  const job = await createJob(publicUrl);
  const done = await waitJob(job.job_id);

  console.log(JSON.stringify({
    Status: true,
    Code: 200,
    Input: VIDEO_PATH,
    Result_url: done.result?.output_url?.[0] || ""
  }, null, 2));
}

main().catch(error => {
  console.log(JSON.stringify({
    Status: false,
    Code: 500,
    Input: VIDEO_PATH,
    Result_url: "",
    Error: error.message
  }, null, 2));

  process.exit(1);
});