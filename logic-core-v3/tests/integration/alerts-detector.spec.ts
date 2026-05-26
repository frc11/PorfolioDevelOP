/**
 * R22 — Alert detector integration tests.
 *
 * Require a live database and a running Next.js server
 * (NEXT_PUBLIC_APP_URL + CRON_SECRET env vars).
 * Tests exercise the full detector → persist → notify pipeline via HTTP.
 */
import { test, expect, type APIRequestContext } from '@playwright/test'
import { PrismaClient, type BotAlertType } from '@prisma/client'

const prisma = new PrismaClient()

// New types pending prisma generate — cast as BotAlertType until regenerated
const DOMAIN_NOT_AUTHORIZED_SPIKE = 'DOMAIN_NOT_AUTHORIZED_SPIKE' as BotAlertType
const LEAD_CAPTURE_FAILURE = 'LEAD_CAPTURE_FAILURE' as BotAlertType

async function getActiveBot() {
  return prisma.botConfig.findFirst({ where: { isActive: true } })
}

async function cleanAlertsForBot(botConfigId: string, type: BotAlertType) {
  await prisma.botAlert.deleteMany({ where: { botConfigId, type } })
}

async function triggerCron(request: APIRequestContext) {
  return request.get('/api/cron/detect-bot-issues', {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}` },
  })
}

test.describe('Alert detector — integration', () => {
  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  // ── LLM_PROVIDER_ERROR ────────────────────────────────────────────────────
  test('detecta LLM_PROVIDER_ERROR con 3+ errores LLM en la última hora', async ({ request }) => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    await cleanAlertsForBot(bot.id, 'LLM_PROVIDER_ERROR')

    for (let i = 0; i < 4; i++) {
      await prisma.chatbotEvent.create({
        data: {
          botConfigId: bot.id,
          type: 'llm.error',
          level: 'ERROR',
          message: `LLM provider error test ${i}`,
          metadata: { error: 'LLM_PROVIDER_ERROR' },
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
        },
      })
    }

    try {
      const res = await triggerCron(request)
      expect(res.ok()).toBeTruthy()
      const body = await res.json()
      expect(body.ok).toBe(true)

      const alert = await prisma.botAlert.findFirst({
        where: { botConfigId: bot.id, type: 'LLM_PROVIDER_ERROR', status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      })
      expect(alert).toBeTruthy()
      expect(alert?.severity).toBe('CRITICAL')
    } finally {
      await prisma.chatbotEvent.deleteMany({
        where: { botConfigId: bot.id, type: 'llm.error', message: { contains: 'LLM provider error test' } },
      })
      await cleanAlertsForBot(bot.id, 'LLM_PROVIDER_ERROR')
    }
  })

  // ── CLIENT_NO_ACTIVITY ────────────────────────────────────────────────────
  test('detecta CLIENT_NO_ACTIVITY para bot sin conversaciones en 7 días', async ({ request }) => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    const recentConvs = await prisma.conversation.count({
      where: {
        botConfigId: bot.id,
        startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })

    if (recentConvs > 0) {
      test.skip(true, 'Bot tiene conversaciones recientes — condición no cumplida, omitido')
      return
    }

    await cleanAlertsForBot(bot.id, 'CLIENT_NO_ACTIVITY')

    try {
      const res = await triggerCron(request)
      expect(res.ok()).toBeTruthy()

      const alert = await prisma.botAlert.findFirst({
        where: { botConfigId: bot.id, type: 'CLIENT_NO_ACTIVITY', status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      })
      expect(alert).toBeTruthy()
      expect(alert?.severity).toBe('INFO')
    } finally {
      await cleanAlertsForBot(bot.id, 'CLIENT_NO_ACTIVITY')
    }
  })

  // ── DOMAIN_NOT_AUTHORIZED_SPIKE ───────────────────────────────────────────
  test('detecta DOMAIN_NOT_AUTHORIZED_SPIKE con 10+ bloqueos en 24h', async ({ request }) => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    await cleanAlertsForBot(bot.id, DOMAIN_NOT_AUTHORIZED_SPIKE)

    for (let i = 0; i < 12; i++) {
      await prisma.chatbotEvent.create({
        data: {
          botConfigId: bot.id,
          type: 'SECURITY.BLOCKED_ORIGIN',
          level: 'WARN',
          message: `Blocked request from https://evil-${i}.com`,
          metadata: { origin: `https://evil-${i}.com`, reason: 'domain_not_allowed' },
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
        },
      })
    }

    try {
      const res = await triggerCron(request)
      expect(res.ok()).toBeTruthy()

      const alert = await prisma.botAlert.findFirst({
        where: { botConfigId: bot.id, type: DOMAIN_NOT_AUTHORIZED_SPIKE, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      })
      expect(alert).toBeTruthy()
      expect(alert?.severity).toBe('INFO')
    } finally {
      await prisma.chatbotEvent.deleteMany({
        where: {
          botConfigId: bot.id,
          type: 'SECURITY.BLOCKED_ORIGIN',
          message: { contains: 'Blocked request from https://evil-' },
        },
      })
      await cleanAlertsForBot(bot.id, DOMAIN_NOT_AUTHORIZED_SPIKE)
    }
  })

  // ── LEAD_CAPTURE_FAILURE ──────────────────────────────────────────────────
  test('detecta LEAD_CAPTURE_FAILURE con 3+ errores de capture_lead en la última hora', async ({ request }) => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    await cleanAlertsForBot(bot.id, LEAD_CAPTURE_FAILURE)

    for (let i = 0; i < 4; i++) {
      await prisma.chatbotEvent.create({
        data: {
          botConfigId: bot.id,
          type: 'capture_lead.error',
          level: 'ERROR',
          message: `Lead capture error test ${i}`,
          metadata: { error: 'Validation failed' },
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
        },
      })
    }

    try {
      const res = await triggerCron(request)
      expect(res.ok()).toBeTruthy()

      const alert = await prisma.botAlert.findFirst({
        where: { botConfigId: bot.id, type: LEAD_CAPTURE_FAILURE, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      })
      expect(alert).toBeTruthy()
      expect(alert?.severity).toBe('HIGH')
    } finally {
      await prisma.chatbotEvent.deleteMany({
        where: {
          botConfigId: bot.id,
          type: 'capture_lead.error',
          message: { contains: 'Lead capture error test' },
        },
      })
      await cleanAlertsForBot(bot.id, LEAD_CAPTURE_FAILURE)
    }
  })

  // ── ACTIVITY_ERRORS_SPIKE ─────────────────────────────────────────────────
  test('detecta ACTIVITY_ERRORS_SPIKE con 5+ errores en la última hora', async ({ request }) => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    await cleanAlertsForBot(bot.id, 'ACTIVITY_ERRORS_SPIKE')

    for (let i = 0; i < 6; i++) {
      await prisma.chatbotEvent.create({
        data: {
          botConfigId: bot.id,
          type: 'generic.error',
          level: 'ERROR',
          message: `Activity error test ${i}`,
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
        },
      })
    }

    try {
      const res = await triggerCron(request)
      expect(res.ok()).toBeTruthy()

      const alert = await prisma.botAlert.findFirst({
        where: { botConfigId: bot.id, type: 'ACTIVITY_ERRORS_SPIKE', status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      })
      expect(alert).toBeTruthy()
      expect(alert?.severity).toBe('HIGH')
    } finally {
      await prisma.chatbotEvent.deleteMany({
        where: { botConfigId: bot.id, type: 'generic.error', message: { contains: 'Activity error test' } },
      })
      await cleanAlertsForBot(bot.id, 'ACTIVITY_ERRORS_SPIKE')
    }
  })

  // ── Deduplicación ─────────────────────────────────────────────────────────
  test('no duplica alerta PENDING del mismo día para el mismo bot y tipo', async ({ request }) => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    const existing = await prisma.botAlert.create({
      data: {
        botConfigId: bot.id,
        type: 'CLIENT_NO_ACTIVITY',
        severity: 'INFO',
        status: 'PENDING',
        title: 'Test dedup alert',
        description: 'Creada manualmente para test de deduplicación',
        metadata: {},
      },
    })

    const countBefore = await prisma.botAlert.count({
      where: { botConfigId: bot.id, type: 'CLIENT_NO_ACTIVITY', status: 'PENDING' },
    })

    try {
      await triggerCron(request)

      const countAfter = await prisma.botAlert.count({
        where: { botConfigId: bot.id, type: 'CLIENT_NO_ACTIVITY', status: 'PENDING' },
      })

      expect(countAfter).toBeLessThanOrEqual(countBefore)
    } finally {
      await prisma.botAlert.delete({ where: { id: existing.id } }).catch(() => {})
    }
  })

  // ── Autenticación ─────────────────────────────────────────────────────────
  test('rechaza cron sin CRON_SECRET válido', async ({ request }) => {
    const res = await request.get('/api/cron/detect-bot-issues', {
      headers: { Authorization: 'Bearer wrong-secret' },
    })
    expect(res.status()).toBe(401)
  })

  test('trigger-detector rechaza petición no autenticada', async ({ request }) => {
    const res = await request.post('/api/admin/alerts/trigger-detector')
    expect([401, 403]).toContain(res.status())
  })
})
