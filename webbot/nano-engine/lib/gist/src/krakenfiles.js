import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";

const API = "https://hs9.krakencloud.net/_uploader/gallery/upload";
const INPUT = "/home/container/assets/Yol.png";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

async function getSourceUrl(viewUrl) {
  const res = await axios.get(viewUrl, {
    timeout: 60000,
    validateStatus: () => true,
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      referer: "https://krakenfiles.com/"
    }
  });

  const $ = cheerio.load(res.data || "");

  return (
    $("#link1").attr("value")?.trim() ||
    $('meta[property="og:image"]').attr("content")?.trim() ||
    $(".image-preview a[href]").attr("href")?.trim() ||
    null
  );
}

async function upload() {
  const form = new FormData();

  form.append("files[]", fs.createReadStream(INPUT), {
    filename: path.basename(INPUT),
    contentType: "application/octet-stream"
  });

  const res = await axios.post(API, form, {
    timeout: 120000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      accept: "application/json, text/javascript, */*; q=0.01",
      origin: "https://krakenfiles.com",
      referer: "https://krakenfiles.com/",
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

  const viewUrl = res.data?.files?.[0]?.url || null;
  const error = res.data?.files?.[0]?.error || "";

  if (!viewUrl || error) {
    return {
      Status: false,
      Code: res.status,
      Input: INPUT,
      Result_url: res.data
    };
  }

  const sourceUrl = await getSourceUrl(viewUrl);

  return {
    Status: res.status === 200 && !!sourceUrl,
    Code: res.status,
    Input: INPUT,
    Result_url: sourceUrl || viewUrl
  };
}

upload()
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: err.response?.status || 500,
          Input: INPUT,
          Result_url: err.message
        },
        null,
        2
      )
    );
  });