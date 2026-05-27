import { LoadingState } from '@/components/ui'

// B12.1 — Antes era un spinner pelado. Ahora skeleton coherente con la
// estructura real del dashboard (header + onboarding + health + grid + brief)
// para no mostrar pantalla en blanco con un círculo girando.
export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-20 sm:gap-10">
      {/* Header */}
      <header className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-4">
        <div className="flex items-center gap-3 w-full">
          <div className="h-11 w-11 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="h-3 w-32 bg-white/[0.05] rounded animate-pulse" />
            <div className="h-8 w-64 bg-white/[0.08] rounded-md animate-pulse" />
          </div>
        </div>
      </header>

      {/* Health score skeleton */}
      <div className="h-[360px] rounded-3xl border border-white/[0.06] bg-white/[0.015] p-10 animate-pulse" />

      {/* Week results grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
      </div>

      {/* Brief skeleton */}
      <LoadingState variant="skeleton-card" />
    </div>
  )
}
