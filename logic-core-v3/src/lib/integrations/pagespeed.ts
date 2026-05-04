import { unstable_cache } from 'next/cache'

export type CoreWebVital = {
  metric: 'LCP' | 'FID' | 'CLS' | 'INP' | 'FCP' | 'TTI'
  value: number
  unit: 'ms' | 'score' | ''
  rating: 'good' | 'needs-improvement' | 'poor'
}

export type PageSpeedOpportunity = {
  id: string
  title: string
  description: string
  estimatedSavingsMs?: number
}

export type PageSpeedReport = {
  url: string
  strategy: 'mobile' | 'desktop'
  performanceScore: number  // 0-100
  fetchedAt: Date
  coreWebVitals: CoreWebVital[]
  topOpportunities: PageSpeedOpportunity[]
}

export async function getPageSpeedReport(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile',
): Promise<PageSpeedReport | null> {
  return unstable_cache(
    async () => fetchPageSpeed(url, strategy),
    ['pagespeed', url, strategy],
    { revalidate: 6 * 3600, tags: [`pagespeed:${url}`] },
  )()
}

async function fetchPageSpeed(
  url: string,
  strategy: 'mobile' | 'desktop',
): Promise<PageSpeedReport | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
  if (!apiKey) {
    console.warn('[PageSpeed] No API key configured')
    return null
  }

  if (!url || !url.startsWith('http')) {
    console.warn('[PageSpeed] Invalid URL:', url)
    return null
  }

  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  apiUrl.searchParams.set('url', url)
  apiUrl.searchParams.set('key', apiKey)
  apiUrl.searchParams.set('strategy', strategy)
  apiUrl.searchParams.append('category', 'PERFORMANCE')

  try {
    const res = await fetch(apiUrl.toString(), {
      next: { revalidate: 6 * 3600 },
    })

    if (!res.ok) {
      console.error('[PageSpeed] API error:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    return parsePageSpeedResponse(data, url, strategy)
  } catch (err) {
    console.error('[PageSpeed] Fetch failed:', err)
    return null
  }
}

function parsePageSpeedResponse(
  data: any,
  url: string,
  strategy: 'mobile' | 'desktop',
): PageSpeedReport {
  const lh = data.lighthouseResult
  const audits = lh.audits

  const performanceScore = Math.round((lh.categories.performance.score ?? 0) * 100)

  const coreWebVitals: CoreWebVital[] = []

  if (audits['largest-contentful-paint']) {
    const lcp = audits['largest-contentful-paint']
    coreWebVitals.push({
      metric: 'LCP',
      value: Math.round(lcp.numericValue),
      unit: 'ms',
      rating: lcp.score >= 0.9 ? 'good' : lcp.score >= 0.5 ? 'needs-improvement' : 'poor',
    })
  }

  if (audits['cumulative-layout-shift']) {
    const cls = audits['cumulative-layout-shift']
    coreWebVitals.push({
      metric: 'CLS',
      value: Number(cls.numericValue.toFixed(3)),
      unit: 'score',
      rating: cls.score >= 0.9 ? 'good' : cls.score >= 0.5 ? 'needs-improvement' : 'poor',
    })
  }

  if (audits['interaction-to-next-paint']) {
    const inp = audits['interaction-to-next-paint']
    coreWebVitals.push({
      metric: 'INP',
      value: Math.round(inp.numericValue ?? 0),
      unit: 'ms',
      rating: inp.score >= 0.9 ? 'good' : inp.score >= 0.5 ? 'needs-improvement' : 'poor',
    })
  }

  if (audits['first-contentful-paint']) {
    const fcp = audits['first-contentful-paint']
    coreWebVitals.push({
      metric: 'FCP',
      value: Math.round(fcp.numericValue),
      unit: 'ms',
      rating: fcp.score >= 0.9 ? 'good' : fcp.score >= 0.5 ? 'needs-improvement' : 'poor',
    })
  }

  const opportunities = Object.entries(audits)
    .filter(([_, audit]: [string, any]) =>
      audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 0.9,
    )
    .map(([id, audit]: [string, any]) => ({
      id,
      title: audit.title as string,
      description: audit.description as string,
      estimatedSavingsMs: audit.details?.overallSavingsMs as number | undefined,
    }))
    .sort((a, b) => (b.estimatedSavingsMs ?? 0) - (a.estimatedSavingsMs ?? 0))
    .slice(0, 3)

  return {
    url,
    strategy,
    performanceScore,
    fetchedAt: new Date(),
    coreWebVitals,
    topOpportunities: opportunities,
  }
}
