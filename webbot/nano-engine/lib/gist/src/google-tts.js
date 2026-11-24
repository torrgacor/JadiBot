import googleTTS from "google-tts-api";
import fs from "node:fs/promises";
import path from "node:path";

const CONFIG = {
  text: "Halo, ini adalah contoh text to speech menggunakan Google Translate TTS.",
  outputDir: "./downloads",
  outputName: `google-tts-${Date.now()}.mp3`,

  lang: "id",
  slow: false,
  host: "https://translate.google.com",
  timeout: 30000,
  splitPunct: ",.?!，、。"
};

async function googleTextToSpeech(config = CONFIG) {
  if (!config.text || !config.text.trim()) {
    throw new Error("Text tidak boleh kosong");
  }

  await fs.mkdir(config.outputDir, { recursive: true });

  const outputPath = path.join(config.outputDir, config.outputName);

  const parts = await googleTTS.getAllAudioBase64(config.text, {
    lang: config.lang,
    slow: config.slow,
    host: config.host,
    timeout: config.timeout,
    splitPunct: config.splitPunct
  });

  if (!Array.isArray(parts) || !parts.length) {
    throw new Error("Gagal generate audio");
  }

  const buffers = parts.map(item => Buffer.from(item.base64, "base64"));
  const finalBuffer = Buffer.concat(buffers);

  await fs.writeFile(outputPath, finalBuffer);

  return {
    Status: true,
    Code: 200,
    Input: config.text,
    Lang: config.lang,
    Slow: config.slow,
    Chunks: parts.length,
    Result: outputPath
  };
}

async function main() {
  try {
    const result = await googleTextToSpeech();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: 500,
          Input: CONFIG.text,
          Lang: CONFIG.lang,
          Slow: CONFIG.slow,
          Result: null,
          Error: err.message
        },
        null,
        2
      )
    );
  }
}

main();

/*
INSTALL:
npm i google-tts-api

JALANKAN:
node google-tts.mjs

PENJELASAN CONFIG:

text:
Teks yang akan diubah menjadi suara.

outputDir:
Folder tempat file audio disimpan.

outputName:
Nama file hasil audio.

lang:
Kode bahasa Google TTS.
Contoh:
lang: "id"     Indonesia
lang: "en"     English
lang: "ja"     Jepang
lang: "ko"     Korea
lang: "zh-CN"  China
lang: "ar"     Arab

slow:
Mengatur kecepatan suara.
false = normal
true = lambat

host:
Host Google Translate TTS.
Default:
"https://translate.google.com"

Jika region bermasalah bisa coba:
"https://translate.google.com.cn"

timeout:
Batas waktu request dalam milidetik.

splitPunct:
Tanda baca untuk memecah teks panjang.
Google TTS punya batas pendek per request, jadi teks panjang dipecah otomatis.

CATATAN:
Google TTS tidak punya pilihan voice seperti Edge TTS.
Yang bisa diatur biasanya hanya lang dan slow.
Untuk suara laki-laki/perempuan, pitch, rate, volume, lebih cocok pakai node-edge-tts.
*/