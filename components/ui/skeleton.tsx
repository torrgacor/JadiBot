import { cn } from '@/lib/utils/cn'

/** Shimmering placeholder used while server data loads. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton rounded-[8px]', className)}
      aria-hidden
      {...props}
    />
  )
}

/** Fixed-height rows, used for table/list loading states. */
export function SkeletonRows({
  rows = 5,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3', className)} role="status" aria-label="Memuat">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-[38%]" />
            <Skeleton className="h-3 w-[22%]" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Stat-card placeholders.
 *
 * The grid and the card silhouette deliberately mirror `StatCard` (small
 * label + icon tile, large figure, one line of context) so the skeleton
 * occupies the same space as the content that replaces it and the page does not
 * jump when data arrives.
 */
export function SkeletonCards({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-3', className)}
      role="status"
      aria-label="Memuat"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-panel rounded-[16px] border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="mt-0.5 h-3 w-20" />
            <Skeleton className="size-7 shrink-0" />
          </div>
          <Skeleton className="mt-2.5 h-6 w-24" />
          <Skeleton className="mt-1.5 h-3 w-28" />
        </div>
      ))}
    </div>
  )
}
