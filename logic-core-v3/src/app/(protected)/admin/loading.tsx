import { Skeleton } from '@/components/ui/Skeleton'
import { StatCardSkeleton } from '@/components/ui/skeletons'

export default function AdminLoading() {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Skeleton className="h-2.5 w-40 mb-3" />
            <Skeleton className="h-8 w-96 mb-3" />
            <Skeleton className="h-4 w-[480px]" />
          </div>
          <Skeleton className="h-8 w-52 rounded-full" />
        </div>
      </div>

      {/* Fila 1 — KPIs comerciales (3 cols) */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-2.5 w-12 mb-2" />
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Fila 2 — KPIs operativos (4 cols) */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-2.5 w-12 mb-2" />
          <Skeleton className="h-6 w-44 mb-1" />
          <Skeleton className="h-3.5 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Fila 3 — Financiero (3 cols) */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-2.5 w-12 mb-2" />
          <Skeleton className="h-6 w-52 mb-1" />
          <Skeleton className="h-3.5 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.1fr_0.95fr]">
          <StatCardSkeleton />
          <Skeleton className="h-full min-h-[240px] rounded-[26px]" />
          <StatCardSkeleton />
        </div>
      </div>

      {/* Fila 4 — Gráficos (2x2) */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-2.5 w-16 mb-2" />
          <Skeleton className="h-6 w-64 mb-1" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-[28px]" />
          ))}
        </div>
      </div>
    </section>
  )
}
