/**
 * [INTERFAZ 1] T1 · LA VELOCIDAD DEL SCROLL, una sola vez por cuadro.
 *
 * La escribe el `requestAnimationFrame` de Lenis (`_componentes/ScrollSuaveDeV3.tsx`), justo después de `lenis.raf`, y
 * la lee el texto con inercia (`_lib/motion/inercia.ts`). Es un objeto mutable y no un estado de React: se escribe en
 * cada cuadro y nadie se vuelve a dibujar por eso (cero `setState` por cuadro).
 *
 * En px POR SEGUNDO, no por cuadro (ESTADO-ESCENA §4: todo en segundos). La `velocity` de Lenis es px por cuadro: a
 * 144 Hz el mismo gesto daría la mitad que a 75. Por eso se deriva acá del scroll animado de Lenis y del reloj del cuadro.
 *
 * Sin Lenis (abajo de 1024, con movimiento reducido) nadie la escribe y queda en 0: el texto no se inclina.
 */
export const VELOCIDAD_DEL_SCROLL = { pxPorSegundo: 0 }

/**
 * Un salto de más de esto en UN cuadro no es un gesto sino un teletransporte (el foco que lleva el scroll lejos, un
 * ancla, el arranque de un viaje): se cuenta como quieto. Sin este corte, cada Tab que salta de sección inclinaría todos
 * los títulos de golpe. 400 px en un cuadro de 60 Hz son 24.000 px/s: ninguna rueda llega.
 */
export const SALTO_QUE_NO_ES_GESTO_PX = 400

/** La velocidad de un cuadro, de dos posiciones del scroll animado y el tiempo entre ellas (ms). Pura. */
export function velocidadDelCuadro(antes: number, ahora: number, dtMs: number): number {
  const salto = ahora - antes
  if (dtMs <= 0 || Math.abs(salto) > SALTO_QUE_NO_ES_GESTO_PX) return 0
  return (salto * 1000) / dtMs
}
