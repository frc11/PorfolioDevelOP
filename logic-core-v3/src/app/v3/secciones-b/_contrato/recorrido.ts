import type { ComponentType } from 'react'

import { Cierre, CierreConCompuerta } from '../_s8-cierre/Cierre'
import { PorQueDevelop, PorQueDevelopConCompuerta } from '../_s7-por-que-develop/PorQueDevelop'
import { Servicios, ServiciosConCompuerta } from '../_s5-servicios/Servicios'
import { TuPanel, TuPanelConCompuerta } from '../_s6-tu-panel/TuPanel'
import { ORDEN_DE_SECCIONES_B, type IdDeSeccionB } from './secciones'

/**
 * EL RECORRIDO — qué componente monta cada sección, y en qué orden.
 *
 * ── Por qué el orden NO se escribe acá ────────────────────────────────────
 *
 * Sale de `ORDEN_DE_SECCIONES_B`, que es el mismo dato del que salen las
 * superficies, las alturas y el ritmo. Esta tabla sólo dice **qué componente
 * corresponde a cada id**; el orden es de la tabla de secciones y la ruta la
 * recorre. Si mañana el recorrido cambia, cambia en un lugar.
 *
 * ── Por qué vive en el contrato y no en `page.tsx` ────────────────────────
 *
 * Para que los instrumentos la puedan importar. Un archivo de ruta de Next
 * tiene un juego cerrado de exportaciones válidas —`default`, `metadata` y
 * poco más—, así que colgarle un padrón sería pedirle al framework algo que no
 * promete. Acá es un módulo común y `s6-render.invariant` lo recorre.
 *
 * ── Las dos formas de cada sección, y para qué sirve cada una ─────────────
 *
 *   · **la sección pura** recibe `anima` como propiedad y no consulta nada. Es
 *     la que renderiza el instrumento, en las dos ramas, sin inventar un
 *     atributo de forzado en el producto.
 *   · **la de compuerta** consulta `useAnima()` y le pasa el resultado a la
 *     primera. Es la que monta la ruta.
 *
 * Que sean dos exportaciones y no una propiedad opcional es deliberado: una
 * propiedad `anima?: boolean` con default sería un atajo que el producto
 * expone y que cualquiera puede fijar por error.
 */

/** La sección pura: `anima` entra, nada se consulta. */
export type SeccionPura = ComponentType<{ readonly anima: boolean }>

/**
 * La sección con su compuerta puesta. Es lo que monta la ruta.
 *
 * Se declara como función sin propiedades y **no** como
 * `ComponentType<Record<string, never>>`: ese tipo trae una firma de índice, y
 * la firma de índice se come el `key` que JSX necesita para una lista —
 * `Type 'IdDeSeccionB' is not assignable to type 'never'`. Lo cazó `tsc`.
 */
export type SeccionMontable = () => React.JSX.Element

export interface EntradaDelRecorrido {
  readonly id: IdDeSeccionB
  readonly pura: SeccionPura
  readonly montable: SeccionMontable
}

const POR_ID: Readonly<Record<IdDeSeccionB, EntradaDelRecorrido>> = {
  servicios: { id: 'servicios', pura: Servicios, montable: ServiciosConCompuerta },
  'tu-panel': { id: 'tu-panel', pura: TuPanel, montable: TuPanelConCompuerta },
  'por-que-develop': {
    id: 'por-que-develop',
    pura: PorQueDevelop,
    montable: PorQueDevelopConCompuerta,
  },
  cierre: { id: 'cierre', pura: Cierre, montable: CierreConCompuerta },
}

/** Las cuatro, en el orden de la tabla del sitio. */
export const RECORRIDO: readonly EntradaDelRecorrido[] = ORDEN_DE_SECCIONES_B.map((id) => POR_ID[id])
