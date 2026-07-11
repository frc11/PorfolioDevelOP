import { test, expect } from '@playwright/test'
import {
  listLeadsForDashboard,
  getConversationMessagesForOrg,
} from '../../src/modules/chatbot/server/admin/multiTenantQueries'
import { createTenant, teardownTag, disconnect, type SeededTenant } from './helpers/golden-fixtures'

/**
 * GS.1 · Aislamiento a nivel de la CAPA de query org-scopeada del producto.
 *
 * `listLeadsForDashboard` y `getConversationMessagesForOrg` (multiTenantQueries)
 * son el guard relacional sobre el que se apoyan el endpoint de export de leads,
 * la tabla de conversaciones y su transcript-action. Se prueban EN PROCESO
 * (Prisma directo para SEMBRAR, la función org-scopeada del producto para
 * ASERTAR) — no por Prisma con permisos de admin, sino por la misma función que
 * usa la app. Sin HTTP: no dependen del webServer.
 *
 * Dos tenants sembrados y aislados (ONE, TWO), borrados en bloque por TAG.
 */

let one: SeededTenant
let two: SeededTenant

test.beforeAll(async () => {
  await teardownTag() // pre-clean de una corrida anterior interrumpida
  one = await createTenant('one')
  two = await createTenant('two')
})

test.afterAll(async () => {
  await teardownTag()
  await disconnect()
})

test.describe('@isolation queries · leads y conversaciones scopeadas por org', () => {
  test('listLeadsForDashboard: cada org ve SOLO sus leads (ninguno del vecino)', async () => {
    const leadsOfOne = await listLeadsForDashboard(one.organizationId, {}, 500)
    const idsOne = leadsOfOne.map((l) => l.id)
    const namesOne = leadsOfOne.map((l) => l.name)

    // Positivo: la org ve su propio lead.
    expect(idsOne, 'org ONE ve su propio lead').toContain(one.leadId)
    // Aislamiento: NUNCA el lead del vecino, ni por id ni por su tag/nombre.
    expect(idsOne, 'org ONE NUNCA ve el lead de TWO').not.toContain(two.leadId)
    expect(namesOne, 'ningún dato del vecino se filtra').not.toContain(two.leadTag)

    // Dirección inversa: TWO ve el suyo, no el de ONE.
    const leadsOfTwo = await listLeadsForDashboard(two.organizationId, {}, 500)
    const idsTwo = leadsOfTwo.map((l) => l.id)
    expect(idsTwo, 'org TWO ve su propio lead').toContain(two.leadId)
    expect(idsTwo, 'org TWO NUNCA ve el lead de ONE').not.toContain(one.leadId)
  })

  test('getConversationMessagesForOrg: un conversationId ajeno devuelve [] (anti-IDOR)', async () => {
    // Positivo: la conversación propia, scopeada a su org, trae sus mensajes.
    const own = await getConversationMessagesForOrg(one.conversationId, one.organizationId, 200)
    expect(own.length, 'la org ve los mensajes de SU conversación').toBeGreaterThan(0)

    // Aislamiento: la conversación de TWO, pedida con el org de ONE → [].
    const cross = await getConversationMessagesForOrg(two.conversationId, one.organizationId, 200)
    expect(cross, 'conversationId de otra org → [] (sin leak de contenido)').toEqual([])

    // Dirección inversa: la conversación de ONE, pedida con el org de TWO → [].
    const crossBack = await getConversationMessagesForOrg(one.conversationId, two.organizationId, 200)
    expect(crossBack, 'aislamiento en ambas direcciones').toEqual([])

    // Enumeración: un conversationId inexistente devuelve lo MISMO ([]) que uno
    // ajeno — el caller no distingue "no existe" de "no es tuyo".
    const ghost = await getConversationMessagesForOrg('clghostghostghostghost0000', one.organizationId, 200)
    expect(ghost, 'id inexistente indistinguible de id ajeno').toEqual([])
  })
})
