/* ── Segarkan pool proxy gratis (lib/proxy.js) sekarang juga ───────────────
   Ambil daftar sumber GitHub, uji satu per satu, simpan yang hidup ke
   tmp/proxy-pool.json. Dipakai manual (`npm run proxy:update`) atau dari
   cron/Task Scheduler bila ingin penyegaran di luar proses gateway.

   Catatan: gateway sendiri sudah menyegarkan pool otomatis tiap 30 menit
   selama prosesnya hidup (lihat REFRESH_INTERVAL di lib/proxy.js), jadi
   script ini opsional — berguna untuk memanaskan cache atau memicu
   pembaruan lebih awal.
─────────────────────────────────────────────────────────────────────────── */

import { refreshPool } from '../nano-engine/lib/proxy.js'

const status = await refreshPool()

console.log(`[proxy] ${status.total} proxy hidup · disegarkan ${status.lastRefresh || '-'}`)
for (const p of status.urls) {
  console.log(`  ${p.url}  ${p.ms}ms  ${p.country || '-'}`)
}

if (!status.total) {
  console.error('[proxy] tidak ada proxy hidup — periksa koneksi atau daftar sumber GitHub.')
  process.exit(1)
}

/* Agent proxy menyisakan koneksi keep-alive; keluar eksplisit agar script
   tidak menggantung walau pool sudah selesai diuji. */
process.exit(0)
