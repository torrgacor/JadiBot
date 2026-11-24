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


import { settings } from '../config/settings.js'

export const CREATOR_NAME = settings.ownerName || 'Awang OfficiaL'
export const PROJECT_NAME = settings.botName || 'Nano Ai'
export const PROJECT_YEAR = settings.footerYear || '2026'
export const PROMO_LINK = String(settings.links?.promo || '').trim()
export const PROMO_LABEL = String(settings.links?.promoLabel || 'Web Jadibot').trim()

/* Satu baris link promosi + keterangannya, untuk ditempel di balasan perintah.
   Kosong berarti tidak ada yang ditempel. */
export function promoLine() {
  if (!PROMO_LINK) return ''
  return PROMO_LABEL ? `🌐 ${PROMO_LABEL}: ${PROMO_LINK}` : `🌐 ${PROMO_LINK}`
}

/* Tempel baris promosi ke satu teks. Dipakai jalur balasan yang TIDAK lewat
   lib/reply-style.js — balasan sistem (sendBotMessage), peringatan
   antilink/anticall, dan fallback teks polos. Kalau teksnya sudah memuat
   linknya, dilewati supaya tidak dobel. */
export function denganPromo(text) {
  const promo = promoLine()
  if (!promo) return text
  if (typeof text !== 'string' || !text.trim()) return text
  if (text.includes(promo)) return text
  return `${text}\n\n${promo}`
}

export function creatorWatermark() {
  const baris = [`© ${PROJECT_YEAR} ${CREATOR_NAME}`]
  const promo = promoLine()
  if (promo) baris.push(promo)
  return baris.join('\n')
}

export default {
  CREATOR_NAME,
  PROJECT_NAME,
  PROJECT_YEAR,
  PROMO_LINK,
  PROMO_LABEL,
  creatorWatermark,
  promoLine,
  denganPromo,
}
