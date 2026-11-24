import { gabung } from '../lib/x.js'
import { fetchBuffer } from '../lib/http.js'

/* ── Data referensi yang dicontohkan dari skema asli sumber. ── */
const FX = () => ({
  sumber: 'fxtwitter',
  author: { username: 'mker', name: 'M. Ker', avatar: 'https://pbs.twimg.com/flip.jpg', verified: true },
  text: '🎬 video gaib dari sintetis',
  stats: { likes: 5, retweets: 1, replies: 0, views: 120 },
  media: [
    { type: 'video', url: 'https://video.twimg.com/amp/x/1.mp4', poster: 'https://video.twimg.com/amp/x/thumb.jpg', width: 1280, height: 720, duration: 8.5, variants: [{ url: 'https://video.twimg.com/amp/x/720.mp4', bitrate: 800 }] },
    { type: 'image', url: 'https://pbs.twimg.com/media/a.jpg', poster: null, width: 1080, height: 1080, duration: null, variants: [] },
  ],
})

const SYND = () => ({
  sumber: 'syndication',
  author: { username: 'nasa', name: 'NASA', avatar: 'https://pbs.twimg.com/flip2.jpg', verified: false },
  text: '🪐 gambar berwarna dari sintetis',
  stats: { likes: 150, retweets: 20, replies: 3, views: null },
  media: [
    { type: 'image', url: 'https://video.twimg.com/amp/x/b.jpg', poster: null, width: 1600, height: 900, duration: null, variants: [] },
    { type: 'image', url: 'https://pbs.twimg.com/media/c.png', poster: null, width: 900, height: 1350, duration: null, variants: [] },
  ],
})

const gabungan = gabung([FX(), SYND()])

// Tipe: video+2 gambar → carousel.
console.log('tipe gabungan :', gabungan.type)
console.log('total media   :', gabungan.media.items.length)
console.log('gambar (lebar↓):', gabungan.media.gambar.map((m) => m.url))
console.log('video utama   :', Boolean(gabungan.media.video))
console.log('poster        :', Boolean(gabungan.media.poster))
console.log('author        :', gabungan.author.username, '| verified:', gabungan.author.verified)
console.log('stats         :', JSON.stringify(gabungan.stats))

/* ── Simulasi kirim plugin (Thread-olah X dibahas di atas). ── */
const pesan = []
const conn = {
  sendMessage: async (chat, payload) => {
    pesan.push(payload.video ? 'VIDEO' : payload.image ? 'IMAGE' : 'TEXT')
    return { key: {} }
  },
}
const m = { chat: '123@c.us', sender: '456@s.whatsapp.net', raw: { key: { id: 'Z' } }, limit: { fail() {}, success() {} } }

const simHandler = async (r) => {
  let terkirim = 0
  if (r.type === 'video' && r.media.video) {
    const { buffer } = await fetchBuffer(r.media.video, { maxBytes: 1024 * 1024, headers: { Referer: 'https://x.com/' } })
    await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: r.text }, { quoted: m.raw })
    terkirim++
  } else if (r.media.items?.length) {
    for (const u of r.media.gambar.map((m) => m.url).slice(0, 5)) {
      let buffer = null
      try {
        buffer = (await fetchBuffer(u, { maxBytes: 1024 * 1024, headers: { Referer: 'https://x.com/' } })).buffer
      } catch (e) {
        if (e?.message?.includes('404')) continue
        throw e
      }
      await conn.sendMessage(m.chat, { image: buffer, mimetype: 'image/jpeg', caption: r.text }, { quoted: m.raw })
      terkirim++
    }
  }
  return terkirim
}

(async () => {
  const kirim = await simHandler(gabungan)
  console.log('simulasi kirim →', pesan.join(','), '| jumlah:', kirim)
})().catch((e) => { console.error('SIM-ERR', e); process.exit(1) })
