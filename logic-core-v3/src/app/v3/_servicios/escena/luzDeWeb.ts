/**
 * [SERVICIOS V0 · V1] LA LUZ DE PÁGINAS WEB — los datos, puros (sin react, sin three). Plan: `docs/servicios/SPRINT-V0.md` §3. La monta
 * `VarianteDeWeb.tsx` (el componente de la ranura); se llamaba `varianteDeWeb.ts` y cambió de nombre para no chocar con él (Windows).
 *
 * El gesto (VARIANTES.md, «web: el piso brilloso»), lo que decidió Valentino: de noche, la luz de abajo del piso (la del pie 3D, la que sale
 * entre los bloques) encendida en la intro, y el brillo del piso, las brasas y los rayos en el celeste de web. El color va SOLO en la luz;
 * ninguna superficie cambia. Lo demás (la curva, la salida, el celular) es la estructura de las tres páginas (`estructura.ts`).
 */

import type { IdDeServicio } from '../../_secciones/_contrato/acento'
import { tokenDelAcentoClaro } from '../estiloDelAcento'
import { parametrosEnElAvance, type ParametrosDeLaEscena } from './estructura'

export const SERVICIO_DE_LA_VARIANTE: IdDeServicio = 'web'

/**
 * El celeste de web: el claro del tema, `--color-acento-web-claro` (`src/app/theme-develop.css:356`). Es el que `[data-servicio="web"]`
 * pone en `--color-acento-claro` (`:1366-1369`). La ranura lo lee del token al cargar la variante (`acento`, B12a-API §4): acá no se escribe.
 */
export const TOKEN_DE_LA_LUZ = tokenDelAcentoClaro(SERVICIO_DE_LA_VARIANTE)

/** La variante encendida, de la mitad de la intro al final: el piso con toda su luz, y el celeste en la luz del piso y en la energía. */
export const WEB_ENCENDIDA: ParametrosDeLaEscena = { brilloDelPiso: 1, tinteDelPiso: 1, tinteDeLaEnergia: 1 }

/** La luz de Páginas web en un avance de la intro (0 → 1). */
export function parametrosDeWeb(avance: number, reducido: boolean): ParametrosDeLaEscena {
  return parametrosEnElAvance(WEB_ENCENDIDA, avance, reducido)
}
