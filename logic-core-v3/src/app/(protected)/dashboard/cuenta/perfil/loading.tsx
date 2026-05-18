import { Skeleton } from '@/components/ui/Skeleton'
import { CardSkeleton } from '@/components/ui/skeletons'

export default function PerfilLoading() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={3} />
      <CardSkeleton lines={3} />
      <CardSkeleton lines={4} />
    </div>
  )
}
