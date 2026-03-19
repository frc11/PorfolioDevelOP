import { BetaAnalyticsDataClient } from '@google-analytics/data'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  sessions: number
  activeUsers: number
  bounceRate: number          // percentage 0-100
  avgSessionDurationSec: number
  topPages: Array<{ page: string; sessions: number }>
  dailySessions: Array<{ date: string; sessions: number }> // date: "YYYY-MM-DD"
}

export type AnalyticsResult =
  | { ok: true; data: AnalyticsData }
  | { ok: false; error: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizePropertyId(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith('properties/')) return trimmed
  // Numeric-only → wrap
  if (/^\d+$/.test(trimmed)) return `properties/${trimmed}`
  // G- or GA- measurement IDs are not property IDs
  if (/^G-|^GA-/i.test(trimmed)) {
    throw new Error(
      'El Property ID debe ser el ID numérico de tu propiedad GA4, no el Measurement ID (G-XXXXXXX). Encontralo en Configuración → Información de la propiedad en Google Analytics.'
    )
  }
  return `properties/${trimmed}`
}

function rowValue(
  row: { dimensionValues?: Array<{ value?: string | null }> | null; metricValues?: Array<{ value?: string | null }> | null },
  type: 'dimension' | 'metric',
  index: number
): string {
  const arr = type === 'dimension' ? row.dimensionValues : row.metricValues
  return arr?.[index]?.value ?? '0'
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function getAnalyticsData(
  propertyId: string
): Promise<AnalyticsResult> {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!keyJson) {
    return {
      ok: false,
      error: 'Las credenciales de Analytics no están configuradas en el servidor. Contactá al equipo de DevelOP.',
    }
  }

  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(keyJson) as Record<string, unknown>
  } catch {
    return { ok: false, error: 'Las credenciales de Analytics tienen un formato inválido.' }
  }

  let property: string
  try {
    property = normalizePropertyId(propertyId)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Property ID inválido.' }
  }

  const analyticsClient = new BetaAnalyticsDataClient({ credentials })

  try {
    // Run both reports in parallel
    const [summaryResponse, pagesResponse, dailyResponse] = await Promise.all([
      // Summary metrics
      analyticsClient.runReport({
        property,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      // Top pages
      analyticsClient.runReport({
        property,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5,
      }),
      // Sessions by day
      analyticsClient.runReport({
        property,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
    ])

    // Parse summary
    const summaryRow = summaryResponse[0]?.rows?.[0]
    const sessions = summaryRow ? parseFloat(rowValue(summaryRow, 'metric', 0)) : 0
    const activeUsers = summaryRow ? parseFloat(rowValue(summaryRow, 'metric', 1)) : 0
    const bounceRate = summaryRow ? parseFloat(rowValue(summaryRow, 'metric', 2)) * 100 : 0
    const avgSessionDurationSec = summaryRow
      ? parseFloat(rowValue(summaryRow, 'metric', 3))
      : 0

    // Parse top pages
    const topPages = (pagesResponse[0]?.rows ?? []).map((row) => ({
      page: rowValue(row, 'dimension', 0),
      sessions: Math.round(parseFloat(rowValue(row, 'metric', 0))),
    }))

    // Parse daily sessions — date from GA is "YYYYMMDD", convert to "YYYY-MM-DD"
    const dailySessions = (dailyResponse[0]?.rows ?? []).map((row) => {
      const raw = rowValue(row, 'dimension', 0) // "20260101"
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
      return {
        date,
        sessions: Math.round(parseFloat(rowValue(row, 'metric', 0))),
      }
    })

    return {
      ok: true,
      data: {
        sessions: Math.round(sessions),
        activeUsers: Math.round(activeUsers),
        bounceRate: Math.round(bounceRate * 10) / 10,
        avgSessionDurationSec: Math.round(avgSessionDurationSec),
        topPages,
        dailySessions,
      },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    // Surface friendly messages for common API errors
    if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
      return {
        ok: false,
        error:
          'Sin permisos para acceder a esta propiedad. Verificá que la cuenta de servicio tenga el rol "Viewer" en Google Analytics.',
      }
    }
    if (msg.includes('INVALID_ARGUMENT') || msg.includes('400')) {
      return {
        ok: false,
        error: 'El Property ID configurado no es válido. Revisá la configuración en el panel de admin.',
      }
    }
    if (msg.includes('NOT_FOUND') || msg.includes('404')) {
      return {
        ok: false,
        error: 'No se encontró la propiedad de Analytics. Verificá que el Property ID sea correcto.',
      }
    }

    return {
      ok: false,
      error: 'No se pudieron cargar las métricas en este momento. Intentá de nuevo más tarde.',
    }
  }
}
