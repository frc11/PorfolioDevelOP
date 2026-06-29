import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { signEmailContactOptOutToken } from '../../src/lib/email/unsubscribe-token'

/**
 * Anti-IDOR del endpoint público de baja `/api/email/optout/[contactId]`.
 *
 * Antes: actuaba sobre el `contactId` crudo recibido en la URL, sin token →
 * cualquiera que conociera/adivinara un id podía dar de baja a un contacto
 * (de cualquier org). Ahora exige un token HMAC firmado por contacto.
 *
 * Mirrors el estilo de tests/e2e/15-client-personalization.spec.ts:
 * `new PrismaClient()`, reusar una org seedeada, crear/borrar solo las filas
 * hijas (EmailContact) y limpiar por id exacto en afterAll.
 *
 * Requiere el server corriendo (webServer de playwright.config.ts) y
 * DATABASE_URL + AUTH_SECRET en el entorno (igual que el resto de los e2e).
 */
const prisma = new PrismaClient()

const TAG = 'IDOR-OPTOUT-E2E'
let contactAId = ''
let contactBId = ''

async function isOptedOut(id: string): Promise<boolean> {
  const c = await prisma.emailContact.findUnique({ where: { id }, select: { optedOut: true } })
  return c?.optedOut ?? false
}

test.describe('IDOR · opt-out de email exige token firmado @security', () => {
  test.setTimeout(60_000)

  test.beforeAll(async () => {
    const org = await prisma.organization.findFirst({ select: { id: true } })
    if (!org) throw new Error('No hay ninguna Organization seedeada para el test de opt-out')

    const a = await prisma.emailContact.create({
      data: { organizationId: org.id, email: `a.${TAG}@example.test`, source: TAG },
      select: { id: true },
    })
    const b = await prisma.emailContact.create({
      data: { organizationId: org.id, email: `b.${TAG}@example.test`, source: TAG },
      select: { id: true },
    })
    contactAId = a.id
    contactBId = b.id
  })

  test.afterAll(async () => {
    await prisma.emailContact.deleteMany({ where: { source: TAG } }).catch(() => undefined)
    await prisma.$disconnect()
  })

  test('sin token → 403 y el contacto NO se da de baja', async ({ request }) => {
    const res = await request.get(`/api/email/optout/${contactAId}`)
    expect(res.status()).toBe(403)
    expect(await isOptedOut(contactAId)).toBe(false)
  })

  test('token basura → 403 y el contacto NO se da de baja', async ({ request }) => {
    const res = await request.get(`/api/email/optout/${contactAId}?token=no-es-un-token`)
    expect(res.status()).toBe(403)
    expect(await isOptedOut(contactAId)).toBe(false)
  })

  test('token de OTRO contacto → 403 (cross-contact IDOR cerrado)', async ({ request }) => {
    const forged = signEmailContactOptOutToken(contactBId)
    const res = await request.get(`/api/email/optout/${contactAId}?token=${forged}`)
    expect(res.status()).toBe(403)
    expect(await isOptedOut(contactAId)).toBe(false)
  })

  test('token legítimo → 200 y el contacto queda dado de baja', async ({ request }) => {
    const token = signEmailContactOptOutToken(contactAId)
    const res = await request.get(`/api/email/optout/${contactAId}?token=${token}`)
    expect(res.status()).toBe(200)
    expect(await isOptedOut(contactAId)).toBe(true)
  })

  test('id inexistente con token válido para ese id → 200 sin leak de existencia', async ({ request }) => {
    // Un id que no existe + su token correcto responde igual que un opt-out
    // real (200), sin revelar si el contacto existe. Un token inválido sobre
    // el mismo id daría 403 — el discriminador es el token, nunca la existencia.
    const ghostId = 'ckghostghostghostghostghost'
    const token = signEmailContactOptOutToken(ghostId)
    const ok = await request.get(`/api/email/optout/${ghostId}?token=${token}`)
    expect(ok.status()).toBe(200)
    const bad = await request.get(`/api/email/optout/${ghostId}?token=invalido`)
    expect(bad.status()).toBe(403)
  })
})
