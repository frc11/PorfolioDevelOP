/**
 * Chequeo de invariante del GATE DE SELF-CHECK (Sprint 5.3) — corre sin DB.
 *
 *   npm run check:invariant:self-check
 *
 * Cierra el hueco de gates en la capa invariante: verifica, de forma ejecutable,
 * que `selfCheckAprobado` valida contra la lista VIGENTE `HARD_CHECKS`, NO contra
 * lo que el blob diga tener. Es la propiedad "con dientes" del gate de envío a
 * revisión (CONSTRUCCION→EN_REVISION), la MISMA función que re-valida
 * `enviarARevision` server-side:
 *
 *     selfCheckAprobado(sc)  ⇔  TODO hard-block vigente aparece en sc.itemsDuros con ok:true
 *
 * Los nombres/ids de los hard-checks dependen de Construcción (FG-2 puede
 * cambiarlos): por eso los fixtures se DERIVAN de `HARD_CHECKS` en vivo, sin
 * acoplarse a etiquetas concretas. El negativo fino de e2e
 * (`tests/leados/selfcheck-anti-bypass.spec.ts`) prueba el anti-bypass contra la
 * DB real; acá se fija la lógica del gate, barata y sin Neon.
 *
 * Importa `flow.ts`/`contracts.ts` directo (relativo, con `.ts`): árbol de
 * runtime `@/`-free, mismo patrón que `flow.invariant.ts`.
 */
import assert from 'node:assert/strict'
import { selfCheckAprobado, HARD_CHECKS } from './flow.ts'
import type { SelfCheck } from './contracts.ts'

/** Blob "todo en verde" derivado de la lista VIGENTE (sin hardcodear nombres). */
function selfCheckTodoOk(): SelfCheck {
  return {
    itemsDuros: HARD_CHECKS.map((check) => ({ nombre: check.nombre, ok: true })),
    softFlags: [],
  }
}

// Sanidad: la lista tiene hard-blocks (si quedara vacía, el gate sería vacuo).
assert.ok(HARD_CHECKS.length > 0, 'HARD_CHECKS no está vacía — el gate tiene dientes')

// ── 1. Sin self-check (null) → NO aprobado (ausencia no es aprobación) ───────
assert.equal(selfCheckAprobado(null), false, 'un dossier sin self-check no aprueba el envío a revisión')

// ── 2. Todos los hard-blocks vigentes en verde → aprobado ────────────────────
assert.equal(selfCheckAprobado(selfCheckTodoOk()), true, 'todos los hard-blocks en verde aprueba')

// ── 3. CADA hard-block es NECESARIO: uno solo en falso → NO aprobado ─────────
for (let i = 0; i < HARD_CHECKS.length; i++) {
  const conUnoRojo: SelfCheck = {
    itemsDuros: HARD_CHECKS.map((check, idx) => ({ nombre: check.nombre, ok: idx !== i })),
    softFlags: [],
  }
  assert.equal(
    selfCheckAprobado(conUnoRojo),
    false,
    `con "${HARD_CHECKS[i].nombre}" en falso el gate NO aprueba (cada hard-block es dealbreaker)`,
  )
}

// ── 4. Valida contra HARD_CHECKS, NO contra lo que el blob afirme ────────────
// 4a. Un blob que "aprueba" ítems INVENTADos (que no son hard-blocks vigentes)
//     NO alcanza: falta la cobertura de los hards reales → NO aprobado.
const soloInventados: SelfCheck = {
  itemsDuros: [
    { nombre: 'Todo perfecto (ítem inventado por el cliente)', ok: true },
    { nombre: 'Otro relleno hostil', ok: true },
  ],
  softFlags: [],
}
assert.equal(
  selfCheckAprobado(soloInventados),
  false,
  'ítems inventados en verde NO aprueban: el gate exige los hard-blocks VIGENTES, no lo que el blob diga',
)

// 4b. Un hard vigente FALTANTE cuenta como NO verificado, aunque el resto esté
//     en verde. Modela el drift de FG-2: si la lista creció, un self-check viejo
//     (que no cubre el hard nuevo) deja de aprobar y el setter lo repasa.
if (HARD_CHECKS.length > 1) {
  const faltaElUltimo: SelfCheck = {
    itemsDuros: HARD_CHECKS.slice(0, -1).map((check) => ({ nombre: check.nombre, ok: true })),
    softFlags: [],
  }
  assert.equal(
    selfCheckAprobado(faltaElUltimo),
    false,
    'falta un hard-block vigente (aunque el resto esté en verde) → NO aprueba (dientes ante drift de la lista)',
  )
}

// ── 5. Ruido inocuo: extras/soft-flags no rompen un self-check por lo demás OK ─
const conExtras: SelfCheck = {
  itemsDuros: [
    ...HARD_CHECKS.map((check) => ({ nombre: check.nombre, ok: true })),
    { nombre: 'Ítem extra que no es hard-block', ok: false },
  ],
  softFlags: ['Tiene más de 3 colores'],
}
assert.equal(
  selfCheckAprobado(conExtras),
  true,
  'un ítem extra en rojo y soft-flags no bloquean si TODOS los hard-blocks vigentes están en verde',
)

console.log(
  '✓ invariante OK: selfCheckAprobado exige TODOS los hard-blocks VIGENTES (HARD_CHECKS) en ' +
    'verde — valida contra la lista, no contra lo que el blob afirme; cada hard es dealbreaker ' +
    'y un hard faltante no aprueba (dientes ante el drift de FG-2).',
)
