import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import crypto from "node:crypto";

const BASE = "https://quillbot.com";
const PROMPT = process.argv.slice(2).join(" ") || "Bugatti";
const CATEGORY = "Auto";
const ASPECT_RATIO = "1:1";
const PROMPT_ID = "image/generate-image";

const jar = new CookieJar();

const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  decompress: true,
  validateStatus: () => true,
  timeout: 120000
}));

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function uuid() {
  return crypto.randomUUID();
}

function hex(bytes) {
  return crypto.randomBytes(bytes).toString("hex");
}

async function setCookie(name, value) {
  await jar.setCookie(`${name}=${value}; Path=/; Domain=quillbot.com; Secure; SameSite=None`, BASE);
}

async function initCookies() {
  await setCookie("qbDeviceId", uuid());
  await setCookie("ajs_anonymous_id", uuid());
  await setCookie("anonID", hex(8));
  await setCookie("authenticated", "false");
  await setCookie("premium", "false");
  await setCookie("acceptedPremiumModesTnc", "false");
  await setCookie("qdid", hex(16));

  if (process.env.QB_COOKIE) {
    for (const part of process.env.QB_COOKIE.split(";")) {
      const clean = part.trim();
      if (clean) await jar.setCookie(`${clean}; Path=/; Domain=quillbot.com`, BASE);
    }
  }
}

function sentryHeaders() {
  const traceId = hex(16);
  const spanId = hex(8);
  const sampleRand = Math.random();

  return {
    "baggage": `sentry-environment=prod,sentry-release=v42.51.6,sentry-public_key=5743ef12f4887fc460c7968ebb2de54d,sentry-trace_id=${traceId},sentry-sampled=false,sentry-sample_rand=${sampleRand},sentry-sample_rate=0.01`,
    "sentry-trace": `${traceId}-${spanId}-0`
  };
}

async function warmup() {
  await client.get(BASE, {
    headers: {
      "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`,
      "upgrade-insecure-requests": "1",
      "user-agent": UA,
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "sec-fetch-site": "none",
      "sec-fetch-mode": "navigate",
      "sec-fetch-user": "?1",
      "sec-fetch-dest": "document",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
}

async function generate() {
  await initCookies();
  await warmup();

  const res = await client.post(`${BASE}/api/raven/generate/image`, {
    prompt: PROMPT,
    category: CATEGORY,
    aspectRatio: ASPECT_RATIO,
    promptId: PROMPT_ID
  }, {
    headers: {
      "sec-ch-ua-platform": `"Android"`,
      "platform-type": "webapp",
      "qb-product": "IMAGE-GENERATOR",
      "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
      "sec-ch-ua-mobile": "?1",
      "useridtoken": "empty-token",
      "user-agent": UA,
      "accept": "application/json, text/plain, */*",
      "webapp-version": "42.51.6",
      "content-type": "application/json",
      "origin": BASE,
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "referer": `${BASE}/ai-image-generator/i/${uuid()}`,
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      ...sentryHeaders()
    }
  });

  const urls = (res.data?.data?.images || [])
    .map(v => v.downloadUrl)
    .filter(Boolean);

  console.log(JSON.stringify({
    Status: res.status >= 200 && res.status < 300 && urls.length > 0,
    Code: res.status,
    Prompt: PROMPT,
    Download_url: urls.length === 1 ? urls[0] : urls
  }, null, 2));
}

generate().catch(error => {
  console.log(JSON.stringify({
    Status: false,
    Code: error.response?.status || 500,
    Prompt: PROMPT,
    Download_url: null
  }, null, 2));
});