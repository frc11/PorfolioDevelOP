// H.1 — dispara /api/cron/send-weekly-reports. netlify.toml declaraba
// [functions."send-weekly-reports-cron"] con schedule pero sin archivo real en
// netlify/functions/ — mismo defecto que D.3 resolvió para generate-insights:
// Netlify agenda algo que no existe y falla en silencio.
// Agendada vía netlify.toml: [functions."send-weekly-reports-cron"]
// schedule = "0 12 * * MON". El nombre de este archivo debe matchear ese key
// exacto (Netlify deriva el nombre de la function del filename).
//
// Espejo de cleanup-old-events-cron.ts — a diferencia de generate-insights-cron
// (D.3), acá NO hace falta adaptar el método: /api/cron/send-weekly-reports
// también es GET, igual que el target del molde, así que el fetch se deja sin
// `method` explícito (default GET), igual que el molde.
//
// Dos mejoras de D.3 que sí se traen porque valen igual acá:
//   1. Falla cerrado del lado del llamador si falta URL o CRON_SECRET — no
//      llamar con "Bearer undefined" (el molde ya hacía esto).
//   2. Log estructurado (type/level/timestamp), no strings con prefijo.
// Se agrega ADEMÁS un timeout explícito (el molde no tiene ninguno). El
// trabajo acá es más liviano que el de D.3 — sendWeeklyReports.ts manda
// emails transaccionales por bot, no llama al LLM — pero el techo que importa
// no es la duración esperada del trabajo: es el mismo límite duro de
// plataforma (~26s en una function síncrona estándar, ver razonamiento en
// generate-insights-cron.ts) que ninguna de las dos supera de todos modos.
// Mismo valor, misma razón.
const FETCH_TIMEOUT_MS = 20_000

function log(level: 'info' | 'error', type: string, extra: Record<string, unknown> = {}) {
  const record = { type, level, timestamp: new Date().toISOString(), ...extra }
  if (level === 'error') {
    console.error(JSON.stringify(record))
  } else {
    console.log(JSON.stringify(record))
  }
}

/**
 * Resumen seguro del body de la ruta — `{ok, total, sent, failed, skipped, errors}`
 * (campos sueltos, no anidados bajo `results` como en generate-insights).
 * `errors: string[]` (`sendWeeklyReports.ts:82,86-88`) trae `${bot.slug}: ${mensaje}`,
 * y ese mensaje puede traer el email del destinatario si el provider lo hace
 * eco en su error — se loguea solo la CANTIDAD, nunca el contenido.
 */
function summarizeResult(body: string): Record<string, unknown> | undefined {
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    return undefined
  }
  if (typeof parsed !== 'object' || parsed === null) return undefined
  const fields = parsed as Record<string, unknown>

  const summary: Record<string, unknown> = {}
  for (const key of ['total', 'sent', 'failed', 'skipped']) {
    if (key in fields) summary[key] = fields[key]
  }
  if ('errors' in fields) {
    summary.errorsCount = Array.isArray(fields.errors) ? fields.errors.length : undefined
  }
  return summary
}

export const handler = async () => {
  const siteUrl = process.env.URL
  const cronSecret = process.env.CRON_SECRET

  if (!siteUrl || !cronSecret) {
    log('error', 'send_weekly_reports_cron.missing_env', {
      hasSiteUrl: Boolean(siteUrl),
      hasCronSecret: Boolean(cronSecret),
    })
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Missing URL or CRON_SECRET environment variable' }),
    }
  }

  const startedAt = Date.now()

  try {
    const response = await fetch(`${siteUrl}/api/cron/send-weekly-reports`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    const body = await response.text()
    const durationMs = Date.now() - startedAt

    if (!response.ok) {
      log('error', 'send_weekly_reports_cron.route_error', { status: response.status, durationMs })
      return { statusCode: response.status, body }
    }

    log('info', 'send_weekly_reports_cron.ok', { durationMs, ...summarizeResult(body) })
    return { statusCode: 200, body }
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const isTimeout = error instanceof Error && error.name === 'TimeoutError'
    log('error', 'send_weekly_reports_cron.fetch_failed', {
      durationMs,
      timedOut: isTimeout,
      message: error instanceof Error ? error.message : 'unknown error',
    })
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: isTimeout ? 'timeout' : 'fetch failed' }),
    }
  }
}
