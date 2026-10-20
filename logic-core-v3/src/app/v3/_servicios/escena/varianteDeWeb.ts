/**
 * [SERVICIOS V0] LA VARIANTE DE PÁGINAS WEB — los datos, puros (sin react, sin three). Plan: `docs/servicios/SPRINT-V0.md` §3. SIN
 * MONTAR: ningún archivo de la página importa `escena/` todavía.
 *
 * El gesto (VARIANTES.md, «web: el piso brilloso»): de noche, el brillo del piso, las brasas y los rayos toman el celeste de web. El
 * color va SOLO en la luz; ninguna superficie cambia. Lo demás (la curva, la salida, el celular) es la estructura de las tres páginas
 * (`estructura.ts`).
 */

import type { NivelDeCalidad } from '../../_lib/escena/calidad'
import type { IdDeServicio } from '../../_secciones/_contrato/acento'
import { tokenDelAcentoClaro } from '../estiloDelAcento'
import { escenaDeLaVariante, parametrosEnElAvance, type ParametrosDeLaEscena } from './estructura'

export const SERVICIO_DE_LA_VARIANTE: IdDeServicio = 'web'

/**
 * El celeste de web: el claro del tema, `--color-acento-web-claro` (`src/app/theme-develop.css:356`). Es el que `[data-servicio="web"]`
 * pone en `--color-acento-claro` (`:1366-1369`), la regla con la que la sección Servicios del home marca su bloque de web
 * (`_secciones/servicios/Servicios.tsx:120`). La ranura lo lee del token una vez por montaje (SPRINT-B12a §3.4): acá no se escribe.
 */
export const TOKEN_DE_LA_LUZ = tokenDelAcentoClaro(SERVICIO_DE_LA_VARIANTE)

/** La variante encendida, de la mitad de la intro al final: de noche, el piso con toda su luz, y el celeste en la luz del piso y de la energía. */
export const WEB_ENCENDIDA: ParametrosDeLaEscena = { noche: 1, brilloDelPiso: 1, tinteDelPiso: 1, tinteDeLaEnergia: 1 }

/** La luz de Páginas web en un avance de la intro (0 → 1). */
export function parametrosDeWeb(avance: number, reducido: boolean): ParametrosDeLaEscena {
  return parametrosEnElAvance(WEB_ENCENDIDA, avance, reducido)
}

/** La escena de Páginas web en un avance y una calidad. */
export function escenaDeWeb(avance: number, calidad: NivelDeCalidad, reducido: boolean): ReturnType<typeof escenaDeLaVariante> {
  return escenaDeLaVariante(WEB_ENCENDIDA, avance, calidad, reducido)
}
