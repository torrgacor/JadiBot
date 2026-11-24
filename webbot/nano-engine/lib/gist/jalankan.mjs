/*
⌬ Nano Ai · Gist Runner
  Menjalankan satu snippet gist (lib/gist/src/<slug>.js) sebagai proses Node
  terisolasi dengan input dari user WhatsApp, lalu menangkap hasilnya:
    - URL media/hasil dari stdout
    - file yang ditulis snippet (dipindah ke lib/gist/hasil/<slug>/)
  Snippet CJS murni → .cjs; ESM → .mjs (+shim require bila perlu); skrip pola
  CLI dengan top-level await → dicoba 2 format bila format pertama SyntaxError.
  Konstanta input (INPUT/TEXT/QUERY/URL/dst.) diganti dengan input user.

 Ekspor:
  jalankanSnippet(slug, { teks, file, timeoutMs }) →
    { ok, status, urls, files, stdout, catatan }
  bacaKode(slug) → kode asli (tanpa karakter tak terlihat)
*/

import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const DIR = path.dirname(fileURLToPath(import.meta.url))
export const SRC = path.join(DIR, 'src')
const WORK = path.join(DIR, 'tmp')
const HASIL = path.join(DIR, 'hasil')
const BIN = path.join(DIR, 'bin')

/*
  Shim binary eksternal: beberapa snippet panggil `ffmpeg` langsung lewat
  execFile('ffmpeg', ...). Kita sediakan folder bin berisi symlink ffmpeg dari
  @ffmpeg-installer supaya ditemukan lewat PATH.
*/
function pastikanBin() {
  try {
    fs.mkdirSync(BIN, { recursive: true })
    const ffmpegPath = require2('@ffmpeg-installer/ffmpeg').path
    const dest = path.join(BIN, 'ffmpeg')
    try { fs.accessSync(dest, fs.constants.X_OK) } catch {
      try { fs.unlinkSync(dest) } catch {}
      fs.symlinkSync(ffmpegPath, dest)
    }
    return BIN
  } catch {
    return ''
  }
}
import { createRequire as __req } from 'node:module'
const require2 = __req(import.meta.url)

const RE_FILE = /^const (INPUT_FILE_PATH|VIDEO_PATH|IMAGE_PATH|AUDIO_PATH|FILE_PATH)\s*=\s*(['"])[^'"]*\2/m
const RE_INPUT = /^const (INPUT)\s*=\s*(['"])([^'"]*)\2/m
const RE_TEKS = /^const (TEXT|PROMPT|TEKS|QUERY|QUERY_1|USERNAME|NICKNAME|URL|TARGET|LINK|q|txt|NAMA)\s*=\s*(['"`])[^'"`]*\2/m
const RE_MEDIA_URL = /https?:\/\/[^\s"'<>()\\]+\.(?:mp4|mp3|m4a|png|jpe?g|webp|gif|pdf|webm|wav)/i
const RE_URL = /https?:\/\/[^\s"'<>()\\]+/g

export function bacaKode(slug) {
  return fs.readFileSync(path.join(SRC, `${slug}.js`), 'utf8').replace(/[\uFEFF\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
}

export function daftarSlug() {
  return fs.readdirSync(SRC).filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''))
}

/* ganti konstanta input di kode dengan nilai user */
function substitusiInput(kode, { teks, file }) {
  let out = kode
  if (file) {
    if (RE_FILE.test(out)) out = out.replace(RE_FILE, (s, nama, q) => `const ${nama} = ${q}${file}${q}`)
    if (RE_INPUT.test(out)) out = out.replace(RE_INPUT, (s, nama, q) => `const ${nama} = ${q}${file}${q}`)
    // path /home/container inline (di call langsung)
    out = out.replace(/(['"])\/home\/container\/[^'"]*\.(png|jpe?g|webp|mp3|mp4)\1/gi, (s, q) => q + file + q)
    if (teks && RE_TEKS.test(out)) out = out.replace(RE_TEKS, (s, nama, q) => `const ${nama} = ${q}${teks}${q}`)
    return out
  }
  // teks saja
  if (RE_TEKS.test(out)) {
    out = out.replace(RE_TEKS, (s, nama, q) => `const ${nama} = ${q}${teks}${q}`)
  } else if (RE_INPUT.test(out)) {
    // INPUT bernilai teks (bukan path) → ganti dengan teks user
    const m = out.match(RE_INPUT)
    const nilai = m[3] || ''
    const terlihatPath = /[\\/]/.test(nilai) || /\.(png|jpe?g|webp|mp3|mp4|pdf)$/i.test(nilai)
    if (!terlihatPath) out = out.replace(RE_INPUT, (s, nama, q) => `const ${nama} = ${q}${teks}${q}`)
  }
  return out
}

function deteksiFormat(kode) {
  const pakaiEsm = /^\s*(import\s|export\s)/m.test(kode) || /\bawait\s+import\s*\(/.test(kode) || /^\s*await\b/m.test(kode)
  const pakaiRequire = /^\s*(?:const|let|var)\s[^=]*=\s*require\s*\(|^\s*require\s*\(/m.test(kode)
  const pakaiModuleExports = /\bmodule\.exports\b/.test(kode)
  return { pakaiEsm, pakaiRequire, pakaiModuleExports }
}

/* tulis snippet ke folder kerja sesuai format; kembalikan nama file */
function tulisSnippet(kode, folder) {
  const { pakaiEsm, pakaiRequire, pakaiModuleExports } = deteksiFormat(kode)
  if (pakaiEsm) {
    let prefix = ''
    if (pakaiRequire) {
      prefix =
        "import { createRequire as __createRequire } from 'node:module'\n" +
        "import { fileURLToPath as __f2p } from 'node:url'\n" +
        'const require = __createRequire(import.meta.url)\n' +
        'const __filename = __f2p(import.meta.url)\n' +
        "const __dirname = __f2p(new URL('.', import.meta.url))\n"
    }
    if (pakaiModuleExports) {
      // file campuran: izinkan module.exports di ESM
      prefix += "import { createRequire as __moduleRequire } from 'node:module'\n" +
        'const require2 = __moduleRequire(import.meta.url)\n' +
        'globalThis.module = { exports: {} }\n'
      const suffix = '\n;export default globalThis.module.exports'
      fs.writeFileSync(path.join(folder, 'snippet.mjs'), prefix + kode + suffix)
      return 'snippet.mjs'
    }
    fs.writeFileSync(path.join(folder, 'snippet.mjs'), prefix + kode)
    return 'snippet.mjs'
  }
  fs.writeFileSync(path.join(folder, 'snippet.cjs'), kode)
  return 'snippet.cjs'
}

/* cek hasil yang tertulis di folder kerja → pindah ke folder persisten */
function panenFile(kodeFinal, folder, slug) {
  const hasil = []
  const re = /writeFileSync\(\s*(?:path\.join\([^)]*,\s*)?['"]([^'"]+\.(?:png|jpe?g|webp|gif|mp4|mp3|wav|pdf|txt|zip|webm))['"]/g
  let m
  const tujuan = path.join(HASIL, slug)
  fs.mkdirSync(tujuan, { recursive: true })
  while ((m = re.exec(kodeFinal))) {
    const p = path.join(folder, m[1])
    if (fs.existsSync(p) && fs.statSync(p).size > 500) {
      const nama = `${slug}-${Date.now()}-${path.basename(m[1])}`
      const dest = path.join(tujuan, nama)
      try { fs.copyFileSync(p, dest); hasil.push(dest) } catch {}
    }
  }
  // fallback: file media APAPUN yang baru dibuat di folder kerja (rekursif, termasuk subfolder)
  if (!hasil.length) {
    const kunjung = (dir, kedalaman) => {
      if (kedalaman > 4) return
      let entri = []
      try { entri = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
      for (const e of entri) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) kunjung(p, kedalaman + 1)
        else if (/\.(png|jpe?g|webp|gif|mp4|mp3|wav|pdf|webm)$/i.test(e.name)) {
          try { if (fs.statSync(p).size > 500) hasil.push(p) } catch {}
        }
      }
    }
    kunjung(folder, 0)
    for (const p of hasil) {
      const dest = path.join(tujuan, `${slug}-${Date.now()}-${path.basename(p)}`)
      try { fs.copyFileSync(p, dest); hasil[hasil.indexOf(p)] = dest } catch {}
    }
  }
  return hasil
}

/* pilih URL dari stdout: media dulu, lalu URL non-dokumentasi */
function pilihUrls(stdout) {
  const semua = stdout.match(RE_URL) || []
  const bersih = semua.filter((u) =>
    !/npmjs\.com|nodejs\.org|github\.com|wikipedia\.org\/wiki|raw\.githubusercontent\.com|developers\.google|schema\.org|example\.com/.test(u)
  )
  const media = bersih.filter((u) => RE_MEDIA_URL.test(u))
  const lain = bersih.filter((u) => !RE_MEDIA_URL.test(u))
  const unik = (arr) => [...new Set(arr)]
  return { media: unik(media), lain: unik(lain) }
}

function jalankanProses(file, folder, timeoutMs, argumen = []) {
  return new Promise((resolve) => {
    const binShim = pastikanBin()
    const pathEnv = binShim ? `${binShim}:${process.env.PATH || ''}` : process.env.PATH
    const prog = spawn(process.execPath, [path.join(folder, file), ...argumen], {
      cwd: folder,
      timeout: timeoutMs,
      env: { ...process.env, NODE_NO_WARNINGS: '1', PATH: pathEnv },
    })
    let stdout = ''
    let stderr = ''
    prog.stdout.on('data', (d) => { stdout += d })
    prog.stderr.on('data', (d) => { stderr += d })
    prog.on('error', (e) => resolve({ code: -1, stdout, stderr: stderr + String(e) }))
    prog.on('close', (code) => resolve({ code, stdout, stderr }))
  })
}

export async function jalankanSnippet(slug, { teks = '', file = '', timeoutMs = 90_000 } = {}) {
  let kodeAsli
  try {
    kodeAsli = bacaKode(slug)
  } catch {
    return { ok: false, status: 'gagal', urls: [], files: [], stdout: '', catatan: `snippet ${slug} tidak ada` }
  }

  fs.mkdirSync(WORK, { recursive: true })
  const folder = fs.mkdtempSync(path.join(WORK, `run-${slug}-`))
  try {
    const kodeFinal = substitusiInput(kodeAsli, { teks, file })
    let namaFile = tulisSnippet(kodeFinal, folder)
    // snippet berbasis process.argv (tanpa konstanta teks) → lewat argumen CLI
    const substitusiTeks = teks && kodeFinal !== kodeAsli
    const pakaiArgv = teks && !substitusiTeks && /process\.argv/.test(kodeFinal)
    const argumen = pakaiArgv ? [teks] : []
    let { code, stdout, stderr } = await jalankanProses(namaFile, folder, timeoutMs, argumen)

    // SyntaxError format salah (mis. top-level await di .cjs) → coba format satunya
    if (code !== 0 && /SyntaxError/.test(stderr) && /await|import|export/.test(stderr + kodeFinal)) {
      const { pakaiEsm } = deteksiFormat(kodeFinal)
      const alternatif = pakaiEsm ? 'snippet.cjs' : 'snippet.mjs'
      try {
        fs.writeFileSync(path.join(folder, alternatif), kodeFinal)
        const ulang = await jalankanProses(alternatif, folder, timeoutMs, argumen)
        if (ulang.code === 0) { code = 0; stdout = ulang.stdout; stderr = '' }
      } catch {}
    }

    const { media, lain } = pilihUrls(stdout)
    const files = code === 0 ? panenFile(kodeFinal, folder, slug) : []
    const adaMedia = RE_MEDIA_URL.test(stdout)

    if (/["']?Status["']?\s*:\s*false/.test(stdout) && !adaMedia && !files.length) {
      const alasan =
        (stdout.match(/["']?(?:Error|error|Message|message)["']?\s*:\s*["']([^"']{0,150})["']/) || [])[1] ||
        (stdout.split('\n').find((l) => /gagal|error|not found|404|invalid|tidak/i.test(l)) || '').slice(0, 150)
      return { ok: false, status: 'butuh-input-asli', urls: [...media, ...lain.slice(0, 2)], files, stdout: stdout.slice(0, 4000), catatan: alasan || 'layanan menolak input' }
    }
    if (code === 0) {
      return { ok: true, status: 'ok', urls: [...media, ...lain.slice(0, 3)], files, stdout: stdout.slice(0, 4000), catatan: '' }
    }
    return { ok: false, status: code === null ? 'timeout' : 'gagal', urls: [], files: [], stdout: stdout.slice(0, 2000), catatan: (stderr || stdout).slice(0, 300) }
  } finally {
    try { fs.rmSync(folder, { recursive: true, force: true }) } catch {}
  }
}

export default { jalankanSnippet, bacaKode, daftarSlug, SRC }
