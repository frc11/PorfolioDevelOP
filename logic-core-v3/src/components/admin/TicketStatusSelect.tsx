'use client'

import { TicketStatus } from '@prisma/client'
import { useRef, useTransition } from 'react'
import { updateTicketStatusAction } from '@/lib/actions/tickets'

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
}

const STATUS_CLASS: Record<TicketStatus, string> = {
  OPEN: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  IN_PROGRESS: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  RESOLVED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
}

interface TicketStatusSelectProps {
  ticketId: string
  currentStatus: TicketStatus
}

export function TicketStatusSelect({ ticketId, currentStatus }: TicketStatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          await updateTicketStatusAction(formData)
        })
      }
    >
      <input type="hidden" name="ticketId" value={ticketId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        disabled={isPending}
        className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium outline-none transition-colors ${STATUS_CLASS[currentStatus]}`}
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
