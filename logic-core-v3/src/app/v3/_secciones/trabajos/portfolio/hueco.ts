/**
 * [B1.2c] EL HUECO DEL LOGO, MEDIDO (plan §13, punto 1). La columna que deja el panel es un bloque centrado en el alto: «Portfolio»,
 * la bajada y debajo un hueco vacío (`[data-pieza="hueco-del-logo"]`) que la escena llena con el logo (`poseDelPortfolio.ts`). Así
 * el título y el logo se leen juntos, en el mismo eje, y el título queda cerca del logo en todo cuadro. Se mide en el escenario
 * pegado, sin transformadas (sumando `offsetLeft`/`offsetTop` hasta él), y se pasa a coordenadas del cuadro (−1…1, y arriba).
 */

import type { HuecoDelLogo } from '../../../_lib/escena/portfolioEnLaEscena'

/** La proporción del hueco: la del logo medido (el mesh, `ProbeLogo`: 6,863 × 4,779), para que lo llene por las dos medidas. */
export const PROPORCION_DEL_LOGO = 6.863 / 4.779

/**
 * El estilo del hueco (en línea: no son clases del lane): el ancho de la columna menos su aire, hasta lo que deja un alto del 30 % del
 * cuadro, con la proporción del logo. En la tablet parada la columna es angosta y manda el ancho.
 */
export const ESTILO_DEL_HUECO: React.CSSProperties = {
  width: `min(100%, calc(30svh * ${PROPORCION_DEL_LOGO.toFixed(4)}))`,
  aspectRatio: PROPORCION_DEL_LOGO.toFixed(4),
}

/** El hueco en el cuadro, o `null` si no hay escenario o no se puede medir (la pestaña oculta da 0). */
export function medirElHueco(escenario: HTMLElement | null): HuecoDelLogo | null {
  const hueco = escenario?.querySelector<HTMLElement>('[data-pieza="hueco-del-logo"]') ?? null
  if (escenario === null || hueco === null) return null
  let x = 0
  let y = 0
  let e: HTMLElement | null = hueco
  while (e !== null && e !== escenario) {
    x += e.offsetLeft
    y += e.offsetTop
    e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null
  }
  const ancho = escenario.clientWidth
  const alto = escenario.clientHeight
  if (e !== escenario || !(ancho > 0 && alto > 0) || !(hueco.offsetWidth > 0 && hueco.offsetHeight > 0)) return null
  return huecoEnElCuadro({ x, y, ancho: hueco.offsetWidth, alto: hueco.offsetHeight }, ancho, alto)
}

/** Una caja en px del escenario, en coordenadas del cuadro. Puro (s76). */
export function huecoEnElCuadro(c: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }, ancho: number, alto: number): HuecoDelLogo {
  return { x: ((c.x + c.ancho / 2) / ancho) * 2 - 1, y: 1 - ((c.y + c.alto / 2) / alto) * 2, ancho: (c.ancho / ancho) * 2, alto: (c.alto / alto) * 2 }
}
