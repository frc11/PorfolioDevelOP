import { google } from 'googleapis'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchConsoleData {
  totalClicks: number
  totalImpressions: number
  avgCtr: number        // percentage 0-100
  avgPosition: number
  topQueries: Array<{
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  topPages: Array<{ page: string; clicks: number }>
  dailyData: Array<{ date: string; clicks: number; impressions: number }>
}

export type SearchConsoleResult =
  | { ok: true; data: SearchConsoleData }
  | { ok: false; error: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// Search Console API returns dates as "YYYY-MM-DD" already
function parseRows(
  rows: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }> | null | undefined
) {
  return (rows ?? []).map((r) => ({
    keys: r.keys ?? [],
    clicks: Math.round(r.clicks ?? 0),
    impressions: Math.round(r.impressions ?? 0),
    ctr: Math.round((r.ctr ?? 0) * 1000) / 10, // to percentage, 1 decimal
    position: Math.round((r.position ?? 0) * 10) / 10,
  }))
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function getSearchConsoleData(
  siteUrl: string
): Promise<SearchConsoleResult> {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!keyJson) {
    return {
      ok: false,
      error: 'Las credenciales de Google no están configuradas en el servidor. Contactá al equipo de DevelOP.',
    }
  }

  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(keyJson) as Record<string, unknown>
  } catch {
    return { ok: false, error: 'Las credenciales del servidor tienen un formato inválido.' }
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  const searchconsole = google.webmasters({ version: 'v3', auth })

  const startDate = dateNDaysAgo(28)
  const endDate = dateNDaysAgo(0)

  try {
    const [queriesRes, pagesRes, dailyRes] = await Promise.all([
      // Top 10 queries
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 10,
          orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
        },
      }),
      // Top 5 pages by clicks
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: 5,
          orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
        },
      }),
      // Daily totals (no dimension = site-wide summary per day)
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 31,
        },
      }),
    ])

    const queryRows = parseRows(queriesRes.data.rows)
    const pageRows = parseRows(pagesRes.data.rows)
    const dailyRows = parseRows(dailyRes.data.rows)

    // Site-wide totals come from summing daily rows
    const totalClicks = dailyRows.reduce((s, r) => s + r.clicks, 0)
    const totalImpressions = dailyRows.reduce((s, r) => s + r.impressions, 0)
    const avgCtr =
      totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 1000) / 10
        : 0
    // Weighted average position from query rows
    const totalQueryImpressions = queryRows.reduce((s, r) => s + r.impressions, 0)
    const avgPosition =
      totalQueryImpressions > 0
        ? Math.round(
            (queryRows.reduce((s, r) => s + r.position * r.impressions, 0) /
              totalQueryImpressions) *
              10
          ) / 10
        : 0

    return {
      ok: true,
      data: {
        totalClicks,
        totalImpressions,
        avgCtr,
        avgPosition,
        topQueries: queryRows.map((r) => ({
          query: r.keys[0] ?? '',
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
        })),
        topPages: pageRows.map((r) => ({
          page: r.keys[0] ?? '',
          clicks: r.clicks,
        })),
        dailyData: dailyRows.map((r) => ({
          date: r.keys[0] ?? '',
          clicks: r.clicks,
          impressions: r.impressions,
        })),
      },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('forbidden')) {
      return {
        ok: false,
        error:
          'Sin permisos para acceder a este sitio. Verificá que la cuenta de servicio tenga acceso de "Propietario restringido" o superior en Search Console.',
      }
    }
    if (msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('not found')) {
      return {
        ok: false,
        error:
          'El sitio no fue encontrado en Search Console. Verificá que la URL esté correctamente configurada y verificada.',
      }
    }
    if (msg.includes('400') || msg.includes('INVALID')) {
      return {
        ok: false,
        error: 'La URL del sitio tiene un formato inválido. Revisá la configuración en el panel de admin.',
      }
    }

    return {
      ok: false,
      error: 'No se pudieron cargar los datos de SEO en este momento. Intentá de nuevo más tarde.',
    }
  }
}
