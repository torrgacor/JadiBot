/**
 * Install (or refresh) the NANO GATEWAY bridge inside a Nano installation.
 *
 *   npx tsx scripts/install-nano-bridge.ts [--force] [--revert]
 *
 * Why this exists
 * ───────────────
 * One shared Nano installation serves every bot on the platform. Two things are
 * needed to make that safe, and both are additive — with the env vars unset the
 * script behaves exactly as shipped:
 *
 *   1. State redirection. Nano derives its credentials and database paths from
 *      its own file location, so by default every process would share one
 *      `sessions/auth.db` and one `nano.sqlite` — i.e. one bot, platform-wide.
 *      Reading `NANO_SESSION_DIR` / `NANO_DATA_DIR` gives each session its own.
 *
 *   2. The bridge. Nano exposes no API, so the gateway writes send requests to a
 *      JSONL file that an injected module consumes inside `onReady`, where the
 *      live socket exists.
 *
 * Originals are copied to `.gateway-patch-backup/` before the first edit, so
 * `--revert` restores the stock script and `node index.js` goes back to normal.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const HOOK_MARKER = 'NANO GATEWAY BRIDGE HOOK'
const PATCH_NOTE = 'Backup: .gateway-patch-backup/'

const bridgeSource = path.resolve(process.cwd(), 'gateway/nano-engine/gateway-bridge.js')

const envFile = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    // Fall back to the ambient environment.
  }
}

const args = process.argv.slice(2)
const force = args.includes('--force')
const revert = args.includes('--revert')

const engineDir = process.env.NANO_ENGINE_DIR
  ? path.resolve(process.env.NANO_ENGINE_DIR)
  : null

if (!engineDir) {
  console.error('NANO_ENGINE_DIR is not set. Add it to .env first.')
  process.exit(1)
}

// Narrowed once, then captured by the helpers below — TypeScript will not
// propagate a check through a closure, so this has to be a real binding.
const installDir: string = engineDir

if (!fs.existsSync(path.join(installDir, 'index.js'))) {
  console.error(`No index.js in ${installDir} — is that the Nano folder?`)
  process.exit(1)
}

const backupDir = path.join(installDir, '.gateway-patch-backup')

/** Copy the pristine file aside before its first modification. */
function backup(relative: string) {
  const target = path.join(installDir, relative)
  const saved = path.join(backupDir, `${path.basename(relative)}.orig`)
  if (fs.existsSync(target) && !fs.existsSync(saved)) {
    fs.mkdirSync(backupDir, { recursive: true })
    fs.copyFileSync(target, saved)
    console.log(`  backed up  ${relative} → .gateway-patch-backup/${path.basename(saved)}`)
  }
}

function read(relative: string): string {
  return fs.readFileSync(path.join(installDir, relative), 'utf8')
}

function write(relative: string, content: string) {
  fs.writeFileSync(path.join(installDir, relative), content)
}

/** Report whether the file still parses. Advisory — never leaves it broken. */
function syntaxCheck(relative: string) {
  try {
    execFileSync(process.execPath, ['--check', path.join(installDir, relative)], {
      stdio: 'pipe',
    })
    console.log(`  ok         ${relative} parses`)
  } catch (error) {
    const detail =
      error instanceof Error && 'stderr' in error
        ? String((error as { stderr?: Buffer }).stderr ?? '').trim()
        : String(error)
    console.warn(`  warn       ${relative} failed the syntax check:\n${detail}`)
  }
}

// ───────────────────────────────────────────────────────────── revert ────

if (revert) {
  if (!fs.existsSync(backupDir)) {
    console.error('No .gateway-patch-backup/ found — nothing to revert.')
    process.exit(1)
  }

  console.log(`Reverting ${installDir} to stock…`)
  for (const name of ['sesi.js', 'sqlite.js']) {
    const saved = path.join(backupDir, `${name}.orig`)
    if (!fs.existsSync(saved)) continue
    const relative =
      name === 'sesi.js' ? path.join('core', name) : path.join('core', name)
    fs.copyFileSync(saved, path.join(installDir, relative))
    console.log(`  restored   ${relative}`)
  }

  // index.js has no saved copy, so undo the injected hook textually. Line-based
  // rather than a single regex: the injected block is five lines and a regex
  // spanning them is easy to get subtly wrong.
  const indexPath = path.join(installDir, 'index.js')
  const lines = fs.readFileSync(indexPath, 'utf8').split('\n')
  const start = lines.findIndex((line) => line.includes(HOOK_MARKER))

  if (start === -1) {
    console.log('  skip       index.js (no hook present)')
  } else {
    // Walk forward to the last line of the injected block.
    let end = start
    while (end < lines.length && !lines[end].includes('GATEWAY_BRIDGE_ERROR')) end += 1
    if (end >= lines.length) end = lines.length - 1

    lines.splice(start, end - start + 1)
    fs.writeFileSync(indexPath, lines.join('\n'))
    console.log('  removed    bridge hook from index.js')
  }

  fs.rmSync(path.join(installDir, 'core', 'gateway-bridge.js'), { force: true })
  console.log('  removed    core/gateway-bridge.js')
  console.log('\nReverted. `node index.js` now behaves exactly as shipped.')
  process.exit(0)
}

// ───────────────────────────────────────────────────────────── install ───

console.log(`Installing NANO GATEWAY bridge into ${installDir}\n`)

// ── 1. credentials path ───────────────────────────────────────────────────
{
  const relative = path.join('core', 'sesi.js')
  let source = read(relative)

  if (source.includes('NANO_SESSION_DIR') && !force) {
    console.log(`  skip       ${relative} (already patched)`)
  } else {
    backup(relative)
    const stock = /export const SESSION_DIR = .*/
    if (!stock.test(source)) {
      console.error(`  FAIL       ${relative}: could not find the SESSION_DIR line.`)
      process.exit(1)
    }
    source = source.replace(
      stock,
      [
        '// Lets NANO GATEWAY redirect WhatsApp credentials to a per-session folder so',
        '// several bots can share one code installation without sharing an auth.db.',
        `// Unset → identical to stock behaviour. ${PATCH_NOTE}`,
        'export const SESSION_DIR = process.env.NANO_SESSION_DIR',
        '  ? path.resolve(process.env.NANO_SESSION_DIR)',
        "  : path.join(__dirname, '..', 'sessions')",
      ].join('\n')
    )
    write(relative, source)
    console.log(`  patched    ${relative}`)
    syntaxCheck(relative)
  }
}

// ── 2. bot database path ──────────────────────────────────────────────────
{
  const relative = path.join('core', 'sqlite.js')
  let source = read(relative)

  if (source.includes('NANO_DATA_DIR') && !force) {
    console.log(`  skip       ${relative} (already patched)`)
  } else {
    backup(relative)
    const stock = /const DB_DIR = .*/
    if (!stock.test(source)) {
      console.error(`  FAIL       ${relative}: could not find the DB_DIR line.`)
      process.exit(1)
    }
    source = source.replace(
      stock,
      [
        '// Lets NANO GATEWAY give each bot its own users/prefixes/group-settings',
        '// database while sharing one code installation. Unset → identical to stock',
        `// behaviour. ${PATCH_NOTE}`,
        'const DB_DIR = process.env.NANO_DATA_DIR',
        '  ? path.resolve(process.env.NANO_DATA_DIR)',
        "  : path.join(__dirname, '..', 'data', 'database')",
      ].join('\n')
    )
    write(relative, source)
    console.log(`  patched    ${relative}`)
    syntaxCheck(relative)
  }
}

// ── 3. bridge file ────────────────────────────────────────────────────────
{
  if (!fs.existsSync(bridgeSource)) {
    console.error(`  FAIL       bridge source missing: ${bridgeSource}`)
    process.exit(1)
  }
  const target = path.join(installDir, 'core', 'gateway-bridge.js')
  fs.copyFileSync(bridgeSource, target)
  console.log(`  installed  core/gateway-bridge.js`)
}

// ── 4. the hook itself ────────────────────────────────────────────────────
{
  const relative = 'index.js'
  let source = read(relative)

  if (source.includes(HOOK_MARKER) && !force) {
    console.log(`  skip       ${relative} (hook already present)`)
  } else {
    const anchor = 'onReady: (activeConn) => {'
    if (!source.includes(anchor)) {
      console.error(
        `  FAIL       ${relative}: no "${anchor}" found, so the hook cannot be placed.`
      )
      process.exit(1)
    }

    const hook = [
      anchor,
      '      // ── NANO GATEWAY BRIDGE HOOK (injected, do not edit) ──',
      '      // Inert unless NANO_GATEWAY_BRIDGE_DIR is set, so stock runs are unaffected.',
      "      import('./core/gateway-bridge.js')",
      '        .then((m) => m.startGatewayBridge(activeConn))',
      "        .catch((e) => console.log('GATEWAY_BRIDGE_ERROR=' + (e?.message || e)))",
    ].join('\n')

    // Replace only the first occurrence so a re-run cannot double-inject.
    source = source.replace(anchor, hook)
    write(relative, source)
    console.log(`  patched    ${relative}`)
    syntaxCheck(relative)
  }
}

console.log(
  [
    '\nDone. The bridge is inert until the gateway sets NANO_GATEWAY_BRIDGE_DIR,',
    'so running `node index.js` by hand still works exactly as before.',
    '',
    'To undo everything: npx tsx scripts/install-nano-bridge.ts --revert',
  ].join('\n')
)
