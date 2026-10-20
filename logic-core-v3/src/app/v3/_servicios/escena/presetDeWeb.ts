/**
 * [SERVICIOS V0] EL PRESET DE PÁGINAS WEB — lo que la página le va a declarar a la escena (SPRINT-B12a §3.1, D1). Puro. SIN MONTAR.
 * Plan: `docs/servicios/SPRINT-V0.md` §3.
 *
 * Va aparte de `varianteDeWeb.ts` porque es del lado de la página (lee el atributo de la intro), no del lienzo. La pista (la intro
 * compartida, B12a.2) y el componente de la variante (B12a.7) todavía no existen: entran como argumentos cuando lleguen.
 */

import { ATRIBUTO_DE_LA_INTRO } from '../Intro'
import type { ComponenteDeVariante, PresetDeLaEscena } from './firmas'
import { SERVICIO_DE_LA_VARIANTE } from './varianteDeWeb'

/** El bloque que ancla el avance de la intro: el de `Intro.tsx`. El del pie llega con B13. */
export const TRAMOS_DE_WEB: NonNullable<PresetDeLaEscena['tramos']> = { intro: `[${ATRIBUTO_DE_LA_INTRO}]`, pie: null }

export function presetDeWeb(pista: PresetDeLaEscena['pista'], variante: ComponenteDeVariante | null): PresetDeLaEscena {
  return { id: SERVICIO_DE_LA_VARIANTE, pista, tramos: TRAMOS_DE_WEB, noche: 'noche', acento: SERVICIO_DE_LA_VARIANTE, variante }
}
