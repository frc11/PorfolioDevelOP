import { LoadingState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function HealthLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-28 mb-2" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3.5 w-64 mt-1" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
      </div>
      <LoadingState variant="skeleton-card" />
    </div>
  )
}
