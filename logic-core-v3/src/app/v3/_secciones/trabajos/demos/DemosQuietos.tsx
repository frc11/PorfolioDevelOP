import { Imagen } from '../../../_componentes/medios/Imagen'

import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, type Demo } from './catalogo'
import { TextoDeDemos } from './TextoDeDemos'


/**
 * LAS DEMOS EN LA RAMA QUIETA — abajo de 1025, y arriba con movimiento reducido.
 * **[DEMOS]**
 *
 * El título, el párrafo y una CINTA con las portadas pasando solas. Sin preview en
 * vivo y sin hover: tocar una portada abre el template en otra pestaña. Es CSS
 * puro (`demos.css`): la pista lleva la lista dos veces y se traslada media pista
 * por vuelta, así que no hay costura ni una línea de JS por cuadro. Con
 * movimiento reducido queda quieta y se desliza a mano.
 *
 * ⚠️ **La segunda copia es decoración**: `aria-hidden` y fuera del orden de
 * tabulación. El texto anunciado de esta rama es la lista UNA vez, igual que el
 * estante de arriba de 1025 — `s10-acceso` compara las dos ramas.
 *
 * ⚠️ Sin una sola clase `absolute`: la rama quieta no las tiene (`s7-arboles` §4).
 */
export function DemosQuietos(): React.JSX.Element {
  return (
    <div className="flex min-h-svh flex-col justify-center gap-8">
      <TextoDeDemos />
      <div data-pieza="cinta">
        <div data-parte="pista">
          <Lista />
          <Lista copia />
        </div>
      </div>
    </div>
  )
}

function Lista({ copia = false }: { readonly copia?: boolean }): React.JSX.Element {
  return (
    <div className="flex" {...(copia ? { 'aria-hidden': true, 'data-parte': 'copia' } : {})}>
      {CATALOGO_DE_DEMOS.map((demo: Demo) => (
          <a
            key={demo.slug}
            href={demo.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${demo.nombre}, ${demo.rubro}`}
            data-parte="portada"
            {...(copia ? { tabIndex: -1 } : {})}
          >
            <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="160px" />
          </a>
      ))}
    </div>
  )
}
