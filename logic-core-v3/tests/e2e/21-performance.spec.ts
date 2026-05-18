import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsAdmin, loginAsClient } from '../helpers/auth'
import { cleanupClientBot, ensureClientBot } from '../helpers/chatbot-fixtures'
import perfBudget from '../perf-budget.json'

const prisma = new PrismaClient()
let botFixture: Awaited<ReturnType<typeof ensureClientBot>> | null = null

test.describe('Performance budgets', () => {
  test.setTimeout(90_000)

  test.beforeAll(async () => {
    botFixture = await ensureClientBot(prisma)
  })

  test.afterAll(async () => {
    await cleanupClientBot(prisma, botFixture)
    await prisma.$disconnect()
  })

  test('admin pages cumplen budget warm', async ({ page }) => {
    await loginAsAdmin(page)

    for (const [path, budget] of Object.entries(perfBudget)) {
      if (!path.startsWith('/admin')) continue
      if (path.includes('[')) continue

      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const start = performance.now()
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      const duration = performance.now() - start

      console.log(`${path}: ${Math.round(duration)}ms (budget: ${budget.warmMs}ms)`)
      expect(duration).toBeLessThan(budget.warmMs)
    }
  })

  test('dashboard pages cumplen budget warm', async ({ page }) => {
    await loginAsClient(page)

    for (const path of ['/dashboard', '/dashboard/chatbot'] as const) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const start = performance.now()
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      const duration = performance.now() - start

      const budget = perfBudget[path].warmMs
      console.log(`${path}: ${Math.round(duration)}ms (budget: ${budget}ms)`)
      expect(duration).toBeLessThan(budget)
    }
  })
})
