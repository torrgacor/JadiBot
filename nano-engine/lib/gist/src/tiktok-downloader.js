import axios from "axios";

const API = "https://api.twitterpicker.com/tiktok/mediav2";

const TIKTOK_URL = "https://vt.tiktok.com/ZSxaSfTDq/";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function getTikTokId(url) {
  const clean = url.trim();

  const vt = clean.match(/vt\.tiktok\.com\/([^/?#]+)/i);
  if (vt) return vt[1];

  const t = clean.match(/tiktok\.com\/t\/([^/?#]+)/i);
  if (t) return t[1];

  const video = clean.match(/video\/(\d+)/i);
  if (video) return video[1];

  return clean;
}

function cleanMetadata(data = {}) {
  return {
    id: data.id || null,
    username: data.user?.username || null,
    name: data.user?.name || null,
    avatar: data.user?.image || data.user?.image_small || null,
    thumbnail: data.thumbnail || null,
    thumbnail_animated: data.thumbnail_animated || null,
    duration_seconds:
      data.video_duration_seconds ||
      data.audio?.duration_seconds ||
      null
  };
}

function getMedia(data = {}) {
  if (data.video_no_watermark?.url) {
    return {
      type: "video",
      url: data.video_no_watermark.url
    };
  }

  if (Array.isArray(data.images) && data.images.length > 0) {
    const first = data.images[0];

    return {
      type: "photo",
      url: typeof first === "string" ? first : first?.url || null
    };
  }

  if (data.image?.url) {
    return {
      type: "photo",
      url: data.image.url
    };
  }

  if (data.photo?.url) {
    return {
      type: "photo",
      url: data.photo.url
    };
  }

  return {
    type: null,
    url: null
  };
}

function makeResult(data = {}) {
  const media = getMedia(data);
  const audioUrl = data.audio?.url || null;

  const result = {
    Type: media.type || null
  };

  if (media.type === "video") {
    result.Url_video = media.url;
  }

  if (media.type === "photo") {
    result.Url_photo = media.url;
  }

  if (audioUrl) {
    result.Url_audio = audioUrl;
  }

  return result;
}

async function tiktokDownloader(url) {
  const id = getTikTokId(url);

  const res = await axios.get(API, {
    timeout: 60000,
    validateStatus: () => true,
    params: {
      id
    },
    headers: {
      accept: "*/*",
      origin: "https://tiktokdownloader.com",
      referer: "https://tiktokdownloader.com/",
      "user-agent": UA,
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  if (res.status !== 200) {
    return {
      Status: false,
      Code: res.status,
      Input: url,
      Metadata: null,
      Result: null,
      Error: `HTTP ${res.status}`
    };
  }

  const data = res.data || {};
  const result = makeResult(data);

  return {
    Status: !!(result.Url_video || result.Url_photo || result.Url_audio),
    Code: res.status,
    Input: url,
    Metadata: cleanMetadata(data),
    Result: result
  };
}

tiktokDownloader(TIKTOK_URL)
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: 500,
          Input: TIKTOK_URL,
          Metadata: null,
          Result: null,
          Error: error.message
        },
        null,
        2
      )
    );
  });