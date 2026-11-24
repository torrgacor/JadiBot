/* ⌬
 ┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
 ┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
 ┇ █  █ █ █▀▄ █▄█   █▀█ █
 ┇  ▀█  --N--a--n--o------A--i-----
 ┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
 ┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━
 ┇▫️Author  : Danz nano & Awang Ofc
 ┇▫️Website  : awangofc.my.id
 ┇▫️WhatsApp : wa.me/556184127506
 ┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
 ┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
 ┇🔸Dilarang Menghapus Creadit SC
 ┇🔸Dilarang Menjual Script Nano Ai
 ┇🔸Dilarang Mengatas Namakan Script!!
 ⌬ */

/* Komiku VERSI AMAN — lapisan chat. Mesin scraping-nya ada di lib/komiku.js
   (murni, tanpa dependensi WhatsApp) supaya bisa diuji terpisah.
   Genre/slug/kata dewasa DITOLAK di lib — plugin ini tidak membuka celah. */

import {
  getHome, getPopular, getLatest, search, getByType,
  getByGenre, getDetail, getChapter, getRandom,
  getGenres, downloadChapter, isDewasa,
} from '../../lib/komiku.js'
import { fetchBuffer } from '../../lib/http.js'

/* Pratinjau chapter dibatasi agar obrolan tidak dibanjiri. */
const MAX_PRATINJAU = 5
/* Gambar pratinjau dibatasi agar tidak makan RAM. */
const MAX_GAMBAR = 8 * 1024 * 1024
/* Daftar dibatasi agar pesan tidak kepanjangan. */
const MAX_DAFTAR = 10
/* ZIP chapter dibatasi agar tidak makan RAM. */
const MAX_ZIP_GAMBAR = 60

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {
    /* abaikan */
  }
}

function potong(teks, maks = 300) {
  const t = String(teks || '').replace(/\s+/g, ' ').trim()
  return t.length > maks ? `${t.slice(0, maks - 1)}…` : t
}

function barisItem(it, i) {
  const ch = it.total_chapters ? ` — Ch. ${it.total_chapters}` : ''
  const genre = it.genre ? ` [${it.genre}]` : ''
  return `${i + 1}. *${potong(it.title, 80)}*${genre}${ch}\n   └ \`${it.slug}\``
}

const PANDUAN = (usedPrefix) => [
  '╭─〔 📚 KOMIKU AMAN 〕',
  '│',
  `│ ${usedPrefix}komiku cari <judul>`,
  `│ ${usedPrefix}komiku populer [hal]`,
  `│ ${usedPrefix}komiku terbaru [hal]`,
  `│ ${usedPrefix}komiku tipe <manga|manhwa|manhua> [hal]`,
  `│ ${usedPrefix}komiku genre <slug> [hal]`,
  `│ ${usedPrefix}komiku detail <slug>`,
  `│ ${usedPrefix}komiku chapter <slug-chapter>`,
  `│ ${usedPrefix}komiku dl <slug-chapter>`,
  `│ ${usedPrefix}komiku genrelist`,
  '│',
  '│ 🔞 Mode aman: genre/judul dewasa ditolak.',
  '╰──────────────',
].join('\n')

function captionDaftar(judul, items, info = '') {
  const baris = [
    '╭─〔 📚 KOMIKU AMAN 〕',
    `│ ${judul}${info ? ` — ${info}` : ''}`,
    '│',
  ]
  items.slice(0, MAX_DAFTAR).forEach((it, i) => baris.push(`│ ${barisItem(it, i)}`))
  if (items.length > MAX_DAFTAR) baris.push(`│ … +${items.length - MAX_DAFTAR} lainnya`)
  baris.push('│', '│ 🔞 Mode aman aktif.', '╰──────────────')
  return baris.join('\n')
}

function ambilHal(args) {
  const n = Number(args[args.length - 1])
  if (Number.isInteger(n) && n > 0 && n <= 999) return { hal: n, sisa: args.slice(0, -1) }
  return { hal: 1, sisa: args }
}

const handler = async (m, { conn, usedPrefix }) => {
  const teks = String(m.text || '').trim()
  const args = teks.split(/\s+/).filter(Boolean)
  const sub = (args[0] || '').toLowerCase()

  if (!sub) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: PANDUAN(usedPrefix) }, { quoted: m.raw })
  }

  if (isDewasa(args.join(' '))) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: '❌ Kata kunci dewasa ditolak (mode aman).' }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  try {
    let balasan = ''

    if (sub === 'populer' || sub === 'popular') {
      const { hal } = ambilHal(args.slice(1))
      const r = await getPopular({ page: hal })
      if (!r.items.length) throw new Error('Tidak ada hasil di halaman itu.')
      balasan = captionDaftar('🔥 Populer', r.items, `hal. ${r.page}`)
    } else if (sub === 'terbaru' || sub === 'latest' || sub === 'update') {
      const { hal } = ambilHal(args.slice(1))
      const r = await getLatest(hal)
      if (!r.items.length) throw new Error('Tidak ada hasil di halaman itu.')
      balasan = captionDaftar('🆕 Terbaru', r.items, `hal. ${r.page}`)
    } else if (sub === 'tipe' || sub === 'type') {
      const { hal, sisa } = ambilHal(args.slice(1))
      const tipe = (sisa[0] || 'manhwa').toLowerCase()
      if (!['manga', 'manhwa', 'manhua'].includes(tipe)) {
        throw new Error('Tipe harus: manga, manhwa, atau manhua.')
      }
      const r = await getByType(tipe, { page: hal })
      if (!r.items.length) throw new Error('Tidak ada hasil di halaman itu.')
      balasan = captionDaftar(`📖 ${r.type}`, r.items, `hal. ${r.page}`)
    } else if (sub === 'genre') {
      const { hal, sisa } = ambilHal(args.slice(1))
      if (!sisa[0]) throw new Error(`Isi slug genre.\nContoh: ${usedPrefix}komiku genre aksi`)
      const r = await getByGenre(sisa[0], { page: hal })
      if (!r.items.length) throw new Error('Tidak ada hasil di halaman itu.')
      balasan = captionDaftar(`🏷️ Genre ${r.genre}`, r.items, `hal. ${r.page}`)
    } else if (sub === 'cari' || sub === 'search' || sub === 'find') {
      const { hal, sisa } = ambilHal(args.slice(1))
      if (!sisa.length) throw new Error(`Isi kata kunci.\nContoh: ${usedPrefix}komiku cari naruto`)
      const r = await search(sisa.join(' '), { page: hal })
      if (!r.results.length) throw new Error(`Tidak ada hasil untuk "${r.keyword}".`)
      balasan = captionDaftar(`🔍 "${r.keyword}"`, r.results, `hal. ${r.page}`)
    } else if (sub === 'genrelist' || sub === 'genres' || sub === 'daftar-genre') {
      balasan = [
        '╭─〔 📚 GENRE AMAN 〕', '│',
        ...getGenres().map((g) => `│ • ${g}`),
        '│', '│ 🔞 Genre dewasa tidak tersedia.', '╰──────────────',
      ].join('\n')
    } else if (sub === 'detail' || sub === 'info') {
      const slug = args.slice(1).join(' ').trim()
      if (!slug) throw new Error(`Isi slug komik.\nContoh: ${usedPrefix}komiku detail solo-leveling`)
      const d = await getDetail(slug)
      const genreTxt = (d.genres || []).map((g) => g.name).slice(0, 8).join(', ') || '-'
      const chList = (d.chapters || []).slice(0, MAX_DAFTAR)
        .map((c, i) => `│ ${i + 1}. ${potong(c.title || c.slug, 70)}\n│    └ \`${c.slug}\``)
        .join('\n')
      balasan = [
        '╭─〔 📚 DETAIL 〕',
        `│ 📖 *${potong(d.title, 100)}*`,
        `│ 🏷️ ${d.type} · ${d.status}`,
        `│ 🎭 ${potong(genreTxt, 120)}`,
        `│ 📑 ${d.total_chapters} chapter`,
        d.synopsis ? `│ 📝 ${potong(d.synopsis, 300)}` : null,
        '│',
        chList || '│ (belum ada chapter)',
        '│',
        `│ Baca: ${usedPrefix}komiku chapter <slug-chapter>`,
        '│ 🔞 Mode aman aktif.',
        '╰──────────────',
      ].filter(Boolean).join('\n')
    } else if (sub === 'chapter' || sub === 'baca' || sub === 'read') {
      const slug = args.slice(1).join(' ').trim()
      if (!slug) throw new Error(`Isi slug chapter.\nContoh: ${usedPrefix}komiku chapter solo-leveling-chapter-1`)
      await tanganiChapter(conn, m, usedPrefix, slug, { unduhZip: false })
      m.limit?.success()
      await react(conn, m, '✅')
      return
    } else if (sub === 'dl' || sub === 'download' || sub === 'unduh' || sub === 'zip') {
      const slug = args.slice(1).join(' ').trim()
      if (!slug) throw new Error(`Isi slug chapter.\nContoh: ${usedPrefix}komiku dl solo-leveling-chapter-1`)
      await tanganiChapter(conn, m, usedPrefix, slug, { unduhZip: true })
      m.limit?.success()
      await react(conn, m, '✅')
      return
    } else if (sub === 'acak' || sub === 'random') {
      const d = await getRandom({ detail: true })
      const genreTxt = (d.genres || []).map((g) => g.name).slice(0, 8).join(', ') || '-'
      balasan = [
        '╭─〔 🎲 ACAK 〕',
        `│ 📖 *${potong(d.title, 100)}*`,
        `│ 🏷️ ${d.type} · ${d.status}`,
        `│ 🎭 ${potong(genreTxt, 120)}`,
        `│ 📑 ${d.total_chapters} chapter`,
        `│ 🔗 \`${d.slug}\``,
        '│',
        `│ Detail: ${usedPrefix}komiku detail ${d.slug}`,
        '│ 🔞 Mode aman aktif.',
        '╰──────────────',
      ].join('\n')
    } else if (sub === 'home' || sub === 'beranda') {
      const r = await getHome()
      if (!r.items.length) throw new Error('Belum ada komik aman yang tersedia.')
      balasan = captionDaftar('🏠 Beranda', r.items, `total ${r.total}`)
    } else {
      // Tanpa sub-perintah: anggap cari judul.
      const { hal, sisa } = ambilHal(args)
      if (!sisa.length) throw new Error('Perintah tidak dikenal. Lihat panduan di bawah.')
      const r = await search(sisa.join(' '), { page: hal })
      if (!r.results.length) throw new Error(`Tidak ada hasil untuk "${r.keyword}".`)
      balasan = captionDaftar(`🔍 "${r.keyword}"`, r.results, `hal. ${r.page}`)
    }

    m.limit?.success()
    await react(conn, m, '✅')
    return conn.sendMessage(m.chat, { text: balasan }, { quoted: m.raw })
  } catch (err) {
    m.limit?.fail()
    console.error('[NANO KOMIKU ERROR]', err?.message)
    await react(conn, m, '❌')
    const panduan = /panduan|tidak dikenal|Isi /i.test(err?.message || '')
    return conn.sendMessage(
      m.chat,
      { text: `❌ ${err?.message || 'Gagal memproses Komiku.'}${panduan ? `\n\n${PANDUAN(usedPrefix)}` : ''}` },
      { quoted: m.raw }
    )
  }
}


async function tanganiChapter(conn, m, usedPrefix, slug, { unduhZip = false } = {}) {
  const c = await getChapter(slug)
  if (!c.images?.length) throw new Error('Chapter tidak punya gambar yang bisa dibaca.')

  const info = [
    '╭─〔 📖 CHAPTER 〕',
    `│ 📖 *${potong(c.title, 100)}*`,
    `│ 🖼️ ${c.total_images} halaman`,
    c.manga_url ? `│ 📚 Induk: ${c.manga_url}` : null,
    '│',
  ].filter(Boolean).join('\n')
  await conn.sendMessage(m.chat, { text: info }, { quoted: m.raw })

  // Pratinjau terbatas — bukan seluruh chapter sekaligus.
  let pratinjau = 0
  for (const url of c.images.slice(0, MAX_PRATINJAU)) {
    try {
      const { buffer } = await fetchBuffer(url, {
        maxBytes: MAX_GAMBAR,
        timeout: 60_000,
        headers: { Referer: 'https://komiku.online/' },
      })
      await conn.sendMessage(
        m.chat,
        { image: buffer, caption: pratinjau === 0 ? `Halaman 1–${Math.min(MAX_PRATINJAU, c.images.length)} dari ${c.total_images}` : '' },
        { quoted: m.raw }
      )
      pratinjau++
    } catch { /* lewati gambar gagal */ }
  }
  if (!pratinjau) throw new Error('Semua gambar pratinjau gagal diunduh.')

  if (unduhZip) {
    const hasil = await downloadChapter(slug, { maxImages: MAX_ZIP_GAMBAR })
    await conn.sendMessage(
      m.chat,
      {
        document: hasil.zip_buffer,
        mimetype: 'application/zip',
        fileName: `${hasil.slug.slice(0, 60) || 'chapter'}.zip`,
        caption: `📦 ${potong(hasil.title, 80)}\n🖼️ ${hasil.total_images} halaman (maks. ${MAX_ZIP_GAMBAR})`,
      },
      { quoted: m.raw }
    )
  } else if (c.total_images > MAX_PRATINJAU) {
    await conn.sendMessage(
      m.chat,
      { text: `ℹ️ Menampilkan ${MAX_PRATINJAU} dari ${c.total_images} halaman.\nUnduh penuh: ${usedPrefix}komiku dl ${c.slug}` },
      { quoted: m.raw }
    )
  }
}


handler.command = /^(komiku|komik|kmk|mangadl|manhwa|manhua)$/i
handler.help = ['komiku', 'komik', 'kmk', 'mangadl', 'manhwa', 'manhua']
handler.usage = ['komiku cari <judul>']
handler.tags = ['download']
handler.category = 'download'
handler.description =
  'Komiku: cari, detail, baca, dan unduh komik (ZIP) — versi aman, genre/judul dewasa ditolak'
handler.limitCommit = 'manual'

export default handler

