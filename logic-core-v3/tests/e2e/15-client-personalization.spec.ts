import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsClient } from '../helpers/auth'

const prisma = new PrismaClient()
let createdBotId: string | null = null

test.describe('Client bot personalization', () => {
  test.setTimeout(60_000)

  test.beforeAll(async () => {
    const membership = await prisma.orgMember.findFirst({
      where: { user: { email: 'cliente@sanmiguel.com' } },
      include: {
        organization: {
          include: { botConfig: true },
        },
      },
    })

    if (!membership?.organization) {
      throw new Error('Client fixture organization not found')
    }

    if (!membership.organization.botConfig) {
      const bot = await prisma.botConfig.create({
        data: {
          organizationId: membership.organization.id,
          slug: `${membership.organization.slug}-e2e-bot`,
          botName: 'Asistente San Miguel',
          isActive: true,
          accentColor: '#06b6d4',
          avatarStyle: 'neuro',
          position: 'bottom_right',
          welcomeMessage: 'Hola! Soy el asistente de San Miguel. Te ayudo con tu consulta.',
          quickReplies: [
            { label: 'Quiero cotizar', promptToSend: 'Quiero cotizar' },
            { label: 'Ver horarios', promptToSend: 'Ver horarios' },
          ],
        },
      })

      createdBotId = bot.id
    }
  })

  test.afterAll(async () => {
    if (createdBotId) {
      await prisma.botConfig.delete({ where: { id: createdBotId } }).catch(() => undefined)
    }

    await prisma.$disconnect()
  })

  test.beforeEach(async ({ page }) => {
    await loginAsClient(page)
  })

  test('cliente puede cambiar color del bot', async ({ page }) => {
    await page.goto('/dashboard/chatbot/settings')

    await expect(page.getByRole('heading', { name: /personalizar tu chatbot/i })).toBeVisible({
      timeout: 10000,
    })

    const saveButton = page.getByRole('button', { name: /guardar cambios/i })
    const colorButtons = page.locator('button[aria-label^="Color "]')
    const count = await colorButtons.count()

    for (let index = 0; index < count; index += 1) {
      await colorButtons.nth(index).click()
      if (await saveButton.isEnabled()) break
    }

    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    await expect(page.getByText(/cambios guardados/i)).toBeVisible({ timeout: 5000 })
  })

  test('cliente puede cambiar welcome message', async ({ page }) => {
    await page.goto('/dashboard/chatbot/settings')

    const textarea = page.getByPlaceholder(/Hola.*te ayudo/i)
    await textarea.fill(`Hola! Soy el asistente de mi negocio actualizado ${Date.now()}.`)

    await page.getByRole('button', { name: /guardar cambios/i }).click()
    await expect(page.getByText(/cambios guardados/i)).toBeVisible({ timeout: 5000 })
  })

  test('cliente NO puede acceder a config tecnica del bot', async ({ page }) => {
    const response = await page.goto('/admin/clients/develop/chatbot/config')

    if (page.url().includes('/admin/clients/develop/chatbot/config')) {
      expect(response?.status()).not.toBe(200)
    } else {
      expect(page.url()).not.toContain('/admin/clients/develop/chatbot/config')
    }
  })
})
