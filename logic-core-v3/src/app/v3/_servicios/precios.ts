/**
 * [SERVICIOS S1a] LOS PRECIOS «DESDE» — para B4 y para quien necesite el número sin traer el template (plan §8.5).
 *
 * Sin componentes: este archivo importa solo `tipos.ts` y los datos (`datos/*.ts`), que son textos y números. Ni
 * `.tsx`, ni react, ni next, ni `proyectos.ts` (que desde B1.1b arrastra la llave del contenido inventado). Lo
 * vigila `precios.invariant.ts` recorriendo el grafo de imports.
 *
 * `PRECIOS_DESDE` se DERIVA de los datos y nunca se escribe a mano:
 *   · calibres → el menor `desde`;
 *   · proyecto → su `desde`;
 *   · planes → el menor `mensual`, con periodo mensual.
 * Los tres servicios tienen datos completos desde el S1a, así que `precioDesde` devuelve siempre un `PrecioDesde`.
 */

import { servicioDe } from './datos/servicios'
import type { Precio, ServicioSlug } from './tipos'

export interface PrecioDesde {
  readonly usd: number
  readonly periodo: 'unico' | 'mensual'
}

/** El «desde» de un precio. Exportada para que el test pruebe la derivación con un precio armado a propósito. */
export function precioDesdeDe(precio: Precio): PrecioDesde {
  switch (precio.tipo) {
    case 'calibres':
      return { usd: Math.min(...precio.calibres.map((calibre) => calibre.desde)), periodo: 'unico' }
    case 'proyecto':
      return { usd: precio.desde, periodo: 'unico' }
    case 'planes':
      return { usd: Math.min(...precio.planes.map((plan) => plan.mensual)), periodo: 'mensual' }
  }
}

const desde = (slug: ServicioSlug): PrecioDesde => precioDesdeDe(servicioDe(slug).precio)

/** Un `Record` completo: sumar un slug sin sumar su precio no compila. */
export const PRECIOS_DESDE: Readonly<Record<ServicioSlug, PrecioDesde>> = {
  'paginas-web': desde('paginas-web'),
  'software-a-medida': desde('software-a-medida'),
  'ia-y-automatizaciones': desde('ia-y-automatizaciones'),
}

export function precioDesde(slug: ServicioSlug): PrecioDesde {
  return PRECIOS_DESDE[slug]
}
