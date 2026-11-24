import { cn } from '@/lib/utils/cn'

/**
 * Brand mark.
 *
 * The glyph is an inline SVG "Q" whose tail doubles as a signal arc — a
 * gateway sygil rather than a generic chat bubble. Inline (not an image file)
 * so it inherits currentColor and stays crisp at every size.
 */
export function LogoMark({
  className,
  size = 32,
}: {
  className?: string
  size?: number
}) {
  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center rounded-[10px] border border-primary/25 bg-primary-soft',
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 32"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        className="text-primary"
      >
        <circle
          cx="15"
          cy="15"
          r="9.2"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <path
          d="M20.5 20.5 L26 26"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M11 15.2 L14.1 18.3 L19.6 12.2"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-[10px] bg-primary/20 blur-md" />
    </span>
  )
}

export function Logo({
  size = 32,
  showText = true,
  className,
  subtitle,
}: {
  size?: number
  showText?: boolean
  className?: string
  subtitle?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showText ? (
        <span className="flex flex-col leading-none">
          <span className="text-lead font-semibold tracking-tight">
            NANO<span className="text-primary"> GATEWAY</span>
          </span>
          {subtitle ? (
            <span className="mt-0.5 text-label uppercase tracking-[0.14em] text-muted-foreground">
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  )
}
