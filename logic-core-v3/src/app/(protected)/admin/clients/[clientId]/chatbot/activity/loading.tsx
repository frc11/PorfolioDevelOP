import { Skeleton } from '@/components/ui/Skeleton'

export default function ChatbotActivityLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-36" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-64" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
