import { Skeleton } from '@/components/ui/Skeleton'
import { StatCardSkeleton } from '@/components/ui/skeletons'

export default function ChatbotOverviewLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
