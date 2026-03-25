import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { Zap, CheckSquare, Clock, MessageSquare, FileText, AlertCircle, ArrowRight, TrendingUp, DollarSign, Users, Target } from 'lucide-react'
import Link from 'next/link'
import { DownloadReportButtons } from '@/components/dashboard/DownloadReportButton'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AIExecutiveBrief } from '@/components/dashboard/AIExecutiveBrief'
import { StaggerContainer, StaggerItem } from '@/components/dashboard/StaggerWrapper'
import { LeakMeter } from '@/components/dashboard/LeakMeter'

const TASK_STATUS_STYLE = {
  TODO: 'bg-zinc-400/5 text-zinc-400 border-zinc-500/10',
  IN_PROGRESS: 'bg-blue-400/5 text-blue-400 border-blue-500/10',
  DONE: 'bg-emerald-400/5 text-emerald-400 border-emerald-500/10',
} as const

const TASK_STATUS_LABEL = {
  TODO: 'Pendiente',
  IN_PROGRESS: 'En ejecución',
  DONE: 'Finalizado',
} as const

/**
 * Transforms technical task titles into business-oriented value propositions.
 * Acts as a senior PM bridge between development logic and client ROI.
 */
function toBusinessValueTitle(title: string): string {
  const mapping: Record<string, string> = {
    'Integración CMS': 'Centralización de Activos Digitales (CMS)',
    'Desarrollo frontend': 'Interfaz de Gestión de Inventario',
    'Optimización SEO': 'Indexación de Alta Visibilidad',
    'Soporte técnico': 'Continuidad Operativa y Mantenimiento',
    'Configuración API': 'Sincronización de Datos en Tiempo Real',
    'Maquetación': 'Experiencia Exclusiva de Usuario (UX)',
  }
  
  // Return mapping or capitalize if not found
  return mapping[title] || title.charAt(0).toUpperCase() + title.slice(1)
}

export default async function DashboardPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const results = await Promise.all([
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

  const client = results[0] as any
  const activeServices = results[1] as number
  const todoTasks = results[2] as number
  const inProgressTasks = results[3] as number
  const unreadMessages = results[4] as number
  const recentTasks = results[5] as any[]
  const pendingApprovalTask = results[6] as any

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
    <div className="flex flex-col gap-12 max-w-7xl mx-auto w-full pb-20">
      {/* Header Section */}
      <div className="mb-4">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          {client.companyName}
        </h1>
        <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-widest">
          Resumen Ejecutivo Operativo
        </p>
      </div>

      {/* AI Executive Brief */}
      <FadeIn delay={0.02}>
        <AIExecutiveBrief />
      </FadeIn>

      {/* Valor del Pipeline - Redesigned for High Impact */}
      <FadeIn delay={0.05}>
        <div className="relative overflow-hidden rounded-[2rem] border-t border-l border-white/10 bg-[#07080a]/40 p-8 shadow-2xl transition-all duration-500 hover:border-cyan-500/30 backdrop-blur-3xl group">
          {/* Ambient Perspective Glow */}
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
          <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Side: Cause-Effect Chain */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-500/80">
                  <TrendingUp size={14} />
                  Pipeline de Negocio
                </h2>
                <p className="mt-2 text-zinc-400 text-sm max-w-sm">
                  Atribución directa de las estrategias de captación activa.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3 backdrop-blur-md transition-all group-hover:bg-white/[0.05]">
                  <Users size={18} className="text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Visitas</p>
                    <p className="text-sm font-bold text-white">1,250</p>
                  </div>
                </div>
                
                <div className="h-px w-6 bg-gradient-to-r from-zinc-800 to-cyan-500/40" />

                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3 backdrop-blur-md transition-all group-hover:bg-white/[0.05]">
                  <Target size={18} className="text-cyan-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Leads IQ</p>
                    <p className="text-sm font-bold text-white">31</p>
                  </div>
                </div>

                <div className="h-px w-6 bg-gradient-to-r from-cyan-500/40 to-cyan-500" />
              </div>
            </div>
            
            {/* Right Side: Glowing Monetary Value */}
            <div className="flex flex-col lg:items-end">
              <span className="mb-2 inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                Oportunidad Total
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light text-zinc-500">$</span>
                <div className="relative">
                  {/* Neon Glow Layer */}
                  <span className="absolute inset-0 blur-xl opacity-40 bg-cyan-500 pointer-events-none group-hover:opacity-60 transition-opacity duration-500" />
                  <p className="relative text-6xl font-black tracking-tighter text-white sm:text-7xl drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                    46,500
                  </p>
                </div>
                <span className="text-xl font-bold tracking-widest text-zinc-700">USD</span>
              </div>
              <p className="mt-4 text-[11px] font-medium text-zinc-500 lg:text-right italic">
                Cálculo basado en Ticket Promedio LTV de $1,500
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Medidor de Fugas */}
      <FadeIn delay={0.06}>
        <LeakMeter organizationId={organizationId} />
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
            <div className={`group relative overflow-hidden rounded-2xl border-t border-l border-white/10 ${bg.replace('/10', '/5')} p-6 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)] hover:border-white/20 hover:bg-white/[0.04] cursor-default`}>
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-400 transition-colors">{label}</h3>
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
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Documentación y Reportes</h2>
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
        <h2 className="mb-8 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Registro de Actividad Reciente</h2>

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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                    {toBusinessValueTitle(task.title)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 truncate text-xs text-zinc-500 font-medium">
                    <span className="w-1 h-1 rounded-full bg-cyan-500" />
                    Módulo: {(task as any).project?.name}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 w-fit rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ${TASK_STATUS_STYLE[task.status as keyof typeof TASK_STATUS_STYLE]}`}
                >
                  {TASK_STATUS_LABEL[task.status as keyof typeof TASK_STATUS_LABEL]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
