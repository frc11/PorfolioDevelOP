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
import { LEGAL_TRANSITIONS } from './dossier-stage.ts'
import { cuerpoDeFuncion, objetoAsignadoA } from '../invariant-call-site.ts'

// ── 0. LA ARITY DEL LOOP-BACK (P8, caso 2) ───────────────────────────────────
// `esReloopRechazo` ya no codifica el destino: lo LEE de `LEGAL_TRANSITIONS`.
// Eso cierra la divergencia vieja (el grafo cambiaba y la copia seguía diciendo
// que sí), pero abre una que hay que vigilar acá: si RECHAZADA gana una SEGUNDA
// salida, el predicado la aceptaría sola y `transitionDossier` aplicaría el
// `RELOOP_RESET` —que borra el self-check— sobre una transición que nadie decidió
// que fuera un re-loop. Esta aserción obliga a decidirlo.
assert.deepEqual(
  [...LEGAL_TRANSITIONS.RECHAZADA],
  ['CONSTRUCCION'],
  'RECHAZADA dejó de tener UNA sola salida.\n' +
    '  `esReloopRechazo` lee `LEGAL_TRANSITIONS.RECHAZADA`, así que toda salida nueva pasa a\n' +
    '  contar como re-loop y se lleva puesto el self-check del dossier (RELOOP_RESET).\n' +
    '  Si la salida nueva es a propósito: decidí acá si dispara el reset o no, en el MISMO\n' +
    '  commit. No borres esta aserción para seguir.',
)

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

// ── 5. P27 — LA COMPOSICIÓN REAL, NO LA DEL COMENTARIO ──────────────────────
// El encabezado dice que `transitionDossier` compone
//   data = { stage, ...ESCALADO_RESET, ...(esReloopRechazo ? RELOOP_RESET : {}) }
// y las aserciones 1-4 verifican las tres piezas por separado. El censo de P26
// nombró el hueco: «la composición real vive SÓLO en el comentario de cabecera:
// una transición que deje de spreadear la constante —o que nadie la importe—
// satisface igual sus claves». Un `RELOOP_RESET` perfecto que nadie aplica deja
// las cuatro aserciones verdes y el self-check del rechazo sobrevive al re-loop:
// el setter reenvía con los seis hard-checks en verde de la vuelta anterior, sin
// haber corregido nada. Que es exactamente el bug que B6.2 vino a matar.
const transitionDossier = cuerpoDeFuncion(
  ['src', 'lib', 'leados', 'dossier.ts'],
  'transitionDossier',
)
const dataCompuesta = objetoAsignadoA(
  transitionDossier,
  'data',
  'la composición de transitionDossier',
)

assert.match(
  dataCompuesta,
  /\.\.\.\(\s*esReloopRechazo\(from, input\.to\)\s*\?\s*RELOOP_RESET\s*:\s*\{\}\s*\)/,
  'la transición dejó de aplicar `RELOOP_RESET` gated por `esReloopRechazo`.\n' +
    `  data = ${dataCompuesta}\n` +
    '  Las aserciones 1-3 de arriba siguen verdes —`RELOOP_RESET` sigue limpiando sólo\n' +
    '  `selfCheckJson`, `esReloopRechazo` sigue marcando sólo RECHAZADA→CONSTRUCCION— pero\n' +
    '  nadie las usa. El self-check sobrevive al re-loop y el setter reenvía la demo con los\n' +
    '  hard-checks tildados de la vuelta que fue rechazada.\n' +
    '  El gate importa tanto como el spread: aplicarlo SIEMPRE borraría el self-check en\n' +
    '  CONSTRUCCION→EN_REVISION y el panel de revisión del admin lo daría por anomalía.',
)
assert.match(
  dataCompuesta,
  /\.\.\.ESCALADO_RESET/,
  'la transición dejó de spreadear `ESCALADO_RESET`.\n' +
    `  data = ${dataCompuesta}\n` +
    '  La aserción 4 prueba que esa constante NO lleva `selfCheckJson` (para que el\n' +
    '  self-check sobreviva a las transiciones normales); si el spread se va, lo que se\n' +
    '  pierde es lo otro: la marca «me trabé» sobrevive al cambio de stage y Franco ve un\n' +
    '  escalamiento vigente sobre una construcción que ya no existe.',
)
assert.match(
  dataCompuesta,
  /stage:\s*input\.to,/,
  'la composición de la transición dejó de setear `stage: input.to` — es LA puerta del ' +
    'stage; sin eso la transición valida el grafo y no mueve nada.',
)

console.log(
  '✓ invariante OK: el re-loop RECHAZADA→CONSTRUCCION resetea el self-check ' +
    '(RELOOP_RESET → selfCheckJson=DbNull) y PRESERVA progresoJson + draftUrl; es el ' +
    'único loop-back (esReloopRechazo) y el self-check NO se limpia en las demás ' +
    'transiciones (sobrevive a EN_REVISION para el admin).',
)
