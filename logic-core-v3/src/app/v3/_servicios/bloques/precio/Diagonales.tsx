/**
 * [SERVICIOS M2a] 4 · PRECIO EN DIAGONALES — desde 768: la sección anclada a pantalla completa, lo único que se ve (M0 §3).
 *
 * Tres paneles cortados en diagonal, cada corte con un quiebre en zigzag (`geometriaDelPrecio.ts`): la Simple arriba a la izquierda, la Mediana
 * al centro, en el acento, con su marca y su línea, y la Premium abajo a la derecha. La información va en la parte ancha de cada región.
 *
 *   · Texto real, en el DOM y en orden: el `h2` «Precio» solo para lectores de pantalla (D11) y una lista con las tres opciones, de
 *     arriba a la izquierda a abajo a la derecha, como se leen en pantalla.
 *   · Lo que dice cada opción sale de la vista pura (`tresOpciones.ts`): ningún texto de venta escrito acá. [M2b] Lo pinta
 *     `ContenidoDeLaOpcion.tsx`, que comparten las historias del teléfono.
 *   · Cómo entra: progresivo con el scroll (`movimiento/RepartoDelPrecio.tsx`). Cada panel lee su `--entrada-N` con reserva 1, así
 *     el HTML servido y el movimiento reducido muestran los tres en su lugar, sin corrimiento ni transparencia.
 *   · Los recortes, los corrimientos y las cajas van en custom properties por orientación (apaisado y retrato), y las clases los leen
 *     con `var()`: ningún polígono escrito en una clase.
 */

import { Titular } from '../../../_componentes/tipografia/Titular'
import type { EstiloConVariables } from '../../estiloDelAcento'
import { RepartoDelPrecio } from '../../movimiento/RepartoDelPrecio'
import { ContenidoDeLaOpcion, SUPERFICIE_DE_LA_OPCION } from './ContenidoDeLaOpcion'
import { caja, corrimiento, recorte, type IndiceDePanel } from './geometriaDelPrecio'
import type { VistaDeTresOpciones } from './tresOpciones'

/** Las clases de cada panel. Literales (Tailwind las lee de acá): cambia solo la variable de entrada de cada uno. */
const CLASES_DEL_PANEL: Readonly<Record<IndiceDePanel, string>> = {
  0: 'absolute inset-0 landscape:[clip-path:var(--recorte-a)] portrait:[clip-path:var(--recorte-r)] landscape:[--dx:var(--dx-a)] portrait:[--dx:var(--dx-r)] landscape:[--dy:var(--dy-a)] portrait:[--dy:var(--dy-r)] translate-x-[calc((1_-_var(--entrada-0,1))*var(--dx))] translate-y-[calc((1_-_var(--entrada-0,1))*var(--dy))] opacity-[var(--entrada-0,1)] motion-safe:will-change-transform',
  1: 'absolute inset-0 landscape:[clip-path:var(--recorte-a)] portrait:[clip-path:var(--recorte-r)] landscape:[--dx:var(--dx-a)] portrait:[--dx:var(--dx-r)] landscape:[--dy:var(--dy-a)] portrait:[--dy:var(--dy-r)] translate-x-[calc((1_-_var(--entrada-1,1))*var(--dx))] translate-y-[calc((1_-_var(--entrada-1,1))*var(--dy))] opacity-[var(--entrada-1,1)] motion-safe:will-change-transform',
  2: 'absolute inset-0 landscape:[clip-path:var(--recorte-a)] portrait:[clip-path:var(--recorte-r)] landscape:[--dx:var(--dx-a)] portrait:[--dx:var(--dx-r)] landscape:[--dy:var(--dy-a)] portrait:[--dy:var(--dy-r)] translate-x-[calc((1_-_var(--entrada-2,1))*var(--dx))] translate-y-[calc((1_-_var(--entrada-2,1))*var(--dy))] opacity-[var(--entrada-2,1)] motion-safe:will-change-transform',
}

/**
 * La caja del texto, escalonada: la Simple arriba a la izquierda, la Mediana al medio (su franja entera, con el texto centrado) y la
 * Premium abajo a la derecha, en las dos orientaciones.
 */
const CLASES_DE_LA_CAJA: Readonly<Record<IndiceDePanel, string>> = {
  0: 'absolute landscape:left-[var(--caja-x-a)] portrait:left-[var(--caja-x-r)] landscape:top-[var(--caja-y-a)] portrait:top-[var(--caja-y-r)] landscape:w-[var(--caja-w-a)] portrait:w-[var(--caja-w-r)]',
  1: 'absolute flex flex-col justify-center landscape:left-[var(--caja-x-a)] portrait:left-[var(--caja-x-r)] landscape:top-[var(--caja-y-a)] portrait:top-[var(--caja-y-r)] landscape:w-[var(--caja-w-a)] portrait:w-[var(--caja-w-r)] landscape:h-[var(--caja-h-a)] portrait:h-[var(--caja-h-r)]',
  2: 'absolute landscape:right-[var(--caja-x-a)] portrait:right-[var(--caja-x-r)] landscape:bottom-[var(--caja-y-a)] portrait:bottom-[var(--caja-y-r)] landscape:w-[var(--caja-w-a)] portrait:w-[var(--caja-w-r)]',
}

/** Las custom properties de un panel: su recorte, su corrimiento y su caja, en las dos orientaciones (el alto, solo la Mediana). */
function variablesDelPanel(panel: IndiceDePanel): EstiloConVariables {
  const a = { corrimiento: corrimiento('apaisado', panel), caja: caja('apaisado', panel) }
  const r = { corrimiento: corrimiento('retrato', panel), caja: caja('retrato', panel) }
  const altos: EstiloConVariables = a.caja.alto === null || r.caja.alto === null ? {} : { '--caja-h-a': a.caja.alto, '--caja-h-r': r.caja.alto }
  return {
    ...altos,
    '--recorte-a': recorte('apaisado', panel),
    '--recorte-r': recorte('retrato', panel),
    '--dx-a': a.corrimiento.x,
    '--dy-a': a.corrimiento.y,
    '--dx-r': r.corrimiento.x,
    '--dy-r': r.corrimiento.y,
    '--caja-x-a': a.caja.x.valor,
    '--caja-y-a': a.caja.y.valor,
    '--caja-w-a': a.caja.ancho,
    '--caja-x-r': r.caja.x.valor,
    '--caja-y-r': r.caja.y.valor,
    '--caja-w-r': r.caja.ancho,
  }
}

const PANELES: readonly IndiceDePanel[] = [0, 1, 2]

export function Diagonales({ vista, titulo }: { readonly vista: VistaDeTresOpciones; readonly titulo: string }): React.JSX.Element {
  return (
    <>
      <Titular nivel="titulo-l" como="h2" className="sr-only">
        {titulo}
      </Titular>
      <RepartoDelPrecio>
        <ul role="list" data-pieza="precio-en-diagonales" className="relative h-full w-full">
          {PANELES.map((panel) => (
            <li key={panel} data-opcion-del-precio={panel} style={variablesDelPanel(panel)} className={`${CLASES_DEL_PANEL[panel]} ${SUPERFICIE_DE_LA_OPCION[panel]}`}>
              <div className={CLASES_DE_LA_CAJA[panel]}>
                <ContenidoDeLaOpcion opcion={vista.opciones[panel]} destacada={panel === 1 ? vista.destacada : null} />
              </div>
            </li>
          ))}
        </ul>
      </RepartoDelPrecio>
    </>
  )
}
