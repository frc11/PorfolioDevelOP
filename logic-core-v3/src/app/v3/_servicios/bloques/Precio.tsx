/**
 * [SERVICIOS S1b] 4 · PRECIO — elige el slot según `precio.tipo` (SPEC §5: calibres en web, proyecto en software, planes en IA).
 *
 * El `switch` es exhaustivo: si alguien suma un tipo de precio sin su rama, esto deja de compilar. Los slots `proyecto` y
 * `planes` son del S2: hasta entonces, en desarrollo muestran el marcador y en producción no montan nada (ni el bloque),
 * así que nunca sale un número inventado.
 */

import type { Precio as DatosDePrecio } from '../tipos'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { textoOMarcador } from '../formato'
import { Bloque } from './Bloque'
import { Calibres } from './precio/Calibres'

const TITULO = 'Precio' // C2: provisorio (el nombre de SPEC §5)

interface PrecioProps {
  readonly precio: DatosDePrecio
  readonly enDesarrollo: boolean
}

export function Precio({ precio, enDesarrollo }: PrecioProps): React.JSX.Element | null {
  const contenido = contenidoDelSlot(precio, enDesarrollo)
  if (contenido === null) return null
  return (
    <Bloque nombre="precio" titulo={TITULO}>
      {contenido}
    </Bloque>
  )
}

function contenidoDelSlot(precio: DatosDePrecio, enDesarrollo: boolean): React.JSX.Element | null {
  switch (precio.tipo) {
    case 'calibres':
      return <Calibres calibres={precio.calibres} enDesarrollo={enDesarrollo} />
    case 'proyecto': // S2: bloques/precio/Proyecto.tsx
    case 'planes': // S2: bloques/precio/Planes.tsx
      return slotSinComponente(enDesarrollo)
    default:
      return sinSlot(precio)
  }
}

function slotSinComponente(enDesarrollo: boolean): React.JSX.Element | null {
  const marcador = textoOMarcador(null, enDesarrollo)
  return marcador === null ? null : <Cuerpo className="text-tinta-media">{marcador}</Cuerpo>
}

/** El `default` del `switch`: con los tres tipos cubiertos `precio` es `never`; un tipo nuevo sin rama no compila. */
function sinSlot(precio: never): never {
  throw new Error(`Precio: tipo sin slot (${String(precio)})`)
}
