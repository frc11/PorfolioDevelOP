import Anthropic from '@anthropic-ai/sdk'
import { getWeekResults } from '@/lib/dashboard/week-results'
import { getHealthScore } from '@/lib/health-score'
import { prisma } from '@/lib/prisma'

const REGENERATION_LIMIT = 3
const CACHE_TTL_DAYS = 7
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

let anthropicClient: Anthropic | null = null

export type ExecutiveBriefResult = {
  text: string
  generatedAt: Date
  isFresh: boolean
  regenerationsLeft: number
  canRegenerate: boolean
}

export async function getExecutiveBrief(
  organizationId: string,
): Promise<ExecutiveBriefResult | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        companyName: true,
        cachedExecutiveBrief: true,
        cachedExecutiveBriefAt: true,
        executiveBriefRegenerations: true,
      },
    })

    if (!org) {
      console.warn(`[Brief] Organization ${organizationId} not found`)
      return null
    }

    const now = new Date()
    const cacheAge = getCacheAgeDays(org.cachedExecutiveBriefAt, now)
    const regenerationCount =
      cacheAge >= CACHE_TTL_DAYS ? 0 : org.executiveBriefRegenerations

    if (org.cachedExecutiveBrief && org.cachedExecutiveBriefAt && cacheAge < CACHE_TTL_DAYS) {
      if (!org.cachedExecutiveBrief.trim()) return null

      return {
        text: org.cachedExecutiveBrief,
        generatedAt: org.cachedExecutiveBriefAt,
        isFresh: false,
        regenerationsLeft: getRegenerationsLeft(regenerationCount),
        canRegenerate: regenerationCount < REGENERATION_LIMIT,
      }
    }

    try {
      const text = await generateBriefText(organizationId, org.companyName ?? 'tu negocio')

      if (!text || !text.trim()) {
        console.warn(`[Brief] Generated empty text for org ${organizationId}`)
        return null
      }

      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          cachedExecutiveBrief: text,
          cachedExecutiveBriefAt: now,
          executiveBriefRegenerations: 0,
        },
      })

      return {
        text,
        generatedAt: now,
        isFresh: true,
        regenerationsLeft: REGENERATION_LIMIT,
        canRegenerate: true,
      }
    } catch (err) {
      console.error('[Brief] Generation failed:', err)
      return null
    }
  } catch (err) {
    console.error('[Brief] getExecutiveBrief failed:', err)
    return null
  }
}

export async function regenerateExecutiveBrief(
  organizationId: string,
): Promise<{ ok: true; brief: ExecutiveBriefResult } | { ok: false; error: string }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      companyName: true,
      cachedExecutiveBriefAt: true,
      executiveBriefRegenerations: true,
    },
  })

  if (!org) return { ok: false, error: 'Organizacion no encontrada' }

  const cacheAge = getCacheAgeDays(org.cachedExecutiveBriefAt, new Date())
  const currentRegenerations =
    cacheAge >= CACHE_TTL_DAYS ? 0 : org.executiveBriefRegenerations

  if (currentRegenerations >= REGENERATION_LIMIT) {
    return {
      ok: false,
      error:
        'Llegaste al limite de 3 regeneraciones esta semana. El brief se actualiza automaticamente cada lunes.',
    }
  }

  try {
    const text = await generateBriefText(organizationId, org.companyName)

    if (!text.trim()) {
      console.warn(`[Brief] Generated empty text during regeneration for org ${organizationId}`)
      return { ok: false, error: 'No pudimos regenerar el brief. Proba de nuevo en unos minutos.' }
    }

    const now = new Date()
    const nextRegenerations = currentRegenerations + 1

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        cachedExecutiveBrief: text,
        cachedExecutiveBriefAt: now,
        executiveBriefRegenerations: nextRegenerations,
      },
    })

    return {
      ok: true,
      brief: {
        text,
        generatedAt: now,
        isFresh: true,
        regenerationsLeft: getRegenerationsLeft(nextRegenerations),
        canRegenerate: nextRegenerations < REGENERATION_LIMIT,
      },
    }
  } catch (error) {
    console.error('[executive-brief] manual regeneration failed:', error)
    return { ok: false, error: 'No pudimos regenerar el brief. Proba de nuevo en unos minutos.' }
  }
}

export async function refreshExecutiveBriefCache(
  organizationId: string,
): Promise<ExecutiveBriefResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      companyName: true,
    },
  })

  if (!org) throw new Error(`Organization ${organizationId} not found`)

  const text = await generateBriefText(organizationId, org.companyName)

  if (!text.trim()) {
    console.warn(`[Brief] Generated empty text during cache refresh for org ${organizationId}`)
    throw new Error(`Generated empty executive brief for organization ${organizationId}`)
  }

  const now = new Date()

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      cachedExecutiveBrief: text,
      cachedExecutiveBriefAt: now,
      executiveBriefRegenerations: 0,
    },
  })

  return {
    text,
    generatedAt: now,
    isFresh: true,
    regenerationsLeft: REGENERATION_LIMIT,
    canRegenerate: true,
  }
}

async function generateBriefText(organizationId: string, companyName: string): Promise<string> {
  const [healthScore, weekResults] = await Promise.all([
    getHealthScore(organizationId),
    getWeekResults(organizationId),
  ])

  const systemPrompt = `Sos el asistente ejecutivo de develOP, una agencia argentina de tecnologia y automatizaciones.
Tu trabajo es escribir un resumen ejecutivo SEMANAL del negocio digital del cliente, en espanol rioplatense, dirigido al dueno del negocio, no a un tecnico.

REGLAS:
- Maximo 3 oraciones, total 280 caracteres aprox.
- Lenguaje claro, sin jerga tecnica.
- Si hay buenas noticias, abrirlas con energia.
- Si hay puntos criticos, mencionarlos sin alarmar.
- Cerrar con una recomendacion accionable o un dato esperanzador.
- NO usar emojis. NO usar exclamaciones salvo que sea muy positivo.
- Tono directo, premium, como un consultor que conoce al cliente.`

  const userPrompt = `Cliente: ${companyName}

Datos de esta semana:
- Health Score: ${healthScore.total}/100 (tendencia: ${formatTrendValue(healthScore.trend.value)} vs semana anterior)
- Salud Digital: ${healthScore.dimensions[0].score}/100
- Salud Comercial: ${healthScore.dimensions[1].score}/100
- Salud Operativa: ${healthScore.dimensions[2].score}/100

Resultados:
- Leads esta semana: ${weekResults.leads.value} ${formatTrendPercent(weekResults.leads.trend)}
- Mensajes respondidos: ${weekResults.messagesAnswered.value}
- Tareas completadas: ${weekResults.tasksCompleted.value}

Genera el resumen ejecutivo de la semana.`

  const response = await getAnthropicClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 200,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Anthropic response')
  }

  return textBlock.text.trim()
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  anthropicClient ??= new Anthropic({ apiKey })
  return anthropicClient
}

function getCacheAgeDays(date: Date | null, now: Date): number {
  if (!date) return Infinity
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
}

function getRegenerationsLeft(regenerations: number): number {
  return Math.max(0, REGENERATION_LIMIT - regenerations)
}

function formatTrendValue(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

function formatTrendPercent(value: number | null): string {
  if (value === null) return ''
  return `(${value > 0 ? '+' : ''}${value}%)`
}
