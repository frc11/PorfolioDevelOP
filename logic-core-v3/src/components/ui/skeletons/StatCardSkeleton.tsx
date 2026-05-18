import { Skeleton } from '../Skeleton'

export function StatCardSkeleton() {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
      </div>
      <Skeleton className="mt-3 h-8 w-24" />
      <Skeleton className="mt-2 h-3 w-40" />
    </div>
  )
}
