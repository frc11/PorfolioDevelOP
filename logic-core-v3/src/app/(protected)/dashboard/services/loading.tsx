import { Skeleton } from '@/components/ui/Skeleton'

export default function ServicesLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-20">
      {/* PageHeader */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div>
            <Skeleton className="mb-2 h-2.5 w-24" />
            <Skeleton className="h-7 w-56" />
            <Skeleton className="mt-2 h-3 w-72" />
          </div>
        </div>
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>

      {/* Contratados */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <div className="h-px flex-1 bg-white/[0.05]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>

      {/* Upsell */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-6 w-52" />
          </div>
          <Skeleton className="ml-7 h-3.5 w-80 max-w-full" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ModuleCardSkeleton />
            <ModuleCardSkeleton />
            <ModuleCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

function ServiceCardSkeleton() {
  return (
    <div className="flex min-h-[220px] flex-col gap-5 rounded-[24px] border border-white/[0.06] bg-white/[0.015] p-6">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-2.5 w-28" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.06] pt-5">
        <div>
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </div>
  )
}

function ModuleCardSkeleton() {
  return (
    <div className="flex min-h-[260px] flex-col gap-4 rounded-[24px] border border-white/[0.06] bg-white/[0.015] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div>
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="mt-2 h-3.5 w-28" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="mt-auto flex items-end justify-between gap-3">
        <div>
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="mt-2 h-5 w-24" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}
