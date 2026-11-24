/*
⎢ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
⎢
⎢ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
⎢🔸Dilarang Menghapus Creadit SC
⎢🔸Dilarang Menjual Script Nano Ai
⎢🔸Dilarang Mengatas Namakan Script!!
⌬
*/

/* ==========================================================================
   Indeks API GRATIS (.af).

   Semua perintah endpoint-nya ada di plugins/apifree/api-*.js (hasil generate).
   Berkas ini cuma pintu masuk: ringkasan, daftar penyedia + status kunci,
   daftar perintah per kategori, pencarian, informasi, dan uji koneksi.
   ========================================================================== */

import {
  loadCatalog,
  aktifList,
  loadCommands,
  penyediaList,
  kategoriList,
  kategoriMenu,
  byCategory,
  searchEndpoints,
  findEndpoint,
  saveKey,
  deleteKey,
  getKey,
  semuaKunci,
  maskKey,
  commandFor,
  exampleCommand,
  callEndpoint,
} from '../../lib/apifree.js'
import { isOwner } from '../../lib/cek-akses.js'
import { sendInteractive } from '../../lib/tombol.js'
import { getConfig, setConfig, guardAkses, cut } from '../../lib/apifree-aksi.js'

/* Kolom yang lazim menerima teks bebas — dipakai untuk petunjuk pemakaian. */
const PARAM_TEKS = ['text', 'teks', 'message', 'prompt', 'query', 'q', 'kata', 'keyword', 'judul', 'title', 'nama', 'url', 'link']

const HEADER = '╭─〔 🆓 API GRATIS 〕'
const FOOTER = '╰──────────────╯'
const box = (lines) => [HEADER, ...lines.map((l) => (l ? `│ ${l}` : '│')), FOOTER].join('\n')

/* Penyedia yang benar-benar punya fitur terpasang (aktif & tanpa kunci). */
function penyediaTerpasang() {
  const terpasang = new Set(loadCommands().commands.map((c) => c.provider))
  return penyediaList().filter((p) => terpasang.has(p.provider) && p.aktif > 0)
}

function ringkasPenyedia(prefix) {
  const kunci = semuaKunci()
  return penyediaTerpasang()
    .sort((a, b) => b.aktif - a.aktif)
    .map((p) => {
      const sisa = Math.max(0, p.total - p.aktif)
      const ada = kunci[p.provider]
      const tanda = ada ? '🔑' : '🆓'
      return `${tanda} *${p.provider}* — ${p.aktif} fitur aktif tanpa kunci${sisa > 0 ? ` · ${sisa} endpoint lain butuh kunci` : ''}`
    })
}

async function menuUtama(m, conn, prefix) {
  const katalog = loadCatalog().meta || {}
  const total = katalog.aktif || aktifList().length
  const penyedia = penyediaTerpasang()
  const kategori = kategoriList().filter((k) => byCategory(k.kategori).some((ep) => commandFor(ep)))

  const baris = [
    `📦 *${total} fitur aktif* dari *${penyedia.length} penyedia* — semua tanpa kunci`,
    `🧪 Disisir langsung ke servernya: hanya yang benar-benar jalan dipasang`,
    '',
    ...kategori
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map((k) => `▸ ${prefix}af ${k.kategori} · ${k.total} fitur`),
    '',
    `▸ ${prefix}af penyedia — daftar penyedia & kunci`,
    `▸ ${prefix}af cari <kata> — cari fitur`,
    `▸ ${prefix}af info <perintah> — cara pakai`,
  ]

  /* Tombol kategori (maks 9 baris sesuai batas WhatsApp) */
  const rows = kategori
    .sort((a, b) => b.total - a.total)
    .slice(0, 9)
    .map((k) => ({ title: `${k.kategori} · ${k.total} fitur`, description: `lihat perintah kategori ${k.kategori}`, command: `${prefix}af ${k.kategori}` }))

  try {
    await sendInteractive(
      conn,
      m.chat,
      {
        title: 'API GRATIS',
        subtitle: `${total} fitur siap pakai`,
        body: baris.join('\n'),
        footer: 'Nano • API Free',
        buttons: [
          { type: 'quick', label: '🏷️ Penyedia', command: `${prefix}af penyedia` },
          { type: 'quick', label: '🔄 Muat ulang', command: `${prefix}af` },
        ],
        list: { listTitle: '📂 Pilih kategori', sections: [{ title: 'KATEGORI', rows }] },
      },
      { quoted: m.raw },
    )
  } catch {
    await m.reply(box(baris))
  }
}

async function teksPenyedia(m, conn, prefix) {
  const tidakDipasang = penyediaTerpasang().reduce((a, p) => a + Math.max(0, p.total - p.aktif), 0)
  const baris = [
    '*PENYEDIA & FITUR AKTIF* — semuanya tanpa kunci',
    '',
    ...ringkasPenyedia(prefix),
    '',
    tidakDipasang ? `${tidakDipasang} endpoint lain butuh kunci penyedianya, jadi tidak dipasang.` : '',
  ].filter((l) => l !== '')
  const rows = penyediaTerpasang()
    .sort((a, b) => b.aktif - a.aktif)
    .slice(0, 9)
    .map((p) => ({ title: `${p.provider} · ${p.aktif} fitur`, description: p.hosts[0] || '', command: `${prefix}af ${p.provider}` }))
  try {
    await sendInteractive(
      conn,
      m.chat,
      {
        title: 'Penyedia API GRATIS',
        subtitle: `${penyediaTerpasang().length} penyedia`,
        body: baris.join('\n'),
        footer: '🆓 tanpa kunci · 🔑 kunci tersimpan · 🔒 butuh kunci',
        list: { listTitle: '📂 Lihat fitur penyedia', sections: [{ title: 'PENYEDIA', rows }] },
      },
      { quoted: m.raw },
    )
  } catch {
    await m.reply(box(baris))
  }
}

/* Menerima nama kategori menu (mis. "image") maupun nama kategori katalog
   (mis. "canvas-maker") — keduanya menunjuk daftar yang sama. */
function teksKategori(kategori, prefix) {
  const key = String(kategori || '').trim().toLowerCase()
  const menu = kategoriMenu(key)
  const list = loadCommands().commands.filter(
    (c) => String(c.menu || kategoriMenu(c.category)).toLowerCase() === menu || String(c.category).toLowerCase() === key,
  )
  if (!list.length) return null
  return [
    `*${menu.toUpperCase()}* — ${list.length} fitur`,
    [...new Set(list.map((c) => c.category))].length > 1 ? `Kategori asal: ${[...new Set(list.map((c) => c.category))].join(', ')}` : '',
    '',
    ...list.slice(0, 120).map((c) => `▸ ${prefix}${c.command}`),
    list.length > 120 ? `… +${list.length - 120} lagi` : '',
    '',
    `Contoh: ${prefix}af info ${list[0].command}`,
  ]
    .filter((l) => l !== '')
    .join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const teks = String(m.args?.join(' ') || '').trim()
  const [sub, ...sisa] = teks.split(/\s+/)
  const kata = String(sub || '').toLowerCase()

  const { blocked } = await guardAkses(m, conn)
  if (blocked) return

  /* menu utama */
  if (!kata || ['menu', 'help', 'bantuan', 'start'].includes(kata)) return menuUtama(m, conn, prefix)

  /* daftar penyedia */
  if (['penyedia', 'provider', 'api', 'sumber'].includes(kata)) return teksPenyedia(m, conn, prefix)

  /* simpan / lihat / hapus kunci */
  if (['kunci', 'key', 'apikey'].includes(kata)) {
    const [nama, ...rest] = sisa
    if (!nama) {
      const baris = ringkasPenyedia(prefix)
      return m.reply(box(['*STATUS KUNCI*', '', ...baris, '', `Simpan: ${prefix}af kunci <penyedia> <kunci>`, `Contoh: ${prefix}af kunci theresav theresav-xxxx`]))
    }
    if (!(await isOwner(m, conn).catch(() => false))) return m.reply('🔒 Hanya owner bot yang bisa mengubah kunci.')
    const nilai = rest.join(' ').trim()
    if (!nilai || ['hapus', 'delete', '-'].includes(nilai.toLowerCase())) {
      await deleteKey(nama)
      return m.reply(`🗑️ Kunci *${nama}* dihapus.`)
    }
    try {
      const hasil = await saveKey(nama, nilai)
      const uji = await callEndpoint(loadCatalog().endpoints.find((e) => e.provider === hasil.provider) || {}, {})
      return m.reply(box([`🔑 Kunci *${hasil.provider}* disimpan (${maskKey(hasil.key)}).`, uji.ok ? '✅ Server menerima kuncinya.' : `⚠️ Diuji: ${uji.error?.message || `HTTP ${uji.status}`}`]))
    } catch (err) {
      return m.reply(box([`⚠️ ${err.message}`]))
    }
  }

  /* pencarian */
  if (['cari', 'search', 'find'].includes(kata)) {
    const q = sisa.join(' ')
    if (!q) return m.reply(`Format: ${prefix}af cari <kata>`)
    const hasil = searchEndpoints(q, 20)
    if (!hasil.length) return m.reply(`Tidak ada fitur yang cocok dengan *${q}*.`)
    return m.reply(
      [`*HASIL CARI* “${q}” — ${hasil.length}`, '', ...hasil.map((e) => `▸ ${prefix}${commandFor(e)?.command || e.path} · ${e.name}`), '', `Pakai: ${exampleCommand(hasil[0], prefix, commandFor(hasil[0])?.command, 'af')}`].join('\n'),
    )
  }

  /* informasi satu perintah */
  if (['info', 'detail', 'param', 'cara'].includes(kata)) {
    const target = sisa[0]
    if (!target) return m.reply(`Format: ${prefix}af info <perintah atau path>`)
    const bersih = target.replace(/^[./]/, '')
    const spec = loadCommands().byCommand.get(bersih.toLowerCase())
    const ep = spec ? findEndpoint(spec.path) : findEndpoint(bersih)
    if (!ep || ep.ambiguous) return m.reply(`*${bersih}* tidak ditemukan. Cari dulu: ${prefix}af cari ${bersih}`)
    const cmd = commandFor(ep)?.command
    return m.reply(
      [
        `⌨️ *${cmd ? `${prefix}${cmd}` : `${prefix}af ${ep.path}`}*`,
        `${ep.name} · ${ep.provider}`,
        ep.description ? `\n${ep.description}` : '',
        `\nMetode: ${ep.method} ${ep.path}`,
        `Kunci: ${ep.wajibKunci === false || ep.key?.mode === 'none' ? 'tanpa kunci' : `butuh kunci (${ep.provider})`}`,
        (ep.params || []).length ? `\nParameter:\n${ep.params.map((p) => `▸ ${p.name}${p.required ? ' *wajib*' : ''}${p.description ? ` — ${p.description}` : ''}`).join('\n')}` : '\nTanpa parameter.',
        cmd ? `\nContoh: ${exampleCommand(ep, prefix, cmd, 'af')}` : '',
        cmd && PARAM_TEKS.some((n) => (ep.params || []).some((p) => String(p.name).toLowerCase() === n))
          ? `Bisa juga teks bebas: ${prefix}${cmd} <teks kamu>`
          : '',
      ]
        .filter((l) => l !== '')
        .join('\n'),
    )
  }

  /* uji koneksi penyedia */
  if (['cek', 'status', 'uji'].includes(kata)) {
    const daftar = penyediaTerpasang().sort((a, b) => b.aktif - a.aktif)
    const baris = []
    for (const p of daftar) {
      const ep = aktifList().find((e) => e.provider === p.provider && e.method === 'GET' && (e.params || []).length === 0)
      if (!ep) {
        baris.push(`▸ *${p.provider}* — tidak ada endpoint tanpa parameter untuk diuji`)
        continue
      }
      try {
        const r = await callEndpoint(ep, {})
        baris.push(`▸ *${p.provider}* ${r.ok ? '✅' : '⚠️'} ${r.ms} ms · ${ep.path}${r.ok ? '' : ` · ${String(r.error?.message || ``).slice(0, 60)}`}`)
      } catch (err) {
        baris.push(`▸ *${p.provider}* ❌ ${String(err.message).slice(0, 70)}`)
      }
    }
    return m.reply(['*UJI KONEKSI PENYEDIA*', '', ...baris].join('\n'))
  }

  /* pengaturan */
  if (['tombol', 'button'].includes(kata)) {
    if (!(await isOwner(m, conn).catch(() => false))) return m.reply('🔒 Hanya owner bot.')
    const mode = String(sisa[0] || '').toLowerCase()
    if (!['on', 'off'].includes(mode)) return m.reply(`Sekarang: *${getConfig().tombol ? 'tombol aktif' : 'tombol mati'}*\nFormat: ${prefix}af tombol on|off`)
    await setConfig({ tombol: mode === 'on' })
    return m.reply(mode === 'on' ? '✅ Balasan daftar dikirim sebagai pesan bertombol.' : '✅ Balasan daftar dikirim sebagai teks biasa.')
  }

  if (['limit', 'limituser'].includes(kata)) {
    if (!(await isOwner(m, conn).catch(() => false))) return m.reply('🔒 Hanya owner bot.')
    const mode = String(sisa[0] || '').toLowerCase()
    if (!['on', 'off'].includes(mode)) return m.reply(`Sekarang: *${getConfig().pakaiLimit ? 'pakai limit pengguna' : 'bebas'}*\nFormat: ${prefix}af limit on|off`)
    await setConfig({ pakaiLimit: mode === 'on' })
    return m.reply(mode === 'on' ? '🔒 Perintah API Gratis memakai limit pengguna.' : '🔓 Perintah API Gratis bebas dipakai.')
  }

  if (['akses', 'access'].includes(kata)) {
    if (!(await isOwner(m, conn).catch(() => false))) return m.reply('🔒 Hanya owner bot.')
    const mode = String(sisa[0] || '').toLowerCase()
    if (!['semua', 'owner'].includes(mode)) return m.reply(`Sekarang: *${getConfig().access}*\nFormat: ${prefix}af akses semua|owner`)
    await setConfig({ access: mode })
    return m.reply(`👥 Akses fitur API Gratis: *${mode}*.`)
  }

  /* kategori atau penyedia tertentu */
  const isiKategori = teksKategori(kata, prefix)
  if (isiKategori) return m.reply(cut(isiKategori))

  const namaPenyedia = penyediaTerpasang().find((p) => p.provider === kata)
  if (namaPenyedia) {
    const daftar = loadCommands().commands.filter((c) => c.provider === namaPenyedia.provider)
    return m.reply(
      cut([`*${namaPenyedia.provider.toUpperCase()}* — ${daftar.length} fitur`, '', ...daftar.slice(0, 100).map((c) => `▸ ${prefix}${c.command}`)].join('\n')),
    )
  }

  return m.reply(box([`❓ *${sub}* bukan kategori, penyedia, maupun perintah yang dikenal.`, '', `▸ ${prefix}af — menu utama`, `▸ ${prefix}af cari ${sub}`]))
}

handler.command = /^af$/i
handler.help = ['af']
/* menuHelp kosong = tidak ditampilkan di daftar menu: ini pintu masuk katalog
   API, bukan fitur. Perintahnya tetap bisa dipakai kalau diketik manual. */
handler.menuHelp = []
handler.tags = ['tools', 'apifree']
handler.category = 'tools'
handler.description = 'Indeks API Gratis (multi penyedia, tanpa daftar)'

export default handler
