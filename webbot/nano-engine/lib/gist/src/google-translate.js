import fs from "node:fs";
import path from "node:path";
import { translate, speak } from "google-translate-api-x";

const MODE = "text-to-audio";

const TEXT = "Halo, namaku Ditzzx. Hari ini aku sedang membuat text to speech bahasa Jepang.";
const FROM = "auto";
const TO = "ja";

const AUTO_TRANSLATE_BEFORE_TTS = true;
const OUTPUT_AUDIO = path.resolve("google-tts-output.mp3");

const OPTIONS = {
  client: "gtx",
  forceBatch: true,
  fallbackBatch: true,
  autoCorrect: true
};

async function textToText() {
  const started = Date.now();

  const res = await translate(TEXT, {
    from: FROM,
    to: TO,
    ...OPTIONS
  });

  return {
    Status: true,
    Code: 200,
    Mode: "text-to-text",
    Input: TEXT,
    From: res.from?.language?.iso || FROM,
    To: TO,
    Result: res.text,
    Pronunciation: res.pronunciation || null,
    Correction: res.from?.text || null,
    Time_ms: Date.now() - started
  };
}

async function textToAudio() {
  const started = Date.now();

  let textTts = TEXT;
  let translated = null;

  if (AUTO_TRANSLATE_BEFORE_TTS) {
    const res = await translate(TEXT, {
      from: FROM,
      to: TO,
      ...OPTIONS
    });

    textTts = res.text;

    translated = {
      From: res.from?.language?.iso || FROM,
      To: TO,
      Text: res.text,
      Pronunciation: res.pronunciation || null
    };
  }

  const base64 = await speak(textTts, {
    to: TO,
    client: "gtx"
  });

  fs.writeFileSync(OUTPUT_AUDIO, base64, {
    encoding: "base64"
  });

  return {
    Status: true,
    Code: 200,
    Mode: "text-to-audio",
    Input: TEXT,
    Text_tts: textTts,
    From: translated?.From || FROM,
    To: TO,
    Auto_translate: AUTO_TRANSLATE_BEFORE_TTS,
    Translate: translated,
    Format: "mp3",
    Result_url: OUTPUT_AUDIO,
    Time_ms: Date.now() - started
  };
}

async function main() {
  let result;

  if (MODE === "text-to-text") {
    result = await textToText();
  } else if (MODE === "text-to-audio") {
    result = await textToAudio();
  } else {
    result = {
      Status: false,
      Code: 400,
      Mode: MODE,
      Result: null,
      Error: "MODE tidak valid",
      Available_mode: [
        "text-to-text",
        "text-to-audio"
      ]
    };
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.log(JSON.stringify({
    Status: false,
    Code: err.statusCode || err.code || 500,
    Mode: MODE,
    Input: TEXT,
    Result_url: null,
    Error: err.message
  }, null, 2));
});

/*
Tentang konfigurasi:

1. MODE
   Digunakan untuk memilih fitur yang ingin dijalankan.

   Pilihan:
   - "text-to-text"
     Untuk menerjemahkan teks biasa.

   - "text-to-audio"
     Untuk mengubah teks menjadi audio MP3.
     Jika AUTO_TRANSLATE_BEFORE_TTS = true, teks akan diterjemahkan dulu ke bahasa tujuan sebelum dibuat audio.

2. FROM
   Digunakan untuk menentukan bahasa asal teks.

   Contoh:
   - "auto" = deteksi bahasa otomatis
   - "id"   = Indonesia
   - "en"   = English
   - "ja"   = Japanese
   - "ko"   = Korean
   - "zh"   = Chinese
   - "ar"   = Arabic

3. TO
   Digunakan untuk menentukan bahasa tujuan translate / suara TTS.

   Contoh:
   - "id" = Indonesia
   - "en" = English
   - "ja" = Japanese
   - "ko" = Korean
   - "zh" = Chinese
   - "ar" = Arabic

Contoh penggunaan:

Translate Indonesia ke Jepang:
const MODE = "text-to-text";
const FROM = "id";
const TO = "ja";

Teks Indonesia jadi audio Jepang:
const MODE = "text-to-audio";
const FROM = "id";
const TO = "ja";
const AUTO_TRANSLATE_BEFORE_TTS = true;

Teks Jepang langsung jadi audio tanpa translate:
const MODE = "text-to-audio";
const TEXT = "こんにちは。今日は元気ですか？";
const FROM = "ja";
const TO = "ja";
const AUTO_TRANSLATE_BEFORE_TTS = false;
*/