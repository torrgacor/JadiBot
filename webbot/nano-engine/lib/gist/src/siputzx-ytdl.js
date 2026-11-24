import yt from "@vreden/youtube_scraper";
import crypto from "crypto";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const BASE_URL = "https://youtubedl.siputzx.my.id";
const YOUTUBE_URL = "https://youtu.be/Ava0duwBsZo?si=mobwryUyr5BlkOsg";
const APIKEY = null;

function solvePow(challenge, difficulty) {
  let nonce = 0;
  const prefix = "0".repeat(Number(difficulty));

  while (true) {
    const hash = crypto
      .createHash("sha256")
      .update(challenge + nonce.toString())
      .digest("hex");

    if (hash.startsWith(prefix)) {
      return nonce.toString();
    }

    nonce++;

    if (nonce > 10000000) {
      throw new Error("PoW solving timeout");
    }
  }
}

function createClient() {
  const jar = new CookieJar();

  return wrapper(
    axios.create({
      jar,
      withCredentials: true,
      timeout: 60000,
      validateStatus: () => true,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        Origin: BASE_URL,
        Referer: `${BASE_URL}/`,
        "X-Request-Id": crypto.randomUUID()
      }
    })
  );
}

function normalizeType(type) {
  return type === "audio" || type === "mp3" ? "audio" : "merge";
}

async function downloadWithExternalAPI(type, url, apikey = null) {
  const client = createClient();
  const downloadType = normalizeType(type);

  if (!apikey) {
    const challengeRes = await client.post(`${BASE_URL}/akumaudownload`, {
      url,
      type: downloadType
    });

    if (challengeRes.status !== 200) {
      throw new Error(`Challenge ${downloadType} gagal HTTP ${challengeRes.status}`);
    }

    const { challenge, difficulty } = challengeRes.data || {};

    if (!challenge || !difficulty) {
      throw new Error(`Challenge ${downloadType} tidak ditemukan`);
    }

    const nonce = solvePow(challenge, difficulty);

    const verifyRes = await client.post(`${BASE_URL}/cekpunyaku`, {
      url,
      type: downloadType,
      nonce
    });

    if (verifyRes.status !== 200) {
      throw new Error(`Verify ${downloadType} gagal HTTP ${verifyRes.status}`);
    }
  }

  for (let attempts = 0; attempts < 30; attempts++) {
    const downloadRes = await client.get(`${BASE_URL}/download`, {
      params: {
        url,
        type: downloadType,
        apikey
      }
    });

    const data = downloadRes.data || {};

    if (data.status === "completed" && data.fileUrl) {
      return `${BASE_URL}${data.fileUrl}`;
    }

    if (data.status === "failed") {
      throw new Error(data.error || `Download ${downloadType} failed`);
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error(`Download ${downloadType} timeout`);
}

function getYoutubeId(url) {
  return (
    url.match(/youtu\.be\/([^?&/]+)/)?.[1] ||
    url.match(/[?&]v=([^?&]+)/)?.[1] ||
    url.match(/shorts\/([^?&/]+)/)?.[1] ||
    null
  );
}

function cleanMetadata(metadata = {}, inputUrl = null) {
  const thumbnails = Array.isArray(metadata?.thumbnails)
    ? metadata.thumbnails
    : [];

  const bestThumbnail =
    thumbnails.find(v => v.quality === "maxres")?.url ||
    thumbnails.find(v => v.quality === "standard")?.url ||
    thumbnails.find(v => v.quality === "high")?.url ||
    thumbnails.at(-1)?.url ||
    metadata?.thumbnail ||
    metadata?.image ||
    metadata?.thumb ||
    null;

  const id = metadata?.id || metadata?.videoId || getYoutubeId(inputUrl);

  return {
    title: metadata?.title || null,
    author:
      metadata?.author?.name ||
      metadata?.author ||
      metadata?.channel_title ||
      metadata?.channel ||
      null,
    views:
      metadata?.statistics?.view
        ? Number(metadata.statistics.view)
        : metadata?.views || metadata?.viewCount || null,
    thumbnail: bestThumbnail,
    url:
      metadata?.url ||
      metadata?.videoUrl ||
      (id ? `https://youtube.com/watch?v=${id}` : inputUrl)
  };
}

async function getMetadata(url) {
  try {
    const data = await yt.metadata(url);
    return cleanMetadata(data, url);
  } catch {
    return cleanMetadata({}, url);
  }
}

async function ytdl(url) {
  if (!url) {
    throw new Error("URL kosong");
  }

  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\/.+$/;

  if (!youtubeRegex.test(url)) {
    throw new Error("URL YouTube tidak valid");
  }

  const [metadata, urlVideo, urlAudio] = await Promise.all([
    getMetadata(url),
    downloadWithExternalAPI("video", url, APIKEY),
    downloadWithExternalAPI("mp3", url, APIKEY)
  ]);

  return {
    Status: true,
    Code: 200,
    Input: url,
    Metadata: metadata,
    Result: {
      Url_video: urlVideo,
      Url_audio: urlAudio
    }
  };
}

ytdl(YOUTUBE_URL)
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: 500,
          Input: YOUTUBE_URL,
          Error: error.message
        },
        null,
        2
      )
    );
  });