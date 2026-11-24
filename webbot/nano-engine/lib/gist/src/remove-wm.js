import axios from "axios"
import fs from "node:fs"
import path from "node:path"

const INPUT = "/home/container/assets/istockphoto.jpg"

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"
const ORIGIN = "https://ezremove.ai"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getMime(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  return "application/octet-stream"
}

function output(status, data = {}) {
  console.log(JSON.stringify({
    Status: status,
    Code: data.Code || 500,
    Input: INPUT,
    Result_url: data.Result_url || null
  }, null, 2))
}

async function removeWatermark(filePath) {
  const filename = path.basename(filePath)
  const buffer = fs.readFileSync(filePath)
  const mime = getMime(filePath)
  const boundary = `----FormBoundary${Math.random().toString(36).slice(2)}`

  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ])

  const create = await axios.post(
    "https://api.ezremove.ai/api/ez-remove/watermark-remove/create-job",
    body,
    {
      headers: {
        "User-Agent": UA,
        "Accept": "application/json, text/plain, */*",
        "Origin": ORIGIN,
        "Referer": `${ORIGIN}/`,
        "product-serial": `sr-${Date.now()}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length
      },
      timeout: 30000,
      validateStatus: () => true,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  )

  if (create.status < 200 || create.status >= 300) {
    throw {
      code: create.status
    }
  }

  const jobId = create.data?.result?.job_id

  if (!jobId) {
    throw {
      code: create.status
    }
  }

  for (let i = 0; i < 30; i++) {
    await sleep(2000)

    const check = await axios.get(
      `https://api.ezremove.ai/api/ez-remove/watermark-remove/get-job/${jobId}`,
      {
        headers: {
          "User-Agent": UA,
          "Accept": "application/json, text/plain, */*",
          "Origin": ORIGIN,
          "Referer": `${ORIGIN}/`,
          "product-serial": `sr-${Date.now()}`
        },
        timeout: 15000,
        validateStatus: () => true
      }
    )

    if (check.status < 200 || check.status >= 300) {
      throw {
        code: check.status
      }
    }

    const resultUrl = check.data?.result?.output?.[0]

    if (check.data?.code === 100000 && resultUrl) {
      return resultUrl
    }

    if (check.data?.code !== 300001) {
      throw {
        code: check.status
      }
    }
  }

  throw {
    code: 202
  }
}

removeWatermark(INPUT).then(resultUrl => {
  output(true, {
    Code: 200,
    Result_url: resultUrl
  })
}).catch(err => {
  output(false, {
    Code: err.code || 500
  })
})