/**
 * FIX-ORIGIN — `isBotServable` (src/app/api/chatbot/[slug]/config/same-origin.ts)
 * contra la Neon real: el único chequeo del fix que toca DB, así que es el
 * único que necesita este spec (los otros dos, `isSameOriginBypassApplicable`
 * / `isTrustedSameOrigin`, son puros y ya están cubiertos en
 * config/__tests__/fix-origin-same-origin.invariant.ts, sin DB).
 *
 * Por qué este spec NO llama a `GET` del route (a diferencia del patrón de
 * chatbot-isolation.spec.ts, que sí llama funciones del helper de
 * aislamiento directo): `route.ts` importa `@/modules/chatbot/index.server`,
 * cuya cadena de imports arrastra `next-auth` → `next/server` (vía
 * server/insights → server/admin/getClientSession → src/auth.ts) y, en otro
 * punto, un `.module.css` de un componente de avatar. Ninguno de los dos
 * resuelve fuera del bundler de Next — confirmado intentando cargar
 * `route.ts` tanto con `tsx` directo como con este mismo Playwright runner,
 * mismo resultado en ambos ("Cannot find module 'next/server'" /
 * "Unexpected token '.'" del CSS). Es un problema PREEXISTENTE de esa ruta
 * (no había ningún test de config/route.ts antes de este fix, por la misma
 * razón), no algo introducido acá — de ahí que same-origin.ts exista
 * separado, con imports mínimos (`@/lib/isolation`, liviano — el mismo que ya
 * usa chatbot-isolation.spec.ts bajo este runner sin problema).
 *
 * Consecuencia honesta: la COMPOSICIÓN de estas tres funciones dentro del
 * `if` de GET (que sí compila, pasa lint y tsc) no tiene test automatizado
 * end-to-end en este sprint — queda cubierta por lectura de código (6 líneas,
 * directamente legibles) y por la verificación en prod que Valentino ya tenía
 * planeada como cierre real del fix.
 *
 * Corre con: npx playwright test --config=playwright.integration.config.ts fix-origin
 */
import { test, expect } from '@playwright/test'
import { forOrg, unsafeGlobalQuery } from '../../src/lib/isolation'
import { isBotServable } from '../../src/app/api/chatbot/[slug]/config/same-origin'

const RUN = `${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`

interface Seed {
  activeBotSlug: string
  inactiveBotSlug: string
  nonexistentBotSlug: string
}

let seed: Seed | undefined
const createdOrgIds: string[] = []

function mustSeed(): Seed {
  if (!seed) {
    throw new Error(
      'SEED ROTO: la organización de FIX-ORIGIN no quedó sembrada — la suite falla acá a propósito.',
    )
  }
  return seed
}

test.beforeAll(async () => {
  // BotConfig.organizationId es @unique (un bot por org) → una org efímera
  // POR BOT, no una compartida (espejo del patrón a/b de chatbot-isolation.spec.ts).
  const createOrg = (tag: string) =>
    unsafeGlobalQuery(
      'seed fix-origin-same-origin-config: alta de organización efímera de test (crear tenants es global)',
      (c) =>
        c.organization.create({
          data: { companyName: `FIX-ORIGIN ${tag} ${RUN}`, slug: `fix-origin-${tag}-${RUN}` },
          select: { id: true },
        }),
    )

  const orgActive = await createOrg('active')
  createdOrgIds.push(orgActive.id)
  const activeBotSlug = `fix-origin-active-${RUN}`
  const activeBot = await forOrg(orgActive.id).botConfig.create({
    slug: activeBotSlug,
    botName: `Bot activo ${RUN}`,
    welcomeMessage: 'Hola, soy el bot activo',
    isActive: true,
  })

  const orgInactive = await createOrg('inactive')
  createdOrgIds.push(orgInactive.id)
  const inactiveBotSlug = `fix-origin-inactive-${RUN}`
  const inactiveBot = await forOrg(orgInactive.id).botConfig.create({
    slug: inactiveBotSlug,
    botName: `Bot inactivo ${RUN}`,
    welcomeMessage: 'Hola, soy el bot inactivo',
    isActive: false,
  })

  // Verificación dura del seed contra la DB (ground truth, sin el helper).
  const check = await unsafeGlobalQuery('seed fix-origin-same-origin-config: verificación dura', (c) =>
    c.botConfig.count({ where: { id: { in: [activeBot.id, inactiveBot.id] } } }),
  )
  if (check !== 2) {
    throw new Error(`SEED ROTO: se esperaban 2 bots y hay ${check}. Prohibido continuar con seed parcial.`)
  }

  seed = { activeBotSlug, inactiveBotSlug, nonexistentBotSlug: `fix-origin-no-existe-${RUN}` }
})

test.afterAll(async () => {
  if (createdOrgIds.length === 0) return
  await unsafeGlobalQuery(
    'teardown fix-origin-same-origin-config: borrar por id exacto la org efímera (cascade limpia el bot)',
    (c) => c.organization.deleteMany({ where: { id: { in: createdOrgIds } } }),
  )
})

test.describe('FIX-ORIGIN — isBotServable contra la DB real', () => {
  test('bot activo → servable (true)', async () => {
    const { activeBotSlug } = mustSeed()
    expect(await isBotServable(activeBotSlug)).toBe(true)
  })

  test('bot inactivo → NO servable (false) — same-origin no debe servir config de un bot pausado', async () => {
    const { inactiveBotSlug } = mustSeed()
    expect(await isBotServable(inactiveBotSlug)).toBe(false)
  })

  test('bot inexistente → NO servable (false)', async () => {
    const { nonexistentBotSlug } = mustSeed()
    expect(await isBotServable(nonexistentBotSlug)).toBe(false)
  })
})
