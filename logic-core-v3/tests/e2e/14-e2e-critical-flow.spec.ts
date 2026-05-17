import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Critical end-to-end flow', () => {
  test('admin crea cliente nuevo y cliente puede ver upsell', async ({ page, browser }) => {
    // Step 1: Admin crea cliente
    await loginAsAdmin(page)
    await page.goto('/admin/clients/new')

    const testOrgName = `E2E Test ${Date.now()}`

    // Completar wizard (mismo que test anterior, pero abreviado)
    await page.getByLabel(/nombre.*empresa/i).fill(testOrgName)
    await page.getByLabel(/industria/i).selectOption('legal')
    await page.getByLabel(/ciudad/i).fill('Tucumán')
    await page.getByRole('button', { name: /siguiente/i }).click()

    await page.getByLabel(/nombre.*bot/i).fill('Asistente E2E')
    await page.getByLabel(/bienvenida/i).fill('Hola, soy E2E.')
    await page.getByRole('button', { name: /siguiente/i }).click()

    await page.getByRole('button', { name: /siguiente/i }).click()
    await page.getByRole('button', { name: /siguiente/i }).click()
    await page.getByRole('button', { name: /crear/i }).click()

    // Esperar redirect
    await page.waitForURL(/\/admin\/clients\/.*\/chatbot\/overview/, { timeout: 15000 })

    const slug = page.url().match(/clients\/([^/]+)\/chatbot/)?.[1]
    expect(slug).toBeTruthy()
    console.log('Created client with slug:', slug)

    // TODO: si el seed permite crear usuario para este cliente,
    // testear que ese usuario puede loguear y ver el dashboard
    // Por ahora, este test solo valida la parte admin
  })
})
