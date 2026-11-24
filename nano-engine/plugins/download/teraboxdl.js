/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █    
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━
┇
┇▫️Author  : Danz nano & Awang Ofc 
┇▫️Website  : awangofc.my.id
┇▫️WhatsApp : wa.me/556184127506
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
┇
┇🔸Dilarang Menghapus Creadit SC
┇🔸Dilarang Menjual Script Nano Ai
┇🔸Dilarang Mengatas Namakan Script!!
⌬
*/

/* TeraBox (1024tera / terabox / teraboxapp) lewat Teraplayer.
   Endpointnya cuma mengembalikan PRATINJAU: judul, ukuran, resolusi, durasi,
   plus daftar `files`. Tautan yang tersedia berupa `stream_url` HLS (.m3u8),
   jadi berkasnya digabung sendiri di server bot: HLS (.m3u8) di-remux ke mp4
   pakai ffmpeg, lalu dikirim sebagai dokumen. */

import axios from 'axios'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import { getFfmpegBinPath } from '../../lib/ytdlp.js'
import { BATAS_KIRIM } from '../../lib/haidar.js'
import { fetchToFile } from '../../lib/http.js'

const ENDPOINT = 'https://teraplayer-backend-temp.onrender.com/api/preview'
const SITUS = 'https://www.teraplayer.in'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
const TIMEOUT = 60000
/* cukup 5 berkas per balasan: satu tautan HLS bisa >1.000 karakter, jadi
   daftar yang panjang membuat pesannya tidak terbaca. Sisanya lewat nomor. */
const MAKS_TAMPIL = 5
/* Di atas ini unduhannya lama, jadi pengguna diberi kabar dulu. */
const BATAS_KABARI_UNDUH = 20 * 1024 * 1024
/* Batas waktu ffmpeg menarik seluruh segmen HLS. */
const TIMEOUT_UNDUH = 900000

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

const toMb = (byte) => `${(Number(byte) / 1024 / 1024).toFixed(1)} MB`

function namaAman(nama) {
  const dasar = String(nama || 'terabox')
    .replace(/\.[a-z0-9]{2,4}$/i, '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)

  return `${dasar || 'terabox'}.mp4`
}

/*
  Jalankan ffmpeg sampai selesai. Dipakai untuk menggabungkan segmen HLS jadi
  satu mp4 tanpa proses ulang (remux, bukan encode).
*/
function jalankanFfmpeg(args, timeoutMs = TIMEOUT_UNDUH) {
  return new Promise((resolve, reject) => {
    const anak = spawn(args[0], args.slice(1), { stdio: ['ignore', 'ignore', 'pipe'] })
    let pesan = ''
    let selesai = false

    const timer = setTimeout(() => {
      if (selesai) return
      selesai = true
      anak.kill('SIGKILL')
      reject(new Error('Penggabungan berkas melebihi batas waktu.'))
    }, timeoutMs)

    anak.stderr?.on('data', (potongan) => {
      pesan = (pesan + potongan.toString()).slice(-2000)
    })
    anak.on('error', (error) => {
      if (selesai) return
      selesai = true
      clearTimeout(timer)
      reject(error)
    })
    anak.on('close', (kode) => {
      if (selesai) return
      selesai = true
      clearTimeout(timer)
      if (kode === 0) resolve(pesan)
      else reject(new Error(pesan.trim().split('\n').slice(-3).join(' ') || `ffmpeg keluar dengan kode ${kode}`))
    })
  })
}

function tempPath(ext) {
  return path.join(os.tmpdir(), `nano-teraboxdl-${Date.now()}-${crypto.randomBytes(5).toString('hex')}.${ext}`)
}

function toobig(bytes, batas) {
  const error = new Error(`Ukuran berkas ${toMb(bytes)} melebihi batas ${toMb(batas)}.`)
  error.code = 'toobig'
  error.bytes = bytes
  return error
}

/*
  Ambil daftar segmen dari playlist HLS.

  TeraBox lewat Teraplayer mengirim daftar putar biasa (bukan master). Untuk
  daftar putar master, varian bitrate tertinggi yang dipakai — plus trek audio
  terpisah kalau penyedianya memisahkannya, supaya videonya tidak bisu.
*/
export async function daftarSegmen(streamUrl, { timeoutMs = 60000, depth = 0 } = {}) {
  const res = await fetch(streamUrl, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(timeoutMs)
  })
  if (!res.ok) throw new Error(`Daftar putar tidak terbaca (HTTP ${res.status}).`)

  const teks = await res.text()
  const baris = teks.split('\n').map((b) => b.trim()).filter(Boolean)
  const absolut = (nilai) => {
    try {
      return new URL(nilai, streamUrl).href
    } catch {
      return null
    }
  }

  const varian = baris
    .map((b, i) => (b.startsWith('#EXT-X-STREAM-INF') ? { bw: Number((b.match(/BANDWIDTH=(\d+)/) || [])[1]) || 0, uri: baris[i + 1] } : null))
    .filter((v) => v && v.uri && !v.uri.startsWith('#'))

  if (varian.length && depth < 2) {
    const terbaik = varian.sort((a, b) => b.bw - a.bw)[0]
    const hasil = await daftarSegmen(absolut(terbaik.uri), { timeoutMs, depth: depth + 1 })

    const audio = baris.find((b) => b.startsWith('#EXT-X-MEDIA') && /TYPE=AUDIO/i.test(b) && /URI="/.test(b))
    const uriAudio = audio && (audio.match(/URI="([^"]+)"/) || [])[1]
    if (uriAudio) hasil.audio = await daftarSegmen(absolut(uriAudio), { timeoutMs, depth: depth + 1 })

    return hasil
  }

  const init = (baris.find((b) => b.startsWith('#EXT-X-MAP'))?.match(/URI="([^"]+)"/) || [])[1]

  return {
    segmen: baris.filter((b) => !b.startsWith('#')).map(absolut).filter(Boolean),
    init: init ? absolut(init) : null,
    audio: null
  }
}

async function ambilSegmen(url, timeoutMs) {
  let terakhir = null
  for (let percobaan = 0; percobaan < 2; percobaan++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(timeoutMs)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (error) {
      terakhir = error
    }
  }
  throw new Error(`Segmen gagal diunduh (${terakhir?.message || 'tidak diketahui'}).`)
}

/*
  Unduh seluruh segmen ke satu berkas, berurutan.

  Digabung dengan cara ditulis apa adanya (MPEG-TS memang dirancang untuk itu),
  bukan lewat ffmpeg: ffmpeg bawaan di server ini segfault saat membaca HLS
  di jaringan, jadi ffmpeg hanya dipakai untuk berkas yang sudah lokal.
*/
async function tulisSegmen(daftar, tujuan, { batas, timeoutMs, maksSegmen = 0, onBytes }) {
  const keluar = createWriteStream(tujuan)
  const semua = [...(daftar.init ? [daftar.init] : []), ...(maksSegmen > 0 ? daftar.segmen.slice(0, maksSegmen) : daftar.segmen)]
  let total = 0

  try {
    /* Jendela kecil supaya tetap cepat tapi memori tidak menumpuk. */
    const JENDELA = 4
    for (let i = 0; i < semua.length; i += JENDELA) {
      const potongan = await Promise.all(semua.slice(i, i + JENDELA).map((url) => ambilSegmen(url, timeoutMs)))

      for (const buffer of potongan) {
        total += buffer.length
        if (total > batas) throw toobig(total, batas)
        if (!keluar.write(buffer)) await once(keluar, 'drain')
      }

      onBytes?.(total)
    }
  } finally {
    await new Promise((selesai) => keluar.end(selesai))
  }

  return total
}

/*
  Unduh satu berkas TeraBox jadi satu mp4.

  Penyedianya tidak pernah mengisi `download_url`, jadi satu-satunya jalan
  adalah menggabungkan segmen HLS sendiri lalu me-remux hasilnya secara lokal.

  Pemanggil WAJIB menghapus `file` setelah dipakai.
*/
export async function unduhBerkas(berkas, { batas = BATAS_KIRIM, timeoutMs = TIMEOUT_UNDUH, maksSegmen = 0, onBytes } = {}) {
  const url = berkas?.stream_url || berkas?.download_url || berkas?.url
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    throw new Error('Tautan berkas tidak tersedia dari penyedia.')
  }

  /* Ukuran di katalog penyedia itu ukuran berkas ASLINYA, sedangkan tautan HLS
     yang mereka layani justru versi terkompresi (contoh nyata: berkas 1080p
     268 MB → stream 480p 32 MB). Jadi batas kirimnya dijaga pada jumlah byte
     yang benar-benar ditarik, bukan pada angka katalog itu. */

  /* Bukan daftar putar berarti tautan berkas langsung — cukup diunduh apa
     adanya, tanpa perlu digabung. */
  if (!/\.m3u8|m3u8_stream|\/hls\//i.test(url)) {
    const hasil = await fetchToFile(url, { maxBytes: batas, timeout: timeoutMs, prefix: 'nano-teraboxdl' })
    return { file: hasil.file, bytes: hasil.bytes }
  }

  const mentah = tempPath('ts')
  let audio = null
  try {
    const daftar = await daftarSegmen(url, { timeoutMs: Math.min(timeoutMs, 60000) })
    if (!daftar.segmen.length) throw new Error('Daftar putar tidak memuat segmen.')

    const bytes = await tulisSegmen(daftar, mentah, { batas, timeoutMs, maksSegmen, onBytes })
    if (!bytes) throw new Error('Berkas hasil kosong.')

    const kepala = await bacaKepala(mentah)

    /* fMP4 hasil gabungan sudah berbentuk mp4 — tidak perlu di-remux. */
    if (kepala.subarray(4, 8).toString('latin1') === 'ftyp') {
      const final = tempPath('mp4')
      await fs.move(mentah, final, { overwrite: true })
      return { file: final, bytes }
    }

    if (daftar.audio?.segmen?.length) {
      audio = tempPath('ts')
      await tulisSegmen(daftar.audio, audio, { batas, timeoutMs, maksSegmen })
    }

    const final = tempPath('mp4')
    const ffmpeg = (await getFfmpegBinPath()) || 'ffmpeg'
    const sumber = audio ? ['-i', mentah, '-i', audio, '-map', '0:v:0', '-map', '1:a:0'] : ['-i', mentah]

    try {
      await jalankanFfmpeg([ffmpeg, '-y', '-hide_banner', '-loglevel', 'error', ...sumber, '-c', 'copy', final], timeoutMs)
    } catch {
      /* Sebagian berkas tidak bisa disalin apa adanya (audio bukan AAC). */
      await fs.remove(final).catch(() => {})
      await jalankanFfmpeg([ffmpeg, '-y', '-hide_banner', '-loglevel', 'error', ...sumber, '-c:v', 'copy', '-c:a', 'aac', final], timeoutMs)
    }

    const { size } = await fs.stat(final)
    if (!size) throw new Error('Berkas hasil kosong.')
    if (size > batas) {
      await fs.remove(final).catch(() => {})
      throw toobig(size, batas)
    }

    return { file: final, bytes: size }
  } finally {
    await fs.remove(mentah).catch(() => {})
    if (audio) await fs.remove(audio).catch(() => {})
  }
}

async function bacaKepala(berkas) {
  try {
    const handle = await fs.open(berkas, 'r')
    try {
      const head = Buffer.alloc(16)
      const { bytesRead } = await handle.read(head, 0, head.length, 0)
      return head.subarray(0, bytesRead)
    } finally {
      await handle.close()
    }
  } catch {
    return Buffer.alloc(0)
  }
}

async function ambilPreview(url, password = '') {
  const { data } = await axios.post(ENDPOINT, { url, password }, {
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': UA,
      'origin': SITUS,
      'referer': `${SITUS}/`
    }
  })

  return data
}

function formatDurasi(detik) {
  const nilai = Number(detik)
  if (!Number.isFinite(nilai) || nilai <= 0) return null

  const jam = Math.floor(nilai / 3600)
  const menit = Math.floor((nilai % 3600) / 60)
  const sisa = Math.floor(nilai % 60)

  return jam ? `${jam}j ${menit}m` : `${menit}m ${sisa}d`
}

function formatUkuran(byte) {
  const nilai = Number(byte)
  if (!Number.isFinite(nilai) || nilai <= 0) return null

  const satuan = ['B', 'KB', 'MB', 'GB', 'TB']
  let angka = nilai
  let i = 0
  while (angka >= 1024 && i < satuan.length - 1) {
    angka /= 1024
    i++
  }

  return `${angka.toFixed(i === 0 ? 0 : 2)} ${satuan[i]}`
}

function rincian(berkas) {
  const bagian = []
  const ukuran = berkas?.size_str || formatUkuran(berkas?.size)
  const resolusi = berkas?.resolution ? String(berkas.resolution) : null
  const durasi = formatDurasi(berkas?.duration)

  if (ukuran) bagian.push(ukuran)
  if (resolusi) bagian.push(resolusi)
  if (durasi) bagian.push(durasi)
  if (berkas?.file_type && berkas.file_type !== 'video') bagian.push(String(berkas.file_type))

  return bagian.join(' · ')
}

function tautan(berkas) {
  const kandidat = [berkas?.download_url, berkas?.stream_url, berkas?.url]
  return kandidat.find((nilai) => typeof nilai === 'string' && /^https?:\/\//i.test(nilai)) || null
}

function kepala(data, files) {
  const baris = ['📦 *TERABOX DOWNLOADER*', '']

  if (files.length === 1) {
    baris.push(`🎬 *${data.title || files[0]?.name || 'Tanpa judul'}*`)
    baris.push('')
    const info = rincian(files[0])
    if (info) baris.push(`ℹ️ ${info}`)
  } else {
    baris.push(`🗂️ Terdeteksi : ${files.length} berkas`)
    const total = data.size_str || formatUkuran(data.size)
    if (total) baris.push(`💾 Berkas teratas : ${total}`)
    if (data.resolution) baris.push(`🎞️ Kualitas teratas : ${data.resolution}`)
  }

  if (data.source) baris.push(`🏷️ Sumber : ${data.source}`)

  return baris.join('\n')
}

/*
  Caption yang menemani berkasnya: nama, ukuran berkas yang BENAR-BENAR dikirim,
  lalu durasinya. Ukuran dari katalog penyedia tidak dipakai — itu ukuran berkas
  aslinya, bukan stream yang mereka layani.
*/
function captionBerkas(berkas, bytes) {
  const baris = []
  if (berkas?.name) baris.push(`📁 *${berkas.name}*`)

  const bagian = [formatUkuran(bytes) || toMb(bytes)]
  const durasi = formatDurasi(berkas?.duration)
  if (durasi) bagian.push(durasi)

  baris.push(`💾 ${bagian.filter(Boolean).join(' · ')}`)
  return baris.join('\n')
}

/*
  Unduh berkas lalu kirim sebagai dokumen. Di atas batas kirim WhatsApp,
  berkasnya tidak diunduh sama sekali — nama, ukuran, dan tautannya saja.
*/
async function kirimBerkas(conn, m, berkas) {
  const nama = berkas?.name || 'Tanpa nama'
  const perkiraan = Number(berkas?.size) || 0

  /* Berkas ratusan MB butuh puluhan detik. Ukurannya kabur (angka katalog =
     berkas asli, bukan stream-nya) jadi pengguna diberi kabar kalau memang
     besar saja. */
  if (perkiraan > BATAS_KABARI_UNDUH) {
    await conn.sendMessage(m.chat, {
      text: `⏳ *${nama}* sedang diunduh dan digabung — tunggu ya, jangan di-spam.`
    }, { quoted: m.raw })
  }

  let hasil = null
  try {
    hasil = await unduhBerkas(berkas)

    await conn.sendMessage(m.chat, {
      document: { url: hasil.file },
      mimetype: 'video/mp4',
      fileName: namaAman(berkas?.name),
      caption: captionBerkas(berkas, hasil.bytes)
    }, { quoted: m.raw })
  } catch (error) {
    console.error('[NANO TERABOXDL UNDUH]', error?.message || error)

    /* Kelewat besar: tetap kasih tautannya. Selain itu: katakan gagal. */
    const link = tautan(berkas)
    const sebab = error?.code === 'toobig'
      ? `Berkasnya ${toMb(error.bytes)} — terlalu besar untuk dikirim lewat WhatsApp (batas ${Math.round(BATAS_KIRIM / 1024 / 1024)} MB).`
      : `Gagal mengunduh berkasnya (${String(error?.message || error).slice(0, 120)}).`

    await conn.sendMessage(m.chat, {
      text: `⚠️ ${sebab}\n\n📁 *${nama}*\n🔗 ${link || 'tautan tidak tersedia'}`
    }, { quoted: m.raw })
  } finally {
    if (hasil?.file) await fs.remove(hasil.file).catch(() => {})
  }
}

function daftarBerkas(files, mulai, jumlah) {
  return files
    .slice(mulai, mulai + jumlah)
    .map((berkas, i) => {
      const baris = [`${mulai + i + 1}. ${berkas?.name || 'Tanpa nama'}`]
      const info = rincian(berkas)
      if (info) baris.push(`   ${info}`)
      const link = tautan(berkas)
      if (link) baris.push(`   🔗 ${link}`)
      return baris.join('\n')
    })
    .join('\n\n')
}

/* Tautan share TeraBox selalu membawa token (…?surl=xxxx atau …/s/xxxx). */
function bawaTokenShare(url) {
  return /(?:[?&])surl=[^&\s]+/i.test(url) || /\/s\/[A-Za-z0-9_-]{4,}/.test(url)
}

/* null = balasan sehat. Toleran: sebagian balasan tidak menulis `ok`
   walau datanya lengkap. */
function cekGagal(data) {
  if (data?.password_required || data?.password_incorrect) return { butuhPassword: true }

  const adaData = data?.ok === true
    || Boolean(data?.title)
    || (Array.isArray(data?.files) && data.files.length > 0)
  if (adaData && data?.ok !== false) return null

  const alasan = data?.error || data?.message || 'Tidak ada keterangan dari API.'
  return { butuhPassword: false, teks: `❌ Gagal mengambil data TeraBox.\n\n${alasan}` }
}

const handler = async (m, { conn, usedPrefix }) => {
  const args = [...(m.args || [])]
  const url = args.find((bagian) => /^https?:\/\//i.test(String(bagian)))
  const token = args.filter((bagian) => bagian !== url).join(' ').trim()
  const prefix = usedPrefix || '.'

  if (!url) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, {
      text: `❌ Masukkan link TeraBox!\n\nContoh:\n${prefix}teraboxdl https://www.1024tera.com/sharing/link?surl=xxxxx`
    }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  try {
    /* Angka 1–3 digit = nomor berkas, sisanya = password. */
    let password = /^\d{1,3}$/.test(token) ? '' : token
    let data = await ambilPreview(url, password)

    /* tautan berpassword: coba sekali lagi memakai token yang dikirim user */
    if ((data?.password_required || data?.password_incorrect) && !password && token) {
      data = await ambilPreview(url, token)
      password = token
    }

    const gagal = cekGagal(data)
    if (gagal?.butuhPassword) {
      /* Penyedia menjawab tautan rusak dengan "butuh password" juga. Bedakan:
         tautan yang tidak membawa token share memang tidak bisa dibaca, dan
         password yang sudah dicoba tapi tetap ditolak berarti salah. */
      const bukanTautanShare = !bawaTokenShare(url)
      if (bukanTautanShare || password) {
        m.limit?.fail()
        await react(conn, m, '❌')
        return conn.sendMessage(m.chat, {
          text: bukanTautanShare
            ? '❌ Tautan TeraBox-nya tidak terbaca.\n\nPastikan itu tautan share yang lengkap, mis. https://www.1024tera.com/sharing/link?surl=xxxxx'
            : '❌ Passwordnya salah, atau tautannya sudah tidak berlaku / berkasnya dihapus.'
        }, { quoted: m.raw })
      }

      m.limit?.fail()
      await react(conn, m, '🔒')
      return conn.sendMessage(m.chat, {
        text: `🔒 Link ini butuh password TeraBox.\n\nKirim ulang dengan passwordnya:\n${prefix}${m.command} ${url} <password>`
      }, { quoted: m.raw })
    }

    if (gagal) {
      m.limit?.fail()
      await react(conn, m, '❌')
      return conn.sendMessage(m.chat, { text: gagal.teks }, { quoted: m.raw })
    }

    const files = Array.isArray(data?.files) && data.files.length ? data.files : [data]
    const nomor = /^\d{1,3}$/.test(token) ? Number(token) : 0

    /* balasannya bisa ratusan KB, jadi yang dicatat cuma ringkasannya */
    console.log(`[NANO TERABOXDL] ${files.length} berkas · ${data.title || '-'} · sumber=${data.source || '-'}`)

    /* Satu berkas (atau nomor yang disebut) → berkasnya langsung dikirim.
       Folder berisi banyak berkas tetap dikirim sebagai daftar: mustahil
       menaruh ratusan video sekaligus di satu percakapan. */
    if (nomor || files.length === 1) {
      if (nomor && !files[nomor - 1]) {
        m.limit?.fail()
        await react(conn, m, '❌')
        return conn.sendMessage(m.chat, {
          text: `❌ Nomor ${nomor} tidak ada.\n\nLink ini punya ${files.length} berkas, jadi nomornya 1 sampai ${files.length}.`
        }, { quoted: m.raw })
      }

      await kirimBerkas(conn, m, files[nomor ? nomor - 1 : 0])
      await react(conn, m, '✅')
      m.limit?.success()
      return
    }

    const tampil = Math.min(MAKS_TAMPIL, files.length)
    const bagian = [kepala(data, files), `📂 *Daftar berkas* (1-${tampil} dari ${files.length})`, daftarBerkas(files, 0, tampil)]

    const catatan = ['┈┈┈┈┈┈┈┈┈┈', `ℹ️ _Kirim berkasnya: ${prefix}${m.command} <link> <nomor>_`]
    catatan.push('⚠️ _Tautan di atas berupa HLS (.m3u8) — buka pakai VLC atau pemutar HLS._')

    const teks = [...bagian, catatan.join('\n')].join('\n\n')

    await conn.sendMessage(m.chat, { text: teks }, { quoted: m.raw })
    await react(conn, m, '✅')
    m.limit?.success()
  } catch (error) {
    m.limit?.fail()
    await react(conn, m, '❌')

    const alasan = error?.code === 'ECONNABORTED'
      ? 'Server Teraplayer tidak merespons tepat waktu. Coba lagi sebentar.'
      : error?.response?.data?.error || error?.message || 'Kesalahan tidak dikenal.'

    console.error('[NANO TERABOXDL ERROR]', error?.message || error)

    await conn.sendMessage(m.chat, {
      text: `❌ Gagal mengambil data TeraBox.\n\n${alasan}`
    }, { quoted: m.raw })
  }
}

/* Helper murni ikut diekspor supaya bisa diuji tanpa WhatsApp. */
export { cekGagal, namaAman, captionBerkas, formatUkuran, formatDurasi }

handler.command = /^(teraboxdl|teradl|tbdl)$/i
handler.help = ['teraboxdl', 'teradl', 'tbdl']
handler.usage = ['teraboxdl <link terabox>']
handler.tags = ['download']
handler.description = 'Ambil data dan tautan berkas dari link TeraBox'
handler.limitCommit = 'manual'

export default handler
