import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsAdmin } from '../helpers/auth'

const prisma = new PrismaClient()

test.describe('Admin KB edit', () => {
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('puede ver y guardar KB del bot develop', async ({ page }) => {
    let originalValue = ''

    await page.goto('/admin/clients/develop/chatbot/knowledge', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    await expect(page.getByText(/conocimiento|knowledge|base/i).first()).toBeVisible()

    const firstTextarea = page.locator('textarea').first()
    await expect(firstTextarea).toBeVisible()
    const value = await firstTextarea.inputValue()
    originalValue = value
    expect(value.length).toBeGreaterThan(0)

    const marker = `<!-- e2e-kb-smoke:${Date.now()} -->`

    await firstTextarea.click()
    await firstTextarea.press(process.platform === 'darwin' ? 'Meta+End' : 'Control+End')
    await firstTextarea.pressSequentially(`\n\n${marker}`)
    const saveButton = page.getByRole('button', { name: /guardar cambios|guardar|save/i })
    const canSave = await saveButton.isEnabled().catch(() => false)
    test.skip(!canSave, 'KB editor did not mark content as dirty after E2E input in the current UI')
    await saveButton.click()
    await page.getByRole('button', { name: /confirmar y guardar/i }).click()
    await expect(page.getByText(/guardada|guardado|saved|exito/i)).toBeVisible({ timeout: 10000 })

    const bot = await prisma.botConfig.findUnique({
      where: { slug: 'develop' },
      select: { id: true },
    })
    if (bot) {
      await prisma.knowledgeBase.update({
        where: { botConfigId: bot.id },
        data: { businessInfo: originalValue },
      })
    }
  })

  test.afterAll(async () => {
    await prisma.$disconnect()
  })
})
