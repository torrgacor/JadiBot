import scribe from "scribe.js-ocr";
import path from "node:path";
import fs from "node:fs";

const INPUT = "/home/container/assets/brat.png";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"];
const PDF_EXTS = [".pdf"];

async function main() {
  try {
    if (!fs.existsSync(INPUT)) throw new Error(`File tidak ditemukan: ${INPUT}`);

    const ext = path.extname(INPUT).toLowerCase();
    const isImage = IMAGE_EXTS.includes(ext);
    const isPdf = PDF_EXTS.includes(ext);

    if (!isImage && !isPdf) {
      throw new Error(`Format tidak support: ${ext || "tanpa ekstensi"}`);
    }

    const text = await scribe.extractText([INPUT]);

    console.log(JSON.stringify({
      Status: true,
      Code: 200,
      Type: isPdf ? "pdf" : "image",
      Input: INPUT,
      Result: text.trim()
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: 500,
      Input: INPUT,
      Result: null,
      Error: err.message
    }, null, 2));
  } finally {
    await scribe.terminate?.();
  }
}

main();