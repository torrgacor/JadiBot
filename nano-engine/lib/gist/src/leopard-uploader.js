import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import FormData from "form-data";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const BASE = "https://leopard.hosting.pecon.us";
const UPLOAD_PAGE = `${BASE}/upload.php`;
const INPUT = "/home/container/assets/rank/epic.webp";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

async function uploadLeopard(input = INPUT) {
  const filePath = path.resolve(input);

  if (!fs.existsSync(filePath)) {
    return {
      Status: false,
      Code: 404,
      Input: input,
      Result_url: null,
      Error: "File tidak ditemukan"
    };
  }

  try {
    await client.get(UPLOAD_PAGE, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Referer": BASE
      },
      validateStatus: () => true
    });

    const form = new FormData();

    form.append("uploadContent", fs.createReadStream(filePath), {
      filename: path.basename(filePath)
    });
    form.append("password", "");
    form.append("showname", "yes");

    const res = await client.post(UPLOAD_PAGE, form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Origin": BASE,
        "Referer": UPLOAD_PAGE
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true
    });

    const html = String(res.data || "");
    const match = html.match(/Download link:\s*<a href=([^>\s]+)>/i);
    const url = match?.[1] || null;

    return {
      Status: Boolean(url),
      Code: res.status,
      Input: input,
      Result_url: url
    };
  } catch (err) {
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: input,
      Result_url: null,
      Error: err.message
    };
  }
}

uploadLeopard().then(result => {
  console.log(JSON.stringify(result, null, 2));
});

export { uploadLeopard };