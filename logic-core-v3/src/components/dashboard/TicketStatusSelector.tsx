'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { TicketStatus } from '@prisma/client'
import { Select } from '@/components/ui'
import { updateTicketStatusAction } from '@/lib/tickets/actions'

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En Progreso',
  RESOLVED: 'Resuelto',
}

export function TicketStatusSelector({
  ticketId,
  currentStatus,
}: {
  ticketId: string
  currentStatus: TicketStatus
}) {
  const router = useRouter()
  const [status, setStatus] = useState<TicketStatus>(currentStatus)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  function handleChange(nextStatus: TicketStatus) {
    const previous = status
    setError(null)
    setStatus(nextStatus)

    startTransition(async () => {
      const result = await updateTicketStatusAction(ticketId, nextStatus)
      if (!result.success) {
        setStatus(previous)
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Estado
        </label>
        <div className="flex items-center gap-1.5">
          {isPending ? (
            <Loader2
              size={12}
              className="animate-spin text-cyan-400"
              aria-label="Actualizando estado"
            />
          ) : null}
          <Select
            value={status}
            disabled={isPending}
            onChange={(event) => handleChange(event.target.value as TicketStatus)}
            options={(Object.keys(STATUS_LABELS) as TicketStatus[]).map((option) => ({
              value: option,
              label: STATUS_LABELS[option],
            }))}
            aria-label="Cambiar estado del ticket"
            className="min-w-[140px] text-xs font-bold"
          />
        </div>
      </div>
      {error ? <p className="text-[10px] text-red-400">{error}</p> : null}
    </div>
  )
}
