import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const MUROTAL = "abdul rahman sudais";
const SURAT = "al-waqiah";

const MUROTAL_TXT = "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/murotal-list.txt";
const SURAT_TXT = "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/surat-list-sds.txt";

const BASE = "https://www.mp3quran.net";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const jar = new CookieJar();

const client = wrapper(axios.create({
  jar,
  withCredentials: true,
  timeout: 30000,
  maxRedirects: 5,
  validateStatus: () => true,
  headers: {
    "user-agent": UA,
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
  }
}));

function out(data) {
  console.log(JSON.stringify(data, null, 2));
}

function normalize(str = "") {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "")
    .trim();
}

function levenshtein(a, b) {
  a = normalize(a);
  b = normalize(b);

  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function score(input, target) {
  const a = normalize(input);
  const b = normalize(target);

  if (!a || !b) return 999999;
  if (a === b) return 0;
  if (b.includes(a) || a.includes(b)) return 1;

  const distance = levenshtein(a, b);
  const max = Math.max(a.length, b.length, 1);

  return distance / max;
}

function findBest(input, list, keys) {
  let best = null;

  for (const item of list) {
    const values = keys.map(k => item[k]).filter(Boolean);
    const current = Math.min(...values.map(v => score(input, v)));

    if (!best || current < best.score) {
      best = {
        score: current,
        item
      };
    }
  }

  return best;
}

async function getXsrfToken(url = BASE) {
  const res = await client.get(url, {
    responseType: "text",
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  return res.status;
}

async function readText(url) {
  const res = await client.get(url, {
    responseType: "text",
    headers: {
      accept: "text/plain,*/*"
    }
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Gagal mengambil txt: ${res.status}`);
  }

  return String(res.data);
}

function parseMurotalList(text) {
  const blocks = text
    .split(/\n(?=\d+\.\s+)/g)
    .map(x => x.trim())
    .filter(Boolean);

  return blocks.map(block => {
    const name = block.match(/^\d+\.\s+(.+)$/m)?.[1]?.trim() || null;
    const slug = block.match(/^\s*Slug:\s*(.+)$/m)?.[1]?.trim() || null;
    const page = block.match(/^\s*Page:\s*(.+)$/m)?.[1]?.trim() || null;
    const downloads = block.match(/^\s*Downloads:\s*(.+)$/m)?.[1]?.trim() || null;

    return {
      name,
      slug,
      page,
      downloads
    };
  }).filter(x => x.name && x.slug);
}

function parseSuratList(text) {
  const murotal = text.match(/^Murotal:\s*(.+)$/m)?.[1]?.trim() || null;
  const slug = text.match(/^Slug:\s*(.+)$/m)?.[1]?.trim() || null;

  const lines = text
    .split(/\r?\n/g)
    .map(x => x.trim())
    .filter(Boolean);

  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const simple = line.match(/^(\d{3})\.\s*(.+?)\s*\|\s*(https?:\/\/\S+)$/);
    const detail = line.match(/^(\d{3})\.\s*(.+)$/);

    if (simple) {
      const name = simple[2].trim();

      result.push({
        number: simple[1],
        name,
        clean_name: name.replace(/\s*\(.+?\)\s*$/g, "").trim(),
        meaning: name.match(/\((.+?)\)\s*$/)?.[1]?.trim() || null,
        download: simple[3].trim()
      });

      continue;
    }

    if (detail) {
      const number = detail[1];
      const name = detail[2].trim();
      const next = lines.slice(i + 1, i + 5);
      const downloadLine = next.find(x => /^Download:\s*/i.test(x) || /^Audio:\s*/i.test(x));
      const download = downloadLine?.replace(/^(Download|Audio):\s*/i, "").trim() || null;

      if (download && /^https?:\/\//i.test(download)) {
        result.push({
          number,
          name,
          clean_name: name.replace(/\s*\(.+?\)\s*$/g, "").trim(),
          meaning: name.match(/\((.+?)\)\s*$/)?.[1]?.trim() || null,
          download
        });
      }
    }
  }

  const unique = [];
  const seen = new Set();

  for (const item of result) {
    if (seen.has(item.number)) continue;
    seen.add(item.number);
    unique.push(item);
  }

  return {
    murotal,
    slug,
    result: unique
  };
}

async function checkAudio(url) {
  try {
    const res = await client.get(url, {
      responseType: "stream",
      headers: {
        accept: "*/*",
        referer: BASE,
        range: "bytes=0-0"
      }
    });

    if (res.data?.destroy) res.data.destroy();

    return {
      code: res.status
    };
  } catch {
    return {
      code: null
    };
  }
}

async function main() {
  await getXsrfToken(`${BASE}/id`);

  const murotalText = await readText(MUROTAL_TXT);
  const suratText = await readText(SURAT_TXT);

  const murotalList = parseMurotalList(murotalText);
  const suratData = parseSuratList(suratText);

  if (!murotalList.length) {
    return out({
      Status: false,
      Code: 404,
      Name_murotal: null,
      Surat: null,
      Result_url: null,
      Message: "murotal-list.txt kosong atau format tidak cocok"
    });
  }

  if (!suratData.result.length) {
    return out({
      Status: false,
      Code: 404,
      Name_murotal: null,
      Surat: null,
      Result_url: null,
      Message: "surat-list-sds.txt kosong atau format tidak cocok"
    });
  }

  const murotalMatch = findBest(MUROTAL, murotalList, ["name", "slug"]);
  const murotal = murotalMatch.item;

  const suratInput = String(SURAT).trim();

  const suratMatch = /^\d+$/.test(suratInput)
    ? {
        score: 0,
        item: suratData.result.find(x => Number(x.number) === Number(suratInput))
      }
    : findBest(suratInput, suratData.result, ["name", "clean_name", "meaning", "number"]);

  if (!suratMatch?.item) {
    return out({
      Status: false,
      Code: 404,
      Name_murotal: murotal.name,
      Surat: null,
      Result_url: null,
      Message: "Surat tidak ditemukan dari txt"
    });
  }

  const audio = await checkAudio(suratMatch.item.download);

  out({
    Status: true,
    Code: audio.code || 200,
    Name_murotal: murotal.name,
    Surat: suratMatch.item.name,
    Result_url: suratMatch.item.download
  });
}

main().catch(err => {
  out({
    Status: false,
    Code: 500,
    Name_murotal: null,
    Surat: null,
    Result_url: null,
    Message: err.message
  });
});