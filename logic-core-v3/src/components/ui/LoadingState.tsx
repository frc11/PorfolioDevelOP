import { Card } from './Card'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton-card' | 'skeleton-list' | 'skeleton-stat' | 'pulse'
  count?: number
  className?: string
  message?: string
}

export function LoadingState({
  variant = 'spinner',
  count = 3,
  className,
  message,
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
        </div>
        {message && <p className="mt-1 text-xs text-zinc-500">{message}</p>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'h-4 w-full animate-[shimmer_1.5s_ease-in-out_infinite] rounded bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]',
          className,
        )}
      />
    )
  }

  if (variant === 'skeleton-card') {
    return (
      <Card variant="subtle" className={cn('space-y-4', className)}>
        <SkeletonLine className="h-3 w-1/3" />
        <SkeletonLine className="h-8 w-2/3" />
        <SkeletonLine className="h-3 w-full" />
      </Card>
    )
  }

  if (variant === 'skeleton-list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4"
          >
            <div className="h-9 w-9 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-3 w-1/3" />
              <SkeletonLine className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'skeleton-stat') {
    return (
      <Card variant="subtle" className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <SkeletonLine className="h-2.5 w-24" />
          <div className="h-7 w-7 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]" />
        </div>
        <SkeletonLine className="h-9 w-20" />
      </Card>
    )
  }

  return null
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-[shimmer_1.5s_ease-in-out_infinite] rounded bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]',
        className,
      )}
    />
  )
}
