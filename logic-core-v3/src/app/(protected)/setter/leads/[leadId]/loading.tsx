import { Skeleton } from '@/components/ui'

export default function SetterLeadLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando el lead">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <Skeleton className="h-14 rounded-2xl" />

      <div className="space-y-5">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  )
}
