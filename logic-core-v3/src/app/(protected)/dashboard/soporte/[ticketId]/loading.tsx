import { LoadingState } from '@/components/ui'

export default function TicketDetailLoading() {
  return (
    <div className="flex w-full flex-col gap-6 pb-20">
      <LoadingState variant="skeleton-card" />
      <LoadingState variant="skeleton-list" count={6} />
    </div>
  )
}
