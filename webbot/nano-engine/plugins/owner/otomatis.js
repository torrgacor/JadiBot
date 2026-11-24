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


import { getOtomatisStatus, setOtomatisStatus } from '../../core/otomatis.js'

/* Pemecah grafeme: satu emoji bisa terdiri dari beberapa kode point
   (skin tone, penanda gender, joiner), jadi panjang string tidak bisa
   dipakai untuk menghitung "berapa emoji". */
const segmenter =
  typeof Intl?.Segmenter === 'function'
    ? new Intl.Segmenter('id', { granularity: 'grapheme' })
    : { segment: (t) => [...t].map((s) => ({ segment: s })) }

/* Nama fitur + keterangan untuk layar status. */
const LABEL = {
  typing: { judul: 'Auto Typing', ket: 'muncul "sedang mengetik…" saat pesan masuk' },
  read: { judul: 'Auto Read', ket: 'tandai pesan sudah dibaca (centang biru)' },
  react: { judul: 'Auto React', ket: 'balas pesan dengan emoji' },
}

/* Semua sakelar dinyalakan/matikan sekaligus. */
function parseSemua(args) {
  const mode = String(args[0] || '').toLowerCase()
  if (mode !== 'on' && mode !== 'off') return null
  const nyala = mode === 'on'
  return { patch: { typing: nyala, read: nyala, react: nyala } }
}

/* Satu fitur: "typing on", atau "!typing" untuk membalik statusnya. */
function parseSatu(fitur, args) {
  const mode = String(args[0] || '').toLowerCase()
  if (mode === 'on' || mode === 'off') {
    return { patch: { [fitur]: mode === 'on' } }
  }
  if (mode === 'toggle' || mode === '') {
    const sekarang = getOtomatisStatus()[fitur]
    return { patch: { [fitur]: !sekarang } }
  }
  return null
}

function barisStatus(status) {
  const aktif = (v) => (v ? '*AKTIF*' : 'NONAKTIF')
  const baris = Object.entries(LABEL).map(
    ([fitur, meta]) => `│ ${meta.judul.padEnd(11)}: ${aktif(status[fitur])}`
  )
  return baris
}

function buildStatus(status, prefix) {
  return [
    '╭─「 NANO • AUTO 」',
    '│',
    ...barisStatus(status),
    '│',
    `│ Emoji     : ${status.emoji ? status.emoji : '*acak* (acak tiap pesan)'}`,
    '│',
    '╰──────────────',
    '',
    `Otomatis semua : *${prefix}otomatis on* · *${prefix}otomatis off*`,
    `Typing         : *${prefix}typing on/off* · *${prefix}typing* (toggle)`,
    `Read           : *${prefix}autoread on/off*`,
    `React          : *${prefix}autoreact on/off*`,
    `Emoji tetap    : *${prefix}autoreact set 🙏* · *${prefix}autoreact acak*`,
  ].join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  const perintah = String(m.command || '').toLowerCase()
  const args = Array.isArray(m.args) ? m.args : []
  const sekarang = getOtomatisStatus()

  /* .autoreact set <emoji> / .autoreact acak — khusus fitur react. */
  if (perintah === 'autoreact') {
    const sub = String(args[0] || '').toLowerCase()
    if (sub === 'set') {
      /* m.text adalah argumen TANPA nama perintah, jadi di sini bentuknya
         persis "set 🙏" — cukup buang kata "set" di depan. */
      const emoji = m.text.replace(/^set\s*/i, '').trim()
      if (!emoji) {
        await m.reply('Emoji belum ditulis. Contoh: `.autoreact set 🙏`')
        return
      }
      /* WhatsApp hanya menerima SATU emoji sebagai reaction. Jumlahnya
         dihitung dengan Intl.Segmenter, bukan panjang string: emoji
        sequences seperti 👨‍👩‍👧 adalah SATU emoji tapi-many kode
         point, sedangkan "oke deh" adalah banyak karakter biasa.
         Mengirim dua reaction sekaligus pasti ditolak server, jadi
         Owner diberi tahu lebih awal. */
      const grafeme = [...segmenter.segment(emoji)].length
      if (grafeme !== 1) {
        await m.reply(
          `Reaction hanya bisa satu emoji. Yang kamu kirim terbaca sebagai *${grafeme}* bagian.\n` +
            `Contoh yang benar: \`.autoreact set 🙏\``
        )
        return
      }
      setOtomatisStatus({ emoji })
      await conn.sendMessage(
        m.chat,
        { text: `Emoji reaction ditetapkan: *${emoji}*` },
        { quoted: m.raw }
      )
      return
    }
    if (sub === 'acak') {
      setOtomatisStatus({ emoji: '' })
      await conn.sendMessage(
        m.chat,
        { text: 'Reaction kembali ke *emoji acak* tiap pesan.' },
        { quoted: m.raw }
      )
      return
    }
  }

  /* .typing / .autoread / .autoreact on|off, atau tanpa argumen = toggle. */
  const fitur = { typing: 'typing', autoread: 'read', autoreact: 'react' }[perintah]
  if (fitur) {
    const hasil = parseSatu(fitur, args)
    if (!hasil) {
      await conn.sendMessage(
        m.chat,
        { text: `Pilihan tidak valid. Gunakan:\n*${usedPrefix}${perintah} on* · *${usedPrefix}${perintah} off* · *${usedPrefix}${perintah}*` },
        { quoted: m.raw }
      )
      return
    }
    const setelah = setOtomatisStatus(hasil.patch)
    const nyala = setelah[fitur]
    const meta = LABEL[fitur]
    await conn.sendMessage(
      m.chat,
      { text: `*${meta.judul}* ${nyala ? 'diaktifkan' : 'dinonaktifkan'}.\n└─ ${meta.ket}` },
      { quoted: m.raw }
    )
    return
  }

  /* .otomatis on|off — sakelar semua fitur. */
  const hasilSemua = parseSemua(args)
  if (hasilSemua) {
    const setelah = setOtomatisStatus(hasilSemua.patch)
    const nyala = setelah.typing
    await conn.sendMessage(
      m.chat,
      {
        text:
          `Fitur otomatis berhasil *${nyala ? 'diaktifkan' : 'dinonaktifkan'}*.\n\n` +
          buildStatus(setelah, usedPrefix),
      },
      { quoted: m.raw }
    )
    return
  }

  await conn.sendMessage(
    m.chat,
    { text: buildStatus(sekarang, usedPrefix) },
    { quoted: m.raw }
  )
}

handler.command = /^(otomatis|typing|autoread|autoreact)$/i
handler.help = ['otomatis', 'typing', 'autoread', 'autoreact']
handler.tags = ['owner']
handler.description = 'Mengaktifkan/menonaktifkan auto typing, auto read, dan auto reaction'
handler.ownerOnly = true

export default handler
