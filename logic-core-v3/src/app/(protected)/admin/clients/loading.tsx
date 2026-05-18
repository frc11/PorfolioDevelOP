import { Skeleton } from '@/components/ui/Skeleton'
import { ListSkeleton } from '@/components/ui/skeletons'

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-2.5 w-16 mb-2" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3.5 w-36 mt-1" />
      </div>

      {/* Filtros (ClientsListClient) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-3 w-32" />

      <ListSkeleton count={9} />
    </div>
  )
}
