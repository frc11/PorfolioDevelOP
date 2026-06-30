/**
 * Invariante ejecutable de las reglas de estado de leads (P1.B) — corre sin DB.
 *
 *   npm run check:invariant:lead-status
 *
 * Verifica las garantías del sprint sobre funciones PURAS (las mismas que
 * consume el server action `updateLeadStatus`), sin tocar Neon ni la sesión:
 *
 *   1. MAPEO acción de dueño → estado del enum (Lo contacté/Vendido/No avanzó).
 *   2. SELLADO de firstContactedAt: solo la PRIMERA vez; taps repetidos no lo
 *      pisan; "deshacer" (volver a NEW) lo preserva; vender sin contactar antes
 *      igual lo sella.
 *   3. ANTI-IDOR: el gate de pertenencia rechaza cross-org y sesiones sin org.
 *
 * Importa solo el módulo puro `lead-status-rules` (que solo usa `import type` de
 * Prisma → cero runtime de Prisma en el grafo). Mismo criterio liviano que los
 * otros invariants del repo.
 */
import assert from 'node:assert/strict'
import type { ChatbotLeadStatus } from '@prisma/client'
import {
  OWNER_ACTION_STATUS,
  statusImpliesContact,
  shouldSealFirstContact,
  leadBelongsToOrg,
} from './lead-status-rules.ts'

const ALL_STATUSES: ChatbotLeadStatus[] = ['NEW', 'CONTACTED', 'IN_NEGOTIATION', 'WON', 'LOST']

// ── 1. MAPEO acción de dueño → estado del enum ────────────────────────────────
{
  assert.equal(OWNER_ACTION_STATUS.contacted, 'CONTACTED', '"Lo contacté" → CONTACTED')
  assert.equal(OWNER_ACTION_STATUS.sold, 'WON', '"Vendido" → WON')
  assert.equal(OWNER_ACTION_STATUS.no_progress, 'LOST', '"No avanzó" → LOST')
  // Las tres apuntan a valores reales del enum (no a algo inventado).
  for (const status of Object.values(OWNER_ACTION_STATUS)) {
    assert.ok(ALL_STATUSES.includes(status), `${status} es un valor real del enum`)
  }
}

// ── 2. statusImpliesContact: NEW es el único "sin tocar" ──────────────────────
{
  assert.equal(statusImpliesContact('NEW'), false, 'NEW no implica contacto')
  for (const status of ALL_STATUSES.filter((s) => s !== 'NEW')) {
    assert.equal(statusImpliesContact(status), true, `${status} implica contacto`)
  }
}

// ── 3. SELLADO de firstContactedAt ────────────────────────────────────────────
{
  // 3a. Primera vez (firstContactedAt null) → sella en cualquier estado != NEW.
  for (const status of ALL_STATUSES.filter((s) => s !== 'NEW')) {
    assert.equal(shouldSealFirstContact(status, null), true, `sella al pasar a ${status} por primera vez`)
  }
  // 3b. NEW nunca sella (ni con null ni con fecha).
  assert.equal(shouldSealFirstContact('NEW', null), false, 'NEW con null no sella')

  // 3c. Si YA está sellado, NINGÚN estado lo vuelve a sellar (no se pisa el
  //     histórico). Cubre "taps repetidos no pisan" y "deshacer no resella".
  const sellado = new Date('2026-06-10T12:00:00.000Z')
  for (const status of ALL_STATUSES) {
    assert.equal(
      shouldSealFirstContact(status, sellado),
      false,
      `${status} con firstContactedAt ya seteado NO re-sella`,
    )
  }
}

// ── 4. CICLO DE VIDA end-to-end (modela el cómputo del data del action) ───────
// El action hace: data.firstContactedAt = sealAt SOLO si shouldSeal; nunca null.
{
  function applyTransition(
    state: { status: ChatbotLeadStatus; firstContactedAt: Date | null },
    next: ChatbotLeadStatus,
    now: Date,
  ): { status: ChatbotLeadStatus; firstContactedAt: Date | null } {
    const seal = shouldSealFirstContact(next, state.firstContactedAt)
    return {
      status: next,
      // Clave: si no sella, conserva el valor previo. JAMÁS escribe null.
      firstContactedAt: seal ? now : state.firstContactedAt,
    }
  }

  const T1 = new Date('2026-06-10T15:00:00.000Z')
  const T2 = new Date('2026-06-11T18:30:00.000Z')
  const T3 = new Date('2026-06-12T09:00:00.000Z')

  // Caso A — "Lo contacté" primero, luego "Vendido", luego "Deshacer".
  let s = { status: 'NEW' as ChatbotLeadStatus, firstContactedAt: null as Date | null }
  s = applyTransition(s, 'CONTACTED', T1)
  assert.equal(s.status, 'CONTACTED', 'A: pasó a CONTACTED')
  assert.deepEqual(s.firstContactedAt, T1, 'A: sella el primer contacto en T1')

  s = applyTransition(s, 'WON', T2)
  assert.equal(s.status, 'WON', 'A: pasó a WON')
  assert.deepEqual(s.firstContactedAt, T1, 'A: WON posterior NO pisa el primer contacto (sigue T1)')

  // Deshacer = volver al estado previo (NEW). El primer contacto se preserva.
  s = applyTransition(s, 'NEW', T3)
  assert.equal(s.status, 'NEW', 'A: deshacer volvió a NEW')
  assert.deepEqual(s.firstContactedAt, T1, 'A: deshacer NO borra el primer contacto (sigue T1)')

  // Caso B — "Vendido" directo, sin contactar antes: igual sella (vender implica
  // que hubo contacto).
  let b = { status: 'NEW' as ChatbotLeadStatus, firstContactedAt: null as Date | null }
  b = applyTransition(b, 'WON', T1)
  assert.equal(b.status, 'WON', 'B: venta directa')
  assert.deepEqual(b.firstContactedAt, T1, 'B: venta directa sella el primer contacto')

  // Caso C — "No avanzó" directo también sella.
  let c = { status: 'NEW' as ChatbotLeadStatus, firstContactedAt: null as Date | null }
  c = applyTransition(c, 'LOST', T1)
  assert.deepEqual(c.firstContactedAt, T1, 'C: "No avanzó" directo sella el primer contacto')
}

// ── 5. ANTI-IDOR: gate de pertenencia ─────────────────────────────────────────
{
  const ORG_A = 'org_a'
  const ORG_B = 'org_b'
  assert.equal(leadBelongsToOrg(ORG_A, ORG_A), true, 'misma org → opera')
  assert.equal(leadBelongsToOrg(ORG_B, ORG_A), false, 'lead de otra org → rechazado (cross-tenant cerrado)')
  assert.equal(leadBelongsToOrg(ORG_A, null), false, 'sesión sin org → rechazado')
  assert.equal(leadBelongsToOrg(null, ORG_A), false, 'lead sin org → rechazado')
  assert.equal(leadBelongsToOrg(null, null), false, 'ambos null → rechazado')
  assert.equal(leadBelongsToOrg(undefined, undefined), false, 'ambos undefined → rechazado')
}

console.log('✓ lead-status-rules invariants OK')
