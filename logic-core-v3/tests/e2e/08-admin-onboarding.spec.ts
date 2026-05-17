import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin onboarding wizard', () => {
  test('wizard completo crea cliente nuevo', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/clients/new')

    // Step 1: Company info
    await page.getByLabel(/nombre de la empresa/i).fill('Test Cliente E2E')
    // El label real puede variar, intentamos con algunos fallbacks
    // Si falla aca deberemos reportarlo
    await page.getByLabel(/industria|rubro/i).selectOption('legal')
    await page.getByLabel(/ciudad/i).fill('Tucumán')
    await page.getByRole('button', { name: /siguiente|next/i }).click()

    // Step 2: Bot identity
    await page.getByLabel(/nombre.*bot|bot.*nombre/i).fill('Asistente Test')
    await page.getByLabel(/mensaje.*bienvenida|bienvenida/i).fill('Hola! Soy el asistente de Test Cliente. ¿En qué te ayudo?')
    await page.getByLabel(/tono|tone/i).selectOption('informal_rioplatense')
    await page.getByRole('button', { name: /siguiente|next/i }).click()

    // Step 3: Knowledge base
    await expect(page.locator('textarea').first()).not.toBeEmpty()
    await page.getByRole('button', { name: /siguiente|next/i }).click()

    // Step 4: Appearance
    await page.getByLabel(/color|accent/i).fill('#06b6d4')
    await page.getByLabel(/whatsapp/i).fill('5493815555555')
    await page.getByRole('button', { name: /siguiente|next/i }).click()

    // Step 5: Review + create
    await expect(page.getByText(/Test Cliente E2E/)).toBeVisible()
    await page.getByRole('button', { name: /crear|create/i }).click()

    // Esperar redirect al detail del cliente
    await page.waitForURL(/\/admin\/clients\/.*\/chatbot\/overview/, { timeout: 15000 })

    // Verificar que el cliente fue creado
    await expect(page.getByText(/Test Cliente E2E/)).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    // TODO: eliminar cliente test-cliente-e2e después
  })
})
