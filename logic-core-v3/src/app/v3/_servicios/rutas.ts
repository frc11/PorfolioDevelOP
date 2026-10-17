/**
 * [SERVICIOS S1a/S1b] LAS RUTAS — dónde viven las páginas (plan §6 y §7).
 *
 * Con D8 (pasar `/v3` a la raíz) cambian `RAIZ_DE_LAS_PAGINAS` y `HREF_DEL_HOME` y nada más: todo enlace a una página de
 * servicio sale de `hrefDe`, nadie escribe el prefijo a mano.
 *
 * `PUBLICADOS` es lo único que decide qué páginas sirve la ruta: `generateStaticParams` sale de acá y todo lo demás da 404,
 * aunque los datos del servicio existan. Está aparte de `SERVICIOS` a propósito (§12.3).
 */

import type { ServicioSlug } from './tipos'

/** El prefijo de las páginas mientras vivan en `/v3`. */
export const RAIZ_DE_LAS_PAGINAS = '/v3'

/** El home. Hoy coincide con el prefijo de las páginas; con D8 deja de coincidir (las páginas a `/x`, el home a `/`). */
export const HREF_DEL_HOME = '/v3'

/** Las páginas que la ruta sirve. S1b: solo Páginas web. El S2 suma las otras dos cambiando esta línea. */
export const PUBLICADOS: readonly ServicioSlug[] = ['paginas-web']

/** `/v3/paginas-web`. Se navega con `<a href>` y recarga completa, nunca con `router.push`. */
export function hrefDe(slug: ServicioSlug): string {
  return `${RAIZ_DE_LAS_PAGINAS}/${slug}`
}
