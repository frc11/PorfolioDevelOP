import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin login', () => {
  test('admin puede loguearse y ver dashboard', async ({ page }) => {
    await loginAsAdmin(page)

    // Verificar URL final
    expect(page.url()).toContain('/admin')

    // Verificar elementos del admin
    await expect(page.getByText(/dashboard|kpi|métricas/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('admin sin credenciales no puede acceder', async ({ page }) => {
    await page.goto('/admin')

    // Debe redirigir a login
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })
})
