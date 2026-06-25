import { LoadingState } from '@/components/ui'

export default function SeoLoading() {
  return (
    <div className="flex w-full flex-col gap-6 pb-20">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
      </div>
      <LoadingState variant="skeleton-card" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LoadingState variant="skeleton-card" />
        <LoadingState variant="skeleton-card" />
      </div>
    </div>
  )
}
