import { Skeleton } from '@/components/ui/Skeleton'

export default function ChatbotConfigLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-48" />
      <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
