import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Fallback del <Suspense> de la lista en layout.tsx. Mantiene el alto completo
 * del panel para no causar layout shift cuando streamea la lista real.
 */
export function ConversationListSkeleton() {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="mt-2 h-3.5 w-40" />
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-2 py-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="mt-2 h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
