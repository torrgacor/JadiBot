import { Clock, Radio, Signal } from 'lucide-react'
import { StatusPill, statusConfig } from '@/components/ui/status-dot'
import { BotControls } from '@/components/bot/bot-controls'
import { formatDuration } from '@/lib/utils/format'
import type { SessionStatus } from '@/types/enums'

/**
 * Bot hero card.
 *
 * The poster art is `public/dashboard-hero.jpg`, the same branding image the bot
 * sends with its WhatsApp menus — one file, so the panel and the bot cannot drift
 * apart. It sits above the text rather than behind it and keeps its own 1280×721
 * ratio (`w-full h-auto`), so the photo is never cropped and never distorted; the
 * card just grows to whatever height that ratio needs at the current width.
 *
 * `alt=""` with `aria-hidden` is deliberate: the image carries no information the
 * card does not already state in text, so a screen reader should skip it entirely.
 *
 * The card is intentionally dark in both themes: it is a poster, and the white
 * type on top of it must stay legible. Everything it states is a real reading —
 * the engine-reported status, the linked number, and the elapsed connected time.
 */
export function BotHero({
  name,
  number,
  status,
  uptimeMs,
  platform,
  engineOffline = false,
  stats,
  controls,
}: {
  /** Display name for the bot — the Nano config name when known. */
  name: string
  number: string | null
  status: SessionStatus
  /** Milliseconds since the bot connected. Omit when it is not up. */
  uptimeMs: number | null
  platform: string | null
  /** The service itself could not be reached — a louder failure than "not connected". */
  engineOffline?: boolean
  /** Real counters rendered along the bottom edge of the poster. */
  stats: Array<{ label: string; value: string }>
  /**
   * Lifecycle controls (connect/restart/disconnect), rendered as a small
   * white-on-dark row under the counters so the hero is an action surface,
   * not just a status board. Omitted when there is nothing to control yet.
   */
  controls?: React.ReactNode
}) {
  const config = statusConfig(status)
  const live = config.pulse !== false

  return (
    <section
      className="glass-panel relative overflow-hidden rounded-[22px] border border-border"
      aria-label="Status bot"
    >
      <div className="relative">
        <picture>
          <source srcSet="/dashboard-hero.webp" type="image/webp" />
          <img
            src="/dashboard-hero.jpg"
            alt=""
            aria-hidden
            className="block h-auto w-full"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.28]" aria-hidden />
      </div>

      {/* Dark band under the photo: white type on a fixed dark surface stays
          legible in both themes. In dark mode the band blends into the card;
          in light mode it is the poster's only dark region — intentional. */}
      <div className="relative flex flex-col gap-5 bg-[#0d1420] p-4 text-white sm:gap-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-label font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur-sm">
            <Signal className="size-3 text-primary" aria-hidden />
            Bot Nano
          </span>

          <StatusPill
            status={status}
            className={live ? 'border-white/12 bg-white/6 backdrop-blur-sm' : undefined}
          />
        </div>

        <div>
          <h2 className="text-gradient-neon font-display text-[30px] font-bold leading-[1.05] tracking-tight sm:text-[38px]">
            {name}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-s">
            <span className="inline-flex items-center gap-1.5 font-mono font-medium text-white/85">
              <Radio className="size-3.5 text-primary" aria-hidden />
              {number ?? 'nomor belum tertaut'}
            </span>

            <span className="inline-flex items-center gap-1.5 text-white/60">
              <Clock className="size-3.5" aria-hidden />
              {engineOffline
                ? 'layanan tidak dapat dihubungi'
                : uptimeMs
                  ? `aktif ${formatDuration(uptimeMs)}`
                  : 'belum berjalan'}
            </span>

            {platform ? (
              <span className="text-white/45">{platform}</span>
            ) : null}
          </div>
        </div>

        {stats.length > 0 ? (
          <dl className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto border-t border-white/10 px-4 pt-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-x-4 sm:gap-y-3 sm:overflow-visible sm:px-0">
            {stats.map((item) => (
              <div
                key={item.label}
                className="min-w-[7.5rem] shrink-0 snap-start rounded-[10px] border border-white/8 bg-white/[0.03] p-2.5 sm:min-w-0 sm:border-0 sm:bg-transparent sm:p-0"
              >
                <dt className="text-label font-semibold uppercase tracking-[0.14em] text-white/45">
                  {item.label}
                </dt>
                <dd className="mt-1 font-display text-[16px] font-bold tabular">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {/* The hero is also the control surface: real connect/restart/stop
            actions, themed for the dark poster. `hero-controls` scopes the
            white-on-dark overrides (see globals.css) so the buttons stay
            legible without touching the Button component globally. */}
        {controls ? (
          <div className="hero-controls border-t border-white/10 pt-4">{controls}</div>
        ) : null}
      </div>
    </section>
  )
}
