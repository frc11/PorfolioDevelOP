import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Zap, CheckSquare, Clock, MessageSquare, FileText } from 'lucide-react'
import { DownloadReportButtons } from '@/components/dashboard/DownloadReportButton'

const TASK_STATUS_STYLE = {
  TODO: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DONE: 'bg-green-500/10 text-green-400 border-green-500/20',
} as const

const TASK_STATUS_LABEL = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
} as const

export default async function DashboardPage() {
  const session = await auth()
  const organizationId = session?.user?.organizationId

  if (!organizationId) redirect('/login')

  const [
    client,
    activeServices,
    todoTasks,
    inProgressTasks,
    unreadMessages,
    recentTasks,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { companyName: true },
    }),
    prisma.service.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.task.count({
      where: { project: { organizationId }, status: 'TODO' },
    }),
    prisma.task.count({
      where: { project: { organizationId }, status: 'IN_PROGRESS' },
    }),
    prisma.message.count({
      where: { organizationId, fromAdmin: true, read: false },
    }),
    prisma.task.findMany({
      where: { project: { organizationId } },
      orderBy: { id: 'desc' },
      take: 3,
      include: { project: { select: { name: true } } },
    }),
  ])

  if (!client) redirect('/login')

  const SUMMARY_CARDS = [
    {
      label: 'Servicios activos',
      value: activeServices,
      icon: Zap,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      label: 'Tareas pendientes',
      value: todoTasks,
      icon: CheckSquare,
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10',
      border: 'border-zinc-500/20',
    },
    {
      label: 'Tareas en curso',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Mensajes sin leer',
      value: unreadMessages,
      icon: MessageSquare,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">
          Bienvenido, {client.companyName}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Este es el resumen de tu proyecto con DevelOP
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-lg border ${border} ${bg} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className={`mt-3 text-3xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Reports */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={15} className="text-cyan-400" />
          <h2 className="text-sm font-medium text-zinc-300">Reportes mensuales</h2>
        </div>
        <p className="mb-4 text-xs text-zinc-500">
          Descargá el resumen ejecutivo en PDF con las métricas de tu sitio, posicionamiento y avance del proyecto.
        </p>
        <DownloadReportButtons />
      </div>

      {/* Recent tasks */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Últimas novedades</h2>

        {recentTasks.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Todavía no hay tareas registradas en tus proyectos.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-200">{task.title}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {task.project.name}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${TASK_STATUS_STYLE[task.status]}`}
                >
                  {TASK_STATUS_LABEL[task.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
