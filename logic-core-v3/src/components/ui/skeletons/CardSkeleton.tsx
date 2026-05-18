import { cn } from '@/lib/utils'
import { Skeleton } from '../Skeleton'

interface CardSkeletonProps {
  lines?: number
  className?: string
}

export function CardSkeleton({ lines = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn('rounded-[28px] border border-white/10 bg-white/[0.02] p-5', className)}>
      <Skeleton className="h-4 w-32 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}
