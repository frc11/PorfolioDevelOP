import Link from 'next/link'
import type { ProjectStatus, TaskStatus } from '@prisma/client'
import { ArrowUpRight, CircleDollarSign, FolderKanban } from 'lucide-react'

type ProjectTask = {
  id: string
  status: TaskStatus
}

type PaymentMilestone = {
  id: string
  amount: { toString(): string }
  dueAt: Date | null
  paidAt: Date | null
}

type ClientProject = {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  agreedAmount: { toString(): string } | null
  monthlyRate: { toString(): string } | null
  maintenanceStartDate: Date | null
  deliveredAt: Date | null
  estimatedEndDate: Date | null
  tasks: ProjectTask[]
  paymentMilestones: PaymentMilestone[]
}

type ClientProjectsProps = {
  projects: ClientProject[]
}

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function formatCurrency(value: { toString(): string } | null | undefined) {
  if (!value) {
    return '—'
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value.toString()))
}

function getStatusTone(status: ProjectStatus) {
  switch (status) {
    case 'PLANNING':
      return 'border-zinc-400/20 bg-zinc-400/10 text-zinc-200'
    case 'IN_PROGRESS':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'REVIEW':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'COMPLETED':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function getStatusLabel(status: ProjectStatus) {
  switch (status) {
    case 'PLANNING':
      return 'Planning'
    case 'IN_PROGRESS':
      return 'En progreso'
    case 'REVIEW':
      return 'Revision'
    case 'COMPLETED':
      return 'Completado'
  }
}

export function ClientProjects({ projects }: ClientProjectsProps) {
  return (
    <section id="projects" className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Proyectos
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Entregas vinculadas
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-300">
            {projects.length} proyecto(s)
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-4 py-8 text-sm text-zinc-500">
              Esta organizacion todavia no tiene proyectos vinculados.
            </div>
          ) : (
            projects.map((project) => {
              const totalTasks = project.tasks.length
              const doneTasks = project.tasks.filter((task) => task.status === 'DONE').length
              const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
              const totalMilestones = project.paymentMilestones.length
              const paidMilestones = project.paymentMilestones.filter(
                (milestone) => milestone.paidAt
              ).length
              const milestoneAmount = project.paymentMilestones.reduce(
                (total, milestone) => total + Number(milestone.amount.toString()),
                0
              )

              return (
                <Link
                  key={project.id}
                  href={`/admin/os/projects/${project.id}`}
                  className="group block rounded-[26px] border border-white/10 bg-black/20 p-5 transition-colors hover:border-cyan-400/20 hover:bg-white/[0.06]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-lg font-semibold text-white">
                          {project.name}
                        </p>
                        <span
                          className={[
                            'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                            getStatusTone(project.status),
                          ].join(' ')}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      {project.description ? (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-400">
                          {project.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-zinc-500">
                          Sin descripcion operativa.
                        </p>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-sm text-cyan-200 transition-colors group-hover:text-cyan-100">
                      Ver proyecto
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 text-zinc-200">
                        <FolderKanban className="h-4 w-4 text-zinc-500" />
                        <span>
                          {doneTasks}/{totalTasks} tareas completadas
                        </span>
                      </div>
                      <span className="text-zinc-400">{progress}%</span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Monto acordado
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatCurrency(project.agreedAmount)}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Fee mensual
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {formatCurrency(project.monthlyRate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-zinc-200">
                        <CircleDollarSign className="h-4 w-4 text-zinc-500" />
                        <p className="text-sm font-medium">Milestones</p>
                      </div>
                      {totalMilestones > 0 ? (
                        <>
                          <p className="mt-2 text-sm text-zinc-300">
                            {paidMilestones}/{totalMilestones} cobrados
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Total planificado {formatCurrency({
                              toString: () => milestoneAmount.toString(),
                            })}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-zinc-500">Sin hitos definidos</p>
                      )}
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Fechas clave
                      </p>
                      <div className="mt-2 space-y-1.5">
                        <p>Estimado: {formatDate(project.estimatedEndDate)}</p>
                        <p>Entregado: {formatDate(project.deliveredAt)}</p>
                        <p>Mantenimiento: {formatDate(project.maintenanceStartDate)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
