/*
⌬ Nano Ai · Scanner snippet gist
  Menganalisis setiap file di lib/gist/src dan menghasilkan manifest JSON:
  exports, dependencies, konstanta input (yang nilainya bisa ditimpa),
  blok auto-run (console.log langsung), dan flag khusus (canvas/font).
*/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, 'src')
const list = JSON.parse(fs.readFileSync('/tmp/gist.json', 'utf8'))
const meta = Object.fromEntries(list.map(s => [s.slug, s]))

const NPM = /^[a-z@][a-z0-9._@/-]*$/i
const out = []

function detectConsts(code) {
  // const NAMA = 'nilai'  /  "nilai"  /  angka  — hanya literal sederhana di level atas
  const res = []
  const re = /(?:^|\n)(?:const|let)\s+([A-Z][A-Z0-9_]{1,30})\s*=\s*('([^'\\\n]*)'|"([^"\\\n]*)"|(\d+(?:\.\d+)?))\s*(?:\/\/[^\n]*)?(?=\n|$)/g
  let m
  while ((m = re.exec(code))) {
    const name = m[1]
    const isStr = m[3] !== undefined || m[4] !== undefined
    const val = m[3] ?? m[4] ?? m[5]
    // kecilkan kemungkinan const konfigurasi internal dipilih: harus terlihat seperti input
    if (!/^(URL|TEXT|TEKS|PROMPT|QUERY|SEARCH|KEYWORD|Q|LINK|USERNAME|USER|ID|UID|SERVER|ZONE|NOMOR|PHONE|EMAIL|PASSWORD|FILE|PATH|THEME|BG|SIZE|WIDTH|HEIGHT|QUALITY|BLUR|FONT|TYPE|FORMAT|LANG|LANGUAGE|KODE|CODE|SLUG|PAGE|LIMIT|AMOUNT|QTY|NAMA|NAME|TITLE|CAPTION|BODY|MESSAGE|PESAN|VALUE|DATA|TOKEN|COOKIE|PROXY|TARGET|DEST|OUT|OUTPUT|JUMLAH|HARI|AR|ASPECT|MODEL|VOICE|SPEAKER|SPEED|VOLUME|LOOP|DELAY|DURATION|FPS|SCALE|SIDE|STYLE|COLOR|COLOR1|COLOR2|TOPIK|TOPIC|GENRE|EPISODE|CHAPTER|SURAT|AYAT|QARI|BITRATE|KUALITAS|MODE|METHOD|ACTION|NUMBER|WORD|PHRASE|SENTENCE|IMAGE|VIDEO|AUDIO|IMG|GAMBAR|FOTO|PHOTO|STICKER|EMOJI|CHAR|CHARACTER|AVATAR|SEED|RANDOM|ITEM|PRODUCT|CITY|KOTA|COUNTRY|NEGARA|TIME|TIMEZONE|TZ|DATE|TANGGAL|JAM|CLOCK|STATUS|CONTENT|SUBJECT|BODY_TEXT|FIRST_NAME|LAST_NAME|FULL_NAME|GITHUB|REPO|OWNER|BRAND|CHANNEL|ARTIST|TRACK|SONG|JUDUL)$/i.test(name)) continue
    res.push({ name, isStr, val })
  }
  return res
}

function detectAutorun(code) {
  const last = code.trimEnd().split('\n').slice(-40).join('\n')
  return /(^|\n)\s*(main\(\)|run\(\)|await\s+main\(|await\s+run\(|generate[A-Za-z]*\(\)|console\.log\()/.test(last) && !/module\.exports|export\s+default|export\s+async\s+function|export\s+function/.test(last.slice(-600)) ? true : /\nmain\(\s*\)/.test(code) || /\nrun\(\s*\)/.test(code)
}

function isSelfContained(code) {
  // snippet yang mengekspor fungsi tapi TIDAK menjalankan apa pun saat diimpor
  const hasExport = /export\s+(async\s+)?(function|const|default)|module\.exports/.test(code)
  const topCall = /^\s*(await\s+)?(main|run|start|generate[A-Za-z]*|convert[A-Za-z]*)\(\s*[);"']/m.test(code) || /(?:^|\n)(?:console\.log\()/.test(code.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, ''))
  return !topCall
}

for (const slug of fs.readdirSync(SRC).sort()) {
  const code = fs.readFileSync(path.join(SRC, slug), 'utf8')
  const info = meta[slug] || {}
  const imports = [...code.matchAll(/import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g)].map(m => m[1])
    .concat([...code.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]))
    .filter(s => NPM.test(s) && !s.startsWith('node:'))
  const npms = [...new Set(imports.map(s => s.split('/')[0].startsWith('@') ? s.split('/').slice(0,2).join('/') : s.split('/')[0]))]
  const exportsDecl = [...code.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z0-9_$]+)/g)].map(m => m[1])
  const hasDefault = /export\s+default/.test(code)
  const consts = detectConsts(code)
  const autorun = !isSelfContained(code)
  out.push({
    slug,
    title: info.title || slug,
    desc: info.description || '',
    category: info.category || 'Tools',
    bytes: code.length,
    npms,
    exports: exportsDecl,
    hasDefault,
    consts,
    autorun,
    usesCanvas: npms.includes('@napi-rs/canvas'),
    usesExec: /\bexecSync\(|\bexec\(|spawnSync\(|spawn\(/.test(code),
    usesLocalPath: /__dirname|process\.cwd\(\)|fs\.writeFileSync\((['"])[.\/]/.test(code),
  })
}

fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(out, null, 1))
console.log('total:', out.length)
console.log('dengan export:', out.filter(s => s.exports.length || s.hasDefault).length)
console.log('auto-run:', out.filter(s => s.autorun).length)
const depCount = {}
for (const s of out) for (const d of s.npms) depCount[d] = (depCount[d] || 0) + 1
console.log('dependensi:', JSON.stringify(Object.entries(depCount).sort((a,b)=>b[1]-a[1]), null, 0))
