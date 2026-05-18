import { Skeleton } from '@/components/ui/Skeleton'

export default function MessagesLoading() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-7 w-36" />
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 animate-pulse" />
    </div>
  )
}
