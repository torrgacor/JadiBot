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
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import crypto from 'crypto'
import { siapkanThumbnail } from './thumbnail.js'
import { promoLine } from '../core/identitas.js'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  proto,
} from '@whiskeysockets/baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSET_IMAGE_DIR = path.join(__dirname, '..', 'assets', 'image')

/* Link promosi (settings.links.promo) ditempel di footer pesan tombol.
   Dilewati kalau footernya sudah memuatnya (mis. dari creatorWatermark). */
function footerDenganPromo(footer) {
  const promo = promoLine()
  const teks = typeof footer === 'string' ? footer : ''
  if (!promo || teks.includes(promo)) return teks
  return teks ? `${teks}\n\n${promo}` : promo
}

function toQuickReplyButton(btn) {
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: btn.label,
      id: btn.command || btn.id || `noop_${crypto.randomUUID()}`,
    }),
  }
}

function toUrlButton(btn) {
  return {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({
      display_text: btn.label,
      url: btn.url,
      merchant_url: btn.merchantUrl || btn.url,
    }),
  }
}

function toCopyButton(btn) {
  return {
    name: 'cta_copy',
    buttonParamsJson: JSON.stringify({
      display_text: btn.label,
      id: btn.id || crypto.randomUUID(),
      copy_code: btn.copyCode || '',
    }),
  }
}

function toRawNativeButton(btn) {
  if (!btn?.name) throw new TypeError('Raw native button requires a name')
  return {
    name: btn.name,
    buttonParamsJson: typeof btn.paramsJson === 'string' ? btn.paramsJson : JSON.stringify(btn.params || {}),
  }
}

/* ButtonV2 (kontainer `buttonsMessage`) → tombol native flow.
   Tombol CTA (cta_url) & list (single_select) WAJIB lewat bentuk ini. */
function toNativeFlowButton(btn) {
  const flow = btn?.nativeFlowInfo
  if (flow?.name) {
    return {
      name: flow.name,
      buttonParamsJson: typeof flow.paramsJson === 'string'
        ? flow.paramsJson
        : JSON.stringify(flow.params || {}),
    }
  }
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: btn?.buttonText?.displayText || '',
      id: btn?.buttonId || `noop_${crypto.randomUUID()}`,
    }),
  }
}

/* WhatsApp hanya merender 3 tombol per kartu — lebih dari itu ditolak/
   dianggap tidak didukung, jadi kelebihannya dilaporkan supaya ketahuan. */
function ingatkanKuotaTombol(buttons, asal) {
  if (buttons.length <= 3) return
  console.log(`  \x1b[33m⚠\x1b[0m  Kartu ${asal} berisi ${buttons.length} tombol — WhatsApp hanya merender 3.`)
}

function toListButton({ listTitle = 'Pilih Menu', sections = [] }) {
  return {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: listTitle,
      sections: sections.map((section) => ({
        title: section.title,
        ...(section.highlightLabel ? { highlight_label: section.highlightLabel } : {}),
        rows: section.rows.map((row) => ({
          header: row.header || '',
          title: row.title,
          description: row.description || '',
          id: row.command,
        })),
      })),
    }),
  }
}

async function resolveImageBuffer(image) {
  if (!image) return null

  let rawBuffer

  if (Buffer.isBuffer(image)) {
    rawBuffer = image
  } else if (/^https?:\/\//i.test(image)) {
    return null
  } else {
    const localPath = path.isAbsolute(image) ? image : path.join(ASSET_IMAGE_DIR, image)
    if (!(await fs.pathExists(localPath))) return null
    rawBuffer = await fs.readFile(localPath)
  }

  try {
    return await sharp(rawBuffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
  } catch {
    return rawBuffer
  }
}

function isImageUrl(image) {
  return typeof image === 'string' && /^https?:\/\//i.test(image)
}

async function resolveDocumentBuffer(document) {
  if (!document) return null
  if (Buffer.isBuffer(document)) return document
  if (/^https?:\/\//i.test(document)) return null
  const localPath = path.isAbsolute(document) ? document : path.resolve(document)
  if (!(await fs.pathExists(localPath))) return null
  try {
    return await fs.readFile(localPath)
  } catch {
    return null
  }
}

function buildContextInfo({ mentions = [], quoted, extra = {} } = {}) {
  const contextInfo = { ...extra }

  if (mentions.length) {
    contextInfo.mentionedJid = mentions
  }

  if (quoted?.key && quoted?.message) {
    contextInfo.stanzaId = quoted.key.id
    contextInfo.participant = quoted.key.participant || quoted.key.remoteJid
    contextInfo.quotedMessage = quoted.message
    contextInfo.remoteJid = quoted.key.remoteJid
    contextInfo.fromMe = Boolean(quoted.key.fromMe)
  }

  return contextInfo
}

function buildAdditionalNodes(jid) {
  const isGroup = jid.endsWith('@g.us')

  const interactiveNode = {
    tag: 'biz',
    attrs: {},
    content: [
      {
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
      },
    ],
  }

  return [interactiveNode]
}

async function relayGenerated(conn, jid, content, sendOptions = {}) {
  const messageContent = content?.interactiveMessage
    ? {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: content.interactiveMessage,
          },
        },
      }
    : content

  const generatedMessage = generateWAMessageFromContent(jid, messageContent, {
    userJid: conn.user.id,
    quoted: sendOptions.quoted,
  })

  return conn.relayMessage(jid, generatedMessage.message, {
    messageId: generatedMessage.key.id,
    additionalNodes: buildAdditionalNodes(jid),
  })
}

async function sendStyleV1(conn, jid, options, sendOptions) {
  const { title = '', subtitle = '', body = '', footer = '', image, document, documentFileName = 'Nano-Ai', documentMimetype = 'application/octet-stream', documentThumbnail, buttons = [], list, mentions = [] } = options
  const footerPromo = footerDenganPromo(footer)

  const nativeButtons = [
    ...(list ? [toListButton(list)] : []),
    ...buttons.map((button) => {
      if (button.type === 'url') return toUrlButton(button)
      if (button.type === 'copy') return toCopyButton(button)
      if (button.type === 'noop') return toQuickReplyButton(button)
      if (button.type === 'raw') return toRawNativeButton(button)
      return toQuickReplyButton(button)
    }),
    ...(options.urlButtons || []).map(toUrlButton),
    ...(options.rawButtons || []).map(toRawNativeButton),
  ]

  /*
   * Promo TIDAK memakai tombol — cukup baris teks di footer (lihat
   * footerDenganPromo di atas), supaya tombol yang ada murni tombol fitur.
   */
  ingatkanKuotaTombol(nativeButtons, 'tombol')

  const urlMode = isImageUrl(image)
  const imageBuffer = urlMode ? null : await resolveImageBuffer(image)
  const documentBuffer = await resolveDocumentBuffer(document)
  let headerMedia = {}

  if (documentBuffer) {
    const preparedDocument = await prepareWAMessageMedia(
      { document: documentBuffer, mimetype: documentMimetype, fileName: documentFileName },
      { upload: conn.waUploadToServer }
    )
    const documentMessage = preparedDocument?.documentMessage
    if (documentMessage) {
      documentMessage.mimetype = documentMimetype
      documentMessage.fileName = documentFileName
      const thumbnailBuffer = await resolveImageBuffer(documentThumbnail || image)
      if (thumbnailBuffer) {
        documentMessage.jpegThumbnail = await sharp(thumbnailBuffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true, position: 'centre' })
          .jpeg({ quality: 68, chromaSubsampling: '4:2:0', mozjpeg: true })
          .toBuffer()
      }
      headerMedia = preparedDocument
    }
  } else if (imageBuffer) {
    headerMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer })
  }

  const contextInfo = buildContextInfo({
    mentions,
    quoted: sendOptions.quoted,
    extra: urlMode
      ? {
          externalAdReply: {
            title,
            body: footer.slice(0, 60),
            thumbnailUrl: image,
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        }
      : {},
  })

  return relayGenerated(conn, jid, {
    interactiveMessage: proto.Message.InteractiveMessage.create({
      header: proto.Message.InteractiveMessage.Header.create({
        title,
        subtitle,
        hasMediaAttachment: Boolean(imageBuffer || headerMedia?.documentMessage || headerMedia?.imageMessage),
        ...headerMedia,
      }),
      body: proto.Message.InteractiveMessage.Body.create({ text: body }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: footerPromo }),
      contextInfo,
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: nativeButtons,
        messageParamsJson: '{}',
      }),
    }),
  }, sendOptions)
}

export async function sendInteractive(conn, jid, options = {}, sendOptions = {}) {
  try {
    return await sendStyleV1(conn, jid, options, sendOptions)
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m  Gagal kirim menu: ${err?.message || err}`)
    try {
      return await conn.sendMessage(
        jid,
        { text: options.body || options.footer || options.title || '', mentions: options.mentions || [] },
        sendOptions
      )
    } catch (fallbackError) {
      console.log(`  \x1b[31m✗\x1b[0m  Fallback kirim menu gagal: ${fallbackError?.message || fallbackError}`)
      throw fallbackError
    }
  }
}

class BaseBuilder {
  constructor() {
    this._title = ''
    this._subtitle = ''
    this._body = ''
    this._footer = ''
    this._contextInfo = {}
    this._extraPayload = {}
  }

  setTitle(title) {
    if (typeof title !== 'string') throw new TypeError('Title must be a string')
    this._title = title
    return this
  }

  setSubtitle(subtitle) {
    if (typeof subtitle !== 'string') throw new TypeError('Subtitle must be a string')
    this._subtitle = subtitle
    return this
  }

  setBody(body) {
    if (typeof body !== 'string') throw new TypeError('Body must be a string')
    this._body = body
    return this
  }

  setFooter(footer) {
    if (typeof footer !== 'string') throw new TypeError('Footer must be a string')
    this._footer = footer
    return this
  }

  setContextInfo(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('ContextInfo must be a plain object')
    }
    this._contextInfo = obj
    return this
  }

  addPayload(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('Payload must be a plain object')
    }
    Object.assign(this._extraPayload, obj)
    return this
  }

  static async resize(buffer, x, y, fit = 'cover') {
    return await sharp(buffer)
      .resize(x, y, {
        fit,
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()
  }

  static async fetchBuffer(url, options = {}, config = {}) {
    try {
      let response = await fetch(url, options)
      if (!response.ok) throw Error(`HTTP ${response.status}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      if (config.silent) return Buffer.alloc(0)
      throw error
    }
  }
}

/* Rasio kepala GAMBAR kartu di WhatsApp. Gambar dirender lebih lebar dari
   persegi (±1.91:1) dan bagian berlebihnya dipotong, jadi kanvas disiapkan
   langsung pada rasio ini supaya seluruh gambar masuk dan tidak ada bagian
   atas/bawah yang hilang. */
const RASIO_HEADER_GAMBAR = 1.91

/* Thumbnail tombol. `rasio` default 1 (persegi) untuk header lokasi 300px.
   Header gambar memakai rasio 1.91 supaya tidak dipotong WhatsApp. Sisa ruang
   diisi warna tepi gambar itu sendiri, jadi latarnya tidak mencolok. */
async function buatThumbnail(image, size = 300, rasio = 1) {
  return await siapkanThumbnail(image, size, rasio)
}

/* ─
 * Header GAMBAR kartu (diunggah sebagai imageMessage). Disiapkan pada rasio
 * header WhatsApp supaya tidak dipotong; kalau gagal, pemanggil jatuh ke header
 * lokasi (thumbnail 1:1) di bawah.
 */
async function buatHeaderGambar(image, lebar = 1024) {
  return await siapkanThumbnail(image, lebar, RASIO_HEADER_GAMBAR)
}

class ButtonV2 extends BaseBuilder {
  #client

  constructor(client) {
    super()
    if (!client) throw new Error('Socket is required')
    this.#client = client
    this._image
    this._data
    this._buttons = []
  }

  addButton(displayText = '', buttonId = crypto.randomUUID()) {
    this._buttons.push({
      buttonId,
      buttonText: { displayText },
      type: 1,
    })
    return this
  }

  addRawButton(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('Buttons must be a plain object')
    }
    this._buttons.push(obj)
    return this
  }

  setThumbnail(path) {
    if (!path) throw new Error('Url or buffer needed')
    this._image = path
    return this
  }

  setMedia(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('Media must be a plain object')
    }
    this._data = obj
    return this
  }

  async build(jid, { ...options } = {}) {
    let _thumbnail = this._image ? await buatThumbnail(this._image) : null

    const msg = generateWAMessageFromContent(
      jid,
      {
        ...this._extraPayload,
        buttonsMessage: {
          contentText: this._body,
          footerText: footerDenganPromo(this._footer),
          ...(this._data
            ? this._data
            : {
                headerType: 6,
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                  name: this._title,
                  address: this._subtitle,
                  jpegThumbnail: _thumbnail,
                },
              }),
          viewOnce: true,
          contextInfo: this._contextInfo,
          buttons: [...this._buttons],
        },
      },
      { ...options }
    )
    return msg
  }

  /*
   * Tombol native flow (cta_url / single_select) TIDAK dikenali WhatsApp di
   * dalam `buttonsMessage` — kontainer itu hanya menerima quick reply. Kalau
   * dipaksa, WhatsApp menandai SELURUH tombol di kartu itu sebagai tidak
   * didukung (tombol quick reply yang tadinya jalan ikut mati).
   *
   * Jadi begitu satu saja tombolnya native flow, kartu dikirim lewat
   * kontainer yang benar: `interactiveMessage` + `nativeFlowMessage` — sama
   * seperti sendInteractive — dengan header yang identik (lokasi 1:1 maupun
   * media dari setMedia) supaya tampilannya tidak berubah.
   */
  adaTombolNativeFlow() {
    return this._buttons.some((b) => b?.nativeFlowInfo?.name || b?.type === 2)
  }

  async buildInteractive(jid, options = {}) {
    ingatkanKuotaTombol(this._buttons, 'card')

    /*
     * Header gambar biasa: gambar disiapkan sebagai kotak 1:1 (seluruh isi
     * gambar masuk, sisa ruang diisi warna tepinya) ukuran besar lalu
     * diunggah — jadi tampil tajam dan tidak ada bagian yang terpotong.
     * Kalau unggahan gagal, jatuh ke header lokasi (thumbnail 1:1).
     */
    let mediaHeader = {}
    if (this._data) {
      mediaHeader = ['imageMessage', 'documentMessage', 'videoMessage', 'locationMessage'].reduce((acc, key) => {
        if (this._data[key] != null) acc[key] = this._data[key]
        return acc
      }, {})
    } else if (this._image) {
      let besar = null
      try {
        besar = await buatHeaderGambar(this._image)
      } catch {
        besar = null
      }
      if (besar) {
        try {
          mediaHeader = await prepareWAMessageMedia({ image: besar }, { upload: this.#client.waUploadToServer })
        } catch (err) {
          console.log(`  \x1b[33m⚠\x1b[0m  Header gambar kartu gagal diunggah: ${err?.message || err}`)
          mediaHeader = {}
        }
      }
      if (!mediaHeader?.imageMessage) {
        const thumbnail = await buatThumbnail(this._image).catch(() => null)
        if (thumbnail) {
          mediaHeader = {
            locationMessage: {
              degreesLatitude: 0,
              degreesLongitude: 0,
              name: this._title,
              address: this._subtitle,
              jpegThumbnail: thumbnail,
            },
          }
        }
      }
    }

    const contextInfo = buildContextInfo({
      quoted: options?.quoted,
      extra: this._contextInfo && typeof this._contextInfo === 'object' ? this._contextInfo : {},
    })

    return generateWAMessageFromContent(
      jid,
      {
        ...this._extraPayload,
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              header: proto.Message.InteractiveMessage.Header.create({
                title: this._title,
                subtitle: this._subtitle,
                hasMediaAttachment: Object.keys(mediaHeader).length > 0,
                ...mediaHeader,
              }),
              body: proto.Message.InteractiveMessage.Body.create({ text: this._body }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: footerDenganPromo(this._footer) }),
              contextInfo,
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: this._buttons.map(toNativeFlowButton),
                messageParamsJson: '{}',
              }),
            }),
          },
        },
      },
      { ...options }
    )
  }

  async send(jid, { ...options } = {}) {
    if (this._buttons.length < 1) throw new Error('ButtonV2 requires at least one button')

    /* Message mode per-user: tombol/list TIDAK dikirim ke user iOS —
       ganti jadi TEKS BIASA berisi isi yang sama (format kompatibel),
       tanpa quoted. User Android tetap dapat button/list + quoted. */
    try {
      const { modeOfOriginal } = await import('./reply-style.js')
      if (modeOfOriginal(options?.quoted || null) === 'ios') {
        const baris = []
        for (const b of this._buttons) {
          const teks = b?.buttonText?.displayText || b?.title || ''
          const id = b?.buttonId || ''
          if (b?.nativeFlowInfo?.paramsJson) {
            try {
              const params = JSON.parse(b.nativeFlowInfo.paramsJson)
              /* tombol CTA (url): iOS tidak menerima tombolnya, jadi linknya
                 ditulis sebagai baris biasa supaya tetap bisa diketuk */
              if (params?.url) {
                baris.push('', `${teks || '🌐'} → ${params.url}`)
                continue
              }
              /* list native_flow: urai sections → baris perintah */
              for (const section of params?.sections || []) {
                if (section?.title) baris.push('', `📌 ${section.title}`)
                for (const row of section?.rows || []) {
                  if (row?.title) baris.push(`${row?.header ? row.header + ' ' : ''}${row.title} → ${row?.id || ''}`)
                }
              }
              continue
            } catch { /* jatuh ke baris biasa */ }
          }
          if (teks) baris.push('', `${teks} → ${id}`)
        }
        baris.push('', '💡 Ketik perintah di atas langsung di chat.')
        const teksPolos = [this._body?.trim(), footerDenganPromo(this._footer).trim(), ...baris].filter(Boolean).join('\n')
        /* kirim lewat jalur standar (sendMessage) — sama seperti m.reply.
           Kalau client adalah koneksi bergaya, mode iOS user membuatnya
           keluar sebagai teks polos tanpa quoted otomatis. */
        const hasil = await this.#client.sendMessage(jid, { text: teksPolos })
        try {
          const { markBotSent } = await import('./afk.js')
          markBotSent(hasil?.key?.id)
        } catch {}
        return hasil
      }
    } catch (error) {
      /* fallback di bawah tetap berjalan bila pemeriksaan mode gagal */
    }

    const msg = this.adaTombolNativeFlow()
      ? await this.buildInteractive(jid, options)
      : await this.build(jid, options)

    await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
      additionalNodes: [
        {
          tag: 'biz',
          attrs: {},
          content: [
            {
              tag: 'interactive',
              attrs: { type: 'native_flow', v: '1' },
              content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
            },
          ],
        },
      ],
      ...options,
    })
    try {
      const { markBotSent } = await import('./afk.js')
      markBotSent(msg.key.id)
    } catch {}
    return msg
  }
}

export { ButtonV2 }

export default { sendInteractive }