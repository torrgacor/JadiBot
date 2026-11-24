import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import FormData from "form-data";

const API = "https://pone.rs/upload.php";
const INPUT = "/home/container/assets/rank/glory.webp";

async function uploadPone(input = INPUT) {
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

  form.append("files[]", fs.createReadStream(filePath), {
    filename: path.basename(filePath)
  });

  try {
    const res = await axios.post(API, form, {
      headers: {
        ...form.getHeaders(),
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "accept": "*/*",
        "origin": "https://pone.rs",
        "referer": "https://pone.rs/"
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true
    });

    const data = res.data;
    const url = data?.files?.[0]?.url?.replaceAll("\\/", "/") || null;

    return {
      Status: Boolean(data?.success && url),
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
      Error: err.message
    };
  }
}

uploadPone().then(result => {
  console.log(JSON.stringify(result, null, 2));
});

export { uploadPone };