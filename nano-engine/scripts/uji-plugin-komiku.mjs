/* Uji mock handler plugins/download/komiku.js — tanpa WhatsApp, tanpa ZIP. */
import handler from '../plugins/download/komiku.js'

let gagal = 0
function cek(label, kondisi, detail = '') {
  const ok = !!kondisi
  if (!ok) gagal++
  console.log(`${ok ? 'PASS' : 'GAGAL'} › ${label}${detail ? ` — ${detail}` : ''}`)
}

function buatMock() {
  const pesan = []
  const reaksi = []
  const conn = {
    sendMessage: async (_chat, payload) => {
      if (payload.react) reaksi.push(payload.react.text)
      else pesan.push(payload)
      return { key: {} }
    },
  }
  const m = {
    chat: '62811@c.us',
    sender: '62811@s.whatsapp.net',
    text: '',
    raw: { key: { id: 'X' } },
    limit: { fail() {}, success() {} },
  }
  return { conn, m, pesan, reaksi }
}

const kasus = [
  ['PANDUAN', ''],
  ['POPULER', 'populer'],
  ['GENRELIST', 'genrelist'],
  ['DETAIL', 'detail solo-leveling'],
  ['CARI', 'cari naruto'],
  ['GENRE AMAN', 'genre aksi'],
  ['GENRE DEWASA', 'genre ecchi'],
  ['KATA DEWASA', 'cari komik ngewe'],
  ['TIPENYA SALAH', 'tipe novel'],
]

for (const [label, teks] of kasus) {
  const { conn, m, pesan, reaksi } = buatMock()
  m.text = teks
  try {
    await handler(m, { conn, usedPrefix: '.' })
    const isi = pesan[0] ? (pesan[0].text || '(media)') : '(tidak ada)'
    const relevan =
      /dewasa|ditolak|tidak tersedia/i.test(isi) || !/genre ecchi|ngewe/i.test(teks)
    cek(
      `${label} → balasan`,
      pesan.length > 0,
      `${JSON.stringify(isi.slice(0, 90))} reaksi=[${reaksi.join('')}]`
    )
    if (label === 'GENRE DEWASA' || label === 'KATA DEWASA') {
      cek(
        `${label} DITOLAK dengan pesan jelas`,
        /dewasa|ditolak|tidak tersedia/i.test(isi),
        JSON.stringify(isi.slice(0, 120))
      )
    }
    if (label === 'POPULER' || label === 'GENRELIST' || label === 'CARI' || label === 'GENRE AMAN') {
      cek(`${label} mengandung daftar/panduan aman`, /KOMIKU AMAN|GENRE AMAN/.test(isi), JSON.stringify(isi.slice(0, 60)))
    }
    void relevan
  } catch (e) {
    cek(`${label} → handler tidak melempar`, false, e.message)
  }
}

console.log(gagal === 0 ? '\nSEMUA UJI MOCK HANDLER LULUS' : `\n${gagal} UJI GAGAL`)
process.exit(gagal === 0 ? 0 : 1)
