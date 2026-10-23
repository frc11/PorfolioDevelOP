/**
 * [NOCTURNO B3] RESEÑAS → CTA, PURO (lo recorre `s83`). Después del tramo de las reseñas sigue la transformación al CTA de siempre
 * (`ctaDelFinal/transformacion.ts`: el cartel se junta, gira sobre Y —de canto en la mitad— y del otro lado está «HABLANOS»; la cámara sube a
 * C como antes). Con las reseñas, su origen es el título de las reseñas (lo que se da vuelta y se vuelve el CTA) y, AL MISMO TIEMPO que ese
 * giro, en el piso se abre un anillo bajo el aro y las reseñas bajan por ahí. Todo función del progreso de la transformación `p` (0 a 1, el
 * del CTA): al subir, todo vuelve. Con `?resenas=gatillo`, la bajada (y su anillo) es una animación por tiempo que se dispara al empezar la
 * transformación y vuelve al subir.
 */

import { TRANSFORMACION } from '../../../_lib/escena/ctaDelFinal/transformacion'

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const tramo = (x: number, desde: number, dura: number): number => acotar01((x - desde) / dura)
const suave = (u: number): number => u * u * (3 - 2 * u)

/** El giro del cartel en la transformación (fracciones de `p`): de `desde` a `desde + gira`. La bajada termina con él. */
const GIRO = { desde: TRANSFORMACION.giro.desde, hasta: TRANSFORMACION.giro.desde + TRANSFORMACION.giro.gira }

export const HACIA_EL_CTA = {
  /** El anillo se abre un poco antes de que las placas empiecen a bajar, y se cierra cuando ya no queda ninguna. */
  abre: [GIRO.desde - 0.16, 0.12],
  baja: [GIRO.desde - 0.06, GIRO.hasta - (GIRO.desde - 0.06)],
  cierra: [GIRO.hasta + 0.02, 0.14],
  /** Con el gatillo: la animación (s) y dónde se dispara (p). */
  gatillo: { duracionS: 2.2, entra: 0.04, sale: 0.01 },
} as const

/** La bajada de las placas (0, en el aro; 1, se fueron por el hueco) con el progreso de la transformación (o la animación del gatillo). */
export function bajadaDeLasResenas(p: number): number {
  return suave(tramo(p, HACIA_EL_CTA.baja[0], HACIA_EL_CTA.baja[1]))
}

/** Cuánto está abierto el anillo del piso. */
export function aperturaDelHueco(p: number): number {
  return suave(tramo(p, HACIA_EL_CTA.abre[0], HACIA_EL_CTA.abre[1])) * (1 - suave(tramo(p, HACIA_EL_CTA.cierra[0], HACIA_EL_CTA.cierra[1])))
}

/** Con el gatillo, la animación por tiempo (0 a 1) lleva a `p` por la ventana entera de la bajada (abre, baja y cierra). */
export const progresoDelGatillo = (t: number): number => HACIA_EL_CTA.abre[0] + acotar01(t) * (HACIA_EL_CTA.cierra[0] + HACIA_EL_CTA.cierra[1] - HACIA_EL_CTA.abre[0])

/** El gatillo de la bajada: adónde va (1, la transformación empezó; 0, volvió a su arranque), con margen para no titilar. */
export function objetivoDeLaBajada(p: number, previo: 0 | 1): 0 | 1 {
  if (previo === 0) return p > HACIA_EL_CTA.gatillo.entra ? 1 : 0
  return p < HACIA_EL_CTA.gatillo.sale ? 0 : 1
}

/**
 * [C2-70e] LA CÁMARA ACOMPAÑA EL GUARDADO (con el gatillo): cuánto se queda en la pose de las reseñas y mira al hueco (el peso del desvío,
 * `_lib/escena/resenas/camaraDelGuardado.ts`), en fracciones de la animación de la bajada `t`: llega mientras se abre el anillo (antes de
 * que la primera placa baje), se sostiene mientras bajan y suelta cuando ya se fueron (la bajada pasó `suelta`), hasta 0 al cerrarse el
 * anillo: ahí la cámara pasa al CTA. `margen`: si el scroll ya pasó mucho de la llegada a C (el progreso de la transformación), el CTA
 * manda y el desvío se apaga con el scroll. Fuera de la animación, 0: antes y después del guardado la cámara es la de siempre.
 * [C2-70e, verificación] Y EL CTA ESPERA A LA CÁMARA (`esperaDelCta`): con la cámara en B, el cartel del CTA (anclado en el plano de C) se
 * veía grande y cortado arriba. Mientras dura el guardado la transformación no arranca (el título queda centrado, en su lugar) y suelta
 * un poco DESPUÉS que la cámara (`ctaSuelta`; la cámara suelta de `suelta` a `soltada`): con la inercia del rig la cámara llega detrás de
 * su objetivo, y así el cartel nunca se adelanta a ella (s83 §16 lo simula cuadro a cuadro). Primero se enfoca el guardado, después se
 * pasa al CTA.
 */
export const CAMARA_DEL_GUARDADO_EN_EL_GATILLO = { llega: 0.13, suelta: 0.66, soltada: 0.9, ctaSuelta: 0.72, margen: [0.4, 0.2] } as const

const C_G = CAMARA_DEL_GUARDADO_EN_EL_GATILLO
/** Con el scroll `p`: 1 hasta el margen (después de la llegada a C), 0 pasado. */
const enElMargen = (p: number): number => 1 - suave(tramo(p, C_G.margen[0], C_G.margen[1]))

/** El peso del desvío de la cámara con la animación de la bajada `t` y el progreso de la transformación `p` (0 a 1). */
export function pesoDeLaCamara(t: number, p: number): number {
  const u = acotar01(t)
  return suave(tramo(u, 0, C_G.llega)) * (1 - suave(tramo(u, C_G.suelta, C_G.soltada - C_G.suelta))) * enElMargen(p)
}

/**
 * [C2-70e] Cuánto espera el CTA (0 a 1; su progreso es `p · (1 − espera)`): entero desde antes del disparo (`disparada`: la bajada va hacia
 * 1) y mientras dura el guardado; suelta detrás de la cámara (de `ctaSuelta` al cierre del anillo) y con el mismo margen. Sin disparar y con
 * la animación en 0, sólo antes del gatillo (el CTA todavía no arrancó); pasado el gatillo sin disparo (no ocurre: se decide antes), nada.
 */
export function esperaDelCta(t: number, p: number, disparada: boolean): number {
  const u = acotar01(t)
  if (!disparada && u <= 0 && p > HACIA_EL_CTA.gatillo.entra) return 0
  return (1 - suave(tramo(u, C_G.ctaSuelta, 1 - C_G.ctaSuelta))) * enElMargen(p)
}

/**
 * [B9] EL MOMENTO EN QUE EL TÍTULO SE VUELVE EL CTA: el cartel de canto (la mitad de su giro). B9 (las grietas del cristal) todavía no existe:
 * acá queda el punto de enganche (`_lib/escena/resenas/enganches.ts`), que se llama al cruzarlo para un lado o para el otro.
 */
export const VUELTA_DEL_CTA = (GIRO.desde + GIRO.hasta) / 2

/** El cruce del momento entre dos progresos: `ida` (bajando), `vuelta` (subiendo) o `null`. */
export function cruceDeLaVuelta(antes: number, ahora: number): 'ida' | 'vuelta' | null {
  if (antes < VUELTA_DEL_CTA && ahora >= VUELTA_DEL_CTA) return 'ida'
  if (antes >= VUELTA_DEL_CTA && ahora < VUELTA_DEL_CTA) return 'vuelta'
  return null
}
