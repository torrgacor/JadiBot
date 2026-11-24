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

/* Akinator — tebak karakter/hewan/benda lewat tanya-jawab.
   Logika game dari plugin IzzXd (id.akinator.com), diadaptasi ke engine Nano:
   HTTP via got-scraping (Cloudflare menolak TLS fingerprint axios/Node),
   cookie disimpan manual per sesi, kirim pesan lewat rawConn,
   quoted memakai m.raw sesuai konvensi plugin lain. */

import { gotScraping } from 'got-scraping'
import * as cheerio from 'cheerio'

const BASE = 'https://id.akinator.com'
const TIMEOUT = 25_000

const THEMES = {
  1: ['Karakter', 1],
  2: ['Hewan', 14],
  3: ['Benda', 2],
}

const CHOICES = [
  ['1', 'Ya', 0],
  ['2', 'Tidak', 1],
  ['3', 'Tidak tahu', 2],
  ['4', 'Mungkin', 3],
  ['5', 'Mungkin tidak', 4],
]

/* =========================================================
 * SESSION — per user, per proses bot (RAM). TTL 15 menit.
 * ========================================================= */
const SESI = new Map()
const TTL_SESI = 15 * 60 * 1000

function ambilSesi(jid) {
  const game = SESI.get(jid)
  if (!game) return null
  if (Date.now() - game.dibuat > TTL_SESI) {
    SESI.delete(jid)
    return null
  }
  return game
}

function akhiriSesi(jid) {
  SESI.delete(jid)
}

/* =========================================================
 * HTTP — got-scraping (fingerprint TLS ala Chrome).
   Cloudflare di akinator.com menolak TLS fingerprint Node/axios
   (403 "Just a moment…") apa pun kombinasi header-nya, jadi semua
   request di sini memakai got-scraping: impersonasi TLS Chrome +
   header generator (sec-ch-ua, sec-fetch, dst) otomatis.
   Cookie disimpan manual per sesi game di `game.cookie`.
 * ========================================================= */

function headers(game) {
  const h = {
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    origin: BASE,
    referer: BASE + '/game',
  }
  if (game.cookie) h.cookie = game.cookie
  return h
}

function simpanCookie(game, res) {
  try {
    const mentah = res?.headers?.['set-cookie']
    const setCookies = Array.isArray(mentah) ? mentah : mentah ? [mentah] : []
    if (!setCookies.length) return
    const jar = new Map()
    for (const pair of String(game.cookie || '').split(';')) {
      const i = pair.indexOf('=')
      if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim())
    }
    for (const raw of setCookies) {
      const pair = String(raw).split(';')[0]
      const i = pair.indexOf('=')
      if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim())
    }
    game.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
  } catch {}
}

/* respons disamakan bentuk axios lama: { status, data, headers } */
async function kirim(game, path, form) {
  const res = await gotScraping({
    url: BASE + path,
    method: form ? 'POST' : 'GET',
    ...(form ? { body: new URLSearchParams(form).toString() } : {}),
    headers: form
      ? headers(game)
      : game.cookie
        ? { cookie: game.cookie }
        : {},
    throwHttpErrors: false,
    timeout: { request: TIMEOUT },
  })
  simpanCookie(game, res)
  return { status: res.statusCode, data: String(res.body ?? ''), headers: res.headers }
}

async function post(game, path, form) {
  return kirim(game, path, form)
}

function cekBlokir(body) {
  return /just a moment|cf-browser-verification|enable javascript and cookies|checking your browser/i.test(
    String(body || ''),
  )
}

function parseJSON(body) {
  try {
    return JSON.parse(body)
  } catch {
    if (cekBlokir(body)) {
      throw new Error('Akinator sedang diblokir Cloudflare dari server. Coba lagi beberapa saat lagi.')
    }
    throw new Error('Response Akinator bukan JSON.')
  }
}

/* =========================================================
 * LOGIKA GAME
 * ========================================================= */
async function mulai(game) {
  /* Kunjungi home dulu seperti plugin asli — ambil cookie sesi sebelum /game. */
  try {
    const home = await kirim(game, '/')
    if (home.status !== 200) throw new Error(`HTTP ${home.status}`)
  } catch {}

  const res = await post(game, '/game', { sid: String(game.sid), cm: 'false' })
  const body = res.data || ''
  const $ = cheerio.load(body)

  const session =
    body.match(/session:\s*'([^']+)'/)?.[1] ||
    body.match(/name="session"[^>]*value="([^"]+)"/)?.[1]
  const identifiant =
    body.match(/localStorage\.setItem\('identifiant',\s*'([^']+)'\)/)?.[1] ||
    body.match(/name="identifiant"[^>]*value="([^"]+)"/)?.[1] ||
    ''
  const question = $('#question-label').text().trim()

  if (!session || !question) {
    if (res.status !== 200 || cekBlokir(body)) {
      throw new Error('Akinator sedang memblokir server (Cloudflare). Coba lagi nanti.')
    }
    throw new Error('Gagal mengambil data dari Akinator.')
  }

  game.session = session
  game.identifiant = identifiant
  game.question = question
  game.step = parseInt(body.match(/localStorage\.setItem\('step',\s*'(\d+)'\)/)?.[1] || '1')
  game.num = 1
  game.progression = 0
  game.stepLastProposition = ''
}

function terapkan(game, data) {
  if (data.completion === 'KO') throw new Error('Sesi expired.')
  if (data.completion === 'SOUNDLIKE') return { kalah: true }

  if (data.id_proposition) {
    game.step = parseInt(data.step ?? game.step)
    game.stepLastProposition = String(game.step)
    return {
      tebakan: {
        id: data.id_proposition,
        id_base: data.id_base_proposition,
        name: data.name_proposition,
        description: data.description_proposition,
        photo: data.photo,
      },
    }
  }

  if (data.question) game.question = data.question
  if (data.step !== undefined) game.step = parseInt(data.step)
  if (data.progression !== undefined) game.progression = parseFloat(data.progression)

  return {}
}

async function jawab(game, id) {
  const res = await post(game, '/answer', {
    step: String(game.step),
    progression: String(game.progression),
    sid: String(game.sid),
    cm: 'false',
    answer: String(id),
    step_last_proposition: game.stepLastProposition,
    session: game.session,
  })
  const hasil = terapkan(game, parseJSON(res.data))
  if (!hasil.tebakan && !hasil.kalah) game.num++
  return hasil
}

async function mundur(game) {
  const res = await post(game, '/cancel_answer', {
    step: String(game.step),
    progression: String(game.progression),
    sid: String(game.sid),
    cm: 'false',
    session: game.session,
  })
  terapkan(game, parseJSON(res.data))
  game.num = Math.max(1, game.num - 1)
}

async function exclude(game) {
  const res = await post(game, '/exclude', {
    step: String(game.step),
    sid: String(game.sid),
    cm: 'false',
    progression: String(game.progression),
    session: game.session,
    forward_answer: '1',
  })
  const hasil = terapkan(game, parseJSON(res.data))
  if (!hasil.tebakan && !hasil.kalah) game.num++
  return hasil
}

async function konfirmasi(game, tebakan) {
  try {
    await post(game, '/choice', {
      sid: String(game.sid),
      pid: String(tebakan.id),
      identifiant: game.identifiant,
      charac_name: tebakan.name,
      charac_desc: tebakan.description,
      session: game.session,
      step: String(game.step),
    })
  } catch {}
}

/* =========================================================
 * UI
 * ========================================================= */
const GARIS = '╰──────────────'

async function kirimTema(m, rawConn) {
  return m.reply(
    [
      '╭─「 🎭 AKINATOR 」',
      '│',
      '│ Pilih tema permainan:',
      '│ 1. Karakter',
      '│ 2. Hewan',
      '│ 3. Benda',
      '│',
      '│ Balas dengan angka *1*, *2*, atau *3*',
      '│ Ketik *.akinator stop* untuk batal.',
      GARIS,
    ].join('\n'),
    { quoted: m.raw }
  )
}

async function kirimPertanyaan(m, game) {
  game.state = 'question'
  return m.reply(
    [
      '╭─「 🧠 AKINATOR 」',
      '│',
      `│ 🎭 Tema: *${game.theme}*`,
      `│ 📊 Progress: *${Math.round(game.progression)}%*`,
      `│ ❓ Pertanyaan: *${game.num}*`,
      '│',
      `│ ${game.question}`,
      '│',
      '│ 1. Ya',
      '│ 2. Tidak',
      '│ 3. Tidak tahu',
      '│ 4. Mungkin',
      '│ 5. Mungkin tidak',
      '│',
      '│ 0. Kembali ke sebelumnya',
      GARIS,
    ].join('\n'),
    { quoted: m.raw }
  )
}

async function kirimHasil(m, game, hasil, rawConn) {
  if (hasil.kalah) {
    akhiriSesi(m.sender)
    return m.reply('😵 Akinator menyerah! Aku tidak bisa menebak jawabanmu.', { quoted: m.raw })
  }

  if (hasil.tebakan) {
    game.tebakan = hasil.tebakan
    game.state = 'confirm'

    const teks =
      '╭─「 🎯 TEBAKAN AKINATOR 」\n' +
      '│\n' +
      `│ 👤 *${hasil.tebakan.name}*\n` +
      `│ 📝 ${hasil.tebakan.description || '-'}\n` +
      '│\n' +
      '│ Apakah tebakan ini benar?\n' +
      '│ Balas dengan *1* (Ya) atau *2* (Tidak)\n' +
      GARIS

    if (hasil.tebakan.photo) {
      return rawConn.sendMessage(m.chat, { image: { url: hasil.tebakan.photo }, caption: teks }, { quoted: m.raw }).catch(() =>
        m.reply(teks, { quoted: m.raw })
      )
    }
    return m.reply(teks, { quoted: m.raw })
  }

  return kirimPertanyaan(m, game)
}

async function mulaiGame(m, rawConn) {
  const game = SESI.get(m.sender)
  try {
    await m.reply(`⏳ Memulai Akinator...\n🎭 Tema: *${game.theme}*`, { quoted: m.raw })
    await mulai(game)
    await kirimPertanyaan(m, game)
  } catch (e) {
    akhiriSesi(m.sender)
    await m.reply(`❌ Gagal memulai Akinator:\n${e.message}`, { quoted: m.raw })
  }
}

/* =========================================================
 * PROSES JAWABAN — dipakai handler utama & interceptor
 * Mengembalikan true bila input dikonsumsi oleh sesi game.
 * ========================================================= */
async function prosesJawaban(m, game, rawConn) {
  const input = String(m.text || '').trim().toLowerCase()
  const sender = m.sender

  if (game.state === 'theme') {
    if (!THEMES[input]) {
      await m.reply('⚠️ Pilih temanya dengan angka *1*, *2*, atau *3*.\nKetik *.akinator stop* untuk batal.', { quoted: m.raw })
      return true
    }
    game.sid = THEMES[input][1]
    game.theme = THEMES[input][0]
    await mulaiGame(m, rawConn)
    return true
  }

  if (game.state === 'question') {
    if (input === '0') {
      if (game.num <= 1) {
        await m.reply('⚠️ Belum ada pertanyaan sebelumnya.', { quoted: m.raw })
        return true
      }
      try {
        await mundur(game)
        await kirimPertanyaan(m, game)
      } catch (e) {
        await m.reply(`❌ Gagal kembali: ${e.message}`, { quoted: m.raw })
      }
      return true
    }

    const pick = CHOICES.find((choice) => choice[0] === input)
    if (!pick) return false

    try {
      const hasil = await jawab(game, pick[2])
      await kirimHasil(m, game, hasil, rawConn)
    } catch (e) {
      akhiriSesi(sender)
      await m.reply(`❌ Terjadi kesalahan: ${e.message}`, { quoted: m.raw })
    }
    return true
  }

  if (game.state === 'confirm') {
    if (!['1', '2', 'y', 'n', 'ya', 'tidak'].includes(input)) return false

    const ya = ['1', 'y', 'ya'].includes(input)

    if (ya) {
      await konfirmasi(game, game.tebakan)
      const hasil = game.tebakan
      const totalNum = game.num
      akhiriSesi(sender)

      const teks =
        '╭─「 🎯 HASIL AKINATOR 」\n' +
        '│\n' +
        `│ 👤 *${hasil.name}*\n` +
        `│ 📝 ${hasil.description || '-'}\n` +
        '│\n' +
        `│ ❓ Pertanyaan total: ${totalNum}\n` +
        GARIS

      if (hasil.photo) {
        await rawConn.sendMessage(m.chat, { image: { url: hasil.photo }, caption: teks }, { quoted: m.raw }).catch(() =>
          m.reply(teks, { quoted: m.raw })
        )
      } else {
        await m.reply(teks, { quoted: m.raw })
      }
      return true
    }

    try {
      await m.reply('❌ Bukan itu?\n🧠 Oke, Akinator lanjut mencari tahu...', { quoted: m.raw })
      const hasil = await exclude(game)
      await kirimHasil(m, game, hasil, rawConn)
    } catch (e) {
      akhiriSesi(sender)
      await m.reply(`❌ Gagal melanjutkan: ${e.message}`, { quoted: m.raw })
    }
    return true
  }

  return false
}

/* =========================================================
 * MAIN HANDLER — .akinator
 * Juga menerima jawaban: .akinator 1-5 / .akinator stop /
 * .akinator 1-3 (tema). Jalan TANPA butuh interceptor.
 * ========================================================= */
let handler = async (m, { rawConn }) => {
  const input = String(m.text || '').trim().toLowerCase()

  if (input === 'stop') {
    if (SESI.has(m.sender)) {
      akhiriSesi(m.sender)
      return m.reply('✅ Game Akinator dihentikan.', { quoted: m.raw })
    }
    return m.reply('ℹ️ Tidak ada game Akinator yang sedang aktif.', { quoted: m.raw })
  }

  /* Sesi berjalan → input adalah jawaban (bukan tema baru). */
  const sesi = ambilSesi(m.sender)
  if (sesi) return prosesJawaban(m, sesi, rawConn)

  if (THEMES[input]) {
    SESI.set(m.sender, {
      sid: THEMES[input][1],
      theme: THEMES[input][0],
      session: '',
      identifiant: '',
      step: 1,
      num: 1,
      progression: 0,
      stepLastProposition: '',
      question: '',
      state: 'theme',
      tebakan: null,
      cookie: '',
      dibuat: Date.now(),
    })
    return mulaiGame(m, rawConn)
  }

  SESI.set(m.sender, { state: 'theme', dibuat: Date.now(), cookie: '' })
  return kirimTema(m, rawConn)
}

/* =========================================================
 * INTERCEPTOR — jawaban angka 1-5 TANPA prefix (handler.before).
 * Aktif setelah router mendukung `before`; sementara itu jawaban
 * tetap bisa lewat `.akinator <jawaban>` di handler utama.
 * ========================================================= */
handler.before = async function (conn, raw, { chat, sender }) {
  const game = ambilSesi(sender)
  if (!game) return false

  const input = extractTextPesan(raw.message).trim().toLowerCase()
  if (!input) return false

  /* Interceptor berjalan untuk SEMUA pesan user selama sesi aktif —
     jangan telan pesan yang bukan jawaban game. */
  if (game.state === 'theme' && !THEMES[input]) return false
  if (game.state === 'question' && input !== '0' && !CHOICES.some((c) => c[0] === input)) return false
  if (game.state === 'confirm' && !['1', '2', 'y', 'n', 'ya', 'tidak'].includes(input)) return false

  const m = {
    key: raw.key,
    chat,
    sender,
    raw,
    text: input,
  }

  m.reply = async (text, options = {}) => {
    const { sendStyledReply } = await import('../../lib/reply-style.js')
    const quoted = Object.prototype.hasOwnProperty.call(options, 'quoted') ? options.quoted : raw
    return sendStyledReply(conn, chat, text, {
      ...options,
      originalMessage: quoted === false ? null : quoted,
      mentions: options?.mentions || [],
    })
  }

  return prosesJawaban(m, game, conn)
}

/* Duplikat ringan extractText dari router — interceptor berjalan sebelum
   router mengekstrak teks, jadi dia harus mengekstrak sendiri. */
function extractTextPesan(message) {
  let current = message || {}
  for (let i = 0; i < 6; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return (
    current?.conversation ||
    current?.extendedTextMessage?.text ||
    current?.imageMessage?.caption ||
    current?.videoMessage?.caption ||
    ''
  )
}

handler.help = ['akinator', 'akinator stop']
handler.tags = ['game']
handler.command = /^akinator$/i
handler.limit = true
handler.description = 'Game Akinator — tebak karakter/hewan/benda lewat tanya-jawab, 3 tema, bisa mundur. Jawab dengan .akinator 1-5 (atau angka saja)'

export default handler
