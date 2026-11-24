import axios from "axios";

const INPUT_URL = "https://www.threads.com/@mer.updette/post/DZc2d_yHyyc?xmt=AQG0JCVLcDYEeDtTpymbTfpBAwnk_DoukdrM4GidsOommw";
const BASE_URL = "https://www.thethreadsdownloader.com";

function getPostCode(input) {
  const text = String(input || "").trim();

  try {
    const url = new URL(text);
    const parts = url.pathname.split("/").filter(Boolean);
    const postIndex = parts.findIndex(x => x === "post");
    if (postIndex !== -1 && parts[postIndex + 1]) return parts[postIndex + 1];
    return parts.at(-1) || text;
  } catch {
    const parts = text.split("/").filter(Boolean);
    const postIndex = parts.findIndex(x => x === "post");
    if (postIndex !== -1 && parts[postIndex + 1]) return parts[postIndex + 1];
    return parts.at(-1) || text;
  }
}

function mediaTypeName(type) {
  if (Number(type) === 2) return "video";
  if (Number(type) === 1) return "image";
  return "unknown";
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

function sortVersions(list = []) {
  return uniqueByUrl(list).sort((a, b) => {
    const areaA = Number(a.width || 0) * Number(a.height || 0);
    const areaB = Number(b.width || 0) * Number(b.height || 0);
    return areaB - areaA;
  });
}

function normalizeMedias(mediaList = []) {
  const result = [];

  for (const media of mediaList) {
    const versions = Array.isArray(media.version_medias) ? sortVersions(media.version_medias) : [];
    const best = versions[0] || media;

    result.push({
      Index: result.length + 1,
      Type: mediaTypeName(media.media_type),
      Width: media.width || best.width || null,
      Height: media.height || best.height || null,
      Cover: media.cover_image || null,
      Result_url: media.url || best.url || null,
      Versions: versions.map(x => ({
        Type: mediaTypeName(x.media_type),
        Width: x.width || null,
        Height: x.height || null,
        Url: x.url
      }))
    });
  }

  return result;
}

async function main() {
  const started = Date.now();

  try {
    const code = getPostCode(INPUT_URL);

    const res = await axios.get(`${BASE_URL}/api/threads/post_detail/${encodeURIComponent(code)}`, {
      timeout: 60000,
      validateStatus: () => true,
      headers: {
        "sec-ch-ua-platform": `"Android"`,
        "time-zone": "Asia/Jakarta",
        "tenantid": "21",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "accept": "application/json, text/plain, */*",
        "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
        "sec-ch-ua-mobile": "?1",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": `${BASE_URL}/`,
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "priority": "u=1, i"
      }
    });

    const data = res.data || {};
    const detail = data.data?.post_detail || {};
    const user = data.data?.user || {};
    const result = normalizeMedias(detail.media_list);

    console.log(JSON.stringify({
      Status: res.status >= 200 && res.status < 300 && data.code === 0 && result.length > 0,
      Code: res.status,
      Input: INPUT_URL,
      Target: BASE_URL,
      Post_code: code,
      Username: user.username || null,
      Full_name: user.full_name || null,
      Avatar: user.avatar || null,
      Follower_count: user.follower_count ?? null,
      Verified: user.verified ?? user.is_verified ?? null,
      Profile: user.profile || null,
      Caption: detail.caption_text || null,
      Publish_time: detail.publish_time || null,
      Like_count: detail.like_count ?? null,
      Media_type: detail.media_type ?? null,
      Cover: detail.cover_image || null,
      Total: result.length,
      Result: result,
      Message: data.message || null,
      Time_ms: Date.now() - started
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: INPUT_URL,
      Target: BASE_URL,
      Result: [],
      Error: err.message,
      Time_ms: Date.now() - started
    }, null, 2));
  }
}

main();