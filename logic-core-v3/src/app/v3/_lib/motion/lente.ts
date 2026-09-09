/**
 * EL LENTE DE LA ESCENA — la perspectiva CSS que hace que un plano venga de
 * ADENTRO de la sala y no flote por delante (B6-A §2).
 *
 * ── El problema, medido ───────────────────────────────────────────────────
 *
 * P7 se calibró contra un fondo plano: `perspective: 1000px` en el ancestro de
 * los planos y el punto de fuga en el CENTRO DEL BLOQUE, que es lo que CSS hace
 * si nadie le dice otra cosa. Con la sala real detrás —Trabajos pasa a
 * `oscuro-transparente`— los planos convergen a un punto que no es el de la
 * sala y a una profundidad que no es la de su pared: el plano se lee flotando
 * por delante en vez de viniendo de adentro.
 *
 * ── Qué es el lente de la sala, y por qué es UN número ────────────────────
 *
 * La cámara de la escena tiene un FOV vertical de 35° (`CAMERA_FOV`, en
 * `_lib/escena/probeScene.ts`). Un FOV es una distancia focal en alturas de
 * ventana: f = (h/2) / tan(35°/2) = h × 1,5857… — 1427 px a 900 de alto, 1713 a
 * 1080. Ésa es la `perspective` que pone al ojo de CSS donde está el ojo de la
 * cámara. Con ella un `translateZ` de −Z px cae a (f + Z) / f veces la
 * profundidad del plano de pantalla: los −3000 px con los que P7 ya arranca
 * caen a 3,10 × 20,5 = 63,6 unidades de la cámara, que es la pared del fondo de
 * la celosía (radios 38 y 44 alrededor del logo, con la cámara a 20,5: de 58 a
 * 64). Con 1000 px caían a 82, detrás de la sala. **P7 no cambia un valor**:
 * cambia el lente con el que se lo mira. La meseta de B4-A, el techo de B2 y
 * los tramos del patrón quedan como estaban.
 *
 * ── El punto de fuga es el CENTRO DEL VIEWPORT ────────────────────────────
 *
 * `cameraFraming.ts` encuadra ROTANDO la cámara (`lookAt`), no corriendo el
 * lente: el punto principal de la proyección queda en el centro del cuadro
 * aunque el logo vaya a `frameX −0,85`. Así que `perspective-origin` tiene que
 * ser el centro del viewport, escrito en las coordenadas del bloque: el bloque
 * de P7 no es el viewport —vive adentro del hijo pegado de Trabajos, debajo del
 * titular— y CSS pondría el origen en SU centro. Se escribe en el montaje y en
 * cada época de medición (cada resize), nunca por cuadro.
 *
 * ── El espejo, y su guardián ──────────────────────────────────────────────
 *
 * `FOV_DE_LA_ESCENA` se escribe acá y no se importa de `probeScene.ts` porque
 * ese módulo importa `three`, y esto lo consume el contrato de las secciones,
 * que va en el chunk inicial de /v3 (el techo de `s5-peso`). Es un espejo con
 * guardián: `s19-lente.invariant.ts` afirma que los dos valen lo mismo, con su
 * control positivo.
 */

import { useEffect, type RefObject } from 'react'

import { useEpocaDeMedicion } from './epoca'

/** ⚠️ ESPEJO de `CAMERA_FOV` (`_lib/escena/probeScene.ts`). El guardián está en `s19-lente.invariant.ts`. */
export const FOV_DE_LA_ESCENA = 35

/** La distancia focal en alturas de ventana: 0,5 / tan(FOV / 2). Con 35°, 1,5857… */
export const FOCO_EN_ALTOS_DE_VENTANA = 0.5 / Math.tan((FOV_DE_LA_ESCENA * Math.PI) / 360)

/** Cuántos decimales lleva el foco al CSS: cuatro son un cuarto de píxel a 1080 de alto. */
const DECIMALES = 4

/** La `perspective` del lente: el foco de la escena en `svh`, el alto del canvas fijo. */
export function perspectivaDeLaEscena(): string {
  return `calc(100svh * ${FOCO_EN_ALTOS_DE_VENTANA.toFixed(DECIMALES)})`
}

export interface CajaDelBloque {
  readonly left: number
  readonly top: number
}

export interface Viewport {
  readonly ancho: number
  readonly alto: number
}

/** `perspective-origin`: el centro del viewport, en coordenadas del bloque. */
export function origenDeLaLente(caja: CajaDelBloque, viewport: Viewport): string {
  return `${(viewport.ancho / 2 - caja.left).toFixed(1)}px ${(viewport.alto / 2 - caja.top).toFixed(1)}px`
}

/**
 * La caja del bloque respecto del hijo PEGADO que lo contiene, sumando offsets
 * de layout hasta el ancestro `sticky`. Es una coordenada de layout y no de
 * scroll: durante el pin el hijo pegado está en el tope del viewport, así que
 * el bloque queda donde diga esta suma sea cual sea el scroll en que se lea.
 * Sin ancestro pegado —no debería pasar en la rama animada— vale la caja
 * visible de ese instante.
 */
export function cajaEnElHijoPegado(el: HTMLElement): CajaDelBloque {
  let left = 0
  let top = 0
  let nodo: HTMLElement | null = el
  while (nodo !== null && getComputedStyle(nodo).position !== 'sticky') {
    left += nodo.offsetLeft
    top += nodo.offsetTop
    const padre: Element | null = nodo.offsetParent
    nodo = padre instanceof HTMLElement ? padre : null
  }
  if (nodo === null) {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top }
  }
  return { left, top }
}

/**
 * Escribe `perspective-origin` en el elemento, en el montaje y en cada época de
 * medición, y nunca por cuadro. Cero `setState`: el destino es el estilo del
 * nodo, no React.
 */
export function useOrigenDeLaLente(ref: RefObject<HTMLElement | null>, activo: boolean): void {
  const foto = useEpocaDeMedicion()
  useEffect(() => {
    const el = ref.current
    if (!activo || el === null || foto.alto === 0) return
    el.style.perspectiveOrigin = origenDeLaLente(cajaEnElHijoPegado(el), { ancho: foto.ancho, alto: foto.alto })
  }, [ref, activo, foto])
}
