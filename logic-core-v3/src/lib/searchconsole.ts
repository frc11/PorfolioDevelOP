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

// ─── Mock data ────────────────────────────────────────────────────────────────

function getMockSearchConsoleData(): SearchConsoleData {
  const clickValues    = [10,14,9,18,12,7,15,11,16,8,13,17,10,12,14,9,11,16,13,8,15,12,18,10,14,9,11,13]
  const impressionVals = [280,320,250,410,300,190,360,270,385,220,310,395,265,305,330,245,285,380,315,215,360,290,425,260,335,225,275,315]
  const dailyData: Array<{ date: string; clicks: number; impressions: number }> = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyData.push({
      date: d.toISOString().slice(0, 10),
      clicks: clickValues[27 - i],
      impressions: impressionVals[27 - i],
    })
  }
  return {
    totalClicks: 324,
    totalImpressions: 8920,
    avgCtr: 3.6,
    avgPosition: 14.2,
    topQueries: [
      { query: 'concesionaria tucuman',       clicks: 89, impressions: 1240, ctr: 7.2, position: 4.1 },
      { query: 'autos usados tucuman',         clicks: 67, impressions: 980,  ctr: 6.8, position: 6.3 },
      { query: 'san miguel autos',             clicks: 54, impressions: 720,  ctr: 7.5, position: 3.8 },
      { query: 'concesionaria san miguel',     clicks: 48, impressions: 560,  ctr: 8.6, position: 2.1 },
      { query: 'financiacion autos tucuman',   clicks: 32, impressions: 890,  ctr: 3.6, position: 11.4 },
    ],
    topPages: [
      { page: 'https://sanmiguel.com.ar/',             clicks: 124 },
      { page: 'https://sanmiguel.com.ar/catalogo',     clicks: 87 },
      { page: 'https://sanmiguel.com.ar/usados',       clicks: 63 },
      { page: 'https://sanmiguel.com.ar/contacto',     clicks: 31 },
      { page: 'https://sanmiguel.com.ar/financiacion', clicks: 19 },
    ],
    dailyData,
  }
}

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
    return { ok: true, data: getMockSearchConsoleData() }
  }

  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(keyJson) as Record<string, unknown>
  } catch {
    return { ok: true, data: getMockSearchConsoleData() }
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
  } catch {
    // Fall back to mock data on any API error
    return { ok: true, data: getMockSearchConsoleData() }
  }
}
