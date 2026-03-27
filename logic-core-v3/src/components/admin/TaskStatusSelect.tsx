'use client'

import { TaskStatus } from '@prisma/client'
import { useRef } from 'react'
import { updateTaskStatusAction } from '@/lib/actions/projects'

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  TODO: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  IN_PROGRESS: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  DONE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
}

interface TaskStatusSelectProps {
  taskId: string
  projectId: string
  currentStatus: TaskStatus
}

export function TaskStatusSelect({ taskId, projectId, currentStatus }: TaskStatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={updateTaskStatusAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="projectId" value={projectId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium outline-none transition-colors ${STATUS_STYLE[currentStatus]}`}
      >
        {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
          <option key={s} value={s} className="bg-[#0d0f10] text-zinc-100">
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  )
}
