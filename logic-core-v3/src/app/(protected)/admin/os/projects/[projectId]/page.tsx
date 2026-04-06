import Link from 'next/link'
import { Prisma, ServiceStatus, TaskStatus } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type ProjectOverviewPageProps = {
  params: Promise<{
    projectId: string
  }>
}

const INTERNAL_ORGANIZATION_SLUG = 'agency-os-internal'

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
  if (!value) {
    return 'Sin definir'
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value.toString()))
}

function firstDayOfCurrentMonth(): Date {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1)
}

function deriveStartDate(project: {
  osLead: { createdAt: Date } | null
  paymentMilestones: Array<{ createdAt: Date }>
  maintenancePayments: Array<{ createdAt: Date }>
}): Date | null {
  const candidates = [
    project.osLead?.createdAt,
    ...project.paymentMilestones.map((milestone) => milestone.createdAt),
    ...project.maintenancePayments.map((payment) => payment.createdAt),
  ].filter((value): value is Date => Boolean(value))

  if (candidates.length === 0) {
    return null
  }

  return new Date(Math.min(...candidates.map((candidate) => candidate.getTime())))
}

function isMaintenanceUpToDate(project: {
  maintenanceStartDate: Date | null
  maintenancePayments: Array<{
    paidAt: Date | null
    month: number
    year: number
  }>
}): string {
  if (!project.maintenanceStartDate) {
    return 'Todavia no inicio mantenimiento'
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
    return 'Mantenimiento al dia'
  }

  return `${dueMonths - paidMonths} mes(es) pendientes`
}

export default async function AgencyOsProjectOverviewPage({
  params,
}: ProjectOverviewPageProps) {
  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          subscription: true,
          services: {
            where: {
              status: ServiceStatus.ACTIVE,
            },
            orderBy: {
              startDate: 'desc',
            },
            take: 3,
          },
        },
      },
      osLead: {
        select: {
          id: true,
          businessName: true,
          contactName: true,
          phone: true,
          email: true,
          createdAt: true,
        },
      },
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
      paymentMilestones: {
        select: {
          id: true,
          paidAt: true,
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      maintenancePayments: {
        select: {
          id: true,
          paidAt: true,
          month: true,
          year: true,
          createdAt: true,
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      },
    },
  })

  if (!project) {
    redirect('/admin/os/projects')
  }

  const isInternalProject = project.organization.slug === INTERNAL_ORGANIZATION_SLUG
  const startDate = deriveStartDate(project)
  const todoTasks = project.tasks.filter((task) => task.status === TaskStatus.TODO).length
  const inProgressTasks = project.tasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  ).length
  const completedTasks = project.tasks.filter((task) => task.status === TaskStatus.DONE).length
  const paidMilestones = project.paymentMilestones.filter((milestone) => milestone.paidAt).length

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Resumen del proyecto</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {project.description ?? 'Todavia no hay una descripcion detallada para este proyecto.'}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Proyecto</p>
              <p className="mt-2 text-sm text-zinc-100">{project.name}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Estado actual: {project.status.replaceAll('_', ' ')}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Inicio estimado: {formatDate(startDate)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Fechas</p>
              <p className="mt-2 text-sm text-zinc-100">
                Entrega estimada: {formatDate(project.estimatedEndDate)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Entregado: {formatDate(project.deliveredAt)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Mantenimiento: {formatDate(project.maintenanceStartDate)}
              </p>
            </div>
          </div>

          {!isInternalProject ? (
            <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
                Cliente vinculado
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-100">
                {project.organization.companyName}
              </p>
              <p className="mt-1 text-sm text-zinc-400">slug: {project.organization.slug}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Sitio: {project.organization.siteUrl ?? 'Sin sitio configurado'}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Suscripcion: {project.organization.subscription?.planName ?? 'Sin plan'}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Cliente vinculado
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Este proyecto es interno y no se muestra en el dashboard del portal.
              </p>
            </div>
          )}

          {project.osLead ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Lead original</p>
              <Link
                href={`/admin/os/leads/${project.osLead.id}`}
                className="mt-2 inline-flex text-sm font-medium text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
              >
                Abrir ficha de {project.osLead.businessName}
              </Link>
              <p className="mt-2 text-sm text-zinc-400">
                {project.osLead.contactName ?? 'Sin contacto'} · {project.osLead.email ?? 'Sin email'}
              </p>
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
              <p className="mt-2 text-2xl font-semibold text-white">{todoTasks}</p>
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
              <p className="mt-2 text-xl font-semibold text-white">
                {formatCurrency(project.agreedAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Hitos pagados</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {paidMilestones}/{project.paymentMilestones.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Mantenimiento</p>
              <p className="mt-2 text-sm font-medium text-zinc-100">
                {isMaintenanceUpToDate(project)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
