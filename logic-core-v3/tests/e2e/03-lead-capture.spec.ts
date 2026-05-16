import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

test('lead is captured when user provides name and email', async ({ page }) => {
  const prisma = new PrismaClient()
  const uniqueEmail = `playwright-test-${Date.now()}@example.com`

  try {
    await page.goto('/')

    // Abrir chat
    await page.locator('[data-chatbot-avatar]').first().click({ force: true })
    await page.locator('[data-chatbot-window]').waitFor()

    // Enviar mensaje que dispara captura
    const input = page.locator('[data-chatbot-input]')
    await input.fill(
      `Hola, soy Playwright Test, mi email es ${uniqueEmail}, quiero un presupuesto de web`
    )
    await input.press('Enter')

    // Esperar respuesta (incluye tool call de capture_lead)
    await page.waitForTimeout(8_000)

    // Verificar en BD que el lead fue creado
    const lead = await prisma.chatbotLead.findFirst({
      where: { email: uniqueEmail },
    })

    expect(lead).not.toBeNull()
    expect(lead?.name).toContain('Playwright')
  } finally {
    // Cleanup: borrar el lead de test
    await prisma.chatbotLead.deleteMany({ where: { email: uniqueEmail } })
    await prisma.$disconnect()
  }
})
