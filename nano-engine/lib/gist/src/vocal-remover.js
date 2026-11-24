import fs from "fs";
import path from "path";
import crypto from "crypto";

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";
const XM_ORIGIN = "https://x-minus.pro";
const XM_AI_URL = "https://x-minus.pro/ai";
const MMD_HOST = "https://mmd.uvronline.app";

function extractAuthKey(html) {
  const m = html.match(/auth_key['"]?\s*[:=]\s*['"]([^'"]+)['"]/);
  if (m) return m[1];
  const m2 = html.match(/g\d+-[a-f0-9]+-\d+/);
  if (m2) return m2[0];
  throw new Error("auth_key tidak ditemukan di halaman x-minus.pro/ai");
}

async function getSession() {
  const res = await fetch(XM_AI_URL, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      referer: XM_AI_URL
    }
  });
  const html = await res.text();
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.raw ? res.headers.raw()["set-cookie"] : []);
  const cookies = (setCookie || []).map(c => c.split(";")[0]).join("; ");
  const authKey = extractAuthKey(html);
  return { cookies, authKey };
}

function buildMultipart(fields, fileField) {
  const boundary = "----VocalCutBoundary" + crypto.randomBytes(12).toString("hex");
  const chunks = [];

  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
    ));
  }

  if (fileField) {
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.contentType}\r\n\r\n`
    ));
    chunks.push(fileField.data);
    chunks.push(Buffer.from("\r\n"));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  return { body: Buffer.concat(chunks), boundary };
}

async function uploadJob({ filePath, authKey, model = "mdx_v2_vocft", format = "mp3" }) {
  const fileData = fs.readFileSync(filePath);
  const filename = path.basename(filePath);

  const fields = {
    auth_key: authKey,
    locale: "en_US",
    separation: "inst_vocal",
    separation_type: "vocals_music",
    format,
    version: "3-4-0",
    model,
    aggressiveness: "2",
    lvpanning: "center",
    uvrbve_ct: "auto",
    pre_rate: "100",
    bve_preproc: "auto",
    show_setting_format: "0",
    hostname: "x-minus.pro",
    client_fp: "-"
  };

  const { body, boundary } = buildMultipart(fields, {
    name: "myfile",
    filename,
    contentType: "audio/mpeg",
    data: fileData
  });

  const res = await fetch(`${MMD_HOST}/upload/vocalCutAi?catch-file`, {
    method: "POST",
    headers: {
      "user-agent": UA,
      "content-type": `multipart/form-data; boundary=${boundary}`,
      origin: XM_ORIGIN,
      referer: `${XM_ORIGIN}/`,
      accept: "*/*"
    },
    body
  });

  const json = await res.json();
  return { httpStatus: res.status, ...json };
}

async function checkJobStatus({ jobId, authKey }) {
  const fields = {
    job_id: jobId,
    auth_key: authKey,
    locale: "en_US"
  };

  const { body, boundary } = buildMultipart(fields, null);

  const res = await fetch(`${MMD_HOST}/upload/vocalCutAi?check-job-status`, {
    method: "POST",
    headers: {
      "user-agent": UA,
      "content-type": `multipart/form-data; boundary=${boundary}`,
      origin: XM_ORIGIN,
      referer: `${XM_ORIGIN}/`,
      accept: "*/*"
    },
    body
  });

  const json = await res.json();
  return { httpStatus: res.status, ...json };
}

async function waitForJob({ jobId, authKey, intervalMs = 3000, timeoutMs = 300000 }) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await checkJobStatus({ jobId, authKey });
    if (status.status === "done" || status.status === "error") {
      return status;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error("Timeout menunggu job selesai");
}

function buildDownloadUrl({ jobId, stem, fmt = "mp3", cdn = "0" }) {
  return `${MMD_HOST}/dl/vocalCutAi?job-id=${jobId}&stem=${stem}&fmt=${fmt}&cdn=${cdn}`;
}

async function resolveDownloadUrl(url) {
  const res = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: {
      "user-agent": UA,
      referer: `${XM_ORIGIN}/`,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  if (res.status >= 300 && res.status < 400) {
    return res.headers.get("location");
  }
  return url;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      referer: `${XM_ORIGIN}/`,
      accept: "*/*"
    }
  });

  if (!res.ok) {
    throw new Error(`Gagal download ${url} (status ${res.status})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
  return destPath;
}

async function separateVocal({ filePath, format = "mp3", outputDir = "." }) {
  const { authKey } = await getSession();

  const uploadResult = await uploadJob({ filePath, authKey, format });

  if (uploadResult.status !== "accepted") {
    return {
      status: uploadResult.status || "error",
      code: uploadResult.httpStatus,
      input: filePath,
      result_path: []
    };
  }

  const jobId = uploadResult.job_id;

  const finalStatus = await waitForJob({ jobId, authKey });

  if (finalStatus.status !== "done") {
    return {
      status: finalStatus.status,
      code: finalStatus.httpStatus,
      input: filePath,
      result_path: []
    };
  }

  const vocalUrl = buildDownloadUrl({ jobId, stem: "vocal", fmt: format, cdn: "0" });
  const instUrl = buildDownloadUrl({ jobId, stem: "inst", fmt: format, cdn: "0" });

  const [vocalFinal, instFinal] = await Promise.all([
    resolveDownloadUrl(vocalUrl),
    resolveDownloadUrl(instUrl)
  ]);

  const baseName = path.basename(filePath, path.extname(filePath));
  fs.mkdirSync(outputDir, { recursive: true });

  const vocalPath = path.join(outputDir, `${baseName}_Vocals.${format}`);
  const instPath = path.join(outputDir, `${baseName}_Instruments.${format}`);

  await Promise.all([
    downloadFile(vocalFinal, vocalPath),
    downloadFile(instFinal, instPath)
  ]);

  return {
    status: "done",
    code: 200,
    input: filePath,
    result_path: [vocalPath, instPath]
  };
}

const INPUT_FILE_PATH = "/home/claude/lagu.mp3";
const OUTPUT_DIR = "./hasil";

async function main() {
  const inputPath = INPUT_FILE_PATH;

  if (!fs.existsSync(inputPath)) {
    console.error("File tidak ditemukan:", inputPath);
    process.exit(1);
  }

  try {
    const result = await separateVocal({ filePath: inputPath, outputDir: OUTPUT_DIR });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      status: "error",
      code: 500,
      input: inputPath,
      result_path: [],
      message: err.message
    }, null, 2));
  }
}

main();
