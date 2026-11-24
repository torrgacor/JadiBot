import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import mime from "mime-types";

const CONFIG = {
  Input: "/home/container/assets/Gojo.png",
  To: "jpeg",
  Quality: 100,
  OutputDir: "./downloads",
  SaveFile: true,
  Timeout: 180000
};

const API = "https://api.freeconvert.com/v1/process/jobs";
const CHUNK_SIZE = 5242880;
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const SUPPORTED_OUTPUT = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "bmp",
  "tiff",
  "tif",
  "ico",
  "svg",
  "pdf",
  "heic",
  "heif"
];

const FORMAT_ALIAS = {
  jpg: "jpeg",
  tif: "tiff"
};

function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

function normalizeFormat(format) {
  const value = String(format || "").toLowerCase().replace(/^\./, "").trim();
  return FORMAT_ALIAS[value] || value;
}

function outputExt(format) {
  const value = normalizeFormat(format);
  if (value === "jpeg") return "jpg";
  if (value === "tiff") return "tiff";
  return value;
}

function cleanName(name) {
  return String(name || "file").replace(/[^\w.-]+/g, "_");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getInputFormat(filePath) {
  const ext = path.extname(filePath).slice(1);
  return normalizeFormat(ext);
}

function normalizeServer(url) {
  const u = new URL(url);
  u.hostname = u.hostname.replace(/^server(\d+)-/, "s$1-");
  return u;
}

function pickTask(job, name) {
  return job.tasks.find(task => task.name === name || task.operation === name);
}

function collectUrls(value, out = []) {
  if (!value) return out;
  if (typeof value === "string" && /^https?:\/\//i.test(value)) out.push(value);
  if (Array.isArray(value)) for (const item of value) collectUrls(item, out);
  if (typeof value === "object") for (const item of Object.values(value)) collectUrls(item, out);
  return out;
}

function buildOptions(from, to) {
  const options = {
    "auto-orient": true,
    strip: true
  };

  if (["jpeg", "jpg", "webp", "avif", "heic", "heif"].includes(to)) {
    options.quality = 100;
  }

  if (to === "jpeg" || to === "jpg") {
    options.background = "#FFFFFF";
  }

  return options;
}

function validateConfig() {
  if (!CONFIG.Input) {
    throw new Error("CONFIG.Input kosong");
  }

  if (!fs.existsSync(CONFIG.Input)) {
    throw new Error(`File tidak ditemukan: ${CONFIG.Input}`);
  }

  const from = getInputFormat(CONFIG.Input);
  const to = normalizeFormat(CONFIG.To);

  if (!from) {
    throw new Error("Format input tidak bisa dibaca dari ekstensi file");
  }

  if (!to) {
    throw new Error("CONFIG.To kosong");
  }

  if (!SUPPORTED_OUTPUT.map(normalizeFormat).includes(to)) {
    throw new Error(`Format output tidak ada di daftar script: ${to}. Pilihan: ${[...new Set(SUPPORTED_OUTPUT.map(normalizeFormat))].join(", ")}`);
  }

  if (from === to) {
    throw new Error(`From dan To sama-sama ${to}`);
  }

  return { from, to };
}

async function createJob(from, to) {
  const payload = {
    tasks: {
      import: {
        operation: "import/upload"
      },
      convert: {
        operation: "convert",
        input: "import",
        input_format: from,
        output_format: to,
        options: buildOptions(from, to)
      },
      "export-url": {
        operation: "export/url",
        input: "convert"
      }
    }
  };

  const res = await axios.post(API, payload, {
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    headers: {
      authorization: "Bearer null",
      accept: "application/json, text/plain, */*",
      "content-type": "application/json",
      origin: "https://www.freeconvert.com",
      referer: `https://www.freeconvert.com/${from}-to-${to}/download`,
      "user-agent": UA
    }
  });

  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Gagal membuat job: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }

  return res.data;
}

async function uploadChunk(server, importTaskId, identifier, filename, type, fileSize, chunk, chunkNumber, totalChunks) {
  const currentSize = chunk.length;

  const query = new URLSearchParams({
    resumableChunkNumber: String(chunkNumber),
    resumableChunkSize: String(CHUNK_SIZE),
    resumableCurrentChunkSize: String(currentSize),
    resumableTotalSize: String(fileSize),
    resumableType: type,
    resumableIdentifier: identifier,
    resumableFilename: filename,
    resumableRelativePath: filename,
    resumableTotalChunks: String(totalChunks)
  });

  const form = new FormData();

  form.append("resumableChunkNumber", String(chunkNumber));
  form.append("resumableChunkSize", String(CHUNK_SIZE));
  form.append("resumableCurrentChunkSize", String(currentSize));
  form.append("resumableTotalSize", String(fileSize));
  form.append("resumableType", type);
  form.append("resumableIdentifier", identifier);
  form.append("resumableFilename", filename);
  form.append("resumableRelativePath", filename);
  form.append("resumableTotalChunks", String(totalChunks));
  form.append("file", chunk, {
    filename,
    contentType: "application/octet-stream",
    knownLength: currentSize
  });

  const res = await axios.post(`${server.origin}/api/resumable/${importTaskId}?${query}`, form, {
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    headers: {
      ...form.getHeaders(),
      accept: "*/*",
      origin: "https://www.freeconvert.com",
      referer: "https://www.freeconvert.com/",
      "user-agent": UA
    }
  });

  if (res.status !== 200) {
    throw new Error(`Upload chunk ${chunkNumber} gagal: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }

  return res.data;
}

async function joinChunks(server, importTaskId, identifier, fileSize) {
  const form = new FormData();

  form.append("identifier", identifier);
  form.append("fileSize", String(fileSize));

  const res = await axios.post(`${server.origin}/api/resumable/join/${importTaskId}`, form, {
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      accept: "application/json, text/plain, */*",
      origin: "https://www.freeconvert.com",
      referer: "https://www.freeconvert.com/",
      "user-agent": UA
    }
  });

  if (res.status !== 200) {
    throw new Error(`Join chunk gagal: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }

  return res.data;
}

async function finishUpload(server, importTaskId, identifier, filename, signature) {
  const form = new FormData();

  form.append("identifier", identifier);
  form.append("fileName", filename);
  form.append("signature", signature);

  const res = await axios.post(`${server.origin}/api/upload/${importTaskId}`, form, {
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      accept: "application/json, text/plain, */*",
      origin: "https://www.freeconvert.com",
      referer: "https://www.freeconvert.com/",
      "user-agent": UA
    }
  });

  if (res.status !== 200) {
    throw new Error(`Finalize upload gagal: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }

  return res.data;
}

async function readJob(selfUrl) {
  const res = await axios.get(selfUrl, {
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    headers: {
      authorization: "Bearer null",
      accept: "application/json, text/plain, */*",
      origin: "https://www.freeconvert.com",
      referer: "https://www.freeconvert.com/",
      "user-agent": UA
    }
  });

  if (res.status !== 200) {
    throw new Error(`Cek job gagal: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }

  return res.data;
}

async function pollJob(selfUrl, server, exportTaskId, outputFilename) {
  for (let i = 0; i < 90; i++) {
    const job = await readJob(selfUrl);
    const urls = collectUrls(job).filter(url => /\/task\/|download|export/i.test(url));
    const directUrl = urls.find(url => url.includes(`/${exportTaskId}/`)) || urls[0];

    if (directUrl && !["processing", "created"].includes(job.status)) {
      return { job, url: directUrl };
    }

    if (["completed", "done", "finished"].includes(job.status)) {
      return {
        job,
        url: `${server.origin}/task/${exportTaskId}/${outputFilename}`
      };
    }

    if (["failed", "error"].includes(job.status)) {
      throw new Error(`Convert gagal: ${JSON.stringify(job)}`);
    }

    const exportTask = pickTask(job, "export/url");

    if (exportTask?.status === "completed" || exportTask?.status === "done") {
      const exportUrls = collectUrls(exportTask.result || exportTask);

      return {
        job,
        url: exportUrls[0] || `${server.origin}/task/${exportTaskId}/${outputFilename}`
      };
    }

    await sleep(2000);
  }

  return {
    job: null,
    url: `${server.origin}/task/${exportTaskId}/${outputFilename}`
  };
}

async function downloadFile(url, outputPath) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: CONFIG.Timeout,
    validateStatus: () => true,
    headers: {
      accept: "*/*",
      referer: "https://www.freeconvert.com/",
      "user-agent": UA
    }
  });

  if (res.status !== 200) {
    throw new Error(`Download gagal: HTTP ${res.status}`);
  }

  await fsp.mkdir(path.dirname(outputPath), { recursive: true });
  await fsp.writeFile(outputPath, Buffer.from(res.data));

  return {
    Path: outputPath,
    Size: Buffer.byteLength(res.data),
    ContentType: res.headers["content-type"] || null
  };
}

async function convert() {
  const { from, to } = validateConfig();

  const filePath = CONFIG.Input;
  const stat = await fsp.stat(filePath);
  const fileSize = stat.size;
  const filename = cleanName(path.basename(filePath));
  const basename = cleanName(path.basename(filePath, path.extname(filePath)));
  const ext = outputExt(to);
  const outputFilename = `${basename}.${ext}`;
  const outputPath = path.resolve(CONFIG.OutputDir, `${basename}-converted.${ext}`);
  const type = mime.lookup(filePath) || `image/${from}`;
  const identifier = `${fileSize}-${crypto.randomInt(1000, 9999)}-${basename}-${crypto.randomBytes(8).toString("hex")}${from}.${path.extname(filePath).slice(1) || from}`;

  const job = await createJob(from, to);
  const importTask = pickTask(job, "import/upload");
  const exportTask = pickTask(job, "export/url");

  if (!importTask?.result?.form?.url || !importTask?.result?.form?.parameters?.signature) {
    throw new Error(`Form upload tidak ditemukan: ${JSON.stringify(job)}`);
  }

  if (!exportTask?.id) {
    throw new Error(`Export task tidak ditemukan: ${JSON.stringify(job)}`);
  }

  const importTaskId = importTask.id;
  const exportTaskId = exportTask.id;
  const signature = importTask.result.form.parameters.signature;
  const server = normalizeServer(importTask.result.form.url);
  const buffer = await fsp.readFile(filePath);
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    const chunk = buffer.subarray(start, end);

    await uploadChunk(
      server,
      importTaskId,
      identifier,
      filename,
      type,
      fileSize,
      chunk,
      i + 1,
      totalChunks
    );
  }

  await joinChunks(server, importTaskId, identifier, fileSize);
  await finishUpload(server, importTaskId, identifier, filename, signature);

  const polled = await pollJob(job.links.self, server, exportTaskId, outputFilename);

  let fileResult = null;

  if (CONFIG.SaveFile) {
    fileResult = await downloadFile(polled.url, outputPath);
  }

  return {
    Status: true,
    Code: 200,
    Input: filePath,
    Convert_to: to,
    Result: {
      Url: polled.url,
      ...fileResult
    }
  };
}

convert()
  .then(output)
  .catch(error => {
    output({
      Status: false,
      Code: 500,
      Input: CONFIG.Input,
      Convert_to: normalizeFormat(CONFIG.To),
      Result: null,
      Error: error.message
    });
  });