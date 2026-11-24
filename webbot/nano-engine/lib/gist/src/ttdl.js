import axios from "axios";
import * as cheerio from "cheerio";
import { decode } from "html-entities";

const INPUT_URL = "https://www.tiktok.com/@pure_imaginee/video/7520488430921354503?is_from_webapp=1&sender_device=pc";
const LANG = "id";
const CF_CLEARANCE = "";

const BASE_URL = "https:/ikdownloader.io";
const API_URL = `${BASE_URL}/api/ajaxSearch`;

function cleanUrl(url) {
  if (!url) return null;
  return decode(url).replaceAll("&amp;", "&");
}

function parseHtml(html) {
  const $ = cheerio.load(html);

  const title = $(".content h3").first().text().trim() || null;
  const thumbnail = cleanUrl($(".thumbnail img").first().attr("src"));
  const tiktokId = $("#TikTokId").attr("value") || null;

  const downloads = [];

  $(".dl-action a").each((_, el) => {
    const label = $(el).text().replace(/\s+/g, " ").trim();
    const url = cleanUrl($(el).attr("href"));

    if (url) {
      downloads.push({
        Type: label || null,
        Url: url
      });
    }
  });

  const videoPreview = cleanUrl($("#vid").attr("data-src"));
  const poster = cleanUrl($("#vid").attr("poster"));

  const scriptText = $("script").map((_, el) => $(el).html()).get().join("\n");

  const kExp = scriptText.match(/k_exp\s*=\s*"([^"]+)"/)?.[1] || null;
  const kToken = scriptText.match(/k_token\s*=\s*"([^"]+)"/)?.[1] || null;
  const kConvert = scriptText.match(/k_url_convert\s*=\s*"([^"]+)"/)?.[1] || null;

  return {
    Title: title,
    TikTok_id: tiktokId,
    Thumbnail: thumbnail,
    Poster: poster,
    Preview_video: videoPreview,
    Downloads: downloads,
    Convert: {
      Exp: kExp,
      Token: kToken,
      Url: kConvert
    }
  };
}

async function tikDownloader(url) {
  const started = Date.now();

  try {
    const cookie = CF_CLEARANCE ? `cf_clearance=${CF_CLEARANCE}` : "";

    const res = await axios.post(
      API_URL,
      new URLSearchParams({
        q: url,
        lang: LANG
      }).toString(),
      {
        timeout: 60000,
        validateStatus: () => true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "Origin": BASE_URL,
          "Referer": `${BASE_URL}/id`,
          ...(cookie ? { Cookie: cookie } : {})
        }
      }
    );

    const data = res.data;

    if (typeof data !== "object") {
      return {
        Status: false,
        Code: res.status,
        Input: url,
        Error: "Response bukan JSON",
        Raw: String(data).slice(0, 1000),
        Time_ms: Date.now() - started
      };
    }

    if (data.status !== "ok") {
      return {
        Status: false,
        Code: res.status,
        Input: url,
        Api_status: data.status || null,
        Error: data.message || data.error || "Request gagal",
        Raw: data,
        Time_ms: Date.now() - started
      };
    }

    const result = parseHtml(data.data || "");

    return {
      Status: true,
      Code: res.status,
      Input: url,
      Lang: LANG,
      Result: result,
      Time_ms: Date.now() - started
    };
  } catch (err) {
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: url,
      Error: err.message,
      Time_ms: Date.now() - started
    };
  }
}

const result = await tikDownloader(INPUT_URL);
console.log(JSON.stringify(result, null, 2));