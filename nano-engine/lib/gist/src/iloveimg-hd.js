import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";

const inputPath = "./t3.jpg";
const outputDir = "./output";
const scale = 4; // 2 atau 4

const SERVERS = [
  "api1g", "api2g", "api3g", "api8g", "api9g", "api10g", "api11g",
  "api12g", "api13g", "api14g", "api15g", "api16g", "api17g", "api18g",
  "api19g", "api20g", "api21g", "api22g", "api24g", "api25g"
];

const TASK =
  "r68zl88mq72xq94j2d5p66bn2z9lrbx20njsbw2qsAvgmzr11lvfhAx9kl87pp6yqgx7c8vg7sfbqnrr42qb16v0gj8jl5s0kq1kgp26mdyjjspd8c5A2wk8b4Adbm6vf5tpwbqlqdr8A9tfn7vbqvy28ylphlxdl379psxpd8r70nzs3sk1";

async function getToken() {
  const html = await axios.get("https://www.iloveimg.com/upscale-image");
  const $ = cheerio.load(html.data);

  const script = $("script")
    .filter((_, el) => $(el).html()?.includes("ilovepdfConfig ="))
    .html();
  if (!script) throw new Error("Config tidak ditemukan");

  const jsonStr = script.split("ilovepdfConfig = ")[1].split(";")[0];
  const json = JSON.parse(jsonStr);
  const csrf = $('meta[name="csrf-token"]').attr("content");

  if (!json?.token || !csrf) throw new Error("Token/CSRF gagal diambil");
  return { token: json.token, csrf };
}

async function uploadImage(server, headers, buffer, task) {
  const form = new FormData();
  form.append("name", "image.jpg");
  form.append("chunk", "0");
  form.append("chunks", "1");
  form.append("task", task);
  form.append("preview", "1");
  form.append("file", buffer, "image.jpg");

  const res = await axios.post(`https://${server}.iloveimg.com/v1/upload`, form, {
    headers: { ...headers, ...form.getHeaders() }
  });
  return res.data;
}

async function imageHD(buffer, scale = 4) {
  const { token, csrf } = await getToken();
  const server = SERVERS[Math.floor(Math.random() * SERVERS.length)];

  const headers = {
    Authorization: "Bearer " + token,
    Origin: "https://www.iloveimg.com/",
    Cookie: "_csrf=" + csrf,
    "User-Agent": "Mozilla/5.0"
  };

  const upload = await uploadImage(server, headers, buffer, TASK);

  const form = new FormData();
  form.append("task", TASK);
  form.append("server_filename", upload.server_filename);
  form.append("scale", scale);

  const res = await axios.post(`https://${server}.iloveimg.com/v1/upscale`, form, {
    headers: { ...headers, ...form.getHeaders() },
    responseType: "arraybuffer"
  });

  return { success: true, scale, buffer: res.data };
}

function randomFilename(ext = "jpg") {
  return `${crypto.randomBytes(8).toString("hex")}.${ext}`;
}

async function run(inputPath, scale) {
  if (!fs.existsSync(inputPath)) {
    return {
      status: false,
      code: 404,
      input: inputPath,
      result: null
    };
  }

  try {
    const buffer = fs.readFileSync(inputPath);
    const { buffer: resultBuffer } = await imageHD(buffer, scale);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filename = randomFilename("jpg");
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, resultBuffer);

    return {
      status: true,
      code: 200,
      input: inputPath,
      result: outputPath
    };
  } catch (err) {
    const code = err.response?.status || 500;
    return {
      status: false,
      code,
      input: inputPath,
      result: null
    };
  }
}

run(inputPath, scale).then((output) => {
  console.log(JSON.stringify(output, null, 2));
});
