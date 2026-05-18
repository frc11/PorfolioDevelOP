import { Skeleton } from '@/components/ui/Skeleton'

export default function AlertsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-2.5 w-32 mb-2" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3.5 w-64 mt-1" />
      </div>

      {/* Tabs de severidad */}
      <Skeleton className="h-10 w-80 rounded-2xl" />

      {/* Lista de alertas */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5 mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
