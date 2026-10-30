import type { EnlaceDeNavegacion } from '../_lib/navegacion'
import { RUTA_DEL_HOME } from '../_lib/veloDeNavegacion'
import { hrefDe } from '../_servicios/direcciones'

/** [B12a.5] El home (`/v3`; con D8, `/`). [B12a.6] Declarado con la señal del velo (`_lib/veloDeNavegacion.ts`), que `_componentes` también lee. */
export { RUTA_DEL_HOME }

/**
 * [B12a.5 · L7a] LAS PÁGINAS DE SERVICIO, PARA LA NAVBAR — el desplegable de «Servicios» (D5) y su acordeón en el menú del teléfono. [L7a]
 * La ruta sale de servicios (`hrefDe`, `_servicios/direcciones.ts`); el rótulo es el nombre de cada página (su `h1`): «Desarrollo web»
 * (el nombre del servicio en el home) e «Integraciones con IA» (el renombre de L7a). Los rótulos van escritos y no leídos de los datos de
 * servicios, para no arrastrar los datos de las páginas a la barra; el test de servicios los compara.
 */
export const PAGINAS_DE_SERVICIO: readonly EnlaceDeNavegacion[] = [
  { id: 'paginas-web', rotulo: 'Desarrollo web', destino: hrefDe('paginas-web') },
  { id: 'software-a-medida', rotulo: 'Software a medida', destino: hrefDe('software-a-medida') },
  { id: 'ia-y-automatizaciones', rotulo: 'Integraciones con IA', destino: hrefDe('ia-y-automatizaciones') },
]

/** [B12a.8] «Servicios» en la barra: un enlace a la sección del home (el viaje; desde una página, el home con el velo). La lista abre aparte. */
export const SERVICIOS_DEL_HOME: EnlaceDeNavegacion = { id: 'servicios', rotulo: 'Servicios', destino: '#servicios' }

/** [B12a.8] «Home», el primero: en el home, el viaje al hero (arriba); desde una página, el home arriba (sin ancla), con el velo. */
export const HOME: EnlaceDeNavegacion = { id: 'hero', rotulo: 'Home', destino: '#hero' }

/**
 * [B12a.5] El destino de un enlace del chrome desde la ruta de ahora: en el home, el ancla (el viaje la recorre); en una página, el home
 * con el ancla ([B12a.8] «Home», el home a secas: arriba). Sin ruta (fuera de Next: los invariantes), la del home.
 */
export function destinoDesde(ruta: string | null, destino: string): string {
  if (!destino.startsWith('#') || ruta === null || ruta === RUTA_DEL_HOME) return destino
  return destino === HOME.destino ? RUTA_DEL_HOME : `${RUTA_DEL_HOME}${destino}`
}
