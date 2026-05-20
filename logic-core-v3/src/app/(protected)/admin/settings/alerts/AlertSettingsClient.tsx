'use client'

import { useState } from 'react'
import { Bell, Play, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { BotAlert, BotAlertSeverity } from '@prisma/client'

// Include new enum values pending prisma generate
type BotAlertType =
  | 'LLM_PROVIDER_ERROR'
  | 'QUOTA_EXHAUSTED'
  | 'BOT_INACTIVE_WITH_TRAFFIC'
  | 'LATENCY_DEGRADED'
  | 'CRON_INSIGHTS_FAILED'
  | 'ACTIVITY_ERRORS_SPIKE'
  | 'CLIENT_NO_ACTIVITY'
  | 'DOMAIN_NOT_AUTHORIZED_SPIKE'
  | 'LEAD_CAPTURE_FAILURE'

interface Stats {
  total: number
  pending: number
  last24h: number
}

interface Props {
  stats: Stats
  recentAlerts: BotAlert[]
}

const SEVERITY_COLORS: Record<BotAlertSeverity, string> = {
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/20',
  HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  WARNING: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  INFO: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

const ALERT_DOCS: Record<BotAlertType, { trigger: string; action: string }> = {
  LLM_PROVIDER_ERROR: {
    trigger: '3+ errores LLM en la última hora',
    action: 'Revisar Vertex AI status, config del bot',
  },
  QUOTA_EXHAUSTED: {
    trigger: 'Bot llegó al 100% de su quota mensual',
    action: 'Comunicar al cliente upgrade de plan',
  },
  BOT_INACTIVE_WITH_TRAFFIC: {
    trigger: 'Bot inactivo con tráfico en 24h',
    action: 'Reactivar bot o revisar configuración',
  },
  LATENCY_DEGRADED: {
    trigger: 'P95 > 10s en la última hora',
    action: 'Revisar performance, posible cold start',
  },
  CRON_INSIGHTS_FAILED: {
    trigger: '1+ fallas del cron de insights en 24h',
    action: 'Revisar logs del cron de insights',
  },
  ACTIVITY_ERRORS_SPIKE: {
    trigger: '5+ eventos de error en la última hora',
    action: 'Investigar patrón de errores',
  },
  CLIENT_NO_ACTIVITY: {
    trigger: 'Bot activo sin conversaciones en 7 días',
    action: 'Verificar instalación, contactar cliente',
  },
  DOMAIN_NOT_AUTHORIZED_SPIKE: {
    trigger: '10+ bloqueos de origen en 24h',
    action: 'Posible abuso, revisar logs de seguridad',
  },
  LEAD_CAPTURE_FAILURE: {
    trigger: '3+ errores de capture_lead en la última hora',
    action: 'Revisar la tool del bot, validaciones',
  },
}

export function AlertSettingsClient({ stats, recentAlerts }: Props) {
  const [running, setRunning] = useState(false)
  const [lastResult, setLastResult] = useState<{
    ok: boolean
    alertsCreated?: number
    issuesFound?: number
    error?: string
  } | null>(null)

  async function triggerDetector() {
    setRunning(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/admin/alerts/trigger-detector', { method: 'POST' })
      const data = await res.json()
      setLastResult(data)
    } catch {
      setLastResult({ ok: false, error: 'Error de red' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total alertas', value: stats.total },
          { label: 'Pendientes', value: stats.pending },
          { label: 'Últimas 24h', value: stats.last24h },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Trigger manual */}
      <div className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Ejecutar detector ahora</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Corre el detector manualmente sin esperar el cron de 15 minutos.
            </p>
          </div>
          <button
            onClick={triggerDetector}
            disabled={running}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={13} strokeWidth={1.5} />
            {running ? 'Ejecutando...' : 'Probar detector'}
          </button>
        </div>

        {lastResult && (
          <div
            className={`mt-4 rounded-xl border p-3 text-sm ${
              lastResult.ok
                ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                : 'border-red-400/20 bg-red-400/8 text-red-300'
            }`}
          >
            {lastResult.ok ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={13} strokeWidth={1.5} />
                Detector ejecutado — {lastResult.issuesFound} issues encontrados,{' '}
                {lastResult.alertsCreated} alertas nuevas creadas
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <XCircle size={13} strokeWidth={1.5} />
                Error: {lastResult.error}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cron info */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
        <Clock size={16} strokeWidth={1.5} className="shrink-0 text-zinc-500" />
        <p className="text-xs text-zinc-400">
          El detector corre automáticamente <strong className="text-zinc-300">cada 15 minutos</strong>.
          Notifica por email (severidad HIGH+) y Telegram (si está configurado).
        </p>
      </div>

      {/* Tipos de alerta */}
      <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/8 p-4">
          <Bell size={14} strokeWidth={1.5} className="text-zinc-500" />
          <h2 className="text-sm font-medium text-zinc-200">Tipos de alerta — condiciones de disparo</h2>
        </div>
        <div className="divide-y divide-white/5">
          {(Object.keys(ALERT_DOCS) as BotAlertType[]).map((type) => (
            <div key={type} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-zinc-300">{type}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    <span className="text-zinc-400">Trigger:</span> {ALERT_DOCS[type].trigger}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    <span className="text-zinc-400">Acción:</span> {ALERT_DOCS[type].action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas recientes */}
      {recentAlerts.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-white/8 p-4">
            <AlertTriangle size={14} strokeWidth={1.5} className="text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-200">Alertas recientes (últimas 10)</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-4">
                <span
                  className={`mt-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${SEVERITY_COLORS[alert.severity]}`}
                >
                  {alert.severity}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{alert.description}</p>
                  <p className="mt-1 text-[10px] text-zinc-600">
                    {new Date(alert.createdAt).toLocaleString('es-AR')} · {alert.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
