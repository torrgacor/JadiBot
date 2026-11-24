/**
 * Nano engine doctor.
 *
 * Checks the integration between NANO GATEWAY and the Nano bot script, and
 * prints what it actually finds. Safe to run any time; it is strictly read-only.
 *
 *   npx tsx scripts/nano-doctor.ts
 *   npx tsx scripts/nano-doctor.ts <sessionKey>   # also inspect bot data
 *
 * Exit code is non-zero when the engine is not usable, so it can gate a deploy.
 */

import {
  listNanoPlugins,
  nanoInstallInfo,
  nanoStateDirs,
  readNanoConfig,
  readNanoSessionData,
} from '../gateway/nano/introspect'

function line(label: string, value: unknown) {
  const shown = value === null || value === undefined ? '—' : String(value)
  console.log(`  ${label.padEnd(22)} ${shown}`)
}

async function main() {
  console.log('\n▸ Nano engine installation')
  const info = nanoInstallInfo()

  if (!info.available) {
    console.log(`  ✗ not usable: ${info.reason}`)
    console.log('\n  Set NANO_ENGINE_DIR in .env to the folder containing index.js.\n')
    process.exit(1)
  }

  line('directory', info.dir)
  line('package', info.name)
  line('version', info.version)
  line('bridge injected', info.patched ? 'yes' : 'NO — run the installer')
  line('patch backup', info.hasBackup ? 'present (.gateway-patch-backup)' : 'missing')

  console.log('\n▸ Configuration (config/settings.js)')
  const config = await readNanoConfig()
  if (config.error) {
    console.log(`  ✗ ${config.error}`)
  } else {
    line('bot name', config.botName)
    line('mode', config.botMode)
    line('default prefix', config.defaultPrefix)
    line('timezone', config.timezone)
    line('owner numbers', config.ownerNumbers.join(', ') || '—')
    line('pairing fallback', config.pairingNumber ?? '—')
  }

  console.log('\n▸ Plugin catalogue (plugins/)')
  const { plugins, categories, totalCommands, files, source } = await listNanoPlugins()
  line('read by', source === 'loader' ? 'plugin loader (exact)' : 'static scan (fallback)')
  line('plugin files', `${files.loaded}/${files.total} registered`)
  line('registered handlers', plugins.length)
  line('total commands', totalCommands)
  line('categories', categories.length)

  for (const category of categories) {
    console.log(
      `    ${category.name.padEnd(14)} ${String(category.count).padStart(3)} plugin(s)  ${String(category.commands).padStart(3)} command(s)`
    )
  }

  const sample = plugins.filter((p) => p.valid && p.commands.length > 0).slice(0, 5)
  if (sample.length > 0) {
    console.log('\n  sample commands:')
    for (const plugin of sample) {
      console.log(
        `    .${plugin.commands.slice(0, 4).join(' .').padEnd(34)} ${plugin.category}`
      )
    }
  }

  const sessionKey = process.argv[2]
  if (sessionKey) {
    console.log(`\n▸ Session data (${sessionKey})`)
    const dirs = nanoStateDirs(sessionKey)
    line('state root', dirs.root)

    const data = readNanoSessionData(sessionKey)
    line('db initialized', data.initialized ? 'yes' : 'no (bot has not run yet)')
    line('has credentials', data.connection.hasCredentials ? 'yes' : 'no')
    line('registered', data.connection.registered ? 'yes' : 'no')
    line('platform', data.connection.platform)
    line('users', data.stats.users)
    line('premium users', data.stats.premiumUsers)
    line('owners', data.stats.owners)
    line('custom prefixes', data.stats.customPrefixes)
    line('group schedules', data.stats.groupSchedules)
  }

  console.log('\n✓ Engine looks usable.\n')
}

main().catch((error) => {
  console.error('\n✗ doctor failed:', error)
  process.exit(1)
})
