/**
 * D4 — Integration test del guard anti-spam del cron de insights.
 * Requiere DB real (Prisma directo, sin servidor HTTP). Mismo criterio que
 * tests/integration/client-monthly-report.spec.ts: NO está en el testDir de
 * playwright.config.ts (./tests/e2e) — correr explícito:
 *
 *   npx playwright test tests/integration/generate-insights-pending-guard.spec.ts
 *
 * Cubre el fix de D4 (generate-insights/route.ts:39): `pendingCount` dejó de
 * ser un hardcode a 0 y ahora sale de `getInsightsCountForBot(bot.id).PENDING`
 * — bot-scoped, real. Se testea la función de conteo (el punto de decisión
 * real, `pendingCount >= 5`, es una comparación trivial de una sola línea que
 * no amerita extraerse aparte) contra Prisma real, no el cron completo
 * (requiere CRON_SECRET + server levantado — fuera de alcance de este test).
 */
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { getInsightsCountForBot } from '../../src/modules/chatbot/server/insights/queries'

const prisma = new PrismaClient()
const TAG = 'D4-PENDINGGUARD-TEST'
const PENDING_OVERLOAD_THRESHOLD = 5

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
    const bot = await prisma.botConfig.findFirst()
    if (!bot) {
      test.skip(true, 'Sin bots en BD — omitido')
      return
    }

    const before = await getInsightsCountForBot(bot.id)
    const baseline = before.PENDING ?? 0

    try {
      await createPendingInsights(bot.id, PENDING_OVERLOAD_THRESHOLD)
      const after = await getInsightsCountForBot(bot.id)
      const pendingCount = after.PENDING ?? 0

      expect(pendingCount).toBeGreaterThanOrEqual(baseline + PENDING_OVERLOAD_THRESHOLD)
      expect(pendingCount >= PENDING_OVERLOAD_THRESHOLD).toBe(true)
    } finally {
      await prisma.chatbotInsight.deleteMany({ where: { botConfigId: bot.id, title: { contains: TAG } } })
    }
  })

  test('bot con < 5 PENDING → pendingCount no cruza el umbral (el guard procede)', async () => {
    const bot = await prisma.botConfig.findFirst()
    if (!bot) {
      test.skip(true, 'Sin bots en BD — omitido')
      return
    }

    const before = await getInsightsCountForBot(bot.id)
    const baseline = before.PENDING ?? 0
    if (baseline >= PENDING_OVERLOAD_THRESHOLD) {
      test.skip(true, `Bot ya tiene ${baseline} PENDING reales — no se puede aislar el caso "< 5" sin tocar datos reales`)
      return
    }

    try {
      // Crea solo lo necesario para quedar justo por debajo del umbral.
      await createPendingInsights(bot.id, PENDING_OVERLOAD_THRESHOLD - 1 - baseline)
      const after = await getInsightsCountForBot(bot.id)
      const pendingCount = after.PENDING ?? 0

      expect(pendingCount).toBeLessThan(PENDING_OVERLOAD_THRESHOLD)
      expect(pendingCount >= PENDING_OVERLOAD_THRESHOLD).toBe(false)
    } finally {
      await prisma.chatbotInsight.deleteMany({ where: { botConfigId: bot.id, title: { contains: TAG } } })
    }
  })

  test('aislamiento: el PENDING count de un bot no incluye el de otro bot', async () => {
    const bots = await prisma.botConfig.findMany({ take: 2, orderBy: { createdAt: 'asc' } })
    if (bots.length < 2) {
      test.skip(true, 'Se necesitan 2 bots en BD para probar aislamiento — omitido')
      return
    }
    const [botA, botB] = bots

    const beforeA = await getInsightsCountForBot(botA.id)
    const beforeB = await getInsightsCountForBot(botB.id)

    try {
      await createPendingInsights(botA.id, PENDING_OVERLOAD_THRESHOLD)
      const afterA = await getInsightsCountForBot(botA.id)
      const afterB = await getInsightsCountForBot(botB.id)

      expect(afterA.PENDING ?? 0).toBeGreaterThanOrEqual((beforeA.PENDING ?? 0) + PENDING_OVERLOAD_THRESHOLD)
      // El count de B no se mueve por las inserciones en A — cero fuga cross-bot.
      expect(afterB.PENDING ?? 0).toBe(beforeB.PENDING ?? 0)
    } finally {
      await prisma.chatbotInsight.deleteMany({ where: { botConfigId: botA.id, title: { contains: TAG } } })
    }
  })
})
