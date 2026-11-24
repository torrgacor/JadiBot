import fs from "fs";
import path from "path";

const INPUT_FILE_PATH = "/home/container/Gyji.png";

const filePath = INPUT_FILE_PATH;
const fileBuffer = fs.readFileSync(filePath);
const fileName = path.basename(filePath);

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
let randomPart = "";
for (let i = 0; i < 16; i++) {
  randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
}
const boundary = `WebKitFormBoundary${randomPart}`;

const head = Buffer.from(
  `------${boundary}\r\n` +
  `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
  `Content-Type: image/png\r\n\r\n`
);
const tail = Buffer.from(`\r\n------${boundary}--\r\n`);

const body = Buffer.concat([head, fileBuffer, tail]);

const response = await fetch("https://unggah.web.id/api/unggah", {
  method: "POST",
  headers: {
    "content-type": `multipart/form-data; boundary=----${boundary}`,
    "accept": "*/*",
    "origin": "https://unggah.web.id",
    "referer": "https://unggah.web.id/pengunggah",
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"
  },
  body
});

const status = response.status;
const result = await response.json();

const output = {
  status: status === 201 ? "success" : "failed",
  code: status,
  input: filePath,
  result_url: result.url || null
};

console.log(JSON.stringify(output, null, 2));
