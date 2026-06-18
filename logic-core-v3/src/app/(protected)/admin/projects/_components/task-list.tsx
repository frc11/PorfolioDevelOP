'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FolderKanban,
  LoaderCircle,
  Send,
  Trash2,
} from 'lucide-react'
import type { ApprovalStatus, TaskStatus } from '@prisma/client'
import {
  deleteTask,
  updateTask,
} from '@/app/(protected)/admin/team/_actions/task.actions'
import { EmptyState } from '@/components/ui'
import { sendTaskForApprovalAction } from '@/lib/actions/projects'
import { OverlayModal } from './overlay-modal'
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
  status: TaskStatus
  estimatedHours: number | null
  position: number
  assignedToId: string | null
  createdAt: string
  updatedAt: string
  assignedTo: TaskAssignee | null
  approvalStatus: ApprovalStatus | null
  rejectionReason: string | null
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
  showApprovalFlow?: boolean
}

const GROUPS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'TODO', label: 'Pendiente' },
  { status: 'IN_PROGRESS', label: 'En progreso' },
  { status: 'DONE', label: 'Completada' },
]

function statusTone(status: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'
    case 'IN_PROGRESS':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'DONE':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function statusLabel(status: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'Pendiente'
    case 'IN_PROGRESS':
      return 'En progreso'
    case 'DONE':
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

function approvalTone(status: ApprovalStatus): string {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-200'
    case 'APPROVED':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
    case 'REJECTED':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
  }
}

function approvalLabel(status: ApprovalStatus): string {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'Esperando aprobacion del cliente'
    case 'APPROVED':
      return 'Aprobada por el cliente'
    case 'REJECTED':
      return 'Cambios solicitados'
  }
}

export function TaskList({
  projectId,
  tasks,
  assignees,
  showApprovalFlow = false,
}: TaskListProps) {
  const router = useRouter()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskListItem | null>(null)
  const [localTasks, setLocalTasks] = useState<TaskListItem[]>(tasks)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null)
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

  const handleQuickStatusChange = (taskId: string, status: TaskStatus) => {
    const previousTasks = localTasks
    setError(null)
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

  const handleDropOnStatus = (status: TaskStatus) => {
    const taskId = draggingTaskId
    setDraggingTaskId(null)
    setDragOverStatus(null)

    if (!taskId) {
      return
    }

    const task = localTasks.find((item) => item.id === taskId)
    if (!task || task.status === status) {
      return
    }

    handleQuickStatusChange(taskId, status)
  }

  const handleDelete = (task: TaskListItem) => {
    const previousTasks = localTasks
    setError(null)
    setPendingTaskId(task.id)
    setTaskToDelete(null)
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

        {groupedTasks.map((group) => {
          const draggingTask = draggingTaskId
            ? localTasks.find((item) => item.id === draggingTaskId)
            : undefined
          const canDropHere = draggingTask !== undefined && draggingTask.status !== group.status
          const showDropHint = canDropHere && dragOverStatus === group.status

          return (
          <section
            key={group.status}
            onDragOver={(event) => {
              if (canDropHere) {
                event.preventDefault()
                setDragOverStatus(group.status)
              }
            }}
            onDragLeave={(event) => {
              // Solo limpiar al salir de la sección de verdad, no al cruzar hijos.
              if (
                canDropHere &&
                !event.currentTarget.contains(event.relatedTarget as Node | null)
              ) {
                setDragOverStatus(null)
              }
            }}
            onDrop={(event) => {
              event.preventDefault()
              handleDropOnStatus(group.status)
            }}
            className={[
              'rounded-[28px] border bg-white/5 p-5 backdrop-blur-xl transition-colors',
              showDropHint ? 'border-cyan-400/40 bg-cyan-400/[0.06]' : 'border-white/10',
            ].join(' ')}
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
                      draggable={!isPending}
                      onDragStart={(event) => {
                        // El cuerpo de la card arrastra; los controles marcados
                        // con data-no-drag (Editar/borrar/aprobación) no inician
                        // drag y siguen clickeables.
                        if ((event.target as HTMLElement).closest('[data-no-drag]')) {
                          event.preventDefault()
                          return
                        }
                        setDraggingTaskId(task.id)
                        event.dataTransfer.effectAllowed = 'move'
                        event.dataTransfer.setData('text/plain', task.id)
                      }}
                      onDragEnd={() => {
                        setDraggingTaskId(null)
                        setDragOverStatus(null)
                      }}
                      className={[
                        'rounded-[24px] border border-white/10 bg-black/20 p-4 transition-[opacity,transform,box-shadow] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none',
                        isPending ? '' : 'cursor-grab active:cursor-grabbing',
                        draggingTaskId === task.id ? 'opacity-50' : '',
                      ].join(' ')}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onClick={() =>
                            setExpandedTaskId((current) => (current === task.id ? null : task.id))
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setExpandedTaskId((current) => (current === task.id ? null : task.id))
                            }
                          }}
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
                              {showApprovalFlow && task.approvalStatus ? (
                                <span
                                  className={[
                                    'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                                    approvalTone(task.approvalStatus),
                                  ].join(' ')}
                                >
                                  {approvalLabel(task.approvalStatus)}
                                </span>
                              ) : null}
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

                            {showApprovalFlow && task.approvalStatus === 'REJECTED' && task.rejectionReason ? (
                              <div className="mt-3 rounded-2xl border border-rose-400/15 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-rose-200/80">
                                      Motivo del rechazo
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-rose-100">
                                      {task.rejectionReason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2" data-no-drag>
                          {showApprovalFlow ? (
                            <TaskApprovalControl task={task} projectId={projectId} />
                          ) : null}

                          <TaskForm
                            projectId={projectId}
                            assignees={assignees}
                            task={buildEditableTask(task)}
                            triggerLabel="Editar"
                          />

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setTaskToDelete(task)}
                            aria-label={`Eliminar tarea ${task.title}`}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/10 text-rose-300 transition-colors hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isPending ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            )}
                          </button>
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
          )
        })}
      </div>

      <OverlayModal
        open={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        title="Eliminar tarea"
        eyebrow="develOP / Proyectos / Tareas"
        panelClassName="max-w-md"
      >
        <div className="mt-5 space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" strokeWidth={1.5} />
            <p>
              Se eliminará <span className="font-semibold">{taskToDelete?.title}</span> junto con sus
              registros de tiempo. Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setTaskToDelete(null)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (taskToDelete) {
                  handleDelete(taskToDelete)
                }
              }}
              className="rounded-2xl border border-rose-400/20 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-500/25"
            >
              Eliminar tarea
            </button>
          </div>
        </div>
      </OverlayModal>
    </>
  )
}

type TaskApprovalControlProps = {
  task: TaskListItem
  projectId: string
}

function TaskApprovalControl({ task, projectId }: TaskApprovalControlProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (task.approvalStatus || task.status !== 'DONE') {
    return null
  }

  const handleSendForApproval = () => {
    const formData = new FormData()
    formData.set('taskId', task.id)
    formData.set('projectId', projectId)

    startTransition(async () => {
      await sendTaskForApprovalAction(formData)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleSendForApproval}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-100 transition-colors hover:border-amber-300/35 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      Enviar a aprobacion
    </button>
  )
}
