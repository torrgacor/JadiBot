import axios from "axios";
import forge from "node-forge";
import crypto from "node:crypto";

const INPUT = "https://www.facebook.com/share/v/1CGj5okEfF/";

const API = "https://api.hitube.io";
const WEB = "https://www.hitube.io";
const PUBLIC_KEY =
  "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCAdf/EyIbLBxjGqmh7qLU6/CPCzru+75+82OSPZ+nf4BFvg88drpZ6KigNW0J8TNgxe6Yms1irCZNVDyu+RXsl4y/7c2KOHc4OGTzHB5fUMiMasFUvcEs2P70e6yA/sKHZfBLG1XPhlb84Ibs3nhD3W5e2SuC+4EuVkaqzN08LQIDAQAB";

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function createSessionId() {
  const random = crypto.randomBytes(6).toString("base64url").slice(0, 10);
  return `hitube.io_${random}_${Date.now()}`;
}

function createSecureMessage() {
  const pem = `-----BEGIN PUBLIC KEY-----\n${PUBLIC_KEY.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
  const publicKey = forge.pki.publicKeyFromPem(pem);
  const encrypted = publicKey.encrypt(Date.now().toString(), "RSAES-PKCS1-V1_5");
  return forge.util.encode64(encrypted);
}

function mediaUrl(token, sessionid) {
  return `${API}/st-tik-video/token/${encodeURIComponent(token)}?sessionid=${encodeURIComponent(sessionid)}&wh=www.hitube.io`;
}

function mapMedia(item, sessionid) {
  const data = {
    Type: item.type || "file",
    Url: item.url ? mediaUrl(item.url, sessionid) : null
  };

  if (item.tag) data.Quality = item.tag;
  if (item.size) data.Size = item.size;
  if (item.cover) data.Cover = mediaUrl(item.cover, sessionid);
  if (item.thumb) data.Thumbnail = mediaUrl(item.thumb, sessionid);

  return data;
}

async function hitube(url = INPUT) {
  const sessionid = createSessionId();

  try {
    const res = await axios.get(`${API}/st-tik-video/fb/dl`, {
      timeout: 60000,
      validateStatus: () => true,
      params: {
        url,
        sessionid
      },
      headers: {
        "x-secure-message": createSecureMessage(),
        accept: "application/json, text/plain, */*",
        origin: WEB,
        referer: `${WEB}/`,
        "user-agent": UA
      }
    });

    const data = res.data;

    if (res.status !== 200 || data?.code !== 200) {
      return {
        Status: false,
        Code: data?.code || res.status,
        Input: url,
        Result: []
      };
    }

    const list = Array.isArray(data?.result?.fbBos) ? data.result.fbBos : [];
    const result = list.map(item => mapMedia(item, sessionid)).filter(item => item.Url);

    return {
      Status: result.length > 0,
      Code: data.code,
      Input: url,
      Result: result
    };
  } catch (e) {
    return {
      Status: false,
      Code: e.response?.status || 500,
      Input: url,
      Result: []
    };
  }
}

console.log(JSON.stringify(await hitube(), null, 2));