/**
 * [SERVICIOS M2b] UN PASO DEL PRECIO EN EL TELÉFONO — una opción en su superficie (la Mediana en el acento, las otras dos en papel, como
 * en las diagonales), con su contenido en la columna del sitio, centrado en el alto. La usan la lista quieta (el HTML servido y el
 * movimiento reducido) y cada paso de las historias.
 *
 * Con movimiento: una pantalla entera (la caja anclada). Con movimiento reducido: su alto, con aire arriba y abajo, porque los tres se
 * leen uno debajo del otro.
 */

import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { ContenidoDeLaOpcion, SUPERFICIE_DE_LA_OPCION } from './ContenidoDeLaOpcion'
import type { PasoDelPrecio } from './historiasDelPrecio'

export function PantallaDelPaso({ paso }: { readonly paso: PasoDelPrecio }): React.JSX.Element {
  return (
    <div data-paso-del-precio={paso.indice} className={`flex flex-col justify-center py-16 motion-safe:h-full motion-safe:py-0 ${SUPERFICIE_DE_LA_OPCION[paso.indice]}`}>
      <Envoltorio>
        <ContenidoDeLaOpcion opcion={paso.opcion} destacada={paso.destacada} />
      </Envoltorio>
    </div>
  )
}

/**
 * La lista quieta: los tres pasos con su texto, en el DOM y en orden (el HTML servido). Con movimiento, el CSS deja a la vista solo el
 * primero, a pantalla, en la caja anclada (las historias empiezan en ese mismo paso); con movimiento reducido, los tres, uno debajo del otro.
 */
export function ListaDeLosPasos({ pasos }: { readonly pasos: readonly PasoDelPrecio[] }): React.JSX.Element {
  return (
    <ul role="list" data-pieza="precio-en-lista" className="motion-safe:h-full">
      {pasos.map((paso) => (
        <li key={paso.id} className={paso.indice === 0 ? 'motion-safe:h-full' : 'motion-safe:hidden'}>
          <PantallaDelPaso paso={paso} />
        </li>
      ))}
    </ul>
  )
}
