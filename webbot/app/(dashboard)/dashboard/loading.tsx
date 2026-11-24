import { Skeleton, SkeletonCards, SkeletonRows } from '@/components/ui/skeleton'

/**
 * Loading state for Beranda.
 *
 * Mirrors the shape of the page underneath — poster, greeting, the three
 * message-health cards, the connection/control pair and the activity block — so
 * the skeleton occupies the same space as the content that replaces it and
 * nothing jumps when the data lands. Pages with a very different shape ship
 * their own `loading.tsx`.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* bot poster */}
      <div className="glass-panel flex h-[228px] flex-col justify-between rounded-[22px] border border-border p-5 sm:h-[264px] sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div>
          <Skeleton className="h-8 w-52 sm:h-9" />
          <Skeleton className="mt-3 h-4 w-64" />
        </div>
      </div>

      {/* greeting */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <SkeletonCards count={3} />

      {/* connection + control */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="glass-panel rounded-[16px] border border-border p-5">
          <Skeleton className="h-4 w-40" />
          <SkeletonRows rows={3} className="mt-4" />
        </div>
        <div className="glass-panel rounded-[16px] border border-border p-5">
          <Skeleton className="h-4 w-32" />
          <SkeletonRows rows={3} className="mt-4" />
        </div>
      </div>

      {/* activity + system */}
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel rounded-[16px] border border-border p-5">
          <Skeleton className="h-4 w-36" />
          <SkeletonRows rows={4} className="mt-4" />
        </div>
        <div className="glass-panel rounded-[16px] border border-border p-5">
          <Skeleton className="h-4 w-28" />
          <SkeletonRows rows={3} className="mt-4" />
        </div>
      </div>
    </div>
  )
}
