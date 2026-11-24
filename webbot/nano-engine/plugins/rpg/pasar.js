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

import {
  getUser,
  saveUser,
  getMarketListing,
  saveMarketListing,
  deleteMarketListing,
  getAllMarketListings,
  cleanJid,
} from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { getItemInfo } from '../../lib/rpg/items.js'
import { cekPenjara } from '../../lib/rpg/penjara.js'
import { trackStat, checkAchievements } from '../../lib/rpg/achievements.js'

const MAX_LISTINGS_PER_USER = 5

function itemName(key) {
  return getItemInfo(key)?.name?.replace(/^[^\p{L}\p{N}]+/u, '') || key
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  if (await cekPenjara(m, user)) return

  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const sellerKey = cleanJid(m.sender)

  if (!action || action === 'list' || action === 'daftar') {
    const listings = getAllMarketListings()
      .filter((listing) => listing.seller !== sellerKey)
      .slice(0, 10)

    if (!listings.length) {
      return m.reply(`Pasar sedang kosong. Jual item dengan \`${m.prefix}pasar jual <item> <jumlah> <harga>\`.`)
    }

    let txt = `🏪 *Pasar Pemain*\n\n`
    for (const listing of listings) {
      txt += `📦 ${itemName(listing.item)} x${listing.qty} — *${rupiah(listing.price)}*\n`
      txt += `   Penjual: @${listing.seller}\n\n`
    }
    txt += `Beli: \`${m.prefix}pasar beli <id>\``

    return m.reply(txt, { mentions: listings.map((listing) => `${listing.seller}@s.whatsapp.net`) })
  }

  if (action === 'jual' || action === 'sell') {
    const item = args[1]?.toLowerCase()
    const qty = parseInt(args[2])
    const price = parseInt(args[3])

    if (!item || !qty || !price) {
      return m.reply(`Format: \`${m.prefix}pasar jual <item> <jumlah> <harga total>\`\nContoh: \`${m.prefix}pasar jual fish 5 10000\``)
    }

    if (qty <= 0 || price < 100) {
      return m.reply(`Jumlah harus > 0 dan harga minimal ${rupiah(100)}.`)
    }

    const owned = user.inventory[item] || 0
    if (owned < qty) {
      return m.reply(`Kamu hanya punya *${owned}* ${itemName(item)}, tidak cukup untuk menjual ${qty}.`)
    }

    const mine = getAllMarketListings().filter((listing) => listing.seller === sellerKey)
    if (mine.length >= MAX_LISTINGS_PER_USER) {
      return m.reply(`Maksimal ${MAX_LISTINGS_PER_USER} listing aktif. Batalkan salah satu dulu dengan \`${m.prefix}pasar batal <id>\`.`)
    }

    user.inventory[item] -= qty
    if (user.inventory[item] <= 0) delete user.inventory[item]
    saveUser(m.sender, user)

    const listingId = `mkt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    saveMarketListing({
      id: listingId,
      seller: sellerKey,
      item,
      qty,
      price,
      createdAt: Date.now(),
    })

    return sendRpgCard(sock, m, {
      type: 'shop',
      headerTitle: 'PASAR PEMAIN',
      headerSubtitle: 'Item dipasarkan',
      data: {
        title: 'LISTING DIBUAT',
        subtitle: itemName(item),
        result: `${itemName(item)} x${qty}`,
        victory: true,
        items: [{ name: `${itemName(item)} x${qty}`, price }],
        stats: [
          { label: 'Item', value: `${itemName(item)} x${qty}`, color: '#68d5ff' },
          { label: 'Harga', value: rupiah(price), color: '#e0c17b' },
          { label: 'ID', value: listingId.slice(-6), color: '#b9a6f2' },
        ],
      },
      body: `${itemName(item)} x${qty} dipasarkan seharga ${rupiah(price)} · ID ${listingId}`,
    })
  }

  if (action === 'beli' || action === 'buy') {
    const listingId = args[1]
    if (!listingId) return m.reply(`Format: \`${m.prefix}pasar beli <id>\``)

    const listing = getMarketListing(listingId)
    if (!listing) return m.reply(`Listing *${listingId}* tidak ditemukan atau sudah terjual.`)

    if (listing.seller === sellerKey) {
      return m.reply(`Itu listing kamu sendiri. Batalkan dengan \`${m.prefix}pasar batal ${listingId}\`.`)
    }

    if (user.koin < listing.price) {
      return m.reply(`Koin tidak cukup. Butuh ${rupiah(listing.price)}, dompet ${rupiah(user.koin)}.`)
    }

    const seller = getUser(listing.seller)

    user.koin -= listing.price
    user.inventory[listing.item] = (user.inventory[listing.item] || 0) + listing.qty
    trackStat(user, 'marketTrades')
    saveUser(m.sender, user)

    seller.koin += listing.price
    trackStat(seller, 'marketTrades')
    saveUser(listing.seller, seller)

    deleteMarketListing(listingId)

    const gained = checkAchievements(user)
    if (gained.length) saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'shop',
      headerTitle: 'PASAR PEMAIN',
      headerSubtitle: 'Pembelian berhasil',
      data: {
        title: 'TRANSAKSI BERHASIL',
        subtitle: itemName(listing.item),
        result: `${itemName(listing.item)} x${listing.qty}`,
        victory: true,
        items: [{ name: `${itemName(listing.item)} x${listing.qty}`, price: listing.price }],
        stats: [
          { label: 'Item', value: `${itemName(listing.item)} x${listing.qty}`, color: '#68d5ff' },
          { label: 'Bayar', value: `-${rupiah(listing.price)}`, color: '#e0c17b' },
          { label: 'Penjual', value: `@${listing.seller}`, color: '#b9a6f2' },
        ],
      },
      body: `Beli ${itemName(listing.item)} x${listing.qty} dari @${listing.seller} · -${rupiah(listing.price)}${gained.length ? ` · ${gained.length} achievement baru` : ''}`,
      mentions: [`${listing.seller}@s.whatsapp.net`],
    })
  }

  if (action === 'batal' || action === 'cancel') {
    const listingId = args[1]
    if (!listingId) return m.reply(`Format: \`${m.prefix}pasar batal <id>\``)

    const listing = getMarketListing(listingId)
    if (!listing) return m.reply(`Listing tidak ditemukan.`)
    if (listing.seller !== sellerKey) return m.reply(`Itu bukan listing kamu.`)

    user.inventory[listing.item] = (user.inventory[listing.item] || 0) + listing.qty
    saveUser(m.sender, user)
    deleteMarketListing(listingId)

    return m.reply(`✅ Listing dibatalkan. ${itemName(listing.item)} x${listing.qty} dikembalikan ke tas.`)
  }

  if (action === 'mine' || action === 'saya') {
    const mine = getAllMarketListings().filter((listing) => listing.seller === sellerKey)
    if (!mine.length) return m.reply(`Kamu tidak punya listing aktif.`)

    let txt = `📦 *Listing Kamu*\n\n`
    for (const listing of mine) {
      txt += `ID: ${listing.id}\n${itemName(listing.item)} x${listing.qty} — ${rupiah(listing.price)}\n\n`
    }
    return m.reply(txt)
  }
}

handler.command = /^(pasar|market)$/i
handler.help = ['pasar', 'market']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Pasar jual-beli item antar pemain'

export default handler
