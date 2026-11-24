import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";

const API = "https://litterbox.catbox.moe/resources/internals/api.php";
const INPUT = "/home/container/assets/Xter.png";
const EXPIRE = "1h";

async function upload() {
  const form = new FormData();

  form.append("reqtype", "fileupload");
  form.append("time", EXPIRE);
  form.append("fileToUpload", fs.createReadStream(INPUT), {
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
      "user-agent": "Mozilla/5.0"
    }
  });

  const url =
    typeof res.data === "string" && res.data.trim().startsWith("https://")
      ? res.data.trim()
      : null;

  return {
    Status: res.status === 200 && !!url,
    Code: res.status,
    Input: INPUT,
    Result_url: url || res.data
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

// EXPIRE Litterbox:
// 1h  = 1 jam
// 12h = 12 jam
// 24h = 24 jam
// 72h = 72 jam