import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import FormData from "form-data";

const API = "https://kappa.lol/api/upload";
const INPUT = "/home/container/example/avatar.jpg";

async function uploadKappa(input = INPUT) {
  const filePath = path.resolve(input);

  if (!fs.existsSync(filePath)) {
    return {
      Status: false,
      Code: 404,
      Input: input,
      Result_url: null,
      Error: "File tidak ditemukan"
    };
  }

  const form = new FormData();

  form.append("file", fs.createReadStream(filePath), {
    filename: path.basename(filePath)
  });

  try {
    const res = await axios.post(API, form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "Accept": "*/*",
        "Origin": "https://kappa.lol",
        "Referer": "https://kappa.lol/"
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true
    });

    const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    const url = data?.link || null;

    return {
      Status: Boolean(url),
      Code: res.status,
      Input: input,
      Result_url: url
    };
  } catch (err) {
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: input,
      Result_url: null,
      Error: err.message,
      Response: typeof err.response?.data === "string" ? err.response.data.slice(0, 500) : err.response?.data || null
    };
  }
}

uploadKappa().then(result => {
  console.log(JSON.stringify(result, null, 2));
});

export { uploadKappa };