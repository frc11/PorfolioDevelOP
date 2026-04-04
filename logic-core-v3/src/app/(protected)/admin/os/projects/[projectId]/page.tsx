import Link from 'next/link'
import { OsProjectStatus, OsTaskStatus, Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type ProjectOverviewPageProps = {
  params: Promise<{
    projectId: string
  }>
}

type ProjectOverviewRecord = Prisma.OsProjectGetPayload<{
  include: {
    lead: {
      select: {
        id: true
        businessName: true
      }
    }
    tasks: {
      select: {
        id: true
        status: true
      }
    }
    milestones: {
      select: {
        id: true
        paidAt: true
        amount: true
      }
    }
    maintenancePayments: {
      select: {
        id: true
        paidAt: true
        month: true
        year: true
      }
    }
  }
}>

function formatDate(value: Date | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function formatCurrency(value: Prisma.Decimal | null): string {
  const amount = value ? Number(value.toString()) : 0

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount)
}

function firstDayOfCurrentMonth(): Date {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1)
}

function isMaintenanceUpToDate(project: ProjectOverviewRecord): string {
  if (project.status !== OsProjectStatus.EN_MANTENIMIENTO) {
    return 'Todavía no inició mantenimiento'
  }

  if (!project.maintenanceStartDate) {
    return 'Pendiente definir fecha de inicio'
  }

  const currentMonth = firstDayOfCurrentMonth()
  const startMonth = new Date(
    project.maintenanceStartDate.getFullYear(),
    project.maintenanceStartDate.getMonth(),
    1
  )

  const dueMonths =
    (currentMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (currentMonth.getMonth() - startMonth.getMonth()) +
    1

  const paidMonths = project.maintenancePayments.filter((payment) => payment.paidAt).length

  if (paidMonths >= dueMonths) {
    return 'Mantenimiento al día'
  }

  return `${dueMonths - paidMonths} mes(es) pendientes`
}

export default async function AgencyOsProjectOverviewPage({
  params,
}: ProjectOverviewPageProps) {
  const { projectId } = await params

  const project = await prisma.osProject.findUnique({
    where: { id: projectId },
    include: {
      lead: {
        select: {
          id: true,
          businessName: true,
        },
      },
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
      milestones: {
        select: {
          id: true,
          paidAt: true,
          amount: true,
        },
      },
      maintenancePayments: {
        select: {
          id: true,
          paidAt: true,
          month: true,
          year: true,
        },
      },
    },
  })

  if (!project) {
    redirect('/admin/os/projects')
  }

  const pendingTasks = project.tasks.filter((task) => task.status === OsTaskStatus.PENDIENTE).length
  const inProgressTasks = project.tasks.filter((task) => task.status === OsTaskStatus.EN_PROGRESO).length
  const completedTasks = project.tasks.filter((task) => task.status === OsTaskStatus.COMPLETADA).length
  const paidMilestones = project.milestones.filter((milestone) => milestone.paidAt).length

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Resumen del proyecto</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {project.description ?? 'Todavía no hay una descripción detallada para este proyecto.'}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Cliente</p>
              <p className="mt-2 text-sm text-zinc-100">{project.businessName}</p>
              <p className="mt-1 text-sm text-zinc-400">{project.contactName}</p>
              <p className="mt-1 text-sm text-zinc-400">{project.contactEmail ?? 'Sin email'}</p>
              <p className="mt-1 text-sm text-zinc-400">{project.contactPhone ?? 'Sin teléfono'}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Fechas</p>
              <p className="mt-2 text-sm text-zinc-100">Inicio: {formatDate(project.startDate)}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Entrega estimada: {formatDate(project.estimatedEndDate)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Entregado: {formatDate(project.deliveredAt)}
              </p>
            </div>
          </div>

          {project.lead ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Lead original</p>
              <Link
                href={`/admin/os/leads/${project.lead.id}`}
                className="mt-2 inline-flex text-sm font-medium text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
              >
                Abrir ficha de {project.lead.businessName}
              </Link>
            </div>
          ) : null}
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Tareas</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Pendientes</p>
              <p className="mt-2 text-2xl font-semibold text-white">{pendingTasks}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">En progreso</p>
              <p className="mt-2 text-2xl font-semibold text-white">{inProgressTasks}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Completadas</p>
              <p className="mt-2 text-2xl font-semibold text-white">{completedTasks}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Finanzas</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Monto acordado</p>
              <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(project.agreedAmount)}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Hitos pagados</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {paidMilestones}/{project.milestones.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Mantenimiento</p>
              <p className="mt-2 text-sm font-medium text-zinc-100">{isMaintenanceUpToDate(project)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
