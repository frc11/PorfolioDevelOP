import { LoadingState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LeadOsRevisionLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-16 mb-2" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3.5 w-72 mt-1" />
      </div>
      <LoadingState variant="skeleton-list" count={5} />
    </div>
  )
}
