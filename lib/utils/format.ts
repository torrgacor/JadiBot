/** Formatting helpers shared by server and client components. */

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

/** Compact form for stat tiles: 12500 → "12,5 rb". */
export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatCurrency(
  minorUnits: number,
  currency = 'USD'
): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
  }).format(minorUnits / 100)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDateTime(
  value: Date | string | null | undefined,
  timezone = 'Asia/Jakarta'
): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(date)
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

/**
 * Human "time ago". Computed on the client to avoid server/client hydration
 * mismatches — always pass a stable `now` when rendering on the server.
 */
export function timeAgo(
  value: Date | string | null | undefined,
  now: Date = new Date()
): string {
  if (!value) return 'belum pernah'
  const date = typeof value === 'string' ? new Date(value) : value
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 0) return 'baru saja'
  if (seconds < 45) return 'baru saja'
  if (seconds < 90) return '1 menit lalu'

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`

  const days = Math.round(hours / 24)
  if (days < 30) return `${days} hari lalu`

  const months = Math.round(days / 30)
  if (months < 12) return `${months} bulan lalu`

  return `${Math.round(months / 12)} tahun lalu`
}

export function formatDuration(ms: number | null | undefined): string {
  if (!ms || ms < 0) return '0s'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Normalise a phone number to a WhatsApp-compatible JID. */
export function toJid(phone: string, isGroup = false): string {
  const digits = phone.replace(/\D/g, '')
  if (isGroup || digits.length > 15) return phone.includes('@') ? phone : `${digits}@g.us`
  return phone.includes('@') ? phone : `${digits}@s.whatsapp.net`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function truncate(value: string, max = 60): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

/** Deterministic avatar background colour from a string. */
export function colorFromString(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  const palette = [
    '#22c55e',
    '#0ea5e9',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444',
    '#14b8a6',
    '#ec4899',
    '#6366f1',
  ]
  return palette[Math.abs(hash) % palette.length]
}
