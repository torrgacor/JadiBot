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

import { setUserPremium, isUserPremium } from '../../core/database-user.js'
import { normalizeNumber, resolvePhoneNumber } from '../../lib/cek-akses.js'

function unwrapMessage(message) {
  let current = message || {}
  for (let i = 0; i < 8; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

function getContextInfo(message) {
  const current = unwrapMessage(message)
  return (
    current?.extendedTextMessage?.contextInfo ||
    current?.imageMessage?.contextInfo ||
    current?.videoMessage?.contextInfo ||
    current?.documentMessage?.contextInfo ||
    current?.documentWithCaptionMessage?.message?.contextInfo ||
    current?.contextInfo ||
    null
  )
}

function extractNumber(text) {
  const raw = String(text ?? '').replace(/[,;]/g, ' ')
  const matches = raw.match(/\+?\d[\d\s().-]*\d/g) || []
  for (const candidate of matches) {
    const number = normalizeNumber(candidate)
    if (number.length >= 7 && number.length <= 15) return number
  }
  return null
}

/* Premium disimpan per-JID (sama dengan yang dicek router),
   jadi mention/reply memberi JID paling akurat. Angka → JID standar. */
async function resolveTargetFromMessage(m, conn) {
  const context = getContextInfo(m.raw?.message)
  const mentioned = Array.isArray(context?.mentionedJid) ? context.mentionedJid.filter(Boolean) : []

  if (mentioned.length) {
    return { jid: mentioned[0], source: 'mention' }
  }

  if (context?.participant) {
    return { jid: context.participant, source: 'reply' }
  }

  const number = extractNumber(m.text)
  if (number) {
    return { jid: `${number}@s.whatsapp.net`, number, source: 'number' }
  }

  return null
}

async function displayNumber(jid, conn, chat) {
  try {
    const number = await resolvePhoneNumber(jid, conn, { groupId: chat })
    return number || normalizeNumber(jid) || jid
  } catch {
    return jid
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const target = await resolveTargetFromMessage(m, conn)
  if (!target) {
    await conn.sendMessage(
      m.chat,
      { text: `Cara pakai:\n${usedPrefix}addprem @user\n${usedPrefix}addprem <nomor>\natau reply pesan user dengan ${usedPrefix}addprem` },
      { quoted: m.raw }
    )
    return
  }

  await setUserPremium(target.jid, true)
  const verified = await isUserPremium(target.jid)
  const number = await displayNumber(target.jid, conn, m.chat)

  if (!verified) {
    await conn.sendMessage(
      m.chat,
      { text: `⚠️ Premium dikirim untuk *${number}* tetapi belum terbaca di database. Coba lagi atau cek database sesi.` },
      { quoted: m.raw }
    )
    return
  }

  await conn.sendMessage(
    m.chat,
    {
      text:
        `✅ *Premium berhasil diaktifkan*\n\n` +
        `Nomor: *${number}*\n` +
        `Status: *Premium aktif*\n` +
        `Sumber: *${target.source}*\n\n` +
        `ℹ️ Owner selalu bebas akses perintah premium tanpa flag ini.`,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(addprem|addpremium)$/i
handler.help = ['addprem']
handler.tags = ['owner']
handler.description = 'Mengaktifkan status premium pengguna melalui mention, reply, atau nomor'
handler.ownerOnly = true

export default handler
