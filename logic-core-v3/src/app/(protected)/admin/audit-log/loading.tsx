import { Skeleton } from '@/components/ui/Skeleton'
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/skeletons'

export default function AuditLogLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-2.5 w-16 mb-2" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-3.5 w-80 mt-1" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Tabla */}
      <TableSkeleton rows={8} columns={5} />
    </div>
  )
}
