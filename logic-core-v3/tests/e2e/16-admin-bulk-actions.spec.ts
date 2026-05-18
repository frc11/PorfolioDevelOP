import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin bulk actions', () => {
  test.setTimeout(60_000)

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/clients')
  })

  test('puede multi-seleccionar clientes', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    test.skip(count < 2, 'Bulk selection needs at least two client fixtures')

    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    await expect(page.getByText(/seleccionado/i)).toBeVisible({ timeout: 3000 })
  })

  test('export leads bulk genera CSV', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    test.skip(count < 1, 'Bulk export needs at least one client fixture')

    await checkboxes.nth(0).check()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /exportar leads/i }).click(),
    ])

    expect(download.suggestedFilename()).toMatch(/leads-\d{4}-\d{2}-\d{2}\.csv/)
  })
})
