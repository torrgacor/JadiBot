/*
⌬ Nano Ai · AFK Message Hook
  Dipanggil router-pesan untuk SETIAP pesan masuk, PALING AWAL sebelum
  pemrosesan command (juga sebelum antilink) — jadi pesan apa pun
  (teks, stiker, gambar, video, audio, dokumen, lokasi, kontak, reaksi,
  command) yang benar-benar dari user AFK memicu auto-unAFK.

  Konsep (tanpa .unafk):
  1. User AFK mengirim pesan APA PUN di grup yang ada bot-nya →
     deaktivasi ATOMIK (UPDATE ... WHERE is_afk = 1) → jika baris benar-benar
     berubah, kirim Welcome Back sekali. Pesan berikutnya tidak pernah
     dianggap auto-unAFK lagi karena is_afk sudah 0.
  2. Orang lain menyebut/membalas user AFK → notifikasi dengan cooldown.
  Anti-loop: pesan dari bot sendiri (fromMe) diabaikan penuh.
*/

import {
  getAFK,
  deactivateAFK,
  formatDuration,
  isBotSent,
} from '../lib/afk.js'
import { resolvePhoneNumber } from '../lib/cek-akses.js'
import { getUserMode } from '../lib/mode-pesan.js'
import { denganPromo } from './identitas.js'
import { getActivePrefix } from './prefix.js'

/* ── cooldown notifikasi: 1 balasan / 60 detik per (penanya → user AFK) ── */
const NOTIFY_COOLDOWN_MS = 60_000
const lastNotified = new Map() // `${peminta}|${afkJid}` -> timestamp

/* konteks bot: diisi attachMessageRouter sekali saat boot */
let botSelfJid = ''
let botSelfNumber = ''

export function setBotIdentity(jid = '') {
  botSelfJid = String(jid || '')
  botSelfNumber = String(jid || '').split('@')[0].split(':')[0]
}

function isBotJid(jid = '') {
  if (!jid) return false
  if (botSelfJid && String(jid) === botSelfJid) return true
  const num = String(jid).split('@')[0].split(':')[0]
  return Boolean(botSelfNumber) && num === botSelfNumber
}

function isGroupJid(jid = '') {
  return String(jid).endsWith('@g.us')
}

/* pesan berupa command .afk → JANGAN dianggap pemicu auto-unAFK.
   Kalau user/owner yang masih AFK mengirim `.afk alasan-baru`, biarkan
   plugin memperbarui alasan (upsert) — bukan mematikan lalu menyalakan
   AFK lagi yang memunculkan Welcome Back membingungkan. */
function extractSimpleText(mc) {
  return (
    mc?.conversation ||
    mc?.extendedTextMessage?.text ||
    mc?.imageMessage?.caption ||
    mc?.videoMessage?.caption ||
    ''
  )
}

const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function isAfkCommand(chat, messageContent) {
  const text = String(extractSimpleText(messageContent) || '').trimStart()
  if (!text) return false
  const prefix = await getActivePrefix(chat).catch(() => '.')
  return new RegExp(`^${escapeRe(prefix)}\\s*afk\\b`, 'i').test(text)
}

/* ── kumpulkan semua JID yang disebut / dibalas dalam satu pesan ───────── */
function extractMentionedJids(messageContent) {
  const set = new Set()
  const push = (v) => { const s = String(v || ''); if (s.includes('@')) set.add(s) }

  const ctx = messageContent?.extendedTextMessage?.contextInfo
  push(ctx?.participant) // yang dibalas (reply)

  for (const j of messageContent?.extendedTextMessage?.contextInfo?.mentionedJid || []) push(j)
  for (const j of messageContent?.imageMessage?.contextInfo?.mentionedJid || []) push(j)
  for (const j of messageContent?.videoMessage?.contextInfo?.mentionedJid || []) push(j)
  for (const j of messageContent?.documentMessage?.contextInfo?.mentionedJid || []) push(j)

  return [...set]
}

/* ── teks pesan ────────────────────────────────────────────────────────── */
function afkNoticeText(record, mentionJid) {
  const alasan = record.reason ? `\n📝 Alasan: ${record.reason}` : ''
  return `💤 @${String(mentionJid).split('@')[0]} sedang AFK.${alasan}`
}

function welcomeBackText(record) {
  const durasi = record?.afkSince ? formatDuration(Date.now() - record.afkSince) : 'beberapa saat'
  return `🟢 Welcome Back!\nAFK kamu otomatis dinonaktifkan karena kamu sudah mengirim pesan.\n⏱️ Durasi AFK: ${durasi}`
}

/* kirim Welcome Back sesuai mode user yang bersangkutan:
   ios → polos, android → quoted ke pesannya */
async function kirimWelcomeBack(conn, chat, raw, senderJid, record) {
  const ios = getUserMode(senderJid) === 'ios'
  await conn.sendMessage(chat, {
    text: denganPromo(welcomeBackText(record)),
    mentions: [senderJid],
  }, ios ? undefined : { quoted: raw })
}

async function notifyIfAllowed(conn, chat, raw, record, afkJid, requesterJid, mentioned) {
  const key = `${requesterJid}|${afkJid}`
  const now = Date.now()
  const last = lastNotified.get(key) || 0
  if (now - last < NOTIFY_COOLDOWN_MS) return
  lastNotified.set(key, now)

  /* jaga ukuran map */
  if (lastNotified.size > 500) {
    const cutoff = now - 5 * 60_000
    for (const [k, t] of lastNotified) if (t < cutoff) lastNotified.delete(k)
  }

  try {
    /* mode milik PENANYA: ios → polos, android → quoted ke pesannya */
    const ios = getUserMode(requesterJid) === 'ios'
    await conn.sendMessage(chat, {
      text: denganPromo(afkNoticeText(record, afkJid)),
      mentions: [afkJid, ...(mentioned ? [mentioned] : [])],
    }, ios ? undefined : { quoted: raw })
  } catch (error) {
    console.log(`  \x1b[33m⚠\x1b[0m  Notifikasi AFK gagal dikirim: ${error.message}`)
  }
}

/* ── hook utama ────────────────────────────────────────────────────────── */
export async function handleAFKMessage(conn, raw, { chat, sender, isSelf, messageContent } = {}) {
  try {
    if (!chat || chat === 'status@broadcast') return
    const inGroup = isGroupJid(chat)

    if (isSelf || isBotJid(sender)) {
      /* Nomor bot = milik owner. Pesan fromMe punya dua makna:
         (a) OUTPUT BOT otomatis → diabaikan (ID-nya tercatat via markBotSent)
         (b) OWNER MENGETIK MANUAL → pemicu auto-unAFK sah untuk AFK owner.
         Pembeda: ID pesan ADA/TIDAK di catatan pesan bot. */
      if (isBotSent(raw?.key?.id)) return // output bot — anti-loop
      if (inGroup) {
        const rec = getAFK(sender)
        if (rec?.isAfk && !(await isAfkCommand(chat, messageContent))) {
          const result = deactivateAFK(sender)
          if (result.changed) {
            try {
              await kirimWelcomeBack(conn, chat, raw, String(sender).split(':')[0], result.previous)
            } catch { /* DB sudah benar; kirim gagal tidak masalah */ }
          }
        }
      }
      return // pesan dari nomor bot tidak pernah memicu notifikasi ke orang lain
    }

    /* 1) Pengirim sedang AFK → auto-unAFK (KHUSUS GRUP, pesan apa pun
       KECUALI command .afk — itu berarti perbarui alasan) */
    const senderRecord = getAFK(sender)
    if (senderRecord?.isAfk) {
      if (inGroup && !(await isAfkCommand(chat, messageContent))) {
        /* ATOMIK: hanya event pertama yang berhasil mengubah baris
           (WHERE is_afk = 1). Event kedua melihat is_afk = 0 → selesai. */
        const result = deactivateAFK(sender)
        if (result.changed) {
          try {
            await kirimWelcomeBack(conn, chat, raw, sender, result.previous)
          } catch { /* gagal kirim tidak membatalkan unAFK — DB sudah benar */ }
        }
      }
      /* PC: sesuai konsep fitur, pesan private TIDAK memicu auto-unAFK.
         (Tidak ada notifikasi untuk diri sendiri; proses pesan lanjut normal.) */
    } else if (!inGroup) {
      /* 2) PC biasa: lawan bicara sedang AFK → beri tahu (dengan cooldown) */
      const peerRecord = getAFK(chat)
      if (peerRecord?.isAfk) {
        await notifyIfAllowed(conn, chat, raw, peerRecord, chat, sender, null)
      }
    }

    /* 3) Grup: cek mention/reply → cocokkan dengan daftar AFK.
       Dijalankan untuk semua kasus — pesan user tetap diproses normal. */
    if (!inGroup) return
    const mentioned = extractMentionedJids(messageContent)
    if (!mentioned.length) return

    for (const jid of mentioned) {
      if (isBotJid(jid)) continue

      const record = getAFK(jid)
      if (record?.isAfk) {
        await notifyIfAllowed(conn, chat, raw, record, jid, sender, jid)
        continue
      }

      /* mention bisa berupa LID — petakan ke nomor asli lalu cek lagi */
      const number = await resolvePhoneNumber(jid, conn, { groupId: chat }).catch(() => '')
      if (number) {
        const numRecord = getAFK(`${number}@s.whatsapp.net`)
        if (numRecord?.isAfk) {
          await notifyIfAllowed(conn, chat, raw, numRecord, `${number}@s.whatsapp.net`, sender, jid)
        }
      }
    }
  } catch (error) {
    console.log(`  \x1b[33m⚠\x1b[0m  AFK hook error (tidak fatal): ${error.message}`)
  }
}
