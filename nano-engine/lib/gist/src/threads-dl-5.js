import axios from "axios";
import he from "he";

const INPUT_URL = "https://www.threads.com/@jtech.innovation/post/DZdEdqak4hZ?xmt=AQG0-406w6uTiPOmdCrgeC5VeMQtdEVG8ozOtWla0s3UGA";
const BASE_URL = "https://workers-playground-cool-wood-c008.accoutydusra.workers.dev";

function cleanText(text) {
  return he.decode(String(text || "")).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function uniqueByUrl(list = []) {
  const seen = new Set();
  const result = [];

  for (const item of list) {
    if (!item?.url || seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
  }

  return result;
}

function normalizeResult(data = {}) {
  const result = [];

  const videoQualities = uniqueByUrl(data.video?.qualities || []);
  for (const item of videoQualities) {
    result.push({
      Index: result.length + 1,
      Type: "video",
      Quality: item.quality || null,
      Media_type: item.type || null,
      Width: item.dimensions?.width || data.dimensions?.width || null,
      Height: item.dimensions?.height || data.dimensions?.height || null,
      Thumbnail: data.thumbnail || null,
      Result_url: item.url
    });
  }

  const images = uniqueByUrl(data.images?.urls || []);
  for (const item of images) {
    result.push({
      Index: result.length + 1,
      Type: "image",
      Quality: null,
      Media_type: null,
      Width: item.dimensions?.width || null,
      Height: item.dimensions?.height || null,
      Thumbnail: item.url || data.thumbnail || null,
      Result_url: item.url
    });
  }

  return result;
}

async function main() {
  const started = Date.now();

  try {
    const res = await axios.get(BASE_URL, {
      timeout: 60000,
      validateStatus: () => true,
      params: {
        url: INPUT_URL,
        action: "info"
      },
      headers: {
        "sec-ch-ua-platform": `"Android"`,
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "accept": "application/json",
        "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
        "content-type": "application/json",
        "sec-ch-ua-mobile": "?1",
        "origin": "https://threadsvid.com",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://threadsvid.com/",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "priority": "u=1, i"
      }
    });

    const data = res.data || {};
    const info = data.data || {};
    const result = normalizeResult(info);

    console.log(JSON.stringify({
      Status: res.status >= 200 && res.status < 300 && data.success === true && result.length > 0,
      Code: res.status,
      Input: INPUT_URL,
      Target: BASE_URL,
      Type: info.type || null,
      Title: cleanText(info.title),
      Description: cleanText(info.description),
      Author: info.author || null,
      Thumbnail: info.thumbnail || null,
      Width: info.dimensions?.width || null,
      Height: info.dimensions?.height || null,
      Duration: info.video?.duration ?? null,
      Has_audio: info.video?.hasAudio ?? null,
      Image_count: info.images?.count ?? 0,
      Is_carousel: info.images?.isCarousel ?? false,
      Total: result.length,
      Result: result,
      Error: data.success === true ? null : data.message || data.error || null,
      Time_ms: Date.now() - started
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: INPUT_URL,
      Target: BASE_URL,
      Total: 0,
      Result: [],
      Error: err.message,
      Time_ms: Date.now() - started
    }, null, 2));
  }
}

main();