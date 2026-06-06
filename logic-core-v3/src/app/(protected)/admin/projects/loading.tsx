import { LoadingState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminProjectsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-16 mb-2" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-3.5 w-36 mt-1" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <LoadingState variant="skeleton-list" count={8} />
    </div>
  )
}
