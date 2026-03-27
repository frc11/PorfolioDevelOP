import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { getN8nMetrics, ROI_PER_EXECUTION_USD, type WorkflowMetrics } from '@/lib/n8n'
import { requestUpsellAction } from '@/lib/actions/upsell'
import { AutomationsChart } from '@/components/dashboard/AutomationsChart'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AutomationsAlertas } from '@/components/dashboard/AutomationsAlertas'
import { RoiAnualizado } from '@/components/dashboard/RoiAnualizado'
import { TiempoAhorrado } from '@/components/dashboard/TiempoAhorrado'
import { AnalyticsMetricCard } from '@/components/dashboard/AnalyticsMetricCard'
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

function successBarColor(pct: number): string {
  if (pct >= 95) return '#22c55e'
  if (pct >= 80) return '#f59e0b'
  return '#ef4444'
}

const STATUS_STYLE: Record<string, string> = {
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  crashed: 'bg-red-500/10 text-red-400 border-red-500/20',
  waiting: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  canceled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

const STATUS_LABEL: Record<string, string> = {
  success: 'Exitosa',
  error: 'Fallida',
  crashed: 'Error crítico',
  waiting: 'Esperando',
  running: 'En curso',
  canceled: 'Cancelada',
}

const CARD_STYLE = {
  border: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.025)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AutomationsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  const isDemo = demo === 'true'
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const client = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { n8nWorkflowIds: true },
  })
  if (!client) redirect('/login')

  const hasWorkflows = client.n8nWorkflowIds.length > 0
  const activarAutomatizaciones = requestUpsellAction.bind(null, 'automatizaciones', 'Automatizaciones n8n')

  return (
    <div className="flex flex-col gap-6">
      {!hasWorkflows && !isDemo ? (
        <>
          {/* ── Header ── */}
          <FadeIn>
            <AutomationsHeader isMockData={false} />
          </FadeIn>

          {/* ── Empty state ── */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center gap-6 rounded-2xl py-24 text-center border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10 flex flex-col items-center gap-5">
                {/* Icon with glow ring */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0c0e12] border border-white/10 shadow-inner group-hover:border-cyan-500/25 transition-colors duration-500">
                    <Zap size={28} className="text-zinc-600 group-hover:text-cyan-500 transition-colors duration-500" />
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <p className="text-base font-bold text-white tracking-tight">
                    Activá la automatización de procesos
                  </p>
                  <p className="max-w-sm mx-auto text-sm text-zinc-500 font-medium leading-relaxed">
                    Ahorrá horas de trabajo manual conectando tus herramientas y automatizando tareas recurrentes con n8n.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <form action={activarAutomatizaciones}>
                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-cyan-400 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      ACTIVAR AHORA
                    </button>
                  </form>
                  <a
                    href="?demo=true"
                    className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-white/[0.08] hover:text-white active:scale-95 transition-all backdrop-blur-md"
                  >
                    VER DEMO VISUAL
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </>
      ) : (
        <AutomationsContent workflowIds={client.n8nWorkflowIds} />
      )}
    </div>
  )
}

// ─── AutomationsContent ───────────────────────────────────────────────────────

async function AutomationsContent({ workflowIds }: { workflowIds: string[] }) {
  const result = await getN8nMetrics(workflowIds)

  if (!result.ok) {
    return (
      <>
        <FadeIn>
          <AutomationsHeader isMockData={false} />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-sm">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                No se pudieron cargar las métricas
              </p>
              <p className="mt-1 text-xs text-amber-400/70">{result.error}</p>
            </div>
          </div>
        </FadeIn>
      </>
    )
  }

  const { data } = result
  const { totals, workflows, dailyExecutions } = data
  const activeCount = workflows.filter((w) => w.active).length

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <FadeIn>
        <AutomationsHeader isMockData={data.isMockData} />
      </FadeIn>

      {/* ── Banner demo ── */}
      {data.isMockData && (
        <FadeIn delay={0.05}>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={15} className="flex-shrink-0 text-yellow-400" />
              <p className="text-sm text-yellow-400/90 truncate">
                Estás viendo datos de demostración. Contactanos para activar tus automatizaciones reales.
              </p>
            </div>
            <a
              href="/dashboard/messages"
              className="flex-shrink-0 text-xs font-semibold text-yellow-400 underline underline-offset-2 hover:text-yellow-300 transition-colors"
            >
              Activar métricas reales
            </a>
          </div>
        </FadeIn>
      )}

      {/* ── Alertas automáticas ── */}
      <FadeIn delay={0.08}>
        <AutomationsAlertas totals={totals} workflows={workflows} />
      </FadeIn>

      {/* ── ROI Anualizado ── */}
      {totals.successful > 0 && (
        <FadeIn delay={0.1}>
          <RoiAnualizado
            monthlyRoi={totals.totalRoi}
            successfulExecutions={totals.successful}
          />
        </FadeIn>
      )}

      {/* ── 4 Metric cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsMetricCard
          label="Ejecuciones totales"
          tooltip="Veces que tus workflows se ejecutaron este mes"
          displayValue={totals.executions.toLocaleString('es-AR')}
          rawValue={totals.executions}
          icon={<Activity size={18} />}
          color="cyan"
          trend={{ value: 0 }}
          delay={0.12}
        />
        <AnalyticsMetricCard
          label="Tasa de éxito"
          tooltip={`${totals.successful} exitosas · ${totals.failed} fallidas este mes`}
          displayValue={`${totals.successRate}%`}
          rawValue={totals.successRate}
          suffix="%"
          icon={<CheckCircle2 size={18} />}
          color="green"
          trend={{ value: 0 }}
          delay={0.16}
        />
        <AnalyticsMetricCard
          label="ROI del mes"
          tooltip={`$${ROI_PER_EXECUTION_USD} de valor estimado por ejecución exitosa`}
          displayValue={`$${Math.round(totals.totalRoi).toLocaleString('es-AR')}`}
          icon={<Zap size={18} />}
          color="amber"
          trend={{ value: 0 }}
          delay={0.2}
        />
        <AnalyticsMetricCard
          label="Workflows activos"
          tooltip={`${activeCount} de ${workflows.length} automatizaciones activas ahora mismo`}
          displayValue={`${activeCount} / ${workflows.length}`}
          rawValue={activeCount}
          icon={<Zap size={18} />}
          color="violet"
          trend={{ value: 0 }}
          delay={0.24}
        />
      </div>

      {/* ── Tiempo ahorrado ── */}
      {totals.successful > 0 && (
        <FadeIn delay={0.28}>
          <TiempoAhorrado successfulExecutions={totals.successful} />
        </FadeIn>
      )}

      {/* ── Gráfico ejecuciones ── */}
      {dailyExecutions.length > 0 && (
        <FadeIn delay={0.32}>
          <div className="rounded-2xl p-6" style={CARD_STYLE}>
            <div className="mb-5 flex items-center gap-2.5">
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-1.5">
                <TrendingUp size={13} className="text-cyan-400" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-300">
                Ejecuciones por día — mes actual
              </h2>
            </div>
            <AutomationsChart data={dailyExecutions} />
          </div>
        </FadeIn>
      )}

      {/* ── Detalle por workflow ── */}
      <FadeIn delay={0.38}>
        {workflows.length === 0 ? (
          <WorkflowsEmptyState />
        ) : (
          <WorkflowCards workflows={workflows} />
        )}
      </FadeIn>
    </div>
  )
}

// ─── WorkflowCards ────────────────────────────────────────────────────────────

function WorkflowCards({ workflows }: { workflows: WorkflowMetrics[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-1.5">
          <Zap size={12} className="text-cyan-400" />
        </div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Detalle por workflow ({workflows.length})
        </h2>
      </div>

      {workflows.map((wf) => {
        const successPct =
          wf.totalExecutions > 0
            ? Math.round((wf.successfulExecutions / wf.totalExecutions) * 100)
            : 0
        const barColor = successBarColor(successPct)
        const lastStatus = wf.lastExecutionStatus ?? null

        return (
          <div key={wf.id} className="rounded-xl p-5" style={CARD_STYLE}>
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
                    wf.active
                      ? 'border-green-500/20 bg-green-500/10'
                      : 'border-white/[0.08] bg-white/[0.04]'
                  }`}
                >
                  <Zap
                    size={15}
                    className={wf.active ? 'text-green-400' : 'text-zinc-600'}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">{wf.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {wf.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                        </span>
                        Activo
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">Inactivo</span>
                    )}
                    {wf.failedExecutions > 3 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                        <AlertTriangle size={9} />
                        {wf.failedExecutions} fallos
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {lastStatus && (
                <span
                  className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLE[lastStatus] ?? 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                  }`}
                >
                  Últ: {STATUS_LABEL[lastStatus] ?? lastStatus}
                </span>
              )}
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-zinc-500">Ejecuciones</p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-200">
                  {wf.totalExecutions}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Exitosas</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-green-400" />
                  <p className="text-sm font-semibold text-green-400">
                    {wf.successfulExecutions}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Fallidas</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <XCircle
                    size={12}
                    className={wf.failedExecutions > 0 ? 'text-red-400' : 'text-zinc-700'}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      wf.failedExecutions > 0 ? 'text-red-400' : 'text-zinc-700'
                    }`}
                  >
                    {wf.failedExecutions}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">ROI estimado</p>
                <p className="mt-0.5 text-sm font-semibold text-amber-400">
                  ${Math.round(wf.roi).toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {wf.totalExecutions > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Tasa de éxito</span>
                  <span className="font-semibold" style={{ color: barColor }}>
                    {successPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${successPct}%`,
                      background: barColor,
                      boxShadow: `0 0 8px ${barColor}55`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Last execution */}
            {wf.lastExecutionAt && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600">
                <Clock size={11} />
                <span>Última ejecución: {formatRelativeTime(wf.lastExecutionAt)}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── AutomationsHeader ────────────────────────────────────────────────────────

function AutomationsHeader({ isMockData }: { isMockData: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2">
        <Zap size={18} className="text-cyan-400" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-white">Automatizaciones</h1>
          {isMockData && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">
                Preview Activo
              </span>
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-zinc-500">
          Métricas de tus workflows n8n — mes actual
        </p>
      </div>
    </div>
  )
}

// ─── WorkflowsEmptyState ──────────────────────────────────────────────────────

function WorkflowsEmptyState() {
  return (
    <div className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] py-24 text-center backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-2xl bg-cyan-500/10 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0c0e12] shadow-inner transition-colors duration-500 group-hover:border-cyan-500/25">
            <Zap
              size={28}
              className="text-zinc-600 transition-colors duration-500 group-hover:text-cyan-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-base font-bold tracking-tight text-white">
            Aún no tenés automatizaciones configuradas
          </p>
          <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-zinc-500">
            Automatizá tareas repetitivas y recuperá horas de trabajo cada mes.
          </p>
        </div>

        <a
          href="/contact"
          className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95"
        >
          Quiero automatizar mi negocio
        </a>
      </div>
    </div>
  )
}

