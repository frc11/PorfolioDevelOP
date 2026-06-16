import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse motion-reduce:animate-none rounded-lg bg-white/[0.04]',
        className,
      )}
    />
  )
}
