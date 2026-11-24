import fs from 'fs/promises'
import path from 'path'

/**
 * Health of the AI photo backends the bot engine talks to.
 *
 * The engine records its own outcome on every job (lib/ai-foto.js writes
 * `ai-backend-status.json` into its NANO_DATA_DIR), so this reads what
 * actually happened — probing the upstream instead would burn the very quota
 * the panel is trying to report on.
 *
 * Files are collected from the engine's default data dir plus every session's
 * data dir; per backend the newest `checkedAt` wins, so the panel reflects the
 * session that most recently used the backend.
 */

export type AiBackendStatus = {
  backend: string
  ok: boolean
  code: number | string | null
  message: string
  checkedAt: number
  lastSuccessAt: number | null
  consecutiveFailures: number
}

export type AiBackendView = {
  key: string
  label: string
  ok: boolean
  tone: 'success' | 'warning' | 'danger'
  statusLabel: string
  message: string
  consecutiveFailures: number
  lastSuccessAt: number | null
  checkedAt: number
}

export type AiJobDay = {
  /** YYYY-MM-DD menurut zona waktu Asia/Jakarta. */
  date: string
  total: number
  ok: number
  fail: number
}

const LABELS: Record<string, string> = {
  photoeditor: 'PhotoEditor AI',
  faa: 'Faa AI (cadangan)',
}

/** Tanggal Jakarta — bot & panel memakai satu zona agar bucket harinya sama. */
const tanggalJakarta = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const HARI_MS = 24 * 60 * 60 * 1000

async function statusFiles(): Promise<string[]> {
  return (await dataRoots()).map((root) => path.join(root, 'ai-backend-status.json'))
}

async function dataRoots(): Promise<string[]> {
  const roots: string[] = [path.join(process.cwd(), 'nano-engine', 'data')]

  try {
    const base = path.join(process.cwd(), 'storage', 'nano-state')
    const entries = await fs.readdir(base, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        roots.push(path.join(base, entry.name, 'data', 'database'))
      }
    }
  } catch {
    /* storage belum ada */
  }

  return roots
}

/* ---------- riwayat job AI (JSONL dari engine) ---------- */

export async function getAiJobHistory(days = 7): Promise<AiJobDay[]> {
  const batas = Date.now() - days * HARI_MS
  const perHari = new Map<string, AiJobDay>()

  for (const root of await dataRoots()) {
    let teks: string
    try {
      teks = await fs.readFile(path.join(root, 'ai-job-history.jsonl'), 'utf8')
    } catch {
      continue /* belum ada job */
    }

    for (const baris of teks.split('\n')) {
      if (!baris) continue
      let entry: { at?: number; ok?: boolean }
      try {
        entry = JSON.parse(baris)
      } catch {
        continue /* baris rusak tidak boleh menjatuhkan panel */
      }

      const at = Number(entry.at || 0)
      if (!at || at < batas) continue

      const key = tanggalJakarta.format(new Date(at))
      const hari = perHari.get(key) ?? { date: key, total: 0, ok: 0, fail: 0 }
      hari.total += 1
      if (entry.ok) hari.ok += 1
      else hari.fail += 1
      perHari.set(key, hari)
    }
  }

  // Bangun N hari terakhir termasuk hari kosong, urut terlama → terbaru.
  const hasil: AiJobDay[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = tanggalJakarta.format(new Date(Date.now() - i * HARI_MS))
    hasil.push(perHari.get(key) ?? { date: key, total: 0, ok: 0, fail: 0 })
  }
  return hasil
}

export async function getAiBackendStatuses(): Promise<AiBackendStatus[]> {
  const merged = new Map<string, AiBackendStatus>()

  for (const file of await statusFiles()) {
    let parsed: unknown
    try {
      parsed = JSON.parse(await fs.readFile(file, 'utf8'))
    } catch {
      continue /* belum ada / belum terbaca */
    }
    if (!parsed || typeof parsed !== 'object') continue

    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') continue
      const entry = value as Partial<AiBackendStatus>

      const status: AiBackendStatus = {
        backend: key,
        ok: Boolean(entry.ok),
        code: entry.code ?? null,
        message: String(entry.message ?? ''),
        checkedAt: Number(entry.checkedAt ?? 0),
        lastSuccessAt: entry.lastSuccessAt ?? null,
        consecutiveFailures: Number(entry.consecutiveFailures ?? 0),
      }

      // Baris tanpa pengukuran job (mis. hanya penanda noticeAt) bukan status
      // backend — jangan pernah dirender sebagai "galat".
      if (status.checkedAt <= 0) continue

      const prev = merged.get(key)
      if (!prev || status.checkedAt > prev.checkedAt) merged.set(key, status)
    }
  }

  return [...merged.values()].sort((a, b) => a.backend.localeCompare(b.backend))
}

/** Bahasa panel: nada warna + label status untuk satu baris backend. */
export function aiBackendView(status: AiBackendStatus): AiBackendView {
  const quotaLimited = status.code === 400005 || /insufficient credits|400005/i.test(status.message)

  return {
    key: status.backend,
    label: LABELS[status.backend] ?? status.backend,
    ok: status.ok,
    tone: status.ok ? 'success' : quotaLimited ? 'warning' : 'danger',
    statusLabel: status.ok ? 'normal' : quotaLimited ? 'kuota habis' : 'galat',
    message: status.message,
    consecutiveFailures: status.consecutiveFailures,
    lastSuccessAt: status.lastSuccessAt,
    checkedAt: status.checkedAt,
  }
}
