import handler from '../plugins/download/threads.js'

function buatMock() {
  const pesan = []
  const reaksi = []
  const conn = {
    sendMessage: async (chat, payload) => {
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
  ['VIDEO', 'https://www.threads.com/@instagram/post/DeM_6ZmkpE_'],
  ['IMAGE', 'https://www.threads.com/@nasa/post/DeKza99kXKb'],
  ['CAROUSEL', 'https://www.threads.com/@nasa/post/DeIMD0VkX9l'],
  ['TEXT', 'https://www.threads.com/@0xjessel/post/C2isac0P7c7'],
  ['HOST-SALAH', 'https://x.com/foo/status/1'],
  ['URL-SALAH', 'bukan-url'],
  ['KOSONG', ''],
]

for (const [label, url] of kasus) {
  const { conn, m, pesan, reaksi } = buatMock()
  m.text = url
  try {
    await handler(m, { conn, usedPrefix: '.' })
    const jenis = pesan.map((p) => (p.video ? 'video' : p.image ? 'image' : 'text')).join('+') || '(tidak ada)'
    const ukuran = pesan
      .map((p) => {
        const v = p.video || p.image
        if (v === undefined) return String(p.text || '').length
        return `${typeof v}(len=${v?.length ?? 'undefined'},byte=${v?.byteLength ?? '-'})`
      })
      .join(' | ')
    console.log(`${label.padEnd(11)} → kirim=${jenis} ukuran=${ukuran} reaksi=[${reaksi.join('')}]`)
    if (pesan[0]?.caption) console.log('   caption:', JSON.stringify(pesan[0].caption).slice(0, 220))
    if (pesan[0]?.text) console.log('   teks:', JSON.stringify(pesan[0].text).slice(0, 220))
  } catch (e) {
    console.log(`${label.padEnd(11)} → THROW: ${e.message}`)
  }
}
