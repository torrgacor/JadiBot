/**
 * Brand regression guard.
 *
 * The platform was renamed from "Qiro" to "Nano" in one sweep, together with the
 * engine directory, the gateway contract, the systemd unit and the tunnel
 * config. Renames rot: a copy-paste from an old branch, a log line kept for
 * "context", a doc that quotes the previous contract — and the old name is back
 * in the tree.
 *
 * This script fails (exit 1) if a legacy token reappears anywhere in the
 * tracked source tree, and prints the file:line that carries it so the fix is
 * obvious. Run it directly, or let `npm run build` do it through `prebuild`.
 *
 *   npx tsx scripts/check-branding.ts
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'

/** Legacy tokens that must not creep back into the source tree. */
const FORBIDDEN: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: 'qiro', pattern: /qiro/i },
  // The old API-key and cookie prefix (`ng_…` since the rename).
  { label: 'qg_', pattern: /qg_/i },
]

/**
 * The old name, compared against the line with every non-alphanumeric character
 * removed.
 *
 * The rename left box art all over the engine that spells the name with
 * separators between the letters (`--Q--i--R--O--`), which a plain substring
 * search cannot see — 189 files carried it while this guard reported success.
 * Collapsing the line first closes that gap.
 *
 * Only the name is checked this way. The `qg_` prefix contains an underscore, so
 * collapsing would delete the very character being looked for.
 */
const COLLAPSED_TOKEN = 'qiro'

/**
 * Files allowed to keep the old brand. Every entry needs a reason — this list is
 * meant to be read, not to grow.
 */
const ALLOWLIST = new Set<string>([
  // The audit report is a dated record of findings as they were observed, down
  // to the paths in the evidence. Rewriting it would falsify the record, so it
  // is exempt by design.
  'SECURITY_AUDIT_REPORT.md',

  // This file has to spell the tokens out in order to search for them.
  'scripts/check-branding.ts',
])

/**
 * Files bigger than this are treated as data rather than source. The engine
 * ships a few vendored assets that are large but still text.
 */
const MAX_FILE_BYTES = 1_000_000

/**
 * A line longer than this is generated content, not authored source: a vendored
 * base64 sprite, a minified bundle. Scanning them only produces chance matches
 * ("qiro" occurs naturally inside base64).
 */
const MAX_LINE_LENGTH = 1000

/** Bytes inspected when deciding whether a file is binary. */
const BINARY_SNIFF_BYTES = 8000

interface Hit {
  file: string
  line: number
  text: string
}

/** Every file git would commit, including new but not-yet-tracked ones. */
function listFiles(): string[] {
  const out = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  )
  return out.split('\0').filter(Boolean).sort()
}

/** A NUL byte in the head of the file is the usual "this is not text" signal. */
function looksBinary(head: Buffer): boolean {
  return head.includes(0)
}

function scanFile(file: string): Hit[] {
  let size: number
  try {
    size = statSync(file).size
  } catch {
    return [] // Broken symlink or race with a delete — nothing to scan.
  }
  if (size === 0 || size > MAX_FILE_BYTES) return []

  const buffer = readFileSync(file)
  if (looksBinary(buffer.subarray(0, BINARY_SNIFF_BYTES))) return []

  const hits: Hit[] = []
  const lines = buffer.toString('utf8').split('\n')
  lines.forEach((text, index) => {
    if (text.length > MAX_LINE_LENGTH) return

    const record = () =>
      hits.push({ file, line: index + 1, text: text.trim().slice(0, 160) })

    for (const { pattern } of FORBIDDEN) {
      if (pattern.test(text)) return record()
    }

    const collapsed = text.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
    if (collapsed.includes(COLLAPSED_TOKEN)) record()
  })
  return hits
}

function main(): void {
  const files = listFiles()
  const hits: Hit[] = []

  for (const file of files) {
    if (ALLOWLIST.has(file)) continue
    hits.push(...scanFile(file))
  }

  if (hits.length === 0) {
    console.log(`✓ Brand guard passed — no legacy name in ${files.length} files.`)
    return
  }

  console.error('✗ Brand regression: the pre-rename name is back in the source tree.\n')
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}  ${hit.text}`)
  }
  console.error(
    `\n${hits.length} occurrence(s). Rename them, or add a reasoned entry to` +
      ` ALLOWLIST in scripts/check-branding.ts if the reference is historical.`
  )
  process.exit(1)
}

main()
