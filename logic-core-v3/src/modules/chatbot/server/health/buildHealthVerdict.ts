import type { HealthCheckResult } from './checkHealth'
import type { LatencyHistoryResult } from '../admin/getLatencyHistory'

export type VerdictLevel = 'ok' | 'warning' | 'critical'

export interface VerdictReason {
  level: VerdictLevel
  title: string
  hint?: string
}

export interface HealthVerdict {
  level: VerdictLevel
  headline: string
  subline: string
  reasons: VerdictReason[]
}

// Thresholds in milliseconds — anything above warns the operator.
const DB_LATENCY_WARN_MS = 500
const CHAT_P95_WARN_MS = 5000
const CHAT_P95_CRITICAL_MS = 12_000

export function buildHealthVerdict(
  health: HealthCheckResult,
  latency: LatencyHistoryResult
): HealthVerdict {
  const reasons: VerdictReason[] = []

  if (!health.checks.env.ok) {
    const missing = health.checks.env.details.vars
      .filter((v) => !v.present && v.required)
      .map((v) => v.name)
    reasons.push({
      level: 'critical',
      title: 'Faltan variables esenciales para arrancar',
      hint:
        missing.length > 0
          ? `Sin ${missing.join(', ')} el bot no puede funcionar.`
          : 'Revisá .env.local y reiniciá el servidor.',
    })
  }

  if (!health.checks.database.ok) {
    reasons.push({
      level: 'critical',
      title: 'La base de datos no responde',
      hint: 'El bot no puede guardar ni leer conversaciones hasta que vuelva.',
    })
  } else if (
    typeof health.checks.database.latencyMs === 'number' &&
    health.checks.database.latencyMs > DB_LATENCY_WARN_MS
  ) {
    reasons.push({
      level: 'warning',
      title: 'Base de datos lenta',
      hint: `Tarda ${health.checks.database.latencyMs}ms en responder (lo normal es <${DB_LATENCY_WARN_MS}ms).`,
    })
  }

  if (!health.checks.llmProvider.ok) {
    reasons.push({
      level: 'critical',
      title: 'El cerebro del bot (Google AI) no responde',
      hint: health.checks.llmProvider.error ?? 'Revisá la API key y que la API esté habilitada.',
    })
  }

  if (!health.checks.bot.ok) {
    reasons.push({
      level: 'critical',
      title: 'El bot no está configurado',
      hint: health.checks.bot.error ?? 'Corré el seed para crear el bot develop.',
    })
  } else if (health.checks.bot.isActive === false) {
    reasons.push({
      level: 'warning',
      title: 'El bot está pausado',
      hint: 'Los visitantes no pueden chatear hasta que lo reactives.',
    })
  }

  if (latency.status === 'ok' && latency.p95Overall !== null) {
    if (latency.p95Overall > CHAT_P95_CRITICAL_MS) {
      reasons.push({
        level: 'critical',
        title: 'El bot tarda demasiado en responder',
        hint: `El 95% de las respuestas tarda más de ${(latency.p95Overall / 1000).toFixed(1)}s. Algo está muy lento.`,
      })
    } else if (latency.p95Overall > CHAT_P95_WARN_MS) {
      reasons.push({
        level: 'warning',
        title: 'El bot está más lento de lo normal',
        hint: `P95 en ${(latency.p95Overall / 1000).toFixed(1)}s (lo normal es <${CHAT_P95_WARN_MS / 1000}s).`,
      })
    }
  }

  const hasCritical = reasons.some((r) => r.level === 'critical')
  const hasWarning = reasons.some((r) => r.level === 'warning')

  if (hasCritical) {
    return {
      level: 'critical',
      headline: 'Problema',
      subline: 'Hay algo roto que impide que el bot funcione bien.',
      reasons,
    }
  }

  if (hasWarning) {
    return {
      level: 'warning',
      headline: 'Atención',
      subline: 'El bot funciona, pero hay algo que conviene revisar.',
      reasons,
    }
  }

  const subline =
    latency.status === 'ok'
      ? `Todos los sistemas responden bien. P95 en ${((latency.p95Overall ?? 0) / 1000).toFixed(1)}s con ${latency.totalSamples} conversaciones medidas.`
      : latency.status === 'insufficient'
        ? `Todos los sistemas responden. Aún con poco tráfico para medir velocidad (${latency.totalSamples}/${latency.minSamplesNeeded} respuestas).`
        : 'Todos los sistemas responden. El bot está listo para recibir consultas.'

  return {
    level: 'ok',
    headline: 'Todo OK',
    subline,
    reasons: [],
  }
}
