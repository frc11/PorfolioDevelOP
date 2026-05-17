import { Page, expect } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/^Email$/i).fill('admin@develop.com')
  await page.getByLabel(/^Contraseña$/i).fill('Admin1234!')
  await page.getByRole('button', { name: /^Ingresar$/i }).click()
  await page.waitForURL(/\/admin/, { timeout: 10000 })
}

export async function loginAsClient(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/^Email$/i).fill('cliente@sanmiguel.com')
  await page.getByLabel(/^Contraseña$/i).fill('Cliente1234!')
  await page.getByRole('button', { name: /^Ingresar$/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /logout|cerrar sesión|salir/i }).click()
  await page.waitForURL(/\/login/, { timeout: 5000 })
}
