import type { NanoLogLevel } from '@/lib/engine/nano'

/**
 * Level → class map shared by the log viewer and the bot overview preview.
 *
 * Kept in a dependency-free module so both a server component (the overview)
 * and a client component (the viewer) can use the same palette.
 */
export const LOG_TONE: Record<NanoLogLevel, string> = {
  info: 'w-14 shrink-0 text-white/45',
  success: 'w-14 shrink-0 text-primary',
  warn: 'w-14 shrink-0 text-warning',
  error: 'w-14 shrink-0 text-danger',
}
