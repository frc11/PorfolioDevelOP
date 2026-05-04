import Anthropic from '@anthropic-ai/sdk'
import { unstable_cache } from 'next/cache'

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

let anthropicClient: Anthropic | null = null

export type ResultInsight = {
  title: string
  description: string
  type: 'positive' | 'neutral' | 'attention'
}

interface TrafficInsightsInput {
  organizationId: string
  totalVisits: number
  visitsLastWeek: number
  visitsThisWeek: number
  topPages: Array<{ path: string; visits: number; percentage: number }>
  topSources: Array<{ source: string; visits: number }>
  bounceRate: number | null
  avgSessionDuration: number | null
}

interface SeoInsightsInput {
  organizationId: string
  totalImpressions: number
  totalClicks: number
  averagePosition: number
  topQueries: Array<{ query: string; impressions: number; clicks: number; position: number }>
  topPages: Array<{ url: string; impressions: number; clicks: number }>
}

export async function getTrafficInsights(input: TrafficInsightsInput): Promise<ResultInsight[]> {
  if (!hasAnthropicApiKey()) return []

  return unstable_cache(
    async () => generateTrafficInsights(input),
    ['traffic-insights', input.organizationId],
    { revalidate: 24 * 3600, tags: [`insights:${input.organizationId}`] },
  )()
}

export async function getSeoInsights(input: SeoInsightsInput): Promise<ResultInsight[]> {
  if (!hasAnthropicApiKey()) return []

  return unstable_cache(
    async () => generateSeoInsights(input),
    ['seo-insights', input.organizationId],
    { revalidate: 24 * 3600, tags: [`insights:${input.organizationId}`] },
  )()
}

async function generateTrafficInsights(input: TrafficInsightsInput): Promise<ResultInsight[]> {
  if (input.totalVisits < 10) return []

  const systemPrompt = `Sos un analista digital que genera insights cortos y accionables para dueños de negocios argentinos.

REGLAS:
- En español rioplatense (vos, tenés, tu sitio).
- Máximo 3 insights por respuesta.
- Cada insight: título de 4-6 palabras + descripción de 1-2 oraciones.
- Tono: directo, sin jerga técnica, orientado a negocio.
- type: "positive" si es buen resultado, "neutral" si es informativo, "attention" si requiere acción.
- NO inventar datos. Solo trabajar con los que se te pasan.
- Devolver SOLO un JSON array válido, sin texto adicional.

Formato:
[
  { "title": "...", "description": "...", "type": "positive" | "neutral" | "attention" }
]`

  const userPrompt = `Datos de tráfico de la última semana:
- Total de visitas: ${input.totalVisits}
- Visitas semana actual vs anterior: ${input.visitsThisWeek} vs ${input.visitsLastWeek}
- Bounce rate: ${input.bounceRate !== null ? input.bounceRate.toFixed(1) + '%' : 'N/A'}
- Duración promedio sesión: ${
    input.avgSessionDuration !== null ? Math.round(input.avgSessionDuration) + 's' : 'N/A'
  }

Top páginas:
${input.topPages.slice(0, 5).map((p) => `- ${p.path}: ${p.visits} visitas (${p.percentage.toFixed(1)}%)`).join('\n')}

Top fuentes de tráfico:
${input.topSources.slice(0, 5).map((s) => `- ${s.source}: ${s.visits} visitas`).join('\n')}

Generá hasta 3 insights.`

  try {
    const startedAt = Date.now()
    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })
    console.log(`[Traffic Insights] Generated in ${Date.now() - startedAt}ms`)

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') return []

    return parseInsights(textBlock.text)
  } catch (err) {
    console.error('[Traffic Insights] Generation failed:', err)
    return []
  }
}

async function generateSeoInsights(input: SeoInsightsInput): Promise<ResultInsight[]> {
  if (input.totalImpressions < 50) return []

  const systemPrompt = `Sos un especialista SEO que genera insights cortos y accionables para dueños de negocios argentinos.

REGLAS:
- En español rioplatense.
- Máximo 3 insights.
- Título corto (4-6 palabras) + descripción 1-2 oraciones.
- Detectar oportunidades: keywords cerca del top 10, queries con muchas impresiones pero pocos clicks (CTR bajo), páginas con buena posición pero falta optimización.
- type: "positive" / "neutral" / "attention".
- Devolver SOLO un JSON array válido.

Formato:
[
  { "title": "...", "description": "...", "type": "..." }
]`

  const userPrompt = `Datos SEO de los últimos 28 días:
- Impresiones totales: ${input.totalImpressions}
- Clicks totales: ${input.totalClicks}
- Posición promedio: ${input.averagePosition.toFixed(1)}

Top queries:
${input.topQueries.slice(0, 8).map((q) =>
  `- "${q.query}": ${q.impressions} imp, ${q.clicks} clicks, posición ${q.position.toFixed(1)}`
).join('\n')}

Top páginas:
${input.topPages.slice(0, 5).map((p) =>
  `- ${p.url}: ${p.impressions} imp, ${p.clicks} clicks`
).join('\n')}

Generá hasta 3 insights.`

  try {
    const startedAt = Date.now()
    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })
    console.log(`[SEO Insights] Generated in ${Date.now() - startedAt}ms`)

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') return []

    return parseInsights(textBlock.text)
  } catch (err) {
    console.error('[SEO Insights] Generation failed:', err)
    return []
  }
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  anthropicClient ??= new Anthropic({ apiKey })
  return anthropicClient
}

function hasAnthropicApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim())
}

function parseInsights(text: string): ResultInsight[] {
  const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, '')
  const parsed: unknown = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) return []

  return parsed.filter(isResultInsight).slice(0, 3)
}

function isResultInsight(value: unknown): value is ResultInsight {
  if (!isRecord(value)) return false
  return (
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isInsightType(value.type)
  )
}

function isInsightType(value: unknown): value is ResultInsight['type'] {
  return value === 'positive' || value === 'neutral' || value === 'attention'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
