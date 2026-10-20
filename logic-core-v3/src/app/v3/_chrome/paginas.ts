import type { EnlaceDeNavegacion } from '../_lib/navegacion'

/** [B12a.5] El home (`/v3`; con D8, `/`). */
export const RUTA_DEL_HOME = '/v3'

/**
 * [B12a.5] LAS PÁGINAS DE SERVICIO, PARA LA NAVBAR — el desplegable de «Servicios» (D5) y su acordeón en el menú del teléfono. Los datos
 * son de servicios: la ruta, `hrefDe` con los `PUBLICADOS` en su orden (`_servicios/rutas.ts`), y el rótulo, su `NOMBRE`
 * (`_servicios/datos/*.ts`), en paginas/servicios. Van copiados acá hasta el merge; después se importan de ahí (un P-S chico).
 */
export const PAGINAS_DE_SERVICIO: readonly EnlaceDeNavegacion[] = [
  { id: 'paginas-web', rotulo: 'Páginas web', destino: '/v3/paginas-web' },
  { id: 'software-a-medida', rotulo: 'Software a medida', destino: '/v3/software-a-medida' },
  { id: 'ia-y-automatizaciones', rotulo: 'IA y automatizaciones', destino: '/v3/ia-y-automatizaciones' },
]

/** [B12a.5] El primero del desplegable: la sección de Servicios del home (el viaje de siempre, o el home desde una página). */
export const TODOS_LOS_SERVICIOS: EnlaceDeNavegacion = { id: 'servicios', rotulo: 'Todos los servicios', destino: '#servicios' }

/**
 * [B12a.5] El destino de un enlace del chrome desde la ruta de ahora: en el home, el ancla (el viaje la recorre); en una página, el home
 * con el ancla (hasta B12a.6, con recarga). Sin ruta (fuera de Next: los invariantes), la del home.
 */
export function destinoDesde(ruta: string | null, destino: string): string {
  return destino.startsWith('#') && ruta !== null && ruta !== RUTA_DEL_HOME ? `${RUTA_DEL_HOME}${destino}` : destino
}
