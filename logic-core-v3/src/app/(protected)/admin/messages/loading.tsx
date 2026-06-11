import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminMessagesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-2.5 w-24 mb-2" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-3.5 w-64 mt-1" />
      </div>
      <div className="flex gap-3 h-[600px]">
        <Skeleton className="w-72 rounded-2xl shrink-0" />
        <Skeleton className="flex-1 rounded-2xl" />
      </div>
    </div>
  )
}
