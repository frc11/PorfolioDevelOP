/**
 * Chequeo de invariante del RE-LOOP RECHAZADA→CONSTRUCCION (Sprint B6.2) —
 * corre sin DB.
 *
 *   npm run check:invariant:reloop-selfcheck
 *
 * Fija, de forma ejecutable, la decisión del re-loop: al reabrir un rechazo se
 * RESETEA el self-check (que es un GATE) y se PRESERVA el resto del progreso
 * (checklist de fases + draft). El self-check confunde si sobrevive —un setter
 * reenviaría con los 6 hard-checks en verde de la vuelta anterior, sin corregir
 * nada—; el checklist de fases ayuda, así que se mantiene.
 *
 * Verifica las tres piezas puras que `transitionDossier` compone
 *   data = { stage, ...ESCALADO_RESET, ...(esReloopRechazo ? RELOOP_RESET : {}) }
 * (la composición end-to-end contra la DB la prueba `tests/leados/dossier-gates`):
 *
 *   1. `esReloopRechazo` marca EXACTAMENTE el único loop-back (RECHAZADA→CONSTRUCCION)
 *      y ninguna otra transición — en particular NO CONSTRUCCION→EN_REVISION.
 *   2. `RELOOP_RESET` limpia SOLO `selfCheckJson` (→ Prisma.DbNull): no toca
 *      `progresoJson` ni `draftUrl` (preservados) ni `stage` (no es una transición).
 *   3. ANTI-REGRESIÓN: `selfCheckJson` NO está en `ESCALADO_RESET` (que corre en
 *      CADA transición). Si estuviera, CONSTRUCCION→EN_REVISION borraría el
 *      self-check y el panel de revisión del admin (`SelfCheckPanel`, exigible en
 *      EN_REVISION/APROBADA) lo daría por anomalía en cada revisión normal.
 *
 * Importa `escalamiento.ts` directo (relativo, con `.ts`): árbol de runtime
 * `@/`-free y cero Neon (Prisma.DbNull es un sentinel, no instancia el cliente).
 * Mismo patrón que `escalamiento.invariant.ts` / `self-check-gate.invariant.ts`.
 */
import assert from 'node:assert/strict'
import { Prisma } from '@prisma/client'
import { ESCALADO_RESET, RELOOP_RESET, esReloopRechazo } from './escalamiento.ts'

// ── 1. esReloopRechazo: el re-loop es el ÚNICO loop-back que dispara el reset ──
assert.equal(
  esReloopRechazo('RECHAZADA', 'CONSTRUCCION'),
  true,
  'RECHAZADA→CONSTRUCCION ES el re-loop (dispara el reset del self-check)',
)
// Ninguna otra transición cuenta como re-loop:
assert.equal(
  esReloopRechazo('BRIEF', 'CONSTRUCCION'),
  false,
  'BRIEF→CONSTRUCCION (primer build) no es re-loop — el self-check ya es null ahí',
)
assert.equal(
  esReloopRechazo('CONSTRUCCION', 'EN_REVISION'),
  false,
  'CONSTRUCCION→EN_REVISION no es re-loop — el self-check DEBE sobrevivir para el admin',
)
assert.equal(esReloopRechazo('EN_REVISION', 'RECHAZADA'), false)
assert.equal(esReloopRechazo('EN_REVISION', 'APROBADA'), false)
assert.equal(esReloopRechazo('CONSTRUCCION', 'CONSTRUCCION'), false)

// ── 2. RELOOP_RESET limpia el self-check (GATE) → selfCheckAprobado vuelve a false
// selfCheckJson se setea a Prisma.DbNull (SQL NULL): al releer, parseSelfCheck da
// null y selfCheckAprobado(null) === false. `null` literal no compila para Json?.
assert.strictEqual(
  RELOOP_RESET.selfCheckJson,
  Prisma.DbNull,
  'el re-loop limpia selfCheckJson con Prisma.DbNull (no `null` literal)',
)

// ── 3. RELOOP_RESET PRESERVA fases + draft, y NO es una transición por sí ──────
// La ausencia de la clave es la garantía: lo que RELOOP_RESET no menciona, el
// updateMany no lo toca. progresoJson (checklist) y draftUrl (la demo) sobreviven.
assert.deepEqual(
  Object.keys(RELOOP_RESET),
  ['selfCheckJson'],
  'RELOOP_RESET toca SOLO selfCheckJson',
)
for (const preservado of ['progresoJson', 'draftUrl', 'stage'] as const) {
  assert.ok(
    !Object.prototype.hasOwnProperty.call(RELOOP_RESET, preservado),
    `el re-loop no toca ${preservado} — preserva fases + draft y no transiciona por sí solo`,
  )
}

// ── 4. ANTI-REGRESIÓN: el self-check NO se limpia en CADA transición ───────────
// ESCALADO_RESET corre en toda transición (dossier.ts). Si llevara selfCheckJson,
// CONSTRUCCION→EN_REVISION lo borraría y el admin vería "llegó a revisión sin
// self-check" (SelfCheckPanel exigible) en cada revisión legítima. Debe quedar
// EXACTAMENTE en {escaladoAt, escaladoNota} (espejo de escalamiento.invariant.ts).
assert.ok(
  !Object.prototype.hasOwnProperty.call(ESCALADO_RESET, 'selfCheckJson'),
  'el self-check NO está en ESCALADO_RESET: sobrevive a las transiciones que no son el re-loop',
)
assert.deepEqual(
  ESCALADO_RESET,
  { escaladoAt: null, escaladoNota: null },
  'ESCALADO_RESET no cambió: sigue siendo solo la marca de escalamiento',
)

console.log(
  '✓ invariante OK: el re-loop RECHAZADA→CONSTRUCCION resetea el self-check ' +
    '(RELOOP_RESET → selfCheckJson=DbNull) y PRESERVA progresoJson + draftUrl; es el ' +
    'único loop-back (esReloopRechazo) y el self-check NO se limpia en las demás ' +
    'transiciones (sobrevive a EN_REVISION para el admin).',
)
