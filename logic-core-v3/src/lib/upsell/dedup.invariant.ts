/**
 * P5.2 — Invariante del dedup de solicitudes de upsell. Corre SIN DB ni server:
 *
 *   npm run check:invariant:upsell-dedup
 *   (o: npx tsx src/lib/upsell/dedup.invariant.ts)
 *
 * Verifica que clicks repetidos del mismo cliente sobre el mismo módulo NO generen
 * ContactSubmissions duplicados dentro de la ventana, sin romper el flujo legítimo:
 *   1. Primera solicitud (sin previa) → crea.
 *   2. Click repetido DENTRO de la ventana → no crea (idempotente).
 *   3. Interés renovado FUERA de la ventana → crea de nuevo (lead nuevo legítimo).
 *   4. Simulación de 5 rage-clicks → una sola creación.
 *
 * Función pura sobre (última fecha, now, ventana): no lee reloj ni DB, y no recibe
 * ninguna señal de tenant (no puede filtrar datos entre orgs).
 */
import assert from 'node:assert/strict'
import { shouldCreateUpsellSubmission, UPSELL_DEDUP_WINDOW_MS } from './dedup.ts'

const now = new Date('2026-06-30T12:00:00Z')
const within = (ms: number) => new Date(now.getTime() - ms)

// ── 1. Primera solicitud: no hay previa → crea ───────────────────────────────
assert.equal(shouldCreateUpsellSubmission(null, now), true, 'sin solicitud previa → crea (primera vez)')
assert.equal(shouldCreateUpsellSubmission(undefined, now), true, 'undefined se trata como sin previa → crea')

// ── 2. Dentro de la ventana → no crea (idempotente) ──────────────────────────
assert.equal(shouldCreateUpsellSubmission(now, now), false, 'misma marca de tiempo → duplicado, no crea')
assert.equal(shouldCreateUpsellSubmission(within(1000), now), false, 'hace 1s → dentro de ventana, no crea')
assert.equal(
  shouldCreateUpsellSubmission(within(UPSELL_DEDUP_WINDOW_MS - 1), now),
  false,
  'justo por debajo de la ventana → no crea',
)

// ── 3. En/fuera del borde de la ventana → crea (interés renovado) ────────────
assert.equal(
  shouldCreateUpsellSubmission(within(UPSELL_DEDUP_WINDOW_MS), now),
  true,
  'exactamente en la ventana → crea (>= es lead nuevo)',
)
assert.equal(
  shouldCreateUpsellSubmission(within(UPSELL_DEDUP_WINDOW_MS + 60_000), now),
  true,
  'pasada la ventana → crea de nuevo (no silencia interés renovado)',
)

// ── 4. Rage-click: 5 clicks seguidos → una sola creación ─────────────────────
{
  // Simula el estado de la DB: la primera solicitud sí crea; a partir de ahí, la
  // "última creada" queda fijada y los siguientes clicks caen dentro de la ventana.
  let lastCreatedAt: Date | null = null
  let created = 0
  for (let i = 0; i < 5; i += 1) {
    const clickAt = new Date(now.getTime() + i * 1500) // 5 clicks en ~6s
    if (shouldCreateUpsellSubmission(lastCreatedAt, clickAt)) {
      created += 1
      lastCreatedAt = clickAt
    }
  }
  assert.equal(created, 1, '5 clicks seguidos → 1 solo ContactSubmission (antes eran 5)')
}

// ── 5. Ventana configurable: 0 ms desactiva el dedup (borde) ─────────────────
assert.equal(shouldCreateUpsellSubmission(now, now, 0), true, 'ventana 0 → siempre crea (dedup off)')

console.log(
  '✓ upsell-dedup invariants OK: primera solicitud crea, rage-click dentro de ventana no ' +
    'duplica, interés renovado fuera de ventana vuelve a crear.',
)
