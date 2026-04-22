import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import {
  Zap,
  CheckSquare,
  Clock,
  MessageSquare,
  FileText,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  Sparkles,
  Flame,
} from 'lucide-react'
import Link from 'next/link'
import { DownloadReportButtons } from '@/components/dashboard/DownloadReportButton'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AIExecutiveBrief } from '@/components/dashboard/AIExecutiveBrief'
import { StaggerContainer, StaggerItem } from '@/components/dashboard/StaggerWrapper'
import { LeakMeter } from '@/components/dashboard/LeakMeter'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDateES(): string {
  const str = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function relativeDate(date: Date | null): string | null {
  if (!date) return null
  const diffMs = new Date(date).getTime() - Date.now()
  const diffDays = Math.round(diffMs / 86_400_000)
  if (diffDays < -30) return null
  if (diffDays < -1) return `venció hace ${Math.abs(diffDays)} días`
  if (diffDays === -1) return 'venció ayer'
  if (diffDays === 0) return 'vence hoy'
  if (diffDays === 1) return 'vence mañana'
  if (diffDays <= 7) return `vence en ${diffDays} días`
  return null
}

function toBusinessValueTitle(title: string): string {
  const mapping: Record<string, string> = {
    'Integración CMS': 'Centralización de Activos Digitales (CMS)',
    'Desarrollo frontend': 'Interfaz de Gestión de Inventario',
    'Optimización SEO': 'Indexación de Alta Visibilidad',
    'Soporte técnico': 'Continuidad Operativa y Mantenimiento',
    'Configuración API': 'Sincronización de Datos en Tiempo Real',
    'Maquetación': 'Experiencia Exclusiva de Usuario (UX)',
  }
  return mapping[title] || title.charAt(0).toUpperCase() + title.slice(1)
}

const TASK_STATUS_STYLE = {
  TODO: { label: 'Pendiente', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', dot: 'bg-zinc-500' },
  IN_PROGRESS: { label: 'En ejecución', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  DONE: { label: 'Finalizado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
} as const

function TaskIcon({ status }: { status: string }) {
  if (status === 'DONE') return <CheckCircle2 size={13} className="text-emerald-400" />
  if (status === 'IN_PROGRESS') return <Zap size={13} className="text-blue-400" />
  return <Clock size={13} className="text-zinc-500" />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const greeting = getGreeting()
  const dateFormatted = formatDateES()

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
        subscription: { select: { status: true } },
      },
    }),
    prisma.service.count({ where: { organizationId, status: 'ACTIVE' } }),
    prisma.task.count({ where: { project: { organizationId }, status: 'TODO' } }),
    prisma.task.count({ where: { project: { organizationId }, status: 'IN_PROGRESS' } }),
    prisma.message.count({ where: { organizationId, fromAdmin: true, read: false } }),
    prisma.task.findMany({
      where: { project: { organizationId } },
      orderBy: { id: 'desc' },
      take: 5,
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
      glowColor: 'rgba(6,182,212,0.15)',
      trend: null,
      invertColors: false,
    },
    {
      label: 'Tareas pendientes',
      value: todoTasks,
      icon: CheckSquare,
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10',
      glowColor: 'rgba(113,113,122,0.12)',
      trend: null,
      invertColors: true,
    },
    {
      label: 'Tareas en curso',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      glowColor: 'rgba(59,130,246,0.15)',
      trend: null,
      invertColors: false,
    },
    {
      label: 'Mensajes sin leer',
      value: unreadMessages,
      icon: MessageSquare,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      glowColor: 'rgba(245,158,11,0.15)',
      trend: null,
      invertColors: false,
    },
  ]

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-7xl mx-auto w-full pb-20">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <FadeIn delay={0}>
        <div className="pt-2 sm:pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-600 mb-2">
            {dateFormatted}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl leading-tight">
            {greeting},{' '}
            <span
              className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent"
              style={{ textShadow: 'none', filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.25))' }}
            >
              {client.companyName}
            </span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Resumen ejecutivo de tu ecosistema digital
          </p>
        </div>
      </FadeIn>

      {/* ── 2. AI EXECUTIVE BRIEF ───────────────────────────────────────────── */}
      <FadeIn delay={0.02}>
        <div className="relative">
          {/* Animated cyan glow border */}
          <div
            className="absolute -inset-[1px] rounded-xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, transparent 50%, rgba(6,182,212,0.1) 100%)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
          <div className="relative">
            <div className="absolute top-3 right-3 z-20">
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                <Sparkles size={8} />
                IA Generado
              </span>
            </div>
            <AIExecutiveBrief />
          </div>
        </div>
      </FadeIn>

      {/* ── 3. METRICS GRID ────────────────────────────────────────────────── */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, color, bg, glowColor, trend, invertColors }) => (
          <StaggerItem key={label}>
            <div
              className={`group relative overflow-hidden rounded-2xl border-t border-l border-white/10 ${bg.replace('/10', '/5')} p-5 sm:p-6 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.025] hover:border-white/20 cursor-default`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {label}
                </h3>
                <div className={`p-2 rounded-lg bg-black/20 border border-white/5 group-hover:scale-110 transition-transform duration-300 ${color}`}>
                  <Icon size={16} />
                </div>
              </div>

              {/* Counter */}
              <p className={`text-4xl font-black tracking-tight tabular-nums ${color}`}>
                <AnimatedCounter value={value} />
              </p>

              {trend !== null && trend !== undefined && (
                <div className="mt-2">
                  <TrendBadge value={trend} invertColors={invertColors} />
                </div>
              )}

              {/* Corner ambient glow */}
              <div
                className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300"
                style={{ background: glowColor.replace('0.15', '1').replace('0.12', '1') }}
              />
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* ── 4. PIPELINE DE NEGOCIO ──────────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <div
          className="relative overflow-hidden rounded-[2rem] border-t border-l border-white/10 bg-[#07080a]/40 p-7 sm:p-8 shadow-2xl transition-all duration-500 hover:border-cyan-500/30 backdrop-blur-3xl group"
        >
          {/* Ambient glows */}
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
          <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

          {/* DEMO badge */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-500/70">
              Demo
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left side */}
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-500/80">
                  <TrendingUp size={13} />
                  Pipeline de Negocio
                </h2>
                <p className="mt-1.5 text-zinc-500 text-sm max-w-sm">
                  Atribución directa de las estrategias de captación activa.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2.5 backdrop-blur-md transition-all group-hover:bg-white/[0.05]">
                  <Users size={16} className="text-zinc-500" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">Visitas</p>
                    <p className="text-sm font-bold text-white">1,250</p>
                  </div>
                </div>

                <div className="h-px w-5 bg-gradient-to-r from-zinc-800 to-cyan-500/40 hidden sm:block" />

                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2.5 backdrop-blur-md transition-all group-hover:bg-white/[0.05]">
                  <Target size={16} className="text-cyan-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">Leads IQ</p>
                    <p className="text-sm font-bold text-white">31</p>
                  </div>
                </div>

                <div className="h-px w-5 bg-gradient-to-r from-cyan-500/40 to-cyan-500 hidden sm:block" />

                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2.5 backdrop-blur-md transition-all group-hover:bg-white/[0.05]">
                  <Flame size={16} className="text-orange-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">Conv.</p>
                    <p className="text-sm font-bold text-white">2.5%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side — big value */}
            <div className="flex flex-col lg:items-end">
              <span className="mb-2 inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
                Oportunidad Total
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-light text-zinc-600">$</span>
                <div className="relative">
                  <span className="absolute inset-0 blur-xl opacity-30 bg-cyan-500 pointer-events-none group-hover:opacity-50 transition-opacity duration-500" />
                  <p className="relative text-5xl sm:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.45)]">
                    46,500
                  </p>
                </div>
                <span className="text-lg font-bold tracking-widest text-zinc-700">USD</span>
              </div>
              <p className="mt-3 text-[10px] font-medium text-zinc-600 lg:text-right italic">
                Basado en Ticket Promedio LTV · $1,500
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── 5. MEDIDOR DE FUGAS ─────────────────────────────────────────────── */}
      <FadeIn delay={0.06}>
        <LeakMeter organizationId={organizationId} />
      </FadeIn>

      {/* ── 6. PRÓXIMA ACCIÓN ───────────────────────────────────────────────── */}
      {pendingApprovalTask && (
        <FadeIn delay={0.065}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <AlertCircle size={19} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-emerald-400">Acción Requerida</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    La tarea{' '}
                    <strong className="text-white">{pendingApprovalTask.title}</strong>{' '}
                    del proyecto{' '}
                    <strong className="text-white">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(pendingApprovalTask as any).project.name}
                    </strong>{' '}
                    está esperando tu revisión.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/project"
                className="group flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 sm:w-auto"
              >
                Revisar ahora
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── 7. REPORTES ─────────────────────────────────────────────────────── */}
      <FadeIn delay={0.07}>
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/60 backdrop-blur-xl p-6 sm:p-8 transition-all duration-300 hover:border-cyan-500/20 hover:shadow-[0_0_25px_rgba(6,182,212,0.06)]">
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/15 transition-all duration-300">
                <FileText size={17} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Documentación y Reportes
                </h2>
                <p className="mt-0.5 text-xs text-zinc-600">Exclusivo B2B — PDF ejecutivo mensual</p>
              </div>
            </div>
            <p className="mb-5 text-sm text-zinc-500 leading-relaxed max-w-2xl">
              Descargá el resumen ejecutivo en PDF con métricas de sitio, posicionamiento y avance de proyecto.
            </p>
            <DownloadReportButtons isLocked={client.subscription?.status === 'PAST_DUE'} />
          </div>
        </div>
      </FadeIn>

      {/* ── 8. ACTIVIDAD RECIENTE (Timeline) ────────────────────────────────── */}
      <FadeIn delay={0.08}>
        <div className="rounded-2xl border border-white/10 bg-[#0c0e12]/60 backdrop-blur-xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Actividad Reciente
            </h2>
            <Link
              href="/dashboard/project"
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 transition-colors hover:text-cyan-400"
            >
              Ver todo
              <ArrowRight size={10} />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-sm text-zinc-600 italic">Todavía no hay actividad registrada.</p>
          ) : (
            <div className="relative pl-6">
              {/* Vertical timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/40 via-zinc-700/40 to-transparent" />

              <ul className="flex flex-col gap-5">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recentTasks.map((task: any, i: number) => {
                  const style = TASK_STATUS_STYLE[task.status as keyof typeof TASK_STATUS_STYLE]
                  const due = relativeDate(task.dueDate)
                  return (
                    <li key={task.id} className="relative group/item">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#0c0e12] ${style.dot} shadow-[0_0_6px_currentColor]`}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />

                      {/* Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 transition-all duration-200 group-hover/item:border-white/10 group-hover/item:bg-white/[0.035]">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-black/20`}>
                            <TaskIcon status={task.status} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-200 group-hover/item:text-cyan-400 transition-colors">
                              {toBusinessValueTitle(task.title)}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-600">
                              <span className="w-1 h-1 rounded-full bg-cyan-500/60 flex-shrink-0" />
                              <span className="truncate">{task.project?.name}</span>
                              {due && (
                                <>
                                  <span className="opacity-40">·</span>
                                  <span className="text-zinc-600 italic">{due}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className={`flex-shrink-0 w-fit rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.border} ${style.color}`}>
                          {style.label}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </FadeIn>

    </div>
  )
}
