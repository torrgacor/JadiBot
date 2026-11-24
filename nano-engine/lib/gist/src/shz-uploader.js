import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import FormData from "form-data";

const BASE = "https://shz.al";
const INPUT = "/home/container/example/kappa.mjs";
const EXPIRE = "1d";

function parseExpireToSeconds(expire = "7d") {
  const text = String(expire).trim().toLowerCase();
  const match = text.match(/^(\d+(?:\.\d+)?)(s|m|h|d)?$/);

  if (!match) return 7 * 86400;

  const value = Number(match[1]);
  const unit = match[2] || "s";

  const seconds = {
    s: value,
    m: value * 60,
    h: value * 3600,
    d: value * 86400
  }[unit];

  return Math.min(Math.floor(seconds), 90 * 86400);
}

function secondsToExpire(seconds) {
  if (seconds % 86400 === 0) return `${seconds / 86400}d`;
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

function getNameFromUrl(url) {
  const parsed = new URL(url);
  return parsed.pathname.replace(/^\/+/, "");
}

function getNormalUrl(url) {
  const name = getNameFromUrl(url);
  return `${BASE}/d/${name}`;
}

async function uploadShz(input = INPUT, expire = EXPIRE) {
  const filePath = path.resolve(input);

  if (!fs.existsSync(filePath)) {
    return {
      Status: false,
      Code: 404,
      Input: input,
      Expire: expire,
      Result_url: null,
      Raw_url: null,
      Error: "File tidak ditemukan"
    };
  }

  const expireSeconds = parseExpireToSeconds(expire);
  const finalExpire = secondsToExpire(expireSeconds);

  const form = new FormData();

  form.append("c", fs.createReadStream(filePath), {
    filename: path.basename(filePath)
  });
  form.append("e", finalExpire);

  try {
    const res = await axios.post(BASE, form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "Accept": "*/*",
        "Origin": BASE,
        "Referer": `${BASE}/`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true
    });

    const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    const rawUrl = data?.url || null;
    const normalUrl = rawUrl ? getNormalUrl(rawUrl) : null;

    return {
      Status: Boolean(rawUrl),
      Code: res.status,
      Input: input,
      Expire: finalExpire,
      Result_url: normalUrl,
      Raw_url: rawUrl,
      Manage_url: data?.manageUrl || null,
      Expire_at: data?.expireAt || null
    };
  } catch (err) {
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: input,
      Expire: expire,
      Result_url: null,
      Raw_url: null,
      Error: err.message,
      Response: typeof err.response?.data === "string" ? err.response.data.slice(0, 500) : err.response?.data || null
    };
  }
}

uploadShz().then(result => {
  console.log(JSON.stringify(result, null, 2));
});

export { uploadShz };