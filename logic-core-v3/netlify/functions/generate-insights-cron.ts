// D.3 — dispara /api/cron/generate-insights (mitad-runtime del loop de E1: el
// motor de ChatbotInsight ya existe y produce señal de calidad — D.2 lo probó
// en producción, 4 insights con evidencia sobre 17 conversaciones — solo le
// faltaba correr solo).
// Agendada vía netlify.toml: [functions."generate-insights-cron"] schedule = "0 9 * * *".
// El nombre de este archivo debe matchear ese key exacto (Netlify deriva el
// nombre de la function del filename) — mismo mecanismo que
// cleanup-old-events-cron.ts, del que este archivo es espejo.
//
// Tres diferencias deliberadas contra ese molde:
//   1. POST, no GET — /api/cron/generate-insights solo expone POST.
//   2. Timeout explícito en el fetch (el molde no tiene ninguno). cleanup-old-events
//      es una purga de DB acotada; esto llama al LLM UNA VEZ POR BOT ACTIVO,
//      secuencial (la ruta hace un for..of con await adentro, no Promise.all)
//      — con más de un bot activo la duración crece rápido. Aritmética abajo.
//   3. Log estructurado (type/level/timestamp), no los strings con prefijo del
//      molde — mismo shape que server/logging/logger.ts y persistentLogger.ts,
//      replicado localmente: esta function no importa el logger real porque
//      arrastraría Prisma y el resto del árbol del chatbot a un trigger que
//      tiene que quedar liviano.
//
// TIMEOUT — aritmética. Una Netlify Function sincrona estandar no puede pasar
// de ~26s (limite duro de AWS API Gateway que Netlify hereda), salvo que sea
// una Background Function (sufijo -background.ts, hasta 15 min, requiere plan
// que lo soporte) — ni el molde ni esta usan ese sufijo, asi que ambas
// comparten el mismo techo duro. El plan de Netlify real de este sitio NO es
// confirmable desde el repo (docs/operations/cron-jobs.md deja la misma
// pregunta abierta para otro cron: "Si el plan de Netlify no soporta scheduled
// functions..."). Dado ese techo de ~26s que no se puede superar de todos
// modos, 20s deja margen para que ESTA function devuelva un timeout propio,
// informativo, antes de que la plataforma mate la invocación entera con un
// error menos claro.
const FETCH_TIMEOUT_MS = 20_000

function log(level: 'info' | 'error', type: string, extra: Record<string, unknown> = {}) {
  const record = { type, level, timestamp: new Date().toISOString(), ...extra }
  if (level === 'error') {
    console.error(JSON.stringify(record))
  } else {
    console.log(JSON.stringify(record))
  }
}

export const handler = async () => {
  const siteUrl = process.env.URL
  const cronSecret = process.env.CRON_SECRET

  if (!siteUrl || !cronSecret) {
    log('error', 'generate_insights_cron.missing_env', {
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
    const response = await fetch(`${siteUrl}/api/cron/generate-insights`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cronSecret}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    const body = await response.text()
    const durationMs = Date.now() - startedAt

    if (!response.ok) {
      log('error', 'generate_insights_cron.route_error', { status: response.status, durationMs })
      return { statusCode: response.status, body }
    }

    // Best-effort: la ruta siempre devuelve JSON en el camino ok, pero si
    // esto fallara no debe romper el cron — solo se pierde el detalle de
    // `results` en el log.
    let results: unknown
    try {
      const parsed: unknown = JSON.parse(body)
      results =
        typeof parsed === 'object' && parsed !== null && 'results' in parsed
          ? (parsed as { results: unknown }).results
          : undefined
    } catch {
      // sin detalle de `results` en el log; ver comentario arriba.
    }

    log('info', 'generate_insights_cron.ok', { durationMs, results })
    return { statusCode: 200, body }
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const isTimeout = error instanceof Error && error.name === 'TimeoutError'
    log('error', 'generate_insights_cron.fetch_failed', {
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
