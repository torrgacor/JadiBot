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

const ACHIEVEMENTS = [
  { id: 'first_win', name: 'Langkah Pertama', icon: '🌱', desc: 'Menangkan fitur RPG pertamamu', stat: 'rpgWins', goal: 1, reward: 1000 },
  { id: 'veteran', name: 'Veteran', icon: '⚔️', desc: 'Menangkan 25 aksi RPG', stat: 'rpgWins', goal: 25, reward: 10000 },
  { id: 'legendary', name: 'Legendaris', icon: '🏆', desc: 'Menangkan 100 aksi RPG', stat: 'rpgWins', goal: 100, reward: 50000 },
  { id: 'miner', name: 'Penambang', icon: '⛏️', desc: 'Menambang 10 kali', stat: 'miningCount', goal: 10, reward: 2500 },
  { id: 'fisherman', name: 'Nelayan', icon: '🎣', desc: 'Memancing 10 kali', stat: 'fishingCount', goal: 10, reward: 2500 },
  { id: 'hunter', name: 'Pemburu', icon: '🏹', desc: 'Berburu 10 kali', stat: 'huntCount', goal: 10, reward: 2500 },
  { id: 'farmer', name: 'Petani', icon: '🌾', desc: 'Panen 10 kali', stat: 'harvestCount', goal: 10, reward: 2500 },
  { id: 'woodcutter', name: 'Penebang', icon: '🪓', desc: 'Menebang 10 kali', stat: 'woodcutCount', goal: 10, reward: 2500 },
  { id: 'boss_slayer', name: 'Pembunuh Boss', icon: '🐲', desc: 'Kalahkan 5 boss', stat: 'bossKills', goal: 5, reward: 15000 },
  { id: 'duelist', name: 'Duelis', icon: '🤺', desc: 'Menang 10 duel', stat: 'duelWins', goal: 10, reward: 8000 },
  { id: 'gambler', name: 'Penjudi', icon: '🎰', desc: 'Berjudi 20 kali', stat: 'gambleCount', goal: 20, reward: 6000 },
  { id: 'criminal', name: 'Kriminal', icon: '🦹', desc: 'Melakukan 10 kejahatan', stat: 'crimeCount', goal: 10, reward: 5000 },
  { id: 'jailbird', name: 'Penghuni Bui', icon: '⛓️', desc: 'Pernah dipenjara', stat: 'jailedCount', goal: 1, reward: 3000 },
  { id: 'wanted_star', name: 'Buronan Bintang 3', icon: '🌟', desc: 'Capai wanted level 3', stat: 'wantedMax', goal: 3, reward: 10000 },
  { id: 'tycoon', name: 'Sultan', icon: '💰', desc: 'Pegang 100.000 koin sekaligus', check: (u) => (Number(u.koin) || 0) >= 100000, reward: 20000 },
  { id: 'trader', name: 'Pedagang', icon: '🏪', desc: 'Transaksi 5 kali di Pasar Pemain', stat: 'marketTrades', goal: 5, reward: 8000 },
  { id: 'raider', name: 'Panglima Perang', icon: '🏰', desc: 'Menangkan 3 Guild Raid', stat: 'raidWins', goal: 3, reward: 25000 },
  { id: 'guild_member', name: 'Anggota Guild', icon: '🛡️', desc: 'Bergabung dengan sebuah guild', stat: 'guildJoin', goal: 1, reward: 3000 },
  { id: 'level_10', name: 'Petualang Muda', icon: '⭐', desc: 'Capai level 10', check: (u) => (Number(u.level) || 1) >= 10, reward: 5000 },
  { id: 'level_50', name: 'Sang Juara', icon: '👑', desc: 'Capai level 50', check: (u) => (Number(u.level) || 1) >= 50, reward: 40000 },
]

const STAT_ALIASES = {
  win: 'rpgWins',
  mine: 'miningCount',
  fishing: 'fishingCount',
  fish: 'fishingCount',
  hunt: 'huntCount',
  harvest: 'harvestCount',
  woodcut: 'woodcutCount',
  boss: 'bossKills',
  duel: 'duelWins',
  gamble: 'gambleCount',
  crime: 'crimeCount',
}

function ensureStats(user) {
  if (!user.rpg) user.rpg = {}
  if (!user.rpg.stats || typeof user.rpg.stats !== 'object') user.rpg.stats = {}
  if (!user.rpg.achievements || typeof user.rpg.achievements !== 'object') user.rpg.achievements = {}
  return user.rpg.stats
}

function trackStat(user, key, amount = 1) {
  const resolved = STAT_ALIASES[key] || key
  const stats = ensureStats(user)
  stats[resolved] = (Number(stats[resolved]) || 0) + amount
  return stats[resolved]
}

function setStatMax(user, key, value) {
  const resolved = STAT_ALIASES[key] || key
  const stats = ensureStats(user)
  stats[resolved] = Math.max(Number(stats[resolved]) || 0, Number(value) || 0)
  return stats[resolved]
}

function getStat(user, key) {
  const resolved = STAT_ALIASES[key] || key
  return Number(user?.rpg?.stats?.[resolved]) || 0
}

function checkAchievements(user) {
  const stats = ensureStats(user)
  const unlocked = user.rpg.achievements
  const gained = []

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked[achievement.id]) continue

    const achieved = typeof achievement.check === 'function'
      ? achievement.check(user)
      : (Number(stats[achievement.stat]) || 0) >= achievement.goal

    if (!achieved) continue

    unlocked[achievement.id] = Date.now()
    user.koin = (Number(user.koin) || 0) + (achievement.reward || 0)
    gained.push(achievement)
  }

  return gained
}

function listAchievements(user) {
  const unlocked = user?.rpg?.achievements || {}
  const stats = user?.rpg?.stats || {}
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: Boolean(unlocked[achievement.id]),
    unlockedAt: unlocked[achievement.id] || null,
    progress: typeof achievement.check === 'function'
      ? (achievement.check(user) ? achievement.goal : 0)
      : Math.min(Number(stats[achievement.stat]) || 0, achievement.goal),
  }))
}

export {
  ACHIEVEMENTS,
  trackStat,
  setStatMax,
  getStat,
  checkAchievements,
  listAchievements,
}

export default {
  ACHIEVEMENTS,
  trackStat,
  setStatMax,
  getStat,
  checkAchievements,
  listAchievements,
}
