'use client'

import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateTicketStatusDashboardAction } from '@/actions/ticket-actions'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export function TicketStatusSelector({
  ticketId,
  currentStatus,
}: {
  ticketId: string
  currentStatus: TicketStatus
}) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as TicketStatus
    startTransition(async () => {
      await updateTicketStatusDashboardAction(ticketId, next)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        Estado
      </label>
      <div className="relative flex items-center gap-1.5">
        <select
          defaultValue={currentStatus}
          onChange={handleChange}
          disabled={isPending}
          className="text-xs font-bold bg-[#0a0c0f] border border-white/10 rounded-lg pl-3 pr-7 py-1.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
        >
          <option value="OPEN">Abierto</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="RESOLVED">Resuelto</option>
        </select>
        {isPending && (
          <Loader2 size={12} className="animate-spin text-cyan-400 absolute right-2 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
