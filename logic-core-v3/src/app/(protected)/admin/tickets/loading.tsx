import { LoadingState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminTicketsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-16 mb-2" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3.5 w-64 mt-1" />
      </div>
      <Skeleton className="h-10 w-80 rounded-2xl" />
      <LoadingState variant="skeleton-list" count={7} />
    </div>
  )
}
