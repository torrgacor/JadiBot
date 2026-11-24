import axios from "axios";

const INPUT_URL = "https://www.threads.com/@dr.tirta/post/DZe6VYzkkl0?xmt=AQG0W0sX9QlUWpxSp8Mv7VDqrpHNOPSu7qLI230vuzp7Ig";
const BASE_URL = "https://www.threadsdl.app";

function pickBestImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) return null;

  const unique = [];
  const seen = new Set();

  for (const image of images) {
    if (!image?.url || seen.has(image.url)) continue;
    seen.add(image.url);
    unique.push(image);
  }

  return unique.sort((a, b) => {
    const areaA = Number(a.width || 0) * Number(a.height || 0);
    const areaB = Number(b.width || 0) * Number(b.height || 0);
    return areaB - areaA;
  })[0] || null;
}

function pickBestVideo(videos = []) {
  if (!Array.isArray(videos) || videos.length === 0) return null;

  const unique = [];
  const seen = new Set();

  for (const video of videos) {
    if (!video?.url || seen.has(video.url)) continue;
    seen.add(video.url);
    unique.push(video);
  }

  return unique[0] || null;
}

function normalizeMedia(medias = []) {
  const result = [];

  for (const media of medias) {
    const video = pickBestVideo(media.videos);
    const image = pickBestImage(media.images);
    const isVideo = Number(media.mediaType) === 2 || !!video;

    result.push({
      Index: result.length + 1,
      Type: isVideo ? "video" : "image",
      Width: media.width || image?.width || null,
      Height: media.height || image?.height || null,
      Cover: media.cover || image?.url || null,
      Result_url: isVideo ? video?.url || media.cover || null : image?.url || media.cover || null,
      Images: Array.isArray(media.images)
        ? media.images
            .filter((x, i, arr) => x?.url && arr.findIndex(y => y?.url === x.url) === i)
            .map(x => ({
              Width: x.width || null,
              Height: x.height || null,
              Url: x.url
            }))
        : [],
      Videos: Array.isArray(media.videos)
        ? media.videos
            .filter((x, i, arr) => x?.url && arr.findIndex(y => y?.url === x.url) === i)
            .map(x => ({
              Type: x.type || null,
              Url: x.url
            }))
        : []
    });
  }

  return result;
}

async function main() {
  const started = Date.now();

  try {
    const res = await axios.post(`${BASE_URL}/api/threads`, {
      url: INPUT_URL
    }, {
      timeout: 60000,
      validateStatus: () => true,
      headers: {
        "sec-ch-ua-platform": `"Android"`,
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
        "content-type": "application/json",
        "sec-ch-ua-mobile": "?1",
        "accept": "*/*",
        "origin": BASE_URL,
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": `${BASE_URL}/id/`,
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "priority": "u=1, i"
      }
    });

    const data = res.data || {};
    const result = normalizeMedia(data.medias);

    console.log(JSON.stringify({
      Status: res.status >= 200 && res.status < 300 && result.length > 0,
      Code: res.status,
      Input: INPUT_URL,
      Target: BASE_URL,
      Username: data.username || null,
      Avatar: data.avatar || null,
      Caption: data.text || null,
      Total: result.length,
      Result: result,
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