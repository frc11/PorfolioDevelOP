import { Skeleton } from '@/components/ui/Skeleton'
import { StatCardSkeleton, CardSkeleton } from '@/components/ui/skeletons'

export default function SoporteLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-52" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <CardSkeleton lines={5} />
    </div>
  )
}
