import QRCode from "qrcode";
import fs from "node:fs";
import path from "node:path";

const INPUT = "Halo guys";
const OUTPUT_DIR = "./qrcode";
const OUTPUT_FILE = path.join(OUTPUT_DIR, `qr-text-${Date.now()}.png`);

const SIZE = 1024;
const FOREGROUND = "000000";
const BACKGROUND = "FFFFFF";

function hex(color) {
  return color.startsWith("#") ? color : `#${color}`;
}

async function makeQr(text) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await QRCode.toFile(OUTPUT_FILE, text, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4,
    width: SIZE,
    color: {
      dark: hex(FOREGROUND),
      light: hex(BACKGROUND)
    }
  });

  return path.resolve(OUTPUT_FILE);
}

async function main() {
  try {
    const qrPath = await makeQr(INPUT);

    console.log(JSON.stringify({
      Status: true,
      Code: 200,
      Input: INPUT,
      Result_url: qrPath
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      Status: false,
      Code: 500,
      Input: INPUT,
      Result_url: err.message
    }, null, 2));
  }
}

main();

/*
CARA PAKAI:

1. Install module:
   npm i qrcode

2. Simpan kode ini sebagai:
   qr-text.mjs

3. Jalankan:
   node qr-text.mjs

4. Ubah isi QR di bagian:
   const INPUT = "Hello Ditzzx";

CONTOH INPUT:

1. Text biasa:
   const INPUT = "Hello Ditzzx";

2. URL website:
   const INPUT = "https://example.com";

3. Nomor telepon:
   const INPUT = "tel:+6285777489196";

4. SMS:
   const INPUT = "SMSTO:+6285777489196:Hello";

5. Email:
   const INPUT = "mailto:user@gmail.com?subject=Test&body=Hello";

6. WiFi:
   const INPUT = "WIFI:S:NamaWifi;T:WPA;P:PasswordWifi;;";

7. vCard / kontak:
   const INPUT = `BEGIN:VCARD
VERSION:3.0
N:Ditzzx
EMAIL:user@gmail.com
TEL:+6285777489196
END:VCARD`;

CARA NGUBAH SETTING:

1. Ubah ukuran QR:
   const SIZE = 1024;

2. Ubah warna QR:
   const FOREGROUND = "000000";

3. Ubah warna background:
   const BACKGROUND = "FFFFFF";

4. Ubah folder output:
   const OUTPUT_DIR = "./downloads";

CATATAN:

- Output selalu PNG.
- Untuk Google Lens lebih aman pakai PNG.
- Jangan pakai warna QR dan background yang terlalu mirip.
- Untuk teks panjang, QR akan makin padat.
- Hasil QR tersimpan di folder downloads.
*/