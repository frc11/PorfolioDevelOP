/**
 * [SERVICIOS S2] LA LÓGICA DEL SLOT `proyecto` (software a medida) — qué se muestra, sin markup.
 *
 * Datos puros: importa `formato` y tipos, nada de react ni de next, así que se prueba con `npx tsx` sin renderizar. El monto sale
 * del dato por `usd()`: ninguna cifra se escribe acá (y el test lo cruza contra `PRECIOS_DESDE`, la fuente de los «desde»).
 */

import { usd } from '../../formato'
import type { Precio } from '../../tipos'

export type PrecioPorProyecto = Extract<Precio, { readonly tipo: 'proyecto' }>

export interface VistaDelPrecioDeUnProyecto {
  /** «USD 1.000». El «desde» es el rótulo, y lo pone el componente. */
  readonly monto: string
  /** La aclaración del SPEC («se cotiza según lo que necesites»). */
  readonly nota: string
}

export function vistaDelPrecioDeUnProyecto(precio: PrecioPorProyecto): VistaDelPrecioDeUnProyecto {
  return { monto: usd(precio.desde), nota: precio.nota }
}
