import { test, expect } from '@playwright/test'

test('landing page loads with chatbot avatar visible', async ({ page }) => {
  await page.goto('/')

  // Verificar título de la página
  await expect(page).toHaveTitle(/develOP/i)

  // Esperar a que el avatar del chatbot aparezca (puede tardar por client-side mount)
  const avatar = page.locator('[data-chatbot-avatar]').first()
  await expect(avatar).toBeVisible({ timeout: 10_000 })
})
