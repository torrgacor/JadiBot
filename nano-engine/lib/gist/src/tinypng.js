import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { CookieJar } from 'tough-cookie'
import makeFetchCookie from 'fetch-cookie'

const jar = new CookieJar()
const fetch = makeFetchCookie(globalThis.fetch, jar)

async function tinyPng(image) {
  await fetch('https://tinypng.com/', {
    headers: {
      'user-agent': 'Mozilla/5.0',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  })

  const buffer = await readFile(image)

  const mime = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif'
  }[extname(image).toLowerCase()]

  if (!mime) throw new Error('Unsupported image')

  const upload = await fetch('https://tinypng.com/backend/opt/store', {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/octet-stream',
      origin: 'https://tinypng.com',
      referer: 'https://tinypng.com/',
      'user-agent': 'Mozilla/5.0'
    },
    body: buffer
  })

  if (!upload.ok) throw new Error(await upload.text())

  const uploaded = await upload.json()

  const processRes = await fetch('https://tinypng.com/backend/opt/process', {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      origin: 'https://tinypng.com',
      referer: 'https://tinypng.com/',
      'user-agent': 'Mozilla/5.0'
    },
    body: JSON.stringify({
      key: uploaded.key,
      originalType: mime,
      originalSize: buffer.length
    })
  })

  if (!processRes.ok) throw new Error(await processRes.text())

  const result = await processRes.json()

  return {
    status: processRes.ok,
    code: processRes.status,
    input: image,
    result_url: result.url
  }
}

const result = await tinyPng('/home/container/1768576831331.png')

console.log(result)