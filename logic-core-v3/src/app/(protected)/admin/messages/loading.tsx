import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminMessagesLoading() {
  return (
    <div className="flex h-[calc(100dvh_-_228px)] min-h-0 flex-col gap-4 overflow-hidden sm:h-[calc(100dvh_-_200px)]">
      <Skeleton className="h-[68px] w-full shrink-0 rounded-[24px]" />
      <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Skeleton className="min-h-0 rounded-[24px]" />
        <Skeleton className="hidden min-h-0 rounded-[24px] lg:block" />
      </div>
    </div>
  )
}
