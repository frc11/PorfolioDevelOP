import { LoadingState } from '@/components/ui'

export default function AdminProjectDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-20">
      <LoadingState variant="skeleton-card" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
        <LoadingState variant="skeleton-stat" />
      </div>
      <LoadingState variant="skeleton-list" count={5} />
    </div>
  )
}
