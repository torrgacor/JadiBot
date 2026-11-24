# nano.md — Dokumentasi Proyek Nano (Webbot)

> Dokumentasi operasional & arsitektur untuk repo `/root/webbot`.
> Ditulis ulang per 4 Oktober 2026. Semua perintah di bawah sudah dipakai dan terverifikasi di box ini.

---

## 1. Ringkasan Proyek

**Nano** adalah platform WhatsApp gateway + bot assistant yang terdiri dari tiga bagian dalam satu repo:

| Bagian | Lokasi | Teknologi | Fungsi |
|---|---|---|---|
| **Panel web (dashboard)** | `app/`, `components/`, `lib/` | Next.js 15 (App Router), React 19, Tailwind v4 | UI untuk kelola sesi bot, user, billing, plugin, log |
| **Gateway** | `gateway/` | TypeScript (tsx), Node ESM | Manajer sesi WhatsApp; memulai/mengawasi proses engine; API HTTP internal |
| **Engine "Nano Ai"** | `nano-engine/` | JavaScript (ESM), Baileys | Bot WhatsApp itu sendiri: router pesan, 231 plugin, database lokal |

Satu repo, dua proses runtime (web di port **3005**, gateway di **127.0.0.1:4001**), plus proses anak engine per sesi bot.

- Domain publik: `https://wagetway.danznanooffc.my.id` (nginx → `127.0.0.1:3005`)
- Database panel: SQLite via Prisma (`prisma/dev.db`)
- Database engine per sesi: `storage/nano-state/<sessionId>/data/database`

---

## 2. Arsitektur & Alur Pesan

```
WhatsApp ⇅ (Baileys WebSocket)
   │
   ┌─────────────────────────────┐
   │ engine (nano-engine/)       │  ← proses anak per sesi, dikawasi gateway
   │  core/connection.js         │     koneksi & reconnect
   │  core/router-pesan.js       │     prefix → cari plugin → panggil handler
   │  core/pemuat-plugin.js      │     muat + chokidar hot-reload plugins/
   │  core/sqlite.js             │     database engine (better-sqlite3)
   │  plugins/<kategori>/*.js    │     231 berkas · 244 handler · 712 perintah
   └─────────────────────────────┘
   │  stdout/stderr (log berurutan)
   ┌─────────────────────────────┐
   │ gateway (gateway/index.ts)  │  ← 127.0.0.1:4001, token x-gateway-token
   │  drivers/nano-process.ts    │     spawn engine, simpan state di memori
   │  session-manager.ts         │     connect/restart/logout/qr/logs
   └─────────────────────────────┘
   │  HTTP internal (fetch)
   ┌─────────────────────────────┐
   │ panel web (Next.js :3005)   │  ← UI dashboard + REST API publik
   │  app/api/**                 │     auth, sesi, billing (Pakasir), admin
   │  lib/engine/client.ts       │     klien ke gateway
   │  instrumentation.ts         │     restore sesi + 4 watchdog saat boot
   └─────────────────────────────┘
```

**Alur satu pesan masuk:**

1. Engine menerima pesan via Baileys (`core/connection.js`).
2. `core/router-pesan.js` membaca prefix (default `.`), memangkasnya, mencari plugin lewat `findPluginByCommand` (`core/pemuat-plugin.js`).
3. Router memeriksa akses: owner / premium / group / limit (`core/status-command.js`, `lib/cek-akses.js`), lalu reservasi limit bila perlu.
4. Router memanggil `plugin(m, { conn: styledConn, rawConn, usedPrefix, settings })`.
   - `conn` = proxy `createStyledConnection` (balasan otomatis bergaya/reply),
   - `rawConn` = socket Baileys asli (untuk react, newsletter, dll).
5. Hasil handler dikirim; limit di-commit (auto/manual); router mencatat log & kotak `LIMIT TERPAKAI`.
6. Bila plugin dipanggil tanpa argumen dan diam, router otomatis mengirim panduan pakai (`lib/bantuan.js` → `buatPanduan`/`perluPanduan`).

**Penting — gateway menyimpan sesi hanya di memori.** Kredensial WhatsApp tetap ada di disk (`storage/sessions/`), tetapi kalau **gateway** mati lalu hidup lagi tanpa panel ikut boot ulang, tidak ada yang menyambungkan ulang bot secara otomatis. Lihat §10 (Restore Sesi).

---

## 3. Struktur Folder Penting

```
/root/webbot
├── app/                    # Next.js App Router (halaman + API routes)
│   ├── (dashboard)/        #   halaman dashboard (sesi, billing, admin, …)
│   └── api/                #   REST API: auth, sessions, users, billing, …
├── components/             # komponen React dashboard
├── lib/                    # logika panel (db, auth, engine client, services)
│   └── services/           #   session-restore, trial, bot-access, renewal, …
├── gateway/                # proses gateway (TS)
│   ├── index.ts            #   HTTP server + routing
│   ├── session-manager.ts  #   siklus hidup sesi
│   ├── drivers/            #   local-baileys.ts, nano-process.ts
│   └── nano/               #   introspeksi & mutasi konfigurasi engine
├── nano-engine/            # BOT ITU SENDIRI
│   ├── index.js            #   bootstrap: banner → load plugin → watch → connect
│   ├── core/               #   router, loader, koneksi, sqlite, mode grup/pc, dll
│   ├── lib/                #   util bersama (bantuan.js, id-lookup.js, ai-foto.js, …)
│   ├── plugins/            #   apifree aplikasi download game group haidar
│   │                       #   main owner rpg search sticker tools  (236 berkas)
│   ├── config/             #   konfigurasi engine
│   ├── scripts/            #   katalog-plugin.mjs, ensure-play-deps, dll
│   ├── tampilan/           #   banner/ASCII
│   └── tmp/                #   kerja sementara (typogaleri, font, …) — gitignored
├── prisma/                 # schema.prisma + dev.db + migrations + seed
├── storage/
│   ├── sessions/           # auth-state Baileys per sesi (GATEWAY_STORAGE_DIR)
│   └── nano-state/<id>/    # data engine per sesi (NANO_DATA_DIR)
├── scripts/                # check-branding.ts, update-proxy-pool.js, …
├── instrumentation.ts      # hook boot Next.js (restore sesi + watchdog)
└── .env                    # konfigurasi (lihat §9)
```

`tsconfig.json` **mengecualikan** `gateway/` dan `nano-engine/` → `npm run typecheck` hanya menguji panel. Untuk engine, pakai `node --check` dan katalog plugin.

## 4. Stack & Versi Kunci

- **Panel:** Next.js 15.5.26 · React 19.3 · Prisma 6.19.3 + SQLite · zod 4 · Tailwind v4 · TypeScript 5.9 · Node ≥ 20 · proyek **ESM penuh** (Baileys ESM-only).
- **Gateway:** tsx 4 · Baileys `@whiskeysockets/baileys` 7.0.0-rc14 (root).
- **Engine:** Node ≥ 18 · Baileys fork `github:AwangXoffc/baileys-pro` · better-sqlite3 · chokidar (hot-reload) · @napi-rs/canvas · @ffmpeg-installer/ffmpeg · sharp · axios · node-fetch · **got-scraping** (HTTP dengan fingerprint TLS browser — wajib untuk situs yang memblokir Cloudflare, mis. akinator.com & resource API Pinterest) — lihat `nano-engine/package.json`.
- **Drivernya:** `ENGINE_DRIVER="nano-process"` (engine dijalankan sebagai proses anak).

## 5. Sistem Plugin (aturan menulis plugin)

### 5.1 Syarat muat

`core/pemuat-plugin.js` menganggap berkas plugin valid bila:

```js
typeof handler === 'function' && (handler.command || handler.help)
```

### 5.2 Metadata yang didukung

```js
handler.command = /^(nama|alias)$/i   // RegExp ATAU string — ARRAY TIDAK DIDUKUNG
handler.help    = ['nama <arg>']      // daftar alias + teks menu
handler.tags    = ['tools']
handler.category = 'tools'            // default: nama folder teratas
handler.description = '…'             // teks menu/panel
handler.usage   = 'nama <arg>'        // contoh pakai di panduan otomatis
handler.limit   = false               // true = pakai limit harian user
handler.premium = false
handler.limitCommit = 'manual'        // commit limit manual via m.limit
```

### 5.3 Signature handler & objek `m`

```js
async (m, { conn, rawConn, usedPrefix, settings }) => { … }
```

**TIDAK ADA `text`/`command` di context** — argumen teks ada di `m.text`, nama perintah di `m.command`.

`m` berisi: `key, chat, sender, senderAlt, senderNumber, isGroup, text, args, command, pushName, raw, currentMessage, quoted, quotedMessage, limit, reply(text, options)`.

- `m.reply(t)` otomatis mengutip `m.raw` (matikan dengan `m.reply(t, { quoted: false })`).
- Kirim dengan quote asli: `conn.sendMessage(m.chat, {...}, { quoted: m.raw })`.
- **React (tidak ada `m.react`):** `conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw?.key } })`.
- Media quoted diunduh lewat `downloadMediaMessage` + `rawConn` (pola `lib/ai-foto.js`, `plugins/tools/rvo.js`).

### 5.4 Limit (kebijakan otomatis di `core/status-command.js`)

1. `handler.limit` boolean eksplisit **selalu menang**.
2. Kategori berikut otomatis kena limit: `download, downloader, ai, media, converter, search, scraper, tools-api`.
3. Selain itu dipindai sumbernya: sinyal pemakaian API pihak ketiga (axios/fetch URL/domain sosmed/yt-dlp/LLM) ≥ 2 dan tanpa sinyal gratis ⇒ berlimit. Plugin yang hanya memakai `downloadContentFromMessage`/`downloadMediaMessage` (media lokal) ⇒ gratis.
4. Commit limit: `m.limit.success()` / `m.limit.fail()`. Bila sumber plugin mengandung `setTimeout|setInterval|.then(|void |queueMicrotask` dan berlimit, wajib `handler.limitCommit = 'manual'`.

### 5.5 Hot-reload

- **`plugins/`** → langsung di-reload oleh chokidar (log `Plugin ditambahkan/diperbarui/dihapus`, lalu rescan `N dari N plugin berhasil dimuat`; rescan penuh tiap 2 menit).
- **`lib/`, `core/`, `config/`** → TIDAK hot-reload. Edit di sana butuh **restart sesi**.
- Plugin yang `import` plugin lain akan terikat modul waktu boot — taruh kode bersama di `lib/`.

### 5.6 Verifikasi plugin baru (cepat)

```bash
cd /root/webbot/nano-engine
node --check plugins/<kategori>/nama.js
NANO_DATA_DIR=/tmp/uji node --input-type=module -e \
  "const m = await import('./plugins/<kategori>/nama.js'); console.log(String(m.default.command), m.default.category)"
node scripts/katalog-plugin.mjs --ringkas      # jumlah harus naik
npx tsx /root/webbot/scripts/check-branding.ts # brand guard
```

Lalu lihat log hot-reload lewat gateway (§8.4) — harus muncul `Plugin ditambahkan` + rescan.

---

## 6. Menjalankan Proyek dari Nol

```bash
cd /root/webbot
npm install                     # panel + gateway
npx prisma generate             # klien Prisma
cd nano-engine && npm install   # dependensi engine (baileys fork, sqlite, dll)
```

Di box produksi ini keduanya dijalankan terpisah (bukan `npm start` concurrently) — lihat §7.

## 7. Cara Restart (PALING SERING DIPAKAI)

### 7.1 Restart WEB (panel dashboard)

```bash
# MATIKAN dulu
ps -eo pid,cmd | awk '/npm exec next.start|sh -c next.start|next-server/ && !/awk/ {print $1}' | xargs -r kill
sleep 2
ss -ltnp | grep :3005           # pastikan port 3005 kosong

# NYALAKAN lagi
cd /root/webbot && setsid env NEXT_TELEMETRY_DISABLED=1 npx next start -p 3005 \
  >> /tmp/next-web.log 2>&1 < /dev/null & disown

# cek
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3005
```

Saat web boot, `instrumentation.ts` otomatis menjalankan (delay 4 detik):
`restoreSessions()` + pengawas trial, pengawas akses bot, pengingat perpanjangan, penyelaras pembayaran.

### 7.2 Restart GATEWAY

```bash
cd /root/webbot && setsid env NEXT_TELEMETRY_DISABLED=1 npx tsx gateway/index.ts \
  >> /tmp/gateway.log 2>&1 < /dev/null & disown

curl -s http://127.0.0.1:4001/health
```

**Peringatan:** gateway memegang koneksi WA di memori. Restart gateway = semua bot mati.
Mereka hanya hidup lagi bila panel ikut boot ulang (restore) ATAU didaftarkan ulang manual (§10.2).

### 7.3 Restart SESI BOT (engine anak)

Dipakai setelah mengedit `lib/`, `core/`, `config/` engine, atau bila bot diam:

```bash
cd /root/webbot
TOKEN=$(grep -m1 '^GATEWAY_TOKEN=' .env | cut -d= -f2- | tr -d '"')
curl -s -X POST -H "x-gateway-token: $TOKEN" \
  http://127.0.0.1:4001/sessions/<SESSION_KEY>/restart
```

### 7.4 Urutan restart aman (semua)

```bash
# 1. matikan web  (perintah §7.1)
# 2. matikan gateway (pkill -f 'tsx gateway/index.ts' — hati-hati)
# 3. nyalakan gateway (§7.2)
# 4. nyalakan web (§7.1)   ← web yang boot PALING AKHIR, supaya restore sesi jalan
```

## 8. Operasi Harian

### 8.1 Build panel (HARUS web mati dulu)

RAM box hanya 4000 MB tanpa swap (pernah OOM). Membangun sementara server hidup akan
menimpa `.next/static` + `BUILD_ID` → chunk 404.

```bash
# matikan web dulu (§7.1), lalu:
cd /root/webbot
NEXT_TELEMETRY_DISABLED=1 npx next build --turbopack
# baru nyalakan web lagi (§7.1)
```

### 8.2 Katalog & brand guard

```bash
cd /root/webbot/nano-engine && node scripts/katalog-plugin.mjs --ringkas
cd /root/webbot && npx tsx scripts/check-branding.ts
```

Kondisi terakhir (4 Okt 2026): **236/236 berkas · 249 handler · 25 kategori · 717 perintah menu (+332 alias)**.

### 8.3 Log

```bash
tail -n 80 /tmp/next-web.log    # panel
tail -n 80 /tmp/gateway.log     # gateway
```

### 8.4 Log engine via gateway API

```bash
cd /root/webbot
TOKEN=$(grep -m1 '^GATEWAY_TOKEN=' .env | cut -d= -f2- | tr -d '"')
KEY=cmusgx4fd09stj8osdwor66eh              # sesi bonz (lihat §10.1)
curl -s -H "x-gateway-token: $TOKEN" \
  "http://127.0.0.1:4001/sessions/$KEY/logs?since=0"
# baris log: { seq, at, level, stream, text }
```

## 9. Environment (.env di root)

Nama kunci (nilai rahasia jangan ditulis di dokumen mana pun):

| Kunci | Isi |
|---|---|
| `DATABASE_URL` | lokasi SQLite Prisma |
| `AUTH_SECRET`, `ENCRYPTION_KEY` | sesi & enkripsi panel |
| `GATEWAY_HOST` / `GATEWAY_PORT` | `127.0.0.1` / `4001` |
| `GATEWAY_TOKEN` | token API gateway (header `x-gateway-token`) |
| `GATEWAY_STORAGE_DIR` | `./storage/sessions` (auth-state Baileys) |
| `ENGINE_DRIVER` | `nano-process` |
| `NANO_ENGINE_DIR` | `/root/webbot/nano-engine` |
| `NEXT_PUBLIC_APP_URL`, `SITE_URL` | URL publik panel |
| `GOOGLE_CLIENT_*`, `GITHUB_CLIENT_*` | OAuth login |
| `SMTP_*`, `MAIL_FROM` | email (reset password, tagihan) |
| `PAKASIR_*` | payment gateway + webhook secret |
| `BILLING_PROVIDER`, `REALTIME_TRANSPORT` | `pakasir`, `sse` |
| `NODE_ENV` | `development` (di box ini) |

Env opsional engine: `NANO_DATA_DIR` (dibuat gateway per sesi), `FFMPEG_BIN`, `NANO_COBALT_URL`/`COBALT_API_URL`, `NANO_DOWNLOADER_KEY`, `NANO_TIKTOK_KEY`, `NANO_RESTORE_SESSIONS=0` (matikan restore boot).

---

## 10. Sesi & Restore

### 10.1 Sesi aktif (referensi)

| Sesi | Nomor | KEY | Status terakhir |
|---|---|---|---|
| **bonz** (profile `bonzabc`) | 6285147107037 | `cmusgx4fd09stj8osdwor66eh` | CONNECTED · 231 plugin |
| neko (jangan diutak-atik) | — | `cmumk7izk004tj8w1bdepi94l` | QR_REQUIRED |

Data engine per sesi: `NANO_DATA_DIR=/root/webbot/storage/nano-state/<KEY>/data/database`.
Auth-state Baileys: `/root/webbot/storage/sessions/<KEY>`.

### 10.2 Kalau bot diam setelah gateway restart (TANPA panel boot ulang)

Gateway menyimpan sesi **hanya di memori**; panel hanya me-restore **saat panel boot**
(`instrumentation.ts` → `restoreSessions()`, delay 4 dtk, hanya untuk sesi berstatus
`CONNECTED/CONNECTING/RECONNECTING/QR_REQUIRED/PAIRING_REQUIRED` dan pemiliknya masih
punya paket/trial aktif). Belum ada watchdog. Perbaikan manual:

```bash
cd /root/webbot
TOKEN=$(grep -m1 '^GATEWAY_TOKEN=' .env | cut -d= -f2- | tr -d '"')
KEY=cmusgx4fd09stj8osdwor66eh
curl -s -X POST -H "x-gateway-token: $TOKEN" -H 'content-type: application/json' \
  -d '{}' http://127.0.0.1:4001/sessions        # daftarkan (idempoten)
curl -s -X POST -H "x-gateway-token: $TOKEN" \
  http://127.0.0.1:4001/sessions/$KEY/connect   # sambungkan
```

Atau paling sederhana: **restart web** (panel) — restore otomatis jalan saat boot.

### 10.3 Watchdog yang ADA di panel (jalan otomatis)

`instrumentation.ts` memulai: `startTrialSweeper` (trial 3 hari habis → bot distop),
`startBotAccessWatchdog` (tanpa paket aktif → distop), `startRenewalWatchdog`
(pengingat sebelum masa aktif habis), `startPaymentReconciler` (invoice terbayar
aktif walau webhook tak sampai).

## 11. API Gateway (internal, 127.0.0.1:4001)

Semua kecuali `/health` butuh header `x-gateway-token: $GATEWAY_TOKEN`.

| Metode & Path | Fungsi |
|---|---|
| `GET /health` | kesehatan gateway (tanpa token) |
| `POST /sessions` | daftar sesi (idempoten) |
| `GET /sessions` | daftar state semua sesi |
| `GET /sessions/:key` | state satu sesi |
| `POST /sessions/:key/connect` | sambungkan |
| `POST /sessions/:key/disconnect` | putuskan (kredensial tetap) |
| `POST /sessions/:key/logout` | logout + hapus kredensial |
| `POST /sessions/:key/restart` | restart proses engine |
| `POST /sessions/:key/qr` | minta QR baru |
| `POST /sessions/:key/pairing-code` | minta pairing code |
| `GET /sessions/:key/logs?since=N` | log engine (seq, at, level, stream, text) |
| `GET /sessions/:key/queue` | kedalaman antrian pesan |
| `GET /sessions/:key/groups` | daftar grup |
| `DELETE /sessions/:key` | hapus sesi |
| `POST /messages` | kirim pesan outbond via gateway |
| `GET/POST /nano/config` | baca/ubah konfigurasi engine |
| `GET /nano/plugins` | daftar plugin engine |
| `GET /nano/info` | info instalasi engine |
| `GET /nano/sessions/:key` | data sesi versi engine |
| `POST /nano/sessions/:key/settings` | ubah settings engine |

## 12. Troubleshooting

| Gejala | Sebab | Solusi |
|---|---|---|
| Bot diam total, gateway baru restart | sesi tak di-restore (§10) | restart web, atau register+connect manual (§10.2) |
| Chunk 404 / CSS hilang | build jalan saat server hidup | matikan web → build → nyalakan (§8.1) |
| Build dibunuh (OOM) | RAM 4 GB tanpa swap | pastikan web & gateway mati saat build; jangan buka tab berat |
| `Plugin ditambahkan` tapi perintah tak dikenal | `handler.command` berupa array | ganti ke RegExp/string (§5.2) |
| Perintah bentrok dengan plugin lain (balasan dari plugin yang tidak diharapkan, mis. "⚠️ Upload file video…") | nama perintah sudah dipakai plugin lain — termasuk yang dibangkitkan `lib/haidar-endpoint.js` dari `data/haidar-commands.json` | jalankan ulang `scripts/generate-haidar-commands.mjs` (katalog otomatis menghindari nama yang dipakai plugin lain) |
| `${command}` jadi `undefined` di balasan | membaca `command` dari context | pakai `m.command` / `m.text` (§5.3) |
| Edit `lib/` tidak berefek | bukan hot-reload | restart sesi (§7.3) |
| Kotak `LIMIT TERPAKAI` padahal harus gratis | policy otomatis | set eksplisit `handler.limit = false` (§5.4) |
| Plugin berlimit tapi limit ter-commit sebelum hasil | auto commit | `handler.limitCommit='manual'` + `m.limit.success()/fail()` |
| QR minta terus | kredensial hilang/expired | pairing ulang; jangan utak-atik sesi milik orang lain |
| Typecheck gagal di file engine | `tsc` tidak mencakup engine | uji engine dengan `node --check` + katalog (§5.6) |
| `.akinator`: "Gagal mengambil data dari Akinator" | Cloudflare tolak fingerprint TLS axios/Node (403 "Just a moment") | ganti HTTP plugin ke `got-scraping` (§13) |
| Pinterest 403 "Invalid Resource Request" | header resource API tidak lengkap | pakai header `x-app-version`/`x-pinterest-*` + `got-scraping` (§13) |
| Sticker pack "Invalid media type" | Baileys fork tak bisa bangun `stickerPackMessage` | kirim per-sticker `{ sticker: { url } }` (§13) |
| Video Pinterest patah-patah / fps drop | WhatsApp plafon 30 fps saat transcode | `.pindl` sudah normalisasi ke H.264 30 fps; file ≤30 fps dikirim apa adanya (§13) |
| Upload ke haidarapis dibalas **413** | nginx penyedia menolak body besar | kirim URL (unggah dulu via `lib/ai-foto.js`), bukan multipart (§13) |
| Error `scale` "harus salah satu dari: 2, 3, 4, 1920:-1, 1280:-1" | preset 4K/1080:-1 tidak ada di endpoint | pakai peta target di plugin (§13) |
| Backend haidar balas **504 tepat di ~60 detik** | timeout nginx penyedia (video ≥10 detik selalu gagal) | jangan andalkan AI upscale eksternal; proses lokal (`.hdvid`, §13) |

## 13. Fitur yang Baru Ditambahkan (kronologi 2026)

- **`.hdvid` / `.hdclean` / `.jernihvid`** (`plugins/tools/hdvid.js`) — video buram dibersihkan, **ditajamkan**, lalu dinaikkan ke HD, **sepenuhnya server-side dengan ffmpeg**. Video diambil dari pesan/reply (`downloadMediaMessage`), lalu **satu proses** dengan rantai filter. Terukur: 640×360 → 2560×1440, ketajaman (stddev Laplacian) **11,2 → 14,4**, noise di patch datar **10,90 → 4,14**, 8 detik video selesai dalam 24 detik. Opsi target: `jelas` / `1080p` / `720p` / `4k` / `2x` / `3x` / `clean`. Batas: 60 MB, CRF 23, folder temp dihapus di `finally`, `limitCommit='manual'`, pesan progres per tahap.
  - **Default = 2K (2560×1440) + bersih + tajam**, jadi `.hdvid` polos sudah menghasilkan 1440p yang lebih tajam. Sumber yang sudah ≥1440p tidak diperbesar (enlarger tidak mengembalikan detail yang hilang, cuma menambah ukuran file); `.hdvid clean` hanya membersihkan noise tanpa mengubah resolusi.
  - **Penajaman dan denoise itu berlawanan** — denoise membuang grain tapi ikut menghapus detail, sharpen mengembalikan tepi tapi ikut mengangkat noise. Jadi urutan dan kadarnya **diukur dulu** pada sumber buram+ber-noise (640×360 → 2560×1440) dengan metrik: ketajaman = stddev Laplacian, noise = stddev di patch 32×32 paling datar antar 3 frame. **Penting: kedua metrik harus diukur pada resolusi sama** — diukur langsung pada 2560×1440, Laplacian per-piksel otomatis turun ~4× dan varian terlihat "tajam 3,4 vs 2,5" padahal bedanya jauh lebih kecil.
    - denoise saja (versi lama) · tajam **11,2** · noise **3,22**
    - + sharpen ringan (B) · tajam **14,9** · noise **5,07**
    - + denoise berat dulu (D, dipakai) · tajam **14,4** · noise **4,14** — paling seimbang
    - chroma-saja lalu sharpen (E, gaya `jelas`) · tajam **17,8** · noise **6,27** — paling tajam
  - **Noise harus diukur di patch datar, bukan dari residual seluruh frame**: metrik "residual vs blur 3×3" ikut naik kalau gambar ditajamkan, sehingga varian yang lebih tajam seolah-olah lebih bising. Patch datar (tanpa tepi) memisahkan noise yang sesungguhnya dari detail yang sengaja dibuat tajam.
  - **Awalnya ada DUA tahap `unsharp` (5:5:1.2 lalu 3:3:0.5) plus `eq=contrast=1.04` — inilah penyebab video "patah". Gejalanya tampak jelas sebagai cincin putih/pelangi (halo) di setiap tepi, persis seperti yang dilaporkan user. Bukan bitrate, bukan denoise, bukan scaling: dua tahap unsharp dengan amount besar saling **menjumlahkan overshoot** (Leuwiang di sisi terang dan gelap tiap tepi), dan `eq` menaikkan kontras sehingga halo makin menonjol. Metrik ketajaman justru menyatakan varian ini paling "tajam" (stddev Laplacian tertinggi) — metrik tidak bisa melihat halo, makanya harus dicek mata.
    - Bukti visual pada 1440×1440, frame yang sama: `1.2 + 0.5 + eq` = cincin rainbow jelas di tiap tepi · `0.4` = bersih, nyaris identik dengan tanpa sharpen · `1.0` tunggal = masih bersih.
    - Perbaikan: **satu tahap** `unsharp=5:5:0.4:5:5:0.0` (default) dan `1.0` (gaya `jelas`), `eq` dibuang, denoise penutup diperkuat sedikit supaya grain tidak kembali. `scale` juga diubah dari `W:-2` menjadi `W:H` eksplisit agar tinggi target benar-benar terpakai.
  - **Chroma tetap `0` di `unsharp`**: kalau kromanya ikut ditajamkan, tepi warna berkedip kemerahan dan justru terlihat kasar. Radius 5 dipakai untuk menajamkan tepi besar sekaligus detail halus dalam satu tahap, ditutup denoise ringan supaya sharpen tidak membawa grain kembali.
  - **TIDAK ada batas durasi** (diminta user): video berapa pun diproses; satu-satunya batas adalah ukuran berkas **60 MB**. Karena itu dua hal yang sebelumnya menutup proses panjang harus ikut dibuka, kalau tidak `.hdvid` tetap gagal dengan pesan lain:
    - **Timeout proses tidak boleh berupa angka mati.** `TIMEOUT_PROSES` dulu 5 menit, jadi video 3 menit akan dibunuh `SIGKILL` di tengah jalan. Sekarang `timeoutUntuk(perkiraan)` = 3× perkiraan, minimal 5 menit, maksimal 2 jam (safety net agar proses yatim tidak menggantung selamanya).
    - **Heartbeat wajib.** Tanpa batas durasi, proses bisa jalan belasan menit; tanpa kabar, user menganggap bot hang. `laporanProses()` mengirim "⏳ Masih diproses… (sisa ~N dtk)" tiap menit, dan langsung aktif kalau perkiraan >90 detik. Interval di-`unref()` dan dihentikan di `finally`.
    - Terverifikasi: video **120 detik** (50 MB, 576×576) diproses penuh → 1440×1440, 51,9 MB, ±288 detik, 2 heartbeat muncul (sisa 228 → 168 dtk), `LIMIT_OK`.
  - **Resolusi & biaya dihitung dari TINGGI + rasio aspek, bukan lebar tetap.** Dua kesalahan lama yang sama-sama lahir dari "target = lebar 2560": (a) 576×576 jadi **2560×2560** = 6,6 MP, padahal batas durasi disusun untuk 2560×1440 = 3,7 MP — video 33 detik milik user ditolak padahal hanya butuh ~2 menit; (b) saat dicoba diperbaiki dengan budget MP, `640×360` justru jadi **1442×812** = 1,2 MP — "2K" lebih kecil dari sebelumnya untuk video 16:9. Sekarang target = tinggi (lebar ikut rasio aspek sumber, selalu genap): `576×576 → 1440×1440` (2,1 MP), `640×360 → 2560×1440` (3,7 MP), `480×854 → 808×1440` (1,2 MP), `1080×1920` tidak diperbesar. Bitrate juga mengikuti jumlah piksel hasil (`bitrateUntuk`), bukan lebar — 1920×1920 dan 2560×1440 sama-sama dapat 6000k karena sama-sama 3,7 MP.
  - **Nama `hdvid` tadinya bentrok** dengan endpoint `/tools/hdvid` milik haidar, sehingga plugin ini tidak pernah jalan dan bot membalas "⚠️ Upload file video (multipart 'file') atau sertakan parameter 'url' video". Akar masalahnya bukan urutan muat plugin, melainkan `data/haidar-commands.json` yang mendaftarkan nama itu dan `scripts/generate-haidar-commands.mjs` yang **sudah punya daftar `reserved` dari seluruh perintah plugin lain**. Jadi setelah plugin ini memakai `hdvid`, cukup regenerate katalog: endpoint haidar otomatis bergeser ke `tools-hdvid` dan `findPluginByCommand('hdvid')` jadi milik plugin ini. **Jadi kalau sebuah perintah tiba-tiba "dimakan" plugin lain: jalankan ulang `scripts/generate-haidar-commands.mjs`, jangan mengganti nama perintahnya.**
  - Interceptor `before` mengingat video terakhir per user (TTL 10 menit) dan selalu `return false` — jadi "kirim video" lalu "ketik `.hdvid`" jalan tanpa perlu reply.
  - Versi pertama memakai backend AI haidar `/tools/hdvid` dan **dibuang**: nginx penyedia timeout **60 detik** (504 tepat di 60,3 s sehingga video ≥10 detik selalu gagal), upload multipart kena **413**, dan video sempat terunggah ke host publik. Jalur lokal jauh lebih cepat dan tidak bergantung layanan luar.
- **`.otomatis` / `.typing` / `.autoread` / `.autoreact`** (`plugins/owner/otomatis.js` + `core/otomatis.js` + `core/otomatis-handler.js`) — tiga perilaku "manusiawi" yang bisa dinyalakan owner satu per satu: **auto typing** (presence `composing` → "sedang mengetik…" di HP user, lalu `paused` tepat saat balasan keluar), **auto read** (centang biru via `readMessages`), **auto react** (emoji acak tiap pesan, atau emoji tetap kalau owner mengaturnya). Semua **default NONAKTIF** dan `ownerOnly = true`. Status disimpan di SQLite (satu baris `auto_status`, id=1) seperti `anticall_status`, jadi tetap berlaku setelah restart.
  - Perintah: `.otomatis on|off` (ketiganya sekaligus) · `.otomatis` (status) · `.typing on|off` / `.typing` (toggle) · `.autoread on|off` · `.autoreact on|off` · `.autoreact set 🙏` · `.autoreact acak`.
  - **Handler dipanggil dari router, bukan listener `messages.upsert` sendiri.** Alasannya urutan: router sudah menyaring pesan status, pesan bot sendiri, dan yang diblokir Antilink. Listener terpisah akan bereaksi ke pesan yang justru tidak boleh disentuh, dan urutan read/typing bisa balapan dengan router.
  - **`readMessages` di grup WA wajib diisi `participant`.** Tanpa itu WhatsApp menerima permintaan tanpa error tetapi **diam-diam mengabaikannya** — bot terasa sudah aktif namun centang biru tidak pernah muncul di grup. Ini Silent Failure, jadi `participant` selalu disertakan saat ada.
  - **Emoji reaction divalidasi dengan `Intl.Segmenter`, bukan panjang string.** Satu emoji bisa ber-many kode point (skin tone, penanda gender, joiner ZWJ) — `👨‍👩‍👧` adalah satu emoji sepanjang 11 kode point, sedangkan `"oke deh"` cuma 7 karakter biasa. Menghitung grafeme membedakan keduanya; input lebih dari satu grafeme ditolak lebih awal daripada mengirim reaction yang pasti ditolak server.
  - **Presence `composing` harus punya jaring pengaman.** Kalau bot menerima pesan tapi tidak pernah membalas, indikator "mengetik" akan menggantung. `mulaiTyping` memasang timer 20 detik yang mengirim `paused`, dan `handleIncomingMessage` memastikannya lewat `finally` → `selesaiTyping()` sehingga tidak ada jalur keluar yang meninggalkan presence menyala.
  - **Pesan bot sendiri dilewati seluruhnya** (tidak read, tidak react, tidak typing). Menandai pesan sendiri sebagai dibaca tidak berarti apa-apa, dan `composing` ke chat sendiri tidak pernah dilihat siapa pun.
  - Semua panggilan dibungkus `try/catch` senyap: ketiga fitur ini kosmetik, tidak boleh menjatuhkan pemrosesan pesan yang sebenarnya.
  - Migrasi defensif di `applySchema` menambahkan kolom `read`/`react`/`emoji` bila tabel `auto_status` ada dalam versi lebih lama — tanpa itu, satu `SELECT` ke kolom yang belum ada akan membuat router melempar dan mematikan fitur untuk semua chat.
- **`.pins` / `.pinsearch` / `.psearch`** (`plugins/search/pins.js`, commit `0a5d412`) — cari gambar Pinterest, kirim satu per satu sebagai **kartu tombol** `lib/tombol.js` (gambar jadi header): tombol **NEXT / PREV / STOP**, id tombol ber-prefix (`{prefix}pins next`) supaya router (§2, `extractText`) mem-parsenya ulang sebagai perintah `.pins`. Sesi 15 menit/user, maks 30 hasil, `limitCommit='manual'`. Dua syarat agar resource API bisa dibaca: (1) header lengkap `x-app-version`, `x-pinterest-appstate`, `x-pinterest-source-url`, `x-pinterest-pws-handler`, `x-requested-with` — tanpa itu Pinterest balas **403 "Invalid Resource Request"**; (2) lewat `got-scraping`. Folder kategori baru: `plugins/search/`.
- **`.pindl` / `.pinterestdl` / `.pinvidl`** (`plugins/download/pindl.js`, commit `d0c632a`) — unduh video Pinterest lewat sspin.io: `POST /action/token` (vtoken sekali pakai) → `POST /action` → scrape HTML (video src, link HD, cover, judul, author), kirim **mp4** (`.m3u8`/HLS dikecualikan — WhatsApp hanya terima mp4), `limitCommit='manual'` + `m.limit.success/fail`, retry 3× saat galat jaringan sesaat. Video diambil dari **file asli Pinterest** (`v1.pinimg.com`; link "Download Video HD" sspin.io ternyata proxy atas file yang sama — md5 identik) lalu **dinormalisasi hanya bila perlu**: WhatsApp mem-transcode saat kirim dengan plafon **30 fps**, sehingga pin 50 fps ikut dibuang frame-nya → playback patah-patah di penerima. File non-H.264 / >30 fps di-encode ulang ke **H.264 High, yuv420p, 30 fps, dimensi genap, `+faststart`** (CRF 20, preset veryfast, ±25 detik,10 MB); file yang sudah H.264 ≤30 fps dikirim **apa adanya tanpa kompresi**. Caption menyertakan baris `⚙️ <codec> <fps>fps → H.264 30fps` bila dinormalisasi. `ffmpeg` diambil dari `@ffmpeg-installer/ffmpeg` via `getFfmpegBinPath()` (`lib/ytdlp.js`), file sementara di `os.tmpdir()` dan selalu dibersihkan. **Catatan ejaan: `ssspin.io` = TIGA huruf s** (`sspin.io` = domain yang tidak ada, NXDOMAIN).

- **`.threads` / `.thdl` / `.threadstdl`** (`plugins/download/threads.js`, commit `9ebf4dc`) — unduh media dari postingan Threads (image, video, carousel, teks) tanpa login. Mesinnya `lib/threads.js`: scraper SSR HTML milik bot sendiri (RelayPrefetchedStreamCache), tanpa API key, tanpa rate limit, media **diverifikasi dulu** (`HEAD` + `Range GET` → konteinernya dipastikan bukan halaman error) sebelum dikirim. File video > 64 MB, gambar > 64 MB, dan caption teks yang di-parse dibatasi. Carousel > 5 foto hanya kirim 5 (totalnya tetap dilaporkan). Stroke: handle `verify:false` default, jadi tanpa verifikasi tetap jalan.
  - Tiga perintah: `.threads` (nya sendiri), `.thdl`, `.threadstdl`.
- **`.x` / `.twitter` / `.xdl` / `.xdown` / `.tweetdl` / `.tdl` / `.twdl`** (`plugins/download/x.js`, commit `9ebf4dc`) — unduh media X/Twitter: gambar, video, GIF, carousel, teks. Sumber dicoba berurutan: **fxtwitter** (palin lengkap) → **syndication** (milik X, jarang diblokir) → **vxtwitter** (cadangan). Hasil **digabung** (gabung 3 sumber): nilai pertama yang terisi untuk statistik, daftar media tanpa duplikat, dan penulisan ulang tipe (gambar=image, >1=carousel, video/gif=video). `verify:false` default, `verify:true` opsional untuk cek URL media.
  - Tiga perintah utama: `.x` (.twitter, alias: `.xdl` `.xdown` `.tweetdl` `.tdl` `.twdl`).
- **Perbaikan `.swhd`** (`plugins/tools/swhd.js`, commit `9ebf4dc`) — kunci: **video > 30 fps PATAH-PATAH di WhatsApp**. WhatsApp selalu transcode ulang yang dikirim dan plafon 30 fps-nya (penelitian sendiri di `pindl.js`). Efek `fps asli → kirim apa adanya` justru membuat frame yang dibuang acak. Solusi: video >30 fps **dinaikkan dulu ke 30 fps** lewat filter `fps` + `libx264` (yuv420p, dimensi genap, `+faststart`), audio ikut disalin (`-c:a copy` — tanpa kualitasnya ikut turun). Video ≤30 fps tetap kirim apa adanya (lossless remux). Hasil terukur: 640×360@60fps → 30fps, 180 frame → 90 frame, audio AAC utuh, `faststart` `YA`, 60→30 fps, 2.67 MB, durasi 3.02 detik.
  - Penggunaan: reply video/dokumen + `.swhd` (tanpa reply: caption). Caption otomatis menunjukkan `Sumber asli: NNN fps → kirim 30 fps` bila dinormalisasi.

### STORE — toko digital penuh di atas SQLite yang sudah ada
- **Perbaikan `.akinator`** (`plugins/game/akinator.js`, commit `c06e176`) — "Gagal memulai Akinator" gara-gara Cloudflare menolak fingerprint TLS axios/Node (403 "Just a moment"), bukan soal header. Lapisan HTTP ditukar ke **`got-scraping`** (impersonasi TLS Chrome + header generator), cookie per sesi disimpan manual di `game.cookie`, dan pesan blokir dibuat spesifik. Dependensi **`got-scraping@^4.2.1`** didaftarkan di `nano-engine/package.json`.
- **Perbaikan `.sigstick` / `.stickersearch`** (`plugins/sticker/stickersearch.js`, **belum di-commit**) — bentuk sticker pack `{ cover, stickers, name, publisher }` tidak didukung `generateWAMessageContent` Baileys fork ini (jatuh ke `prepareWAMessageMedia` → **"Invalid media type"**, `lib/Utils/messages.js:70`), meski proto punya `stickerPackMessage`. Kini kirim **per sticker** `{ sticker: { url }, mimetype: 'image/webp' }` (maks 30, jeda 400 ms, try/catch per stiker, ringkasan di akhir). `getPack` juga disaring: hanya `<idx>-<idx>.webp` milik pack itu sendiri — buang `.thumbNN`, `cover-*`, `og-*`, dan URL pack terkait yang ditanam di halaman pack.
- **`.typogaleri2` / `.typogaleri` / `.tg2`** (`plugins/tools/typogaleri2.js`, commit `9e5ce65`, `ee49d05`) — video galeri tipografi 1280×720: latar video user bergerak, 4 kartu + polaroid, kurva emas, kata besar Anton, audio asli/ambient, ffmpeg via `@ffmpeg-installer/ffmpeg`, font Google + fallback sistem, kerja di `nano-engine/tmp/typogaleri`, `limitCommit='manual'`, bebas limit.
- **`.fakeffduo`** (`plugins/tools/fakeffduo.js`) — kartu lobby Free Fire duo; API `apiii-xrina.vercel.app` memilih **1 dari 49 template secara acak** di sisi server (plugin hanya mengirim `name1` & `name2`), timeout 60 dtk, `limit=false`, kategori `tools`.
- **`.amfind` / `.amfinder`** + panduan pakai otomatis (`commit 2ef92c4`) — `lib/bantuan.js` (`contohPakai`, `buatPanduan`, `perluPanduan`) dipasang di router: plugin yang dipanggil tanpa argumen dan diam otomatis dikirimi cara pakai.
- Fitur lama: suite moderasi grup, editfoto/upscale (AI foto), kartu kesehatan backend AI + grafik riwayat job di dashboard, redisain UI auth, reset password admin (`bjoget@gmail.com` — satu-satunya pengecualian sentuh data orang lain).

### STORE — toko digital penuh di atas SQLite yang sudah ada

`core/store/db.js` · `core/store/ui.js` · `core/store/aksi.js` · `plugins/store/store.js` · `plugins/store/store-owner.js` · `plugins/store/store-img.js`

Toko digital yang sebelumnya **tidak ada**: yang ketemu hanya `plugins/rpg/shop.js` (toko game, mata uang fiktif, `groupOnly`) dan `kategori.js` (kategori plugin, bukan toko). Tidak ada mock, tidak ada database terpisah.

**Semua state tinggal di `nano.sqlite` yang sama** (`ensureStoreSchema()` dipanggil sekali, `CREATE TABLE IF NOT EXISTS`). Tabel: `store_categories`, `store_products`, `store_cart`, `store_orders`, `store_order_items`, `store_payments`, `store_settings`, `store_promos`, `store_favorites`. Keranjang dan order **selamat dari restart bot** — tidak ada state transaksi di variabel global.

#### Perintah

| Pemakai | Perintah |
|---|---|
| Semua | `.store` `.shop` (beranda + sub-aksi) · `.list` · `.cart` · `.checkout [KODE]` · `.buy <id>` · `.order <id>` · `.myorder` `.history` · `.payment` · `.storeinfo` · `.listkategori` · `.favorite` · `.searchlist <kata>` · `.detaillist <id>` |
| Owner | `.addlist` `.updatelist` `.dellist` `.setstock` `.addstock` `.delstock` `.clearstock` `.stock` `.setnama` `.setharga` `.setlistdesc` `.setimg` `.setkategori` `.addkategori` `.delkategori` `.addpayment` `.delpayment` `.listpayment` `.setqris` `.setstore` `.setdescstore` `.setowner` `.setcontact` `.setimgstore` `.addpromo` `.delpromo` `.listpromo` `.orderlist` `.confirmorder` `.cancelorder` `.storestats` `.resetstore` |

Format `.addlist`: `Nama|Harga|Deskripsi|Stok` (deskripsi boleh kosong, stok opsional). Harga menerima `10000`, `10.000`, `Rp25.000`, `10k`.

#### Putusan yang tidak bisa dinegosiasi

- **Harga & stok SELALU dibaca ulang dari database saat checkout.** Nilai dari kartu atau pesan tidak pernah dipercaya. `createOrder()` tidak punya parameter harga sama pun, jadi tidak ada jalur untuk menipu.
- **Pengurangan stok = satu `UPDATE ... WHERE id = ? AND stock >= qty`** di dalam transaksi, bukan "baca dulu, tulis lalu". `affect 0` berarti stok berubah di tengah → transaksi dibatalkan seluruhnya, keranjang user **utuh**. Ini yang mencegah overselling tanpa lock eksplisit.
- **Stok hanya turun setelah order dibuat**, dan **dikembalikan hanya untuk order `PENDING`**. Order yang sudah `PAID`/`COMPLETED` tidak mengembalikan stok saat dibatalkan owner — kalau iya, stok dobel.
- **Semua order ID public** (`NANO` + timestamp + acak). `cancelOwnOrder()` membandingkan kepemilikan di server; user lain mendapat pesan **"Order tidak ditemukan"** yang persis sama, bukan "bukan order kamu" — supaya keberadaan order orang lain tidak bisa ditebak.
- **Transisi status dijaga** (`PENDING→PAID/CANCELLED/EXPIRED`, `PAID→PROCESSING/COMPLETED/CANCELLED`, `COMPLETED/CANCELLED/EXPIRED` sudah final). Mencegah `COMPLETED` dibalik jadi `CANCELLED` dan merusak laporan.
- **Hapus produk = sembunyikan** (`status='hidden'`), bukan `DELETE` — order lama masih menunjuk `productId` itu. Produk tersembunyi juga **tidak ikut dihitung** di keranjang.
- **Aksi owner dicek ulang di `jalankanAksi()`**, bukan cuma lewat `handler.ownerOnly`. String aksi berasal dari tombol yang bisa dikirim siapa saja; `ownerOnly` router hanya melindungi perintah yang diketik.

#### Anti double-click & rate limit

- **Kunci per (user, aksi, seluruh argumen), jendela 2,5 detik.** Kunci memakai *seluruh* argumen, bukan hanya yang pertama — kalau hanya id produk, tombol jumlah "1 / 2 / 3 / 5 / 10" akan saling memblokir.
- **Rate limit 12 aksi / 10 detik.** Sengaja longgar: pola belanja itu beruntun (produk → tambah → qty → checkout). Batas ketat membuat alur normal gagal dengan "Terlalu cepat" tanpa sebab jelas.

#### Tombol & kompatibilitas Android/iOS

- ID aksi berbentuk `<prefix>store <aksi> <arg>` — **prefix digabung tanpa spasi**. Tombol dikirim sebagai quick_reply id dan dibaca `parseCommand()`; kalau jadi `". store"` router tidak mengenainya dan **semua tombol mati tanpa error** — gejala yang paling sulit dicari.
- Kartu tidak boleh >3 quick reply (`ingatkanKuotaTombol`). Tombol `single_select` **tidak** dihitung ke kuota itu, jadi 3 quick + 1 list tetap sah.
- **Setiap kartu punya `teks` fallback yang bisa diproses**, bukan cuma label: ditampilkan sebagai `1. PRODUK   ketik: .store produk`..when kartu interactive ditolak (iOS, WA lama, error jaringan) user masih bisa menyelesaikan alur dengan mengetik. Baris list ikut sertakan (maks 12).
- **Pagination 8 item/halaman.** Tombol `◀ ▶` pada daftar produk kategori **membawa `categoryId`** — tanpa itu, pindah halaman diam-diam mengembalikan filter ke semua produk.

#### Pembayaran

Tidak ada payment gateway di engine — yang ada (Pakasir) itu milik web panel Next.js untuk langganan SaaS, tidak bisa dipakai untuk order WhatsApp. Jadi Store memakai **metode yang didaftarkan owner** (`.addpayment dana 0812…`, `.setqris <isi>`), dan **konfirmasi manual owner** (`.confirmorder <id> [status]`) yang otomatis mengabari pemesan. **Tidak ada metode fiktif** — kalau owner belum mendaftarkan satu pun, kartu berbunyi "Belum ada metode pembayaran yang dikonfigurasi owner". `.payment` ke owner menampilkan daftar metode untukZH dipakai.

#### Konflik nama yang diselesaikan

| Nama | Pemilik sebelumnya | Keputusan |
|---|---|---|
| `.store` `.shop` | `plugins/rpg/shop.js` (toko RPG) | Dipindah ke Store. **Toko RPG tetap jalan penuh** lewat `.beli` `.jual` `.toko`. Kalau tidak dihapus dari `rpg/shop.js`, `findPluginByCommand()` mengembalikan yang pertama di `pluginStore` dan `.store` membuka toko game. |
| `.kategori` | `plugins/main/kategori.js` | **Tidak diambil.** Kategori Store memakai `.listkategori` + tombol KATEGORI. |
| `.setdesc` | `plugins/group/setmeta.js` (deskripsi grup) | **Tidak diambil.** Deskripsi produk memakai `.setlistdesc` (nama sejajar `addlist`/`updatelist`/`dellist`). |
| `.list` | `/dracin/list` di `data/haidar-commands.json` | `scripts/generate-haidar-commands.mjs` dijalankan ulang → endpoint itu jadi `.dracin-list`, `.list` jadi milik Store. Mekanisme yang sama dipakai untuk `.hdvid` sebelumnya. |

#### Bug yang ditemukan pengujian dan sudah diperbaiki

1. **Foreign key salah kolom** — `store_payments.orderId` dan `store_order_items.orderId` menunjuk `store_orders.id` (integer), tapi kode selalu mengirim id publik teks (`NANO…`). Akibatnya **`addPayment()` selalu gagal** dengan `FOREIGN KEY constraint failed`. Query "terlaris" yang join ke `o.id` ikut buta. Keduanya kini merujuk `store_orders(orderId)`.
2. **`aksi()` menyisipkan spasi** → `". store produk"`, semua tombol mati (§ Tombol).
3. **Pergeseran indeks argumen** di 26 titik: `ctx.args` sudah dipotong nama aksi, jadi indeks mulai dari 0. Akibatnya `qty` membaca argumen sama dua kali (`qty 1 3` selalu jadi `qty 1 1`) dan `produk` / `setkategori` / `ubahstatus` salah baca.
4. **`bilang()` menolak 0** padahal 0 = "hapus item" → tombol Hapus tidak berfungsi. Ditambah `bilanganJumlah()`.
5. **`setPaymentMethod()` selalu ditolak** — `setSetting()` hanya menerima kunci `DEFAULT_SETTINGS`, sedangkan metode pembayaran disimpan sebagai `payment_dana`, `payment_qris`, dst.
6. **`namaBersih()` dipanggil dengan variabel yang tidak ada** (`nama` vs `name`) di `addCategory`, `getProductByName`, `addProduct` → `ReferenceError` pada produk/kategori pertama.
7. **Navigasi kategori kehilangan filter** saat pindah halaman.
8. **`addstock`/`delstock` dipanggil tombol tapi tidak punya handler** → tombol `➕/➖` di kartu Ubah Stok diam.
9. **`conn` tidak diteruskan** ke `tambahProduk`/`updateProduk`/`kirim` pada beberapa jalur → `ReferenceError`/`conn.sendMessage is not a function` saat `.addlist`, `.updatelist`, `.resetstore`.

**Pengujian:** 4 suite, **185 assertion, 0 gagal** — lapisan data (termasuk overselling nyata: 2 user checkout stok terakhir bersamaan), persistensi lintas proses, alur end-to-end semua aksi (navigasi, keranjang, checkout, ownership, otorisasi owner, pagination, filter, promo, validasi id rusak termasuk SQL injection), dan alur owner lewat handler asli. Bot tidak bisa diuji ke WhatsApp sungguhan tanpa akun owner + akun pengguna.

#### Debug menyeluruh — `scripts/debug-store.mjs`

```bash
cd nano-engine
node scripts/debug-store.mjs     # exit 1 = ada exception atau perilaku salah
```

Menjalankan **setiap** aksi (50 `case` di `core/store/aksi.js`) dan **setiap** perintah (11 user + 27 owner + `setimg`) lewat jalur router sungguhan, lalu memeriksa: tidak ada exception, selalu ada balasan, dan non-owner ditolak. Dijalankan pada dua kondisi — toko **kosong** (jalur paling rawan: `.cart` tanpa item, `.checkout` tanpa keranjang, `.payment` tanpa metode) dan toko **terisi** (produk, 2 pembeli, promo, metode bayar). Argumen yang dicoba pada setiap aksi: kosong, id valid, id asing, `abc`, `-1`, `0`, `1' OR '1'='1`, `; DROP TABLE`, dan teks 5.000 karakter.

**Hasil: 1.587 pemeriksaan, nol exception, nol perilaku salah.**

Yang perlu dicatat: dua putaran pertama **melaporkan 9 kegagalan palsu** (`non-owner bisa .resetstore`) — dan itu membocorkan kelemahan test-nya sendiri, bukan bug produksi:

1. Harness memanggil `handler(m, ctx)` langsung, sehingga **melewati gerbang owner router** (`core/router-pesan.js`: `isOwnerCommand()` → `if (ownerRequired && !ownerUser) return`). Router production sudah benar.
2. Setelah gerbang disimulasikan, koneksi test diberi identitas non-owner — tapi `lib/cek-akses.js` menganggap pengirim sebagai owner bila nomornya sama dengan `conn.user.id`. Di bot nyata `conn.user.id` adalah nomor bot, jadi harness perlu dibalik: **koneksi tetap owner, pengirim yang diganti**.
3. Sisa kegagalan semuanya "Terlalu cepat" — rate limit 12 aksi/10 detik ikut menumpuk karena 200 aksi dipesan dari JID yang sama. Diperbaiki dengan pengirim unik per iterasi.

Temuan menarik dari kontrol: **dua lapis pertahanan menolak non-owner dengan pesan berbeda.** `.storestats` ditangani `store.js` yang `ownerOnly=false`, jadi router tidak menolak; yang menangkap adalah `AKSI_OWNER` di `core/store/aksi.js` dengan pesan "khusus untuk owner toko". Kalau router yang menolak, pesannya "khusus untuk owner bot". Keduanya benar, dan pengujian sengaja memverifikasi bahwa keduanya hidup.

Karena itu harness-nya diberi **kontrol validasi diri**: sebelum hasil lain dipercaya, ia memastikan bisa membedakan owner (dilewati) dari non-owner (ditolak), dan mencetak "harness TIDAK valid" kalau tidak. Test yang bisa lulus apa pun tidak berguna.

#### Menu kategori: 26 dari 28 perintah owner toko tidak terlihat

Keluhan: "kok gada di menu store". Setelah `.kategori store` dirender beneran: hanya **9 baris**, semuanya untuk user.

Penyebabnya `getPluginMenuCommands()` di `lib/menu.js`:

```js
const names = Array.isArray(plugin.menuHelp) ? plugin.menuHelp
  : [Array.isArray(plugin.help) ? plugin.help[0] : plugin.help]
```

Satu plugin menyumbang **satu** baris ke menu kategori — `menuHelp` kalau ada, kalau tidak baru `help[0]`. `store.js` punya `menuHelp` (9), tapi `store-owner.js` **tidak punya sama sekali** dan `handler.category`-nya `'owner'`. Jadi di `.kategori owner` pun hanya muncul `addlist` (help[0]). Diperiksa silang: **dari 28 perintah owner toko, hanya 2 yang terlihat di menu mana pun** — 26 hilang total.

Perbaikan:
- `store-owner.js` dan `store-img.js` → `handler.category = 'store'`. Semuanya memang perintah toko; menaruhnya di kategori `owner` menyembunyikannya dari menu toko. Badge Ⓞ tetap muncul karena `formatCommandWithStatus()` membaca `handler.ownerOnly`, bukan nama kategori — jadi informasi "khusus owner" tidak ikut hilang.
- Kedua file diberi `menuHelp` berisi seluruh perintahnya.
- `store.js` `menuHelp` dilengkapi dari 9 ke 21.

`.kategori store` sekarang **50 baris, 48 perintah store, 30 di antaranya berbadge Ⓞ**, 1.371 karakter — aman di bawah batas 4.096.(dicek lewat render nyata)

#### Catatan: `.allmenu` bermasalah — belum diperbaiki

`.allmenu` (`plugins/main/allmenu.js`) menaruh `buildFullMenuText()` — **16.493 karakter untuk 26 kategori** — sebagai `setFooter()` pada satu kartu `ButtonV2`. Footer kartu WhatsApp jauh lebih pendek daripada 4.096 karakter, jadi teks itu praktis tidak akan tampil utuh. Ini masalah lama, tidak berkaitan dengan Store, dan belum disentuh. Perlu diputuskan dulu: potong footer + arahkan ke `.kategori <nama>`, atau kirim per kategori dalam beberapa pesan.

#### Rekonsiliasi dengan daftar perintah (2026-10-05)

Daftar perintah STORE yang jadi acuan dibandingkan otomatis dengan yang benar-benar terdaftar. **23 dari 23 ada** — setelah satu diperbaiki (lihat `.setpayment` di bawah).

Tiga bug ditemukan dari proses ini, dua di antaranya serius dan tidak akan pernah ketahuan tanpa memanggil perintahnya lewat router sungguhan:

**1. `.myorder` membocorkan order semua pembeli.** `case 'pesanan': case 'orderlist':` memanggil `store.listOrders({ status })` **tanpa `userId`**, yang berarti semua baris di `store_orders`. Siapa pun yang mengetik `.myorder` di grup bisa melihat order orang lain lengkap dengan nominalnya, dan kartu owner untuk kelolaan memakai kode yang sama. `filterorder` punya cacat sama. Sekarang: `.myorder`/`.history`/`filterorder` selalu difilter `userId` pemanggil; `.orderlist` tetap semua order tapi hanya untuk owner, dengan judul `🧾 SEMUA ORDER` supaya tidak tertukar.

**2. Perintah tanpa argumen membuka BERANDA, bukan kartunya.** `store.js` mengambil aksi dari kata pertama `m.text`, padahal router mengisi `m.text` = argumen **tanpa** nama perintah — jadi `.cart` tanpa argumen punya `m.text` kosong dan jatuh ke kartu beranda. Yang terdampak: `.cart`, `.payment`, `.myorder`, `.history`, `.favorite`, `.orderlist`, `.storestats`, `.listpayment`, `.listpromo`, `.listkategori`, `.stock`. Handler ditulis ulang memakai `m.command`. Test lama tidak menangkap ini karena memanggil `jalankanAksi()` langsung dan melewatkan jalur router tempat bug-nya ada.

**3. `.setpayment` tidak pernah ada.** Tercatat di daftar `AKSI_OWNER` tapi tidak punya `case` dan tidak masuk regex perintah — jadi mengetiknya dijawab "Aksi store setpayment tidak dikenal". Sekarang ada, dan diberi arti yang berbeda dari `.addpayment`: **add harus baru** (gagal kalau sudah ada), **set harus sudah ada** (gagal kalau belum) — pola yang sama dengan `addkategori`/`addpromo`. Di `core/store/db.js` muncul `hasPaymentMethod`, `addPaymentMethod`, `setPaymentMethod`, `upsertPaymentMethod`.

`.setqris` sempat rusak oleh perubahan itu karena ikut memakai `setPaymentMethod` yang baru jadi bersyarat — sekarang memakai `upsertPaymentMethod`, supaya berhasil baik saat QRIS baru diisi maupun saat diperbarui.

`.listpayment` juga sebelumnya menampilkan kartu versi user; sekarang menampilkan daftar kelolaan dengan tombol hapus per metode. `.listkategori` dipindahkan ke daftar perintah owner, konsisten dengan `listpayment`/`listpromo` — sebelumnya owner tidak pernah sampai ke tampilan yang bisa menghapus kategori, padahal itu satu-satunya gunanya.

Pengujian: 21 assertion alur router nyata (setiap perintah tanpa argumen → kartu yang benar), 13 assertion add/set payment, 9 assertion privasi order lintas 3 pembeli.

#### Perbaikan tampilan kartu (2026-10-05)

Keluhan: "menu store-nya kok dikit". Setelah kartu benar-benar dirender (bukan diasumsikan dari kode), dua masalah nyata:

**1. Beranda praktis kosong** — hanya "Selamat datang. Pilih menu di bawah untuk mulai." Tidak ada satu pun angka atau informasi. Padahal kartu pertama inilah yang selalu dilihat orang. Sekarang membawa: jumlah produk & kategori, promo yang sedang jalan, peringatan stok menipis, jumlah pesanan aktif, jam buka, dan kontak.

**2. `Baris produk di daftar tidak membuka produk — bug.** Baris list memakai `aksi(prefix, 'produk', p.id)` yang menghasilkan `.store produk 12`. Tapi `case 'produk'` membaca argumen pertama sebagai **nomor halaman**, bukan id produk. Jadi menekan produk mana pun hanya membuka halaman 1 — persis gejala "menunya dikit": kelihatan bisa diklik, hasilnya tidak ke mana-mana. Diperbaiki ke `produkid` (sudah ada handlernya) di daftar produk **dan** kartu favorit. Keduanya terverifikasi benar sekarang: klik di halaman 1 dan 2 masing-masing membuka produknya sendiri, tidak ada yang balik ke daftar.

Kartunya juga digemuk: baris produk kini menampilkan deskripsi + kategori, kategori menampilkan jumlah produk per kategori, keranjang menampilkan total item dan menandai produk yang stoknya bermasalah, pembayaran menampilkan langkah bayar 1-2-3 beserta kontak dan jam buka, dan detail produk menampilkan peringatan stok habis. Baris kosong ganda di kartu tanpa subtitle ikut dibersihkan.

Pola yang sama berlaku di `kartu()` secara umum, bukan per kartu — jadi kartu baru berikutnya ikut dapat perlakuan yang sama secara otomatis.

### Audit konflik perintah — `scripts/audit-konflik-perintah.mjs`

```bash
cd nano-engine
node scripts/audit-konflik-perintah.mjs   # exit 1 = ada konflik
```

**Kenapa script ini wajib dijalankan setiap menambah plugin.** `findPluginByCommand()` mengembalikan plugin **pertama** di `pluginStore` — yaitu plugin yang termuat duluan, bukan yang "lebih benar". Plugin yang kalah tidak error, tidak ada log, tidak ada peringatan: perintahnya tetap tampil di help dan menu, tapi tidak akan pernah terpanggil. Gejalanya command jalan tapi hasilnya dari fitur lain, persis seperti `.list` yang membuka daftar drama Melolo.

Yang dicek: (1) nama perintah yang dimiliki ≥2 plugin, lengkap dengan siapa menang dan siapa mati total · (2) nama perintah plugin non-haidar yang dipakai command generator haidar · (3) nama `hai/haidar/menu/ping/owner` yang diambil plugin yang bukan pemiliknya · (4) `handler.command` berpola aneh yang tidak bisa diaudit — dilaporkan keras, bukan dilewati diam-diam, supaya hasil audit tidak dipercaya sambil ada yang terlewat.

Hasil saat ini: **1031 nama perintah, 0 konflik, 0 regex tak terparse.**

#### 6 konflik yang ditemukan & diperbaiki

| Perintah | Plugin yang menang | Yang mati | Penyebab | Perbaikan |
|---|---|---|---|---|
| `.addlist` | `plugins/store/store-owner.js` | `plugins/store/store.js` | **Salah saya** — `addlist` ikut masuk regex `store.js` padahal `store-owner.js` sudah menangani | `addlist` dibuang dari `store.js` |
| `.dadu` | `plugins/game/dadu.js` | `plugins/rpg/dice.js` | Beda fitur (dadu 3D vs tebak mata dadu), tapi sama-sama mau nama `.dadu` | `.dadu` dibuang dari `dice.js`; `.dice`/`.roll` tetap |
| `.job` | `plugins/rpg/class.js` | `plugins/rpg/work.js` | Job class vs bekerja Cari uang | `.job` dibuang dari `work.js`; `.work`/`.kerja` tetap |
| `.spin` | `plugins/rpg/lottery.js` | `plugins/rpg/spin.js` | Gacha vs roda harian | `.spin` dibuang dari `spin.js`; `.roda`/`.putar` tetap |
| `.pindl` | `plugins/download/pindl.js` | `plugins/tools/gist.js` | `lib/gist/manifest.json` punya `cmd: "pindl"` | masukkan ke `DILEWATI` di `lib/gist/kategori.js` |
| `.pinsearch` | `plugins/search/pins.js` | `plugins/tools/gist.js` | idem, `cmd: "pinsearch"` | idem |

**Prinsip perbaikannya: alias mati dibuang dari plugin yang KALAH, bukan diambil dari plugin yang menang.** Dengan begitu tidak ada satu pun perintah yang berubah makna bagi pengguna — semua fitur tetap terjangkau lewat alias lain yang sudah ada. Untuk `.spin` ini berarti `.spin` tetap gacha seperti sekarang; membalikannya ke roda harian mengubah perilaku yang sudah dikenal pengguna, jadi itu keputusan produk, bukan perbaikan teknis.

`lib/gist/kategori.js` ternyata **sudah punya** mekanismenya (`DILEWATI`) dengan isi `ocr`, `kalender`, `pixiv` — hanya `pindl` dan `pinsearch` yang lupa ditambahkan. Jadi tidak perlu mekanisme baru, cukup lengkapi daftar yang sudah ada.

### Contoh nyata menambah plugin kecil — `.fakeffduo`

1. Permintaan user diterima (kode pihak asli ditulis untuk framework Baileys lain: `handler.command` array, `m.react`, `text/command` di context, `quoted: m`, `node-fetch` tanpa timeout).
2. Adaptasi ke konvensi engine (§5): `command` RegExp, `m.text`, `quoted: m.raw`, react manual, timeout `AbortSignal.timeout(60_000)`, `handler.limit=false` eksplisit, kategori `tools`.
3. Cek API: tanpa `name2` → 400; `node-fetch` tersedia di `nano-engine/node_modules`.
4. Verifikasi (§5.6): `node --check`, import test → `command /^fakeffduo$/i · tools · limit false`, katalog naik 230→**231** (`244` handler).
5. Hot-reload engine otomatis memuat; katalog/brand guard lolos; commit dengan trailer standar.

## 14. Konvensi Git & Aturan Operasional

- Pesan commit ringkas + trailer:

```
🤖 Generated with Codebuff
Co-Authored-By: Codebuff <noreply@codebuff.com>
```

- Jangan commit: `nano-engine/tmp/`, `tmp/`, `.env`, database, `freebuff-chat-*.md`.
- Berkas milik user yang tidak boleh disentuh tanpa permintaan: `lib/proxy.js`, `scripts/update-proxy-pool.js`, `nano-engine/plugins/tools/unblur.js`, `lib/ai-foto.js` (perubahan lokal), halaman admin/reset-password, dsb.
- **Dilarang keras** (kebijakan permanen): replay pembayaran, spoofing device, penambah view, dan rotasi proxy/IP gratis untuk menghindari kuota layanan.
- Satu-satunya pengecualian sentuh data user lain: reset password `bjoget@gmail.com` yang sudah diizinkan.
- Restart sesi hanya lewat endpoint gateway (`POST /sessions/:key/restart`) — jangan kill proses engine manual.

## 15. Ringkasan Perintah Cepat (cheat sheet)

```bash
cd /root/webbot
TOKEN=$(grep -m1 '^GATEWAY_TOKEN=' .env | cut -d= -f2- | tr -d '"')
KEY=cmusgx4fd09stj8osdwor66eh

# status
curl -s http://127.0.0.1:4001/health
curl -s -H "x-gateway-token: $TOKEN" http://127.0.0.1:4001/sessions/$KEY | head -c 400

# restart sesi bot
curl -s -X POST -H "x-gateway-token: $TOKEN" http://127.0.0.1:4001/sessions/$KEY/restart

# restart web
ps -eo pid,cmd | awk '/npm exec next.start|sh -c next.start|next-server/ && !/awk/ {print $1}' | xargs -r kill
setsid env NEXT_TELEMETRY_DISABLED=1 npx next start -p 3005 >> /tmp/next-web.log 2>&1 < /dev/null & disown

# build aman (web MATI dulu)
NEXT_TELEMETRY_DISABLED=1 npx next build --turbopack

# katalog plugin
cd nano-engine && node scripts/katalog-plugin.mjs --ringkas
```

