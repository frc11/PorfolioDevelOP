import { Skeleton } from '@/components/ui/Skeleton'
import { StatCardSkeleton } from '@/components/ui/skeletons'

export default function ClientDetailLoading() {
  return (
    <div className="space-y-6">
      {/* ClientHeader */}
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
            <div>
              <Skeleton className="h-2.5 w-16 mb-2" />
              <Skeleton className="h-7 w-56 mb-2" />
              <Skeleton className="h-3.5 w-72" />
            </div>
          </div>
          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* ClientTabsNav */}
      <Skeleton className="h-12 w-full rounded-2xl" />

      {/* Tab content — overview (4 stat cards + 2 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-[28px]" />
        <Skeleton className="h-64 rounded-[28px]" />
      </div>
    </div>
  )
}
