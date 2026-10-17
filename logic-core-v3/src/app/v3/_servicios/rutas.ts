/**
 * [SERVICIOS S1a] LAS RUTAS — dónde viven las páginas (plan §6 y §7).
 *
 * Con D8 (pasar `/v3` a la raíz) cambia `RAIZ_DE_LAS_PAGINAS` y nada más: todo enlace a una página de servicio
 * sale de `hrefDe`, nadie escribe el prefijo a mano.
 *
 * `PUBLICADOS` (qué slugs sirve la ruta) llega con la ruta, en el S1b.
 */

import type { ServicioSlug } from './tipos'

/** El prefijo de las páginas mientras vivan en `/v3`. */
export const RAIZ_DE_LAS_PAGINAS = '/v3'

/** `/v3/paginas-web`. Se navega con `<a href>` y recarga completa, nunca con `router.push`. */
export function hrefDe(slug: ServicioSlug): string {
  return `${RAIZ_DE_LAS_PAGINAS}/${slug}`
}
