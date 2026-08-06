/**
 * C0.1 — Invariante del gate "tools restringidas al bot propio de develOP".
 *
 *   npm run test:c01
 *   (o: npx tsx src/modules/chatbot/server/tools/__tests__/navigate-to-page-gate.invariant.ts)
 *
 * `navigate_to_page` manda a rutas hardcodeadas del sitio de develOP
 * (VALID_PATHS en navigateToPage.ts). En el bot de un cliente eso no es un
 * link roto: es fuga de trafico (ver header de navigateToPage.ts y el
 * comentario de TOOLS_RESTRICTED_TO_AGENCY_BOT en getTools.ts). Hasta que
 * exista BotConfig.allowedNavigationPaths, el tool queda restringido al bot
 * propio via isAgencyOwnedBot().
 *
 * Cero DB, cero red: getTools() es una funcion pura sobre su ctx y el
 * allowlist de tools. Se ejercita la funcion REAL, no una reimplementacion.
 */

import assert from 'node:assert/strict'
import {
  ALL_TOOL_SLUGS,
  TOOLS_RESTRICTED_TO_AGENCY_BOT,
  getTools,
  isAgencyOwnedBot,
} from '../getTools.ts'
import type { ToolCallContext } from '../types.ts'

function makeCtx(botSlug: string): ToolCallContext {
  return {
    conversationId: 'conv-1',
    botConfigId: 'bot-1',
    organizationId: 'org-1',
    botSlug,
  }
}

// ─── 1. El gate aislado (enabledTools = null, el filtro de plan no interviene) ──

const clienteTools = getTools(makeCtx('sanmiguel'), null)

assert.ok(
  !('navigate_to_page' in clienteTools),
  'org cliente (botSlug !== develop) NO recibe navigate_to_page',
)
for (const slug of ALL_TOOL_SLUGS) {
  if (slug === 'navigate_to_page') continue
  assert.ok(slug in clienteTools, `el gate es quirurgico: org cliente sigue recibiendo ${slug}`)
}

const agenciaTools = getTools(makeCtx('develop'), null)

assert.ok(
  'navigate_to_page' in agenciaTools,
  'bot propio de develOP (botSlug === develop) SI recibe navigate_to_page',
)
for (const slug of ALL_TOOL_SLUGS) {
  assert.ok(slug in agenciaTools, `bot develop recibe ${slug}`)
}

// ─── 2. Combinado con plan.tools — AND, ningun gate alcanza solo ───────────────

// Espejo minimo de sync-plans.ts (no se importa el seed: el test no depende de
// su estado en disco, solo de la forma del contrato plan.tools).
const BUSINESS_LIKE_TOOLS = [
  'capture_lead',
  'offer_handoff_options',
  'show_whatsapp_handoff',
  'navigate_to_page',
  'confirm_contact_request',
]
const STARTER_LIKE_TOOLS = ['capture_lead', 'show_whatsapp_handoff', 'confirm_contact_request']

// 2a: el plan lo permite (BUSINESS) pero el bot es de cliente -> el gate de org tapa igual
const clienteBusiness = getTools(makeCtx('sanmiguel'), BUSINESS_LIKE_TOOLS)
assert.ok(
  !('navigate_to_page' in clienteBusiness),
  'plan BUSINESS no alcanza para un bot de cliente: el gate de org lo tapa igual',
)

// 2b: el plan lo permite y el bot es el propio -> pasa
const agenciaBusiness = getTools(makeCtx('develop'), BUSINESS_LIKE_TOOLS)
assert.ok(
  'navigate_to_page' in agenciaBusiness,
  'plan BUSINESS + bot propio: navigate_to_page disponible',
)

// 2c: el bot es el propio pero el plan no la incluye (STARTER) -> el gate de plan gana
const agenciaStarter = getTools(makeCtx('develop'), STARTER_LIKE_TOOLS)
assert.ok(
  !('navigate_to_page' in agenciaStarter),
  'ser el bot propio no alcanza si el plan no incluye la tool: los dos gates son necesarios',
)

// ─── 3. isAgencyOwnedBot — unitario ─────────────────────────────────────────────

assert.strictEqual(isAgencyOwnedBot('develop'), true, 'develop es el bot propio')
assert.strictEqual(isAgencyOwnedBot('matsu'), false, 'matsu no es el bot propio')
assert.strictEqual(isAgencyOwnedBot('sanmiguel'), false, 'sanmiguel no es el bot propio')
assert.strictEqual(isAgencyOwnedBot(''), false, 'slug vacio no es el bot propio')

// ─── 4. Alcance de la restriccion — que no crezca en silencio ──────────────────

assert.deepStrictEqual(
  TOOLS_RESTRICTED_TO_AGENCY_BOT,
  ['navigate_to_page'],
  'C0.1 restringe exactamente navigate_to_page - si esto cambia, tiene que ser una decision nueva, no un accidente',
)

// ─── Reporte ─────────────────────────────────────────────────────────────────

console.log(
  '[C0.1 invariant] Todas las aserciones del gate agencia/cliente pasaron. ' +
  'Casos: gate aislado (cliente/develop), combinado con plan.tools (BUSINESS/STARTER), ' +
  'isAgencyOwnedBot unitario, alcance de TOOLS_RESTRICTED_TO_AGENCY_BOT.',
)
