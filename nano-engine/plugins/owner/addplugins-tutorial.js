/*
⌬ Nano Ai · Tutorial .addplugins
  Kartu interaktif (interactiveMessage native) berisi panduan lengkap fitur
  .addplugins: tabel langkah, aturan keamanan, dan blok kode contoh —
  lengkap dengan tombol:
    • single_select → pilih menu tujuan langsung (game/tools/download/…)
    • cta_copy      → salin template plugin siap edit
    • quick_reply   → mulai sesi contoh
    • cta_url       → referensi dokumentasi
  User mode iOS otomatis dapat versi teks polos (aturan mode per-user).
*/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendInteractive } from '../../lib/tombol.js'
import { isIosMode } from '../../lib/mode-pesan.js'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = path.resolve(DIR, '../..', 'plugins')

const TEMPLATE = [
  "/*",
  "⌬ Nano Ai · Plugin Baru",
  "  Deskripsi singkat plugin di sini.",
  "*/",
  "",
  "async function handler(m, context) {",
  "  const { conn, usedPrefix } = context",
  "  await m.reply('Halo dari plugin baru! 🎉')",
  "}",
  "",
  "handler.command = /^namaplugin$/i",
  "handler.help = ['namaplugin']",
  "handler.tags = ['tools']",
  "handler.category = 'tools'",
  "handler.description = 'Deskripsi command untuk menu'",
  "handler.limit = false",
  "",
  "export default handler",
].join('\n')

function daftarMenu() {
  try {
    return fs
      .readdirSync(PLUGIN_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
  } catch {
    return []
  }
}

const ikonMenu = {
  main: '🏠', owner: '👑', tools: '🛠️', sticker: '🎨', downloader: '📥',
  group: '👥', game: '🎮', fun: '🎉', ai: '🤖', rpg: '⚔️', download: '⬇️',
  haidar: '🌐', apifree: '🆓', utility: '🧰', media: '🖼️', search: '🔎',
}

const IKON_DEFAULT = '📁'

function tabelLangkah() {
  const baris = [
    ['1', 'Ketik', '.addplugins <menu>'],
    ['2', 'Kirim', 'file .js / kode'],
    ['3', 'Timpa?', 'balas .ya'],
    ['4', 'Batal', 'balas .batal'],
  ]
  const lebar = [4, 7, 18]
  const garis = (l, m, r) => `${l}${'─'.repeat(lebar[0])}${m}${'─'.repeat(lebar[1])}${m}${'─'.repeat(lebar[2])}${r}`
  const isi = (cells) => {
    const pad = (s, w) => (s + ' '.repeat(w)).slice(0, w)
    return cells.map((c, i) => pad(c, lebar[i])).join(' │ ')
  }
  return [
    '```',
    garis('┌', '┬', '┐'),
    isi(['No', 'Aksi', 'Contoh']),
    garis('├', '┼', '┤'),
    ...baris.map((b) => isi(b)),
    garis('└', '┴', '┘'),
    '```',
  ].join('\n')
}

function teksPenuh(daftar) {
  const menu = daftar.map((d) => `▸ ${ikonMenu[d] || IKON_DEFAULT} ${d}`).join('\n')
  return [
    '📚 *TUTORIAL .ADDPLUGINS*',
    '',
    'Pasang plugin langsung dari chat — tanpa SSH, tanpa panel.',
    '',
    '*⚡ CARA PAKAI (4 LANGKAH)*',
    tabelLangkah(),
    '',
    '*1️⃣ MULAI SESI*',
    '```',
    '.addplugins game',
    '```',
    '→ bot membalas meminta file/kode, sesi aktif 5 menit.',
    '',
    '*2️⃣ KIRIM PLUGIN* — dua cara:',
    '📎 *Reply dokumen .js* (paling gampang — nama file dipakai apa adanya)',
    '✏️ *Tempel kode* langsung di chat (nama file diambil otomatis)',
    '',
    '*3️⃣ TEMPLATE SIAP EDIT* — pakai tombol 📋 di bawah:',
    '```',
    TEMPLATE.split('\n').slice(0, 6).join('\n'),
    '… (lengkap ada di tombol Salin Template)',
    '```',
    '',
    '*4️⃣ AKTIF OTOMATIS*',
    'Watcher mendeteksi file baru → plugin langsung hidup tanpa restart.',
    'Balas pesan konfirmasi dengan *.ping* untuk mengecek.',
    '',
    '*🗂️ MENU TERSEDIA*',
    menu,
    '',
    '*🛡️ ATURAN KEAMANAN*',
    '▸ Khusus owner',
    '▸ Hanya file .js · maks 300 KB',
    '▸ Sintaks dicek `node --check` — rusak = auto-hapus',
    '▸ Anti path-traversal (`../`, `/`, `\\` ditolak)',
    '▸ File sudah ada → wajib konfirmasi .ya',
    '▸ Sesi hangus 5 menit',
    '',
    '*❓ TROUBLESHOTING*',
    '▸ Sesi hilang? → ulangi .addplugins (timeout 5 menit)',
    '▸ "sintaks tidak valid"? → cek kurung/koma, perbaiki, kirim ulang',
    '▸ Ingin ganti file lama? → kirim ulang, lalu balas .ya',
    '▸ Plugin tidak muncul? → cek nama command tidak bentrok',
    '',
    '*💡 INFO PLUGIN KAMU*',
    '```',
    'handler.command = /^nama$/i   → trigger tanpa prefix juga jalan',
    'handler.category = "game"     → posisi di menu',
    'handler.ownerOnly = true      → khusus owner',
    'handler.limit = true          → pakai limit user',
    '```',
  ].join('\n')
}

async function kirimKartu(m, context) {
  const conn = context?.rawConn || context?.conn
  const daftar = daftarMenu()

  /* iOS / mode tanpa tombol → teks polos (aturan mode per-user) */
  try {
    if (await isIosMode(m.sender)) {
      await m.reply(teksPenuh(daftar))
      return { success: true }
    }
  } catch {}

  const tombolMenu = daftar.slice(0, 12)
  await sendInteractive(
    conn,
    m.chat,
    {
      title: '📚 TUTORIAL .ADDPLUGINS',
      subtitle: 'Nano Ai • Pasang plugin dari chat',
      body: [
        '*Pasang plugin langsung dari chat* — tanpa SSH/panel.',
        '',
        '*⚡ Langkah:*',
        tabelLangkah(),
        '',
        '*1️⃣* `.addplugins game` → bot minta file/kode',
        '*2️⃣* reply dokumen *.js* atau tempel kode',
        '*3️⃣* file ada? balas *.ya* untuk timpa',
        '*4️⃣* aktif otomatis (hot-reload)',
        '',
        '*🛡️ Aturan:* owner-only · hanya .js · maks 300 KB · sintaks dicek `node --check` · anti path-traversal · sesi 5 menit',
        '',
        `*🗂️ Menu:* ${daftar.join(' · ')}`,
        '',
        '_Pakai tombol di bawah 👇_',
      ].join('\n'),
      footer: 'Nano Ai • .addplugins tutorial',
      buttons: [
        {
          type: 'raw',
          name: 'single_select',
          params: {
            title: '📂 Pilih Menu Tujuan',
            sections: [
              {
                title: 'Folder plugins/',
                highlightLabel: 'klik → langsung mulai sesi',
                rows: tombolMenu.map((d) => ({
                  header: ikonMenu[d] || IKON_DEFAULT,
                  title: d,
                  description: `Mulai sesi .addplugins ${d}`,
                  command: `.addplugins ${d}`,
                })),
              },
            ],
          },
        },
        { type: 'copy', label: '📋 Salin Template Plugin', copyCode: TEMPLATE },
        { type: 'quick', label: '🎮 Contoh: .addplugins game', command: '.addplugins game' },
        { type: 'quick', label: '🛠️ Contoh: .addplugins tools', command: '.addplugins tools' },
        { type: 'url', label: '📖 Contoh plugin di repo', url: 'https://github.com/noxXza/base-wa-esm' },
      ],
    },
    { quoted: m.raw },
  )

  /* sendInteractive sudah punya fallback teks sendiri kalau kartu ditolak
     klien; hasil string = kartu terkirim, bukan string = jalur fallback. */
  return { success: true }
}

async function handler(m, context) {
  return kirimKartu(m, context)
}

handler.command = /^(tutorialaddplugins?|addpluginstutorial|howtoaddplugin)$/i
handler.help = ['tutorialaddplugins']
handler.tags = ['owner']
handler.category = 'owner'
handler.description = 'Panduan lengkap .addplugins: langkah, aturan, template — dengan tombol interaktif'
handler.ownerOnly = true
handler.limit = false

export default handler
