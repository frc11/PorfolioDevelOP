/**
 * [SERVICIOS M2a] EL SLOT «TRES OPCIONES» — la firma de datos del precio en diagonales (M0 §3.6). Pura, como `vistaDeLosPlanes.ts`:
 * sin react ni next.
 *
 * Lo que el slot pinta es SIEMPRE esto: tres opciones (por tipo, no por convención), cada una con su nombre, el rótulo y el monto del
 * precio y sus líneas, y la destacada, que va al medio. Páginas web llega desde los calibres (`tresOpcionesDeLosCalibres`). IA puede
 * llegar después desde sus planes con su propio adaptador (rótulo «Por mes», líneas de conversaciones, soporte y cambios web): la
 * firma ya lo admite y no se aplica todavía.
 *
 * Lo que falta sigue la regla de siempre: el marcador [a definir] solo en desarrollo, y en producción la línea no existe.
 */

import { textoOMarcador, usd } from '../../formato'
import type { Calibre, Destacada } from '../../tipos'
import { ROTULO_AUTOGESTIONABLE, ROTULO_DEL_PRECIO } from './rotulos'

export interface OpcionDeTres {
  readonly nombre: string
  /** «Desde» en web; «Por mes» en IA, cuando llegue. */
  readonly rotuloDelPrecio: string
  /** Ya formateado (`usd()`): «USD 200». */
  readonly precio: string
  readonly lineas: readonly string[]
}

export interface VistaDeTresOpciones {
  readonly opciones: readonly [OpcionDeTres, OpcionDeTres, OpcionDeTres]
  /** La del medio, siempre: la geometría la pone al centro. `null` = ninguna destacada. */
  readonly destacada: Pick<Destacada, 'marca' | 'linea'> | null
}

function lineasDelCalibre(calibre: Calibre, enDesarrollo: boolean): string[] {
  const lineas = [calibre.descripcion]
  if (calibre.autogestionable === true) lineas.push(ROTULO_AUTOGESTIONABLE)
  if (calibre.autogestionable === null) {
    const pendiente = textoOMarcador(null, enDesarrollo)
    if (pendiente !== null) lineas.push(`${ROTULO_AUTOGESTIONABLE}: ${pendiente}`)
  }
  return lineas
}

/** Los calibres de web en el slot. Tira si no son tres o si la destacada no es la del medio: el slot no sabe pintar otra cosa. */
export function tresOpcionesDeLosCalibres(calibres: readonly Calibre[], destacada: Destacada | null, enDesarrollo: boolean): VistaDeTresOpciones {
  const [a, b, c] = calibres
  if (calibres.length !== 3 || a === undefined || b === undefined || c === undefined) throw new Error(`tres opciones: vinieron ${calibres.length} calibres`)
  if (destacada !== null && destacada.nombre !== b.nombre) throw new Error(`tres opciones: la destacada (${destacada.nombre}) no es la del medio (${b.nombre})`)
  const opcion = (calibre: Calibre): OpcionDeTres => ({
    nombre: calibre.nombre,
    rotuloDelPrecio: ROTULO_DEL_PRECIO,
    precio: usd(calibre.desde),
    lineas: lineasDelCalibre(calibre, enDesarrollo),
  })
  return { opciones: [opcion(a), opcion(b), opcion(c)], destacada: destacada === null ? null : { marca: destacada.marca, linea: destacada.linea } }
}
