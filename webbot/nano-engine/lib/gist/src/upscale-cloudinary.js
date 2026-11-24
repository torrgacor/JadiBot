import axios from "axios";
import crypto from "node:crypto";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";

const IMAGE_PATH = "/home/container/assets/Tommy_Shelby.jpg";

const SIGN_API = "https://cloudinary-tools.netlify.app/.netlify/functions/sign-upload-params";
const UPLOAD_API = "https://api.cloudinary.com/v1_1/dtz0urit6/auto/upload";

const API_KEY = "985946268373735";
const UPLOAD_PRESET = "cloudinary-tools";
const SOURCE = "ml";

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function createTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function createUploadId() {
  return crypto.randomUUID();
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";

  return "application/octet-stream";
}

async function getSignature(timestamp) {
  const payload = {
    paramsToSign: {
      timestamp,
      upload_preset: UPLOAD_PRESET,
      source: SOURCE
    }
  };

  const { data, status } = await axios.post(SIGN_API, payload, {
    headers: {
      "user-agent": USER_AGENT,
      "content-type": "application/json",
      accept: "*/*",
      origin: "https://cloudinary.com",
      referer: "https://cloudinary.com/",
      "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`
    },
    timeout: 30000,
    validateStatus: () => true
  });

  if (status < 200 || status >= 300 || !data?.signature) {
    throw new Error(`Gagal ambil signature: HTTP ${status} ${JSON.stringify(data)}`);
  }

  return data.signature;
}

async function uploadFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`);
  }

  const timestamp = createTimestamp();
  const signature = await getSignature(timestamp);

  const form = new FormData();

  form.append("upload_preset", UPLOAD_PRESET);
  form.append("source", SOURCE);
  form.append("signature", signature);
  form.append("timestamp", String(timestamp));
  form.append("api_key", API_KEY);
  form.append("file", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: getMimeType(filePath)
  });

  const { data, status } = await axios.post(UPLOAD_API, form, {
    headers: {
      ...form.getHeaders(),
      "user-agent": USER_AGENT,
      accept: "application/json, text/javascript, */*; q=0.01",
      origin: "https://upload-widget.cloudinary.com",
      referer: "https://upload-widget.cloudinary.com/",
      "x-requested-with": "XMLHttpRequest",
      "x-unique-upload-id": createUploadId(),
      "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`,
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty"
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000,
    validateStatus: () => true
  });

  return {
    Status: status >= 200 && status < 300,
    Code: status,
    Input: filePath,
    result_url: data?.secure_url ?? data?.url ?? null
  };
}

uploadFile(IMAGE_PATH)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((err) =>
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: 500,
          Input: IMAGE_PATH,
          result_url: null,
          Error: err.message
        },
        null,
        2
      )
    )
  );