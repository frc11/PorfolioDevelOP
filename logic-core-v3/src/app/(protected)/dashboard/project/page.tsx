import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { ProjectStatus } from '@prisma/client'
import { MessageSquare, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AnimatedProgressBar } from '@/components/dashboard/AnimatedProgressBar'
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter'
import { CurrentMilestone } from '@/components/dashboard/CurrentMilestone'
import { ProjectTaskTabs } from '@/components/dashboard/ProjectTaskTabs'
import type { SerializedTask } from '@/components/dashboard/ProjectTaskTabs'

// ─── Status badge config ───────────────────────────────────────────────────────

const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING:    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REVIEW:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING:    'Planificación',
  IN_PROGRESS: 'En Curso',
  REVIEW:      'En Revisión',
  COMPLETED:   'Completado',
}

// ─── Task serialization ────────────────────────────────────────────────────────

function serializeTask(task: {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDate: Date | null
  approvalStatus: string | null
}): SerializedTask {
  const daysUntilDue = task.dueDate
    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86_400_000)
    : null

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    approvalStatus: task.approvalStatus ?? null,
    daysUntilDue,
    isUrgent: daysUntilDue !== null && daysUntilDue <= 3 && task.status !== 'DONE',
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProjectPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const projects = await prisma.project.findMany({
    where: { organizationId },
    orderBy: [{ status: 'asc' }, { id: 'desc' }],
    include: { tasks: { orderBy: { id: 'asc' } } },
  })

  // ── Empty state ────────────────────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
                Mi Proyecto
              </h1>
              <p className="mt-1 text-xs font-medium text-zinc-600 uppercase tracking-widest">
                Estado actual y hoja de ruta estratégica
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="relative flex flex-col items-center gap-6 rounded-[2rem] border border-white/8 bg-[#0a0c0f]/60 backdrop-blur-xl py-20 px-8 text-center overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] shadow-2xl">
              <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 animate-pulse" />
              <FolderOpen size={32} className="text-zinc-500 relative z-10" />
            </div>

            <div className="max-w-sm space-y-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase italic">
                Tu proyecto está siendo preparado
              </h2>
              <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                En breve verás toda la hoja de ruta acá. El equipo de develOP está trabajando en los detalles.
              </p>
            </div>

            <Link
              href="/dashboard/messages?context=proyecto"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/30 active:scale-95"
            >
              <MessageSquare size={16} />
              Hablar con el equipo
            </Link>
          </div>
        </FadeIn>
      </div>
    )
  }

  // ── Data prep ──────────────────────────────────────────────────────────────
  const project = projects.find((p) => p.status === 'IN_PROGRESS') ?? projects[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks = project.tasks as any[]

  const doneCount   = tasks.filter((t) => t.status === 'DONE').length
  const totalCount  = tasks.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const pendingApprovalCount = tasks.filter((t) => t.approvalStatus === 'PENDING_APPROVAL').length

  // Serialize tasks for the client component
  const serialized = {
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').map(serializeTask),
    todo:       tasks.filter((t) => t.status === 'TODO').map(serializeTask),
    done:       tasks.filter((t) => t.status === 'DONE').map(serializeTask),
  }

  // Milestone countdown (hardcoded milestone: 15-Apr-2026)
  const MILESTONE_DATE = new Date('2026-04-15T00:00:00')
  const milestoneDaysUntil = Math.max(
    0,
    Math.ceil((MILESTONE_DATE.getTime() - Date.now()) / 86_400_000)
  )

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">

      {/* ── 1. HEADER ─────────────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
              Mi Proyecto
            </h1>
            <p className="mt-1 text-xs font-medium text-zinc-600 uppercase tracking-widest">
              Estado actual y hoja de ruta estratégica
            </p>
          </div>

          {/* Animated status badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${PROJECT_STATUS_STYLE[project.status]}`}
          >
            {project.status === 'IN_PROGRESS' && (
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
            )}
            {project.status === 'COMPLETED' && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            )}
            {PROJECT_STATUS_LABEL[project.status]}
          </div>
        </div>
      </FadeIn>

      {/* ── 2. HERO — progress card ────────────────────────────────────────── */}
      <FadeIn delay={0.06}>
        <div className="relative overflow-hidden rounded-[2rem] border-t border-l border-white/10 bg-[#07080a]/60 p-7 sm:p-8 shadow-2xl backdrop-blur-3xl group transition-all duration-500 hover:border-cyan-500/20">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none group-hover:bg-cyan-500/8 transition-colors" />
          <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-cyan-500/5 blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            {/* Project name + description + big % */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{project.name}</h2>
                {project.description && (
                  <p className="mt-1 text-sm text-zinc-500 max-w-xl leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              {totalCount > 0 && (
                <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter
                      value={progressPct}
                      className="text-5xl sm:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                    />
                    <span className="text-2xl sm:text-3xl font-bold text-zinc-600">%</span>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                    {doneCount}/{totalCount} tareas completadas
                  </p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <AnimatedProgressBar progressPct={progressPct} />
            )}

            {totalCount === 0 && (
              <p className="text-sm text-zinc-600 italic">Sin tareas asignadas aún.</p>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ── 3. MILESTONE ──────────────────────────────────────────────────── */}
      <FadeIn delay={0.1}>
        <CurrentMilestone
          title="Lanzamiento del Panel de Control"
          dueDate="15 de Abril, 2026"
          daysUntil={milestoneDaysUntil}
          description="Fase final de integración donde habilitaremos el acceso total a tus métricas y gestión de inventario en tiempo real."
        />
      </FadeIn>

      {/* ── 4. TASK TABS ──────────────────────────────────────────────────── */}
      <FadeIn delay={0.14}>
        {totalCount === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] py-16 px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
              <FolderOpen size={26} className="text-zinc-600" />
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-semibold text-zinc-400">Proyecto Naciente</p>
              <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                El equipo de develOP aún no ha asignado entregables a tu línea de tiempo. Recibirás notificaciones al iniciar la actividad.
              </p>
            </div>
            <Link
              href="/dashboard/messages?context=proyecto"
              className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-zinc-400 transition-all hover:text-white hover:border-white/20 active:scale-95"
            >
              <MessageSquare size={15} />
              Hablar con el equipo
            </Link>
          </div>
        ) : (
          <ProjectTaskTabs
            inProgress={serialized.inProgress}
            todo={serialized.todo}
            done={serialized.done}
            pendingApprovalCount={pendingApprovalCount}
          />
        )}
      </FadeIn>

    </div>
  )
}
