import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin alerts triage', () => {
  test.setTimeout(60_000)

  test('alerts page muestra 3 columnas', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/alerts', { waitUntil: 'domcontentloaded', timeout: 30000 })

    await expect(page.getByText('Pendientes', { exact: true })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('Vistas', { exact: true })).toBeVisible()
    await expect(page.getByText('Resueltas', { exact: true })).toBeVisible()
  })
})
