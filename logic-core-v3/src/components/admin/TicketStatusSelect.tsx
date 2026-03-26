'use client'

import { useRef } from 'react'
import { updateTicketStatusAction } from '@/lib/actions/tickets'
import { TicketStatus } from '@prisma/client'

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
}

const STATUS_CLASS: Record<TicketStatus, string> = {
  OPEN: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  IN_PROGRESS: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  RESOLVED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
}

interface TicketStatusSelectProps {
  ticketId: string
  currentStatus: TicketStatus
}

export function TicketStatusSelect({ ticketId, currentStatus }: TicketStatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={updateTicketStatusAction}>
      <input type="hidden" name="ticketId" value={ticketId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium outline-none transition-colors ${STATUS_CLASS[currentStatus]}`}
      >
        {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => (
          <option key={s} value={s} className="bg-[#0d0f10] text-zinc-100">
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  )
}
