/**
 * LA GLUE DEL BLOQUE ANIMADO — el ancla del pin y la especificación de pieza.
 *
 * ── Por qué es un módulo aparte (B4-A) ────────────────────────────────────
 *
 * Porque **sólo lo usa el árbol animado** —`coreografia-animada.tsx`, que entra
 * por el `import()` perezoso de la compuerta de 1025— y mientras vivió en
 * `motion.ts` viajaba en la carga inicial de `/v3`: ese módulo entra por
 * `CompuertaDelHome` (que le pide `deberiaAnimar`) y por `registro.ts` (que le
 * pide `USOS_DECLARADOS`), así que arrastraba todo lo demás. **503 B medidos
 * sobre el chunk de la página**, del lado equivocado de la compuerta.
 *
 * Ningún instrumento lo veía: `s7-compuerta` busca las huellas del SISTEMA de
 * motion (`_lib/motion/`) sobre el build, y esto es del CONTRATO — código
 * propio, escrito acá, que reproduce a mano lo que el sistema declara. La regla
 * que lo caza es la de siempre y ahora se puede escribir: **un módulo que sólo
 * consume el árbol animado no puede compartir archivo con uno que consume el
 * quieto.**
 */

import type { Ancla, ParDeAnclas } from '../../_lib/motion/anclas'
import type { Cronograma } from '../../_lib/motion/cronograma'
import type { EspecificacionDePieza } from '../../_lib/motion/fotograma'
import type { Patron } from '../../_lib/motion/patrones'

/**
 * EL ANCLA DEL PIN — `top top` → `bottom bottom`. **[derivado], no medido.**
 *
 * Las nueve anclas de `ANCLAS` describen los patrones de la referencia. Ésta
 * describe otra cosa: **nuestra** geometría de pinneado, la que sale de
 * `secciones.ts` y de `position: sticky`.
 *
 * La cuenta, con la fórmula de `posicionDeAncla`:
 *
 *     inicio = topDoc + alto·0 + 0  −  (viewport·0 + 0)  =  topDoc
 *     fin    = topDoc + alto·1 + 0  −  (viewport·1 + 0)  =  topDoc + alto − viewport
 *     rango  = alto − viewport
 *
 * Y `alto − viewport` es exactamente el recorrido del pin: una sección de
 * 300svh con un hijo `sticky` de 100svh queda clavada 200svh. El progreso vale
 * 0 cuando el pin empieza y 1 cuando termina, que es lo que la secuencia
 * necesita para repartirse en tramos iguales.
 *
 * `s6-servicios.invariant` afirma esa igualdad y la controla con dos anclas
 * mutiladas que no la reproducen.
 */
const LADO_TOPE = { fraccion: 0, px: 0 } as const
const LADO_FONDO = { fraccion: 1, px: 0 } as const

const anclaDelPinInicio: Ancla = {
  declarado: 'top top',
  elemento: LADO_TOPE,
  viewport: LADO_TOPE,
}
const anclaDelPinFin: Ancla = {
  declarado: 'bottom bottom',
  elemento: LADO_FONDO,
  viewport: LADO_FONDO,
}

export const ANCLA_DEL_PIN: ParDeAnclas = { inicio: anclaDelPinInicio, fin: anclaDelPinFin }

/**
 * El cronograma de un patrón con N piezas, en sus valores medidos.
 *
 * La duración APLICADA no es ésta: es `duracionDeclarada + escalonado·(N−1)`, y
 * la calcula `duracionAplicada` del sistema. Acá se declara lo declarado.
 */
export function cronogramaDe(patron: Patron, cantidad: number): Cronograma {
  return {
    duracionDeclarada: patron.duracionDeclarada,
    escalonado: patron.escalonado,
    cantidad,
  }
}

/** La especificación de pieza lista para `Pieza`, `Piezas` y `propiedadesDePieza`. */
export function especificacionDe(patron: Patron, cantidad: number): EspecificacionDePieza {
  return {
    claves: patron.claves,
    tramos: patron.tramos,
    pointerEvents: patron.pointerEvents,
    curva: patron.curva,
    cronograma: cronogramaDe(patron, cantidad),
  }
}

/**
 * La inercia del `scrub`, en segundos, o `null` si el patrón no declara una.
 *
 * `scrub: true` en la referencia significa "sin inercia": el cabezal sigue al
 * scroll sin retraso. Un número son los segundos que tarda en alcanzarlo, y el
 * sistema lo reproduce con un resorte sin rebote — misma familia de
 * comportamiento, no la misma matemática. Está declarado así en S2.
 */
export function inerciaDe(patron: Patron): number | null {
  return typeof patron.scrub === 'number' ? patron.scrub : null
}
