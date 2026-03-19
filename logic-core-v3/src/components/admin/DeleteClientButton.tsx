'use client'

import { deleteClientAction } from '@/lib/actions/clients'

interface DeleteClientButtonProps {
  clientId: string
  companyName: string
}

export function DeleteClientButton({ clientId, companyName }: DeleteClientButtonProps) {
  async function handleAction(formData: FormData) {
    if (
      !window.confirm(
        `¿Eliminar a "${companyName}"?\n\nEsta acción eliminará el cliente, sus proyectos, servicios y mensajes. No se puede deshacer.`
      )
    )
      return
    await deleteClientAction(formData)
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        className="text-sm text-red-400 transition-colors hover:text-red-300"
      >
        Eliminar
      </button>
    </form>
  )
}
