/**
 * [SERVICIOS S1a] LOS TRES SERVICIOS JUNTOS (plan §7 y §12.3).
 *
 * `SERVICIOS` sale de `SLUGS_DE_SERVICIO`: el orden es el del SPEC (§4) y se define en un solo lugar. `POR_SLUG` es un
 * `Record` completo, así que sumar un slug a la lista sin sumar sus datos no compila.
 *
 * Que un servicio exista acá no lo publica: qué páginas sirve la ruta lo decide `PUBLICADOS` (S1b).
 */

import { SLUGS_DE_SERVICIO } from '../tipos'
import type { Servicio, ServicioSlug } from '../tipos'
import { IA_Y_AUTOMATIZACIONES } from './ia-y-automatizaciones'
import { PAGINAS_WEB } from './paginas-web'
import { SOFTWARE_A_MEDIDA } from './software-a-medida'

const POR_SLUG: Readonly<Record<ServicioSlug, Servicio>> = {
  'paginas-web': PAGINAS_WEB,
  'software-a-medida': SOFTWARE_A_MEDIDA,
  'ia-y-automatizaciones': IA_Y_AUTOMATIZACIONES,
}

export function servicioDe(slug: ServicioSlug): Servicio {
  return POR_SLUG[slug]
}

/** Los tres, en el orden del SPEC. */
export const SERVICIOS: readonly Servicio[] = SLUGS_DE_SERVICIO.map((slug) => servicioDe(slug))
