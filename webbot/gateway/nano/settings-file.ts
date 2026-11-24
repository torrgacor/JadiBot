import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { logger } from '../config'
import { NanoSettingsError } from './errors'
import { nanoInstallInfo } from './introspect'
import {
  NANO_CONFIG_EDITABLE_KEYS,
  type NanoConfig,
  type NanoConfigKey,
  type NanoConfigUpdateResult,
} from '../../lib/engine/nano'

/**
 * `config/settings.js` writer.
 *
 * The script reads its identity settings from a real ES module, so the only
 * honest way to change them from the panel is to rewrite that module — there is
 * no runtime setter in Nano for these (verified against the source: the file has
 * no imports and exports a single plain object).
 *
 * How a write is made safe:
 *   1. only whitelisted keys are accepted, each with its own validator;
 *   2. only *literal* values are replaced — the surrounding comments and every
 *      other line of the file (including the big ASCII header) are untouched;
 *   3. the candidate file is written to a temporary sibling, imported, and the
 *      parsed values are compared against what was requested;
 *   4. only then is it moved over the original, with the previous version kept
 *      in `.gateway-patch-backup/settings.<timestamp>.js`.
 *
 * A failure at any step restores the original file and reports the error.
 */

const MAX_TEXT = 80

function settingsPath(): string {
  const info = nanoInstallInfo()
  if (!info.available || !info.dir) {
    throw new Error(
      `NANO_ENGINE_DIR tidak dapat dipakai${info.reason ? `: ${info.reason}` : '.'} Arahkan ke folder yang berisi index.js.`
    )
  }
  return path.join(info.dir, 'config', 'settings.js')
}

function backupDir(): string {
  const info = nanoInstallInfo()
  if (!info.dir) throw new Error('NANO_ENGINE_DIR belum dikonfigurasi.')
  return path.join(info.dir, '.gateway-patch-backup')
}

// ─────────────────────────────────────────────────────────── validation ─────

/** IANA zone list, used to reject a timezone the bot could not format with. */
const TIMEZONES: Set<string> = (() => {
  try {
    return new Set<string>(Intl.supportedValuesOf('timeZone'))
  } catch {
    // Older runtimes: skip the check rather than rejecting valid input.
    return new Set<string>()
  }
})()

function singleLine(value: unknown, label: string, max = MAX_TEXT): string {
  const text = String(value ?? '').trim()
  if (!text) throw new NanoSettingsError(`${label} tidak boleh kosong.`)
  if (text.length > max) throw new NanoSettingsError(`${label} maksimal ${max} karakter.`)
  // A newline would escape the string literal and break the module.
  if (/[\n\r]/.test(text)) throw new NanoSettingsError(`${label} tidak boleh mengandung baris baru.`)
  return text
}

function validate(key: NanoConfigKey, value: unknown): string | string[] {
  switch (key) {
    case 'botName':
      return singleLine(value, 'Nama bot')
    case 'botAlias':
      return singleLine(value, 'Alias bot', 24)
    case 'ownerName':
      return singleLine(value, 'Nama owner')
    case 'footerText':
      return singleLine(value, 'Footer')
    case 'footerYear':
      return singleLine(value, 'Footer year', 8)
    case 'botVersion':
      return singleLine(value, 'Versi bot', 16)
    case 'botMode': {
      const text = singleLine(value, 'Mode tampilan', 12)
      if (!/^(Public|Self|Private)$/i.test(text)) {
        throw new NanoSettingsError('Mode harus Public, Self atau Private.')
      }
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    }
    case 'defaultPrefix': {
      const text = singleLine(value, 'Prefix default', 3)
      if (/\s/.test(text)) throw new NanoSettingsError('Prefix tidak boleh mengandung spasi.')
      return text
    }
    case 'timezone': {
      const text = singleLine(value, 'Timezone', 64)
      if (TIMEZONES.size > 0 && !TIMEZONES.has(text)) {
        throw new NanoSettingsError(`Timezone "${text}" tidak dikenali. Contoh: Asia/Jakarta.`)
      }
      return text
    }
    case 'pairingNumber': {
      const digits = singleLine(value, 'Nomor pairing', 20).replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 15) {
        throw new NanoSettingsError('Nomor pairing harus nomor internasional (contoh 6281234567890).')
      }
      // Stored quoted, as a string — that is what the script expects.
      return digits
    }
    case 'ownerNumbers': {
      const list = Array.isArray(value) ? value : String(value ?? '').split(/[,\s]+/)
      const numbers = list
        .map((entry) => String(entry).replace(/\D/g, ''))
        .filter((entry) => entry.length > 0)
      if (numbers.length === 0) throw new NanoSettingsError('Minimal satu nomor owner diperlukan.')
      if (numbers.length > 20) throw new NanoSettingsError('Maksimal 20 nomor owner.')
      for (const number of numbers) {
        if (number.length < 8 || number.length > 15) {
          throw new NanoSettingsError(`Nomor owner "${number}" tidak valid.`)
        }
      }
      return numbers
    }
    default: {
      const never: never = key
      throw new NanoSettingsError(`Key tidak bisa diubah dari panel: ${String(never)}`)
    }
  }
}

// ────────────────────────────────────────────────────────── serialisation ───

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function serialise(value: string | string[]): string {
  if (Array.isArray(value)) {
    return `[\n${value.map((entry) => `    ${quote(entry)},`).join('\n')}\n  ]`
  }
  return quote(value)
}

/**
 * Replace `key: <literal>,` in the module source, handling both the single-line
 * form and the multi-line array form Nano uses for `ownerNumbers`.
 */
function replaceKey(source: string, key: NanoConfigKey, serialised: string): string {
  // The match spans the `[` … `]` of the array, so the replacement must carry
  // its own closing bracket (serialise() always emits one).
  const arrayPattern = new RegExp(`(^\\s*${key}:\\s*)\\[[\\s\\S]*?\\n(\\s*)\\]`, 'm')
  if (arrayPattern.test(source)) {
    // Function form: a value containing `$&` or `$1` must be inserted literally.
    return source.replace(arrayPattern, (_match, prefix: string) => `${prefix}${serialised}`)
  }

  const scalarPattern = new RegExp(`(^\\s*${key}:\\s*)(['"\`])(?:[^'"\`\\\\]|\\\\.)*\\2`, 'm')
  if (scalarPattern.test(source)) {
    return source.replace(scalarPattern, (_match, prefix: string) => `${prefix}${serialised}`)
  }

  // The key is absent (e.g. a trimmed settings file) — add it before the closing
  // brace of the exported object so the write still succeeds.
  const objectEnd = source.lastIndexOf('}')
  if (objectEnd === -1) throw new NanoSettingsError('Struktur config/settings.js tidak dikenali.')
  return `${source.slice(0, objectEnd)}  ${key}: ${serialised},\n${source.slice(objectEnd)}`
}

// ───────────────────────────────────────────────────────────────── write ────

async function readConfigObject(file: string): Promise<Record<string, unknown>> {
  const url = `${pathToFileURL(file).href}?t=${Date.now()}-${Math.random().toString(36).slice(2)}`
  const mod = await import(url)
  return ((mod.settings ?? mod.default ?? {}) as Record<string, unknown>) ?? {}
}

/**
 * Apply a whitelisted patch to `config/settings.js`.
 *
 * Resolves with the freshly re-read configuration. Rejects — leaving the file
 * exactly as it was — when the candidate does not parse or does not round-trip.
 */
export async function updateNanoConfigFile(
  patch: Partial<Record<NanoConfigKey, unknown>>
): Promise<NanoConfigUpdateResult> {
  const file = settingsPath()
  const submitted = Object.keys(patch) as NanoConfigKey[]
  const keys = submitted.filter((key) =>
    (NANO_CONFIG_EDITABLE_KEYS as readonly string[]).includes(key)
  )

  if (keys.length === 0) {
    throw new NanoSettingsError('Tidak ada setting yang bisa diubah dari panel.')
  }
  if (keys.length !== submitted.length) {
    const rejected = submitted.filter((key) => !keys.includes(key))
    throw new NanoSettingsError(`Setting ini tidak bisa diubah dari panel: ${rejected.join(', ')}.`)
  }

  const validated = new Map<NanoConfigKey, string | string[]>()
  for (const key of keys) validated.set(key, validate(key, patch[key]))

  const original = fs.readFileSync(file, 'utf8')
  let candidate = original
  for (const key of keys) {
    candidate = replaceKey(candidate, key, serialise(validated.get(key)!))
  }

  const directory = path.dirname(file)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const temporary = path.join(directory, `settings.candidate-${stamp}.js`)

  fs.writeFileSync(temporary, candidate, 'utf8')

  try {
    const parsed = await readConfigObject(temporary)

    for (const key of keys) {
      const expected = validated.get(key)!
      const actual = parsed[key]
      const matches = Array.isArray(expected)
        ? Array.isArray(actual) && actual.join(',') === expected.join(',')
        : actual === expected
      if (!matches) {
        throw new NanoSettingsError(
          `Perubahan ${key} tidak terbaca kembali dari file (${JSON.stringify(actual)}).`
        )
      }
    }

    // Verified: keep a backup of the previous version, then swap the file in.
    const dir = backupDir()
    fs.mkdirSync(dir, { recursive: true })
    const backupPath = path.join(dir, `settings.${stamp}.js`)
    fs.copyFileSync(file, backupPath)

    fs.renameSync(temporary, file)
    logger.info({ file, keys, backupPath }, 'nano settings.js updated from panel')

    return {
      updated: keys,
      config: await readConfigObject(file).then(toConfig),
      backupPath,
      requiresRestart: true,
    }
  } catch (error) {
    fs.rmSync(temporary, { force: true })
    // The original was never replaced, so there is nothing to restore — assert
    // that loudly in case a future change violates the ordering above.
    if (fs.readFileSync(file, 'utf8') !== original) {
      fs.writeFileSync(file, original, 'utf8')
      logger.warn({ file }, 'restored nano settings.js after a failed write')
    }
    throw error
  }
}

function toConfig(settings: Record<string, unknown>): NanoConfig {
  return {
    botName: (settings.botName as string) ?? null,
    botAlias: (settings.botAlias as string) ?? null,
    botVersion: (settings.botVersion as string) ?? null,
    botMode: (settings.botMode as string) ?? null,
    ownerName: (settings.ownerName as string) ?? null,
    ownerNumbers: Array.isArray(settings.ownerNumbers) ? (settings.ownerNumbers as string[]) : [],
    defaultPrefix: (settings.defaultPrefix as string) ?? null,
    timezone: (settings.timezone as string) ?? null,
    footerText: (settings.footerText as string) ?? null,
    pairingNumber: (settings.pairingNumber as string) ?? null,
    links: (settings.links as Record<string, string>) ?? null,
  }
}
