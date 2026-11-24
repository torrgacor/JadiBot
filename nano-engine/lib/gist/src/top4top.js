import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import fs from "node:fs";
import path from "node:path";

const API = "https://top4top.io";
const INPUT = "/home/container/assets/image_1761548252420.jpg";
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

function getCookieSid() {
  const cookies = jar.getCookiesSync(API);
  return cookies.find((c) => c.key === "sid")?.value || "";
}

function parseDirectImage(html) {
  const $ = cheerio.load(html);

  let direct = null;

  $(".inputbody").each((_, el) => {
    const title = $(el).find(".btitle").text().trim();
    const value = $(el).find("input").attr("value")?.trim();

    if (title.includes("رابط الصورة المباشر") && value) {
      direct = value;
    }
  });

  return (
    direct ||
    $('input[value^="https://"][value*="/p_"]').attr("value")?.trim() ||
    $('a[href*="/p_"]').attr("href")?.trim() ||
    null
  );
}

async function getSid() {
  const res = await client.get("/", {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      referer: `${API}/`
    }
  });

  const $ = cheerio.load(res.data || "");
  return $('input[name="sid"]').attr("value") || getCookieSid();
}

async function upload() {
  const sid = await getSid();

  const form = new FormData();

  if (sid) {
    form.append("sid", sid);
  }

  form.append("file_0_", fs.createReadStream(INPUT), {
    filename: path.basename(INPUT),
    contentType: "application/octet-stream"
  });

  for (let i = 1; i <= 9; i++) {
    form.append(`file_${i}_`, "");
  }

  form.append("submitr", "[ رفع الملفات ]");

  for (let i = 0; i <= 9; i++) {
    form.append(`file_${i}_`, "");
  }

  const res = await client.post("/index.php", form, {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    headers: {
      ...form.getHeaders(),
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      origin: API,
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

  const resultUrl = parseDirectImage(res.data || "");

  return {
    Status: res.status === 200 && !!resultUrl,
    Code: res.status,
    Input: INPUT,
    Result_url: resultUrl || "Direct image link not found"
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