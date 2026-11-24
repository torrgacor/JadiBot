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

import { pluginStore, getAllCategories } from '../../core/pemuat-plugin.js'
import { countCategoryCommands } from '../../lib/menu.js'
import { sendNativeRichTable } from '../../lib/rich-table.js'

const handler = async (m, { conn, usedPrefix = '.' }) => {
  try {
    /* dihitung dari jumlah PERINTAH-nya, sejalan dengan angka di menu —
       bukan dari banyaknya berkas plugin. */
    const kategori = getAllCategories()
      .map((key) => ({ key, jumlah: countCategoryCommands(key, usedPrefix) }))
      .filter((item) => item.jumlah > 0)
      .sort((a, b) => b.jumlah - a.jumlah || a.key.localeCompare(b.key))

    const total = kategori.reduce((jumlah, item) => jumlah + item.jumlah, 0)
    const pluginAktif = [...pluginStore.values()].filter((plugin) => plugin.disabled !== true).length

    const tableData = kategori.map(({ key, jumlah }) => {
      const percentage = total ? ((jumlah / total) * 100).toFixed(1) : '0.0'

      return [
        key.toUpperCase(),
        String(jumlah),
        `${percentage}%`,
      ]
    })

    const reactionKey = m?.raw?.key || m?.key

    if (reactionKey) {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '📊',
            key: reactionKey,
          },
        },
      ).catch(() => {})
    }

    await sendNativeRichTable(
      conn,
      m.chat,
      'Distribusi Fitur',
      ['Kategori', 'Jumlah', 'Persentase'],
      tableData,
      m.raw,
      {
        headerText: `Total: ${total} fitur · Kategori: ${kategori.length}`,
        footer: `${pluginAktif} plugin aktif · Total ${total} fitur terdaftar`,
      },
    )
  } catch (error) {
    const reactionKey = m?.raw?.key || m?.key

    if (reactionKey) {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '⚠️',
            key: reactionKey,
          },
        },
      ).catch(() => {})
    }

    await m.reply(
      `╭─「 NANO • TOTAL FITUR 」\n` +
      `│\n` +
      `│ Tidak dapat menampilkan distribusi fitur.\n` +
      `│\n` +
      `│ ${error?.message || 'Terjadi kesalahan yang tidak diketahui.'}\n` +
      `╰────────────────────╯`
    )
  }
}

handler.command = /^(totalfitur|totalfeature|totalcmd|countplugin|distribusi)$/i
handler.help = [
  'totalfitur',
  'totalfeature',
  'totalcmd',
  'countplugin',
  'distribusi',
]
handler.tags = ['main']
handler.category = 'main'
handler.description = 'Lihat total fitur dan distribusi kategori bot'

export default handler
