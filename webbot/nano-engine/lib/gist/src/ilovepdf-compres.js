import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";

const inputPath = process.argv[2] || "./file.pdf";
const outputDir = "./output";

const CHUNK_SIZE = 1024 * 1024;

async function getToken() {
  const html = await axios.get("https://www.ilovepdf.com/compress_pdf");
  const $ = cheerio.load(html.data);

  const script = $("script")
    .filter((_, el) => $(el).html()?.includes("ilovepdfConfig ="))
    .html();
  if (!script) throw new Error("Config tidak ditemukan");

  const jsonStr = script.split("var ilovepdfConfig = ")[1].split(";")[0];
  const json = JSON.parse(jsonStr);
  const csrf = $('meta[name="csrf-token"]').attr("content");

  const taskMatch = script.match(/ilovepdfConfig\.taskId\s*=\s*'([^']+)'/);
  const taskId = taskMatch ? taskMatch[1] : json.taskId;

  if (!json?.token || !csrf) throw new Error("Token/CSRF gagal diambil");
  if (!taskId) throw new Error("taskId tidak ditemukan di halaman");

  return { token: json.token, csrf, taskId, servers: json.servers || [] };
}

async function uploadChunk(server, headers, task, buffer, filename, chunkIndex, totalChunks) {
  const form = new FormData();
  form.append("name", filename);
  form.append("chunk", String(chunkIndex));
  form.append("chunks", String(totalChunks));
  form.append("task", task);
  form.append("file", buffer, filename);

  const res = await axios.post(`https://${server}.ilovepdf.com/v1/upload`, form, {
    headers: { ...headers, ...form.getHeaders() }
  });
  return res.data;
}

async function uploadFileInChunks(server, headers, task, fullBuffer, filename) {
  const totalChunks = Math.ceil(fullBuffer.length / CHUNK_SIZE) || 1;
  let lastResult = null;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fullBuffer.length);
    const chunkBuffer = fullBuffer.subarray(start, end);
    lastResult = await uploadChunk(server, headers, task, chunkBuffer, filename, i, totalChunks);
  }

  return lastResult;
}

async function processCompress(server, headers, task, serverFilename, originalFilename) {
  const form = new FormData();
  form.append("compression_level", "recommended");
  form.append("isDefault", "");
  form.append("output_filename", "{filename}_compressed");
  form.append("packaged_filename", "ilovepdf_compressed");
  form.append("task", task);
  form.append("tool", "compress");
  form.append("files[0][server_filename]", serverFilename);
  form.append("files[0][filename]", originalFilename);

  const res = await axios.post(`https://${server}.ilovepdf.com/v1/process`, form, {
    headers: { ...headers, ...form.getHeaders() }
  });
  return res.data;
}

async function downloadResult(server, headers, task) {
  const res = await axios.get(`https://${server}.ilovepdf.com/v1/download/${task}`, {
    headers,
    responseType: "arraybuffer"
  });
  return res.data;
}

async function compressPdf(buffer, filename) {
  const { token, csrf, taskId, servers } = await getToken();
  const server = servers[Math.floor(Math.random() * servers.length)] || "api28";

  const headers = {
    Authorization: "Bearer " + token,
    Origin: "https://www.ilovepdf.com/",
    Cookie: "_csrf=" + csrf,
    "User-Agent": "Mozilla/5.0"
  };

  const upload = await uploadFileInChunks(server, headers, taskId, buffer, filename);
  await processCompress(server, headers, taskId, upload.server_filename, filename);
  const resultBuffer = await downloadResult(server, headers, taskId);

  return { success: true, buffer: resultBuffer };
}

function randomFilename(ext = "pdf") {
  return `${crypto.randomBytes(8).toString("hex")}.${ext}`;
}

async function run(inputPath) {
  if (!fs.existsSync(inputPath)) {
    return { status: false, code: 404, input: inputPath, result: null };
  }

  try {
    const buffer = fs.readFileSync(inputPath);
    const filename = path.basename(inputPath);
    const { buffer: resultBuffer } = await compressPdf(buffer, filename);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outFilename = randomFilename("pdf");
    const outputPath = path.join(outputDir, outFilename);
    fs.writeFileSync(outputPath, resultBuffer);

    return { status: true, code: 200, input: inputPath, result: outputPath };
  } catch (err) {
    const code = err.response?.status || 500;
    console.error("DEBUG ERROR MESSAGE:", err.message);
    if (err.response?.data) {
      const d = err.response.data;
      console.error("DEBUG RESPONSE BODY:", Buffer.isBuffer(d) ? d.toString("utf8").slice(0, 500) : d);
    }
    return { status: false, code, input: inputPath, result: null };
  }
}

run(inputPath).then((output) => {
  console.log(JSON.stringify(output, null, 2));
});
