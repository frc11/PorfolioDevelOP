import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Plus } from 'lucide-react'
import { ProjectStatus, TaskStatus } from '@prisma/client'
import { TaskStatusSelect } from '@/components/admin/TaskStatusSelect'
import { DeleteTaskButton } from '@/components/admin/DeleteTaskButton'
import { FadeIn } from '@/components/dashboard/FadeIn'

// ─── Label maps ───────────────────────────────────────────────────────────────

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
}

const TASK_STATUS_NUM_COLOR: Record<TaskStatus, string> = {
  TODO: 'text-zinc-400',
  IN_PROGRESS: 'text-cyan-400',
  DONE: 'text-green-400',
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(6,182,212,0.2)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

const actionBtnStyle = {
  border: '1px solid rgba(255,255,255,0.09)',
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
      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/admin/projects"
              className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <ChevronLeft size={14} />
              Volver a proyectos
            </Link>
            <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
              Proyecto
            </p>
            <h1 className="text-xl font-bold text-zinc-100">{project.name}</h1>
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
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition-all hover:text-zinc-100"
            style={actionBtnStyle}
          >
            <Pencil size={13} />
            Editar
          </Link>
        </div>
      </FadeIn>

      {/* Description */}
      {project.description && (
        <FadeIn delay={0.1}>
        <div className="rounded-xl p-5" style={cardStyle}>
          <h2 className="mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Descripción
          </h2>
          <p className="text-sm text-zinc-300">{project.description}</p>
        </div>
        </FadeIn>
      )}

      {/* Tasks */}
      <FadeIn delay={0.2}>
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
              Tareas ({done}/{total} completadas)
            </h2>
            {total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-1.5 w-40 overflow-hidden rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                    }}
                  />
                </div>
                <span className="text-xs text-zinc-500">{pct}%</span>
              </div>
            )}
          </div>
          <Link
            href={`/admin/projects/${id}/tasks/new`}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-zinc-400 transition-all hover:text-zinc-100"
            style={actionBtnStyle}
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
                className="flex items-start justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${task.status === 'DONE' ? 'text-zinc-600 line-through' : 'text-zinc-100'}`}
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
      </FadeIn>

      {/* Summary row */}
      {total > 0 && (
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-3 gap-3">
            {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((s) => {
              const count = project.tasks.filter((t) => t.status === s).length
              return (
                <div key={s} className="rounded-xl p-4 text-center" style={cardStyle}>
                  <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">
                    {TASK_STATUS_LABEL[s]}
                  </p>
                  <p className={`mt-2 text-2xl font-bold tabular-nums ${TASK_STATUS_NUM_COLOR[s]}`}>
                    {count}
                  </p>
                </div>
              )
            })}
          </div>
        </FadeIn>
      )}
    </div>
  )
}
