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

import { getDb } from '../../core/sqlite.js'

let schemaReady = false

function ensureSchema() {
  if (schemaReady) return
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS rpg_users (
      jid TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rpg_guilds (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rpg_cooldowns (
      jid TEXT NOT NULL,
      command TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      PRIMARY KEY (jid, command)
    );

    CREATE TABLE IF NOT EXISTS rpg_market (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rpg_meta (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
  `)

  schemaReady = true
}

function cleanJid(jid = '') {
  return String(jid).split('@')[0]
}

function defaultUser(jid) {
  return {
    jid,
    koin: 0,
    exp: 0,
    level: 1,
    inventory: {},
    settings: {},
    rpg: {
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      stamina: 100,
      maxStamina: 100,
      lastStaminaCheck: Date.now(),
      attack: 10,
      defense: 5,
      speed: 10,
      luck: 5,
      spouse: null,
      marriedAt: null,
      love: 0,
      guildId: null,
      pet: null,
      petStorage: [],
      enchants: {},
      expeditions: [],
      garden: { plots: [], maxPlots: 3 },
      dailyChallenge: null,
      buffs: {},
      lastDaily: 0,
      lastHourly: 0,
    },
    cooldowns: {},
    quest: {},
  }
}

function mergeDefaults(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : [...base]
  if (!base || typeof base !== 'object') return saved === undefined ? base : saved
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { ...base }

  const result = { ...base }
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) continue
    result[key] = base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])
      ? mergeDefaults(base[key], value)
      : value
  }
  return result
}

function normalizeUser(user) {
  user.koin = Math.max(0, Number(user.koin) || 0)
  user.exp = Math.max(0, Number(user.exp) || 0)
  user.level = Math.max(1, Math.floor(Number(user.level) || 1))
  user.inventory = user.inventory && typeof user.inventory === 'object' ? user.inventory : {}
  user.quest = user.quest && typeof user.quest === 'object' ? user.quest : {}
  user.rpg = user.rpg && typeof user.rpg === 'object' ? user.rpg : {}
  for (const key of ['health', 'maxHealth', 'mana', 'maxMana', 'stamina', 'maxStamina', 'attack', 'defense', 'speed', 'luck']) {
    user.rpg[key] = Math.max(0, Number(user.rpg[key]) || 0)
  }
  user.rpg.maxHealth = Math.max(1, Number(user.rpg.maxHealth) || 100)
  user.rpg.maxMana = Math.max(1, Number(user.rpg.maxMana) || 100)
  user.rpg.maxStamina = Math.max(1, Number(user.rpg.maxStamina) || 100)
  user.rpg.health = Math.min(Math.max(0, Number(user.rpg.health) || 0), user.rpg.maxHealth)
  user.rpg.mana = Math.min(Math.max(0, Number(user.rpg.mana) || 0), user.rpg.maxMana)
  user.rpg.stamina = Math.min(Math.max(0, Number(user.rpg.stamina) || 0), user.rpg.maxStamina)
  user.rpg.level = Math.max(1, Math.floor(Number(user.rpg.level) || user.level || 1))
  user.rpg.garden = user.rpg.garden && typeof user.rpg.garden === 'object' ? user.rpg.garden : { plots: [], maxPlots: 3 }
  user.rpg.garden.plots = Array.isArray(user.rpg.garden.plots) ? user.rpg.garden.plots : []
  user.rpg.garden.maxPlots = Math.max(1, Number(user.rpg.garden.maxPlots) || 3)
  user.rpg.expeditions = Array.isArray(user.rpg.expeditions) ? user.rpg.expeditions : []
  user.rpg.petStorage = Array.isArray(user.rpg.petStorage) ? user.rpg.petStorage : []
  user.rpg.buffs = user.rpg.buffs && typeof user.rpg.buffs === 'object' ? user.rpg.buffs : {}
  return user
}

const JAIL_DEFAULT_REASON = 'Kriminal'
const WANTED_DECAY_MS = 30 * 60 * 1000

function isJailed(user) {
  if (!user?.rpg?.jail) return false
  if (user.rpg.jail.until <= Date.now()) {
    user.rpg.jail = null
    return false
  }
  return true
}

function setJail(user, durationMs, reason = JAIL_DEFAULT_REASON) {
  if (!user.rpg) user.rpg = {}
  user.rpg.jail = { until: Date.now() + durationMs, reason, at: Date.now() }
  user.rpg.jailEver = true
  return user.rpg.jail
}

function getWantedLevel(user) {
  const wanted = user?.rpg?.wanted
  if (!wanted) return 0

  const elapsed = Date.now() - (Number(wanted.updatedAt) || 0)
  const decay = Math.floor(elapsed / WANTED_DECAY_MS)

  if (decay > 0) {
    wanted.level = Math.max(0, (Number(wanted.level) || 0) - decay)
    wanted.updatedAt = (Number(wanted.updatedAt) || 0) + decay * WANTED_DECAY_MS
    if (wanted.level <= 0) {
      user.rpg.wanted = null
      return 0
    }
  }

  return Number(wanted.level) || 0
}

function addWanted(user, amount = 1, reason = '') {
  if (!user.rpg) user.rpg = {}
  const current = getWantedLevel(user)
  user.rpg.wanted = {
    level: Math.min(5, current + amount),
    updatedAt: Date.now(),
    reason: reason || user.rpg.wanted?.reason || '',
  }
  return user.rpg.wanted.level
}

function clearWanted(user) {
  if (user?.rpg) user.rpg.wanted = null
  return 0
}

const STAMINA_REGEN_PER_HOUR = 5

function applyPassiveStaminaRegen(user) {
  const lastCheck = user.rpg.lastStaminaCheck || Date.now()
  const now = Date.now()
  const hoursPassed = (now - lastCheck) / 3_600_000

  if (hoursPassed >= 1) {
    const regenAmount = Math.floor(hoursPassed * STAMINA_REGEN_PER_HOUR)
    if (regenAmount > 0 && user.rpg.stamina < user.rpg.maxStamina) {
      user.rpg.stamina = Math.min(user.rpg.maxStamina, user.rpg.stamina + regenAmount)
    }
    user.rpg.lastStaminaCheck = now
  }

  return user
}

function getUser(jid) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const row = db.prepare('SELECT data FROM rpg_users WHERE jid = ?').get(key)

  if (!row) {
    return defaultUser(key)
  }

  try {
    const saved = JSON.parse(row.data)
    const user = normalizeUser(applyPassiveStaminaRegen(mergeDefaults(defaultUser(key), saved)))
    const nextPayload = JSON.stringify(user)
    if (nextPayload !== row.data) {
      db.prepare('UPDATE rpg_users SET data = ? WHERE jid = ?').run(nextPayload, key)
    }
    return user
  } catch {
    return defaultUser(key)
  }
}

function saveUser(jid, userData) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const payload = JSON.stringify(userData)

  db.prepare(
    `INSERT INTO rpg_users (jid, data) VALUES (?, ?)
     ON CONFLICT(jid) DO UPDATE SET data = excluded.data`
  ).run(key, payload)
}

function getGuild(guildId) {
  ensureSchema()
  const db = getDb()
  const row = db.prepare('SELECT data FROM rpg_guilds WHERE id = ?').get(guildId)
  if (!row) return null
  try {
    return JSON.parse(row.data)
  } catch {
    return null
  }
}

function saveGuild(guildId, guildData) {
  ensureSchema()
  const db = getDb()
  const payload = JSON.stringify(guildData)
  db.prepare(
    `INSERT INTO rpg_guilds (id, data) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data`
  ).run(guildId, payload)
}

function deleteGuild(guildId) {
  ensureSchema()
  const db = getDb()
  db.prepare('DELETE FROM rpg_guilds WHERE id = ?').run(guildId)
}

function getAllUsers() {
  ensureSchema()
  const db = getDb()
  return db.prepare('SELECT jid, data FROM rpg_users').all().map((row) => {
    try {
      return normalizeUser(mergeDefaults(defaultUser(row.jid), JSON.parse(row.data)))
    } catch {
      return null
    }
  }).filter(Boolean)
}

function cleanupExpiredCooldowns() {
  ensureSchema()
  return getDb().prepare('DELETE FROM rpg_cooldowns WHERE expiresAt <= ?').run(Date.now()).changes
}

function getMarketListing(listingId) {
  ensureSchema()
  const row = getDb().prepare('SELECT data FROM rpg_market WHERE id = ?').get(listingId)
  if (!row) return null
  try {
    return JSON.parse(row.data)
  } catch {
    return null
  }
}

function saveMarketListing(listingData) {
  ensureSchema()
  const payload = JSON.stringify(listingData)
  getDb().prepare(
    `INSERT INTO rpg_market (id, data) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data`
  ).run(listingData.id, payload)
}

function getMeta(metaKey) {
  ensureSchema()
  const row = getDb().prepare('SELECT data FROM rpg_meta WHERE key = ?').get(metaKey)
  if (!row) return null
  try {
    return JSON.parse(row.data)
  } catch {
    return null
  }
}

function setMeta(metaKey, value) {
  ensureSchema()
  const payload = JSON.stringify(value)
  getDb().prepare(
    `INSERT INTO rpg_meta (key, data) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET data = excluded.data`
  ).run(metaKey, payload)
}

function deleteMarketListing(listingId) {
  ensureSchema()
  return getDb().prepare('DELETE FROM rpg_market WHERE id = ?').run(listingId).changes
}

function getAllMarketListings() {
  ensureSchema()
  return getDb().prepare('SELECT data FROM rpg_market').all()
    .map((row) => {
      try {
        return JSON.parse(row.data)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function getAllGuilds() {
  ensureSchema()
  const db = getDb()
  const rows = db.prepare('SELECT data FROM rpg_guilds').all()
  return rows
    .map((r) => {
      try {
        return JSON.parse(r.data)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function findGuildByName(name) {
  return getAllGuilds().find((g) => g.name.toLowerCase() === String(name).toLowerCase()) || null
}

function checkCooldown(jid, commandName) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const row = db
    .prepare('SELECT expiresAt FROM rpg_cooldowns WHERE jid = ? AND command = ?')
    .get(key, commandName)

  if (!row) return { onCooldown: false, remaining: 0 }

  const now = Date.now()
  if (row.expiresAt <= now) {
    db.prepare('DELETE FROM rpg_cooldowns WHERE jid = ? AND command = ?').run(key, commandName)
    return { onCooldown: false, remaining: 0 }
  }

  return { onCooldown: true, remaining: row.expiresAt - now }
}

function setCooldown(jid, commandName, durationMs) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const expiresAt = Date.now() + durationMs

  db.prepare(
    `INSERT INTO rpg_cooldowns (jid, command, expiresAt) VALUES (?, ?, ?)
     ON CONFLICT(jid, command) DO UPDATE SET expiresAt = excluded.expiresAt`
  ).run(key, commandName, expiresAt)
}

function extendCooldown(jid, commandName, extraMs) {
  const current = checkCooldown(jid, commandName)
  const base = current.onCooldown ? Date.now() + current.remaining : Date.now()
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const expiresAt = base + extraMs

  db.prepare(
    `INSERT INTO rpg_cooldowns (jid, command, expiresAt) VALUES (?, ?, ?)
     ON CONFLICT(jid, command) DO UPDATE SET expiresAt = excluded.expiresAt`
  ).run(key, commandName, expiresAt)
}

export {
  getUser,
  saveUser,
  getGuild,
  saveGuild,
  deleteGuild,
  getAllUsers,
  getAllGuilds,
  getMarketListing,
  saveMarketListing,
  deleteMarketListing,
  getAllMarketListings,
  getMeta,
  setMeta,
  cleanupExpiredCooldowns,
  findGuildByName,
  isJailed,
  setJail,
  getWantedLevel,
  addWanted,
  clearWanted,
  checkCooldown,
  setCooldown,
  extendCooldown,
  cleanJid,
}

export default {
  getUser,
  saveUser,
  getGuild,
  saveGuild,
  deleteGuild,
  getAllUsers,
  getAllGuilds,
  getMarketListing,
  saveMarketListing,
  deleteMarketListing,
  getAllMarketListings,
  getMeta,
  setMeta,
  cleanupExpiredCooldowns,
  findGuildByName,
  isJailed,
  setJail,
  getWantedLevel,
  addWanted,
  clearWanted,
  checkCooldown,
  setCooldown,
  extendCooldown,
  cleanJid,
}
