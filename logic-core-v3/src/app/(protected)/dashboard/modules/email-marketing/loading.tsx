import { LoadingState } from '@/components/ui'

export default function EmailMarketingLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-20">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
      </div>
      <LoadingState variant="skeleton-list" count={6} />
    </div>
  )
}
