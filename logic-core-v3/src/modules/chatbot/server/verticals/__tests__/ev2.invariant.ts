/**
 * EV.2 — Invariante de aislamiento multi-tenant de packs verticales.
 *
 *   npx ts-node src/modules/chatbot/server/verticals/__tests__/ev2.invariant.ts
 *
 * Cero DB, cero network. Verifica que la resolución de pack de un bot
 * derive EXCLUSIVAMENTE de su propia clave de BotConfig.verticalPack:
 * dos bots con packs distintos resuelven el suyo y jamás se contaminan.
 */

import assert from 'node:assert/strict'
import { getVerticalPack } from '../registry'

// Simula dos BotConfigs con packs distintos (sin DB — solo las claves)
const botA = { botConfigId: 'bot-agencia-id', verticalPack: 'agencia' }
const botB = { botConfigId: 'bot-usados-id', verticalPack: 'usados' }
const botC = { botConfigId: 'bot-base-id', verticalPack: 'base' }

// ─── 1. Cada bot resuelve su propio pack ──────────────────────────────────────

const packA = getVerticalPack(botA.verticalPack)
const packB = getVerticalPack(botB.verticalPack)
const packC = getVerticalPack(botC.verticalPack)

// EV.3: `usados` ya es un pack REAL (key 'usados'). `agencia` sigue siendo
// placeholder → resuelve a 'base' hasta EV.4. El invariante es que la RESOLUCIÓN
// depende de la clave del propio bot, no del vecino.
assert.strictEqual(
  packA.key,
  'base', // agencia → BASE_PACK como placeholder hasta EV.4
  'bot agencia resuelve su pack (base placeholder hasta EV.4)',
)
assert.strictEqual(
  packB.key,
  'usados', // EV.3: usados es pack real
  'bot usados resuelve su pack real',
)
assert.strictEqual(packC.key, 'base', 'bot base resuelve base')

// ─── 2. Aislamiento: una clave no contamina la otra ───────────────────────────

// El invariante real es que getVerticalPack(keyA) resuelve el pack de keyA
// sin contaminarse con keyB. EV.3: usados ya difiere de agencia/base.
assert.doesNotThrow(
  () => getVerticalPack(botA.verticalPack),
  'resolución del pack de botA no debe lanzar',
)
assert.doesNotThrow(
  () => getVerticalPack(botB.verticalPack),
  'resolución del pack de botB no debe lanzar',
)

// ─── 3. botConfigId no se mezcla — cada bot resuelve con su propia clave ──────

function resolvePackForBot(bot: { botConfigId: string; verticalPack: string }) {
  return getVerticalPack(bot.verticalPack)
}

const resolvedA = resolvePackForBot(botA)
const resolvedB = resolvePackForBot(botB)
const resolvedC = resolvePackForBot(botC)

// Verificar que la función recibe SOLO la clave del bot y no mezcla IDs
assert.ok(
  typeof resolvedA.key === 'string' && resolvedA.key.length > 0,
  'pack de botA tiene key válida',
)
assert.ok(
  typeof resolvedB.key === 'string' && resolvedB.key.length > 0,
  'pack de botB tiene key válida',
)
assert.ok(
  typeof resolvedC.key === 'string' && resolvedC.key.length > 0,
  'pack de botC tiene key válida',
)

// Doble negativo: cambiar la clave de botA NO afecta a botB. Con packs reales
// (EV.3) esto es no-contaminación genuina: botB sigue resolviendo 'usados'
// aunque botA cambie, y ambos quedan distintos.
const botAModificado = { ...botA, verticalPack: 'base' }
const packAModificado = resolvePackForBot(botAModificado)
const packBUnchanged = resolvePackForBot(botB)

assert.strictEqual(packAModificado.key, 'base', 'botA cambiado a base resuelve base')
assert.strictEqual(packBUnchanged.key, 'usados', 'botB sigue resolviendo su propio pack usados')
assert.notStrictEqual(
  packAModificado.key,
  packBUnchanged.key,
  'cambiar el pack de botA no contamina la resolución de botB (packs distintos)',
)

// ─── 4. Clave desconocida en botConfig → fallback a base, no lanza ────────────

let warnFired = false
const original = console.warn
console.warn = (...args: unknown[]) => {
  if (args.some((a) => String(a).includes('verticals'))) warnFired = true
}

const botDesconocido = { botConfigId: 'bot-unknown-id', verticalPack: '_pack_no_existe_ev2' }
const packDesconocido = resolvePackForBot(botDesconocido)

console.warn = original

assert.strictEqual(
  packDesconocido.key,
  'base',
  'verticalPack desconocido en un BotConfig debe caer a base sin lanzar',
)
assert.ok(
  warnFired,
  'fallback de clave desconocida debe emitir warning con "[verticals]"',
)

// ─── Reporte ──────────────────────────────────────────────────────────────────

console.log(
  '[EV.2 invariant] ✓ Todas las aserciones de aislamiento multi-tenant pasaron. ' +
  'Bots probados: botA(agencia→base), botB(usados→pack real EV.3), botC(base), botDesconocido. ' +
  'Nota: agencia sigue placeholder (base) hasta EV.4.',
)
