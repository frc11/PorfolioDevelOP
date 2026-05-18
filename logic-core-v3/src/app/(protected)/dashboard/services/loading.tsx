import { Skeleton } from '@/components/ui/Skeleton'
import { CardSkeleton } from '@/components/ui/skeletons'

export default function ServicesLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-20">
      <div className="pt-2">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-3 w-56" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={3} />
          <CardSkeleton lines={3} />
        </div>
      </div>
    </div>
  )
}
