'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { resolveTicketClientAction } from '@/actions/ticket-actions'
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
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <CheckCircle2 size={14} />
      )}
      Marcar como resuelto
    </button>
  )
}
