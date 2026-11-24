import axios from "axios";
import FormData from "form-data";
import QRCode from "qrcode";
import mime from "mime-types";
import fs from "node:fs";
import path from "node:path";

const API = "https://uguu.se/upload.php";
const INPUT = "/home/container/assets/Lobby.jpg";
const OUTPUT_DIR = "./qrcode";
const OUTPUT_FILE = path.join(OUTPUT_DIR, `qr-uguu-${Date.now()}.png`);

const SIZE = 1024;
const FOREGROUND = "000000";
const BACKGROUND = "FFFFFF";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function hex(color) {
  return color.startsWith("#") ? color : `#${color}`;
}

async function uploadFile() {
  if (!fs.existsSync(INPUT)) {
    throw new Error(`File tidak ditemukan: ${INPUT}`);
  }

  const form = new FormData();
  const mimeType = mime.lookup(INPUT) || "application/octet-stream";

  form.append("files[]", fs.createReadStream(INPUT), {
    filename: path.basename(INPUT),
    contentType: mimeType
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

  const url = res.data?.files?.[0]?.url || null;

  if (res.status !== 200 || res.data?.success !== true || !url) {
    throw new Error(JSON.stringify(res.data));
  }

  return url;
}

async function makeQr(url) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await QRCode.toFile(OUTPUT_FILE, url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4,
    width: SIZE,
    color: {
      dark: hex(FOREGROUND),
      light: hex(BACKGROUND)
    }
  });

  return path.resolve(OUTPUT_FILE);
}

async function main() {
  try {
    const uploadedUrl = await uploadFile();
    const qrPath = await makeQr(uploadedUrl);

    console.log(JSON.stringify({
      Status: true,
      Code: 200,
      Input: INPUT,
      Result_url: qrPath
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: err.response?.status || 500,
      Input: INPUT,
      Result_url: err.message
    }, null, 2));
  }
}

main();

/*
CARA PAKAI:

1. Install module:
   npm i axios form-data qrcode mime-types

2. Simpan kode sebagai:
   qr-uguu.mjs

3. Ubah file yang mau dijadikan QR di bagian:
   const INPUT = "/home/container/assets/Lol.png";

4. Jalankan:
   node qr-uguu.mjs

OUTPUT:

{
  "Status": true,
  "Code": 200,
  "Input": "/home/container/assets/Lol.png",
  "Result_url": "/home/container/downloads/qr-uguu-xxxx.png"
}

CONTOH INPUT:

1. Image:
   const INPUT = "/home/container/assets/foto.jpg";

2. Video:
   const INPUT = "/home/container/assets/video.mp4";

3. Audio:
   const INPUT = "/home/container/assets/audio.mp3";

4. PDF:
   const INPUT = "/home/container/assets/dokumen.pdf";

5. ZIP / file lain:
   const INPUT = "/home/container/assets/file.zip";

CARA NGUBAH SETTING:

1. Ubah tempat hosting:
   const API = "https://uguu.se/upload.php";

   Bisa diganti ke hosting lain, tapi function uploadFile()
   harus disesuaikan dengan format request dan response hosting tersebut.

   Contoh yang sekarang dipakai:
   - Method: POST
   - Form field: files[]
   - Response URL: res.data.files[0].url

2. Ubah ukuran QR:
   const SIZE = 1024;

3. Ubah warna QR:
   const FOREGROUND = "000000";

4. Ubah warna background:
   const BACKGROUND = "FFFFFF";

5. Ubah folder output:
   const OUTPUT_DIR = "./downloads";

CATATAN:

- Output QR selalu PNG.
- QR berisi URL hasil upload, bukan isi file mentah.
- Image, video, audio, PDF, ZIP, dan file lain bisa dipakai selama hosting menerima file tersebut.
- Uguu adalah temporary hosting, jadi URL bisa expired.
- Kalau mau link lebih tahan lama, ganti API ke file hosting lain dan sesuaikan parsing response-nya.
- Untuk Google Lens lebih aman pakai PNG.
- Jangan pakai warna QR dan background yang terlalu mirip.
- File besar membuat proses upload lebih lama, tapi QR tetap hanya berisi URL.
*/