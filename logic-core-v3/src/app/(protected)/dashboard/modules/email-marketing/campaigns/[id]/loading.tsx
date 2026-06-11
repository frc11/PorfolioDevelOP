import { LoadingState } from '@/components/ui'

export default function CampaignDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-20">
      <LoadingState variant="skeleton-card" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
      </div>
      <LoadingState variant="skeleton-list" count={5} />
    </div>
  )
}
