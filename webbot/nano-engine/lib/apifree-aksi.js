/* ==========================================================================
   Bagian "jalankan endpoint lalu balas ke WhatsApp" untuk API GRATIS.

   Aturan balasannya sama seperti fitur Haidar: isinya saja, tanpa bungkus.
   Bedanya, kalau hasilnya berupa daftar (banyak item bertautan) balasannya
   dikirim sebagai pesan interaktif bertombol supaya lebih enak dipakai.
   ========================================================================== */

import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { isOwner } from './cek-akses.js'
import { sendInteractive } from './tombol.js'
import { sendMedia } from './haidar-aksi.js'
import {
  callEndpoint,
  findEndpoint,
  missingRequired,
  parseParams,
  exampleCommand,
  commandFor,
  pickAnswer,
  readable,
  findMedia,
  loadCatalog,
  penyediaList,
  maskKey,
  getKey,
} from './apifree.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const CONFIG_FILE = path.join(DATA_DIR, 'apifree-config.json')

const MAX_TEXT = 3400
const MAX_BUTTON_TEKS = 900

/* Nama parameter yang lazim menampung teks bebas dari pengguna. */
const TEXT_PARAMS = new Set([
  'text',
  'teks',
  'message',
  'pesan',
  'prompt',
  'query',
  'q',
  'kata',
  'keyword',
  'judul',
  'title',
  'name',
  'nama',
  'url',
  'link',
  'kota',
  'city',
  'lagu',
  'username',
  'user',
  /* kolom bernama lain yang jelas menampung teks dari pengguna */
  'param',
  'search',
  'cari',
  's',
  'tag',
  'artist',
  'penyanyi',
  'artis',
  'song',
  'track',
  'channel',
  'episode',
  'chapter',
  'kode',
])

const DEFAULT_CONFIG = { access: 'semua', perUserPerMinute: 8, pakaiLimit: true, tombol: true }

export function getConfig() {
  try {
    const json = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
    return {
      ...DEFAULT_CONFIG,
      ...json,
      access: json?.access === 'owner' ? 'owner' : 'semua',
      perUserPerMinute: Number(json?.perUserPerMinute) > 0 ? Number(json.perUserPerMinute) : DEFAULT_CONFIG.perUserPerMinute,
      pakaiLimit: json?.pakaiLimit === false ? false : true,
      tombol: json?.tombol === false ? false : true,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export async function setConfig(patch = {}) {
  const next = { ...getConfig(), ...patch }
  await fs.ensureDir(DATA_DIR)
  await fs.writeJson(CONFIG_FILE, next, { spaces: 2 })
  return next
}

/* ── gerbang & batas ─────────────────────────────────────────────────────── */

export async function guardAkses(m, conn) {
  const { access } = getConfig()
  if (access !== 'owner') return { blocked: false, owner: false }
  const owner = await isOwner(m, conn).catch(() => false)
  if (owner) return { blocked: false, owner: true }
  await m.reply('🔒 Fitur ini sedang dibatasi hanya untuk owner bot.')
  return { blocked: true, owner: false }
}

const hits = new Map()

export function rateLimit(sender) {
  const limit = getConfig().perUserPerMinute
  const now = Date.now()
  const box = hits.get(sender) || { count: 0, reset: now + 60000 }
  if (now > box.reset) {
    box.count = 0
    box.reset = now + 60000
  }
  box.count++
  hits.set(sender, box)
  return { allowed: box.count <= limit, wait: Math.ceil((box.reset - now) / 1000), limit }
}

export function cut(text, max = MAX_TEXT) {
  const isi = String(text ?? '')
  return isi.length <= max ? isi : `${isi.slice(0, max)}\n… (dipotong)`
}

/* ── teks balasan ────────────────────────────────────────────────────────── */

export function errorText(error, prefix = '.') {
  const lines = [`⚠️ ${String(error?.message || error)}`]
  if (error?.code === 'nokey') {
    lines.push('', `Lihat daftar penyedia & status kunci: ${prefix}af penyedia`)
  } else if (error?.code === 'upstream') {
    lines.push('', 'Ini blokir dari sumber di balik penyedia, bukan kunci kita. Coba lagi beberapa saat lagi.')
  } else if (error?.code === 'ratelimit') {
    lines.push('', 'Tunggu beberapa detik lalu coba lagi.')
  } else if (error?.code === 'ambiguous') {
    lines.push('', `Tulis lebih spesifik, atau cari dulu: ${prefix}af cari <kata>`)
  }
  return cut(lines.join('\n'))
}

/* Balasan berupa berkas mentah (gambar/video/audio) — endpoint yang langsung
   mengirim biner. URL-nya sudah lengkap termasuk kunci, jadi bisa diunduh. */
function mediaLangsung(data) {
  const url = data?.__media
  if (typeof url !== 'string' || !/^https?:/i.test(url)) return []
  const tipe = String(data.__tipe || '')
  const kind = /^image\//i.test(tipe) ? 'image' : /^video\//i.test(tipe) ? 'video' : /^audio\//i.test(tipe) ? 'audio' : 'file'
  return [{ url, kind }]
}

/*
  Isi balasan untuk pesan berlampiran.

  Tautan mentah tidak diulang di caption: kalau berkasnya benar-benar terkirim,
  kolom seperti streamUrl cuma jadi baris sepanjang ribuan karakter — dan
  berkasnya sendiri yang dibutuhkan pengguna, bukan tautannya.
*/
function captionLampiran(result, media = []) {
  const baris = readable(result.data, {
    maxLines: 12,
    skip: [...Object.values(result.params || {}), ...media.map((item) => item.url)],
  })
    .filter((teks) => !/:\s*https?:\/\//i.test(teks))

  return baris.length ? cut(baris.join('\n'), MAX_BUTTON_TEKS) : ''
}

/* Kumpulkan item yang punya judul + tautan — bahan tombol. */
export function itemTertaut(data, max = 4) {
  const out = []
  const judulDari = (obj) => obj.title || obj.judul || obj.name || obj.nama || obj.berita || obj.judul_berita || obj.soal
  const tautanDari = (obj) => obj.url || obj.link || obj.berita_url || obj.video || obj.download || obj.link_download

  /* Cek satu objek: kalau punya judul + tautan, itu item daftar. Berlaku baik
     untuk item di dalam array maupun nilai objek ber-kunci angka. */
  const cekItem = (isi) => {
    if (!isi || typeof isi !== 'object' || Array.isArray(isi) || out.length >= max) return false
    const judul = judulDari(isi)
    const tautan = tautanDari(isi)
    if (typeof judul !== 'string' || !judul.trim()) return false
    if (typeof tautan !== 'string' || !/^https?:/i.test(tautan)) return false
    out.push({ judul: judul.trim(), tautan })
    return true
  }

  const walk = (node, depth) => {
    if (out.length >= max || depth > 4 || !node) return
    if (Array.isArray(node)) {
      for (const isi of node) if (!cekItem(isi)) walk(isi, depth + 1)
      return
    }
    if (typeof node === 'object') {
      if (cekItem(node)) return
      for (const nilai of Object.values(node)) walk(nilai, depth + 1)
    }
  }

  walk(data, 0)
  return out
}

/*
  Balasan utama:
    1. ada lampiran  → kirim lampirannya (caption = isi balasan)
    2. ada satu jawaban teks → jawabannya saja
    3. ada daftar bertautan & tombol aktif → pesan interaktif bertombol
    4. selain itu → isi balasan apa adanya, tanpa bungkus
*/
export async function kirimHasil(conn, m, result, { prefix = '.', command = '' } = {}) {
  const { data } = result

  // 1. berkas mentah (endpoint yang langsung mengirim gambar/video/audio)
  const langsung = mediaLangsung(data)
  if (langsung.length) {
    await sendMedia(conn, m, langsung, '')
    return { jenis: 'media' }
  }

  // 2. satu jawaban teks (percakapan AI, lirik, dan sejenisnya)
  const jawaban = pickAnswer(data)
  if (jawaban) {
    await m.reply(cut(jawaban.value))
    return { jenis: 'jawaban' }
  }

  const teks = cut(readable(data, { maxLines: 55, skip: Object.values(result.params || {}) }))
  if (!teks) {
    await m.reply('Penyedia tidak mengembalikan hasil. Coba kata kunci atau pilihan lain.')
    return { jenis: 'kosong' }
  }

  // 3. daftar (berita/hasil cari) — dikirim rapi, bertombol kalau bisa.
  //    Ditaruh sebelum jalur lampiran supaya daftarnya tidak tertukar dengan
  //    gambar yang kebetulan ikut di dalam datanya (mis. berita bergambar).
  const item = getConfig().tombol ? itemTertaut(data) : []
  if (item.length >= 2) {
    const buttons = item.slice(0, 2).map((x) => ({ type: 'url', label: `🌐 ${x.judul.slice(0, 18)}`, url: x.tautan }))
    if (command) buttons.push({ type: 'quick', label: '🔁 Ulangi', command: `${prefix}${command}` })
    try {
      await sendInteractive(
        conn,
        m.chat,
        {
          title: result.endpoint.name.slice(0, 60),
          subtitle: result.endpoint.provider,
          body: cut(teks, MAX_BUTTON_TEKS),
          footer: 'API GRATIS',
          buttons,
        },
        { quoted: m.raw },
      )
      return { jenis: 'tombol' }
    } catch {
      /* gagal kirim tombol → lanjut ke jalur lain */
    }
  }

  // 4. lampiran biasa (satu gambar/video dengan isi teks sebagai caption)
  const media = findMedia(data)
  if (media.length) {
    const terkirim = await sendMedia(conn, m, media, captionLampiran(result, media))
    /* Lampirannya ada tapi tidak satu pun berhasil dikirim (mis. kelewat
       besar) — kirim datanya sebagai teks supaya informasinya tidak hilang. */
    if (!terkirim) await m.reply(teks)
    return { jenis: 'media' }
  }

  await m.reply(teks)
  return { jenis: 'teks' }
}

/* ── jalankan ────────────────────────────────────────────────────────────── */

export async function execute(m, conn, endpoint, params, prefix = '.', command = '') {
  const batas = rateLimit(m.sender)
  if (!batas.allowed) {
    await m.reply(`⏳ Terlalu sering dipakai. Coba lagi ${batas.wait} detik lagi (batas ${batas.limit}×/menit).`)
    return { skipped: true }
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw?.key } }).catch(() => {})

  let result
  try {
    result = await callEndpoint(endpoint, params)
  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.raw?.key } }).catch(() => {})
    await m.reply(errorText(error, prefix))
    return { failed: true, error }
  }

  if (!result.ok) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.raw?.key } }).catch(() => {})
    await m.reply(errorText(result.error, prefix))
    return { failed: true, result }
  }

  const kirim = await kirimHasil(conn, m, result, { prefix, command })
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key } }).catch(() => {})
  return { ok: true, result, kirim }
}

/* Alur perintah: ".af <path|perintah> [nama=nilai …]" */
export async function runEndpoint(m, conn, query, rest, prefix = '.', command = '', provider = '') {
  const endpoint = findEndpoint(query, provider)

  if (!endpoint) {
    await m.reply(`Endpoint *${query}* tidak ada di katalog.\nCari dulu: ${prefix}af cari ${query}`)
    return
  }
  if (endpoint.ambiguous) {
    await m.reply(['Yang kamu maksud ada beberapa:', ...endpoint.ambiguous.map((e) => `▸ ${e.provider}${e.path} — ${e.name}`)].join('\n'))
    return
  }

  const { params, free } = parseParams(rest)
  const semuaParam = endpoint.params || []
  let kurang = missingRequired(endpoint, params)

  if (free) {
    if (kurang.length) {
      // teks bebas mengisi parameter wajib pertama: ".iqc hai" = text=hai
      params[kurang[0].name] = free
      kurang = missingRequired(endpoint, params)
    } else {
      // tidak ada yang wajib: taruh di kolom teks yang paling mungkin
      // (sesuai urutan dokumentasi endpoint). Kalau kolom teksnya sudah terisi
      // eksplisit (mis. ".iqc text=halo dek" → sisanya "dek"), sisanya
      // digabung ke kolom itu — bukan dibuang.
      const kolom =
        semuaParam.find(
          (p) => TEXT_PARAMS.has(String(p.name).toLowerCase()) && params[p.name] === undefined,
        ) || semuaParam.find((p) => TEXT_PARAMS.has(String(p.name).toLowerCase()))
      if (kolom) {
        params[kolom.name] =
          params[kolom.name] === undefined ? free : `${params[kolom.name]} ${free}`.trim()
      } else if (semuaParam.length) {
        // endpoint ini cuma menerima pilihan bernama (mis. sumber=, limit=).
        // Lebih baik diberi tahu daripada teksnya dibuang tanpa kabar.
        await m.reply(
          [
            `⚠️ *${endpoint.name}* tidak menerima teks bebas.`,
            `Pilihan: ${[...new Set(semuaParam.map((p) => p.name))].join(', ')}`,
            `Contoh: ${exampleCommand(endpoint, prefix, command, 'af')}`,
          ].join('\n'),
        )
        return
      }
    }
  }

  if (kurang.length) {
    await m.reply(
      [
        `⚠️ *${endpoint.name}* butuh parameter:`,
        ...kurang.map((p) => `▸ ${p.name}${p.description ? ` — ${p.description}` : ''}`),
        `Contoh: ${exampleCommand(endpoint, prefix, command, 'af')}`,
      ].join('\n'),
    )
    return
  }

  return execute(m, conn, endpoint, params, prefix, command || commandFor(endpoint)?.command || '')
}

/* ── menu & status ───────────────────────────────────────────────────────── */

export function ringkasan() {
  const meta = loadCatalog().meta || {}
  return {
    total: meta.total || loadCatalog().endpoints.length,
    penyedia: meta.penyedia || {},
    kategori: meta.kategori || {},
  }
}

export function statusPenyedia() {
  return penyediaList().map((p) => ({
    ...p,
    kunci: getKey(p.provider),
    contoh: loadCatalog().endpoints.find((e) => e.provider === p.provider)?.path || '',
  }))
}

export { commandFor, loadCatalog, penyediaList, findEndpoint, maskKey }

export default {
  getConfig,
  setConfig,
  guardAkses,
  rateLimit,
  cut,
  errorText,
  kirimHasil,
  execute,
  runEndpoint,
  ringkasan,
  statusPenyedia,
}
