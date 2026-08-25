/**
 * Chequeo de invariante del ESLABÓN pantalla↔fase de Construcción — corre sin DB.
 *
 *   npm run check:invariant:pantallas
 *
 * El eslabón que faltaba. `progreso-isolation.invariant.ts` ya ata
 * `SHELL_CONSTRUCCION ↔ FASE_IDS` (el contenido de las fases contra la llave del
 * progreso persistido). Nadie ataba `PANTALLAS_CONSTRUCCION ↔ FASE_IDS`: el
 * contrato era un comentario ("en el MISMO orden que FASE_IDS") sobre un
 * acoplamiento POSICIONAL, y romperlo no rompía el build — indexar una tupla con
 * un `number`, sin `noUncheckedIndexedAccess` en el tsconfig, devuelve la unión
 * de los tipos de sus elementos, nunca `undefined`. El fallo era en runtime y en
 * silencio: fases que dejan de marcarse, `actual = undefined`, y
 * `/manual/undefined` en loop de redirects.
 *
 * La tabla explícita `PANTALLA_DE_FASE` puso media garantía en el compilador:
 * `Record<FaseId, …>` hace que una fase SIN entrada no compile. Este invariante
 * cubre la otra media —la que el tipo no puede ver— y fija la relación completa:
 *
 *   1. toda fase de `FASE_IDS` tiene pantalla, y esa pantalla existe en el
 *      registro (`PANTALLAS`) declarada como pantalla de Construcción;
 *   2. ninguna pantalla de `PANTALLAS_CONSTRUCCION` queda SIN fase — una
 *      pantalla huérfana renderiza con los tres slots vacíos (el árbol de la
 *      página despacha por la inversa) y el tipo no la ve;
 *   3. la inversa es exacta: la unión de las fases de todas las pantallas es
 *      `FASE_IDS`, sin duplicados ni sobrantes;
 *   4. la derivación no se rompe al agrupar: una pantalla figura completada
 *      SÓLO cuando todas sus fases están tildadas, y `actual` nunca es
 *      `undefined` para ningún subconjunto del checklist.
 *
 * La lista de fases (`FASE_IDS`) es la llave del progreso persistido: reagrupar
 * pantallas NO la toca. Este invariante es la prueba ejecutable de eso.
 *
 * Importa los módulos puros directo (relativo, sin `@/`): su árbol de runtime
 * quedó `@/`-free a propósito, así que el harness ts-node los carga sin Neon ni
 * tsconfig-paths.
 */
import assert from 'node:assert/strict'
import { FASE_IDS } from './contracts.ts'
import {
  derivarPantalla,
  esPantallaId,
  FASES_MANUAL,
  fasesDePantallaConstruccion,
  PANTALLA_DE_FASE,
  PANTALLAS,
  PANTALLAS_CONSTRUCCION,
  pantallaDeFaseConstruccion,
  type DerivacionManualInput,
  type PantallaId,
} from './manual.ts'

/**
 * La inversa EXPORTADA (mutable, para poder ordenarla acá) — este invariante
 * ejercita la función real, no una re-implementación.
 */
const fasesDe = (id: PantallaId) => [...fasesDePantallaConstruccion(id)]

// ── 1. Toda fase tiene pantalla, y la pantalla es real y de Construcción ──
for (const fase of FASE_IDS) {
  const pantalla = PANTALLA_DE_FASE[fase]
  assert.ok(
    pantalla !== undefined,
    `la fase «${fase}» no tiene entrada en PANTALLA_DE_FASE (sin esto: actual=undefined → loop de redirects)`,
  )
  assert.ok(
    esPantallaId(pantalla),
    `la fase «${fase}» mapea a «${pantalla}», que no es un PantallaId del registro`,
  )
  assert.ok(
    (PANTALLAS_CONSTRUCCION as readonly string[]).includes(pantalla),
    `la fase «${fase}» mapea a «${pantalla}», que no está en PANTALLAS_CONSTRUCCION`,
  )
  assert.equal(
    PANTALLAS[pantalla].fase,
    'construccion',
    `la pantalla «${pantalla}» está mapeada por una fase pero su def no la declara de Construcción`,
  )
}

// ── 2. Ninguna pantalla de Construcción queda SIN fase (la mitad que el tipo no ve) ──
for (const pantalla of PANTALLAS_CONSTRUCCION) {
  assert.ok(
    FASE_IDS.some((fase) => PANTALLA_DE_FASE[fase] === pantalla),
    `la pantalla «${pantalla}» está en PANTALLAS_CONSTRUCCION pero ninguna fase la mapea (renderiza con los tres slots vacíos)`,
  )
}

// ── 3. Sin duplicados en la lista de presentación ──
assert.equal(
  new Set(PANTALLAS_CONSTRUCCION).size,
  PANTALLAS_CONSTRUCCION.length,
  'PANTALLAS_CONSTRUCCION tiene ids repetidos (el rail renderizaría el mismo chip dos veces)',
)

// ── 4. El indicador "paso N de M" cuenta sobre la MISMA lista ──
// OJO CON LA FORMA DE ESTA ASERCIÓN. Hasta C1b comparaba
// `[...FASES_MANUAL.construccion.pantallas]` contra `[...PANTALLAS_CONSTRUCCION]`,
// y los dos operandos salían DEL MISMO ARRAY: `manual.ts:310` hace
// `pantallas: PANTALLAS_CONSTRUCCION`, sin copia. Era una tautología. C0 reprodujo
// la topología contra seis valores arbitrarios —incluido invertir el orden, que
// SÍ cambia el "paso N de M"— y la aserción pasó los seis.
//
// El fixture congelado de abajo es la única fuente INDEPENDIENTE que existe acá.
// Cada lado se compara contra él, así que la aserción ya puede fallar por los dos
// caminos por los que el "paso N de M" contaría otra cosa: que la lista cambie
// (los dos lados se moverían juntos y nadie se enteraría) o que el manual deje de
// leerla. Si las pantallas de Construcción cambian a propósito, se actualiza acá
// EN EL MISMO COMMIT.
const PANTALLAS_CONSTRUCCION_CONGELADAS = ['mc1', 'mc2'] as const

assert.deepEqual(
  [...PANTALLAS_CONSTRUCCION],
  [...PANTALLAS_CONSTRUCCION_CONGELADAS],
  'PANTALLAS_CONSTRUCCION cambió (se agregó, se borró o se reordenó una pantalla). El ' +
    '"paso N de M" del manual cuenta sobre esta lista: actualizá ' +
    'PANTALLAS_CONSTRUCCION_CONGELADAS en este mismo commit si el cambio es a propósito.',
)

assert.deepEqual(
  [...FASES_MANUAL.construccion.pantallas],
  [...PANTALLAS_CONSTRUCCION_CONGELADAS],
  'FASES_MANUAL.construccion.pantallas divergió de PANTALLAS_CONSTRUCCION (el "paso N de M" ' +
    'contaría otra cosa): el manual dejó de leer la lista de Construcción.',
)

// ── 5. La inversa es exacta: unión de fases == FASE_IDS, sin duplicados ──
const fasesCubiertas = PANTALLAS_CONSTRUCCION.flatMap((pantalla) => fasesDe(pantalla))
assert.equal(
  new Set(fasesCubiertas).size,
  fasesCubiertas.length,
  'una fase aparece en más de una pantalla (su tilde se renderizaría dos veces, con dos escrituras del mismo id)',
)
assert.deepEqual(
  [...fasesCubiertas].sort(),
  [...FASE_IDS].sort(),
  'la unión de las fases de las pantallas no es exactamente FASE_IDS (falta o sobra una fase del checklist persistido)',
)

// ── 6. Round-trip fase → pantalla → fases ──
for (const fase of FASE_IDS) {
  const pantalla = pantallaDeFaseConstruccion(fase)
  assert.ok(
    fasesDe(pantalla).includes(fase),
    `round-trip roto: «${fase}» → «${pantalla}» → esa pantalla no devuelve «${fase}»`,
  )
}

// ── 7. Una pantalla que NO es de Construcción no tiene fases ──
// El árbol de la página despacha por esto: si m13 (borrador) devolviera una fase,
// se renderizaría con los slots de Construcción en vez de los suyos. Y la
// reentrada tampoco tiene: pertenece a la fase 'construccion' del indicador pero
// NO es una pantalla del checklist (su munición es vacía a propósito).
for (const ajena of ['m13', 'm14', 'mr'] as const) {
  assert.deepEqual(
    fasesDe(ajena),
    [],
    `«${ajena}» no es una pantalla del checklist de Construcción y no puede devolver fases`,
  )
}

// ── 7b. Las pantallas RETIRADAS ya no son alcanzables ──
// P4 retiró m3; P6-B retiró m7…m12 al agrupar las seis fases en dos. Un id
// retirado tiene que caer fuera del registro para que la guardia de la página
// (`esPantallaId` → redirect a la actual) lo rescate en vez de renderizar una
// pantalla fantasma. Sin esto, un bookmark viejo o una fila de la galería
// abriría una pantalla vacía.
for (const retirada of ['m3', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12'] as const) {
  assert.ok(
    !esPantallaId(retirada),
    `«${retirada}» fue retirada del mapa pero sigue en PANTALLA_IDS (sería alcanzable por URL)`,
  )
}

// ── 8. Agrupar no rompe la derivación: completada = TODAS sus fases ──
function input(overrides: Partial<DerivacionManualInput> = {}): DerivacionManualInput {
  return {
    stage: 'CONSTRUCCION',
    status: 'PROSPECTO',
    caliente: false,
    ficha: null,
    draftUrl: null,
    progreso: { completadas: [] },
    agenda: null,
    contactos: 0,
    followUpCount: 0,
    followUpVencido: false,
    finalUrl: null,
    demoEnviada: false,
    ...overrides,
  }
}

for (const pantalla of PANTALLAS_CONSTRUCCION) {
  const fases = fasesDe(pantalla)

  // Todas menos una: la pantalla NO puede figurar completada.
  if (fases.length > 1) {
    const parcial = derivarPantalla(input({ progreso: { completadas: fases.slice(0, -1) } }))
    assert.ok(
      !parcial.completadas.includes(pantalla),
      `«${pantalla}» figura completada con ${fases.length - 1} de ${fases.length} fases tildadas`,
    )
  }

  // Todas: la pantalla sí figura completada.
  const total = derivarPantalla(input({ progreso: { completadas: fases } }))
  assert.ok(
    total.completadas.includes(pantalla),
    `«${pantalla}» no figura completada con sus ${fases.length} fases tildadas`,
  )
}

// ── 9. `actual` siempre es una pantalla real (el fallo mudo que motivó todo) ──
// Con cualquier prefijo del checklist, la pantalla actual tiene que existir en el
// registro: un `undefined` acá era la ruta `/manual/undefined` en loop.
for (let corte = 0; corte <= FASE_IDS.length; corte += 1) {
  const posicion = derivarPantalla(
    input({ progreso: { completadas: [...FASE_IDS].slice(0, corte) } }),
  )
  assert.ok(
    esPantallaId(posicion.actual),
    `con ${corte} fases tildadas, actual="${String(posicion.actual)}" no es una pantalla del registro`,
  )
}

console.log(
  '✓ invariante OK: el eslabón pantalla↔fase está atado en las DOS direcciones — ' +
    `las ${FASE_IDS.length} fases de FASE_IDS tienen su pantalla de Construcción y ninguna de ` +
    `las ${PANTALLAS_CONSTRUCCION.length} pantallas queda sin fase; la inversa es exacta (sin duplicados ` +
    'ni sobrantes), una pantalla figura completada SÓLO con todas sus fases tildadas ' +
    'y `actual` nunca es undefined. La lista de fases (llave del progreso ' +
    'persistido) queda intacta al reagrupar pantallas.',
)
