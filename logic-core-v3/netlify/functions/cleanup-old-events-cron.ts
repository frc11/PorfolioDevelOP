// CRON-2 — dispara la ruta /api/cron/cleanup-old-events (T0.2) por HTTP.
// Agendada vía netlify.toml: [functions."cleanup-old-events-cron"] schedule = "0 6 * * *".
// El nombre de este archivo debe matchear ese key exacto (Netlify deriva el
// nombre de la function del filename).

export const handler = async () => {
  const siteUrl = process.env.URL
  const cronSecret = process.env.CRON_SECRET

  if (!siteUrl || !cronSecret) {
    console.error(
      '[cleanup-old-events-cron] Falta URL o CRON_SECRET en el entorno de la function — no se invoca la ruta.',
    )
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Missing URL or CRON_SECRET environment variable' }),
    }
  }

  try {
    const response = await fetch(`${siteUrl}/api/cron/cleanup-old-events`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    })
    const body = await response.text()

    if (!response.ok) {
      console.error(`[cleanup-old-events-cron] La ruta respondió ${response.status}: ${body}`)
      return { statusCode: response.status, body }
    }

    console.log(`[cleanup-old-events-cron] OK: ${body}`)
    return { statusCode: 200, body }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(`[cleanup-old-events-cron] Fetch a /api/cron/cleanup-old-events falló: ${message}`)
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: message }),
    }
  }
}
