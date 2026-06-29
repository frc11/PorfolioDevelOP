'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { resolveTicketClientAction } from '@/lib/tickets/actions'
import { useRouter } from 'next/navigation'

export function ResolveTicketButton({ ticketId }: { ticketId: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setIsPending(true)
    const res = await resolveTicketClientAction(ticketId)
    setIsPending(false)
    if (res.success) router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      ) : (
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
      )}
      Marcar como resuelto
    </button>
  )
}
