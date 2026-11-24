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

import crypto from 'node:crypto'

function normalizeCell(value) {
  return String(value ?? '')
}

function normalizeRows(headers, rows) {
  const maxLen = Math.max(
    headers.length,
    ...rows.map((row) => Array.isArray(row) ? row.length : 0),
  )

  const normalize = (row) => [
    ...(Array.isArray(row) ? row : [row]),
    ...Array(Math.max(0, maxLen - (Array.isArray(row) ? row.length : 1))).fill(''),
  ].map(normalizeCell)

  const normalizedHeaders = normalize(headers)

  const unifiedRows = [
    {
      is_header: true,
      cells: normalizedHeaders,
    },
    ...rows.map((row) => ({
      is_header: false,
      cells: normalize(row),
    })),
  ]

  return {
    rows: unifiedRows.map((row) => ({
      items: row.cells,
      ...(row.is_header ? { isHeading: true } : {}),
    })),
    unifiedRows,
  }
}

function buildSection(data) {
  return {
    view_model: {
      primitive: data,
      __typename: 'GenAISingleLayoutViewModel',
    },
  }
}

function buildTextPrimitive(text, type = 'GenAIMetadataTextPrimitive') {
  return buildSection({
    text: String(text),
    __typename: type,
  })
}

function buildTablePrimitive(unifiedRows) {
  return buildSection({
    rows: unifiedRows,
    __typename: 'GenATableUXPrimitive',
  })
}

function buildContextInfo(quoted) {
  if (!quoted) return {}

  const key = quoted?.key || {}

  return {
    stanzaId: key.id || quoted?.id,
    participant: key.participant || key.remoteJid || quoted?.participant,
    quotedType: 0,
    quotedMessage: quoted?.message ?? quoted,
  }
}

export function buildNativeRichTable({
  title = '',
  headers = [],
  rows = [],
  headerText = '',
  footer = '',
  quoted = null,
  botJid = '867051314767696@bot',
  responseId = crypto.randomUUID(),
} = {}) {
  if (!Array.isArray(headers) || !headers.length) {
    throw new TypeError('Headers harus berupa array yang tidak kosong')
  }

  if (!Array.isArray(rows)) {
    throw new TypeError('Rows harus berupa array')
  }

  const normalizedHeaders = headers.map(normalizeCell)
  const normalizedRows = rows.map((row) => (
    Array.isArray(row) ? row.map(normalizeCell) : [normalizeCell(row)]
  ))

  const table = normalizeRows(normalizedHeaders, normalizedRows)

  const sections = [
    ...(headerText ? [buildTextPrimitive(headerText)] : []),
    buildTablePrimitive(table.unifiedRows),
    ...(footer ? [buildTextPrimitive(footer)] : []),
  ]

  return {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: String(title),
        richResponseSourcesMetadata: {
          sources: [],
        },
      },
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [
            ...(headerText
              ? [{
                  messageType: 2,
                  messageText: String(headerText),
                }]
              : []),
            {
              messageType: 4,
              tableMetadata: {
                title: String(title),
                rows: table.rows,
              },
            },
          ],
          unifiedResponse: {
            data: Buffer.from(
              JSON.stringify({
                response_id: responseId,
                sections,
              })
            ).toString('base64'),
          },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: {
              botJid,
            },
            forwardOrigin: 4,
            ...buildContextInfo(quoted),
          },
        },
      },
    },
  }
}

export async function sendNativeRichTable(
  conn,
  jid,
  title,
  headers,
  rows,
  quoted = null,
  options = {},
) {
  if (!conn?.relayMessage) {
    throw new TypeError('Connection relayMessage tidak tersedia')
  }

  const message = buildNativeRichTable({
    title,
    headers,
    rows,
    headerText: options.headerText || '',
    footer: options.footer || '',
    quoted,
    botJid: options.botJid || '867051314767696@bot',
  })

  return conn.relayMessage(jid, message, {})
}

export default {
  buildNativeRichTable,
  sendNativeRichTable,
}
