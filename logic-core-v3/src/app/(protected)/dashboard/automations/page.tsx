import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { resolveOrgId } from '@/lib/preview'
import { getN8nMetrics, ROI_PER_EXECUTION_USD } from '@/lib/n8n'
import { AutomationsChart } from '@/components/dashboard/AutomationsChart'
import { FadeIn } from '@/components/dashboard/FadeIn'
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Activity,
  Clock,
  Calculator
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
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

const CARD =
  'rounded-xl p-5'
const CARD_STYLE = {
  border: '1px solid rgba(6,182,212,0.2)',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AutomationsPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const client = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { n8nWorkflowIds: true },
  })
  if (!client) redirect('/login')

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div>
          <h1 className="text-xl font-semibold text-white">Automatizaciones</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Métricas de tus workflows de n8n — mes actual
          </p>
        </div>
      </FadeIn>

      {client.n8nWorkflowIds.length === 0 ? (
        <FadeIn delay={0.1}>
          <EmptyState />
        </FadeIn>
      ) : (
        <AutomationsContent workflowIds={client.n8nWorkflowIds} />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-xl py-16 text-center"
      style={CARD_STYLE}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/60">
        <Zap size={22} className="text-zinc-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-300">
          Aún no tenés automatizaciones configuradas
        </p>
        <p className="mt-1 max-w-xs text-sm text-zinc-500">
          Automatizá tus procesos de negocio y ahorrá tiempo. ¡Contactanos para empezar!
        </p>
      </div>
      <Link
        href="/contact"
        className="mt-2 flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/20 hover:text-cyan-300"
        style={{ border: '1px solid rgba(6,182,212,0.2)' }}
      >
        <ExternalLink size={14} />
        Quiero automatizar mi negocio
      </Link>
    </div>
  )
}

async function AutomationsContent({ workflowIds }: { workflowIds: string[] }) {
  const result = await getN8nMetrics(workflowIds)

  if (!result.ok) {
    return (
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
    )
  }

  const { data } = result
  const { totals, workflows, dailyExecutions } = data

  // Mock calculation for the requested ROI widget
  const HORAS_AHORRADAS = Math.round(totals.successful * 0.25) // e.g. 15 mins per execution
  const VALOR_HORA_USD = 25
  const AHORRO_TOTAL_USD = HORAS_AHORRADAS * VALOR_HORA_USD

  return (
    <div className="flex flex-col gap-6">
      {/* Calculadora de ROI Widget */}
      {totals.successful > 0 && (
        <FadeIn delay={0.05}>
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-6 shadow-lg shadow-violet-500/5 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                <Calculator size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-violet-400">Retorno de Inversión (Estimado mensual)</h2>
                <p className="mt-1 pr-4 text-sm text-zinc-300">
                  Tus workflows exitosos simulan un ahorro de <strong className="text-white">{HORAS_AHORRADAS} horas</strong> de trabajo manual.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-sm text-zinc-400">Ahorro ($25 USD / hora)</p>
              <p className="text-3xl font-bold text-white">${AHORRO_TOTAL_USD.toLocaleString('es-AR')} <span className="text-lg font-normal text-zinc-500">USD</span></p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Summary cards */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className={CARD} style={{ ...CARD_STYLE, border: '1px solid rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.04)' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Ejecuciones</p>
              <Activity size={16} className="text-cyan-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-cyan-400">
              {totals.executions.toLocaleString('es-AR')}
            </p>
            <p className="mt-1 text-xs text-zinc-600">en el mes actual</p>
          </div>

          <div className={CARD} style={{ ...CARD_STYLE, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Tasa de éxito</p>
              <CheckCircle2 size={16} className="text-green-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-green-400">
              {totals.successRate}%
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              {totals.successful} exitosas / {totals.failed} fallidas
            </p>
          </div>

          <div className={CARD} style={{ ...CARD_STYLE, border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">ROI estimado</p>
              <Zap size={16} className="text-amber-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-amber-400">
              ${totals.totalRoi.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              ${ROI_PER_EXECUTION_USD} por ejecución exitosa
            </p>
          </div>

          <div className={CARD} style={CARD_STYLE}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Workflows activos</p>
              <Zap size={16} className="text-zinc-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-300">
              {workflows.filter((w) => w.active).length}
              <span className="text-lg text-zinc-600"> / {workflows.length}</span>
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Daily chart */}
      {dailyExecutions.length > 0 && (
        <FadeIn delay={0.2}>
          <div className={CARD} style={CARD_STYLE}>
            <h2 className="mb-4 text-sm font-medium text-zinc-300">
              Ejecuciones por día
            </h2>
            <AutomationsChart data={dailyExecutions} />
          </div>
        </FadeIn>
      )}

      {/* Per-workflow cards */}
      <FadeIn delay={0.3}>
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Detalle por workflow ({workflows.length})
          </h2>

          {workflows.map((wf) => {
            const successPct =
              wf.totalExecutions > 0
                ? Math.round((wf.successfulExecutions / wf.totalExecutions) * 100)
                : 0
            const lastStatus = wf.lastExecutionStatus ?? null

            return (
              <div
                key={wf.id}
                className={CARD}
                style={CARD_STYLE}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
                        wf.active ? 'bg-green-500/10' : 'bg-white/[0.04]'
                      }`}
                    >
                      <Zap
                        size={15}
                        className={wf.active ? 'text-green-400' : 'text-zinc-600'}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{wf.name}</p>
                      <p
                        className={`text-xs ${
                          wf.active ? 'text-green-400' : 'text-zinc-600'
                        }`}
                      >
                        {wf.active ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>

                  {lastStatus && (
                    <span
                      className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLE[lastStatus] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}
                    >
                      Últ: {STATUS_LABEL[lastStatus] ?? lastStatus}
                    </span>
                  )}
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-zinc-500">Ejecuciones</p>
                    <p className="text-sm font-semibold text-zinc-200">
                      {wf.totalExecutions}
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-zinc-500">Exitosas</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-green-400" />
                      <p className="text-sm font-semibold text-green-400">
                        {wf.successfulExecutions}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-zinc-500">Fallidas</p>
                    <div className="flex items-center gap-1">
                      <XCircle size={12} className="text-red-400" />
                      <p className="text-sm font-semibold text-red-400">
                        {wf.failedExecutions}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-zinc-500">ROI estimado</p>
                    <p className="text-sm font-semibold text-amber-400">
                      ${wf.roi.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {wf.totalExecutions > 0 && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-zinc-600">
                      <span>Tasa de éxito</span>
                      <span>{successPct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${successPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Last execution */}
                {wf.lastExecutionAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600">
                    <Clock size={11} />
                    <span>Última ejecución: {formatDateTime(wf.lastExecutionAt)}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </FadeIn>
    </div>
  )
}
