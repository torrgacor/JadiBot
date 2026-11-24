import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";

const API = "https://uguu.se/upload.php";
const INPUT = "/home/container/assets/Lol.png";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

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
      accept: "*/*",
      origin: "https://uguu.se",
      referer: "https://uguu.se/",
      "user-agent": UA,
      "sec-ch-ua": '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const resultUrl = res.data?.files?.[0]?.url || null;

  return {
    Status: res.status === 200 && res.data?.success === true && !!resultUrl,
    Code: res.status,
    Input: INPUT,
    Result_url: resultUrl || res.data
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