import { LoadingState } from '@/components/ui'

export default function PlanLoading() {
  // Misma disposición y ancho que page.tsx (fullwidth + gap-8 sm:gap-10):
  // card de meter rounded-[30px] + grid de tiers lg:grid-cols-3, para que no
  // haya salto de ancho ni de forma cuando page.tsx toma el control.
  return (
    <div className="flex w-full flex-col gap-8 pb-20 sm:gap-10">
      <LoadingState variant="skeleton-card" className="rounded-[30px]" />
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3 lg:items-stretch">
        <LoadingState variant="skeleton-card" className="h-full rounded-[30px]" />
        <LoadingState variant="skeleton-card" className="h-full rounded-[30px]" />
        <LoadingState variant="skeleton-card" className="h-full rounded-[30px]" />
      </div>
    </div>
  )
}
