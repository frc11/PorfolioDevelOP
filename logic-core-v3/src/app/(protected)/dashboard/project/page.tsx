import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { TaskStatus, ProjectStatus } from '@prisma/client'
import { Calendar, CheckCircle2, Circle, Loader2, CircleDashed } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { TaskApprovalButtons } from '@/components/dashboard/TaskApprovalButtons'
import { AnimatedProgressBar } from '@/components/dashboard/AnimatedProgressBar'
import { AnimatedTaskList, AnimatedTaskItem } from '@/components/dashboard/AnimatedTaskList'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { CurrentMilestone } from '@/components/dashboard/CurrentMilestone'

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
  DONE: { dot: 'bg-emerald-400', label: 'text-emerald-400', icon: CheckCircle2 },
}

/**
 * Translates technical task titles into tangible business ROI descriptions.
 */
function toBusinessImpact(title: string): string | null {
  const mapping: Record<string, string> = {
    'Integración CMS': 'Permitirá que cargues tus propios autos sin depender de nosotros.',
    'Desarrollo frontend': 'Habilita la interfaz visual que tus clientes usarán para buscar y filtrar el inventario.',
    'Optimización SEO': 'Aumenta la probabilidad de que aparezcas en los primeros resultados cuando alguien busque "autos en Tucumán".',
    'Soporte técnico': 'Garantiza que el sistema esté operativo 24/7 sin interrupciones.',
    'Configuración API': 'Asegura que los datos de tus vehículos se sincronicen instantáneamente en todas tus plataformas.',
    'Maquetación': 'Mejora la retención de usuarios con una estética de alta gama que genera confianza inmediata.',
  }
  return mapping[title] || null
}

const CARD = 'rounded-xl border border-cyan-500/20 bg-white/5 backdrop-blur-xl p-5'

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
            <p className="text-sm font-medium text-zinc-300">Tu proyecto está siendo preparado</p>
            <p className="max-w-xs text-sm text-zinc-500">
              Pronto tendrás novedades. El equipo de DevelOP está trabajando en los detalles.
            </p>
          </div>
        </FadeIn>
      </div>
    )
  }

  const project = projects.find((p) => p.status === 'IN_PROGRESS') ?? projects[0]
  const tasks = project.tasks
  const doneCount = tasks.filter((t) => t.status === 'DONE').length
  const totalCount = tasks.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const grouped = TASK_STATUS_ORDER.reduce<Record<TaskStatus, typeof tasks>>(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status)
      return acc
    },
    { IN_PROGRESS: [], TODO: [], DONE: [] }
  )

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
              Mi Proyecto
            </h1>
            <p className="mt-1 text-xs font-medium text-zinc-500 uppercase tracking-widest leading-relaxed">
              Estado actual y hoja de ruta estratégica
            </p>
          </div>
          <span className={`inline-flex rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ${PROJECT_STATUS_STYLE[project.status]}`}>
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </div>
      </FadeIn>

      {/* Hero Card with Progress */}
      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/60 p-8 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/20 group">
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-2">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-zinc-400 mb-8 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}

            {totalCount > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                  <span>Progreso de Implementación</span>
                  <span className="text-white">
                    {doneCount}/{totalCount} Tareas · {progressPct}%
                  </span>
                </div>
                <AnimatedProgressBar progressPct={progressPct} />
              </div>
            )}
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
        </div>
      </FadeIn>

      {/* Current Milestone Highlight */}
      <FadeIn delay={0.15}>
        <CurrentMilestone 
          title="Lanzamiento del Panel de Control"
          dueDate="15 de Abril, 2026"
          description="Fase final de integración donde habilitaremos el acceso total a tus métricas y gestión de inventario en tiempo real."
        />
      </FadeIn>

      {/* Vertical Timeline Section */}
      <div className="relative flex flex-col gap-16 pb-20">
        {totalCount > 0 && (
          <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-zinc-800 to-transparent pointer-events-none" />
        )}

        {totalCount === 0 ? (
          <FadeIn delay={0.2}>
            <div className={CARD}>
              <EmptyState 
                icon={<CircleDashed size={28} />} 
                title="Proyecto Naciente" 
                description="El equipo de develOP aún no ha asignado entregables a tu línea de tiempo. Recibirás notificaciones al iniciar la actividad."
              />
            </div>
          </FadeIn>
        ) : (
          TASK_STATUS_ORDER.map((status, i) => {
            const group = grouped[status]
            if (group.length === 0) return null
            const { dot, label } = TASK_GROUP_STYLE[status]

            return (
              <div key={status} className="relative pl-10">
                <div className="absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#040506] border border-white/10 shadow-lg ring-4 ring-[#040506]">
                  <div className={`h-2.5 w-2.5 rounded-full ${dot} shadow-[0_0_10px_currentColor]`} />
                </div>

                <div className="mb-8 flex items-center justify-between">
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${label} drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]`}>
                    {TASK_GROUP_LABEL[status]}
                  </h3>
                  <div className="h-px flex-1 mx-6 bg-gradient-to-r from-white/[0.03] to-transparent" />
                  <span className="text-[10px] font-bold text-zinc-600 tabular-nums uppercase tracking-widest whitespace-nowrap">
                    {group.length} {group.length === 1 ? 'Hito' : 'Hitos'}
                  </span>
                </div>

                <AnimatedTaskList className="flex flex-col gap-4">
                  {group.map((task) => (
                    <AnimatedTaskItem
                      key={task.id}
                      id={task.id}
                      className="group relative rounded-2xl border border-t-white/10 border-l-white/10 border-white/5 bg-white/[0.02] px-6 py-5 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:translate-x-1"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {status === 'DONE' && (
                              <CheckCircle2 size={16} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] flex-shrink-0" />
                            )}
                            {status === 'IN_PROGRESS' && (
                              <Loader2 size={16} className="animate-spin text-blue-400 flex-shrink-0" />
                            )}
                            <p
                              className={[
                                'text-base font-bold tracking-tight transition-all duration-300',
                                status === 'DONE'
                                  ? 'text-zinc-500 line-through decoration-zinc-700/80 shadow-none'
                                  : 'text-zinc-100',
                              ].join(' ')}
                            >
                              {task.title}
                            </p>
                          </div>
                          
                          {toBusinessImpact(task.title) && (
                            <p className="mt-1 text-xs font-medium text-zinc-500 italic opacity-90 pl-7 leading-relaxed flex items-center gap-2">
                              <span className="h-px w-3 bg-zinc-800" />
                              {toBusinessImpact(task.title)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-6 shrink-0 lg:pl-4">
                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                              <Calendar size={12} className="text-zinc-700" />
                              <span>
                                {new Date(task.dueDate).toLocaleDateString('es-AR', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          )}

                          {task.approvalStatus === 'PENDING_APPROVAL' && (
                            <div className="scale-90 origin-right transition-transform hover:scale-95">
                              <TaskApprovalButtons taskId={task.id} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {task.description && (
                        <div className="overflow-hidden max-h-0 transition-all duration-500 group-hover:max-h-40 group-hover:mt-4">
                           <div className="relative pt-4 border-t border-white/5">
                            <p className="text-[11px] leading-relaxed text-zinc-500 pl-7 max-w-2xl">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </AnimatedTaskItem>
                  ))}
                </AnimatedTaskList>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
