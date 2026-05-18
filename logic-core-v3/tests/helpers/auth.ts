import { Page, expect } from '@playwright/test'

async function submitLogin(page: Page, email: string, password: string, target: RegExp) {
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.getByLabel(/^Email$/i).fill(email)
  await page.getByLabel(/^Contraseña$/i).fill(password)

  const submit = page.getByRole('button', { name: /^Ingresar$/i })
  await expect(submit).toBeVisible({ timeout: 15000 })

  await Promise.all([
    page.waitForURL(target, { timeout: 45000, waitUntil: 'domcontentloaded' }),
    submit.evaluate((button) => {
      const submitButton = button as HTMLButtonElement
      submitButton.form?.requestSubmit(submitButton)
    }),
  ])
}

export async function loginAsAdmin(page: Page) {
  await submitLogin(page, 'admin@develop.com', 'Admin1234!', /\/admin/)
}

export async function loginAsClient(page: Page) {
  await submitLogin(page, 'cliente@sanmiguel.com', 'Cliente1234!', /\/dashboard/)
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /logout|cerrar sesion|cerrar sesión|salir/i }).click()
  await page.waitForURL(/\/login/, { timeout: 5000, waitUntil: 'domcontentloaded' })
}
