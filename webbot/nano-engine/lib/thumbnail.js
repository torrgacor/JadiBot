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
┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
┇
┇🔸Penyiapan thumbnail kepala tombol 1:1.
⌬
*/

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSET_IMAGE_DIR = path.join(__dirname, '..', 'assets', 'image')

/* Sumber gambar: Buffer, nama berkas di assets/image, path apa pun, atau URL. */
async function muatGambar(image) {
  if (Buffer.isBuffer(image)) return image.length ? image : null
  if (typeof image !== 'string' || !image.trim()) return null

  const sumber = image.trim()
  if (/^https?:\/\//i.test(sumber)) {
    try {
      const res = await fetch(sumber)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      return buffer.length ? buffer : null
    } catch {
      return null
    }
  }

  /* nama berkas polos ('awang.jpg') dicari di assets/image dulu; path relatif
     ber-direktori tetap dicoba apa adanya supaya pemanggil lama ikut jalan */
  const kandidat = path.isAbsolute(sumber)
    ? [sumber]
    : [path.join(ASSET_IMAGE_DIR, sumber), path.resolve(sumber)]

  for (const lokal of kandidat) {
    try {
      return await fs.readFile(lokal)
    } catch { /* coba kandidat berikutnya */ }
  }

  console.log(`  \x1b[31m✗\x1b[0m  Thumbnail tidak ditemukan: ${kandidat[0]}`)
  return null
}

/* Rata-rata warna baris paling atas + paling bawah. */
async function warnaTepiGambar(buffer, lebar, tinggi) {
  try {
    const baris = async (top) =>
      await sharp(buffer)
        .extract({ left: 0, top, width: lebar, height: 1 })
        .resize(1, 1, { fit: 'fill' })
        .raw()
        .toBuffer()

    const [atas, bawah] = await Promise.all([baris(0), baris(tinggi - 1)])
    return {
      r: Math.round((atas[0] + bawah[0]) / 2),
      g: Math.round((atas[1] + bawah[1]) / 2),
      b: Math.round((atas[2] + bawah[2]) / 2),
    }
  } catch {
    return { r: 0, g: 0, b: 0 }
  }
}

/*
 * Siapkan thumbnail kepala tombol.
 *
 * `size` adalah LEBAR hasil, `rasio` menentukan tinggi (tinggi = size / rasio).
 * Default 1 → persegi, dipakai untuk header lokasi (jpegThumbnail 300px).
 *
 * Untuk header GAMBAR kartu, WhatsApp menampilkan gambar pada rasio yang lebih
 * lebar dari persegi (±1.91:1) dan memotong bagian yang berlebih. Dulu gambar
 * selalu dipaskan ke kotak 1:1 lebih dulu, jadi awang.jpg (1280x721) menghasilkan
 * kanvas 1024x1024 dengan bar gelap 224px di atas & bawah — lalu saat WhatsApp
 * memotongnya ke 1.91:1, bagian atas gambar ikut terpotong.
 *
 * Sekarang pemanggil bisa langsung meminta kanvas pada rasio header (1.91),
 * sehingga gambar utuh masuk dan tidak ada bagian yang hilang. Sisa ruang tetap
 * diisi warna tepi gambar itu sendiri supaya latarnya tidak mencolok.
 */
export async function siapkanThumbnail(image, size = 300, rasio = 1) {
  const raw = await muatGambar(image)
  if (!raw) return null

  const lebarTarget = Math.max(1, Math.round(size))
  const tinggiTarget = Math.max(1, Math.round(size / (rasio > 0 ? rasio : 1)))

  try {
    const meta = await sharp(raw).metadata()
    const lebar = meta.width || 0
    const tinggi = meta.height || 0
    if (!lebar || !tinggi) return null

    /* sudah pas ukuran & rasio dan JPEG: pakai apa adanya supaya tidak di-encode ulang */
    if (lebar === lebarTarget && tinggi === tinggiTarget && meta.format === 'jpeg') return raw

    const skala = Math.min(lebarTarget / lebar, tinggiTarget / tinggi)
    const lebarIsi = Math.max(1, Math.round(lebar * skala))
    const tinggiIsi = Math.max(1, Math.round(tinggi * skala))

    const isi = await sharp(raw).resize(lebarIsi, tinggiIsi, { fit: 'fill' }).png().toBuffer()
    const latar = await warnaTepiGambar(raw, lebar, tinggi)

    return await sharp({
      create: { width: lebarTarget, height: tinggiTarget, channels: 3, background: latar },
    })
      .composite([
        {
          input: isi,
          left: Math.round((lebarTarget - lebarIsi) / 2),
          top: Math.round((tinggiTarget - tinggiIsi) / 2),
        },
      ])
      .jpeg({ quality: 82, chromaSubsampling: '4:2:0' })
      .toBuffer()
  } catch {
    try {
      return await sharp(raw)
        .resize(lebarTarget, tinggiTarget, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 82, chromaSubsampling: '4:2:0' })
        .toBuffer()
    } catch {
      return null
    }
  }
}

export default { siapkanThumbnail }
