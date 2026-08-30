'use client'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { deberiaAnimar } from './motion'

/**
 * LA COMPUERTA DE LA COREOGRAFÍA DE UNA SECCIÓN.
 *
 * ── Reusa los dos mecanismos que ya existen, no construye otros ───────────
 *
 * El umbral y la consulta salen de `_lib/compuerta.ts` —los mismos que gobiernan
 * el escenario de S1 y la coreografía de S2— y la preferencia de movimiento sale
 * de `_lib/motion/reducido.ts`. **El número 1025 no aparece en este lane.** Si
 * alguien mueve el umbral, se mueven todas las compuertas a la vez, que es
 * exactamente la propiedad que hace que sea UNA compuerta y no cinco.
 *
 * ── Por qué la preferencia se lee con `useMovimientoReducido` ─────────────
 *
 * Hay dos hooks en el repo para la misma preferencia y no son intercambiables:
 *
 *   · `usePrefiereMenosMovimiento` (S3) lee `matchMedia` directo, con snapshot
 *     de servidor `true`;
 *   · `useMovimientoReducido` (S2) lee `useReducedMotionConfig`, que además
 *     respeta `MotionConfig reducedMotion="always" | "never"`.
 *
 * Se usa el segundo por una razón de instrumento: es el único que se puede
 * FORZAR en una comprobación sin navegador, que es lo que permite renderizar el
 * mismo árbol con la preferencia y sin ella en el mismo proceso. Sin esa
 * capacidad, la mitad "con movimiento reducido no se anima nada" pasaría en
 * verde aunque el sistema estuviera roto.
 *
 * ── Qué pasa en el servidor, y por qué no hay salto ni mismatch ───────────
 *
 * `useAnchoMinimo` devuelve `false` en el servidor —el ancho no existe— y React
 * usa ese snapshot también en el render de HIDRATACIÓN. Así que el HTML servido
 * y el primer render de cliente son **el árbol quieto**, idénticos, y la
 * coreografía entra recién en el re-render posterior. Las cuatro secciones se
 * sirven enteras y legibles sin una sola transformada: eso no es una degradación
 * elegante, es el estado por defecto.
 *
 * ── La decisión que este archivo NO toma ──────────────────────────────────
 *
 * La compuerta es de MONTAJE, no de import: el módulo de la sección viaja igual
 * en los dos lados del umbral. Es deliberado y tiene un costo declarado.
 * Gatearlo por `import()` —como hacen `EscenarioCompuerta` y `CompuertaDeMotion`—
 * obligaría a tener DOS árboles de contenido, el quieto y el coreografiado, y
 * dos árboles escritos a mano se desvían: el modo de falla sería que la persona
 * de mobile lea un contenido distinto del de escritorio, que es peor que unos
 * KiB. Acá el contenido está escrito una vez y lo único que cambia es si se le
 * cuelga un `MotionValue`. El peso propio se mide y se publica.
 */

/**
 * Si esta sección anima. Es `deberiaAnimar` con las dos lecturas puestas.
 *
 * Las secciones NO llaman este hook: lo llama su envoltorio de compuerta, y
 * ellas reciben `anima` como propiedad. Es lo que permite renderizar las dos
 * ramas en una comprobación sin inventar un atributo de forzado en el producto.
 */
export function useAnima(): boolean {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_ESCENARIO)
  const prefiereMenosMovimiento = useMovimientoReducido()
  return deberiaAnimar(arribaDelUmbral, prefiereMenosMovimiento)
}
