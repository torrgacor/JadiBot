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

import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

export async function fetchBuffer(url, {
  timeout = 60000,
  maxBytes = 20 * 1024 * 1024,
  headers = {},
} = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength > maxBytes) {
      throw new Error(
        `Ukuran file terlalu besar (${Math.ceil(declaredLength / 1024 / 1024)} MB).`
      )
    }

    const reader = response.body?.getReader()
    if (!reader) {
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length > maxBytes) throw new Error('Ukuran file melebihi batas yang diizinkan.')
      return { buffer, contentType: response.headers.get('content-type') || '' }
    }

    const chunks = []
    let total = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => {})
        throw new Error('Ukuran file melebihi batas yang diizinkan.')
      }

      chunks.push(Buffer.from(value))
    }

    return {
      buffer: Buffer.concat(chunks, total),
      contentType: response.headers.get('content-type') || '',
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request melebihi batas waktu ${Math.ceil(timeout / 1000)} detik.`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/*
  Ambil nama berkas dari header content-disposition
  (mis. attachment;filename="Film [1080P].mp4").
*/
function namaDariDisposition(disposition) {
  const teks = String(disposition || '')
  if (!teks) return ''

  const berbintang = teks.match(/filename\*\s*=\s*[^']*'[^']*'([^;]+)/i)
  if (berbintang) {
    try {
      return decodeURIComponent(berbintang[1].trim())
    } catch {
      return berbintang[1].trim()
    }
  }

  const biasa = teks.match(/filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i)
  return (biasa?.[1] || biasa?.[2] || '').trim()
}

/*
  Unduh langsung ke berkas sementara, bukan ke RAM.

  Dipakai untuk berkas besar (video ratusan MB): `fetchBuffer` menampung
  seluruh isinya di memori, dan itu tidak muat di server bot ini. Pemanggil
  WAJIB menghapus berkas hasilnya setelah dipakai.

  Kalau server sudah menyebut ukurannya dan melebihi `maxBytes`, unduhan tidak
  dimulai sama sekali — errornya bertanda `code: 'toobig'` beserta `bytes`.
*/
export async function fetchToFile(url, {
  timeout = 180000,
  maxBytes = 1024 * 1024 * 1024,
  headers = {},
  prefix = 'nano',
  /* Dipanggil begitu ukuran berkas diketahui dari header server — dipakai
     untuk mengabari pengguna kalau unduhannya bakal lama. */
  onMulai = null,
} = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  let target = null

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength > maxBytes) {
      const error = new Error(
        `Ukuran berkas ${Math.ceil(declaredLength / 1024 / 1024)} MB melebihi batas ${Math.ceil(maxBytes / 1024 / 1024)} MB.`
      )
      error.code = 'toobig'
      error.bytes = declaredLength
      throw error
    }

    if (onMulai) {
      try {
        await onMulai({ bytes: declaredLength, contentType: response.headers.get('content-type') || '' })
      } catch {
        /* kabar ke pengguna gagal — unduhannya tetap jalan */
      }
    }

    target = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${crypto.randomBytes(5).toString('hex')}`)

    let total = 0
    const penghitung = new Transform({
      transform(chunk, _encoding, callback) {
        total += chunk.length
        if (total > maxBytes) {
          const error = new Error(`Ukuran berkas melebihi batas ${Math.ceil(maxBytes / 1024 / 1024)} MB.`)
          error.code = 'toobig'
          error.bytes = total
          callback(error)
          return
        }
        callback(null, chunk)
      },
    })

    const sumber = response.body ? Readable.fromWeb(response.body) : Readable.from([])
    await pipeline(sumber, penghitung, fs.createWriteStream(target))

    return {
      file: target,
      bytes: total,
      contentType: response.headers.get('content-type') || '',
      fileName: namaDariDisposition(response.headers.get('content-disposition')),
    }
  } catch (error) {
    if (target) await fs.remove(target).catch(() => {})
    if (error?.name === 'AbortError') {
      throw new Error(`Request melebihi batas waktu ${Math.ceil(timeout / 1000)} detik.`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export default { fetchBuffer, fetchToFile }
