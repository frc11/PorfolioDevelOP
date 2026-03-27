'use client'

import { ServiceStatus } from '@prisma/client'
import { useRef } from 'react'
import { updateServiceStatusAction } from '@/lib/actions/services'

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLE: Record<ServiceStatus, string> = {
  ACTIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  PAUSED: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  CANCELLED: 'border-red-500/30 bg-red-500/10 text-red-200',
}

interface ServiceStatusSelectProps {
  serviceId: string
  organizationId: string
  currentStatus: ServiceStatus
}

export function ServiceStatusSelect({
  serviceId,
  organizationId,
  currentStatus,
}: ServiceStatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={updateServiceStatusAction}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="organizationId" value={organizationId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium outline-none transition-colors ${STATUS_STYLE[currentStatus]}`}
      >
        {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map((s) => (
          <option key={s} value={s} className="bg-[#0d0f10] text-zinc-100">
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  )
}
