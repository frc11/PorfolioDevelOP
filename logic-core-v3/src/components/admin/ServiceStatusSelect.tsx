'use client'

import { useRef } from 'react'
import { updateServiceStatusAction } from '@/lib/actions/services'
import { ServiceStatus } from '@prisma/client'

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLE: Record<ServiceStatus, string> = {
  ACTIVE: 'border-green-500/40 bg-green-500/10 text-green-400',
  PAUSED: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  CANCELLED: 'border-red-500/40 bg-red-500/10 text-red-400',
}

interface ServiceStatusSelectProps {
  serviceId: string
  clientId: string
  currentStatus: ServiceStatus
}

export function ServiceStatusSelect({
  serviceId,
  clientId,
  currentStatus,
}: ServiceStatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={updateServiceStatusAction}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="clientId" value={clientId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        className={`cursor-pointer rounded-md border px-2 py-1 text-xs font-medium outline-none transition-colors ${STATUS_STYLE[currentStatus]}`}
      >
        {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map((s) => (
          <option key={s} value={s} className="bg-zinc-900 text-zinc-100">
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  )
}
