import { LoadingState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ReportSettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-32 mb-2" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3.5 w-64 mt-1" />
      </div>
      <LoadingState variant="skeleton-card" />
      <LoadingState variant="skeleton-list" count={4} />
    </div>
  )
}
