import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Plus } from 'lucide-react'
import { ProjectStatus, TaskStatus } from '@prisma/client'
import { TaskStatusSelect } from '@/components/admin/TaskStatusSelect'
import { DeleteTaskButton } from '@/components/admin/DeleteTaskButton'

// ─── Label maps ───────────────────────────────────────────────────────────────

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true } },
      tasks: { orderBy: { status: 'asc' } },
    },
  })

  if (!project) notFound()

  const done = project.tasks.filter((t) => t.status === 'DONE').length
  const total = project.tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/projects"
            className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ChevronLeft size={14} />
            Volver a proyectos
          </Link>
          <h1 className="text-xl font-semibold text-zinc-100">{project.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${PROJECT_STATUS_STYLE[project.status]}`}
            >
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
            <Link
              href={`/admin/clients/${project.client.id}`}
              className="text-sm text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              {project.client.companyName}
            </Link>
          </div>
        </div>
        <Link
          href={`/admin/projects/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
        >
          <Pencil size={13} />
          Editar
        </Link>
      </div>

      {/* Description */}
      {project.description && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-2 text-sm font-medium text-zinc-400">Descripción</h2>
          <p className="text-sm text-zinc-300">{project.description}</p>
        </div>
      )}

      {/* Tasks */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-300">
              Tareas ({done}/{total} completadas)
            </h2>
            {total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-40 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500">{pct}%</span>
              </div>
            )}
          </div>
          <Link
            href={`/admin/projects/${id}/tasks/new`}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            <Plus size={12} />
            Agregar tarea
          </Link>
        </div>

        {project.tasks.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No hay tareas todavía.{' '}
            <Link
              href={`/admin/projects/${id}/tasks/new`}
              className="text-cyan-400 hover:text-cyan-300"
            >
              Crear la primera →
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {project.tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start justify-between gap-4 rounded-md border border-zinc-800 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${task.status === 'DONE' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 text-xs text-zinc-600 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="mt-0.5 text-xs text-zinc-600">
                      Vence:{' '}
                      {new Date(task.dueDate).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <TaskStatusSelect
                    taskId={task.id}
                    projectId={id}
                    currentStatus={task.status}
                  />
                  <DeleteTaskButton
                    taskId={task.id}
                    projectId={id}
                    taskTitle={task.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary row */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((s) => {
            const count = project.tasks.filter((t) => t.status === s).length
            return (
              <div
                key={s}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center"
              >
                <p className="text-xs text-zinc-500">{TASK_STATUS_LABEL[s]}</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-100">{count}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
