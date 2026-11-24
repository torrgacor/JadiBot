import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const FILE_PATH = "./Screenshot 2026-06-16 192544.png";
const BASE_URL = "https://api.aceimg.com";
const REFERER = "https://aceimg.com/";
const TIMEOUT = 60000;

function makeVisitorId() {
  return crypto.randomUUID();
}

function getMimeType(file) {
  const ext = path.extname(file).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";

  return "application/octet-stream";
}

async function uploadAceImg(filePath) {
  const start = Date.now();

  try {
    if (!fs.existsSync(filePath)) {
      return {
        Status: false,
        Code: 404,
        Input: filePath,
        Error: "File tidak ditemukan"
      };
    }

    const visitorId = makeVisitorId();
    const form = new FormData();

    form.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: getMimeType(filePath)
    });

    const url = `${BASE_URL}/api/upload?visitorId=${visitorId}`;

    const res = await axios.post(url, form, {
      timeout: TIMEOUT,
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://aceimg.com",
        "Referer": REFERER,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true
    });

    const data = res.data;

    return {
      Status: data?.status === true,
      Code: res.status,
      Input: filePath,
      Visitor_id: visitorId,
      Link: data?.link || null,
      Raw: data,
      Time_ms: Date.now() - start
    };
  } catch (err) {
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: filePath,
      Error: err.message,
      Response: err.response?.data || null,
      Time_ms: Date.now() - start
    };
  }
}

const result = await uploadAceImg(FILE_PATH);
console.log(JSON.stringify(result, null, 2));