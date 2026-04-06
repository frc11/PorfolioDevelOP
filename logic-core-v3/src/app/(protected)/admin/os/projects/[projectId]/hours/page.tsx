import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { listTimeEntriesByProject } from '@/app/(protected)/admin/os/team/_actions/time-entry.actions'
import { TimeEntryPanel } from '../../_components/time-entry-panel'

type ProjectHoursPageProps = {
  params: Promise<{
    projectId: string
  }>
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatHours(value: number): string {
  return `${value.toFixed(1)} h`
}

export default async function AgencyOsProjectHoursPage({ params }: ProjectHoursPageProps) {
  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      agreedAmount: true,
      tasks: {
        select: {
          id: true,
          title: true,
          estimatedHours: true,
        },
        orderBy: [
          {
            position: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],
      },
    },
  })

  if (!project) {
    redirect('/admin/os/projects')
  }

  const entryResult = await listTimeEntriesByProject(projectId)
  const groupedEntries = entryResult.success ? entryResult.data : []

  const estimatedHours = project.tasks.reduce(
    (sum, task) => sum + (task.estimatedHours ?? 0),
    0
  )
  const totalHours = groupedEntries.reduce((sum, group) => sum + group.totalHours, 0)
  const difference = totalHours - estimatedHours
  const agreedAmount = project.agreedAmount ? Number(project.agreedAmount.toString()) : null
  const hourlyValue = totalHours > 0 && agreedAmount !== null ? agreedAmount / totalHours : null

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Horas totales</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatHours(totalHours)}</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Horas estimadas</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatHours(estimatedHours)}</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Diferencia</p>
          <p
            className={[
              'mt-3 text-3xl font-semibold',
              difference > 0
                ? 'text-rose-300'
                : difference < 0
                  ? 'text-emerald-300'
                  : 'text-white',
            ].join(' ')}
          >
            {difference > 0 ? '+' : ''}
            {formatHours(difference)}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Valor hora</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {hourlyValue ? formatCurrency(hourlyValue) : '—'}
          </p>
        </div>
      </div>

      {!entryResult.success ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {entryResult.error}
        </div>
      ) : null}

      <TimeEntryPanel
        tasks={project.tasks.map((task) => ({
          id: task.id,
          title: task.title,
        }))}
        groupedEntries={groupedEntries}
      />
    </section>
  )
}
