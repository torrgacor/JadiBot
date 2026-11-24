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


/* Penerapan fitur otomatis ke setiap pesan masuk.
   Dipanggil dari router-pesan (bukan listener messages.upsert sendiri)
   supaya urutan kejadian tetap satu: router sudah menyaring pesan status,
   pesan bot sendiri, dan pesan yang diblokir Antilink. */

import { emojiUntukReaksi, getOtomatisStatus } from './otomatis.js'

/* Presence "composing" tidak boleh menggantung selamanya kalau bot
   ternyata tidak membalas. Presence yang menggantung dibersihkan otomatis
   oleh WA sekitar 25 detik, tapi kita tetap mengirim "paused" supaya
   indikator mengetik hilang tepat saat balasan keluar. */
const TIMER_PAUSED = 20_000
const timerPresence = new Map()

export async function mulaiTyping(conn, chat) {
  if (!chat || !conn?.sendPresenceUpdate) return
  try {
    await conn.sendPresenceUpdate('composing', chat)
  } catch {
    return
  }
  const sebelumnya = timerPresence.get(chat)
  if (sebelumnya) clearTimeout(sebelumnya)
  timerPresence.set(
    chat,
    setTimeout(() => {
      timerPresence.delete(chat)
      void conn.sendPresenceUpdate?.('paused', chat).catch(() => {})
    }, TIMER_PAUSED)
  )
}

export async function selesaiTyping(conn, chat) {
  const timer = timerPresence.get(chat)
  if (!timer) return
  clearTimeout(timer)
  timerPresence.delete(chat)
  try {
    await conn.sendPresenceUpdate?.('paused', chat)
  } catch {
    // kosmetik saja
  }
}

/* Tandai sudah dibaca. Di grup WA, readMessages butuh participant: tanpa
   itu WhatsApp diam-diam mengabaikannya sehingga centang biru tidak
   pernah muncul. */
export async function tandaiTerbaca(conn, raw, { chat, isSelf }) {
  if (isSelf || !raw?.key?.id) return
  try {
    await conn.readMessages([
      {
        remoteJid: chat,
        id: raw.key.id,
        fromMe: false,
        ...(raw.key.participant ? { participant: raw.key.participant } : {}),
      },
    ])
  } catch {
    // best-effort
  }
}

export async function beriReaksi(conn, raw, { chat, isSelf, emoji }) {
  if (isSelf || !raw?.key?.id) return
  try {
    await conn.sendMessage(chat, {
      react: { text: emojiUntukReaksi(emoji), key: raw.key },
    })
  } catch {
    // best-effort
  }
}

/* Satu pintu masuk: dipanggil sekali per pesan masuk. Membaca status
   sekali saja supaya tidak ada query berulang dalam satu pesan. */
export async function jalankanOtomatis(conn, raw, konteks) {
  const status = getOtomatisStatus()
  if (!status.typing && !status.read && !status.react) return

  if (status.read) await tandaiTerbaca(conn, raw, konteks)
  if (status.react) await beriReaksi(conn, raw, { ...konteks, emoji: status.emoji })
  /* Presence "composing" untuk pesan bot sendiri tidak pernah berguna —
     pengirimnya adalah bot itu sendiri, jadi tidak ada yang melihat
     "sedang mengetik". Lewati agar tidak menambah lalu lintas jaringan yang sia-sia. */
  if (status.typing && !konteks.isSelf) await mulaiTyping(conn, konteks.chat)
}

export default { mulaiTyping, selesaiTyping, tandaiTerbaca, beriReaksi, jalankanOtomatis }
