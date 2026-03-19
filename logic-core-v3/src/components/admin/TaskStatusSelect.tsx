'use client'

import { useRef } from 'react'
import { updateTaskStatusAction } from '@/lib/actions/projects'
import { TaskStatus } from '@prisma/client'

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  TODO: 'border-zinc-700 bg-zinc-800 text-zinc-300',
  IN_PROGRESS: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  DONE: 'border-green-500/40 bg-green-500/10 text-green-400',
}

interface TaskStatusSelectProps {
  taskId: string
  projectId: string
  currentStatus: TaskStatus
}

export function TaskStatusSelect({
  taskId,
  projectId,
  currentStatus,
}: TaskStatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={updateTaskStatusAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="projectId" value={projectId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        className={`cursor-pointer rounded-md border px-2 py-1 text-xs font-medium outline-none transition-colors ${STATUS_STYLE[currentStatus]}`}
      >
        {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
          <option key={s} value={s} className="bg-zinc-900 text-zinc-100">
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  )
}
