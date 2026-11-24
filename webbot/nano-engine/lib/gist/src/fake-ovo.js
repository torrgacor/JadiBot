const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "tmp");

const IMAGE_URL =
  "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Image/file_0000000078bc71fa87da5cf26dc6c008.jpeg";

const WIDTH = 841;
const HEIGHT = 1870;

const OUTPUT = path.join(OUTPUT_DIR, `ovo-rp0-${Date.now()}.png`);

const AMOUNT_INPUT = "5000002828";

const FONT_PATHS = [
  path.join(
    ROOT,
    "node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2"
  ),
  path.join(
    ROOT,
    "node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-600-normal.woff2"
  ),
];

const FIXED_RP = Object.freeze({
  text: "Rp",
  x: 61,
  y: 368,
  size: 20,
  weight: 800,
});

const AMOUNT_STYLE = {
  x: 94,
  y: 371,
  size: 28,
  weight: 800,
  color: "#FFFFFF",
};

function formatAmount(input) {
  const digits = String(input).replace(/[^\d]/g, "") || "0";
  const normalized = digits.replace(/^0+(?=\d)/, "");

  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function registerFont() {
  for (const fontPath of FONT_PATHS) {
    if (fs.existsSync(fontPath)) {
      GlobalFonts.registerFromPath(fontPath, "Plus Jakarta Sans");
      return;
    }
  }

  throw new Error("Font Plus Jakarta Sans tidak ketemu");
}

async function loadImageFromUrl(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Gagal download image: HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return loadImage(Buffer.from(arrayBuffer));
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, {
    recursive: true,
  });

  registerFont();

  const image = await loadImageFromUrl(IMAGE_URL);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = AMOUNT_STYLE.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.font = `${FIXED_RP.weight} ${FIXED_RP.size}px "Plus Jakarta Sans"`;
  ctx.fillText(FIXED_RP.text, FIXED_RP.x, FIXED_RP.y);

  const AMOUNT_TEXT = formatAmount(AMOUNT_INPUT);

  ctx.font = `${AMOUNT_STYLE.weight} ${AMOUNT_STYLE.size}px "Plus Jakarta Sans"`;
  ctx.fillText(AMOUNT_TEXT, AMOUNT_STYLE.x, AMOUNT_STYLE.y);

  const buffer = await canvas.encode("png");
  await fsp.writeFile(OUTPUT, buffer);

  console.log({
    Status: true,
    Code: 200,
    AmountInput: AMOUNT_INPUT,
    AmountText: AMOUNT_TEXT,
    Output: OUTPUT,
    Size: `${WIDTH}x${HEIGHT}`,
  });
}

main().catch((err) => {
  console.log({
    Status: false,
    Code: 500,
    Error: err.message,
  });
});