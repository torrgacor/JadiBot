import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const API = "https://api.ocr.space/parse/image";
const API_KEY = "OCRonFrontpageOnly_26";

const INPUT = "/home/container/assets/IMG-20260528-WA0067.jpg";
const OUTPUT_TXT = "./ocr-result.txt";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tif", ".tiff"];
const PDF_EXTS = [".pdf"];

function getContentType(ext) {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".bmp") return "image/bmp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".tif" || ext === ".tiff") return "image/tiff";
  return "application/octet-stream";
}

function cleanOcrText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");
}

function normalizeSeparator(line) {
  const clean = String(line || "").trim();

  if (/^[\-\–\—_.*•=* ]{8,}$/.test(clean)) {
    return "----------------------------------------";
  }

  return line;
}

function buildLayoutFromOverlay(textOverlay) {
  const lines = textOverlay?.Lines || [];
  if (!lines.length) return "";

  const allWords = lines.flatMap(line => line.Words || []);
  if (!allWords.length) return "";

  const minLeft = Math.min(...allWords.map(w => Number(w.Left || 0)));
  const maxRight = Math.max(...allWords.map(w => Number(w.Left || 0) + Number(w.Width || 0)));
  const receiptWidth = Math.max(maxRight - minLeft, 1);

  const sortedLines = [...lines].sort((a, b) => {
    const topA = Number(a.MinTop ?? a.Words?.[0]?.Top ?? 0);
    const topB = Number(b.MinTop ?? b.Words?.[0]?.Top ?? 0);
    return topA - topB;
  });

  const output = [];
  let lastTop = null;
  let lastHeight = 12;

  for (const line of sortedLines) {
    const words = [...(line.Words || [])].sort((a, b) => Number(a.Left || 0) - Number(b.Left || 0));
    if (!words.length) continue;

    const top = Number(line.MinTop ?? words[0].Top ?? 0);
    const height = Number(line.MaxHeight ?? words[0].Height ?? 12);

    if (lastTop !== null && top - lastTop > lastHeight * 1.8) {
      output.push("----------------------------------------");
    }

    let row = "";

    for (const word of words) {
      const wordText = String(word.WordText || "").trim();
      if (!wordText) continue;

      const left = Number(word.Left || 0);
      const relative = (left - minLeft) / receiptWidth;
      const col = Math.max(0, Math.round(relative * 48));

      if (row.length < col) {
        row += " ".repeat(col - row.length);
      } else if (row && !row.endsWith(" ")) {
        row += " ";
      }

      row += wordText;
    }

    row = normalizeSeparator(row.trimEnd());

    if (row) output.push(row);

    lastTop = top;
    lastHeight = height;
  }

  return output
    .map(line => normalizeSeparator(line))
    .filter(Boolean)
    .filter((line, index, arr) => {
      return !(line === "----------------------------------------" && arr[index - 1] === "----------------------------------------");
    })
    .join("\n");
}

function getBestText(item) {
  if (item?.TextOverlay?.Lines?.length) {
    const overlayText = buildLayoutFromOverlay(item.TextOverlay);
    if (overlayText.trim()) return overlayText;
  }

  return cleanOcrText(item?.ParsedText || "");
}

async function ocrSpace(input) {
  if (!fs.existsSync(input)) throw new Error(`File tidak ditemukan: ${input}`);

  const ext = path.extname(input).toLowerCase();
  const isImage = IMAGE_EXTS.includes(ext);
  const isPdf = PDF_EXTS.includes(ext);

  if (!isImage && !isPdf) {
    throw new Error(`Format tidak support: ${ext || "unknown"}`);
  }

  const form = new FormData();

  form.append("file", fs.createReadStream(input), {
    filename: path.basename(input),
    contentType: getContentType(ext)
  });

  form.append("url", "");
  form.append("language", "eng");
  form.append("isOverlayRequired", "true");
  form.append("FileType", "Auto");
  form.append("IsCreateSearchablePDF", "false");
  form.append("isSearchablePdfHideTextLayer", "true");
  form.append("detectOrientation", "true");
  form.append("isTable", "true");
  form.append("scale", "false");
  form.append("OCREngine", "5");

  const res = await axios.post(API, form, {
    timeout: 120000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
    headers: {
      ...form.getHeaders(),
      apikey: API_KEY,
      accept: "application/json, text/javascript, */*; q=0.01",
      origin: "https://ocr.space",
      referer: "https://ocr.space/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"
    }
  });

  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`);
  }

  const data = res.data;

  if (data?.IsErroredOnProcessing) {
    const errorMessage =
      data?.ParsedResults?.[0]?.ErrorMessage ||
      data?.ErrorMessage?.join?.(", ") ||
      "OCR gagal";

    throw new Error(errorMessage);
  }

  const parsedResults = data?.ParsedResults || [];

  const textResult = parsedResults
    .map((item, index) => {
      const page = index + 1;
      const header = `****** Result for Image/Page ${page} ******`;
      const text = getBestText(item);
      return `${header}\n${text}`;
    })
    .join("\n\n");

  return {
    status: true,
    code: res.status,
    type: isPdf ? "pdf" : "image",
    input,
    output: OUTPUT_TXT,
    text: textResult
  };
}

async function main() {
  try {
    const result = await ocrSpace(INPUT);

    await fsp.writeFile(OUTPUT_TXT, result.text, "utf8");

    console.log(JSON.stringify({
      Status: true,
      Code: result.code,
      Type: result.type,
      Input: result.input,
      Output: result.output
    }, null, 2));
  } catch (err) {
    const errorText = `OCR gagal\nInput: ${INPUT}\nError: ${err.message}`;

    await fsp.writeFile(OUTPUT_TXT, errorText, "utf8");

    console.log(JSON.stringify({
      Status: false,
      Code: 500,
      Input: INPUT,
      Output: OUTPUT_TXT,
      Error: err.message
    }, null, 2));
  }
}

main();