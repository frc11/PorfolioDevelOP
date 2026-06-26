import { Skeleton } from '@/components/ui/Skeleton'

export default function BovedaLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header: badges + request button */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>

      {/* Activity timeline */}
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>
  )
}
