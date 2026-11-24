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
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Lets NANO GATEWAY give each bot its own users/prefixes/group-settings
// database while sharing one code installation. Unset → identical to stock
// behaviour. Backup: .gateway-patch-backup/
const DB_DIR = process.env.NANO_DATA_DIR
  ? path.resolve(process.env.NANO_DATA_DIR)
  : path.join(__dirname, '..', 'data', 'database')
const DB_PATH = path.join(DB_DIR, 'nano.sqlite')

let db = null

function applySchema(instance) {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      jid TEXT PRIMARY KEY,
      pushName TEXT,
      registeredAt INTEGER NOT NULL,
      limitCount INTEGER NOT NULL DEFAULT 10,
      limitResetAt INTEGER NOT NULL DEFAULT 0,
      premium INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS limit_reservations (
      id TEXT PRIMARY KEY,
      jid TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      expiresAt INTEGER NOT NULL,
      windowResetAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_limit_reservations_user_window
      ON limit_reservations (jid, windowResetAt, expiresAt);

    CREATE TABLE IF NOT EXISTS prefixes (
      chatId TEXT PRIMARY KEY,
      prefix TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS anticall_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_welcome (
      chatId TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_antilink (
      chatId TEXT PRIMARY KEY,
      gc_enabled INTEGER NOT NULL DEFAULT 0,
      ch_enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS auto_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      typing INTEGER NOT NULL DEFAULT 0,
      read INTEGER NOT NULL DEFAULT 0,
      react INTEGER NOT NULL DEFAULT 0,
      emoji TEXT
    );

    CREATE TABLE IF NOT EXISTS owners (
      number TEXT PRIMARY KEY,
      addedAt INTEGER NOT NULL,
      addedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS antilink_strikes (
      chatId TEXT NOT NULL,
      senderJid TEXT NOT NULL,
      type TEXT NOT NULL,
      strikes INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      PRIMARY KEY (chatId, senderJid, type)
    );

    CREATE TABLE IF NOT EXISTS group_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupId TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('open', 'closed')),
      executeAt INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      createdBy TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'running', 'done', 'cancelled', 'failed')),
      attempts INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      lastError TEXT,
      runnerToken TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_group_schedules_status_time
      ON group_schedules (status, executeAt);

    CREATE INDEX IF NOT EXISTS idx_group_schedules_group
      ON group_schedules (groupId, status, executeAt);
  `)

  const userColumns = instance.prepare('PRAGMA table_info(users)').all()
  if (!userColumns.some((column) => column.name === 'limitCount')) {
    instance.exec('ALTER TABLE users ADD COLUMN limitCount INTEGER NOT NULL DEFAULT 10')
  }
  if (!userColumns.some((column) => column.name === 'limitResetAt')) {
    instance.exec('ALTER TABLE users ADD COLUMN limitResetAt INTEGER NOT NULL DEFAULT 0')
  }
  if (!userColumns.some((column) => column.name === 'premium')) {
    instance.exec('ALTER TABLE users ADD COLUMN premium INTEGER NOT NULL DEFAULT 0')
  }

  const groupScheduleColumns = instance.prepare('PRAGMA table_info(group_schedules)').all()
  if (!groupScheduleColumns.some((column) => column.name === 'runnerToken')) {
    instance.exec('ALTER TABLE group_schedules ADD COLUMN runnerToken TEXT')
  }

  /* auto_status diperkenalkan sudah lengkap, jadi migrasi ini hanya
     berjaga-jaga kalau suatu saat ada versi lama tabelnya — tanpa ini,
     SELECT kolom yang belum ada akan membuat satu pesan meledak dan
     setrika fitur otomatis untuk semua chat. */
  const autoColumns = instance.prepare('PRAGMA table_info(auto_status)').all()
  for (const [column, deklarasi] of [
    ['read', 'INTEGER NOT NULL DEFAULT 0'],
    ['react', 'INTEGER NOT NULL DEFAULT 0'],
    ['emoji', 'TEXT'],
  ]) {
    if (!autoColumns.some((item) => item.name === column)) {
      instance.exec(`ALTER TABLE auto_status ADD COLUMN ${column} ${deklarasi}`)
    }
  }
}

function readLegacyJson(filePath) {
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal baca database lama "${path.basename(filePath)}": ${err.message}`)
    return null
  }
}

function markMigrated(filePath) {
  try {
    fs.renameSync(filePath, `${filePath}.migrated`)
  } catch {

  }
}

function migrateLegacyData(instance) {
  const userCount = instance.prepare('SELECT COUNT(*) AS total FROM users').get().total
  const usersJsonPath = path.join(DB_DIR, 'users.json')

  if (userCount === 0) {
    const legacyUsers = readLegacyJson(usersJsonPath)
    if (legacyUsers && Object.keys(legacyUsers).length) {
      const insertUser = instance.prepare(
        'INSERT OR IGNORE INTO users (jid, pushName, registeredAt) VALUES (?, ?, ?)'
      )
      const insertMany = instance.transaction((entries) => {
        for (const [jid, data] of entries) {
          insertUser.run(jid, data?.pushName ?? null, data?.registeredAt ?? Date.now())
        }
      })
      insertMany(Object.entries(legacyUsers))
      console.log(`  \x1b[32m✓\x1b[0m  Migrasi database: ${Object.keys(legacyUsers).length} user dipindah dari users.json ke SQLite`)
    }
  }
  if (fs.existsSync(usersJsonPath)) markMigrated(usersJsonPath)

  const prefixCount = instance.prepare('SELECT COUNT(*) AS total FROM prefixes').get().total
  const prefixJsonPath = path.join(DB_DIR, 'prefix.json')

  if (prefixCount === 0) {
    const legacyPrefixes = readLegacyJson(prefixJsonPath)
    if (legacyPrefixes && Object.keys(legacyPrefixes).length) {
      const insertPrefix = instance.prepare(
        'INSERT OR IGNORE INTO prefixes (chatId, prefix) VALUES (?, ?)'
      )
      const insertMany = instance.transaction((entries) => {
        for (const [chatId, prefix] of entries) {
          insertPrefix.run(chatId, prefix)
        }
      })
      insertMany(Object.entries(legacyPrefixes))
      console.log(`  \x1b[32m✓\x1b[0m  Migrasi database: ${Object.keys(legacyPrefixes).length} prefix custom dipindah dari prefix.json ke SQLite`)
    }
  }
  if (fs.existsSync(prefixJsonPath)) markMigrated(prefixJsonPath)
}

export function getDb() {
  if (db) return db

  fs.mkdirSync(DB_DIR, { recursive: true })

  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  applySchema(db)
  migrateLegacyData(db)

  return db
}

export default { getDb }
