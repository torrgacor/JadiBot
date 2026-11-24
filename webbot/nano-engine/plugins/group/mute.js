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

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  requireGroupAdmin,
  displayNumber,
  mentionOf,
  findParticipant,
  getParticipantJid,
  participantIsAdmin,
  isGroupOwnerParticipant,
  sameAsBot,
  isOwner,
  box,
} from '../../lib/grup.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATA_DIR = process.env.NANO_DATA_DIR
  ? path.resolve(process.env.NANO_DATA_DIR)
  : path.join(__dirname, '..', '..', 'data')
const STORE = path.join(DATA_DIR, 'group-mutes.json')

/**
 * State mute disimpan sebagai JSON (bukan SQLite) supaya bisa diedit tanpa
 * restart session — sama seperti store peringatan. Cache 3 detik supaya
 * interceptor `before` tidak membaca disk untuk setiap pesan group; setiap
 * tulisan me-reset cache supaya `.mute` terlihat seketika.
 */
const CACHE_TTL = 3000
const NOTICE_COOLDOWN = 10 * 60 * 1000
let cache = { data: null, at: 0 }
const failureNotices = new Map()

function loadMutes() {
  const now = Date.now()
  if (cache.data && now - cache.at < CACHE_TTL) return cache.data

  let data = {}
  try {
    if (fs.existsSync(STORE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE, 'utf8'))
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed
    }
  } catch {
    data = {}
  }

  cache = { data, at: now }
  return data
}

function saveMutes(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const temp = STORE + '.' + process.pid + '.tmp'
  fs.writeFileSync(temp, JSON.stringify(data, null, 2))
  fs.renameSync(temp, STORE)
  cache = { data, at: Date.now() }
}

const handler = async (m, { rawConn, usedPrefix }) => {
  const action = String(m.command || '').toLowerCase()
  const gate = await requireGroupAdmin(m, rawConn)
  if (!gate.ok) return

  const mutes = loadMutes()
  const active = Boolean(mutes[m.chat])

  if (action === 'mute') {
    if (active) {
      return m.reply(
        box([
          'MUTE GROUP',
          '',
          'Group sudah dalam mode diam.',
          'Pesan member non-admin akan dihapus',
          'dan pengirimnya dikeluarkan.',
          '',
          'Buka kembali: ' + usedPrefix + 'unmute',
        ])
      )
    }

    try {
      await rawConn.groupSettingUpdate(m.chat, 'announcement')
    } catch (err) {
      return m.reply(
        box(['MUTE GAGAL', '', String(err?.message || err).slice(0, 200), '', 'Pastikan bot adalah admin group.'])
      )
    }

    mutes[m.chat] = { by: m.sender, at: Date.now() }
    try {
      saveMutes(mutes)
    } catch (err) {
      delete mutes[m.chat]
      return m.reply('Mode diam aktif tapi gagal disimpan ke disk: ' + String(err?.message || err))
    }

    return m.reply(
      box([
        'MUTE GROUP',
        '',
        'Group ditutup — hanya admin yang bisa bicara.',
        'Pesan non-admin yang masuk akan dihapus',
        'dan pengirimnya dikeluarkan otomatis.',
        '',
        'Buka kembali: ' + usedPrefix + 'unmute',
      ])
    )
  }

  if (!active) {
    return m.reply(
      box([
        'UNMUTE GROUP',
        '',
        'Group tidak dalam mode diam.',
        '',
        'Aktifkan: ' + usedPrefix + 'mute',
      ])
    )
  }

  try {
    await rawConn.groupSettingUpdate(m.chat, 'not_announcement')
  } catch (err) {
    return m.reply(
      box([
        'UNMUTE GAGAL',
        '',
        String(err?.message || err).slice(0, 200),
        '',
        'Group tetap diam karena belum bisa dibuka.',
        'Pastikan bot masih admin, lalu coba lagi.',
      ])
    )
  }

  delete mutes[m.chat]
  try {
    saveMutes(mutes)
  } catch {
    // state tidak ikut tersimpan; group sudah terbuka, `.mute` berikutnya menulis ulang
  }

  return m.reply(box(['UNMUTE GROUP', '', 'Group dibuka kembali untuk semua member.', 'Enforcement bicara sudah dimatikan.']))
}

/**
 * Interceptor: selama group diam, pesan dari member non-admin dihapus dan
 * pengirimnya dikeluarkan. Berjalan sebelum parsing prefix, jadi perintah apa
 * pun dari member saat mute ikut dikonsumsi (dan pelakunya diusir).
 * Mengembalikan true hanya bila pesan dikonsumsi.
 */
handler.before = async function (conn, raw, { chat, sender, isSelf }) {
  if (isSelf) return false
  if (!chat || !chat.endsWith('@g.us')) return false
  if (!raw?.message || !raw?.key) return false

  const mutes = loadMutes()
  const record = mutes[chat]
  if (!record) return false

  /* Enforcement hanya berlaku selama group benar-benar tertutup — kalau admin
     membuka group lewat cara lain, dianggap selesai sampai .mute berikutnya. */
  let metadata
  try {
    metadata = await conn.groupMetadata(chat)
  } catch {
    return false
  }
  if (!metadata?.announce) return false

  /* Pesan yang terkirim SEBELUM mute aktif tidak dihukum — WhatsApp kadang
     mengirim ulang pesan lama setelah group ditutup. */
  const sentAt = Number(raw.messageTimestamp || 0) * 1000
  if (sentAt && sentAt < Number(record.at || 0)) return false

  const participant = findParticipant(metadata, sender)
  if (!participant) return false

  if (participantIsAdmin(participant) || isGroupOwnerParticipant(participant)) return false
  if (sameAsBot(sender, conn)) return false

  let owner = false
  try {
    owner = await isOwner(sender, conn, { groupId: chat })
  } catch {
    owner = false
  }
  if (owner) return false

  const jid = getParticipantJid(participant, sender)

  try {
    await conn.sendMessage(chat, { delete: raw.key })
  } catch {
    // bot mungkin bukan admin lagi — tetap lanjut ke proses pengusiran
  }

  let kicked = false
  let kickError = ''
  try {
    await conn.groupParticipantsUpdate(chat, [jid], 'remove')
    kicked = true
  } catch (err) {
    kickError = String(err?.message || err).slice(0, 120)
    console.log(`  \x1b[33m⚠\x1b[0m  Mute: gagal mengeluarkan ${jid}: ${kickError}`)
  }

  const number = await displayNumber(jid, conn, chat)
  const lines = [
    'GROUP DIAMKAN',
    '',
    mentionOf(number) + ' mengirim pesan saat group dimute.',
    kicked ? 'Member dikeluarkan dari group.' : 'Pesan dihapus — gagal mengeluarkan.',
  ]
  if (!kicked && kickError) lines.push('Alasan: ' + kickError)

  /* Gagal menendang berarti bot bukan admin: pesan tetap dikonsumsi, tapi
     notifikasi dibatasi supaya tidak membanjiri chat. */
  if (!kicked) {
    const last = failureNotices.get(chat) || 0
    if (Date.now() - last < NOTICE_COOLDOWN) return true
    failureNotices.set(chat, Date.now())
  }

  await conn.sendMessage(chat, { text: box(lines), mentions: [jid] }, { quoted: raw })
  return true
}

handler.command = /^(mute|unmute)$/i
handler.help = ['mute', 'unmute']
handler.menuHelp = ['mute', 'unmute']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mode diam group — tutup group dan tendang yang bicara'
handler.groupOnly = true

export default handler
