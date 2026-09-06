/**
 * Chequeo de invariante de LA COLA DE TRABAJO (P21) — corre sin DB.
 *
 *   npm run check:invariant:cola
 *
 * Lo que garantiza, de forma ejecutable:
 *
 *   1. NADA SE DUPLICA — el foco es el PRIMER ítem de la cola, y ningún lead
 *      aparece dos veces. Es la garantía que sostiene el sprint entero: la cola
 *      no es un bloque nuevo al lado del foco, es la lista que el foco encabeza.
 *   2. NADA SE PIERDE — `items.length + ocultos === total`, para todo tope y
 *      todo tamaño de cola. Lo que no entra se cuenta, no se descarta.
 *   3. LA COLA NO SE DECAPITA — con un tope de 0 (o negativo) la cola sigue
 *      teniendo su primer ítem. Una cola sin encabezado no es una cola más
 *      corta: es un panel sin acción destacada.
 *   4. EL ORDEN ES EL QUE LE ENTREGAN — la cola no reordena. Toma foco + resto
 *      tal cual salen de `seleccionarFoco` y los concatena.
 *   5. EL DEDUP MIDE LO VISIBLE — `idsEnCola` devuelve exactamente los ids
 *      RENDERIZADOS, ni uno más. Si devolviera el grupo entero, el aviso de un
 *      accionable que no llegó a mostrarse desaparecería de las dos superficies
 *      (no estaría en la cola y tampoco en novedades).
 *   6. SIN FOCO NO HAY COLA — cola vacía, total 0, cero ocultos: el panel cae en
 *      el "todo en espera" (2.1b) en vez de dibujar una lista vacía.
 *
 * Y el eje que ata la cola al motor de selección: se barre `seleccionarFoco` +
 * `armarCola` juntos, con sticky en cada posición, para que ninguna de las dos
 * pueda cambiar sola sin que esto se entere.
 *
 * Importa los módulos puros directo (relativo, sin `@/`): su árbol de runtime es
 * `@/`-free a propósito, así que el harness ts-node los carga sin Neon.
 */
import assert from 'node:assert/strict'
import { armarCola, idsEnCola, TOPE_COLA } from './cola.ts'
import { seleccionarFoco } from './foco.ts'
import { type HomeLead } from './flow.ts'

/** Fixture de un `HomeLead` YA clasificado (espejo del de `particion.invariant`). */
function lead(overrides: Partial<HomeLead> & { id: string }): HomeLead {
  return {
    businessName: overrides.id,
    industry: null,
    zone: null,
    status: 'PROSPECTO',
    caliente: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    stage: null,
    ficha: null,
    evaluacion: null,
    ultimoRechazo: null,
    agenda: null,
    contactos: 0,
    followUpVencido: false,
    postergadoVencido: false,
    demoEnviada: false,
    pinned: false,
    snoozed: false,
    snoozedUntil: null,
    note: null,
    score: null,
    gateAbierto: false,
    grupo: 'trabajar',
    proximaAccion: 'Hacer algo',
    accionable: true,
    ...overrides,
  }
}

const cola = (n: number) =>
  Array.from({ length: n }, (_, i) => lead({ id: `L${i}` }))

// ── 6. Sin foco no hay cola ──────────────────────────────────────────────────
const vacia = armarCola(null, [], TOPE_COLA)
assert.deepEqual(vacia.items, [], 'sin foco la cola no dibuja ítems')
assert.equal(vacia.total, 0, 'sin foco el total es 0')
assert.equal(vacia.ocultos, 0, 'sin foco no hay ocultos')
assert.deepEqual(idsEnCola(vacia), [], 'una cola vacía no excluye ningún aviso')

// ── 1/2/3/4/5. El barrido: todo tamaño de cola × todo tope × todo sticky ─────
// El sticky se prueba en TODAS las posiciones (y también inválido) porque es lo
// que decide quién encabeza: si `armarCola` y `seleccionarFoco` divergieran, el
// foco dejaría de ser el primer ítem exactamente acá.
let casos = 0
for (let n = 1; n <= 12; n += 1) {
  const orden = cola(n)
  const stickies: (string | null)[] = [null, 'NO-EXISTE', ...orden.map((l) => l.id)]

  for (const stickyId of stickies) {
    const seleccion = seleccionarFoco(orden, stickyId)
    for (let tope = -1; tope <= 14; tope += 1) {
      casos += 1
      const c = armarCola(seleccion.foco, seleccion.resto, tope)

      // 1. El foco encabeza, y nadie se repite.
      assert.ok(c.items.length > 0, `cola no vacía con ${n} accionables (tope ${tope})`)
      assert.equal(c.items[0].lead.id, seleccion.foco?.id, 'el foco es el PRIMER ítem de la cola')
      assert.ok(c.items[0].esFoco, 'el primer ítem se marca como foco')
      assert.equal(
        c.items.filter((i) => i.esFoco).length,
        1,
        'exactamente un ítem destacado: la cola no dibuja dos focos',
      )
      const ids = c.items.map((i) => i.lead.id)
      assert.equal(new Set(ids).size, ids.length, 'ningún lead aparece dos veces en la cola')

      // 2. Nada se pierde.
      assert.equal(c.total, n, 'el total es todo lo accionable, no lo mostrado')
      assert.equal(
        c.items.length + c.ocultos,
        c.total,
        'lo mostrado más lo oculto es exactamente el total',
      )
      assert.ok(c.ocultos >= 0, 'los ocultos nunca son negativos')

      // 3. No se decapita.
      assert.ok(c.items.length >= 1, 'ni con tope 0 o negativo la cola pierde su primer ítem')
      assert.ok(
        c.items.length <= Math.max(1, tope),
        'la cola nunca muestra más de lo que el tope permite',
      )

      // 4. El orden es el que le entregan: foco + resto, en ese orden.
      const esperado = [seleccion.foco!.id, ...seleccion.resto.map((l) => l.id)].slice(
        0,
        c.items.length,
      )
      assert.deepEqual(ids, esperado, 'la cola concatena foco + resto sin reordenar')

      // 5. El dedup mide lo VISIBLE.
      assert.deepEqual(idsEnCola(c), ids, '`idsEnCola` devuelve exactamente lo renderizado')
      assert.equal(
        idsEnCola(c).length,
        c.items.length,
        'el dedup nunca alcanza a un accionable que la cola no mostró',
      )
    }
  }
}

// ── El caso que motivó el sprint, explícito ──────────────────────────────────
// 49 accionables (lo medido en el panel real): la cola muestra TOPE_COLA y dice
// que quedan 44. Antes de P21 la superficie mostraba 1 y no decía nada de los 48.
const cuarentaYNueve = cola(49)
const sel49 = seleccionarFoco(cuarentaYNueve, null)
const c49 = armarCola(sel49.foco, sel49.resto)
assert.equal(c49.items.length, TOPE_COLA, `la cola muestra ${TOPE_COLA} de 49`)
assert.equal(c49.total, 49, 'y sigue diciendo que hay 49 para trabajar')
assert.equal(c49.ocultos, 49 - TOPE_COLA, 'los que no entran se cuentan, no se descartan')

// ── El sticky manda sobre la cima, y la cola lo respeta ──────────────────────
const tres = cola(3)
const conSticky = seleccionarFoco(tres, 'L2')
const colaSticky = armarCola(conSticky.foco, conSticky.resto, 3)
assert.equal(colaSticky.items[0].lead.id, 'L2', 'el lead anclado encabeza la cola')
assert.deepEqual(
  colaSticky.items.map((i) => i.lead.id),
  ['L2', 'L0', 'L1'],
  'y el resto conserva su orden original debajo',
)

console.log(
  `✓ invariante OK (${casos} combinaciones de cola × tope × sticky): la cola de ` +
    'trabajo NO duplica al foco (lo encabeza: exactamente un ítem destacado, cero ' +
    'ids repetidos), NO pierde nada (mostrados + ocultos = total), no se decapita ' +
    'con tope 0, no reordena lo que recibe, y el dedup contra novedades mide lo ' +
    'VISIBLE — nunca alcanza a un accionable que la cola no llegó a mostrar.',
)
