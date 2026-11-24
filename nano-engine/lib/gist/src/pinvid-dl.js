import { download } from "node-hls-downloader";
import fs from "fs";
import { execSync } from "child_process";

const masterUrl = "https://v1.pinimg.com/videos/mc/hls/4a/ae/68/4aae68751585aad0679a89b24b8ff402.m3u8";
const timestamp = Date.now();
const videoTemp = `${timestamp}_v.mp4`;
const audioTemp = `${timestamp}_a.mp4`;
const outputFile = `${timestamp}_final.mp4`;

const baseUrl = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);
const res = await fetch(masterUrl);
const text = await res.text();
const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

let videoStreamUrl = null;
let audioStreamUrl = null;
let lastBandwidth = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
    const bw = parseInt(lines[i].match(/BANDWIDTH=(\d+)/)?.[1] || "0");
    if (bw > lastBandwidth) {
      lastBandwidth = bw;
      const u = lines[i + 1];
      videoStreamUrl = u?.startsWith("http") ? u : baseUrl + u;
    }
  }
  if (lines[i].startsWith("#EXT-X-MEDIA") && lines[i].includes("TYPE=AUDIO")) {
    const m = lines[i].match(/URI="([^"]+)"/);
    if (m) audioStreamUrl = m[1].startsWith("http") ? m[1] : baseUrl + m[1];
  }
}

if (!videoStreamUrl) {
  console.log("Bukan master playlist, download langsung...");
  await download({ concurrency: 10, outputFile, streamUrl: masterUrl, mergeUsingFFmpeg: false });
} else {
  console.log("Downloading video...");
  await download({ concurrency: 10, outputFile: videoTemp, streamUrl: videoStreamUrl, mergeUsingFFmpeg: false });

  if (audioStreamUrl) {
    console.log("Downloading audio...");
    await download({ concurrency: 10, outputFile: audioTemp, streamUrl: audioStreamUrl, mergeUsingFFmpeg: false });
    console.log("Merging...");
    execSync(`ffmpeg -i "${videoTemp}" -i "${audioTemp}" -c copy "${outputFile}" -y`, { stdio: "inherit" });
    fs.unlinkSync(videoTemp);
    fs.unlinkSync(audioTemp);
  } else {
    fs.renameSync(videoTemp, outputFile);
  }
}

const size = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);
console.log(JSON.stringify({ status: "success", file: outputFile, size: size + " MB" }, null, 2));