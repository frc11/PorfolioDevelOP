import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin audit log', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/audit-log')
  })

  test('audit log page carga', async ({ page }) => {
    await expect(
      page.locator('main').getByRole('heading', { name: 'Audit log', exact: true }),
    ).toBeVisible({ timeout: 10000 })
  })

  test('filter por actionType funciona', async ({ page }) => {
    const filter = page.locator('select').first()
    await expect(filter).toBeVisible()

    const optionCount = await filter.locator('option').count()
    test.skip(optionCount < 2, 'Audit log needs at least one action type to filter')

    await filter.selectOption({ index: 1 })
    await expect(page.getByText(/mostrando/i)).toBeVisible()
  })
})
