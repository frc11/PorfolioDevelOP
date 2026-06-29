/**
 * EV.1 — Batería de invariantes del módulo verticals.
 *
 *   npx ts-node src/modules/chatbot/server/verticals/__tests__/ev1.invariant.ts
 *   npm run test:ev1
 *
 * Cero DB, cero network, cero side effects. Pura verificación de tipos
 * y comportamiento del registry y el validador de scoring.
 */

import assert from 'node:assert/strict'
import { getVerticalPack, listVerticalPacks } from '../registry'
import { validatePackScoring } from '../types'
import { BASE_PACK } from '../packs/base'

// ─── 1. Lookup feliz ──────────────────────────────────────────────────────────

const basePack = getVerticalPack('base')
assert.strictEqual(basePack.key, 'base', 'lookup "base" debe devolver el pack base')
assert.ok(typeof basePack.displayName === 'string', 'displayName debe ser string')
assert.ok(basePack.scoring.signals.length > 0, 'base pack debe tener al menos una señal')

// ─── 2. Fallback ante clave desconocida (con warning) ────────────────────────

let warningFired = false
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  if (args.some((a) => String(a).includes('verticals'))) warningFired = true
}

const fallbackPack = getVerticalPack('_vertical_inexistente_xyz')

console.warn = originalWarn

assert.strictEqual(
  fallbackPack.key,
  'base',
  'clave desconocida debe devolver el pack base como fallback',
)
assert.ok(warningFired, 'fallback debe emitir console.warn con "[verticals]"')

// ─── 3. Invariante de escala 0–100 del pack `base` ───────────────────────────

const validation = validatePackScoring(BASE_PACK.scoring)
assert.ok(
  validation.valid,
  `base pack scoring invariante fallida: ${validation.errors.join(', ')}`,
)

// Verificar puntos individuales (cero negativos en señales)
for (const signal of BASE_PACK.scoring.signals) {
  assert.ok(signal.points >= 0, `señal "${signal.key}" tiene puntos negativos`)
}

// Verificar que ningún combo tenga puntos negativos (base no tiene, pero el
// validador genérico debe cubrirlo si alguien lo modifica)
for (const combo of BASE_PACK.scoring.combos) {
  assert.ok(combo.points >= 0, `combo "${combo.key}" tiene puntos negativos`)
}

// Verificar suma máxima ≤ 100
const maxSignals = BASE_PACK.scoring.signals.reduce((sum, s) => sum + s.points, 0)
const maxCombos = BASE_PACK.scoring.combos.reduce((sum, c) => sum + c.points, 0)
assert.ok(
  maxSignals + maxCombos <= 100,
  `score máximo del base pack (${maxSignals + maxCombos}) excede 100`,
)

// Verificar thresholds en rango
const { caliente, tibio } = BASE_PACK.scoring.thresholds
assert.ok(caliente <= 100, `threshold caliente (${caliente}) excede 100`)
assert.ok(tibio >= 0, `threshold tibio (${tibio}) es negativo`)
assert.ok(caliente > tibio, `caliente (${caliente}) debe ser > tibio (${tibio})`)

// ─── 4. listVerticalPacks devuelve packs válidos según el contrato ────────────

const packs = listVerticalPacks()
assert.ok(packs.length > 0, 'listVerticalPacks debe devolver al menos un pack')

for (const pack of packs) {
  assert.ok(typeof pack.key === 'string' && pack.key.length > 0, 'pack.key debe ser string no vacío')
  assert.ok(typeof pack.displayName === 'string' && pack.displayName.length > 0, 'pack.displayName debe ser string no vacío')
  assert.ok(Array.isArray(pack.scoring.signals), 'pack.scoring.signals debe ser array')
  assert.ok(Array.isArray(pack.scoring.combos), 'pack.scoring.combos debe ser array')
  assert.ok(Array.isArray(pack.scoring.penalties), 'pack.scoring.penalties debe ser array')
  assert.ok(Array.isArray(pack.intents), 'pack.intents debe ser array')
  assert.ok(Array.isArray(pack.widgetCopy.welcomeMessages), 'widgetCopy.welcomeMessages debe ser array')
  assert.ok(pack.widgetCopy.welcomeMessages.length > 0, 'widgetCopy.welcomeMessages no puede estar vacío')
  assert.ok(Array.isArray(pack.widgetCopy.botNameSuggestions), 'widgetCopy.botNameSuggestions debe ser array')
  assert.ok(pack.widgetCopy.botNameSuggestions.length > 0, 'widgetCopy.botNameSuggestions no puede estar vacío')

  const v = validatePackScoring(pack.scoring)
  assert.ok(v.valid, `pack "${pack.key}" scoring invariante fallida: ${v.errors.join(', ')}`)
}

// ─── Reporte ──────────────────────────────────────────────────────────────────

console.log(
  `[EV.1 invariant] ✓ Todas las aserciones pasaron. ` +
  `Packs registrados: ${packs.length}. ` +
  `Base pack señales: ${BASE_PACK.scoring.signals.length}, ` +
  `score máx: ${maxSignals + maxCombos}/100.`,
)
