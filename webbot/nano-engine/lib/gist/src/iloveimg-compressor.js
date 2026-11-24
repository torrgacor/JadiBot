import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";

const INPUT = "/home/container/assets/Lol.png";
const OUTPUT_DIR = "./downloads";
const TOOL = "compressimage";

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const SERVERS = [
  "api1g", "api2g", "api3g", "api8g", "api9g", "api10g", "api11g",
  "api12g", "api13g", "api14g", "api15g", "api16g", "api17g",
  "api18g", "api19g", "api20g", "api21g", "api22g", "api24g", "api25g",
  "api1", "api2", "api3", "api4", "api5", "api6", "api7", "api8",
  "api9", "api10", "api11", "api12", "api13", "api14", "api15",
  "api16", "api17", "api18", "api19", "api20", "api21", "api22",
  "api23", "api24", "api25", "api26", "api27", "api28", "api29",
  "api30", "api31", "api32", "api33", "api34", "api35", "api36",
  "api37", "api38", "api39", "api40"
];

function randomTask(length = 120) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  while (result.length < length) {
    const bytes = crypto.randomBytes(length);
    for (const byte of bytes) {
      if (result.length >= length) break;
      result += chars[byte % chars.length];
    }
  }

  return result;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".bmp") return "image/bmp";
  if (ext === ".tif" || ext === ".tiff") return "image/tiff";

  return "image/jpeg";
}

function parseFilename(disposition, fallback) {
  if (!disposition) return fallback;

  const utf = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf?.[1]) return decodeURIComponent(utf[1].replace(/"/g, ""));

  const normal = disposition.match(/filename="?([^"]+)"?/i);
  if (normal?.[1]) return normal[1];

  return fallback;
}

async function getToken() {
  const res = await axios.get("https://www.iloveimg.com/compress-image", {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    timeout: 120000,
    validateStatus: () => true
  });

  if (res.status !== 200) {
    throw new Error(`Gagal membuka halaman token: HTTP ${res.status}`);
  }

  const $ = cheerio.load(res.data);

  const script = $("script")
    .filter((_, el) => String($(el).html() || "").includes("ilovepdfConfig ="))
    .html();

  if (!script) {
    throw new Error("Config script tidak ditemukan");
  }

  const jsonText = script.split("ilovepdfConfig = ")[1]?.split(";")[0];

  if (!jsonText) {
    throw new Error("Config JSON tidak ditemukan");
  }

  const json = JSON.parse(jsonText);
  const csrf = $("meta[name='csrf-token']").attr("content");

  if (!json.token || !csrf) {
    throw new Error("Token atau CSRF tidak ditemukan");
  }

  return {
    token: json.token,
    csrf
  };
}

async function uploadImage(server, headers, input, task) {
  const form = new FormData();

  form.append("name", path.basename(input));
  form.append("chunk", "0");
  form.append("chunks", "1");
  form.append("task", task);
  form.append("preview", "1");
  form.append("file", fs.createReadStream(input), {
    filename: path.basename(input),
    contentType: contentType(input)
  });

  const res = await axios.post(`https://${server}.iloveimg.com/v1/upload`, form, {
    headers: {
      ...headers,
      ...form.getHeaders()
    },
    timeout: 180000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: () => true
  });

  if (res.status !== 200 || !res.data?.server_filename) {
    throw new Error(`Upload gagal di ${server}: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }

  return {
    filename: res.data.filename || path.basename(input),
    server_filename: res.data.server_filename
  };
}

async function processCompress(server, headers, task, file) {
  const payload = {
    task,
    tool: TOOL,
    files: [
      {
        server_filename: file.server_filename,
        filename: file.filename
      }
    ]
  };

  const res = await axios.post(`https://${server}.iloveimg.com/v1/process`, payload, {
    headers: {
      ...headers,
      "content-type": "application/json"
    },
    timeout: 180000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: () => true
  });

  if (res.status !== 200) {
    throw new Error(`Process gagal di ${server}: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }

  return res.data;
}

async function downloadResult(server, headers, task, input) {
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });

  const ext = path.extname(input) || ".jpg";
  const base = path.basename(input, ext);

  const res = await axios.get(`https://${server}.iloveimg.com/v1/download/${task}`, {
    headers,
    responseType: "arraybuffer",
    timeout: 180000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: () => true
  });

  if (res.status !== 200 || !res.data) {
    throw new Error(`Download gagal di ${server}: HTTP ${res.status}`);
  }

  const disposition = res.headers["content-disposition"];
  const fallback = `${base}-compressed-${Date.now()}${ext}`;
  const filename = parseFilename(disposition, fallback);
  const output = path.join(OUTPUT_DIR, filename);

  await fsp.writeFile(output, Buffer.from(res.data));

  return output;
}

async function compressImage(input) {
  if (!fs.existsSync(input)) {
    throw new Error(`File tidak ditemukan: ${input}`);
  }

  const { token, csrf } = await getToken();
  const errors = [];

  for (const server of shuffle(SERVERS)) {
    const task = randomTask();

    const headers = {
      authorization: `Bearer ${token}`,
      origin: "https://www.iloveimg.com",
      referer: "https://www.iloveimg.com/compress-image",
      cookie: `_csrf=${csrf}`,
      "user-agent": UA,
      accept: "application/json, text/plain, */*"
    };

    try {
      const uploaded = await uploadImage(server, headers, input, task);
      await processCompress(server, headers, task, uploaded);
      const output = await downloadResult(server, headers, task, input);

      const inputSize = fs.statSync(input).size;
      const outputSize = fs.statSync(output).size;

      return {
        Server: server,
        Task: task,
        File: output,
        InputSize: inputSize,
        OutputSize: outputSize,
        SavedSize: Math.max(0, inputSize - outputSize)
      };
    } catch (err) {
      errors.push(err.message);
    }
  }

  throw new Error(errors.slice(0, 5).join(" | "));
}

async function main() {
  try {
    const result = await compressImage(INPUT);

    console.log(JSON.stringify({
      Status: true,
      Code: 200,
      Input: INPUT,
      Result: result
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: 500,
      Input: INPUT,
      Result: null,
      Error: err.message
    }, null, 2));
  }
}

main();