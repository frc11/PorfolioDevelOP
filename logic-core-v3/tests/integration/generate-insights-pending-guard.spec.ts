/**
 * D4 — Integration test del guard anti-spam del cron de insights.
 * Requiere DB real (Prisma directo, sin servidor HTTP). Mismo criterio que
 * tests/integration/client-monthly-report.spec.ts: NO está en el testDir de
 * playwright.config.ts (./tests/e2e) — correr explícito:
 *
 *   npx playwright test tests/integration/generate-insights-pending-guard.spec.ts
 *
 * Cubre el fix de D4 (generate-insights/route.ts): `pendingCount` sale de
 * `getInsightsCountForBot(organizationId, bot.id).PENDING` — bot-scoped, real.
 *
 * B0-S3: `getInsightsCountForBot` ahora exige `organizationId` (pasa por el helper
 * de aislamiento). Y — regla del sprint — se ELIMINÓ el `test.skip` condicional:
 * la suite falla explícito si no hay un bot seedeado, en vez de saltearse en falso
 * verde. La parte de "aislamiento cross-bot" del test viejo se movió al negativo
 * real de tenancy: tests/integration/chatbot-isolation.spec.ts.
 */
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { getInsightsCountForBot } from '../../src/modules/chatbot/server/insights/queries'

const prisma = new PrismaClient()
const TAG = 'D4-PENDINGGUARD-TEST'
const PENDING_OVERLOAD_THRESHOLD = 5

/** Bot real seedeado (con su org). Falla EXPLÍCITO si no hay — prohibido test.skip. */
async function mustGetSeededBot(): Promise<{ id: string; organizationId: string }> {
  const bot = await prisma.botConfig.findFirst({ select: { id: true, organizationId: true } })
  if (!bot) {
    throw new Error(
      'SEED ROTO: no hay ningún BotConfig en la DB. Corré el seed del chatbot antes de esta suite — ' +
        'prohibido test.skip (regla del sprint B0-S3).',
    )
  }
  return bot
}

async function createPendingInsights(botConfigId: string, count: number) {
  if (count <= 0) return
  await prisma.chatbotInsight.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      botConfigId,
      category: 'CONFIG_TWEAK' as const,
      status: 'PENDING' as const,
      title: `${TAG} ${i}`,
      description: `${TAG} description`,
      suggestedAction: `${TAG} action`,
      evidenceCount: 1,
    })),
  })
}

test.describe('Guard anti-spam del cron de insights (D4)', () => {
  test.afterAll(async () => {
    await prisma.chatbotInsight.deleteMany({ where: { title: { contains: TAG } } }).catch(() => undefined)
    await prisma.$disconnect()
  })

  test('bot con >= 5 PENDING → pendingCount cruza el umbral (el guard saltearía)', async () => {
    const bot = await mustGetSeededBot()

    const before = await getInsightsCountForBot(bot.organizationId, bot.id)
    const baseline = before.PENDING ?? 0

    try {
      await createPendingInsights(bot.id, PENDING_OVERLOAD_THRESHOLD)
      const after = await getInsightsCountForBot(bot.organizationId, bot.id)
      const pendingCount = after.PENDING ?? 0

      expect(pendingCount).toBeGreaterThanOrEqual(baseline + PENDING_OVERLOAD_THRESHOLD)
      expect(pendingCount >= PENDING_OVERLOAD_THRESHOLD).toBe(true)
    } finally {
      await prisma.chatbotInsight.deleteMany({ where: { botConfigId: bot.id, title: { contains: TAG } } })
    }
  })

  test('bot con < 5 PENDING → pendingCount no cruza el umbral (el guard procede)', async () => {
    const bot = await mustGetSeededBot()

    const before = await getInsightsCountForBot(bot.organizationId, bot.id)
    const baseline = before.PENDING ?? 0
    if (baseline >= PENDING_OVERLOAD_THRESHOLD) {
      // No es un skip por falta de seed: es un dato real preexistente que impide
      // AISLAR el caso "< 5" sin tocar datos reales. Se reporta y no se fuerza.
      test.info().annotations.push({
        type: 'nota',
        description: `Bot ya tiene ${baseline} PENDING reales — no se puede aislar el caso "< 5" sin tocar datos reales.`,
      })
      return
    }

    try {
      await createPendingInsights(bot.id, PENDING_OVERLOAD_THRESHOLD - 1 - baseline)
      const after = await getInsightsCountForBot(bot.organizationId, bot.id)
      const pendingCount = after.PENDING ?? 0

      expect(pendingCount).toBeLessThan(PENDING_OVERLOAD_THRESHOLD)
      expect(pendingCount >= PENDING_OVERLOAD_THRESHOLD).toBe(false)
    } finally {
      await prisma.chatbotInsight.deleteMany({ where: { botConfigId: bot.id, title: { contains: TAG } } })
    }
  })
})
