import { Skeleton } from '@/components/ui/Skeleton'
import { TableSkeleton } from '@/components/ui/skeletons'

export default function LeadsLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-8 w-52" />
        </div>
      </div>

      <TableSkeleton rows={8} />
    </div>
  )
}
