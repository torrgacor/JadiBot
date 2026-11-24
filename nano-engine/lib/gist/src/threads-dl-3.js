import axios from "axios";

const INPUT_URL = "https://www.threads.com/@sarleosly/post/DZe6YDsCRSQ?xmt=AQG0JCVLcDYEeDtTpymbTfpBAwnk_DoukdrM4GidsOommw";
const BASE_URL = "https://threadsvideo.romitkr5539.workers.dev";

function uniqueMedia(media = []) {
  const seen = new Set();
  const result = [];

  for (const item of media) {
    if (!item?.url || seen.has(item.url)) continue;
    seen.add(item.url);

    result.push({
      Index: result.length + 1,
      Type: item.type || null,
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
        url: INPUT_URL
      },
      headers: {
        "sec-ch-ua-platform": `"Android"`,
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
        "sec-ch-ua-mobile": "?1",
        "accept": "*/*",
        "origin": "https://threadsgrab.com",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://threadsgrab.com/",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "priority": "u=1, i"
      }
    });

    const data = res.data || {};
    const result = uniqueMedia(data.media);

    console.log(JSON.stringify({
      Status: res.status >= 200 && res.status < 300 && data.success === true && result.length > 0,
      Code: res.status,
      Input: INPUT_URL,
      Target: BASE_URL,
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