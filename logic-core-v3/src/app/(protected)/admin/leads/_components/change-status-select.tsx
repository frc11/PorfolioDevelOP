'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui'
import { updateLeadStatus } from '../_actions/lead.actions'
import { ALL_PIPELINE_STATUSES, STATUS_LABELS } from './lead-pipeline.shared'

const STATUS_OPTIONS = ALL_PIPELINE_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}))

const POSTPONE_DAYS = 7

type ChangeStatusSelectProps = {
  leadId: string
  status: string
}

/**
 * "Cambiar estado" del detalle (Bloque C · P7). Reemplaza el <details> + forms de server
 * action por el Select compartido (estética consistente, foco/Esc/teclado resueltos). Al
 * elegir un estado se llama updateLeadStatus (misma lógica) y se refresca.
 */
export function ChangeStatusSelect({ leadId, status }: ChangeStatusSelectProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = (next: string) => {
    if (next === status || isPending) {
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await updateLeadStatus({
        leadId,
        status: next,
        reactivateAt:
          next === 'POSTERGADO'
            ? new Date(Date.now() + POSTPONE_DAYS * 24 * 60 * 60 * 1000)
            : undefined,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <Select
        aria-label="Cambiar estado del lead"
        value={status}
        onChange={(event) => handleChange(event.target.value)}
        options={STATUS_OPTIONS}
        disabled={isPending}
        className="min-w-[200px]"
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </div>
  )
}
