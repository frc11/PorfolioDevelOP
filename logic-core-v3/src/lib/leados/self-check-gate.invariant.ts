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
import { SelfCheckSchema, type SelfCheck } from './contracts.ts'

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


// ── 6. CENSO CONGELADO de la lista: la única aserción que ve el drift ────────
// Todo lo de arriba DERIVA sus fixtures de `HARD_CHECKS` en vivo. Eso prueba la
// lógica de `selfCheckAprobado` —que es correcta— pero es ciego a que la lista
// cambie: si crece, el fixture crece con ella; si un `nombre` se renombra, el
// fixture se renombra solo. C0 lo midió: un hard-check inventado MÁS un renombre
// pasaron con la suite entera en verde.
//
// Este censo está escrito A MANO y es la única fuente independiente que existe.
// Por eso es la única que puede fallar. Si la lista cambia a propósito, se
// actualiza acá EN EL MISMO COMMIT: que cueste un renglón es el punto.
const CENSO_CONGELADO: readonly { id: string; nombre: string }[] = [
  { id: 'carga', nombre: 'La demo carga' },
  { id: 'mobile', nombre: 'Se ve bien en tu celular' },
  { id: 'sinRelleno', nombre: 'No hay lorem ipsum ni textos de relleno' },
  { id: 'linksWhatsapp', nombre: 'Los links y el botón de WhatsApp funcionan' },
  { id: 'ctaClaro', nombre: 'Se entiende qué tiene que hacer el visitante' },
  { id: 'datosReales', nombre: 'Usa los datos y assets reales del negocio' },
  { id: 'fielAlBrief', nombre: 'La demo dice lo que el brief pedía' },
  { id: 'noPareceIa', nombre: 'No se nota que la hizo una IA' },
  { id: 'textoDelNegocio', nombre: 'El texto es de este negocio y de ningún otro' },
  { id: 'tonoDelNegocio', nombre: 'Suena como habla el negocio' },
]

assert.deepEqual(
  HARD_CHECKS.map((check) => ({ id: check.id, nombre: check.nombre })),
  CENSO_CONGELADO.map((check) => ({ id: check.id, nombre: check.nombre })),
  'HARD_CHECKS divergió del censo congelado de este invariante: se agregó, se borró, se ' +
    'renombró o se reordenó un hard-check. Si el cambio es a propósito, actualizá ' +
    'CENSO_CONGELADO en este mismo commit — y leé la aserción 7 antes, porque un renombre ' +
    'además desaprueba todo lo que los setters ya tienen guardado.',
)

// ── 7. UN SELF-CHECK GUARDADO AYER TIENE QUE SEGUIR APROBANDO ───────────────
// El gate une el blob guardado con la lista vigente por `item.nombre ===
// check.nombre` (flow.ts:207), o sea POR EL TEXTO VISIBLE. `HardCheck` tiene
// `id`, pero el blob NO lo guarda: `SelfCheckSchema.itemsDuros` es `{ nombre, ok }`
// (contracts.ts:125) y `buildSelfCheck` escribe solo el nombre (flow.ts:188). El
// formulario re-encuentra el tilde por el mismo texto (chequeo-form.tsx:51).
//
// Consecuencia medida en C0: una corrección de redacción —una coma, una tilde—
// desaprueba TODOS los self-checks ya guardados y traba el envío a revisión sin
// ningún error visible. Un blob de 10/10 pasa a `false` y el setter no ve por qué.
//
// Este blob está congelado a mano: son los diez nombres tal como se guardaron.
// Mientras esta aserción esté verde, lo guardado sigue valiendo. Cuando se ponga
// en rojo, el renombre es real y hay que decidir qué pasa con lo ya guardado —
// que es exactamente lo que hoy se decidiría sin enterarse.
const BLOB_GUARDADO_AYER: SelfCheck = {
  itemsDuros: [
    { nombre: 'La demo carga', ok: true },
    { nombre: 'Se ve bien en tu celular', ok: true },
    { nombre: 'No hay lorem ipsum ni textos de relleno', ok: true },
    { nombre: 'Los links y el botón de WhatsApp funcionan', ok: true },
    { nombre: 'Se entiende qué tiene que hacer el visitante', ok: true },
    { nombre: 'Usa los datos y assets reales del negocio', ok: true },
    { nombre: 'La demo dice lo que el brief pedía', ok: true },
    { nombre: 'No se nota que la hizo una IA', ok: true },
    { nombre: 'El texto es de este negocio y de ningún otro', ok: true },
    { nombre: 'Suena como habla el negocio', ok: true },
  ],
  softFlags: [],
}

assert.ok(
  SelfCheckSchema.safeParse(BLOB_GUARDADO_AYER).success,
  'el blob congelado tiene que ser un SelfCheck válido: si no parsea, la aserción de abajo ' +
    'estaría probando otra cosa',
)

assert.equal(
  selfCheckAprobado(BLOB_GUARDADO_AYER),
  true,
  'un self-check guardado con los nombres vigentes DEJÓ DE APROBAR. Se renombró o se agregó ' +
    'un hard-check y todos los self-checks ya guardados quedaron desaprobados en silencio: el ' +
    'setter ve el envío a revisión trabado sin ningún error. El vínculo blob↔lista es por ' +
    '`nombre` (texto visible), no por `id` — el blob no guarda el id.',
)

// ── 8. `nombre` es LLAVE, así que no puede repetirse ────────────────────────
// Dos hard-checks con el mismo `nombre` harían que un solo tilde apruebe los dos.
assert.equal(
  new Set(HARD_CHECKS.map((check) => check.nombre)).size,
  HARD_CHECKS.length,
  'dos hard-blocks comparten el `nombre`: un solo tilde guardado aprobaría los dos (el gate ' +
    'matchea por nombre)',
)
assert.equal(
  new Set(HARD_CHECKS.map((check) => check.id)).size,
  HARD_CHECKS.length,
  'dos hard-blocks comparten el `id`: `buildSelfCheck` lee `duros[check.id]` y el formulario ' +
    'escribiría los dos con el mismo tilde',
)
console.log(
  '✓ invariante OK: selfCheckAprobado exige TODOS los hard-blocks VIGENTES (HARD_CHECKS) en ' +
    'verde — valida contra la lista, no contra lo que el blob afirme; cada hard es dealbreaker ' +
    'y un hard faltante no aprueba (dientes ante el drift de FG-2). Y el censo congelado ' +
    'de los diez hard-checks más un blob guardado a mano atan la LISTA: agregar, borrar o ' +
    'renombrar uno se cae acá en vez de desaprobar en silencio todo lo ya guardado.',
)
