import { Skeleton } from '@/components/ui/skeleton'

/** Loading state for Bot Settings: header, the three runtime panels, group cards. */
export default function BotSettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[14px] border border-border bg-surface p-5 lg:col-span-2">
          <Skeleton className="h-4 w-40" />
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-[12px]" />
            ))}
          </div>
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-[14px] border border-border bg-surface p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-14 rounded-[10px]" />
            <Skeleton className="mt-3 h-10 rounded-[10px]" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[14px] border border-border bg-surface p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-20 rounded-[10px]" />
            <Skeleton className="mt-3 h-20 rounded-[10px]" />
            <Skeleton className="mt-3 h-10 rounded-[10px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
