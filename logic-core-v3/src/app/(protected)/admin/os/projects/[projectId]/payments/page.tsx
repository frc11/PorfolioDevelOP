import { Prisma, ProjectStatus } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  generatePendingMaintenance,
  markMaintenancePaid,
} from '../../_actions/maintenance.actions'
import { markMilestonePaid } from '../../_actions/milestone.actions'

type ProjectPaymentsPageProps = {
  params: Promise<{
    projectId: string
  }>
}

type PaymentsPageData = {
  id: string
  status: ProjectStatus
  maintenanceStartDate: Date | null
  milestones: Array<{
    id: string
    type: 'INICIO' | 'ENTREGA'
    amount: Prisma.Decimal
    paidAt: Date | null
  }>
  maintenancePayments: Array<{
    id: string
    month: number
    year: number
    amount: Prisma.Decimal
    paidAt: Date | null
  }>
}

function formatCurrency(value: Prisma.Decimal): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value.toString()))
}

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

function milestoneLabel(type: 'INICIO' | 'ENTREGA'): string {
  return type === 'INICIO' ? 'Hito de inicio' : 'Hito de entrega'
}

function monthLabel(month: number, year: number): string {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

export default async function AgencyOsProjectPaymentsPage({
  params,
}: ProjectPaymentsPageProps) {
  const { projectId } = await params

  const [projectRecord, milestones, maintenancePayments] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        status: true,
        maintenanceStartDate: true,
      },
    }),
    prisma.osPaymentMilestone.findMany({
      where: { projectId },
      select: {
        id: true,
        type: true,
        amount: true,
        paidAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.osMaintenancePayment.findMany({
      where: { projectId },
      select: {
        id: true,
        month: true,
        year: true,
        amount: true,
        paidAt: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
  ])

  if (!projectRecord) {
    redirect('/admin/os/projects')
  }

  const project: PaymentsPageData = {
    ...projectRecord,
    milestones,
    maintenancePayments,
  }
  const isInMaintenance = Boolean(project.maintenanceStartDate)

  return (
    <section className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-white">Hitos de desarrollo</h3>
          <p className="text-sm text-zinc-400">
            Seguimiento del cobro inicial y contra entrega del proyecto.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {project.milestones.map((milestone) => (
            <article
              key={milestone.id}
              className="rounded-[26px] border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{milestoneLabel(milestone.type)}</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-100">
                    {formatCurrency(milestone.amount)}
                  </p>
                </div>

                <span
                  className={[
                    'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                    milestone.paidAt
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                      : 'border-amber-400/20 bg-amber-400/10 text-amber-200',
                  ].join(' ')}
                >
                  {milestone.paidAt ? `Pagado ${formatDate(milestone.paidAt)}` : 'Pendiente'}
                </span>
              </div>

              {!milestone.paidAt ? (
                <form
                  className="mt-4"
                  action={async () => {
                    'use server'
                    await markMilestonePaid(milestone.id)
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
                  >
                    Marcar pagado
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Mantenimiento mensual</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Estado de pagos recurrentes luego de la entrega.
            </p>
          </div>

          {isInMaintenance ? (
            <form
              action={async () => {
                'use server'
                await generatePendingMaintenance(project.id)
              }}
            >
              <button
                type="submit"
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
              >
                Generar meses pendientes
              </button>
            </form>
          ) : null}
        </div>

        {!isInMaintenance ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
            El proyecto pasara a mantenimiento cuando tenga una fecha de inicio de mantenimiento.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-black/20 text-left text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mes</th>
                    <th className="px-4 py-3 font-medium">Monto</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/[0.03]">
                  {project.maintenancePayments.length > 0 ? (
                    project.maintenancePayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-4 text-zinc-200">
                          {monthLabel(payment.month, payment.year)}
                        </td>
                        <td className="px-4 py-4 text-zinc-300">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={[
                              'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                              payment.paidAt
                                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                                : 'border-amber-400/20 bg-amber-400/10 text-amber-200',
                            ].join(' ')}
                          >
                            {payment.paidAt ? `Pagado ${formatDate(payment.paidAt)}` : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {!payment.paidAt ? (
                            <form
                              action={async () => {
                                'use server'
                                await markMaintenancePaid(payment.id)
                              }}
                            >
                              <button
                                type="submit"
                                className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
                              >
                                Marcar pagado
                              </button>
                            </form>
                          ) : (
                            <span className="text-xs text-zinc-500">Sin accion</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-zinc-500" colSpan={4}>
                        Todavia no hay meses generados para el mantenimiento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </section>
  )
}
