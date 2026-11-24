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


const handler = async (m, { conn }) => {
  const metadata = await conn.groupMetadata(m.chat)
  const admins = metadata.participants.filter((p) => p.admin).length

  const text = [
    `*${metadata.subject}*`,
    '',
    `Anggota  : ${metadata.participants.length}`,
    `Admin    : ${admins}`,
    `Dibuat   : ${new Date(metadata.creation * 1000).toLocaleDateString('id-ID')}`,
    metadata.desc ? `\nDeskripsi:\n${metadata.desc}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  await conn.sendMessage(m.chat, { text }, { quoted: m.raw })
}

handler.command = /^groupinfo$/i
handler.help = ['groupinfo']
handler.tags = ['group']
handler.description = 'Menampilkan informasi group'
handler.groupOnly = true

export default handler
