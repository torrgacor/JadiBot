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

export const settings = {
  // ------------------------------------------
  
  botName: 'Nano MD',
  botAlias: 'Nano',
  
  // ------------------------------------------
  
  ownerName: 'Danz nano',
  ownerNumbers: [
    '6285892928715',
  ],

  // ------------------------------------------

  links: {
    groupLink: 'https://chat.whatsapp.com/CNh9jSc2vpC3aHyQkI2fV2?s=cl&p=a&mlu=4&ilr=4',
    groupId: '120363199179422985@g.us',
    channelLink: 'https://whatsapp.com/channel/0029VbB4spI8vd1RoXcWXm0w',
    channelId: '120363418977603376@newsletter',
    githubLink: '-',
    /* Link promosi — ditempel otomatis di balasan perintah, menu, dan
       pesan tombol. Kosongkan promo ('') kalau tidak ingin ditampilkan.
       promoLabel = keterangan yang tampil, mis. 'Web Jadibot'. */
    promo: 'https://wagetway.danznanooffc.my.id',
    promoLabel: 'Web Jadibot',
  },

  // ------------------------------------------

  defaultPrefix: '.',
  timezone: 'Asia/Jakarta',
  footerText: 'Danz nano',
  footerYear: '2026',
  botVersion: '1.0.0',
  botMode: 'Public',

  sticker: {
    pack: 'Nano MD',
    author: 'Danz nano',
  },

  // Fitur SW HD: hasil selalu dikirim sebagai pesan video.
  // Video kecil di-remux TANPA re-encode; video >50 MB / >30 fps dikompres
  // secukupnya agar muat batas video WhatsApp, dengan RESOLUSI TETAP ASLI.
  swhd: {
    brand: 'NANO SW HD V8',
    remuxTimeout: 120,    // detik, batas waktu remux (copy codec, cepat)
    kompresRasio: 0.75,   // batas ukuran hasil: min. 25% lebih kecil, tetap di bawah 50 MB
  },

  messageRouting: {
    respondToSelf: true,
  },

  pairingNumber: '6285147107037',

  // ------------------------------------------

  menuImage: 'awang.jpg',
  replyVariant: 1,

  // ------------------------------------------

  donation: {
    danaNumber: '085892928715',
    danaName: 'AN*** R****',
    qrisImage: 'qris.jpg',
  },

  // ------------------------------------------
  
  menuGreeting: (name) => `┇👋 Hai welcome saya ${name}!`,
  menuDescription: [
    `┇ WhatsApp Bot pintar & multifungsi`,
    '┇ Dirancang untuk memudahkan harimu',
    '┇ Semua fitur sudah aktif dan lengkap',
  ],
  menuFeatures: [
    'edukasi pelajaran',
    'mengunduh media',
    'bermain game',
    'menjaga group',
    'dan masih banyak lagi!!',
  ],
}

export default settings
