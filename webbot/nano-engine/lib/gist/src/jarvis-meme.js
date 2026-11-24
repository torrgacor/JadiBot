import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG = {
  text: "Jarvis, tolong diapakan dulu apa itu biar ga apa kali"
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const BG_URL = "https://cdn.jsdelivr.net/gh/Ditzzx-vibecoder/Assets@main/Image/jarvismeme.png";
const FONT_URL = "https://cdn.jsdelivr.net/gh/adrienverge/copr-some-nice-fonts@master/ArialBd.ttf";
const CANVAS_SIZE = { width: 735, height: 678 };

const ASSETS_DIR = join(__dirname, 'assets', 'jarvismeme');
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

  const bgLocal = join(ASSETS_DIR, 'jarvismeme.png');
  if (!existsSync(bgLocal)) {
    await writeFile(bgLocal, await download(BG_URL));
  }

  const fontLocal = join(ASSETS_DIR, 'ArialBd.ttf');
  if (!existsSync(fontLocal)) {
    await writeFile(fontLocal, await download(FONT_URL));
  }

  GlobalFonts.registerFromPath(fontLocal, 'ARIALBD');

  return bgLocal;
}

function drawTextInSafeZone(ctx, text, zone, initialFontSize, align) {
  let fontSize = initialFontSize;
  let lines = [];
  let lh = fontSize * 1.2;

  while (fontSize > 10) {
    lh = fontSize * 1.2;
    ctx.font = `500 ${fontSize}px ARIALBD, sans-serif`;
    lines = [];
    let fits = true;
    
    const paragraphs = text.split('\n');
    for (const p of paragraphs) {
      let cur = '';
      const words = p.split(' ');
      
      for (const w of words) {
        const t = cur ? cur + ' ' + w : w;
        if (ctx.measureText(t).width > zone.w) {
          if (cur) {
            lines.push(cur);
            cur = w;
            if (ctx.measureText(w).width > zone.w) {
              fits = false;
              break;
            }
          } else {
            fits = false;
            break;
          }
        } else {
          cur = t;
        }
      }
      if (!fits) break;
      lines.push(cur);
    }

    if (fits && (lines.length * lh) <= zone.h) {
      break; 
    }

    fontSize -= 2;
  }

  ctx.font = `500 ${fontSize}px ARIALBD, sans-serif`;
  ctx.fillStyle = '#111111';
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;

  const drawX = align === 'center' ? zone.x + zone.w / 2 : align === 'right' ? zone.x + zone.w : zone.x;
  
  ctx.save();
  ctx.beginPath();
  ctx.rect(zone.x, zone.y, zone.w, zone.h);
  ctx.clip();
  
  const startY = zone.y + zone.h / 2 - (lines.length * lh) / 2 + lh / 2;
  lines.forEach((l, i) => ctx.fillText(l, drawX, startY + i * lh));
  ctx.restore();
}

async function drawScene() {
  const bgLocal = await prepareAssets();
  const canvas = createCanvas(CANVAS_SIZE.width, CANVAS_SIZE.height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

  const bgImg = await loadImage(bgLocal);
  ctx.drawImage(bgImg, 0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

  ctx.save();
  const safeZone_el1 = { x: 20, y: 3, w: 695, h: 237 };
  drawTextInSafeZone(ctx, CONFIG.text, safeZone_el1, 100, 'center');
  ctx.restore();

  const outFile = join(OUTPUT_DIR, `jarvismeme-${Date.now()}.png`);
  const pngData = await canvas.encode('png');
  await writeFile(outFile, pngData);
  console.log('Output:', outFile);
  
  return outFile;
}

drawScene().catch(err => {
  console.error('Error:', err.message || err);
  process.exit(1);
});