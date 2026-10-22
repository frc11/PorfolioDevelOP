import type { PresetDeLaEscena } from './preset'

/**
 * [T0 · 2026-10-22] 11 · 1 · LA ESCENA DE LA RUTA, LISTA — el color de la página (la noche y el acento) desde el primer cuadro.
 *
 * La noche la pone el rig en su cuadro con el preset (`luzDeLaPagina`); el acento y la luz de abajo los pone la VARIANTE de la página, que
 * se carga con un import dinámico (`_variantes/registro.ts`). Entrando por el velo (un enlace o la flecha), el velo destapaba apenas la
 * página estaba montada y pintada dos cuadros: si la variante todavía no había llegado, los primeros cuadros destapados eran la
 * composición en blanco y el acento aparecía después. Ahora el velo espera también a que la variante de la página haya DIBUJADO un
 * cuadro (con el techo de emergencia de siempre, `VELO.esperaMaximaMs`).
 *
 * La ranura (`RanuraDeLaVariante`) anota la variante que ya dibujó (`VARIANTE_DIBUJADA`, al final de su cuadro) y publica cómo responder
 * (`RANURA_EN_VIVO.lista`); el velo pregunta con `escenaDeLaRutaLista`. Sin lienzo (sin la ranura montada), o sin su primer cuadro (sin
 * WebGL), la escena no tiene nada que esperar: lista.
 */

/** La variante que ya dibujó un cuadro: `pagina:variante` (la escribe la ranura; `null`, ninguna). */
export const VARIANTE_DIBUJADA: { clave: string | null } = { clave: null }

/** Cómo responde la ranura montada (`null`: no hay ranura, no hay lienzo). */
export const RANURA_EN_VIVO: { lista: (() => boolean) | null } = { lista: null }

/** La clave de la variante de una página: la de su preset. */
export const claveDeLaVariante = (pagina: string, variante: string): string => `${pagina}:${variante}`

/**
 * ¿La escena ya muestra a la página? Sin escena (`hayEscena` falso: sin lienzo o sin su primer cuadro), sin preset, sin variante o con la
 * variante apagada a propósito (el banco que mide su costo), sí; con variante, cuando esa variante (la de ESTA página) ya dibujó.
 */
export function escenaLista(preset: Pick<PresetDeLaEscena, 'id' | 'variante'> | null, dibujada: string | null, hayEscena: boolean, sinVariante = false): boolean {
  if (!hayEscena || sinVariante || preset === null || preset.variante === null) return true
  return dibujada === claveDeLaVariante(preset.id, preset.variante)
}

/** Lo que lee el velo antes de destapar: lo que dice la ranura montada; sin ranura, lista. */
export function escenaDeLaRutaLista(): boolean {
  return RANURA_EN_VIVO.lista?.() ?? true
}
