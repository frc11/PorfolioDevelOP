import { Skeleton } from '../Skeleton'

interface ListSkeletonProps {
  count?: number
}

export function ListSkeleton({ count = 6 }: ListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2 mb-3" />
          <Skeleton className="h-3 w-full mb-3" />
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
            <Skeleton className="h-3" />
            <Skeleton className="h-3" />
            <Skeleton className="h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}
