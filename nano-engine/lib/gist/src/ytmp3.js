import axios from 'axios';
import crypto from 'crypto';

function _0x3a24() {
  let e = [
    "error", "6C35BBC4EB", "32065fiPRVJ", "9651PJDqag", "match",
    "2949160OwuPPs", "1QaLwoE", "subtle", "15775023ibpdbH", "or:",
    "gMUfw", "12IfiARR", "importKey", "3235491JMTwmH", "334826TTrbVe",
    "10zgbCLj", "Format err", "2719575PhDuLf", "592dZwFMH", "7584E4A29F",
    "Invalid fo", "on failed:", "YrlUc", "crypto", "AES-CBC", "map"
  ];
  return (_0x3a24 = function () { return e; })();
}

function _0x5ec9(e, t) {
  let a = _0x3a24();
  return (_0x5ec9 = function (e, t) { return a[e -= 450]; })(e, t);
}

!(function (e, t) {
  let a = _0x5ec9, s = e();
  for (; ;) try {
    let e = -parseInt(a(469)) / 1 * (parseInt(a(451)) / 2) +
      -parseInt(a(466)) / 3 * (parseInt(a(455)) / 4) +
      -parseInt(a(465)) / 5 * (parseInt(a(474)) / 6) +
      -parseInt(a(450)) / 7 +
      -parseInt(a(468)) / 8 +
      parseInt(a(454)) / 9 +
      -parseInt(a(452)) / 10 * (-parseInt(a(471)) / 11);
    if (249055 === e) break;
    s.push(s.shift());
  } catch (e) {
    s.push(s.shift());
  }
})(_0x3a24, 0);

function getSecretKeyHex() {
  const u = _0x5ec9;
  return "C5D58EF67A" + u(456) + u(464) + "12";
}

function decryptData(encryptedBase64) {
  const keyHex = getSecretKeyHex();
  const key = Buffer.from(keyHex, 'hex');

  const encryptedBuffer = Buffer.from(encryptedBase64.replace(/\s/g, ''), 'base64');
  const iv = encryptedBuffer.subarray(0, 16);
  const ciphertext = encryptedBuffer.subarray(16);

  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decrypted = decipher.update(ciphertext, null, 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

const headers = {
  'host': 'cdn403.savetube.vip',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0',
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  'origin': 'https://y2mate.net.co',
  'referer': 'https://y2mate.net.co/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site'
};

export async function getInfo(youtubeUrl) {
  const response = await axios.post('https://cdn403.savetube.vip/v2/info', {
    url: youtubeUrl
  }, { headers });

  return response.data;
}

export async function getDownload(downloadType, quality, key) {
  const response = await axios.post('https://cdn403.savetube.vip/download', {
    downloadType,
    quality,
    key
  }, {
    headers: {
      ...headers,
      'accept': '*/*',
      'priority': 'u=4'
    }
  });

  return response.data;
}

export async function processMedia(youtubeUrl, downloadType = 'audio', quality = '128') {
  try {
    const infoRes = await getInfo(youtubeUrl);

    if (!infoRes?.data) {
      return {
        status: false,
        code: 400,
        input: { url: youtubeUrl, type: downloadType, quality },
        result: 'Gagal mendapatkan data respon dari /v2/info'
      };
    }

    const decryptedMetaData = decryptData(infoRes.data);
    const extractedKey = decryptedMetaData?.key;

    if (!extractedKey) {
      return {
        status: false,
        code: 400,
        input: { url: youtubeUrl, type: downloadType, quality },
        result: 'Gagal mengekstrak key dari data terdekripsi'
      };
    }

    const downloadRes = await getDownload(downloadType, quality, extractedKey);

    return {
      status: downloadRes?.status ?? true,
      code: Number(downloadRes?.message) || 200,
      input: {
        url: youtubeUrl,
        type: downloadType,
        quality: quality
      },
      result: {
        title: decryptedMetaData.title,
        duration: decryptedMetaData.durationLabel,
        downloadUrl: downloadRes?.data?.downloadUrl,
        downloaded: downloadRes?.data?.downloaded
      }
    };
  } catch (error) {
    return {
      status: false,
      code: error.response?.status || 500,
      input: {
        url: youtubeUrl,
        type: downloadType,
        quality: quality
      },
      result: error.message || error
    };
  }
}

const inputUrl = 'https://youtu.be/W5_JxKjetVg?si=SK_kdtT6_lm_RogP';
const inputType = 'audio';
const inputQuality = '128';

processMedia(inputUrl, inputType, inputQuality).then(result => {
  console.log(JSON.stringify(result, null, 2));
});

/*
Daftar 'downloadType' dan 'quality' yang didukung oleh API Savetube:

1. downloadType: "audio"
   Pilihan quality yang didukung:
   - "320" (320kbps - Kualitas tertinggi)
   - "256" (256kbps)
   - "128" (128kbps - Standard/Default)
   - "64"  (64kbps)
*/