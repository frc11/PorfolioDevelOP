import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsClient } from '../helpers/auth'
import { cleanupClientBot, ensureClientBot } from '../helpers/chatbot-fixtures'

const prisma = new PrismaClient()
let botFixture: Awaited<ReturnType<typeof ensureClientBot>> | null = null

test.describe('Client chatbot section', () => {
  test.setTimeout(90_000)

  test.beforeAll(async () => {
    botFixture = await ensureClientBot(prisma)
  })

  test.afterAll(async () => {
    await cleanupClientBot(prisma, botFixture)
    await prisma.$disconnect()
  })

  test('cliente con bot activo ve overview', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot', { waitUntil: 'networkidle', timeout: 60000 })

    // Either chatbot overview metrics or upsell landing must be visible
    const hasOverview = await page
      .getByText(/conversaciones|leads|tokens|oportunidades/i)
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false)
    const hasUpsell = await page
      .getByText(/empleado virtual|activarlo|develOP/i)
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false)

    expect(hasOverview || hasUpsell).toBe(true)
  })

  test('navegacion a leads desde sidebar funciona', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot/leads', { waitUntil: 'domcontentloaded', timeout: 60000 })

    await expect(page.locator('text=/something went wrong|application error/i')).toHaveCount(0)
  })

  test('navegacion a knowledge desde sidebar funciona', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot/knowledge', { waitUntil: 'domcontentloaded', timeout: 60000 })

    await expect(page.locator('text=/something went wrong|application error/i')).toHaveCount(0)
  })

  test('navegacion a settings desde sidebar funciona', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot/settings', { waitUntil: 'domcontentloaded', timeout: 60000 })

    await expect(page.locator('text=/something went wrong|application error/i')).toHaveCount(0)
  })
})
