import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { TaskStatus, ProjectStatus } from '@prisma/client'
import { Calendar, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'

// ─── Label / style maps ───────────────────────────────────────────────────────

const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'En revisión',
  COMPLETED: 'Completado',
}

const TASK_STATUS_ORDER: TaskStatus[] = ['IN_PROGRESS', 'TODO', 'DONE']

const TASK_GROUP_LABEL: Record<TaskStatus, string> = {
  IN_PROGRESS: 'En curso',
  TODO: 'Pendientes',
  DONE: 'Completadas',
}

const TASK_GROUP_STYLE: Record<
  TaskStatus,
  { dot: string; label: string; icon: typeof Circle }
> = {
  IN_PROGRESS: { dot: 'bg-blue-400', label: 'text-blue-400', icon: Loader2 },
  TODO: { dot: 'bg-zinc-500', label: 'text-zinc-400', icon: Circle },
  DONE: { dot: 'bg-green-400', label: 'text-green-400', icon: CheckCircle2 },
}

// ─── Card style ───────────────────────────────────────────────────────────────

const CARD =
  'rounded-xl border border-cyan-500/20 bg-white/5 backdrop-blur-xl p-5'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const projects = await prisma.project.findMany({
    where: { organizationId },
    orderBy: [{ status: 'asc' }, { id: 'desc' }],
    include: {
      tasks: { orderBy: { id: 'asc' } },
    },
  })

  // ─── No projects ─────────────────────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <FadeIn>
          <h1 className="text-xl font-semibold text-white">Mi proyecto</h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div
            className="flex flex-col items-center gap-3 rounded-xl py-16 text-center"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/60">
              <Loader2 size={22} className="text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              Tu proyecto está siendo preparado
            </p>
            <p className="max-w-xs text-sm text-zinc-500">
              Pronto tendrás novedades. El equipo de DevelOP está trabajando en los detalles.
            </p>
          </div>
        </FadeIn>
      </div>
    )
  }

  const project =
    projects.find((p) => p.status === 'IN_PROGRESS') ?? projects[0]

  const tasks = project.tasks
  const done = tasks.filter((t) => t.status === 'DONE').length
  const total = tasks.length
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0

  const grouped = TASK_STATUS_ORDER.reduce<Record<TaskStatus, typeof tasks>>(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status)
      return acc
    },
    { IN_PROGRESS: [], TODO: [], DONE: [] }
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-xl font-semibold text-white">Mi proyecto</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Estado actual y tareas de tu proyecto
          </p>
        </div>
      </FadeIn>

      {/* Project card */}
      <FadeIn delay={0.1}>
        <div className={CARD}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white">{project.name}</h2>
              {project.description && (
                <p className="mt-1 text-sm text-zinc-400">{project.description}</p>
              )}
            </div>
            <span
              className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${PROJECT_STATUS_STYLE[project.status]}`}
            >
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
          </div>

          {/* Progress bar */}
          {total > 0 && (
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
                <span>Progreso general</span>
                <span>
                  {done}/{total} tareas completadas · {progressPct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Task groups */}
      {total === 0 ? (
        <FadeIn delay={0.2}>
          <div className={CARD}>
            <p className="text-sm text-zinc-600">
              Todavía no hay tareas registradas en este proyecto.
            </p>
          </div>
        </FadeIn>
      ) : (
        <div className="flex flex-col gap-4">
          {TASK_STATUS_ORDER.map((status, i) => {
            const group = grouped[status]
            if (group.length === 0) return null
            const { dot, label, icon: GroupIcon } = TASK_GROUP_STYLE[status]

            return (
              <FadeIn key={status} delay={0.2 + i * 0.1}>
                <div className={CARD}>
                  {/* Group header */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    <h3 className={`text-xs font-semibold uppercase tracking-wide ${label}`}>
                      {TASK_GROUP_LABEL[status]}
                    </h3>
                    <span className="text-xs text-zinc-600">({group.length})</span>
                  </div>

                  {/* Tasks */}
                  <ul className="flex flex-col gap-2">
                    {group.map((task) => (
                      <li
                        key={task.id}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <GroupIcon
                            size={14}
                            className={`mt-0.5 flex-shrink-0 ${TASK_GROUP_STYLE[status].label} ${status === 'IN_PROGRESS' ? 'animate-spin' : ''}`}
                            style={status === 'IN_PROGRESS' ? { animationDuration: '3s' } : {}}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={[
                                'text-sm',
                                status === 'DONE'
                                  ? 'text-zinc-500 line-through'
                                  : 'text-zinc-100',
                              ].join(' ')}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="mt-0.5 text-xs text-zinc-600">
                                {task.description}
                              </p>
                            )}
                            {task.dueDate && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
                                <Calendar size={10} />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )
          })}
        </div>
      )}
    </div>
  )
}
