import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { Zap, CheckSquare, Clock, MessageSquare, FileText, AlertCircle, ArrowRight, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { DownloadReportButtons } from '@/components/dashboard/DownloadReportButton'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AIExecutiveBrief } from '@/components/dashboard/AIExecutiveBrief'
import { StaggerContainer, StaggerItem } from '@/components/dashboard/StaggerWrapper'

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
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const [
    client,
    activeServices,
    todoTasks,
    inProgressTasks,
    unreadMessages,
    recentTasks,
    pendingApprovalTask,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { 
        companyName: true,
        subscription: { select: { status: true } }
      },
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
    prisma.task.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { project: { organizationId }, approvalStatus: 'PENDING_APPROVAL' } as any,
      orderBy: { id: 'asc' },
      include: { project: { select: { id: true, name: true } } },
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

      {/* AI Executive Brief */}
      <FadeIn delay={0.02}>
        <AIExecutiveBrief />
      </FadeIn>

      {/* Valor del Pipeline */}
      <FadeIn delay={0.05}>
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#0c0e12]/60 backdrop-blur-xl p-6 shadow-lg shadow-cyan-500/5 group transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/40 hover:bg-[#0c0e12]/80">
          {/* Subtle Glow Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-cyan-400">Valor del Pipeline (Estimado mensual)</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Basado en <strong className="text-zinc-200">1,250 visitas</strong> y <strong className="text-zinc-200">31 leads</strong> generados (Ticket prom. $1,500).
                </p>
              </div>
            </div>
            
            <div className="flex shrink-0 flex-col sm:items-end bg-black/20 p-3 rounded-xl border border-white/5">
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Oportunidad de negocio</p>
              <div className="flex items-center gap-1 sm:justify-end">
                <DollarSign size={20} className="text-cyan-400" />
                <p className="text-3xl font-bold text-white tracking-tight">46,500 <span className="text-lg font-medium text-zinc-600">USD</span></p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Próxima Acción Requerida */}
      {pendingApprovalTask && (
        <div className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <AlertCircle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400">Acción Requerida</h2>
                <p className="mt-1 text-sm text-zinc-300">
                  La tarea <strong className="text-white">{pendingApprovalTask.title}</strong>{' '}
                  del proyecto <strong className="text-white">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(pendingApprovalTask as any).project.name}
                  </strong>{' '}
                  está esperando tu revisión.
                </p>
              </div>
            </div>
            
            <Link 
              href={`/dashboard/project`}
              className="group flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:bg-emerald-400 sm:w-auto"
            >
              Revisar ahora
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <StaggerItem key={label}>
            <div className={`group relative overflow-hidden rounded-2xl border ${border} ${bg} p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)] hover:border-white/20 hover:bg-white/[0.04] cursor-default`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">{label}</p>
                <div className={`p-2 rounded-lg bg-black/20 border border-white/5 group-hover:scale-110 transition-transform duration-300 ${color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className={`mt-4 text-4xl font-bold tracking-tight ${color}`}>{value}</p>
              
              {/* Corner Glow */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-300 ${bg.replace('/10', '')}`} />
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Reports */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/60 backdrop-blur-xl p-8 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
            <FileText size={18} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reportes mensuales</h2>
        </div>
        <p className="mb-6 text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Descargá el resumen ejecutivo en PDF con las métricas de tu sitio, posicionamiento y avance del proyecto. Exclusivo para B2B.
        </p>
        <div className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
          <DownloadReportButtons isLocked={client.subscription?.status === 'PAST_DUE'} />
        </div>
      </div>

      {/* Recent tasks */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0e12]/60 backdrop-blur-xl p-8">
        <h2 className="mb-6 text-lg font-bold text-white tracking-tight">Últimas novedades</h2>

        {recentTasks.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">
            Todavía no hay tareas registradas en tus proyectos.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentTasks.map((task) => (
              <li
                key={task.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-lg"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">{task.title}</p>
                  <p className="mt-1.5 flex items-center gap-2 truncate text-xs text-zinc-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(task as any).project?.name}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${TASK_STATUS_STYLE[task.status]}`}
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
