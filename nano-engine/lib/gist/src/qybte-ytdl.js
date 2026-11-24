import axios from "axios";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const INPUT_URL = "https://youtu.be/agneRtEe-t8?si=HxQZ6C8CXTRz7G9n";
const TARGET_QUALITY = 720;
const OUTPUT_DIR = "./downloads";

const API = "https://be-video-downloader.qbyte.web.id";
const WEB = "https://video.downloader.qbyte.web.id/";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const http = axios.create({
  timeout: 120000,
  maxRedirects: 5,
  validateStatus: () => true,
});

function cleanName(text) {
  return String(text || "media")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getId(format) {
  return String(format.format_id || format.itag || format.id);
}

function getHeight(format) {
  if (format.height) return Number(format.height);

  const resolution = String(format.resolution || "");

  const wxh = resolution.match(/(\d+)\s*x\s*(\d+)/i);
  if (wxh) return Number(wxh[2]);

  const p = resolution.match(/(\d+)\s*p/i);
  if (p) return Number(p[1]);

  const any = resolution.match(/\d+/);
  return any ? Number(any[0]) : 0;
}

async function getInfo() {
  const res = await http.get(`${API}/api/info`, {
    params: {
      url: INPUT_URL,
    },
    headers: {
      "user-agent": UA,
      accept: "application/json, text/plain, */*",
      origin: WEB.slice(0, -1),
      referer: WEB,
    },
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Gagal ambil info HTTP ${res.status}`);
  }

  return res.data;
}

function pickVideo(info) {
  const formats = Array.isArray(info.formats) ? info.formats : [];

  const exact = formats
    .filter((f) => f.vcodec !== "none" && getHeight(f) === TARGET_QUALITY)
    .sort((a, b) => {
      const av = String(a.ext || "").toLowerCase() === "mp4" ? 1 : 0;
      const bv = String(b.ext || "").toLowerCase() === "mp4" ? 1 : 0;
      return bv - av;
    });

  if (exact[0]) return exact[0];

  const closest = formats
    .filter((f) => f.vcodec !== "none")
    .sort((a, b) => {
      const ah = getHeight(a);
      const bh = getHeight(b);
      const ad = Math.abs(ah - TARGET_QUALITY);
      const bd = Math.abs(bh - TARGET_QUALITY);

      if (ad !== bd) return ad - bd;

      const av = String(a.ext || "").toLowerCase() === "mp4" ? 1 : 0;
      const bv = String(b.ext || "").toLowerCase() === "mp4" ? 1 : 0;

      return bv - av;
    });

  if (closest[0]) return closest[0];

  throw new Error("Format video tidak ditemukan");
}

function pickBestAudio(info) {
  const formats = Array.isArray(info.formats) ? info.formats : [];

  const audio = formats
    .filter((f) => f.vcodec === "none" && f.acodec !== "none")
    .sort((a, b) => Number(b.abr || b.tbr || 0) - Number(a.abr || a.tbr || 0));

  if (audio[0]) return audio[0];

  throw new Error("Format audio tidak ditemukan");
}

async function checkDownload() {
  const res = await http.get(`${API}/api/check-download`, {
    headers: {
      "user-agent": UA,
      accept: "application/json, text/plain, */*",
      origin: WEB.slice(0, -1),
      referer: WEB,
    },
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Server download sedang penuh HTTP ${res.status}`);
  }
}

async function downloadFormat(info, format, label) {
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });

  const ext = format.ext || (label.includes("audio") ? "m4a" : "mp4");
  const formatId = getId(format);
  const title = cleanName(info.title || "media");
  const filename = `${title}.${ext}`;
  const output = path.join(OUTPUT_DIR, `${title}-${label}-${formatId}.${ext}`);

  await checkDownload();

  const res = await http.get(`${API}/api/download`, {
    params: {
      url: INPUT_URL,
      format: formatId,
      filename,
    },
    responseType: "stream",
    headers: {
      "user-agent": UA,
      accept: "*/*",
      referer: WEB,
    },
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`${label} gagal download HTTP ${res.status}`);
  }

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(output);
    res.data.pipe(writer);
    res.data.on("error", reject);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return output;
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args, {
      stdio: ["ignore", "ignore", "pipe"],
    });

    let error = "";

    ffmpeg.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg gagal code ${code}: ${error.slice(-700)}`));
    });

    ffmpeg.on("error", reject);
  });
}

async function mergeVideoAudio(videoPath, audioPath, outputPath) {
  await runFfmpeg([
    "-y",
    "-i",
    videoPath,
    "-i",
    audioPath,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    outputPath,
  ]);

  return outputPath;
}

async function convertAudioToMp3(audioPath, outputPath) {
  await runFfmpeg([
    "-y",
    "-i",
    audioPath,
    "-vn",
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath,
  ]);

  return outputPath;
}

async function main() {
  try {
    const info = await getInfo();

    const videoFormat = pickVideo(info);
    const audioFormat = pickBestAudio(info);

    const title = cleanName(info.title || "media");
    const videoTemp = await downloadFormat(info, videoFormat, "video-temp");
    const audioTemp = await downloadFormat(info, audioFormat, "audio-temp");

    const mp4Path = path.join(OUTPUT_DIR, `${title}-${TARGET_QUALITY}p.mp4`);
    const mp3Path = path.join(OUTPUT_DIR, `${title}.mp3`);

    const mp4 = await mergeVideoAudio(videoTemp, audioTemp, mp4Path);
    const mp3 = await convertAudioToMp3(audioTemp, mp3Path);

    await fsp.unlink(videoTemp).catch(() => {});
    await fsp.unlink(audioTemp).catch(() => {});

    console.log(
      JSON.stringify(
        {
          status: true,
          title: info.title,
          result: {
            mp4,
            mp3,
          },
        },
        null,
        2
      )
    );
  } catch (err) {
    console.log(
      JSON.stringify(
        {
          status: false,
          error: err.message,
        },
        null,
        2
      )
    );
  }
}

main();


/*
CUSTOM:
- Ganti link:
  const INPUT_URL = "LINK_KAMU";

- Ganti kualitas video:
  const TARGET_QUALITY = 720;

- Target quality yang bisa dicoba:
  144
  240
  360
  480
  720
  1080

- Hasil akhir:
  1. MP4 + audio:
     downloads/judul-720p.mp4

  2. MP3 audio:
     downloads/judul.mp3

- File video-temp dan audio-temp otomatis dihapus.

- Wajib install:
  npm i axios

- Wajib ffmpeg terinstall.

- Kalau error:
  spawn ffmpeg ENOENT
  artinya ffmpeg belum terinstall.
*/