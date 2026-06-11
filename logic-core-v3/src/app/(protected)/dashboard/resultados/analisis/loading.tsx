import { Skeleton } from '@/components/ui/Skeleton'
import { CardSkeleton } from '@/components/ui/skeletons'

export default function AnalisisLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>

      <CardSkeleton lines={5} />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={5} />
    </div>
  )
}
