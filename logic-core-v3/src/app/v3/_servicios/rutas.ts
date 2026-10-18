/**
 * [SERVICIOS S1a/S1b] LAS RUTAS — dónde viven las páginas (plan §6 y §7).
 *
 * Con D8 (pasar `/v3` a la raíz) cambian `RAIZ_DE_LAS_PAGINAS` y `HREF_DEL_HOME` y nada más: todo enlace a una página de
 * servicio sale de `hrefDe`, nadie escribe el prefijo a mano.
 *
 * `PUBLICADOS` es lo único que decide qué páginas sirve la ruta: `generateStaticParams` sale de acá y todo lo demás da 404,
 * aunque los datos del servicio existan. Está aparte de `SERVICIOS` a propósito (§12.3).
 */

import { ANCLAS_DEL_PORTFOLIO } from '../_secciones/trabajos/portfolio/anclas'
import { FUENTE_DE_PROYECTOS } from './datos/fuenteDeProyectos'
import type { ProyectoSlug, ServicioSlug } from './tipos'

/** El prefijo de las páginas mientras vivan en `/v3`. */
export const RAIZ_DE_LAS_PAGINAS = '/v3'

/** El home. Hoy coincide con el prefijo de las páginas; con D8 deja de coincidir (las páginas a `/x`, el home a `/`). */
export const HREF_DEL_HOME = '/v3'

/**
 * El origen del sitio, para las URLs absolutas del JSON-LD (las migas y la dirección del servicio). Es el `metadataBase` del layout
 * raíz (`src/app/layout.tsx`), que no se puede importar (trae CSS y componentes): `seo.invariant.ts` compara los dos.
 */
export const ORIGEN_DEL_SITIO = 'https://develop.com.ar'

/** La URL absoluta de una ruta del sitio: `urlAbsolutaDe(hrefDe('paginas-web'))`. */
export function urlAbsolutaDe(ruta: string): string {
  return `${ORIGEN_DEL_SITIO}${ruta}`
}

/**
 * Las páginas que la ruta sirve: los tres servicios, en el orden del SPEC (S2b; hasta el S2 era solo `paginas-web`). Sacar uno de
 * acá lo devuelve a 404 y lo saca del cierre de las otras páginas, sin tocar nada más.
 */
export const PUBLICADOS: readonly ServicioSlug[] = ['paginas-web', 'software-a-medida', 'ia-y-automatizaciones']

/** `/v3/paginas-web`. Se navega con `<a href>` y recarga completa, nunca con `router.push`. */
export function hrefDe(slug: ServicioSlug): string {
  return `${RAIZ_DE_LAS_PAGINAS}/${slug}`
}

/**
 * [M1] El deep link de un caso en el Portfolio del home: `/v3#portfolio-el-garage`. Es el formato de B1
 * (`docs/rediseno/SPRINT-B1-PORTFOLIO.md:471`): un ancla por proyecto, en el paso de su portada. El id no se escribe acá: se toma de
 * las anclas del home (`_secciones/trabajos/portfolio/anclas.ts:18-21`) por el lugar del proyecto en `PROYECTOS`, que es el paso
 * del ancla. `null` si el proyecto no está en el Portfolio.
 */
export function hrefDelCasoEnElPortfolio(slug: ProyectoSlug): string | null {
  const paso = FUENTE_DE_PROYECTOS.findIndex((proyecto) => proyecto.slug === slug)
  const ancla = ANCLAS_DEL_PORTFOLIO.find((candidata) => candidata.paso === paso)
  return paso < 0 || ancla === undefined ? null : `${HREF_DEL_HOME}#${ancla.id}`
}
