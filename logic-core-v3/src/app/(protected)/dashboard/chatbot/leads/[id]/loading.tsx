import { LoadingState } from '@/components/ui'

export default function LeadDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-20">
      <LoadingState variant="skeleton-card" />
      <LoadingState variant="skeleton-list" count={5} />
    </div>
  )
}
