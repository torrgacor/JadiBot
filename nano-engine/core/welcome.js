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

import { getDb } from './sqlite.js'

export const MAX_MESSAGE_LENGTH = 1500

export const MESSAGE_PLACEHOLDERS = ['{name}', '{number}', '{group}', '{mention}', '{total}', '{bot}']

export const MESSAGE_KINDS = ['welcome', 'left']

// Kolom penyimpanan teks kustom per jenis pesan. Nama kolom diambil dari daftar
// tetap di bawah ini (bukan dari input pengguna), jadi aman dipakai di ALTER TABLE.
const KIND_COLUMNS = {
  welcome: 'message',
  left: 'left_message',
}

const PLACEHOLDER_ALIASES = {
  name: 'name',
  nama: 'name',
  number: 'number',
  nomor: 'number',
  group: 'group',
  grup: 'group',
  mention: 'mention',
  tag: 'mention',
  total: 'total',
  member: 'total',
  bot: 'bot',
  botname: 'bot',
}

const PLACEHOLDER_PATTERN = new RegExp(`\\{(${Object.keys(PLACEHOLDER_ALIASES).join('|')})\\}`, 'gi')

// Kolom teks kustom ditambahkan di kode (bukan hanya di skema) supaya database
// yang sudah terpasang ikut ter-Update tanpa perlu reset data group.
let customColumnsReady = false

function resolveKind(kind) {
  return MESSAGE_KINDS.includes(kind) ? kind : ''
}

function welcomeDb() {
  const db = getDb()
  if (customColumnsReady) return db

  const columns = db.prepare('PRAGMA table_info(group_welcome)').all().map((column) => column.name)
  for (const column of Object.values(KIND_COLUMNS)) {
    if (!columns.includes(column)) db.exec(`ALTER TABLE group_welcome ADD COLUMN ${column} TEXT`)
  }

  customColumnsReady = true
  return db
}

export function isWelcomeEnabled(groupId) {
  if (!groupId) return false
  const row = welcomeDb().prepare('SELECT enabled FROM group_welcome WHERE chatId = ?').get(groupId)
  return Boolean(row?.enabled)
}

export function setWelcomeEnabled(groupId, enabled) {
  if (!groupId) throw new Error('Group ID tidak valid')
  welcomeDb()
    .prepare(`
      INSERT INTO group_welcome (chatId, enabled)
      VALUES (?, ?)
      ON CONFLICT(chatId) DO UPDATE SET enabled = excluded.enabled
    `)
    .run(groupId, enabled ? 1 : 0)

  return Boolean(enabled)
}

export function getWelcomeStatus(groupId) {
  return isWelcomeEnabled(groupId)
}

function readMessage(kind, groupId) {
  const column = KIND_COLUMNS[resolveKind(kind)]
  if (!column || !groupId) return ''
  const row = welcomeDb().prepare(`SELECT ${column} AS text FROM group_welcome WHERE chatId = ?`).get(groupId)
  return typeof row?.text === 'string' ? row.text : ''
}

function writeMessage(kind, groupId, message) {
  const name = resolveKind(kind)
  const column = KIND_COLUMNS[name]
  if (!column) throw new Error('Jenis pesan tidak dikenal')
  if (!groupId) throw new Error('Group ID tidak valid')

  const value = String(message ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')
    .trim()

  if (!value) {
    welcomeDb()
      .prepare(`
        INSERT INTO group_welcome (chatId, enabled, ${column})
        VALUES (?, 0, NULL)
        ON CONFLICT(chatId) DO UPDATE SET ${column} = NULL
      `)
      .run(groupId)
    return ''
  }

  if (value.length > MAX_MESSAGE_LENGTH) {
    const label = name === 'left' ? 'Teks perpisahan' : 'Teks welcome'
    throw new Error(`${label} maksimal ${MAX_MESSAGE_LENGTH} karakter (sekarang ${value.length})`)
  }

  welcomeDb()
    .prepare(`
      INSERT INTO group_welcome (chatId, enabled, ${column})
      VALUES (?, 0, ?)
      ON CONFLICT(chatId) DO UPDATE SET ${column} = excluded.${column}
    `)
    .run(groupId, value)

  return value
}

// Teks sambutan member baru ('' = masih memakai kartu bawaan).
export function getWelcomeMessage(groupId) {
  return readMessage('welcome', groupId)
}

export function setWelcomeMessage(groupId, message) {
  return writeMessage('welcome', groupId, message)
}

export function clearWelcomeMessage(groupId) {
  return writeMessage('welcome', groupId, '')
}

// Teks perpisahan member keluar ('' = masih memakai kartu bawaan).
export function getLeftMessage(groupId) {
  return readMessage('left', groupId)
}

export function setLeftMessage(groupId, message) {
  return writeMessage('left', groupId, message)
}

export function clearLeftMessage(groupId) {
  return writeMessage('left', groupId, '')
}

function messageConfig(kind, groupId) {
  const name = resolveKind(kind)
  if (!groupId || !name) return { enabled: false, message: '' }

  const row = welcomeDb()
    .prepare(`SELECT enabled, ${KIND_COLUMNS[name]} AS text FROM group_welcome WHERE chatId = ?`)
    .get(groupId)

  return {
    enabled: Boolean(row?.enabled),
    message: typeof row?.text === 'string' ? row.text : '',
  }
}

export function getWelcomeConfig(groupId) {
  return messageConfig('welcome', groupId)
}

export function getLeftConfig(groupId) {
  return messageConfig('left', groupId)
}

/*
  Ganti placeholder {name} {number} {group} {mention} {total} {bot} dengan nilai asli.
  Placeholder yang tidak dikenal dibiarkan apa adanya agar tulisan admin tidak hilang.
*/
export function renderMessage(template, values = {}) {
  return String(template ?? '').replace(PLACEHOLDER_PATTERN, (match, key) => {
    const canonical = PLACEHOLDER_ALIASES[String(key).toLowerCase()]
    if (!canonical || !Object.prototype.hasOwnProperty.call(values, canonical)) return match

    const value = values[canonical]
    return value === undefined || value === null ? match : String(value)
  })
}

export default {
  isWelcomeEnabled,
  setWelcomeEnabled,
  getWelcomeStatus,
  getWelcomeMessage,
  setWelcomeMessage,
  clearWelcomeMessage,
  getLeftMessage,
  setLeftMessage,
  clearLeftMessage,
  getWelcomeConfig,
  getLeftConfig,
  renderMessage,
}
