import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";

const API = "https://tmpfiles.org/api/v1/upload";
const INPUT = "/home/container/assets/IMG-20260522-WA0021.jpg";
const EXPIRE = 21600;

async function upload() {
  const form = new FormData();

  form.append("file", fs.createReadStream(INPUT), {
    filename: path.basename(INPUT),
    contentType: "application/octet-stream"
  });

  form.append("expire", String(EXPIRE));

  const res = await axios.post(API, form, {
    timeout: 120000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      accept: "application/json",
      "user-agent": "Mozilla/5.0"
    }
  });

  const url = res.data?.data?.url || null;

  return {
    Status: res.status === 200 && res.data?.status === "success" && !!url,
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

// EXPIRE adalah durasi file tersimpan sebelum otomatis dihapus.
// Nilainya dalam detik, minimal 60 detik dan maksimal 172800 detik.
// 60 = 1 menit
// 3600 = 1 jam
// 21600 = 6 jam
// 43200 = 12 jam
// 86400 = 24 jam
// 172800 = 48 jam
// Jika expire tidak dikirim, default dari API adalah 3600 detik atau 1 jam.