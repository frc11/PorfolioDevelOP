import { LoadingState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-28 mb-2" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-3.5 w-72 mt-1" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <LoadingState variant="skeleton-list" count={8} />
    </div>
  )
}
