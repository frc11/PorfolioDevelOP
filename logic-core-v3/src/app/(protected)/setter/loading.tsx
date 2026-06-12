import { Skeleton } from '@/components/ui'

export default function SetterLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando tu cartera">
      <div className="space-y-2 pt-2 sm:pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-2xl" />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-44" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[108px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
