import { Skeleton } from '@/components/ui/Skeleton'
import { CardSkeleton } from '@/components/ui/skeletons'

export default function ProjectLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      <CardSkeleton lines={4} />
      <CardSkeleton lines={2} />
      <CardSkeleton lines={6} />
    </div>
  )
}
