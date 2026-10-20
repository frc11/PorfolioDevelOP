/**
 * [B12a.6] LA SEÑAL DEL VELO DE LA NAVEGACIÓN — sin react: la pide quien navega (`_componentes/navegacion/EnlaceDeRuta.tsx`) y la atiende
 * el velo del layout (`_chrome/velo/VeloDeNavegacion.tsx`), como la señal de la salida de la variante. Acá, porque `_componentes` no
 * importa de `_chrome`.
 */

/** El home (`/v3`; con D8, `/`). */
export const RUTA_DEL_HOME = '/v3'

export type NocheDelVelo = 'dia' | 'noche'

/** Lo que pide quien navega: el velo del color del destino; `cubierto` se llama con el cuadro cubierto entero. */
export interface PedidoDelVelo {
  readonly noche: NocheDelVelo
  readonly cubierto: () => void
}

let atender: ((p: PedidoDelVelo) => void) | null = null

/** Cubre el cuadro con el velo y resuelve cuando está cubierto entero; sin el velo montado, en el acto. Se resuelve siempre. */
export function cubrirConElVelo(noche: NocheDelVelo): Promise<void> {
  return new Promise((resolver) => {
    if (atender === null) resolver()
    else atender({ noche, cubierto: resolver })
  })
}

/** Sólo el velo del layout: atiende los pedidos mientras está montado. */
export function atenderElVelo(a: (p: PedidoDelVelo) => void): () => void {
  atender = a
  return () => {
    if (atender === a) atender = null
  }
}

/** La noche del destino, por su ruta: el home amanece (el papel); una página anochece (la tinta). */
export function nocheDelDestino(ruta: string): NocheDelVelo {
  const sinAncla = ruta.split('#')[0]?.split('?')[0] ?? ruta
  return sinAncla === RUTA_DEL_HOME || sinAncla === '' ? 'dia' : 'noche'
}
