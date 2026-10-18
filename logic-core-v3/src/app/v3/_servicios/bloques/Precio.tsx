/**
 * [SERVICIOS S1b/S2 · M2a] 4 · PRECIO — elige el slot según `precio.tipo` (SPEC §5: calibres en web, proyecto en software, planes en IA).
 *
 * El `switch` es exhaustivo: si alguien suma un tipo de precio sin su rama, esto deja de compilar. Cada slot saca lo que muestra de
 * los datos (`precio/vistaDelPrecioPorProyecto.ts`, `precio/vistaDeLosPlanes.ts` y [M2a] `precio/tresOpciones.ts` son la lógica, sin
 * markup) y lo que falta ([a definir]) se ve solo en desarrollo: en producción ese ítem no se monta, y nunca sale un número inventado.
 *
 * [M2a] Los calibres van en DOS versiones dentro de la misma sección, y el CSS elige (como los planes de IA desde el S2c):
 *   · por debajo de 768, lo de siempre (D15): el bloque con su título y los calibres en su grilla;
 *   · desde 768, las diagonales (`precio/Diagonales.tsx`): la sección anclada a pantalla completa, con el título solo para lectores.
 * La que no toca va con `display: none`: ni se ve, ni la lee el lector de pantalla, ni la alcanza el teclado.
 */

import type { Precio as DatosDePrecio } from '../tipos'
import { Bloque, CLASES_DEL_PAPEL, ContenidoDelBloque, idDelTituloDe } from './Bloque'
import { Calibres } from './precio/Calibres'
import { Diagonales } from './precio/Diagonales'
import { Planes } from './precio/Planes'
import { Proyecto } from './precio/Proyecto'
import { tresOpcionesDeLosCalibres } from './precio/tresOpciones'

const TITULO = 'Precio' // C2: provisorio (el nombre de SPEC §5)

interface PrecioProps {
  readonly precio: DatosDePrecio
  readonly enDesarrollo: boolean
}

export function Precio({ precio, enDesarrollo }: PrecioProps): React.JSX.Element {
  if (precio.tipo === 'calibres') {
    return (
      <section data-bloque="precio" aria-labelledby={idDelTituloDe('precio')} className={CLASES_DEL_PAPEL}>
        <div data-precio="calibres" className="pt-12 md:hidden">
          <ContenidoDelBloque nombre="precio" titulo={TITULO}>
            {contenidoDelSlot(precio, enDesarrollo)}
          </ContenidoDelBloque>
        </div>
        <div data-precio="diagonales" className="max-md:hidden">
          <Diagonales vista={tresOpcionesDeLosCalibres(precio.calibres, precio.destacada, enDesarrollo)} titulo={TITULO} />
        </div>
      </section>
    )
  }
  return (
    <Bloque nombre="precio" titulo={TITULO}>
      {contenidoDelSlot(precio, enDesarrollo)}
    </Bloque>
  )
}

function contenidoDelSlot(precio: DatosDePrecio, enDesarrollo: boolean): React.JSX.Element {
  switch (precio.tipo) {
    case 'calibres':
      return <Calibres calibres={precio.calibres} enDesarrollo={enDesarrollo} />
    case 'proyecto':
      return <Proyecto precio={precio} />
    case 'planes':
      return <Planes precio={precio} enDesarrollo={enDesarrollo} />
    default:
      return sinSlot(precio)
  }
}

/** El `default` del `switch`: con los tres tipos cubiertos `precio` es `never`; un tipo nuevo sin rama no compila. */
function sinSlot(precio: never): never {
  throw new Error(`Precio: tipo sin slot (${String(precio)})`)
}
