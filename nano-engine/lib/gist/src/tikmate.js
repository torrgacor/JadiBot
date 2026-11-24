import axios from "axios";
import FormData from "form-data";

const API = "https://api.tikmate.app/api/lookup";
const BASE_DOWNLOAD = "https://id.tikmate.app/download";

const TIKTOK_URL = "https://vt.tiktok.com/ZSxaAJftu/";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function addUrl(list, item) {
  if (!item.url) return;

  const exists = list.some(v => v.url === item.url);
  if (!exists) list.push(item);
}

function makeDownloadUrls(token, id) {
  const result = [];

  if (!token || !id) return result;

  addUrl(result, {
    type: "video",
    quality: "sd",
    label: "Download SD",
    url: `${BASE_DOWNLOAD}/${token}/${id}.mp4`
  });

  addUrl(result, {
    type: "video",
    quality: "hd",
    label: "Download HD",
    url: `${BASE_DOWNLOAD}/${token}/${id}.mp4?hd=1`
  });

  return result;
}

function cleanMetadata(data = {}) {
  return {
    id: data.id || null,
    author_id: data.author_id || null,
    author_name: data.author_name || null,
    author_avatar: data.author_avatar || null,
    description: data.desc || null,
    cover: data.cover || null,
    dynamic_cover: data.dynamic_cover || null,
    create_time: data.create_time || null,
    like_count: data.like_count ?? null,
    comment_count: data.comment_count ?? null,
    share_count: data.share_count ?? null
  };
}

function buildResult(data = {}) {
  const result = [];

  for (const item of makeDownloadUrls(data.token, data.id)) {
    addUrl(result, item);
  }

  if (data.video_url) {
    addUrl(result, {
      type: "video",
      quality: "default",
      label: "Video URL",
      url: data.video_url
    });
  }

  if (data.music_url) {
    addUrl(result, {
      type: "audio",
      label: "Audio",
      url: data.music_url
    });
  }

  if (data.audio_url) {
    addUrl(result, {
      type: "audio",
      label: "Audio",
      url: data.audio_url
    });
  }

  if (Array.isArray(data.images)) {
    for (const [index, item] of data.images.entries()) {
      const url = typeof item === "string" ? item : item?.url;

      addUrl(result, {
        type: "photo",
        label: `Photo ${index + 1}`,
        url
      });
    }
  }

  if (Array.isArray(data.photos)) {
    for (const [index, item] of data.photos.entries()) {
      const url = typeof item === "string" ? item : item?.url;

      addUrl(result, {
        type: "photo",
        label: `Photo ${index + 1}`,
        url
      });
    }
  }

  return result;
}

async function tikmate(url) {
  const form = new FormData();

  form.append("url", url);

  const res = await axios.post(API, form, {
    timeout: 60000,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      accept: "*/*",
      origin: "https://id.tikmate.app",
      referer: "https://id.tikmate.app/",
      "user-agent": UA,
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const data = res.data || {};
  const result = buildResult(data);

  return {
    Status: res.status === 200 && data.success === true && result.length > 0,
    Code: res.status,
    Input: url,
    Metadata: cleanMetadata(data),
    Result: result
  };
}

tikmate(TIKTOK_URL)
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
          Result: [],
          Error: error.message
        },
        null,
        2
      )
    );
  });