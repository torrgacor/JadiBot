import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";

const TEMP_MAIL_CONFIG = {
  baseUrl: "https://temp-mail.app/api",
  headers: {
    accept: "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    pragma: "no-cache",
    referer: "https://temp-mail.app/",
    "sec-ch-ua":
      '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
  },
};

const API = "https://api.deepai.org";
const HOME = "https://deepai.org";
const PAGE = `${HOME}/machine-learning-model/image-editor`;
const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";
const IMAGE_PATH = "/home/container/assets/Gojo.jpeg";
const PROMPT = "Ubah warna rambut nya jadi kuning";
const CACHE_FILE = "./deepai_cache.json";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getTempMailAddress() {
  const visitorId = generateUUID();
  const res = await axios.get(`${TEMP_MAIL_CONFIG.baseUrl}/mail/address`, {
    headers: { ...TEMP_MAIL_CONFIG.headers, "visitor-id": visitorId },
    params: { refresh: false, expire: 1440, part: "main" },
  });
  if (!res.data?.address) throw new Error("Gagal membuat email sementara");
  return { address: res.data.address, visitorId };
}

async function getMessageList(visitorId) {
  const res = await axios.get(`${TEMP_MAIL_CONFIG.baseUrl}/mail/list`, {
    headers: { ...TEMP_MAIL_CONFIG.headers, "visitor-id": visitorId },
    params: { part: "main" },
  });
  return (res.data?.message || []).map((msg) => ({
    id: msg.id,
    content: msg.content,
  }));
}

async function waitForEmail(visitorId, timeoutMs = 120000) {
  const start = Date.now();
  let lastCount = 0;
  try {
    lastCount = (await getMessageList(visitorId)).length;
  } catch {}
  while (Date.now() - start < timeoutMs) {
    const messages = await getMessageList(visitorId);
    if (messages.length > lastCount) return messages[0];
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Timeout email verifikasi");
}

function extractVerificationLink(content) {
  const match = content.match(/https:\/\/api\.deepai\.org\/verify_email\?key=[^\s"&]+/);
  return match ? match[0] : null;
}

function randomPassword(length = 10) {
  return Math.random().toString(36).slice(-length);
}

function myhashfunction(input) {
  const a = [];
  for (let b = 0; b < 64; ) {
    a[b] = 0 | (4294967296 * Math.sin(++b % Math.PI));
  }
  let d, e, f;
  const g = [(d = 1732584193), (e = 4023233417), ~d, ~e];
  const h = [];
  let l = unescape(encodeURI(input)) + "\u0080";
  let k = l.length;
  let c = (--k / 4 + 2) | 15;
  for (h[--c] = 8 * k; ~k; ) {
    h[k >> 2] |= l.charCodeAt(k) << (8 * k--);
  }
  for (let b = 0, l = 0; b < c; b += 16) {
    for (
      k = g;
      l < 64;
      k = [
        (f = k[3]),
        d +
          (((f =
            k[0] +
            [
              (d & e) | (~d & f),
              (f & d) | (~f & e),
              d ^ e ^ f,
              e ^ (d | ~f),
            ][(k = l >> 4)] +
            a[l] +
            ~~h[b | ([l, 5 * l + 1, 3 * l + 5, 7 * l][k] & 15)]) <<
            (k = [
              7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21,
            ][4 * k + (l++ % 4)])) |
            (f >>> -k)),
        d,
        e,
      ]
    ) {
      d = k[1] | 0;
      e = k[2];
    }
    for (l = 4; l; ) {
      g[--l] += k[l];
    }
  }
  let result = "";
  for (let l = 0; l < 32; ) {
    result += ((g[l >> 3] >> (4 * (1 ^ l++))) & 15).toString(16);
  }
  return result.split("").reverse().join("");
}

function generateTryitKey() {
  const randomStr = Math.round(Math.random() * 100000000000).toString();
  const hash = myhashfunction(
    UA +
      myhashfunction(
        UA +
          myhashfunction(
            UA + randomStr + "hackers_become_a_little_stinkier_every_time_they_hack"
          )
      )
  );
  return `tryit-${randomStr}-${hash}`;
}

async function deepaiSignup(email, password) {
  const jar = new CookieJar();
  const client = wrapper(
    axios.create({ jar, withCredentials: true, timeout: 30000 })
  );
  await client.get(PAGE, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": UA,
      referer: "https://www.google.com/",
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "navigate",
      "upgrade-insecure-requests": "1",
    },
  });
  const loginCheckForm = new FormData();
  loginCheckForm.append("email", email);
  await client.post(`${API}/get_user_login_type`, loginCheckForm, {
    headers: {
      ...loginCheckForm.getHeaders(),
      origin: HOME,
      referer: PAGE,
      "user-agent": UA,
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
    },
  });
  await client.post(
    `${API}/save_custom_signup_data`,
    {
      referrer: `[][/machine-learning-model/image-editor]`,
      signup_page: "/machine-learning-model/image-editor",
      desired_username: null,
    },
    {
      headers: {
        "content-type": "application/json",
        origin: HOME,
        referer: PAGE,
        "user-agent": UA,
        "sec-fetch-site": "same-site",
        "sec-fetch-mode": "cors",
      },
    }
  );
  const regForm = new FormData();
  regForm.append("email", email);
  regForm.append("username", email);
  regForm.append("password1", password);
  regForm.append("password2", password);
  await client.post(`${API}/daily-time-sync/registration/`, regForm, {
    headers: {
      ...regForm.getHeaders(),
      origin: HOME,
      referer: PAGE,
      "user-agent": UA,
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
    },
  });
  const cookies = jar.getCookiesSync(HOME);
  return {
    sessionId: cookies.find((c) => c.key === "sessionid")?.value,
    csrfToken: cookies.find((c) => c.key === "csrftoken")?.value,
  };
}

async function editImage(sessionId, csrfToken, tryitKey) {
  const jar = new CookieJar();
  jar.setCookieSync(
    `sessionid=${sessionId}; Domain=.deepai.org; Path=/; Secure; SameSite=None`,
    HOME
  );
  jar.setCookieSync(`csrftoken=${csrfToken}; Path=/; SameSite=Lax`, HOME);
  jar.setCookieSync("user_sees_ads=true", HOME);

  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      timeout: 180000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })
  );

  const form = new FormData();
  form.append("image", fs.createReadStream(IMAGE_PATH), {
    filename: path.basename(IMAGE_PATH),
    contentType: "image/jpeg",
  });
  form.append("text", PROMPT);
  form.append("image_generator_version", "standard");

  const res = await client.post(`${API}/api/image-editor`, form, {
    headers: {
      ...form.getHeaders(),
      "api-key": tryitKey,
      origin: HOME,
      referer: PAGE,
      "user-agent": UA,
    },
  });

  if (res.status !== 200 || !res.data?.output_url) {
    throw new Error(`Edit gagal: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {}
  return null;
}

function saveCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

async function main() {
  let cache = loadCache();

  if (!cache || cache.usageCount >= 3) {
    const { address: email, visitorId } = await getTempMailAddress();
    const password = randomPassword();
    const { sessionId, csrfToken } = await deepaiSignup(email, password);
    const verifyMsg = await waitForEmail(visitorId);
    const verifyLink = extractVerificationLink(verifyMsg.content);
    if (verifyLink) await axios.get(verifyLink);

    cache = {
      email,
      password,
      sessionId,
      csrfToken,
      visitorId,
      usageCount: 0,
    };
    saveCache(cache);
  }

  const tryitKey = generateTryitKey();
  const result = await editImage(cache.sessionId, cache.csrfToken, tryitKey);

  console.log(
    JSON.stringify(
      {
        Status: true,
        Code: 200,
        Input: IMAGE_PATH,
        Prompt: PROMPT,
        Result_url: result.output_url,
      },
      null,
      2
    )
  );

  cache.usageCount += 1;
  saveCache(cache);
}

main().catch((err) => {
  console.log(
    JSON.stringify(
      {
        Status: false,
        Code: err.response?.status || 500,
        Input: IMAGE_PATH,
        Prompt: PROMPT,
        Result_url: null,
        Error: err.message,
        Response: err.response?.data || null,
      },
      null,
      2
    )
  );
  process.exit(1);
});