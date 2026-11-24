import { EdgeTTS } from "node-edge-tts";
import fs from "node:fs/promises";
import path from "node:path";

const CONFIG = {
  text: "Halo, ini adalah contoh text to speech menggunakan Microsoft Edge TTS.",
  outputDir: "./downloads",
  outputName: `edge-tts-${Date.now()}.mp3`,

  voice: "id-ID-ArdiNeural",
  lang: "id-ID",
  outputFormat: "audio-24khz-96kbitrate-mono-mp3",

  pitch: "default",
  rate: "default",
  volume: "default",

  saveSubtitles: false,
  proxy: "",
  timeout: 30000
};

async function tts(config = CONFIG) {
  if (!config.text || !config.text.trim()) {
    throw new Error("Text tidak boleh kosong");
  }

  const outputPath = path.join(config.outputDir, config.outputName);

  await fs.mkdir(config.outputDir, { recursive: true });

  const edge = new EdgeTTS({
    voice: config.voice,
    lang: config.lang,
    outputFormat: config.outputFormat,
    saveSubtitles: config.saveSubtitles,
    pitch: config.pitch,
    rate: config.rate,
    volume: config.volume,
    proxy: config.proxy || undefined,
    timeout: config.timeout
  });

  await edge.ttsPromise(config.text, outputPath);

  return {
    Status: true,
    Code: 200,
    Input: config.text,
    Voice: config.voice,
    Lang: config.lang,
    Result: outputPath
  };
}

async function main() {
  try {
    const result = await tts();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(
      JSON.stringify(
        {
          Status: false,
          Code: 500,
          Input: CONFIG.text,
          Voice: CONFIG.voice,
          Lang: CONFIG.lang,
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
npm i node-edge-tts

JALANKAN:
node tts.mjs

OUTPUT:
File audio akan tersimpan di folder sesuai CONFIG.outputDir.

PENJELASAN CONFIG:

text:
Teks yang akan diubah menjadi suara.

outputDir:
Folder tempat file audio disimpan.

outputName:
Nama file hasil audio.
Contoh:
outputName: "hasil.mp3"

voice:
Nama suara yang dipakai.
Contoh Indonesia:
voice: "id-ID-ArdiNeural"
voice: "id-ID-GadisNeural"

lang:
Kode bahasa dari voice.
Contoh:
lang: "id-ID"
lang: "en-US"
lang: "ja-JP"
lang: "ko-KR"

outputFormat:
Format audio hasil TTS.
Contoh yang umum:
"audio-24khz-48kbitrate-mono-mp3"
"audio-24khz-96kbitrate-mono-mp3"
"audio-48khz-96kbitrate-mono-mp3"

pitch:
Mengatur nada suara.
Contoh:
pitch: "default"
pitch: "+10%"
pitch: "-10%"

rate:
Mengatur kecepatan bicara.
Contoh:
rate: "default"
rate: "+20%"
rate: "-20%"

volume:
Mengatur volume suara.
Contoh:
volume: "default"
volume: "+20%"
volume: "-20%"

saveSubtitles:
Jika true, akan menyimpan subtitle/timing kata dalam file JSON.
Contoh:
saveSubtitles: true

proxy:
Proxy opsional jika koneksi butuh proxy.
Contoh:
proxy: "http://localhost:7890"

timeout:
Batas waktu request dalam milidetik.
Contoh:
timeout: 30000

CARA GANTI SUARA:
Buka file voices.json yang kamu buat, cari ShortName voice, lalu isi ke CONFIG.voice.
Pastikan CONFIG.lang sesuai Locale voice tersebut.

CONTOH VOICE:
Indonesia laki-laki:
voice: "id-ID-ArdiNeural"
lang: "id-ID"

Indonesia perempuan:
voice: "id-ID-GadisNeural"
lang: "id-ID"

English US perempuan:
voice: "en-US-AriaNeural"
lang: "en-US"

English US laki-laki:
voice: "en-US-GuyNeural"
lang: "en-US"

Jepang perempuan:
voice: "ja-JP-NanamiNeural"
lang: "ja-JP"

Korea perempuan:
voice: "ko-KR-SunHiNeural"
lang: "ko-KR"

CATATAN:
Daftar semua voice lebih baik disimpan di voices.json agar file tts.mjs tetap ringan dan mudah dibaca.
*/