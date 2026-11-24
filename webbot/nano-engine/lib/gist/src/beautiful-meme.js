import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG = {
  image1: "https://i.pinimg.com/originals/a4/3d/51/a43d516ebf188c59c6c4dbc917844c82.jpg",
  image2: "https://i.pinimg.com/originals/a4/3d/51/a43d516ebf188c59c6c4dbc917844c82.jpg"
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const BG_URL = "https://cdn.jsdelivr.net/gh/Ditzzx-vibecoder/Assets@main/Image/2image.jpeg";
const CANVAS_SIZE = { width: 1217, height: 1280 };

const ASSETS_DIR = join(__dirname, 'assets', 'beautiful');
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? join(__dirname, 'output');

async function download(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  if (!res.ok) throw new Error(`Fetch failed ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function prepareAssets() {
  await mkdir(ASSETS_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const bgLocal = join(ASSETS_DIR, '2image.jpeg');
  if (!existsSync(bgLocal)) {
    await writeFile(bgLocal, await download(BG_URL));
  }

  return bgLocal;
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx, sy, sw, sh;

  if (imgRatio > targetRatio) {
    sh = img.height;
    sw = sh * targetRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

async function drawScene() {
  const bgLocal = await prepareAssets();
  const canvas = createCanvas(CANVAS_SIZE.width, CANVAS_SIZE.height);
  const ctx = canvas.getContext('2d');

  const bgImg = await loadImage(bgLocal);
  ctx.drawImage(bgImg, 0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

  ctx.save();
  const img1 = await loadImage(CONFIG.image1);
  drawImageCover(ctx, img1, 833, 61, 305, 344);
  ctx.restore();

  ctx.save();
  const img2 = await loadImage(CONFIG.image2);
  drawImageCover(ctx, img2, 841, 719, 299, 348);
  ctx.restore();

  const outFile = join(OUTPUT_DIR, `beautiful-${Date.now()}.png`);
  const pngData = await canvas.encode('png');
  await writeFile(outFile, pngData);
  console.log('Output:', outFile);
  
  return outFile;
}

drawScene().catch(err => {
  console.error('Error:', err.message || err);
  process.exit(1);
});