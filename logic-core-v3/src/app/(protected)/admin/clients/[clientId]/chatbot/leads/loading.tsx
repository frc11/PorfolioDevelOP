import { Skeleton } from '@/components/ui/Skeleton'
import { TableSkeleton } from '@/components/ui/skeletons'

export default function ChatbotLeadsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-40" />
      <TableSkeleton rows={6} columns={4} />
    </div>
  )
}
