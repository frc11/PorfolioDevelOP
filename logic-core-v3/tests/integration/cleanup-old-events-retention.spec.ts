/**
 * T0.2 — Retención real del cron `cleanup-old-events` (tests (b) y (c) del ticket).
 *
 * Llama `cleanupOldEvents` EN PROCESO (sin HTTP, sin servidor — mismo perfil que
 * el resto de `tests/integration/`, ver playwright.integration.config.ts). El
 * chequeo de auth de la ruta (test (a): "sin CRON_SECRET válido → rechaza") vive
 * aparte, como invariant puro sin DB:
 *   src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts
 *
 * Org/bot dedicados con slug fijo (upsert — reruns no chocan); todos los
 * ChatbotEvent de este spec se etiquetan con TAG en `message` para que la
 * limpieza en `finally` sea inequívoca aunque algo falle a mitad de camino.
 */
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { cleanupOldEvents } from '../../src/modules/chatbot/server/logging'

const prisma = new PrismaClient()

const ORG_SLUG = 't02-cleanup-retention-test'
const BOT_SLUG = 't02-cleanup-retention-bot'
const TAG = 'T02-RETENTION-TEST'
const RETENTION_DAYS = 30 // debe matchear RETENTION_DAYS en el route.ts del cron

const daysAgo = (n: number): Date => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

async function seedBot(): Promise<string> {
  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: {},
    create: { slug: ORG_SLUG, companyName: 'T0.2 Cleanup Retention Test' },
    select: { id: true },
  })
  const bot = await prisma.botConfig.upsert({
    where: { organizationId: org.id },
    update: { slug: BOT_SLUG },
    create: {
      organizationId: org.id,
      slug: BOT_SLUG,
      botName: 'T0.2 Retention Bot',
      welcomeMessage: 'test',
    },
    select: { id: true },
  })
  return bot.id
}

async function cleanupFixture(botConfigId: string): Promise<void> {
  await prisma.chatbotEvent.deleteMany({ where: { botConfigId, message: TAG } })
}

test.describe('cleanup-old-events cron — retención (T0.2)', () => {
  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  test('borra eventos más viejos que la retención; preserva los que la ventana de métricas todavía necesita', async () => {
    const botConfigId = await seedBot()
    await cleanupFixture(botConfigId)

    // Filas con antigüedad controlada. Los dos "survives" cerca del límite real
    // de retención (14 días, buildWeeklyReport.prevWeekStart) prueban (c); los
    // dos "deleted" cerca de RETENTION_DAYS prueban (b). `lt` es estricto: un
    // createdAt exactamente en el threshold sobrevive — evitamos ese filo exacto
        // acá (flaky por timing) y probamos 1 día a cada lado, que es inequívoco.
    const rows: Array<{ label: string; createdAt: Date; expectDeleted: boolean }> = [
      { label: 'muy vieja (40d)', createdAt: daysAgo(40), expectDeleted: true },
      { label: 'justo fuera de la retención (31d)', createdAt: daysAgo(31), expectDeleted: true },
      { label: 'justo dentro de la retención (29d)', createdAt: daysAgo(29), expectDeleted: false },
      {
        label: 'límite real de buildWeeklyReport.prevWeekStart (14d) — la ventana de métricas más larga sobre chatbotEvent',
        createdAt: daysAgo(14),
        expectDeleted: false,
      },
      { label: 'reciente (2d)', createdAt: daysAgo(2), expectDeleted: false },
    ]

    try {
      const created = await Promise.all(
        rows.map((row) =>
          prisma.chatbotEvent.create({
            data: {
              botConfigId,
              type: 'test.retention_probe',
              level: 'INFO',
              message: TAG,
              metadata: { label: row.label },
              createdAt: row.createdAt,
            },
          }),
        ),
      )

      const deletedCount = await cleanupOldEvents(RETENTION_DAYS)
      expect(deletedCount).toBeGreaterThanOrEqual(2) // al menos las 2 filas "muy vieja"/"justo fuera"

      const survivors = await prisma.chatbotEvent.findMany({
        where: { id: { in: created.map((c) => c.id) } },
        select: { id: true },
      })
      const survivorIds = new Set(survivors.map((s) => s.id))

      for (let i = 0; i < rows.length; i++) {
        const stillExists = survivorIds.has(created[i].id)
        expect(
          stillExists,
          `"${rows[i].label}": esperaba ${rows[i].expectDeleted ? 'BORRADA' : 'PRESERVADA'}, quedó ${stillExists ? 'PRESERVADA' : 'BORRADA'}`,
        ).toBe(!rows[i].expectDeleted)
      }
    } finally {
      await cleanupFixture(botConfigId)
    }
  })

  test('camino corto: sin eventos viejos, cleanupOldEvents no toca nada de este bot', async () => {
    const botConfigId = await seedBot()
    await cleanupFixture(botConfigId)

    try {
      const recent = await prisma.chatbotEvent.create({
        data: {
          botConfigId,
          type: 'test.retention_probe',
          level: 'INFO',
          message: TAG,
          metadata: {},
          createdAt: daysAgo(1),
        },
      })

      await cleanupOldEvents(RETENTION_DAYS)

      const stillThere = await prisma.chatbotEvent.findUnique({ where: { id: recent.id } })
      expect(stillThere).not.toBeNull()
    } finally {
      await cleanupFixture(botConfigId)
    }
  })
})
