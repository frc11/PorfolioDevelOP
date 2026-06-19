import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Loading SOLO del thread (children del layout persistente). Al cambiar de
 * conversación, la lista queda fija y solo este panel derecho muestra skeleton.
 */
export default function ConversationLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Skeleton className="h-[64px] shrink-0 rounded-[24px]" />
      <Skeleton className="min-h-0 flex-1 rounded-[28px]" />
      <Skeleton className="h-[68px] shrink-0 rounded-[24px]" />
    </div>
  )
}
