/**
 * [L7a] LAS DIRECCIONES DE LAS PÁGINAS — puro: sin componentes y sin los datos del Portfolio (`rutas.ts` los trae para el deep link de un
 * caso). Lo importa el home (la sección Servicios: el viaje del CTA, el desplegable de la navbar) sin arrastrar nada más. `rutas.ts` lo
 * reexporta: la API de servicios no cambia.
 *
 * Con D8 (pasar `/v3` a la raíz) cambian `RAIZ_DE_LAS_PAGINAS` y `HREF_DEL_HOME` y nada más.
 */

import type { IdDeServicio } from '../_secciones/_contrato/acento'
import type { ServicioSlug } from './tipos'

/** El prefijo de las páginas mientras vivan en `/v3`. */
export const RAIZ_DE_LAS_PAGINAS = '/v3'

/** El home. Hoy coincide con el prefijo de las páginas; con D8 deja de coincidir (las páginas a `/x`, el home a `/`). */
export const HREF_DEL_HOME = '/v3'

/** `/v3/paginas-web`. Se navega con `EnlaceDeRuta` (el velo) o el viaje del home, nunca con `router.push`. */
export function hrefDe(slug: ServicioSlug): string {
  return `${RAIZ_DE_LAS_PAGINAS}/${slug}`
}

/** El slug de la página de cada servicio del home. [L7a] Los slugs no cambian con los nombres (Integraciones con IA sigue en `ia-y-automatizaciones`). */
export const SLUG_DEL_SERVICIO: Readonly<Record<IdDeServicio, ServicioSlug>> = {
  web: 'paginas-web',
  software: 'software-a-medida',
  'ia-automatizacion': 'ia-y-automatizaciones',
}

/** La página de cada servicio del home: el destino del CTA, del título, del video y del «Ver la página de…» del recomendador. */
export const HREF_DEL_SERVICIO: Readonly<Record<IdDeServicio, string>> = {
  web: hrefDe(SLUG_DEL_SERVICIO.web),
  software: hrefDe(SLUG_DEL_SERVICIO.software),
  'ia-automatizacion': hrefDe(SLUG_DEL_SERVICIO['ia-automatizacion']),
}
