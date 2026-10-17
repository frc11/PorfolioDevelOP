/**
 * [SERVICIOS S1b/S2] 4 · PRECIO — elige el slot según `precio.tipo` (SPEC §5: calibres en web, proyecto en software, planes en IA).
 *
 * El `switch` es exhaustivo: si alguien suma un tipo de precio sin su rama, esto deja de compilar. Cada slot saca lo que muestra de
 * los datos (`precio/vistaDelPrecioPorProyecto.ts` y `precio/vistaDeLosPlanes.ts` son la lógica, sin markup) y lo que falta ([a definir]) se ve solo en
 * desarrollo: en producción ese ítem no se monta, y nunca sale un número inventado.
 */

import type { Precio as DatosDePrecio } from '../tipos'
import { Bloque } from './Bloque'
import { Calibres } from './precio/Calibres'
import { Planes } from './precio/Planes'
import { Proyecto } from './precio/Proyecto'

const TITULO = 'Precio' // C2: provisorio (el nombre de SPEC §5)

interface PrecioProps {
  readonly precio: DatosDePrecio
  readonly enDesarrollo: boolean
}

export function Precio({ precio, enDesarrollo }: PrecioProps): React.JSX.Element {
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
