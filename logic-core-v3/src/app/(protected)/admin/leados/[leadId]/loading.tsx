import { LoadingState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LeadOsRevisionDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-24 mb-2" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3.5 w-48 mt-1" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
        <Skeleton className="h-[70vh] w-full rounded-[28px]" />
        <LoadingState variant="skeleton-list" count={4} />
      </div>
    </div>
  )
}
