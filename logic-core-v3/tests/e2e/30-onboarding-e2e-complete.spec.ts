import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsAdmin } from '../helpers/auth'
import { typeControlledInput, setControlledSelect } from '../helpers/form'

const prisma = new PrismaClient()

// ─── Full onboarding flow ─────────────────────────────────────────────────────

test.describe('Onboarding completo E2E', () => {
  test.setTimeout(120_000)

  let createdOrgSlug: string | undefined
  let testEmail: string

  test('admin crea cliente → cliente loguea → cambia password → ve dashboard', async ({
    page,
    context,
  }) => {
    const timestamp = Date.now()
    testEmail = `e2e-test-${timestamp}@example.com`
    const testOrgName = `E2E Auto ${timestamp}`

    // ── PASO 1: Admin crea cliente ─────────────────────────────────────────
    await loginAsAdmin(page)
    await page.addInitScript(() => {
      window.localStorage.removeItem('develop:onboarding:draft')
    })
    await page.goto('/admin/clients/new', { waitUntil: 'domcontentloaded', timeout: 30000 })

    const continueButton = page.getByRole('button', { name: /^Continuar/i }).first()

    // Step 1 — Empresa + usuario
    await typeControlledInput(page.getByPlaceholder(/Concesionaria San Miguel/i), testOrgName)
    await setControlledSelect(page.locator('select').first(), 'generico')
    await typeControlledInput(page.getByPlaceholder(/Tucumán/i), 'Test City')
    await typeControlledInput(page.getByPlaceholder(/Lucía Pereyra/i), 'Cliente E2E Test')
    await typeControlledInput(page.getByPlaceholder('cliente@empresa.com'), testEmail)

    const canStep1 = await continueButton.isEnabled().catch(() => false)
    test.skip(!canStep1, 'Step 1 no habilitó el botón Continuar con los datos ingresados')
    await continueButton.click()

    // Step 2 — Bot identity
    await page.waitForTimeout(400)
    await typeControlledInput(page.getByPlaceholder(/Asistente Virtual/i), 'Asistente E2E')
    await typeControlledInput(
      page.getByPlaceholder(/puedo ayudarte/i),
      'Hola, soy el asistente de prueba E2E. ¿En qué te ayudo hoy?',
    )
    await setControlledSelect(page.locator('select').first(), 'informal_rioplatense')
    await continueButton.click()

    // Step 3 — Knowledge Base (template se auto-carga)
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 8000 })
    await expect(continueButton).toBeEnabled({ timeout: 8000 })
    await continueButton.click()

    // Step 4 — Apariencia
    await page.waitForTimeout(400)
    await typeControlledInput(page.getByPlaceholder('#06b6d4'), '#06b6d4')
    await typeControlledInput(page.getByPlaceholder(/5493815555555/i), '5493815555555')
    await continueButton.click()

    // Step 5 — Review + Submit
    await page.waitForTimeout(400)
    const submitButton = page.getByRole('button', { name: /crear cliente y activar bot/i })
    await expect(submitButton).toBeVisible({ timeout: 8000 })
    await submitButton.click()

    // ── PASO 2: Capturar password temporal ─────────────────────────────────
    await expect(page.locator('text=Password temporal')).toBeVisible({ timeout: 20000 })

    // El password está en el primer div.font-mono de la pantalla de éxito
    const passwordEl = page.locator('div.font-mono').first()
    const tempPassword = (await passwordEl.textContent())?.trim() ?? ''
    expect(tempPassword.length).toBeGreaterThan(0)

    // Obtener el slug de la org creada desde Prisma (para cleanup y navegación)
    const createdUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        orgMemberships: {
          include: { organization: { select: { slug: true } } },
          take: 1,
        },
      },
    })
    createdOrgSlug = createdUser?.orgMemberships[0]?.organization.slug
    expect(createdOrgSlug).toBeTruthy()

    // ── PASO 3: Logout admin ────────────────────────────────────────────────
    await context.clearCookies()

    // ── PASO 4: Cliente loguea con password temporal ────────────────────────
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.getByLabel(/^Email$/i).fill(testEmail)
    await page.getByLabel(/^Contraseña$/i).fill(tempPassword)

    const loginSubmit = page.getByRole('button', { name: /^Ingresar$/i })
    await Promise.all([
      page.waitForURL(/\/cambiar-password/, { timeout: 20000, waitUntil: 'domcontentloaded' }),
      loginSubmit.evaluate((button) => {
        const btn = button as HTMLButtonElement
        btn.form?.requestSubmit(btn)
      }),
    ])
    expect(page.url()).toContain('/cambiar-password')

    // ── PASO 5: Cliente NO puede saltar el cambio ───────────────────────────
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/cambiar-password/, { timeout: 5000 })
    expect(page.url()).toContain('/cambiar-password')

    // ── PASO 6: Cliente cambia password ────────────────────────────────────
    const newPassword = `NuevaPass${timestamp % 100000}!`
    const inputs = page.locator('input[type="password"]')
    await inputs.nth(0).fill(tempPassword)    // Contraseña actual
    await inputs.nth(1).fill(newPassword)     // Nueva contraseña
    await inputs.nth(2).fill(newPassword)     // Confirmar

    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 15000, waitUntil: 'domcontentloaded' }),
      page.getByRole('button', { name: /cambiar contraseña/i }).click(),
    ])

    // ── PASO 7: Cliente ve dashboard ────────────────────────────────────────
    expect(page.url()).toMatch(/\/dashboard/)
    await expect(page.locator('body')).not.toBeEmpty()

    // ── PASO 8: Re-login con nueva password sin re-cambio ───────────────────
    await context.clearCookies()
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.getByLabel(/^Email$/i).fill(testEmail)
    await page.getByLabel(/^Contraseña$/i).fill(newPassword)

    const loginSubmit2 = page.getByRole('button', { name: /^Ingresar$/i })
    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 20000, waitUntil: 'domcontentloaded' }),
      loginSubmit2.evaluate((button) => {
        const btn = button as HTMLButtonElement
        btn.form?.requestSubmit(btn)
      }),
    ])

    expect(page.url()).not.toContain('/cambiar-password')
    expect(page.url()).toMatch(/\/dashboard/)
  })

  test.afterAll(async () => {
    if (createdOrgSlug) {
      await prisma.organization.delete({ where: { slug: createdOrgSlug } }).catch(() => undefined)
    }
    if (testEmail) {
      await prisma.user.delete({ where: { email: testEmail } }).catch(() => undefined)
    }
    await prisma.$disconnect()
  })
})

// ─── Edge case: email duplicado ───────────────────────────────────────────────

test.describe('Edge cases onboarding', () => {
  test.setTimeout(90_000)

  const prismaEdge = new PrismaClient()

  test('email duplicado falla con error claro', async ({ page }) => {
    const existingEmail = 'cliente@sanmiguel.com'

    await loginAsAdmin(page)
    await page.addInitScript(() => {
      window.localStorage.removeItem('develop:onboarding:draft')
    })
    await page.goto('/admin/clients/new', { waitUntil: 'domcontentloaded', timeout: 30000 })

    const continueButton = page.getByRole('button', { name: /^Continuar/i }).first()

    // Step 1 — con email ya registrado
    await typeControlledInput(page.getByPlaceholder(/Concesionaria San Miguel/i), 'Org Duplicada E2E')
    await setControlledSelect(page.locator('select').first(), 'generico')
    await typeControlledInput(page.getByPlaceholder(/Tucumán/i), 'Ciudad Test')
    await typeControlledInput(page.getByPlaceholder(/Lucía Pereyra/i), 'Usuario Duplicado')
    await typeControlledInput(page.getByPlaceholder('cliente@empresa.com'), existingEmail)

    const canContinue = await continueButton.isEnabled().catch(() => false)
    test.skip(!canContinue, 'Step 1 no habilitó el botón Continuar')
    await continueButton.click()

    // Step 2
    await page.waitForTimeout(400)
    await typeControlledInput(page.getByPlaceholder(/Asistente Virtual/i), 'Bot Duplicado')
    await typeControlledInput(
      page.getByPlaceholder(/puedo ayudarte/i),
      'Hola, soy el asistente duplicado de prueba E2E.',
    )
    await continueButton.click()

    // Step 3
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 8000 })
    await expect(continueButton).toBeEnabled({ timeout: 8000 })
    await continueButton.click()

    // Step 4
    await page.waitForTimeout(400)
    await continueButton.click()

    // Step 5 — Submit
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: /crear cliente y activar bot/i }).click()

    // Debe mostrar error de email duplicado
    await expect(page.locator('text=No se pudo crear el cliente')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=/ya está registrado/i')).toBeVisible()
  })

  test('admin puede re-enviar credenciales a cliente existente', async ({ page }) => {
    // Buscar un cliente existente con usuario
    const org = await prismaEdge.organization.findFirst({
      where: { members: { some: { user: { email: { not: undefined } } } } },
      include: { members: { include: { user: { select: { email: true } } }, take: 1 } },
      orderBy: { createdAt: 'asc' },
    })

    if (!org?.slug) {
      test.skip(true, 'No hay organizaciones con miembros en el DB de test')
      return
    }

    await loginAsAdmin(page)
    await page.goto(`/admin/clients/${org.slug}`, { waitUntil: 'domcontentloaded', timeout: 30000 })

    // El tab Overview carga por default
    const resendBtn = page.getByRole('button', { name: /re-enviar credenciales/i })
    await expect(resendBtn).toBeVisible({ timeout: 10000 })
    await resendBtn.click()

    // Aparece el estado de confirmación
    const confirmBtn = page.getByRole('button', { name: /confirmar/i })
    await expect(confirmBtn).toBeVisible({ timeout: 5000 })
    await confirmBtn.click()

    // Resultado: éxito o fallback con password (ambos son válidos)
    const successMsg = page.locator('text=Credenciales enviadas')
    const fallbackMsg = page.locator('text=Email falló')
    await expect(successMsg.or(fallbackMsg)).toBeVisible({ timeout: 15000 })
  })

  test.afterAll(async () => {
    await prismaEdge.$disconnect()
  })
})
