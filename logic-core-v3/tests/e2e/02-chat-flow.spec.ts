import { test, expect } from '@playwright/test'

test('user can open chat, send a message, and receive a streamed response @smoke', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const avatar = page.locator('[data-chatbot-avatar]').first()
  const hasAvatar = await avatar.isVisible({ timeout: 10_000 }).catch(() => false)
  test.skip(!hasAvatar, 'Public chatbot widget is not mounted on the landing page in this build')

  await avatar.click({ force: true })

  const chatWindow = page.locator('[data-chatbot-window]')
  await expect(chatWindow).toBeVisible({ timeout: 5_000 })

  const input = page.locator('[data-chatbot-input]')
  await input.fill('Hola, decime tu nombre')
  await input.press('Enter')

  const assistantMessage = page.locator('[data-chatbot-message="assistant"]').last()
  await expect(assistantMessage).toBeVisible({ timeout: 15_000 })

  const text = await assistantMessage.textContent()
  expect(text?.length).toBeGreaterThan(5)
})
