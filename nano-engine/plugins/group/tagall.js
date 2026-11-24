/*
⌬ Nano Ai · Tag All 👥
  Tag seluruh anggota grup dalam bentuk DAFTAR @ berurutan dari atas ke bawah:
     1. @628xxx
     2. @628xxx
     ...
  Semua @ adalah mention asli (notif muncul di tiap HP member).
  Teks setelah command dipakai sebagai judul pesan.
  Participant berbentuk @lid tetap ditampilkan dengan nomor asli 62xxx
  lewat resolvePhoneNumber (peta LID↔nomor), mention tetap ke JID aslinya.
*/

import { resolvePhoneNumber } from '../../lib/cek-akses.js'

const handler = async (m, { conn }) => {
  const metadata = await conn.groupMetadata(m.chat)

  /* daftar participant sesuai urutan di grup (atas → bawah) */
  const participants = metadata.participants.map((p) => p.id)

  /* nomor yang ditampilkan: nomor asli 62 bila bisa di-resolve, else angka jid */
  const tampil = []
  for (const jid of participants) {
    let nomor = ''
    try { nomor = await resolvePhoneNumber(jid, conn, { groupId: m.chat }) } catch {}
    tampil.push(nomor || jid.split('@')[0])
  }

  const judul = (m.text || '').trim() || '📢 Perhatian Semua Anggota!'
  const daftar = participants
    .map((jid, i) => `${i + 1}. @${tampil[i]}`)
    .join('\n')

  await conn.sendMessage(
    m.chat,
    {
      text: `${judul}\n👥 *Total: ${participants.length} member*\n\n${daftar}`,
      mentions: participants,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(tagall|everyone)$/i
handler.help = ['tagall <teks>', 'everyone <teks>']
handler.tags = ['group']
handler.description = 'Tag semua member grup dalam daftar @ dari atas ke bawah'
handler.groupOnly = true

export default handler
