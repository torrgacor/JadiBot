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

import { printBanner, printStatus, printSection } from './tampilan/banner.js'
import { loadAllPlugins, watchPlugins, pluginStore } from './core/pemuat-plugin.js'
import { startConnection } from './core/connection.js'
import { attachMessageRouter } from './core/router-pesan.js'
import { mulaiLoopPengingat } from './lib/pengingat.js'
import { attachAnticallHandler } from './core/anticall-handler.js'
import { attachWelcomeHandler } from './core/welcome-handler.js'
import { initializeGroupScheduler } from './core/group-scheduler.js'
import { ensurePlayDependencies } from './scripts/ensure-play-deps.js'

async function bootstrap() {
  await printBanner()

  await ensurePlayDependencies()

  printSection('Memuat Plugin')
  const { total, loaded } = await loadAllPlugins()
  printStatus(`${loaded} dari ${total} plugin berhasil dimuat`, loaded === total ? 'success' : 'warn')

  watchPlugins({
    onReload: (event, file) => {
      const labels = { added: 'ditambahkan', changed: 'diperbarui', removed: 'dihapus' }
      printStatus(`Plugin ${labels[event] || event}: ${file}`, 'info')
    },
  })

  setInterval(async () => {
    const before = pluginStore.size
    const { handlers } = await loadAllPlugins()
    if (handlers !== before) {
      printStatus(`Pemindaian ulang plugin: ${handlers} handler aktif (sebelumnya ${before})`, 'info')
    }
  }, 2 * 60 * 1000)

  printSection('Menghubungkan ke WhatsApp')
  await startConnection({
    onReady: (activeConn) => {
      // ── NANO GATEWAY BRIDGE HOOK (injected, do not edit) ──
      // Inert unless NANO_GATEWAY_BRIDGE_DIR is set, so stock runs are unaffected.
      import('./core/gateway-bridge.js')
        .then((m) => m.startGatewayBridge(activeConn))
        .catch((e) => console.log('GATEWAY_BRIDGE_ERROR=' + (e?.message || e)))

      attachMessageRouter(activeConn)
      attachAnticallHandler(activeConn)
      attachWelcomeHandler(activeConn)
      initializeGroupScheduler(activeConn)
      mulaiLoopPengingat(activeConn)
      printStatus('Message router aktif — bot siap menerima perintah.', 'success')
    },
  })
}

bootstrap().catch((err) => {
  console.error('Gagal menjalankan bot:', err)
  process.exit(1)
})
