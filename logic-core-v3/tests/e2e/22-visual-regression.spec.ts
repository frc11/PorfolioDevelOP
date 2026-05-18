import { test, expect, type Page } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsAdmin, loginAsClient } from '../helpers/auth'
import { cleanupClientBot, ensureClientBot } from '../helpers/chatbot-fixtures'

const prisma = new PrismaClient()
let botFixture: Awaited<ReturnType<typeof ensureClientBot>> | null = null

async function prepareVisualPage(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
      canvas, video, [data-nextjs-toast], [aria-label="Open Next.js Dev Tools"] {
        visibility: hidden !important;
      }
    `,
  })
}

function stableMasks(page: Page) {
  return [
    page.locator('header').first(),
    page.locator('[aria-live="polite"]'),
    page.locator('[role="status"]'),
  ]
}

test.describe('Visual regression - admin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('/admin matches baseline', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await prepareVisualPage(page)
    await expect(page).toHaveScreenshot('admin-home.png', {
      fullPage: true,
      mask: stableMasks(page),
    })
  })

  test('/admin/clients matches baseline', async ({ page }) => {
    await page.goto('/admin/clients')
    await page.waitForLoadState('networkidle')
    await prepareVisualPage(page)
    await expect(page).toHaveScreenshot('admin-clients.png', {
      fullPage: true,
      mask: stableMasks(page),
    })
  })

  test('/admin/alerts matches baseline', async ({ page }) => {
    await page.goto('/admin/alerts')
    await page.waitForLoadState('networkidle')
    await prepareVisualPage(page)
    await expect(page).toHaveScreenshot('admin-alerts.png', {
      fullPage: true,
      mask: stableMasks(page),
    })
  })

  test('/admin/_design tokens section matches baseline', async ({ page }) => {
    await page.goto('/admin/_design')
    await page.waitForLoadState('networkidle')
    await prepareVisualPage(page)
    await expect(page).toHaveScreenshot('admin-design-tokens.png', {
      fullPage: true,
      mask: stableMasks(page),
    })
  })
})

test.describe('Visual regression - dashboard cliente', () => {
  test.beforeAll(async () => {
    botFixture = await ensureClientBot(prisma)
  })

  test.afterAll(async () => {
    await cleanupClientBot(prisma, botFixture)
    await prisma.$disconnect()
  })

  test.beforeEach(async ({ page }) => {
    await loginAsClient(page)
  })

  test('/dashboard matches baseline', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await prepareVisualPage(page)
    await expect(page).toHaveScreenshot('dashboard-home.png', {
      fullPage: true,
      mask: stableMasks(page),
    })
  })

  test('/dashboard/chatbot matches baseline', async ({ page }) => {
    await page.goto('/dashboard/chatbot')
    await page.waitForLoadState('networkidle')
    await prepareVisualPage(page)
    await expect(page).toHaveScreenshot('dashboard-chatbot.png', {
      fullPage: true,
      mask: stableMasks(page),
    })
  })

  test('/dashboard/chatbot/settings matches baseline', async ({ page }) => {
    await page.goto('/dashboard/chatbot/settings')
    await page.waitForLoadState('networkidle')
    await prepareVisualPage(page)
    await expect(page).toHaveScreenshot('dashboard-settings.png', {
      fullPage: true,
      mask: stableMasks(page),
    })
  })
})
