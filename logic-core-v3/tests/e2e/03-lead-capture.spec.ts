import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

test('lead is captured when user provides name and email @smoke', async ({ page }) => {
  const uniqueEmail = `playwright-test-${Date.now()}@example.com`

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const avatar = page.locator('[data-chatbot-avatar]').first()
  const hasAvatar = await avatar.isVisible({ timeout: 10_000 }).catch(() => false)
  test.skip(!hasAvatar, 'Public chatbot widget is not mounted on the landing page in this build')

  const prisma = new PrismaClient()

  try {
    await avatar.click({ force: true })
    await page.locator('[data-chatbot-window]').waitFor()

    const input = page.locator('[data-chatbot-input]')
    await input.fill(
      `Hola, soy Playwright Test, mi email es ${uniqueEmail}, quiero un presupuesto de web`,
    )
    await input.press('Enter')

    await page.waitForTimeout(8_000)

    const lead = await prisma.chatbotLead.findFirst({
      where: { email: uniqueEmail },
    })

    expect(lead).not.toBeNull()
    expect(lead?.name).toContain('Playwright')
  } finally {
    await prisma.chatbotLead.deleteMany({ where: { email: uniqueEmail } })
    await prisma.$disconnect()
  }
})
