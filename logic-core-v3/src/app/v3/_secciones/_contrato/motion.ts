/**
 * CÓMO SE CONSUME UN PATRÓN DE MOTION EN UNA SECCIÓN — y su variante sin motion.
 *
 * ── Qué se consume y qué se escribe, con la línea exacta ──────────────────
 *
 * El SISTEMA de motion vive en `_lib/motion/` y **no se borra nunca**: las seis
 * curvas, la traducción a CSS real, el cronograma, las anclas, el fotograma, el
 * motor de progreso y el divisor de líneas. Este lane lo consume entero.
 *
 * La GLUE de React que S2 construyó vive en `motion/_componentes/`, que el
 * propio reporte de S2 marca como **deuda con fecha de baja** (la ruta de
 * demostración). De ahí se consumen tres piezas que no tienen ninguna
 * dependencia del demo —`Pieza`, `Piezas`, `LineasDeTexto`— y **no** se consume
 * `BloqueDePatron`, por dos acoplamientos concretos:
 *
 *   · toma un objeto `Ajustes` que son las perillas de la mesa de calibración;
 *   · le escribe al bloque un `min-height` sacado de `altoDelBloqueSvh`, que es
 *     geometría del INSTRUMENTO —cuánto scroll gasta una demostración— y no del
 *     sitio. En una sección eso impondría 50svh a cada bloque de P2.
 *
 * Por eso el bloque medido de este lane es propio (`Bloque.tsx`, unas cincuenta
 * líneas) y usa el mismo hook del sistema. **Queda reportado como hallazgo:** la
 * mitad reutilizable de `BloqueDePatron` está enredada con geometría de demo, y
 * el día que la ruta de demostración se borre, lo que sobrevive es este bloque
 * más el traslado de `Pieza`, `Piezas` y `LineasDeTexto` a `_lib/motion/`.
 *
 * ── Los valores son los MEDIDOS, sin perillas ─────────────────────────────
 *
 * `specDe` del demo multiplica duración y escalonado por los factores de la
 * mesa y puede forzar una curva. Acá no hay perillas: la sección corre en lo
 * medido. La calibración fina la hace el ojo sobre la mesa, no sobre el sitio.
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

/**
 * LA COMPUERTA DE ESTE LANE — pura, para poder afirmar la tabla de verdad sin
 * montar React.
 *
 * | arriba de 1025 | prefiere menos movimiento | anima |
 * |---|---|---|
 * | sí | no | **sí** |
 * | no | no | no |
 * | sí | sí | no |
 * | no | sí | no |
 *
 * ⚠️ Coincide hoy, fila por fila, con `deberiaMontarseElCursor` de `_lib/cursor.ts`.
 * **No se importa aquélla**: es la política del cursor y podría cambiar por
 * razones del cursor —táctil, por ejemplo— arrastrando a las secciones sin que
 * nadie lo pida. El invariante afirma la coincidencia en vez de compartir la
 * implementación: si un día dejan de coincidir, se va a ver, y va a ser una
 * decisión y no un efecto colateral.
 *
 * Las dos filas negativas por sí solas no prueban nada: una compuerta que
 * devolviera `false` siempre las pasaría. Por eso el invariante lleva los dos
 * controles —que existe un caso que SÍ anima, y que el ancho por sí solo puede
 * negarla—, que son los mismos que S3 escribió para el cursor.
 */
export function deberiaAnimar(
  arribaDelUmbral: boolean,
  prefiereMenosMovimiento: boolean,
): boolean {
  if (!arribaDelUmbral) return false
  if (prefiereMenosMovimiento) return false
  return true
}

/**
 * Los nueve patrones que este lane puede consumir, por id, con la razón de su
 * uso. Es un padrón: un patrón que una sección use y no esté acá hace fallar la
 * comprobación, y agregarlo obliga a escribir para qué.
 *
 * La instrucción asigna los patrones sección por sección; esta tabla es esa
 * asignación, en un lugar donde un instrumento la puede recorrer.
 */
export interface UsoDePatron {
  readonly patron: string
  readonly seccion: string
  readonly para: string
}

export const USOS_DECLARADOS: readonly UsoDePatron[] = [
  { patron: 'P2', seccion: 'servicios', para: 'las filas de la secuencia — 60 de sus 77 instancias están en esta página' },
  { patron: 'P3', seccion: 'servicios', para: 'el resaltado progresivo del párrafo, palabra por palabra' },
  { patron: 'P4', seccion: 'servicios', para: 'la lista de cada servicio, ítem por ítem, muy frenada' },
  { patron: 'P1', seccion: 'tu-panel', para: 'el titular, línea por línea' },
  { patron: 'P2', seccion: 'tu-panel', para: 'los bloques' },
  { patron: 'P4', seccion: 'tu-panel', para: 'la lista de capacidades' },
  { patron: 'P1', seccion: 'por-que-develop', para: 'el titular, línea por línea' },
  { patron: 'P5', seccion: 'por-que-develop', para: 'las piezas que aparecen — uno de los pocos usos que el sistema tiene' },
  { patron: 'P1', seccion: 'cierre', para: 'el titular de cierre' },
  { patron: 'P2', seccion: 'cierre', para: 'las columnas del pie, con escalonado' },
]
