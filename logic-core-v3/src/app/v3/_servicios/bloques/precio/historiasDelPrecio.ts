/**
 * [SERVICIOS M2b] EL PRECIO EN HISTORIAS, PURO — lo que el teléfono (por debajo de 768) le pasa a las historias comunes del home
 * (`_componentes/historias/`, P-H19) y las decisiones de su montaje, sin React ni el DOM. Plan: `docs/servicios/SPRINT-M2b.md` §2.
 *
 *   · Los pasos son las tres opciones de la vista del M2a (`tresOpciones.ts`), en su orden: Simple, Mediana y Premium. La destacada
 *     (su marca y su línea) va solo en la del medio, como en las diagonales.
 *   · Las historias se montan cuando tienen que correr, como en el Portfolio: por debajo de 768, sin movimiento reducido y con la caja
 *     anclada cubriendo el cuadro. Al salir se desmontan, así cada entrada arranca de la Simple.
 *   · Las salidas del componente (deslizar arriba o pasar la última: adelante; deslizar abajo: atrás) mueven la página fuera del tramo.
 */

import type { ItemDeHistoria, SalidaDeLasHistorias } from '../../../_componentes/historias/maquinaDeLasHistorias'
import type { OpcionDeTres, VistaDeTresOpciones } from './tresOpciones'

export type IndiceDelPaso = 0 | 1 | 2

export interface PasoDelPrecio extends ItemDeHistoria {
  readonly indice: IndiceDelPaso
  readonly opcion: OpcionDeTres
  /** La marca y la línea: solo en la Mediana (la del medio, la que la vista destaca). */
  readonly destacada: VistaDeTresOpciones['destacada']
}

/** Los tres pasos, en el orden de la vista. Los ids son por posición: el nombre es dato y no sirve de clave. */
export function pasosDelPrecio(vista: VistaDeTresOpciones): readonly [PasoDelPrecio, PasoDelPrecio, PasoDelPrecio] {
  const [simple, mediana, premium] = vista.opciones
  return [
    { id: 'opcion-0', indice: 0, opcion: simple, destacada: null },
    { id: 'opcion-1', indice: 1, opcion: mediana, destacada: vista.destacada },
    { id: 'opcion-2', indice: 2, opcion: premium, destacada: null },
  ]
}

/** `max-md:` en la forma de `matchMedia`: el `md` de Tailwind por defecto (48rem), que el tema no redefine. Es el corte de `Precio.tsx`. */
export const CONSULTA_DEBAJO_DE_768 = '(width < 48rem)'

export interface MomentoDelTelefono {
  readonly debajoDe768: boolean
  readonly reducido: boolean
  /** La caja anclada cubre el cuadro (`cajaPegada`). */
  readonly pegada: boolean
}

/** Si las historias tienen que estar montadas. Con movimiento reducido nunca: los tres pasos se leen quietos, uno debajo del otro. */
export function montarLasHistorias(m: MomentoDelTelefono): boolean {
  return m.debajoDe768 && !m.reducido && m.pegada
}

/** Si la caja anclada cubre el cuadro: la sección alta arranca arriba del tope y termina debajo del pie (medio px por el redondeo). */
export function cajaPegada(alta: { readonly top: number; readonly bottom: number }, alto: number): boolean {
  return alto > 0 && alta.top <= 0.5 && alta.bottom >= alto - 0.5
}

/** Adónde va la página con cada salida (px del documento): adelante, al final de la sección alta (lo que sigue queda arriba); atrás, al título. */
export function destinoDeLaSalida(hacia: SalidaDeLasHistorias, bordes: { readonly titulo: number; readonly finDeLaAlta: number }): number {
  return hacia === 'adelante' ? bordes.finDeLaAlta : bordes.titulo
}
