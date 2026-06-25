import { LoadingState } from '@/components/ui'

export default function ReputacionLoading() {
  return (
    <div className="flex w-full flex-col gap-5 pb-20">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <LoadingState variant="skeleton-card" />
        <LoadingState variant="skeleton-card" />
      </div>
    </div>
  )
}
