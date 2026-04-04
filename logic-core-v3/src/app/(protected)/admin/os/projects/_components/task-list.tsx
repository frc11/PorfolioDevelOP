'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FolderKanban,
  LoaderCircle,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import type { OsTaskStatus } from '@prisma/client'
import {
  deleteTask,
  updateTask,
} from '@/app/(protected)/admin/os/team/_actions/task.actions'
import { ConfirmDialog } from '@/app/(protected)/admin/os/_components/confirm-dialog'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'
import { TaskForm } from './task-form'

export type TaskAssignee = {
  id: string
  name: string | null
  email: string | null
}

export type TaskTimeEntry = {
  id: string
  hours: number
  date: string
  notes: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

export type TaskListItem = {
  id: string
  projectId: string
  title: string
  description: string | null
  status: OsTaskStatus
  estimatedHours: number | null
  position: number
  assignedToId: string | null
  createdAt: string
  updatedAt: string
  assignedTo: TaskAssignee | null
  _count: {
    timeEntries: number
  }
  totalHours: number
  timeEntries: TaskTimeEntry[]
}

type TaskListProps = {
  projectId: string
  tasks: TaskListItem[]
  assignees: TaskAssignee[]
}

const GROUPS: Array<{ status: OsTaskStatus; label: string }> = [
  { status: 'PENDIENTE', label: 'Pendiente' },
  { status: 'EN_PROGRESO', label: 'En progreso' },
  { status: 'COMPLETADA', label: 'Completada' },
]

function statusTone(status: OsTaskStatus): string {
  switch (status) {
    case 'PENDIENTE':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'
    case 'EN_PROGRESO':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'COMPLETADA':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function statusLabel(status: OsTaskStatus): string {
  switch (status) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'EN_PROGRESO':
      return 'En progreso'
    case 'COMPLETADA':
      return 'Completada'
  }
}

function formatHours(value: number): string {
  return `${value.toFixed(1)} h`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function initialsFromAssignee(assignee: TaskAssignee | null): string {
  const source = assignee?.name?.trim() || assignee?.email?.trim() || 'SA'
  const parts = source.split(/\s+/).slice(0, 2)

  if (parts.length === 1) {
    return parts[0]?.slice(0, 2).toUpperCase() ?? 'SA'
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function buildEditableTask(task: TaskListItem) {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    estimatedHours: task.estimatedHours,
    assignedToId: task.assignedToId,
  }
}

export function TaskList({ projectId, tasks, assignees }: TaskListProps) {
  const router = useRouter()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskListItem | null>(null)
  const [localTasks, setLocalTasks] = useState<TaskListItem[]>(tasks)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const groupedTasks = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        tasks: localTasks.filter((task) => task.status === group.status),
      })),
    [localTasks]
  )

  const handleQuickStatusChange = (taskId: string, status: OsTaskStatus) => {
    const previousTasks = localTasks
    setError(null)
    setOpenMenuTaskId(null)
    setPendingTaskId(taskId)
    setLocalTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task))
    )

    startTransition(async () => {
      const result = await updateTask({
        taskId,
        status,
      })

      if (!result.success) {
        setLocalTasks(previousTasks)
        setError(result.error)
        setPendingTaskId(null)
        return
      }

      setPendingTaskId(null)
      router.refresh()
    })
  }

  const handleDelete = (task: TaskListItem) => {
    const previousTasks = localTasks
    setError(null)
    setPendingTaskId(task.id)
    setTaskToDelete(null)
    setOpenMenuTaskId(null)
    setLocalTasks((current) => current.filter((item) => item.id !== task.id))

    startTransition(async () => {
      const result = await deleteTask(task.id)

      if (!result.success) {
        setLocalTasks(previousTasks)
        setError(result.error)
        setPendingTaskId(null)
        return
      }

      setPendingTaskId(null)
      router.refresh()
    })
  }

  if (localTasks.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Todavia no hay tareas"
        description="Crea la primera tarea para empezar a ordenar backlog, responsables y tiempos del proyecto."
      />
    )
  }

  return (
    <>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {groupedTasks.map((group) => (
          <section
            key={group.status}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-white">{group.label}</h4>
                <p className="mt-1 text-sm text-zinc-500">{group.tasks.length} tareas</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {group.tasks.length > 0 ? (
                group.tasks.map((task) => {
                  const isExpanded = expandedTaskId === task.id
                  const isPending = pendingTaskId === task.id

                  return (
                    <article
                      key={task.id}
                      className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTaskId((current) => (current === task.id ? null : task.id))
                          }
                          className="flex min-w-0 flex-1 items-start gap-3 text-left"
                        >
                          <span className="mt-0.5 text-zinc-500">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-base font-semibold text-white">
                                {task.title}
                              </p>
                              <span
                                className={[
                                  'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                                  statusTone(task.status),
                                ].join(' ')}
                              >
                                {statusLabel(task.status)}
                              </span>
                              {isPending ? (
                                <LoaderCircle className="h-4 w-4 animate-spin text-cyan-200" />
                              ) : null}
                            </div>

                            <div className="mt-3 grid gap-3 text-sm text-zinc-300 md:grid-cols-3">
                              <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-zinc-200">
                                  {initialsFromAssignee(task.assignedTo)}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Asignado
                                  </p>
                                  <p className="truncate">
                                    {task.assignedTo?.name ?? task.assignedTo?.email ?? 'Sin asignar'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-zinc-500" />
                                <div>
                                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Horas
                                  </p>
                                  <p>
                                    {task.estimatedHours !== null
                                      ? formatHours(task.estimatedHours)
                                      : 'Sin estimar'}{' '}
                                    / {formatHours(task.totalHours)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                                <div>
                                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Time entries
                                  </p>
                                  <p>{task._count.timeEntries} registros</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          <ProjectStatusQuickChange
                            task={task}
                            isPending={isPending}
                            onSelect={handleQuickStatusChange}
                          />

                          <TaskForm
                            projectId={projectId}
                            assignees={assignees}
                            task={buildEditableTask(task)}
                            triggerLabel="Editar"
                          />

                          <div className="relative">
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                setOpenMenuTaskId((current) => (current === task.id ? null : task.id))
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isPending ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </button>

                            {openMenuTaskId === task.id ? (
                              <div className="absolute right-0 top-12 z-20 min-w-[160px] rounded-2xl border border-white/10 bg-[#11161d]/95 p-2 shadow-2xl backdrop-blur-xl">
                                <button
                                  type="button"
                                  disabled={isPending}
                                  onClick={() => setTaskToDelete(task)}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Eliminar
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                              Descripcion
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                              {task.description ?? 'Sin descripcion detallada todavia.'}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                              Time entries
                            </p>

                            <div className="mt-3 space-y-3">
                              {task.timeEntries.length > 0 ? (
                                task.timeEntries.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="rounded-2xl border border-white/10 bg-black/20 p-3"
                                  >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-zinc-100">
                                          {entry.user.name ?? entry.user.email ?? 'Super Admin'}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                          {formatDate(entry.date)}
                                        </p>
                                      </div>

                                      <span className="text-sm font-medium text-cyan-200">
                                        {formatHours(entry.hours)}
                                      </span>
                                    </div>

                                    {entry.notes ? (
                                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                                        {entry.notes}
                                      </p>
                                    ) : null}
                                  </div>
                                ))
                              ) : (
                                <EmptyState
                                  icon={Clock3}
                                  title="Sin registros de tiempo"
                                  description="Todavia no hay horas cargadas para esta tarea."
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  )
                })
              ) : (
                <EmptyState
                  icon={FolderKanban}
                  title={`Sin tareas ${group.label.toLowerCase()}`}
                  description="Cuando cambies el estado de una tarea va a aparecer en esta columna."
                />
              )}
            </div>
          </section>
        ))}
      </div>

      <ConfirmDialog
        open={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (!taskToDelete) {
            return
          }

          handleDelete(taskToDelete)
        }}
        title="Eliminar tarea"
        description={
          taskToDelete
            ? `Se eliminara "${taskToDelete.title}" junto con sus registros de tiempo.`
            : ''
        }
        confirmLabel="Eliminar tarea"
        variant="danger"
        isPending={taskToDelete ? pendingTaskId === taskToDelete.id : false}
      />
    </>
  )
}

type ProjectStatusQuickChangeProps = {
  task: TaskListItem
  isPending: boolean
  onSelect: (taskId: string, status: OsTaskStatus) => void
}

function ProjectStatusQuickChange({
  task,
  isPending,
  onSelect,
}: ProjectStatusQuickChangeProps) {
  return (
    <select
      value={task.status}
      disabled={isPending}
      onChange={(event) => onSelect(task.id, event.target.value as OsTaskStatus)}
      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="PENDIENTE">Pendiente</option>
      <option value="EN_PROGRESO">En progreso</option>
      <option value="COMPLETADA">Completada</option>
    </select>
  )
}
