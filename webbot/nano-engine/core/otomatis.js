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


/* Otomatis: typing · read · react
   Tiga "perilaku manusiawi" yang bisa dinyalakan owner satu per satu:

     typing  saat pesan masuk, bot mengirim presence "composing" supaya
             di HP user terlihat "sedang mengetik…", lalu "paused" begitu
             balasan dikirim. Tanpa ini bot kelihatan tidak merespons.
     read    menandai pesan sebagai sudah dibaca (centang biru) memakai
             readMessages. Di grupWA butuh participant juga, karena
             kunci tandai-baca tersusun dari (grup, id pesan, pengirim).
     react   membalas pesan dengan reaction emoji acak, atau emoji tetap
             kalau owner mengaturnya.

   Semua status disimpan di SQLite (satu baris id=1) supaya tetap berlaku
   setelah bot restart — sama seperti anticall_status.

   Ketiganya murni kosmetik: kegagalan tidak boleh menggagalkan pemrosesan
   pesan, jadi setiap panggilan dibungkus try/catch senyap. */

import { getDb } from './sqlite.js'

export const FITUR = ['typing', 'read', 'react']

/* Reaction acak dipakai kalau owner tidak menetapkan emoji tetap.
   Dipilih sekecil mungkin supaya tidak terasa botmachine. */
const EMOJI_ACAK = ['👍', '❤️', '😂', '🙏', '🔥', '✅', '😍', '👏']

export function getOtomatisStatus() {
  const db = getDb()
  const row = db.prepare('SELECT typing, read, react, emoji FROM auto_status WHERE id = 1').get()
  return {
    typing: !!row?.typing,
    read: !!row?.read,
    react: !!row?.react,
    emoji: row?.emoji || '',
  }
}

/* Naikkan satu fitur. Nilai `null` berarti biarkan apa adanya, jadi
   pemanggil bisa menyimpan status tanpa menentukan kelimanya. */
export function setOtomatisStatus(patch) {
  const db = getDb()
  const sekarang = getOtomatisStatus()
  const berikut = {
    typing: patch.typing === undefined || patch.typing === null ? sekarang.typing : !!patch.typing,
    read: patch.read === undefined || patch.read === null ? sekarang.read : !!patch.read,
    react: patch.react === undefined || patch.react === null ? sekarang.react : !!patch.react,
    emoji: patch.emoji === undefined || patch.emoji === null ? sekarang.emoji : patch.emoji,
  }
  db.prepare(
    `INSERT INTO auto_status (id, typing, read, react, emoji) VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       typing = excluded.typing,
       read   = excluded.read,
       react  = excluded.react,
       emoji  = excluded.emoji`
  ).run(berikut.typing ? 1 : 0, berikut.read ? 1 : 0, berikut.react ? 1 : 0, berikut.emoji || null)
  return berikut
}

export function emojiUntukReaksi(emojiTetap = '') {
  const tetap = String(emojiTetap || '').trim()
  if (tetap) return tetap
  return EMOJI_ACAK[Math.floor(Math.random() * EMOJI_ACAK.length)]
}

export default { FITUR, getOtomatisStatus, setOtomatisStatus, emojiUntukReaksi }
