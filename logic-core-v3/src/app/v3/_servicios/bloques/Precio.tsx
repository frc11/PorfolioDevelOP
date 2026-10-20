/**
 * [SERVICIOS S1b/S2 · M2a · M2b] 4 · PRECIO — elige el slot según `precio.tipo` (SPEC §5: calibres en web, proyecto en software, planes en IA).
 *
 * El `switch` es exhaustivo: si alguien suma un tipo de precio sin su rama, esto deja de compilar. Cada slot saca lo que muestra de
 * los datos (`precio/vistaDelPrecioPorProyecto.ts`, `precio/vistaDeLosPlanes.ts` y [M2a] `precio/tresOpciones.ts` son la lógica, sin
 * markup) y lo que falta ([a definir]) se ve solo en desarrollo: en producción ese ítem no se monta, y nunca sale un número inventado.
 *
 * Los calibres van en DOS versiones dentro de la misma sección, y el CSS elige (como los planes de IA desde el S2c):
 *   · [M2b] por debajo de 768, las historias (`movimiento/PrecioEnHistorias.tsx`): el título y las tres opciones, una por pantalla, con
 *     las historias comunes del home; con movimiento reducido, las tres quietas, una debajo de la otra;
 *   · [M2a] desde 768, las diagonales (`precio/Diagonales.tsx`): la sección anclada a pantalla completa, con el título solo para lectores.
 * La que no toca va con `display: none`: ni se ve, ni la lee el lector de pantalla, ni la alcanza el teclado. Las dos salen de la misma
 * vista (`tresOpciones.ts`).
 */

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { PrecioEnHistorias } from '../movimiento/PrecioEnHistorias'
import type { Precio as DatosDePrecio } from '../tipos'
import { Bloque, CLASES_DEL_PAPEL, EncabezadoDelBloque, idDelTituloDe } from './Bloque'
import { Diagonales } from './precio/Diagonales'
import { pasosDelPrecio } from './precio/historiasDelPrecio'
import { ListaDeLosPasos } from './precio/PantallaDelPaso'
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
    const vista = tresOpcionesDeLosCalibres(precio.calibres, precio.destacada, enDesarrollo)
    const pasos = pasosDelPrecio(vista)
    return (
      <section data-bloque="precio" aria-labelledby={idDelTituloDe('precio')} className={CLASES_DEL_PAPEL}>
        <div data-precio="historias" className="md:hidden">
          <PrecioEnHistorias
            pasos={pasos}
            encabezado={
              <Envoltorio>
                <EncabezadoDelBloque nombre="precio" titulo={TITULO} />
              </Envoltorio>
            }
          >
            <ListaDeLosPasos pasos={pasos} />
          </PrecioEnHistorias>
        </div>
        <div data-precio="diagonales" className="max-md:hidden">
          <Diagonales vista={vista} titulo={TITULO} />
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

/** [M2b] Los calibres arman su sección arriba: al slot llegan los otros dos tipos. */
type PrecioDeUnBloque = Exclude<DatosDePrecio, { readonly tipo: 'calibres' }>

function contenidoDelSlot(precio: PrecioDeUnBloque, enDesarrollo: boolean): React.JSX.Element {
  switch (precio.tipo) {
    case 'proyecto':
      return <Proyecto precio={precio} />
    case 'planes':
      return <Planes precio={precio} enDesarrollo={enDesarrollo} />
    default:
      return sinSlot(precio)
  }
}

/** El `default` del `switch`: con los tipos cubiertos `precio` es `never`; un tipo nuevo sin rama no compila. */
function sinSlot(precio: never): never {
  throw new Error(`Precio: tipo sin slot (${String(precio)})`)
}
