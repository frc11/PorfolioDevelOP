/**
 * P2.B.2 — Integration test de `getTopHotLeadsForWeek` con cantidad configurable.
 * Requiere DB real (Prisma directo, sin servidor HTTP — llama la función server-side
 * en proceso). Mismo criterio que tests/integration/alerts-detector.spec.ts: NO está
 * en el testDir de playwright.config.ts (./tests/e2e) — correr explícito:
 *
 *   npx playwright test tests/integration/executive-report-lead-count.spec.ts
 */
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { getTopHotLeadsForWeek } from '../../src/lib/reports/executive-weekly/top-hot-leads'

const prisma = new PrismaClient()
const TAG = 'P2B2-LEADCOUNT-TEST'

async function getActiveBot() {
  return prisma.botConfig.findFirst({ where: { isActive: true } })
}

test.describe('getTopHotLeadsForWeek — cantidad configurable (P2.B.2)', () => {
  test.afterAll(async () => {
    await prisma.chatbotLead.deleteMany({ where: { message: { contains: TAG } } }).catch(() => undefined)
    await prisma.$disconnect()
  })

  test('devuelve exactamente N leads según el parámetro leadCount (default 3, igual que antes de P2.B.2)', async () => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    const now = new Date()
    const weekStart = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const weekEnd = now

    // 12 leads "hot" con scores descendentes distintos y capturedAt recientes
    // (todos dentro de la semana) — el ranking por score efectivo es
    // determinista, así que los cortes de longitud no dependen de empates.
    const scores = Array.from({ length: 12 }, (_, i) => 99 - i)
    await prisma.chatbotLead.createMany({
      data: scores.map((score, i) => ({
        botConfigId: bot.id,
        name: `Lead ${TAG} ${score}`,
        message: `mensaje de prueba ${TAG}`,
        score,
        classification: 'hot' as const,
        category: 'sales' as const,
        capturedAt: new Date(now.getTime() - i * 60_000),
      })),
    })

    try {
      const top5 = await getTopHotLeadsForWeek(bot.organizationId, weekStart, weekEnd, now, 5)
      expect(top5).toHaveLength(5)

      const top10 = await getTopHotLeadsForWeek(bot.organizationId, weekStart, weekEnd, now, 10)
      expect(top10).toHaveLength(10)

      // Sin leadCount explícito → default 3 (mismo comportamiento que build.ts
      // tenía hardcodeado antes de parametrizarlo en P2.B.2).
      const topDefault = await getTopHotLeadsForWeek(bot.organizationId, weekStart, weekEnd, now)
      expect(topDefault).toHaveLength(3)

      // El top-3 default debe ser el subconjunto de mayor score del top-5.
      expect(topDefault.map((l) => l.name)).toEqual(top5.slice(0, 3).map((l) => l.name))
    } finally {
      await prisma.chatbotLead.deleteMany({ where: { message: { contains: TAG } } })
    }
  })
})
