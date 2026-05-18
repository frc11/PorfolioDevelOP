import { Skeleton } from '@/components/ui/Skeleton'
import { StatCardSkeleton, CardSkeleton } from '@/components/ui/skeletons'

export default function TraficoLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <CardSkeleton lines={6} />
      <CardSkeleton lines={4} />
    </div>
  )
}
