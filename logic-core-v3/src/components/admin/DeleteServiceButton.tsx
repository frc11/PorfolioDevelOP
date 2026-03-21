'use client'

import { deleteServiceAction } from '@/lib/actions/services'

interface DeleteServiceButtonProps {
  serviceId: string
  organizationId: string
  serviceLabel: string
}

export function DeleteServiceButton({
  serviceId,
  organizationId,
  serviceLabel,
}: DeleteServiceButtonProps) {
  async function handleAction(formData: FormData) {
    if (!window.confirm(`¿Eliminar el servicio "${serviceLabel}"?`)) return
    await deleteServiceAction(formData)
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="organizationId" value={organizationId} />
      <button
        type="submit"
        className="text-xs text-red-400 transition-colors hover:text-red-300"
      >
        Eliminar
      </button>
    </form>
  )
}
