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

/* ==========================================================================
   .hai — pintu masuk semua fitur HaidarApis (api.haidarxd.my.id)

   Katalog endpoint-nya dari data/haidar-api.json (dibuat oleh
   scripts/generate-haidar-catalog.mjs), jadi seluruh endpoint penyedia bisa
   dipanggil dari satu perintah ini tanpa menulis satu plugin per endpoint.
   ========================================================================== */

import {
  BASE_URL,
  loadCatalog,
  catalogMeta,
  listCategories,
  endpointsByCategory,
  searchEndpoints,
  findEndpoint,
  commandFor,
  loadCommands,
  getKey,
  saveKey,
  deleteKey,
  maskKey,
  getConfig,
  setConfig,
  callEndpoint,
  exampleCommand,
  testKey,
  droppedEndpoints,
} from '../../lib/haidar.js'
import { box, errorText, guardAkses, runEndpoint } from '../../lib/haidar-aksi.js'
import { daftarKategoriApi } from '../../lib/haidar-endpoint.js'

const PER_PAGE = 16

function badge(ep) {
  if (ep.plan === 'enterprise') return '🏢'
  if (ep.plan === 'premium' || ep.premium) return '⭐'
  return '🆓'
}

function methodIcon(ep) {
  return ep.method === 'POST' ? '📤' : '📥'
}

function keySummary() {
  const { key, source, savedAt } = getKey()
  if (!key) return '🔑 Kunci API : *belum diatur*'
  const from = source === 'environment' ? 'environment' : `perintah${savedAt ? ` (${savedAt.slice(0, 10)})` : ''}`
  return `🔑 Kunci API : *${maskKey(key)}* · dari ${from}`
}

function menuText(prefix) {
  const meta = catalogMeta()
  const categories = listCategories()
  const config = getConfig()
  return box([
    `📊 *${meta.total} fitur* siap dipakai (${categories.length} kategori)`,
    `⌨️ *${loadCommands().commands.length} perintah* siap diketik`,
    '',
    keySummary(),
    `👥 Akses : *${config.access}* · Limit user : *${config.pakaiLimit ? 'dipakai' : 'bebas'}*`,
    '',
    '*CARA PAKAI*',
    'Tiap fitur punya perintah sendiri, contoh: .editimg-v1 .chatgpt .gempa',
    `▸ ${prefix}hai <kategori> — daftar perintah di kategori itu`,
    `▸ ${prefix}hai cari <kata> — cari perintah`,
    `▸ ${prefix}hai info <path> — parameter & contoh`,
    `▸ ${prefix}hai <path> [k=v …] — jalankan tanpa perintah khusus`,
    `▸ ${prefix}hai contoh — contoh siap tempel`,
    '',
    '*KATEGORI* (semua perintahnya sudah nongol di menu bot)',
    ...daftarKategoriApi().map((c) => `▸ ${prefix}hai ${c.category} · ${c.total} perintah → menu ${c.menu.toUpperCase()}`),
    '',
    '*PENGATURAN*',
    `▸ ${prefix}hai kunci <apikey> — simpan kunci (owner)`,
    `▸ ${prefix}hai limit on|off — perintah ini memakai limit user atau tidak (owner)`,
    `▸ ${prefix}hai bahasa on|off — paksa jawaban AI berbahasa Indonesia (owner)`,
    `▸ ${prefix}hai cek — status server & kunci`,
    `▸ ${prefix}hai tertutup — fitur yang tidak dipasang`,
  ])
}

function categoriesText(prefix) {
  return box(['*KATEGORI FITUR*', ...listCategories().map((c) => `▸ ${prefix}hai ${c.name} · ${c.total} fitur`)])
}

function categoryText(name, list, page, prefix) {
  if (!list?.length) {
    return box([`Kategori *${name}* tidak ada.`, '', 'Lihat daftarnya di:', `▸ ${prefix}hai`])
  }
  const totalPage = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const current = Math.min(Math.max(1, page), totalPage)
  const slice = list.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const lines = [
    `📂 *${name.toUpperCase()}* · ${list.length} fitur · hal ${current}/${totalPage}`,
    '',
    ...slice.map((ep) => {
      const cmd = commandFor(ep)
      return `${badge(ep)} ${methodIcon(ep)} ${cmd ? `${prefix}${cmd.command}` : `${prefix}hai ${ep.path}`} — ${ep.name}`
    }),
  ]
  if (totalPage > 1) lines.push('', `Halaman berikutnya: ${prefix}hai ${name} -p${current + 1}`)
  lines.push('', `Detail satu fitur: ${prefix}hai info <path>`)
  return box(lines)
}

function searchText(query, prefix) {
  const results = searchEndpoints(query, 20)
  if (!results.length) {
    return box([`Tidak ada fitur yang cocok dengan *${query}*.`, '', `Coba kata lain, atau lihat kategori: ${prefix}hai`])
  }
  const first = commandFor(results[0])
  return box([
    `🔍 *${results.length} hasil* untuk "${query}"`,
    '',
    ...results.map((ep) => {
      const cmd = commandFor(ep)
      return `${badge(ep)} ${cmd ? `${prefix}${cmd.command}` : ep.path} — ${ep.name}`
    }),
    '',
    first ? `Jalankan: ${prefix}${first.command}` : `Jalankan: ${prefix}hai ${results[0].path}`,
  ])
}

/* Contoh perintah memakai nama command-nya sendiri (bukan ".hai run …"). */
function exampleForCommand(cmd, endpoint, prefix) {
  const wajib = (endpoint.params || []).filter((p) => p.required)
  const parts = wajib.map((p) => {
    let value = p.example
    if (value === undefined || value === null || value === '') value = p.enum?.[0] ?? (p.type === 'number' ? 1 : `<${p.name}>`)
    const text = String(value)
    return p.type === 'number' || (!text.includes(' ') && !text.startsWith('<')) ? `${p.name}=${text}` : `${p.name}="${text}"`
  })
  return `${prefix}${cmd.command}${parts.length ? ` ${parts.join(' ')}` : ''}`
}

function infoText(ep, prefix) {
  const lines = [
    `${badge(ep)} *${ep.name}*`,
    `${methodIcon(ep)} ${ep.method} ${ep.full}`,
    `📂 ${ep.category} · plan ${ep.plan}${ep.rateLimit ? ` · ${ep.rateLimit} req/menit` : ''}`,
    '',
    ep.description || 'Tanpa deskripsi.',
  ]

  if (ep.params?.length) {
    lines.push('', '*PARAMETER*')
    for (const p of ep.params) {
      lines.push(`▸ ${p.name} (${[p.required ? 'wajib' : 'opsional', p.type].filter(Boolean).join(', ')})`)
      if (p.description) lines.push(`   ${p.description}`)
      if (p.enum?.length) lines.push(`   pilihan: ${p.enum.join(', ')}`)
      else if (p.example !== undefined && p.example !== null && String(p.example).length < 60) lines.push(`   contoh: ${p.example}`)
      if (p.default !== undefined) lines.push(`   bawaan: ${p.default}`)
    }
  } else {
    lines.push('', 'Tanpa parameter.')
  }

  const cmd = commandFor(ep)
  if (cmd) {
    lines.push('', `⌨️ *PERINTAH* : ${prefix}${cmd.command}`)
    if (cmd.required?.length) lines.push(`   parameter wajib: ${cmd.required.join(', ')}`)
  }
  lines.push('', '*CONTOH*', `▸ ${cmd ? exampleForCommand(cmd, ep, prefix) : exampleCommand(ep, prefix)}`)
  return box(lines)
}

function exampleList(prefix) {
  const samples = [
    ['/ai/chatgpt', 'resep nasi goreng'],
    ['/ai/gemini', 'jelaskan fotosintesis singkat'],
    ['/ai-image/editimg-v1', 'kucing astronot, sinematik'],
    ['/information/cuaca', 'bandung'],
    ['/information/gempa', ''],
    ['/games/tekateki', ''],
    ['/info/kalender', ''],
    ['/search/lirik', 'tak ingin usai'],
    ['/search/spotify', 'sheila on 7'],
    ['/tools/screenshot', 'https://example.com'],
    ['/tools/youtube-transcript', 'https://youtu.be/dQw4w9WgXcQ'],
    ['/primbon/artinama', 'budi'],
  ]
  const lines = ['*CONTOH SIAP TEMPEL*', '']
  for (const [path, text] of samples) {
    const cmd = commandFor(path)
    if (!cmd) continue
    lines.push(`▸ ${prefix}${cmd.command}${text ? ` ${text}` : ''}`)
  }
  lines.push('', `Semua perintah: ${prefix}hai <kategori>`)
  return box(lines)
}

function droppedText() {
  const dropped = droppedEndpoints()
  const reasons = new Map()
  for (const d of dropped) reasons.set(d.reason, (reasons.get(d.reason) || 0) + 1)
  return box([
    `🚫 *${dropped.length} fitur tidak dipasang*`,
    '',
    ...[...reasons.entries()].sort((a, b) => b[1] - a[1]).map(([reason, total]) => `▸ ${reason} · ${total}`),
    '',
    '*CATATAN*',
    'Pembayaran/PPOB dibuang sesuai permintaan. Sisanya dibuang karena',
    'bukan fitur biasa: konten 18+, alat penipuan (struk palsu), spam,',
    'pembuat akun otomatis, penembus CAPTCHA, pemanen proxy, dan',
    'pencarian data pribadi (NIK, rekening, bansos, profil orang).',
    '',
    'Katalog bisa diperbarui: node scripts/generate-haidar-catalog.mjs',
  ])
}

async function statusText(prefix) {
  const meta = catalogMeta()
  const lines = [
    `📊 *KATALOG* : ${meta.total} fitur terpasang (${meta.excluded} tidak dipasang)`,
    `🌐 *SERVER* : ${BASE_URL}`,
    '',
    keySummary(),
  ]

  try {
    const health = await callEndpoint('/health', {}, { key: '' })
    lines.push(`🩺 *Health* : HTTP ${health.status} · ${health.ms} ms`)
  } catch (err) {
    lines.push(`🩺 *Health* : gagal (${err.message})`)
  }

  const { key } = getKey()
  if (key) {
    try {
      const probe = await testKey(key)
      lines.push(
        probe.ok
          ? `🔓 *Kunci* : diterima server (uji ${probe.endpoint.path} · ${probe.ms} ms)`
          : `🔒 *Kunci* : ditolak — ${probe.error?.message || `HTTP ${probe.status}`}`,
      )
    } catch (err) {
      lines.push(`🔒 *Kunci* : gagal diuji (${err.message})`)
    }
  } else {
    lines.push('🔑 *Kunci* : belum ada — minta owner memasang kunci lewat .hai kunci')
  }

  const config = getConfig()
  lines.push(`👥 *Akses* : ${config.access} · ${config.perUserPerMinute}×/menit per pengguna`)
  lines.push(`🔒 *Limit user* : ${config.pakaiLimit ? 'dipakai' : 'bebas'} (ubah: ${prefix}hai limit on|off)`)
  lines.push(`🇮🇩 *Bahasa AI* : ${config.indoReply ? 'Indonesia (wajib)' : 'bebas'} (ubah: ${prefix}hai bahasa on|off)`)
  return box(lines)
}

const handler = async (m, { conn, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const text = String(m.args?.join(' ') || '').trim()
  const [first, ...others] = text.split(/\s+/)
  const sub = String(first || '').toLowerCase()

  const { owner, blocked } = await guardAkses(m, conn)
  if (blocked) return

  try {
    if (!text || ['menu', 'help', 'bantuan', 'start'].includes(sub)) {
      await m.reply(menuText(prefix))
      return
    }

    if (['kategori', 'categories', 'cat'].includes(sub)) {
      await m.reply(categoriesText(prefix))
      return
    }

    if (['contoh', 'example'].includes(sub)) {
      await m.reply(exampleList(prefix))
      return
    }

    if (['tertutup', 'dibuang', 'excluded'].includes(sub)) {
      await m.reply(droppedText())
      return
    }

    if (['cek', 'status'].includes(sub)) {
      await m.reply(await statusText(prefix))
      return
    }

    if (['cari', 'search', 'find'].includes(sub)) {
      const query = others.join(' ').trim()
      if (!query) {
        await m.reply(box([`Format: ${prefix}hai cari <kata kunci>`]))
        return
      }
      await m.reply(searchText(query, prefix))
      return
    }

    if (['info', 'detail', 'param'].includes(sub)) {
      const target = others.join(' ').trim()
      const endpoint = findEndpoint(target)
      if (!endpoint) {
        await m.reply(box([`Endpoint *${target}* tidak ditemukan.`, '', `Cari: ${prefix}hai cari ${target}`]))
        return
      }
      if (endpoint.ambiguous) {
        await m.reply(box(['Maksudmu yang mana?', '', ...endpoint.ambiguous.map((e) => `▸ ${e.path} — ${e.name}`)]))
        return
      }
      await m.reply(infoText(endpoint, prefix))
      return
    }

    if (['kunci', 'key', 'apikey'].includes(sub)) {
      const value = others.join(' ').trim()
      if (!value) {
        await m.reply(
          box([
            keySummary(),
            '',
            `▸ ${prefix}hai kunci <apikey> — simpan & uji kunci (owner)`,
            `▸ ${prefix}hai kunci hapus — hapus kunci tersimpan (owner)`,
            '',
            '*AMBIL KUNCI GRATIS*',
            '1. Buka situs penyedia → daftar akun gratis',
            '2. Dashboard → API Keys → buat kunci',
            '3. Salin nilai haidarapis-… lalu kirim ulang ke bot',
          ]),
        )
        return
      }
      if (!owner) {
        await m.reply(box(['🔒 Hanya owner bot yang bisa mengubah kunci API.']))
        return
      }
      if (['hapus', 'reset'].includes(value)) {
        await deleteKey()
        await m.reply(box(['🗑️ Kunci tersimpan sudah dihapus.', '', `Simpan yang baru: ${prefix}hai kunci haidarapis-xxxx`]))
        return
      }
      const saved = await saveKey(value)
      const probe = await testKey(saved.key).catch((err) => ({ ok: false, error: err }))
      await m.reply(
        box([
          `🔑 Kunci disimpan: *${maskKey(saved.key)}*`,
          '',
          probe.ok
            ? `✅ Diterima server · uji ${probe.endpoint.path} · ${probe.ms} ms`
            : `⚠️ Disimpan, tapi server menolak: ${probe.error?.message || 'tidak diketahui'}`,
          '',
          'Semua fitur .hai langsung memakai kunci ini.',
        ]),
      )
      return
    }

    if (['limit', 'limituser'].includes(sub)) {
      if (!owner) {
        await m.reply(box(['🔒 Hanya owner bot yang bisa mengubah setelan limit.']))
        return
      }
      const mode = String(others[0] || '').toLowerCase()
      if (!['on', 'off', 'nyala', 'mati'].includes(mode)) {
        await m.reply(box([`Sekarang: *${getConfig().pakaiLimit ? 'pakai limit pengguna' : 'bebas tanpa limit'}*`, '', `Format: ${prefix}hai limit on|off`]))
        return
      }
      const pakaiLimit = ['on', 'nyala'].includes(mode)
      await setConfig({ pakaiLimit })
      await m.reply(
        box([
          pakaiLimit
            ? '🔒 Perintah HaidarApis sekarang *memakai limit pengguna* seperti fitur ai/download lainnya.'
            : '🔓 Perintah HaidarApis sekarang *bebas dipakai* tanpa memotong limit pengguna.',
          '',
          'Berlaku langsung, tanpa perlu restart.',
        ]),
      )
      return
    }

    if (['bahasa', 'language', 'lang'].includes(sub)) {
      if (!owner) {
        await m.reply(box(['🔒 Hanya owner bot yang bisa mengubah setelan bahasa.']))
        return
      }
      const mode = String(others[0] || '').toLowerCase()
      if (!['on', 'off', 'nyala', 'mati'].includes(mode)) {
        await m.reply(
          box([
            `Sekarang: *${getConfig().indoReply ? 'jawaban AI dipaksa bahasa Indonesia' : 'bebas (ikut bahasa model)'}*`,
            '',
            `Format: ${prefix}hai bahasa on|off`,
          ]),
        )
        return
      }
      const indoReply = ['on', 'nyala'].includes(mode)
      await setConfig({ indoReply })
      await m.reply(
        box([
          indoReply
            ? '🇮🇩 Semua percakapan AI sekarang *dipaksa menjawab bahasa Indonesia*.'
            : '🌐 Percakapan AI sekarang *bebas* memakai bahasa modelnya sendiri.',
          '',
          'Berlaku langsung, tanpa perlu restart. Fitur lagu, suara, dan gambar tidak terpengaruh.',
        ]),
      )
      return
    }

    if (['akses', 'access'].includes(sub)) {
      if (!owner) {
        await m.reply(box(['🔒 Hanya owner bot yang bisa mengubah akses.']))
        return
      }
      const mode = String(others[0] || '').toLowerCase()
      if (!['semua', 'owner'].includes(mode)) {
        await m.reply(box([`Format: ${prefix}hai akses semua|owner`]))
        return
      }
      await setConfig({ access: mode })
      await m.reply(box([`👥 Akses fitur .hai diubah jadi *${mode}*.`]))
      return
    }

    if (['run', 'jalankan', 'call'].includes(sub)) {
      const target = others[0]
      if (!target) {
        await m.reply(box([`Format: ${prefix}hai run <path> [nama=nilai …]`]))
        return
      }
      await runEndpoint(m, conn, target, others.slice(1).join(' '), prefix)
      return
    }

    // kategori? (boleh juga ditulis sebagai awalan path, mis. "information")
    let list = endpointsByCategory(sub)
    if (!list.length) {
      list = loadCatalog().endpoints.filter((ep) => ep.path.toLowerCase().startsWith(`/${sub}/`))
    }
    if (list.length) {
      const pageArg = others.find((part) => /^-p\d+$/i.test(part))
      const page = pageArg ? Number(pageArg.replace(/^-p/i, '')) : 1
      await m.reply(categoryText(sub, list, page, prefix))
      return
    }

    // dianggap path endpoint
    const endpoint = findEndpoint(text)
    if (endpoint && !endpoint.ambiguous) {
      await runEndpoint(m, conn, text, '', prefix)
      return
    }

    await m.reply(
      box([
        `❓ *${sub}* bukan kategori maupun endpoint yang dikenal.`,
        '',
        `▸ ${prefix}hai — daftar semua`,
        `▸ ${prefix}hai cari ${sub}`,
      ]),
    )
  } catch (error) {
    await m.reply(errorText(error, prefix))
  }
}

handler.command = /^(hai|haidar)$/i
handler.help = ['hai', 'haidar']
/* menuHelp kosong = tidak ditampilkan di daftar menu: ini pintu masuk katalog
   API, bukan fitur. Perintahnya tetap bisa dipakai kalau diketik manual. */
handler.menuHelp = []
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Akses semua fitur HaidarApis (AI, downloader, info, tools) lewat satu perintah'

export default handler
