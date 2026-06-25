import { Skeleton } from '@/components/ui/Skeleton'
import { CardSkeleton } from '@/components/ui/skeletons'

export default function ProjectLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      {/* Header card — espeja el header-card admin de page.tsx */}
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-8 w-48 mb-3" />
        <Skeleton className="h-3 w-64 mb-4" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <CardSkeleton lines={4} />
      <CardSkeleton lines={6} />
    </div>
  )
}
