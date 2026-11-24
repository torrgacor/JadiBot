import { cn } from '@/lib/utils/cn'
import type { SessionStatus } from '@/types/enums'

/**
 * Connection indicator.
 *
 * The colour maps to the *engine-reported* status — nothing here infers
 * connectivity locally, so the dot can never claim "connected" when the
 * gateway says otherwise.
 *
 * `pulse: 'ring'` is the live state (an expanding halo, like a heartbeat);
 * `pulse: 'soft'` is a state that is still working but not yet up
 * (connecting, pairing) — a slow opacity breath rather than a halo, so the two
 * never read as the same thing.
 */

type Pulse = 'ring' | 'soft' | false

interface StatusConfig {
  /** Background colour of the dot itself. */
  dot: string
  /** Text/border tone used by the pill form. */
  text: string
  pulse: Pulse
  /** Sentence-case description, used for the accessible label. */
  label: string
  /** Short uppercase token — the visual treatment in pills and headers. */
  token: string
}

const STATUS_TONE: Record<SessionStatus, StatusConfig> = {
  CREATED: {
    dot: 'bg-muted-foreground/60',
    text: 'text-muted-foreground border-border bg-glass',
    pulse: false,
    label: 'Belum dijalankan',
    token: 'SIAP',
  },
  CONNECTING: {
    dot: 'bg-info',
    text: 'text-info border-info/30 bg-info/10',
    pulse: 'soft',
    label: 'Menghubungkan',
    token: 'MENGHUBUNGKAN',
  },
  QR_REQUIRED: {
    dot: 'bg-warning',
    text: 'text-warning border-warning/30 bg-warning/10',
    pulse: 'soft',
    label: 'Menunggu scan QR',
    token: 'PERLU QR',
  },
  PAIRING_REQUIRED: {
    dot: 'bg-warning',
    text: 'text-warning border-warning/30 bg-warning/10',
    pulse: 'soft',
    label: 'Menunggu kode pairing',
    token: 'PERLU KODE',
  },
  CONNECTED: {
    dot: 'bg-success',
    text: 'text-success border-success/30 bg-success/10',
    pulse: 'ring',
    label: 'Terhubung',
    token: 'AKTIF',
  },
  DISCONNECTED: {
    dot: 'bg-muted-foreground/60',
    text: 'text-muted-foreground border-border bg-glass',
    pulse: false,
    label: 'Terputus',
    token: 'TERPUTUS',
  },
  RECONNECTING: {
    dot: 'bg-warning',
    text: 'text-warning border-warning/30 bg-warning/10',
    pulse: 'soft',
    label: 'Menyambung ulang',
    token: 'MENYAMBUNG',
  },
  LOGGED_OUT: {
    dot: 'bg-muted-foreground/60',
    text: 'text-muted-foreground border-border bg-glass',
    pulse: false,
    label: 'Sudah logout',
    token: 'KELUAR',
  },
  AUTH_REQUIRED: {
    dot: 'bg-warning',
    text: 'text-warning border-warning/30 bg-warning/10',
    pulse: 'soft',
    label: 'Perlu ditautkan ulang',
    token: 'PERLU TAUT ULANG',
  },
  BANNED: {
    dot: 'bg-danger',
    text: 'text-danger border-danger/30 bg-danger/10',
    pulse: false,
    label: 'Diblokir',
    token: 'DIBLOKIR',
  },
  ERROR: {
    dot: 'bg-danger',
    text: 'text-danger border-danger/30 bg-danger/10',
    pulse: false,
    label: 'Error',
    token: 'ERROR',
  },
}

export function statusConfig(status: SessionStatus): StatusConfig {
  return STATUS_TONE[status] ?? STATUS_TONE.DISCONNECTED
}

/** Bare dot + optional sentence-case label. */
export function StatusDot({
  status,
  className,
  withLabel = false,
}: {
  status: SessionStatus
  className?: string
  withLabel?: boolean
}) {
  const config = statusConfig(status)

  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      title={config.label}
      role="status"
      aria-live="polite"
      aria-label={config.label}
    >
      <span className="relative flex size-2.5" aria-hidden>
        {config.pulse === 'ring' ? (
          <span
            className={cn('absolute inset-0 rounded-full animate-pulse-ring', config.dot)}
          />
        ) : null}
        {config.pulse === 'soft' ? (
          <span
            className={cn('absolute inset-0 rounded-full animate-pulse-soft', config.dot)}
          />
        ) : null}
        <span className={cn('relative inline-flex size-2.5 rounded-full', config.dot)} />
      </span>
      {withLabel ? (
        <span className="text-mid font-medium" aria-hidden>
          {config.label}
        </span>
      ) : null}
    </span>
  )
}

/**
 * Status as a glass chip — the form used on the hero card and control panel.
 *
 * `token` overrides the short uppercase word; the long, human-readable label
 * always stays in the accessible name so the chip never loses meaning.
 */
export function StatusPill({
  status,
  className,
  token,
  showToken = true,
}: {
  status: SessionStatus
  className?: string
  token?: string
  showToken?: boolean
}) {
  const config = statusConfig(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs2 font-semibold uppercase tracking-[0.08em] backdrop-blur-sm',
        config.text,
        className
      )}
      title={config.label}
      role="status"
      aria-live="polite"
      aria-label={config.label}
    >
      <span className="relative flex size-2" aria-hidden>
        {config.pulse === 'ring' ? (
          <span
            className={cn('absolute inset-0 rounded-full animate-pulse-ring', config.dot)}
          />
        ) : null}
        {config.pulse === 'soft' ? (
          <span
            className={cn('absolute inset-0 rounded-full animate-pulse-soft', config.dot)}
          />
        ) : null}
        <span className={cn('relative inline-flex size-2 rounded-full', config.dot)} />
      </span>
      {showToken ? <span aria-hidden>{token ?? config.token}</span> : null}
    </span>
  )
}
