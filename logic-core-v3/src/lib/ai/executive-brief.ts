import { Prisma } from '@prisma/client'
import { generateText } from 'ai'
import { getWeekResults, type WeekResultsData } from '@/lib/dashboard/week-results'
import { getHealthScore, type HealthScoreResult } from '@/lib/health-score'
import { prisma } from '@/lib/prisma'
import { getISOWeekKeyAR } from '@/lib/tz-ar'
import { getLLMProvider } from '@/modules/chatbot/server/llm/factory'

const REGENERATION_LIMIT = 3
const CACHE_TTL_DAYS = 7
const BRIEF_MODEL = 'gemini-2.5-flash'

// B6.4 — Gate intradiario. Sin esto, el usuario podía gastar las 3 regen
// semanales en cascada (refresh / click / click) sin valor real (un negocio no
// cambia en 30 segundos). Esto NO toca el límite semanal ni el cache — solo
// espacia las regen manuales.
const MIN_HOURS_BETWEEN_MANUAL_REGENS = 4

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
      const generation = await generateBriefText(
        organizationId,
        org.companyName ?? 'tu negocio',
      )

      if (!generation || !generation.text.trim()) {
        console.warn(`[Brief] Generated empty text for org ${organizationId}`)
        return null
      }

      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          cachedExecutiveBrief: generation.text,
          cachedExecutiveBriefAt: now,
          executiveBriefRegenerations: 0,
        },
      })

      await persistBriefSnapshot(organizationId, generation, now)

      return {
        text: generation.text,
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

  const now = new Date()
  const cacheAge = getCacheAgeDays(org.cachedExecutiveBriefAt, now)
  const currentRegenerations =
    cacheAge >= CACHE_TTL_DAYS ? 0 : org.executiveBriefRegenerations

  if (currentRegenerations >= REGENERATION_LIMIT) {
    return {
      ok: false,
      error:
        'Llegaste al limite de 3 regeneraciones esta semana. El brief se actualiza automaticamente cada lunes.',
    }
  }

  // B6.4 — Gate intradiario: si la última escritura fue una regen manual
  // (`executiveBriefRegenerations > 0` — el cron resetea a 0 cuando refresca,
  // así que un contador positivo prueba que lo último que escribió el cache
  // fue un click manual), no permitir otra antes de MIN_HOURS_BETWEEN_MANUAL_REGENS.
  if (currentRegenerations > 0 && org.cachedExecutiveBriefAt) {
    const hoursSinceLast =
      (now.getTime() - org.cachedExecutiveBriefAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLast < MIN_HOURS_BETWEEN_MANUAL_REGENS) {
      const minutesLeft = Math.max(
        1,
        Math.ceil((MIN_HOURS_BETWEEN_MANUAL_REGENS - hoursSinceLast) * 60),
      )
      return {
        ok: false,
        error: `Ya regeneraste el brief hace poco. Proba de nuevo en ${formatWaitTime(minutesLeft)}.`,
      }
    }
  }

  try {
    const generation = await generateBriefText(organizationId, org.companyName)

    if (!generation.text.trim()) {
      console.warn(`[Brief] Generated empty text during regeneration for org ${organizationId}`)
      return { ok: false, error: 'No pudimos regenerar el brief. Proba de nuevo en unos minutos.' }
    }

    const nextRegenerations = currentRegenerations + 1

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        cachedExecutiveBrief: generation.text,
        cachedExecutiveBriefAt: now,
        executiveBriefRegenerations: nextRegenerations,
      },
    })

    await persistBriefSnapshot(organizationId, generation, now)

    return {
      ok: true,
      brief: {
        text: generation.text,
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

  const generation = await generateBriefText(organizationId, org.companyName)

  if (!generation.text.trim()) {
    console.warn(`[Brief] Generated empty text during cache refresh for org ${organizationId}`)
    throw new Error(`Generated empty executive brief for organization ${organizationId}`)
  }

  const now = new Date()

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      cachedExecutiveBrief: generation.text,
      cachedExecutiveBriefAt: now,
      executiveBriefRegenerations: 0,
    },
  })

  await persistBriefSnapshot(organizationId, generation, now)

  return {
    text: generation.text,
    generatedAt: now,
    isFresh: true,
    regenerationsLeft: REGENERATION_LIMIT,
    canRegenerate: true,
  }
}

type BriefGeneration = {
  text: string
  healthScore: HealthScoreResult
  weekResults: WeekResultsData
}

async function generateBriefText(
  organizationId: string,
  companyName: string,
): Promise<BriefGeneration> {
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

  const provider = getLLMProvider('google')
  const model = provider.getModel(BRIEF_MODEL)

  const { text } = await generateText({
    model,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxOutputTokens: 200,
  })

  return { text: text.trim(), healthScore, weekResults }
}

// Persiste un snapshot semanal del brief para histórico/comparaciones. Aditivo
// al cache vigente — el cache sigue en Organization.cachedExecutiveBrief*. Upsert
// por (orgId, periodKey): si la misma org regenera N veces en la semana, queda
// el último válido. Solo guarda agregados — sin PII ni leads crudos.
async function persistBriefSnapshot(
  organizationId: string,
  generation: BriefGeneration,
  generatedAt: Date,
): Promise<void> {
  try {
    const periodKey = getISOWeekKeyAR(generatedAt)
    const healthScores = generation.healthScore as unknown as Prisma.InputJsonValue
    const weekResults = generation.weekResults as unknown as Prisma.InputJsonValue

    await prisma.executiveBriefSnapshot.upsert({
      where: {
        organizationId_periodKey: { organizationId, periodKey },
      },
      create: {
        organizationId,
        periodKey,
        content: generation.text,
        healthScores,
        weekResults,
        createdAt: generatedAt,
      },
      update: {
        content: generation.text,
        healthScores,
        weekResults,
        createdAt: generatedAt,
      },
    })
  } catch (err) {
    // El snapshot es aditivo; si falla, no rompemos el flujo del brief.
    console.error('[Brief] persistBriefSnapshot failed:', err)
  }
}

function getCacheAgeDays(date: Date | null, now: Date): number {
  if (!date) return Infinity
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
}

// Rioplatense friendly: "5 minutos", "1 hora", "3 horas y 20 minutos".
function formatWaitTime(minutesLeft: number): string {
  if (minutesLeft < 60) {
    return minutesLeft === 1 ? '1 minuto' : `${minutesLeft} minutos`
  }
  const hours = Math.floor(minutesLeft / 60)
  const mins = minutesLeft % 60
  const hourPart = hours === 1 ? '1 hora' : `${hours} horas`
  if (mins === 0) return hourPart
  const minPart = mins === 1 ? '1 minuto' : `${mins} minutos`
  return `${hourPart} y ${minPart}`
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
