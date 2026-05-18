import { test, expect, devices } from '@playwright/test'
import { loginAsAdmin, loginAsClient } from '../helpers/auth'

const iphoneSE = devices['iPhone SE']

test.use({
  viewport: iphoneSE.viewport,
  deviceScaleFactor: iphoneSE.deviceScaleFactor,
  isMobile: iphoneSE.isMobile,
  hasTouch: iphoneSE.hasTouch,
  userAgent: iphoneSE.userAgent,
})

test.describe('Mobile responsive', () => {
  test('dashboard cliente funciona en iPhone SE', async ({ page }) => {
    await loginAsClient(page)

    const desktopNav = page.locator('nav').first()
    await expect(desktopNav).toBeHidden()

    const hamburger = page.getByRole('button', { name: /abrir men/i })
    await expect(hamburger).toBeVisible()

    await hamburger.click()

    await expect(page.getByRole('link', { name: /mi chatbot/i })).toBeVisible({
      timeout: 5000,
    })
  })

  test('admin layout funciona en mobile', async ({ page }) => {
    await loginAsAdmin(page)

    const hamburger = page.getByRole('button', { name: /abrir menu/i })
    await expect(hamburger).toBeVisible()

    await hamburger.click()
    await expect(page.getByRole('link', { name: /clientes/i })).toBeVisible({
      timeout: 5000,
    })
  })
})
