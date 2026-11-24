import { cn } from '@/lib/utils/cn'
import { colorFromString, initials } from '@/lib/utils/format'

/**
 * Avatar.
 *
 * Uses a plain <img> rather than next/image because avatar URLs come from
 * WhatsApp CDNs and arbitrary user input at runtime; routing them through the
 * optimiser would need an allowlist that breaks in practice. The fallback is a
 * deterministic colour derived from the name, so the same person always gets
 * the same swatch.
 */
export function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string | null
  name: string
  size?: number
  className?: string
}) {
  const label = initials(name || '?')
  const background = colorFromString(name || '?')

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-border font-semibold text-white',
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        backgroundColor: src ? undefined : background,
      }}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        label
      )}
    </span>
  )
}
