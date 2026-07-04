/**
 * P3-A.2 — Invariante de la resolución de vista del módulo motor-resenas.
 * Corre SIN DB ni server:
 *
 *   npm run check:invariant:motor-resenas-view
 *   (o: npx tsx src/lib/modules/motor-resenas-view.invariant.ts)
 *
 * Verifica, de forma ejecutable, las garantías del sprint:
 *   1. TRES ESTADOS: la truth table módulo × conexión (2×3) completa.
 *   2. GATING: un cliente SIN el módulo JAMÁS llega a la vista operativa, sin
 *      importar el estado de conexión (locked gana a todo).
 *   3. HONESTIDAD: con módulo pero conexión no operativa → `connecting`, NUNCA
 *      `operational` (no se muestra la vista operativa vacía como si fuera real).
 *   4. COMPOSICIÓN: los combos crudos de campos persistidos pasados por
 *      `deriveConnectionStatus` (P3-A.1) → el cableado exacto de la página.
 *   5. DETERMINISMO: mismo input → mismo output.
 *
 * Nota anti-IDOR del upsell (documental, no testeable acá): el CTA del LockedView
 * llama `requestUpsellAction(slug, name)` SIN parámetro de org — la org la deriva
 * la action de la SESIÓN (`upsell.ts:14-20`). Garantía estructural pre-existente,
 * cubierta por el flujo de upsell + `dedup.invariant.ts`.
 *
 * Importa solo módulos puros (motor-resenas-view + gbp-connection-logic).
 */
import assert from 'node:assert/strict'
import {
  resolveMotorResenasView,
  type MotorResenasView,
} from './motor-resenas-view.ts'
import {
  deriveConnectionStatus,
  type ConnectionStatus,
} from '../integrations/gbp-connection-logic.ts'

const CONNECTIONS: ConnectionStatus[] = ['NOT_CONNECTED', 'CONNECTED_NO_LOCATION', 'OPERATIONAL']

// ── 1. Truth table 2×3 completa ───────────────────────────────────────────────
{
  const expected: Array<[boolean, ConnectionStatus, MotorResenasView]> = [
    [false, 'NOT_CONNECTED', 'locked'],
    [false, 'CONNECTED_NO_LOCATION', 'locked'],
    [false, 'OPERATIONAL', 'locked'],
    [true, 'NOT_CONNECTED', 'connecting'],
    [true, 'CONNECTED_NO_LOCATION', 'connecting'],
    [true, 'OPERATIONAL', 'operational'],
  ]
  for (const [moduleActive, connection, view] of expected) {
    assert.equal(
      resolveMotorResenasView({ moduleActive, connection }),
      view,
      `módulo ${moduleActive ? 'activo' : 'inactivo'} × ${connection} → ${view}`,
    )
  }
}

// ── 2. GATING: sin módulo, la conexión JAMÁS desbloquea la operativa ──────────
{
  for (const connection of CONNECTIONS) {
    const view = resolveMotorResenasView({ moduleActive: false, connection })
    assert.equal(view, 'locked', `sin módulo + ${connection} → locked (la conexión no desbloquea)`)
    assert.notEqual(
      view,
      'operational',
      `sin módulo + ${connection} NUNCA es operational (un cliente sin el módulo no accede a la vista operativa)`,
    )
  }
}

// ── 3. HONESTIDAD: comprado ≠ operativo (la conexión la hace develOP aparte) ──
{
  assert.equal(
    resolveMotorResenasView({ moduleActive: true, connection: 'NOT_CONNECTED' }),
    'connecting',
    'módulo activo + sin conectar → connecting (nunca la operativa vacía)',
  )
  assert.equal(
    resolveMotorResenasView({ moduleActive: true, connection: 'CONNECTED_NO_LOCATION' }),
    'connecting',
    'módulo activo + conectada sin location (0 o >1 sucursales) → connecting, misma verdad para el dueño',
  )
  // Solo OPERATIONAL abre la vista real.
  assert.equal(
    resolveMotorResenasView({ moduleActive: true, connection: 'OPERATIONAL' }),
    'operational',
    'módulo activo + OPERATIONAL → vista operativa',
  )
}

// ── 4. COMPOSICIÓN end-to-end: campos crudos → deriveConnectionStatus → view ──
// Clava el cableado exacto de page.tsx: los 8 combos de
// moduleActive × gbpConnectedAt(null/set) × gbpLocationId(null/set).
{
  const AT = new Date('2026-07-04T12:00:00.000Z')
  const LOC = 'accounts/A/locations/L'
  const compose = (moduleActive: boolean, gbpConnectedAt: Date | null, gbpLocationId: string | null) =>
    resolveMotorResenasView({
      moduleActive,
      connection: deriveConnectionStatus({ gbpConnectedAt, gbpLocationId }),
    })

  // Sin módulo: locked en los 4 combos de conexión cruda.
  assert.equal(compose(false, null, null), 'locked', 'crudo: sin módulo + nada → locked')
  assert.equal(compose(false, null, LOC), 'locked', 'crudo: sin módulo + location huérfana → locked')
  assert.equal(compose(false, AT, null), 'locked', 'crudo: sin módulo + conectada sin location → locked')
  assert.equal(compose(false, AT, LOC), 'locked', 'crudo: sin módulo + operativa → locked (gating comercial)')

  // Con módulo: solo connectedAt + location = operativa.
  assert.equal(compose(true, null, null), 'connecting', 'crudo: módulo + NOT_CONNECTED → connecting')
  assert.equal(
    compose(true, null, LOC),
    'connecting',
    'crudo: módulo + location sin connectedAt → NOT_CONNECTED → connecting (deriveConnectionStatus manda)',
  )
  assert.equal(compose(true, AT, null), 'connecting', 'crudo: módulo + CONNECTED_NO_LOCATION → connecting')
  assert.equal(compose(true, AT, LOC), 'operational', 'crudo: módulo + conectada con location → operational')
}

// ── 5. DETERMINISMO ───────────────────────────────────────────────────────────
{
  for (const moduleActive of [true, false]) {
    for (const connection of CONNECTIONS) {
      const a = resolveMotorResenasView({ moduleActive, connection })
      const b = resolveMotorResenasView({ moduleActive, connection })
      assert.equal(a, b, `determinista: ${moduleActive} × ${connection}`)
    }
  }
}

console.log(
  '✓ motor-resenas-view invariants OK: truth table módulo × conexión (2×3), gating ' +
    '(sin módulo jamás operativa), honestidad (comprado ≠ operativo → connecting), ' +
    'composición con deriveConnectionStatus (P3-A.1) y determinismo.',
)
