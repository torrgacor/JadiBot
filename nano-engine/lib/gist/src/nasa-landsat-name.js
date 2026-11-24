import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BASE = "https://science.nasa.gov";
const REFERER = "https://science.nasa.gov/specials/your-name-in-landsat/";
const INPUT = process.argv.slice(2).join(" ") || "Ditzzx";
const OUTPUT_DIR = path.join(process.cwd(), "landsat-output");
const FINAL_OUTPUT = path.join(OUTPUT_DIR, `${INPUT.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-landsat.jpg`);

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const LETTER_WIDTH = 250;
const LETTER_HEIGHT = 600;
const GAP = 10;
const BG = { r: 0, g: 0, b: 0, alpha: 1 };

function cleanName(text) {
  return String(text).toLowerCase().replace(/[^a-z]/g, "");
}

function imageUrl(letter, index = 0) {
  return `${BASE}/specials/your-name-in-landsat/images/${letter}_${index}.jpg`;
}

function headers() {
  return {
    "user-agent": UA,
    "sec-ch-ua-platform": "\"Android\"",
    "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
    "sec-ch-ua-mobile": "?1",
    "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-dest": "image",
    "referer": REFERER,
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
  };
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: headers()
  });

  const buffer = Buffer.from(await res.arrayBuffer());

  if (!res.ok) {
    throw new Error(`Gagal mengambil ${url} (${res.status})`);
  }

  return {
    code: res.status,
    contentType: res.headers.get("content-type"),
    size: buffer.length,
    buffer
  };
}

async function resizeLetter(buffer) {
  return sharp(buffer)
    .resize(LETTER_WIDTH, LETTER_HEIGHT, {
      fit: "cover",
      position: "center"
    })
    .jpeg({ quality: 95 })
    .toBuffer();
}

async function mergeImages(items) {
  const width = items.length * LETTER_WIDTH + Math.max(0, items.length - 1) * GAP;
  const height = LETTER_HEIGHT;

  const composite = items.map((item, i) => ({
    input: item.buffer,
    left: i * (LETTER_WIDTH + GAP),
    top: 0
  }));

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG
    }
  })
    .composite(composite)
    .jpeg({ quality: 95 })
    .toFile(FINAL_OUTPUT);

  return {
    path: FINAL_OUTPUT,
    width,
    height
  };
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const name = cleanName(INPUT);

  if (!name) {
    throw new Error("Input harus berisi huruf A-Z");
  }

  const letters = [];

  for (let i = 0; i < name.length; i++) {
    const letter = name[i];
    const url = imageUrl(letter, 0);
    const data = await downloadBuffer(url);
    const resized = await resizeLetter(data.buffer);

    letters.push({
      letter,
      url,
      code: data.code,
      contentType: data.contentType,
      size: data.size,
      buffer: resized
    });
  }

  const final = await mergeImages(letters);

  console.log(JSON.stringify({
    Status: true,
    Code: 200,
    Input: INPUT,
    Name: name,
    Total: letters.length,
    Result: final.path,
    Metadata: {
      Width: final.width,
      Height: final.height,
      Letter_width: LETTER_WIDTH,
      Letter_height: LETTER_HEIGHT,
      Gap: GAP,
      Images: letters.map(x => ({
        Letter: x.letter,
        Url: x.url,
        Code: x.code,
        Content_type: x.contentType,
        Size: x.size
      }))
    }
  }, null, 2));
}

main().catch(err => {
  console.log(JSON.stringify({
    Status: false,
    Code: 500,
    Input: INPUT,
    Result: null,
    Error: err.message
  }, null, 2));
});