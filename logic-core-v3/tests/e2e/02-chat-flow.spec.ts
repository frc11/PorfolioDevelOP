import { test, expect } from '@playwright/test'

test('user can open chat, send a message, and receive a streamed response', async ({ page }) => {
  await page.goto('/')

  // Click en el avatar con force por las animaciones framer-motion
  const avatar = page.locator('[data-chatbot-avatar]').first()
  await avatar.click({ force: true })

  // Verificar que el chat window apareció
  const chatWindow = page.locator('[data-chatbot-window]')
  await expect(chatWindow).toBeVisible({ timeout: 5_000 })

  // Escribir mensaje
  const input = page.locator('[data-chatbot-input]')
  await input.fill('Hola, decime tu nombre')

  // Enviar (Enter)
  await input.press('Enter')

  // Esperar respuesta del bot (puede tardar 3-10s por streaming)
  const assistantMessage = page.locator('[data-chatbot-message="assistant"]').last()
  await expect(assistantMessage).toBeVisible({ timeout: 15_000 })

  // Verificar que hay contenido en la respuesta
  const text = await assistantMessage.textContent()
  expect(text?.length).toBeGreaterThan(5)
})
