import { LoadingState } from '@/components/ui'

export default function LeadDetailLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <LoadingState variant="skeleton-card" />
      <LoadingState variant="skeleton-list" count={5} />
    </div>
  )
}
