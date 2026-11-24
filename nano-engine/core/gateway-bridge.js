/**
 * ════════════════════════════════════════════════════════════════════════════
 *  NANO GATEWAY BRIDGE  (injected into a per-session copy of the Nano script)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  The Nano script (`index.js`) is a terminal bot: it has no HTTP API, so an
 *  external platform cannot ask it to send a message. This module is the
 *  missing seam, written against Nano's *actual* internals rather than an
 *  invented API:
 *
 *    • `core/pemuat-plugin.js` auto-imports every `.js` under `plugins/`
 *    • `index.js` calls `startConnection({ onReady })`, and `onReady(conn)`
 *      receives the live Baileys socket
 *
 *  The gateway injects a two-line hook into `onReady` (see
 *  `injectBridgeHook()` in gateway/drivers/nano-process.ts) which calls
 *  `startGatewayBridge(conn)` here. From that point the bridge:
 *
 *    1. watches `<bridgeDir>/commands.jsonl` for send requests
 *    2. executes them with `conn.sendMessage(...)` — text, media, or a revoke
 *    3. appends the outcome to `<bridgeDir>/results.jsonl`
 *    4. journals every message the bot sends *or* receives to
 *       `<bridgeDir>/messages.jsonl`
 *
 *  Point 4 watches **both** of Nano's send doors, because it uses both. Plain
 *  text leaving the plugin router goes through `conn.sendMessage`, but
 *  everything the script compiles with `generateWAMessageFromContent` — the
 *  styled replies in `lib/reply-style.js`, the button menus in `lib/tombol.js`,
 *  the mini-games — leaves through `conn.relayMessage`. Baileys' own
 *  `sendMessage` reaches for an internal relay rather than the socket property,
 *  so the two hooks never see the same send twice. Watching only one door
 *  silently loses everything that leaves by the other.
 *
 *  Point 4 exists because the bot holds the only WhatsApp socket. Without it
 *  the platform is blind to everything the bot does on its own: the usage
 *  meter stays at zero, the message history and throughput chart stay empty,
 *  and inbound automation rules never fire — all while the bot answers every
 *  chat. The journal is a plain record of real traffic, nothing is simulated.
 *
 *  A `revoke` command withdraws a message the bot itself sent —
 *  `conn.sendMessage(chat, { delete: key })`, which is Baileys' delete-for-
 *  everyone door. Only the sending device can do this, which is why it has to
 *  travel through the bridge instead of being done by the platform directly.
 *  It is deliberately *not* journaled and never counts towards the usage meter:
 *  `describeOutgoing` returns null for a deletion, exactly as it does for a
 *  reaction or an edit, so withdrawing a message cannot look like sending one.
 *
 *  File-based IPC is used deliberately: the Nano process is a black box that we
 *  must not modify beyond the documented hook, and jsonl append-only files are
 *  crash-safe and trivially debuggable (`tail -f results.jsonl`).
 *
 *  This file is never written into the user's original Nano folder — only into
 *  the gateway's own per-session work copy under storage/nano-work/<sessionId>.
 */

import fs from 'node:fs'
import path from 'node:path'

const POLL_INTERVAL_MS = 300
const MAX_RESULT_LINES = 2000
const MAX_MESSAGE_LINES = 5000
/**
 * How often the account's own name and avatar are re-read.
 *
 * A profile picture changes rarely and this is one cheap query, so the interval
 * only needs to be short enough that a change appears without a bot restart.
 */
const IDENTITY_REFRESH_MS = 5 * 60 * 1000
/** Bodies are stored for the panel's message list; long ones are clipped. */
const MAX_TEXT_CHARS = 500

/** Normalise a phone number / JID into something Baileys accepts. */
function normalizeRecipient(to) {
  const value = String(to ?? '').trim()
  if (value.includes('@')) return value
  return `${value.replace(/\D/g, '')}@s.whatsapp.net`
}

/**
 * Start the bridge on a live connection.
 * Idempotent — Nano's `onReady` can fire again after a reconnect, and stacking
 * two pollers would double-send every command.
 */
export function startGatewayBridge(conn) {
  const bridgeDir = process.env.NANO_GATEWAY_BRIDGE_DIR
  if (!bridgeDir) {
    console.log('GATEWAY_BRIDGE=disabled (NANO_GATEWAY_BRIDGE_DIR not set)')
    return
  }

  if (conn.__nanoGatewayBridgeStarted) {
    // Reconnect: rebind the socket on the existing poller and carry on.
    conn.__nanoGatewayBridgeStarted.conn = conn
    // A reconnect builds a *new* socket object, so the traffic hooks have to be
    // attached to it as well — the guard inside is per socket.
    instrumentSocket(conn, makeMessageWriter(bridgeDir))
    // A reconnect can land on an account whose picture was never fetched.
    void publishIdentity(conn, bridgeDir)
    console.log('GATEWAY_BRIDGE=rebound')
    return
  }

  const state = { conn, interval: null, offset: 0, seen: 0, busy: false }
  conn.__nanoGatewayBridgeStarted = state

  fs.mkdirSync(bridgeDir, { recursive: true })
  const commandsPath = path.join(bridgeDir, 'commands.jsonl')
  const resultsPath = path.join(bridgeDir, 'results.jsonl')

  fs.closeSync(fs.openSync(commandsPath, 'a'))
  fs.closeSync(fs.openSync(resultsPath, 'a'))

  const writeResult = (payload) => {
    try {
      fs.appendFileSync(resultsPath, `${JSON.stringify(payload)}\n`)
      trimFile(resultsPath, MAX_RESULT_LINES)
    } catch (error) {
      console.log(`GATEWAY_BRIDGE_ERROR=result-write:${error.message}`)
    }
  }

  // Watch real traffic on this socket, from now on.
  const writeMessage = makeMessageWriter(bridgeDir)
  instrumentSocket(conn, writeMessage)

  /*
    Publish the account's own identity so the panel can show its real avatar.
    Only this process holds the WhatsApp socket, so the gateway has to read it
    back from a file rather than ask directly. Read now, once more shortly after
    (WhatsApp sometimes refuses the picture query in the first moments of a
    connection), and then periodically so a changed name or picture appears
    without a restart.
  */
  void publishIdentity(conn, bridgeDir)
  const identityRetry = setTimeout(() => void publishIdentity(state.conn, bridgeDir), 15_000)
  identityRetry.unref?.()
  const identityTimer = setInterval(
    () => void publishIdentity(state.conn, bridgeDir),
    IDENTITY_REFRESH_MS
  )
  identityTimer.unref?.()

  /**
   * Commands arrive as a single JSON object (not a jsonl array) so a partially
   * written line can be detected and skipped rather than crashing the poller.
   */
  const readNewCommands = () => {
    let stat
    try {
      stat = fs.statSync(commandsPath)
    } catch {
      return []
    }

    // File truncated or replaced → restart from the beginning.
    if (stat.size < state.offset) state.offset = 0
    if (stat.size === state.offset) return []

    let chunk
    try {
      const fd = fs.openSync(commandsPath, 'r')
      const length = stat.size - state.offset
      const buffer = Buffer.alloc(length)
      fs.readSync(fd, buffer, 0, length, state.offset)
      fs.closeSync(fd)
      chunk = buffer.toString('utf8')
    } catch {
      return []
    }

    const lastNewline = chunk.lastIndexOf('\n')
    if (lastNewline === -1) return [] // partial line, wait for the rest
    state.offset += Buffer.byteLength(chunk.slice(0, lastNewline + 1), 'utf8')

    const commands = []
    for (const line of chunk.slice(0, lastNewline).split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        commands.push(JSON.parse(trimmed))
      } catch {
        // Tolerate a corrupt line rather than stalling the whole queue.
        writeResult({ id: null, ok: false, error: 'malformed-command' })
      }
    }
    return commands
  }

  const contentFor = (command) => {
    switch (command.type) {
      case 'image':
        return { image: { url: command.mediaUrl }, caption: command.caption }
      case 'video':
        return { video: { url: command.mediaUrl }, caption: command.caption }
      case 'audio':
        return { audio: { url: command.mediaUrl }, mimetype: command.mimetype || 'audio/mp4' }
      case 'document':
        return {
          document: { url: command.mediaUrl },
          mimetype: command.mimetype || 'application/octet-stream',
          fileName: command.fileName || 'document',
          caption: command.caption,
        }
      case 'sticker':
        return { sticker: { url: command.mediaUrl } }
      case 'location':
        return {
          location: {
            degreesLatitude: command.latitude,
            degreesLongitude: command.longitude,
            name: command.locationName,
          },
        }
      case 'text':
      default:
        return { text: command.text ?? '' }
    }
  }

  const execute = async (command) => {
    const startedAt = Date.now()
    try {
      const recipient = normalizeRecipient(command.to)

      /*
        Revoke is not a send: the payload is the key of the message being
        withdrawn, not a body. Handling it before `contentFor` keeps that
        distinction obvious, and `fromMe` defaults to true because the honest
        common case is withdrawing the bot's own message (only its own device
        can do that in a private chat at all).
      */
      if (command.type === 'revoke') {
        if (!command.messageId) throw new Error('revoke membutuhkan messageId')

        await state.conn.sendMessage(recipient, {
          delete: {
            remoteJid: recipient,
            fromMe: command.fromMe !== false,
            id: String(command.messageId),
          },
        })

        writeResult({
          id: command.id,
          ok: true,
          revoked: String(command.messageId),
          recipient,
          latencyMs: Date.now() - startedAt,
          at: new Date().toISOString(),
        })
        return
      }

      const sent = await state.conn.sendMessage(
        recipient,
        contentFor(command),
        command.quotedId ? { quoted: { key: { remoteJid: recipient, id: command.quotedId, fromMe: true }, message: { conversation: '' } } } : undefined
      )

      writeResult({
        id: command.id,
        ok: true,
        externalId: sent?.key?.id ?? null,
        recipient,
        latencyMs: Date.now() - startedAt,
        at: new Date().toISOString(),
      })
    } catch (error) {
      writeResult({
        id: command.id,
        ok: false,
        error: error?.message || String(error),
        at: new Date().toISOString(),
      })
    }
  }

  const poll = async () => {
    if (state.busy) return
    state.busy = true
    try {
      const commands = readNewCommands()
      // Sequential: Nano's own message router relies on ordered delivery, and
      // pumping sends in parallel is exactly how a number gets rate-limited.
      for (const command of commands) {
        state.seen += 1
        await execute(command)
      }
    } finally {
      state.busy = false
    }
  }

  state.interval = setInterval(() => {
    void poll()
  }, POLL_INTERVAL_MS)

  console.log(`GATEWAY_BRIDGE=ready dir=${bridgeDir} journal=messages.jsonl`)
}

/**
 * Publish the connected account's own identity (`identity.json`).
 *
 * The panel shows each bot's avatar, name and number, and the WhatsApp socket
 * that can answer for them lives here — not in the gateway. So the bridge writes
 * what it finds next to its other files and the gateway reads it back, exactly
 * like the message journal.
 *
 * Written atomically: the gateway reads this on a poll, and a half-written file
 * would parse as garbage and blank the avatar it is meant to fill in.
 *
 * Every failure is swallowed. A bot with no profile picture — or one whose
 * picture WhatsApp declines to hand over — is normal, not an error, and must
 * never interfere with the bot's actual work.
 */
async function publishIdentity(conn, bridgeDir) {
  try {
    const jid = conn?.user?.id ? String(conn.user.id) : null
    if (!jid) return

    let profilePicUrl = null
    try {
      if (typeof conn.profilePictureUrl === 'function') {
        profilePicUrl = (await conn.profilePictureUrl(jid, 'image')) || null
      }
    } catch {
      // No picture set, or WhatsApp refused the query. Both are ordinary.
      profilePicUrl = null
    }

    /*
      LID accounts (`…@lid`) identify the device, not the phone number, so a
      number taken from one would be wrong. Only claim a number when the JID
      really is a phone-number JID; otherwise leave it to the existing pairing
      flow, which already knows the number the user typed.
    */
    const isPhoneJid = jid.endsWith('@s.whatsapp.net')
    const phoneNumber = isPhoneJid
      ? jid.split('@')[0].split(':')[0].replace(/\D/g, '') || null
      : null

    const record = {
      at: new Date().toISOString(),
      jid,
      phoneNumber,
      name: typeof conn?.user?.name === 'string' && conn.user.name ? conn.user.name : null,
      profilePicUrl,
    }

    const target = path.join(bridgeDir, 'identity.json')
    const temp = `${target}.tmp`
    fs.writeFileSync(temp, JSON.stringify(record))
    fs.renameSync(temp, target)
  } catch (error) {
    console.log(`GATEWAY_BRIDGE_ERROR=identity:${error?.message ?? error}`)
  }
}

/**
 * Keep an append-only journal bounded. The gateway tails these files and tracks
 * its own offset, so truncation is detected there and handled by resetting the
 * reader; the newest lines are always the ones kept.
 */
function trimFile(filePath, maxLines) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(Boolean)
    if (lines.length <= maxLines) return
    fs.writeFileSync(filePath, `${lines.slice(-maxLines).join('\n')}\n`)
  } catch {
    // Housekeeping only — never fatal.
  }
}

/**
 * Writer for the message journal.
 *
 * Separate from the command/result files because it flows the other way: this
 * is the bot telling the platform what happened, not the platform asking the
 * bot to do something. Failures are logged and swallowed — losing a journal
 * line must never break the bot's own work.
 */
function makeMessageWriter(bridgeDir) {
  fs.mkdirSync(bridgeDir, { recursive: true })
  const messagesPath = path.join(bridgeDir, 'messages.jsonl')
  fs.closeSync(fs.openSync(messagesPath, 'a'))

  return (record) => {
    try {
      fs.appendFileSync(messagesPath, `${JSON.stringify(record)}\n`)
      trimFile(messagesPath, MAX_MESSAGE_LINES)
    } catch (error) {
      console.log(`GATEWAY_BRIDGE_ERROR=journal-write:${error.message}`)
    }
  }
}

function clipText(value) {
  const text = typeof value === 'string' ? value : ''
  return text.length > MAX_TEXT_CHARS ? `${text.slice(0, MAX_TEXT_CHARS)}…` : text
}

/**
 * Describe the `content` argument of a `sendMessage` call.
 *
 * This is the friendly object the caller writes (`{ text }`,
 * `{ image: { url } }`, `{ react }`), not a wire payload — Baileys compiles it
 * into a proto message afterwards, which is why it needs its own reader.
 *
 * Returns `null` for traffic that is not a message: reactions, deletions and
 * edits all travel through `sendMessage` but counting them as messages would
 * inflate the user's usage meter with things nobody sent.
 */
function describeOutgoing(content) {
  if (!content || typeof content !== 'object') return null
  if (content.react || content.delete || content.edit || content.presenceUpdate) return null

  if (typeof content.text === 'string') return { kind: 'text', text: clipText(content.text) }

  const kinds = ['image', 'video', 'audio', 'document', 'sticker', 'location', 'contact']
  const kind = kinds.find((key) => content[key] !== undefined)
  if (!kind) return null

  const caption =
    typeof content.caption === 'string'
      ? content.caption
      : kind === 'document' && typeof content.fileName === 'string'
        ? content.fileName
        : ''
  return { kind, text: clipText(caption) }
}

/**
 * Unwrap the envelopes WhatsApp uses to smuggle the real payload one level
 * down: disappearing messages, view-once, and documents that carry a caption.
 */
function unwrapMessage(message) {
  return (
    message.ephemeralMessage?.message ||
    message.viewOnceMessage?.message ||
    message.viewOnceMessageV2?.message ||
    message.viewOnceMessageV2Extension?.message ||
    message.documentWithCaptionMessage?.message ||
    message
  )
}

/**
 * Is this payload something other than a message?
 *
 * Receipts and the rest of the protocol traffic arrive through the same calls
 * as real messages, as do reactions, poll votes and the key-distribution frames
 * multi-device groups exchange. Counting them would inflate the user's usage
 * meter with things nobody sent.
 */
function isNonMessage(unwrapped) {
  if (
    unwrapped.protocolMessage ||
    unwrapped.reactionMessage ||
    unwrapped.pollUpdateMessage ||
    unwrapped.keepInChatMessage ||
    unwrapped.stickerSyncRmrMessage
  ) {
    return true
  }
  // A lone sender-key frame is plumbing; the real content rides beside it.
  if (unwrapped.senderKeyDistributionMessage && Object.keys(unwrapped).length === 1) return true
  return false
}

/**
 * The text of a menu-style message.
 *
 * Nano builds menus with several helpers (buttons, list, template, interactive
 * native-flow) and each parks its text somewhere different, so the label is
 * looked up rather than guessed. The replies those menus come back as are read
 * here too, so an inbound button tap stays readable in the panel.
 *
 * Returns `null` when the payload carries no menu at all.
 */
function menuTextOf(message) {
  const candidates = [
    message.buttonsMessage?.contentText,
    message.buttonsMessage?.text,
    message.buttonsMessage?.headerText,
    message.templateMessage?.hydratedTemplate?.hydratedContentText,
    message.templateMessage?.hydratedTemplate?.hydratedTitleText,
    message.templateMessage?.hydratedFourRowTemplate?.hydratedContentText,
    message.interactiveMessage?.body?.text,
    message.interactiveMessage?.header?.title,
    message.listMessage?.description,
    message.listMessage?.title,
    message.listMessage?.buttonText,
    message.pollCreationMessage?.name,
    message.eventMessage?.name,
    message.productMessage?.product?.title,
    message.buttonsResponseMessage?.selectedDisplayText,
    message.buttonsResponseMessage?.selectedButtonId,
    message.listResponseMessage?.title,
    message.listResponseMessage?.singleSelectReply?.selectedRowId,
    message.templateButtonReplyMessage?.selectedDisplayText,
    message.templateButtonReplyMessage?.selectedId,
  ]
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

/**
 * Describe a raw WhatsApp payload.
 *
 * Shared by both directions: Baileys hands inbound through `messages.upsert`
 * and outbound through `relayMessage` in exactly the same proto shape.
 *
 * With `fallback` set, a payload matching no known shape is still reported as a
 * message. That is right for outbound — `relayMessage` is an explicit "send
 * this" call, and dropping an unrecognised payload would under-report the
 * meter — and wrong for inbound, where an unknown frame is usually plumbing.
 */
function describeProtoMessage(message, { fallback = false } = {}) {
  if (!message || typeof message !== 'object') return null

  const unwrapped = unwrapMessage(message)
  if (isNonMessage(unwrapped)) return null

  if (typeof unwrapped.conversation === 'string') {
    return { kind: 'text', text: clipText(unwrapped.conversation) }
  }
  if (unwrapped.extendedTextMessage?.text) {
    return { kind: 'text', text: clipText(unwrapped.extendedTextMessage.text) }
  }
  if (unwrapped.imageMessage) return { kind: 'image', text: clipText(unwrapped.imageMessage.caption) }
  if (unwrapped.videoMessage) return { kind: 'video', text: clipText(unwrapped.videoMessage.caption) }
  if (unwrapped.audioMessage) return { kind: 'audio', text: '' }
  if (unwrapped.stickerMessage) return { kind: 'sticker', text: '' }
  if (unwrapped.documentMessage) {
    return {
      kind: 'document',
      text: clipText(unwrapped.documentMessage.caption || unwrapped.documentMessage.fileName),
    }
  }
  if (unwrapped.locationMessage) return { kind: 'location', text: '' }
  if (unwrapped.contactMessage || unwrapped.contactsArrayMessage) {
    return { kind: 'contact', text: '' }
  }

  const menu = menuTextOf(unwrapped)
  if (menu !== null) return { kind: 'text', text: clipText(menu) }

  return fallback ? { kind: 'text', text: '' } : null
}

/**
 * Attach the traffic hooks to a live socket.
 *
 * Nano has two outbound doors and uses both, so both are wrapped:
 *
 *   • `sendMessage` — plain replies from the plugin router, antilink, AFK;
 *   • `relayMessage` — every payload the script compiles first: styled replies
 *     (`lib/reply-style.js`), button menus (`lib/tombol.js`), the mini-games,
 *     and this bridge's own command queue.
 *
 * Wrapping the socket *property* is what matters, because that is what Nano's
 * code — and the proxies it builds on top of the socket — read at call time.
 * Baileys' own `sendMessage` calls an internal relay instead, so one send is
 * never reported by both hooks; should a future Baileys break that assumption,
 * `journal()` de-duplicates by message id.
 *
 * Inbound is read from the same `messages.upsert` event the bot's own router
 * uses; adding a listener does not disturb it.
 *
 * Idempotent per socket: `onReady` can fire again on reconnect, and wrapping
 * twice would journal every send twice.
 */
function instrumentSocket(conn, writeMessage) {
  if (!conn || conn.__nanoGatewayTraffic) return
  conn.__nanoGatewayTraffic = true

  /*
   * Ids already written on this socket. Two records for one send would double
   * the usage meter, which is the user's quota — cheap to rule out, expensive
   * to explain.
   */
  const seenIds = new Set()
  const journal = (record, id) => {
    if (id) {
      if (seenIds.has(id)) return
      seenIds.add(id)
      if (seenIds.size > 64) seenIds.delete(seenIds.values().next().value)
    }
    try {
      writeMessage(record)
    } catch {
      // Journaling must never break a send.
    }
  }

  const outgoing = (jid, described, id) => ({
    at: new Date().toISOString(),
    direction: 'out',
    externalId: id,
    chatId: String(jid ?? ''),
    isGroup: String(jid ?? '').endsWith('@g.us'),
    ...described,
  })

  const send = typeof conn.sendMessage === 'function' ? conn.sendMessage.bind(conn) : null
  if (send) {
    conn.sendMessage = async (jid, content, options) => {
      const sent = await send(jid, content, options)
      try {
        const described = describeOutgoing(content)
        if (described) {
          const id = sent?.key?.id ?? null
          journal(outgoing(jid, described, id), id)
        }
      } catch {
        // Journaling must never break a successful send.
      }
      return sent
    }
  }

  const relay = typeof conn.relayMessage === 'function' ? conn.relayMessage.bind(conn) : null
  if (relay) {
    conn.relayMessage = async (jid, message, options) => {
      const result = await relay(jid, message, options)
      try {
        const id = options?.messageId ? String(options.messageId) : null
        const described = describeProtoMessage(message, { fallback: true })
        if (described) journal(outgoing(jid, described, id), id)
      } catch {
        // Journaling must never break a successful send.
      }
      return result
    }
  }

  const onUpsert = ({ messages, type }) => {
    // `notify` is live traffic; `append` is history sync, which would otherwise
    // re-import old chats as if they had just arrived.
    if (type !== 'notify') return
    for (const raw of Array.isArray(messages) ? messages : []) {
      if (!raw || raw.key?.fromMe || !raw.message) continue
      const jid = String(raw.key?.remoteJid ?? '')
      // Statuses and broadcast channels are not conversations with the bot;
      // journaling them would fill the panel with traffic nobody sent *it*.
      if (jid === 'status@broadcast' || jid.endsWith('@newsletter')) continue
      try {
        const described = describeProtoMessage(raw.message)
        if (!described) continue
        writeMessage({
          at: new Date().toISOString(),
          direction: 'in',
          externalId: raw.key?.id ?? null,
          chatId: jid,
          chatName: raw.pushName ?? null,
          isGroup: jid.endsWith('@g.us'),
          ...described,
        })
      } catch {
        // Skip the message, keep the socket.
      }
    }
  }

  conn.ev?.on?.('messages.upsert', onUpsert)
}

export default {
  startGatewayBridge,
}
