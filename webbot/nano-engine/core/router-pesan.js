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
import { getActivePrefix } from './prefix.js'
import { findPluginByCommand } from './pemuat-plugin.js'
import { sendTypoSuggestion } from './deteksi-typo.js'
import { enqueue } from './antrian-pesan.js'
import { isOwner, isLidJid, registerLidPhonePair, resolvePhoneNumber } from '../lib/cek-akses.js'
import { pluginStore } from './pemuat-plugin.js'
import { getAccessModeState, isAccessAllowed } from './akses-mode.js'
import { touchUser, isUserPremium, reserveUserLimit, commitUserLimit, releaseUserLimit } from './database-user.js'
import { isPremiumCommand, isLimitCommand, isOwnerCommand, isGroupCommand } from './status-command.js'
import { printCommandLog } from '../tampilan/banner.js'
import { handleAntiLinkMessage } from './antilink.js'
import { handleAFKMessage, setBotIdentity } from './afk-handler.js'
import { handleInstallMessage } from './plugin-install.js'
import { jalankanOtomatis, selesaiTyping } from './otomatis-handler.js'
import { hookParaloidFoto } from '../plugins/tools/paraloid.js'
import { createStyledConnection, sendGroupOnlyReply, sendStyledReply } from '../lib/reply-style.js'
import { buatPanduan, perluPanduan } from '../lib/bantuan.js'

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 6; i++) {
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

function extractText(message) {
  message = unwrapMessage(message)
  const nativeFlowResponse = message?.interactiveResponseMessage?.nativeFlowResponseMessage

  if (nativeFlowResponse?.paramsJson) {
    try {
      const params = JSON.parse(nativeFlowResponse.paramsJson)
      if (params?.id) return params.id
    } catch {

    }
  }

  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    message?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    message?.buttonsResponseMessage?.selectedButtonId ||
    message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message?.templateButtonReplyMessage?.selectedId ||
    ''
  )
}

function parseCommand(text, prefix) {
  if (!text.startsWith(prefix)) return null

  const withoutPrefix = text.slice(prefix.length).trim()
  const [command, ...rest] = withoutPrefix.split(/\s+/)

  return {
    command: (command || '').toLowerCase(),
    args: rest,
    text: rest.join(' '),
  }
}

export function attachMessageRouter(conn) {
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const raw of messages) {
      if (!raw.message) continue
      const allowSelf = settings.messageRouting?.respondToSelf !== false
      if (raw.key.fromMe && !allowSelf) continue

      enqueue(raw.key.id, async () => {
        await handleIncomingMessage(conn, raw)
      })
    }
  })
}


async function handleIncomingMessage(conn, raw) {
  const chat = raw.key.remoteJid
  if (!chat || chat === 'status@broadcast') return
  const isSelf = Boolean(raw.key.fromMe)

  /* Fitur otomatis (typing/read/react) dijalankan sebelum apa pun yang
     bisa menolak pesan, supaya centang biru dan "sedang mengetik…"
     muncul sejak pesan pertama masuk — termasuk pesan yang nanti
     dibalas pun. Indikator mengetik dimatikan lagi di
     selesaiTyping begitu pemrosesan selesai, apa pun hasilnya. */
  await jalankanOtomatis(conn, raw, { chat, isSelf })

  try {
    await prosesPesan(conn, raw, chat, isSelf)
  } finally {
    await selesaiTyping(conn, chat)
  }
}

async function prosesPesan(conn, raw, chat, isSelf) {
  const sender = isSelf ? (conn.user?.id || raw.key.participant || raw.key.remoteJid) : (raw.key.participant || raw.key.remoteJid)
  // WhatsApp mengirim dua bentuk sekaligus: LID dan nomor aslinya.
  // Nomor asli (participantAlt/remoteJidAlt) dipakai supaya owner/admin tetap
  // dikenali dan log menampilkan nomor negara yang sebenarnya, bukan LID.
  const senderAlt = String(raw.key.participantAlt || raw.key.remoteJidAlt || '').trim()
  registerLidPhonePair(sender, senderAlt)
  const senderNumber = await resolvePhoneNumber(sender, conn, { alt: senderAlt, groupId: chat })

  /* AFK: auto-unAFK & notifikasi — jalan untuk SEMUA pesan (juga tanpa teks),
     sebelum pemrosesan command apa pun. Pesan bot sendiri diabaikan di dalam. */
  setBotIdentity(conn.user?.id)
  await handleAFKMessage(conn, raw, {
    chat,
    sender,
    isSelf,
    messageContent: unwrapMessage(raw.message),
  })

  /* .addplugins: pesan lanjutan sesi instal plugin (reply file .js / tempel
     kode tanpa prefix). Bila pesan dikonsumsi sesi, router berhenti di sini. */
  if (await handleInstallMessage(conn, raw, { chat, sender, isSelf })) return

  /* paraloid: foto yang dikirim TANPA teks saat sesi .startpola aktif →
     disimpan sebagai foto sesi (1/2). Bila dikonsumsi sesi, router berhenti. */
  if (await hookParaloidFoto(conn, raw, { chat, sender, isSelf })) return

  /* Interceptor plugin (handler.before): pesan lanjutan game/sesi interaktif
     — mis. jawaban angka Akinator tanpa prefix. Dijalankan hanya bila plugin
     mengekspor fungsi `before` dan mengonsumsi pesan, router berhenti di sini
     sebelum penilaian perintah/prefix. Pesan bot sendiri tidak pernah diteruskan. */
  if (!isSelf) {
    for (const candidate of pluginStore.values()) {
      const before = candidate?.before
      if (typeof before !== 'function') continue
      try {
        const consumed = await before(conn, raw, { chat, sender, isSelf })
        if (consumed) return
      } catch (err) {
        console.log(`  \x1b[31m✗\x1b[0m  Plugin interceptor error: ${err?.message || err}`)
      }
    }
  }

  const prefix = await getActivePrefix(chat)

  const messageContent = unwrapMessage(raw.message)
  const moderated = await handleAntiLinkMessage(conn, raw)
  if (moderated) return

  const text = extractText(messageContent)

  if (!text) return

  const parsed = parseCommand(text, prefix)
  if (!parsed) return

  const plugin = findPluginByCommand(parsed.command)
  const isGroup = chat.endsWith('@g.us')

  if (!plugin?.accessModeControl) {
    const accessState = getAccessModeState()
    if (!isAccessAllowed(isGroup, accessState)) {
      const target = accessState.onlygc ? 'GROUP' : 'PRIVATE CHAT'
      await sendStyledReply(
        conn,
        chat,
        [
          '╭─「 NANO • ACCESS DENIED 」',
          '│',
          `│ Mode    : *${accessState.onlygc ? 'ONLY GROUP' : 'ONLY PRIVATE'}*`,
          `│ Chat    : *${isGroup ? 'GROUP' : 'PRIVATE'}*`,
          '│',
          '│ Akses dari chat ini sedang dibatasi.',
          `│ Gunakan bot melalui *${target}*.`,
          '╰────────────────╯',
        ].join('\n'),
        { originalMessage: raw }
      )
      return
    }
  }

  if (!plugin) {
    try {
      const handled = await sendTypoSuggestion(conn, raw, chat, prefix, parsed.command)
      if (!handled) {
        console.log(`  \x1b[33m⚠\x1b[0m  Tidak ada saran typo untuk: ${parsed.command}`)
      }
    } catch (err) {
      console.log(`  \x1b[31m✗\x1b[0m  Deteksi typo gagal: ${err?.message || err}`)
    }
    return
  }

  const m = {
    key: raw.key,
    chat,
    sender,
    isGroup,
    text: parsed.text,
    args: parsed.args,
    command: parsed.command,
    pushName: raw.pushName || (isSelf ? 'Owner' : 'Kak'),
    isSelf,
    senderNumber,
    senderLid: isLidJid(sender) ? sender : senderAlt,
    senderAlt,
    raw,
    currentMessage: messageContent,
    quoted: messageContent?.extendedTextMessage?.contextInfo?.quotedMessage || null,
    quotedMessage: messageContent?.extendedTextMessage?.contextInfo?.quotedMessage
      ? {
          key: {
            remoteJid: chat,
            fromMe: false,
            id: messageContent.extendedTextMessage.contextInfo.stanzaId,
            participant: messageContent.extendedTextMessage.contextInfo.participant || undefined,
          },
          message: messageContent.extendedTextMessage.contextInfo.quotedMessage,
        }
      : null,
  }

  const executionState = { sent: false }
  m.reply = async (text, options = {}) => {
    const quoted = Object.prototype.hasOwnProperty.call(options, 'quoted')
      ? options.quoted
      : raw
    const result = await sendStyledReply(conn, chat, text, {
      ...options,
      originalMessage: quoted === false ? null : quoted,
      mentions: options?.mentions || [],
    })
    executionState.sent = true
    return result
  }

  const styledBase = createStyledConnection(conn, m)
  const styledConn = new Proxy(styledBase, {
    get(target, property, receiver) {
      if (property === 'sendMessage') {
        return async (jid, content, options = {}) => {
          const result = await target.sendMessage(jid, content, options)
          executionState.sent = true
          return result
        }
      }
      const value = Reflect.get(target, property, receiver)
      if (typeof value === 'function') return value.bind(target)
      return value
    },
  })
  const statusContext = { command: parsed.command, args: parsed.args, text: parsed.text, isGroup: m.isGroup, isSelf, sender, chat, message: m }
  const premiumRequired = isPremiumCommand(plugin, statusContext)
  const ownerRequired = isOwnerCommand(plugin, statusContext)
  const groupRequired = isGroupCommand(plugin, statusContext)
  const limitRequired = isLimitCommand(plugin, statusContext)
  /* Owner dicek juga untuk perintah premium: pemilik bot tidak boleh terkunci
     dari fitur premium miliknya sendiri (mengetes sebelum dijual, dsb.).
     Pengguna lain tetap harus premium. */
  const ownerUser = ownerRequired || limitRequired || premiumRequired
    ? await isOwner(sender, conn, { alt: senderAlt, groupId: chat })
    : false

  await touchUser(sender, m.pushName)

  printCommandLog({
    pushName: m.pushName,
    sender,
    senderNumber,
    message: text,
    command: parsed.command,
    isGroup: m.isGroup,
    chat,
  })

  if (parsed.command === 'menu') {
    try {
      await conn.sendMessage(chat, { react: { text: '🤖', key: raw.key } })
    } catch (err) {
      console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengirim reaction .menu: ${err.message}`)
    }
  }

  if (ownerRequired && !ownerUser) {
    await sendStyledReply(conn, chat, 'Perintah ini khusus untuk owner bot.', { originalMessage: raw })
    return
  }

  if (groupRequired && !m.isGroup) {
    await sendGroupOnlyReply(conn, chat, 'Perintah ini hanya bisa dipakai di dalam group.', raw)
    return
  }

  if (premiumRequired) {
    const premiumUser = ownerUser || await isUserPremium(sender)
    if (!premiumUser) {
      await sendStyledReply(
        conn,
        chat,
        [
          '🔒 Perintah ini khusus untuk pengguna premium.',
          '',
          'Hubungi owner untuk mengaktifkan paket premium di bot ini.',
        ].join('\n'),
        { originalMessage: raw }
      )
      return
    }
  }

  const bypassLimit = ownerUser || m.isSelf || !limitRequired
  let reservationId = null
  let limitState = 'inactive'

  m.limit = {
    get active() { return Boolean(reservationId) },
    get state() { return limitState },
    success() {
      if (!reservationId || limitState !== 'reserved') return false
      limitState = 'confirmed'
      return true
    },
    fail() {
      if (!reservationId || limitState !== 'reserved') return false
      limitState = 'failed'
      return true
    },
  }

  if (!bypassLimit) {
    const reservation = await reserveUserLimit(sender)
    if (!reservation) {
      await sendStyledReply(conn, chat, 'Limit kamu sudah habis. Silakan tunggu sampai limit direset 24 jam setelah grant terakhir.', { originalMessage: raw })
      return
    }
    reservationId = reservation.id
    limitState = 'reserved'
  }

  try {
    const result = await plugin(m, { conn: styledConn, rawConn: conn, usedPrefix: prefix, settings })

    /* Perintah dipanggil tanpa argumen tetapi plugin tidak menjawab apa pun:
       kirim tata cara pakai supaya pengguna tidak bingung. Dihitung sebelum
       blok limit supaya balasan panduan tidak dianggap "fitur terpakai". */
    /* Plugin yang menjawab secara tertunda (setTimeout/.then/dst.) belum
       tentu diam — beri mereka waktu, jangan kirim panduan lebih dulu. */
    const balasanTertunda = /(?:setTimeout|setInterval|\.then\s*\(|queueMicrotask)/.test(Function.prototype.toString.call(plugin))
    const kirimPanduanBilaPerlu = async () => {
      const perlu = perluPanduan({
        sent: executionState.sent,
        deferred: balasanTertunda,
        args: m.args,
        text: m.text,
      })
      if (!perlu) return
      const teks = buatPanduan(plugin, { prefix, command: parsed.command })
      if (!teks) return
      await sendStyledReply(conn, chat, teks, { originalMessage: raw })
    }

    if (reservationId) {
      const metadataLimitCommit = plugin?.limitCommit || null
      const sourceRequiresManual = /(?:setTimeout|setInterval|\.then\s*\(|void\s+|queueMicrotask)/.test(Function.prototype.toString.call(plugin))
      const manualCommit = metadataLimitCommit === 'manual' || sourceRequiresManual
      const explicitFailure = result?.success === false || result?.status === false || limitState === 'failed'
      const explicitSuccess = result?.success === true || result?.status === true || limitState === 'confirmed'
      const executionEvidence = executionState.sent || result !== undefined

      if (explicitFailure || (manualCommit && !explicitSuccess) || (!manualCommit && !executionEvidence)) {
        await releaseUserLimit(reservationId, sender)
        reservationId = null
        limitState = 'released'
        await kirimPanduanBilaPerlu()
        return
      }

      const committed = await commitUserLimit(reservationId, sender)
      reservationId = null
      limitState = committed ? 'committed' : 'released'
      if (!committed) return
      await sendStyledReply(
        conn,
        chat,
        [
          '╭─〔 *LIMIT TERPAKAI* 〕',
          '│ Fitur berhasil digunakan.',
          '│ 1 limit telah digunakan.',
          `│ Sisa limit anda : ${committed.limit}`,
          '╰────────────',
        ].join('\n'),
        { originalMessage: raw }
      )
    }

    await kirimPanduanBilaPerlu()
  } catch (err) {
    if (reservationId) {
      await releaseUserLimit(reservationId, sender)
      reservationId = null
      limitState = 'released'
    }
    console.log(`  \x1b[31m✗\x1b[0m  Error di plugin "${parsed.command}": ${err.message}`)
    if (!executionState.sent) {
      await sendStyledReply(
        conn,
        chat,
        `Terjadi kesalahan saat menjalankan perintah ini.\n\n${err.message}`,
        { originalMessage: raw }
      )
    }
  }

}

export default { attachMessageRouter }
