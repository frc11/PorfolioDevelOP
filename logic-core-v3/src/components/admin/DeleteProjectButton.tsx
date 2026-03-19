'use client'

import { deleteProjectAction } from '@/lib/actions/projects'

interface DeleteProjectButtonProps {
  projectId: string
  projectName: string
}

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  async function handleAction(formData: FormData) {
    if (
      !window.confirm(
        `¿Eliminar el proyecto "${projectName}"?\n\nSe eliminarán también todas sus tareas. Esta acción no se puede deshacer.`
      )
    )
      return
    await deleteProjectAction(formData)
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        className="text-sm text-red-400 transition-colors hover:text-red-300"
      >
        Eliminar
      </button>
    </form>
  )
}
