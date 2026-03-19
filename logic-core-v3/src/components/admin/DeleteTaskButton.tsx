'use client'

import { deleteTaskAction } from '@/lib/actions/projects'

interface DeleteTaskButtonProps {
  taskId: string
  projectId: string
  taskTitle: string
}

export function DeleteTaskButton({ taskId, projectId, taskTitle }: DeleteTaskButtonProps) {
  async function handleAction(formData: FormData) {
    if (!window.confirm(`¿Eliminar la tarea "${taskTitle}"?`)) return
    await deleteTaskAction(formData)
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        className="text-xs text-red-400 transition-colors hover:text-red-300"
      >
        Eliminar
      </button>
    </form>
  )
}
