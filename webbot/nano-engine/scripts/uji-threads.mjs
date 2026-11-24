import { threadsDL, fetchPermalink } from '../lib/threads.js'

const akun = ['@nasa', '@natgeo', '@instagram', '@threads', '@guardian', '@bbcnews', '@tabornews']
const hasil = { image: 0, carousel: 0, video: 0, text: 0, err: 0 }

for (const a of akun) {
  if (hasil.image + hasil.carousel >= 2) break
  let codes = []
  try {
    const h = await fetchPermalink({ permalink: `https://www.threads.com/${a}` })
    codes = [...new Set((h.match(/post\/[A-Za-z0-9_-]{8,}/g) || []).map((s) => s.split('/')[1]))].slice(0, 8)
  } catch (e) {
    console.log('  profil gagal', a, e.message.slice(0, 50))
    continue
  }

  for (const c of codes) {
    try {
      const r = await threadsDL(`https://www.threads.com/${a}/post/${c}`)
      hasil[r.type] = (hasil[r.type] || 0) + 1
      if (r.type === 'image' || r.type === 'carousel') {
        console.log(`FOUND ${a}/${c} type=${r.type} items=${r.counts.items} imgs=${r.counts.images}`)
        console.log('  url:', JSON.stringify(r.url).slice(0, 400))
      }
    } catch (e) {
      hasil.err += 1
      if (hasil.err <= 3) console.log('  ERR', `${a}/post/${c}`, '->', e.message.slice(0, 90))
    }
    if (hasil.image + hasil.carousel >= 2) break
  }
}
console.log('REKAP:', JSON.stringify(hasil))
