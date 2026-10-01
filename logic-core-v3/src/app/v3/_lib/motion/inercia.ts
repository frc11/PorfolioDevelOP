import { cancelFrame, frame, motionValue, type MotionValue } from 'motion/react'
import { useEffect } from 'react'

import { VELOCIDAD_DEL_SCROLL } from '../velocidadDelScroll'

/**
 * [INTERFAZ 1] T1 · EL TEXTO CON INERCIA — con el scroll rápido los títulos se inclinan apenas en la dirección del
 * movimiento y vuelven con un resorte al frenar, como la estela del polvo (E6).
 *
 * ── Una lectura, un resorte, N títulos ───────────────────────────────────
 *
 * Un solo bucle por cuadro (el de `motion`, `frame.update`) lee la velocidad que publicó Lenis
 * (`VELOCIDAD_DEL_SCROLL`, una vez por cuadro), mueve UN resorte y escribe UN `MotionValue` (`inclinacion`). Cada título
 * lo lleva en su `style` (`skewY`): motion escribe la transformada sin pasar por React. Cero `setState` por cuadro, cero
 * reservas por cuadro (el estado del resorte es un objeto del módulo). El bucle corre sólo mientras haya algún título
 * montado (`usarInclinacion` cuenta los usuarios).
 *
 * ── La forma ─────────────────────────────────────────────────────────────
 *
 * El objetivo es 0 hasta `umbralPxS` (leer pasando no mueve un título), crece con un `smoothstep` hasta `topeGrados` en
 * `saturacionPxS` y conserva el signo: bajando (el contenido sube) la punta derecha se queda atrás, abajo. El resorte es
 * subamortiguado (ζ ≈ 0,55): al frenar vuelve, pasa un poco y se asienta. Integrado en segundos (la solución exacta, con
 * el `delta` acotado a 1/30 s): el mismo gesto da la misma inclinación a 60, 75, 120 y 144 Hz.
 *
 * Con menos movimiento no hay inercia: la coreografía no se instala (ni Lenis), así que ningún título la lleva.
 */
export const INERCIA_DEL_TEXTO = {
  // [INTERFAZ 1] Cierre: la MARCADA, elegida por Valentino (el tope en 5°, el doble de la primera propuesta). Medido con el
  // banco (`scripts-interfaz1/frenada.ts`): leer pasando con la rueda (~830 px/s) casi no inclina (0,05°); una ráfaga de la
  // rueda (siete muescas seguidas, ~2.600 px/s de pico con el lerp de Lenis) llega a 0,6–1,6° según el título; sólo un
  // tirón fuerte toca el tope. Se ve según el ANCHO del título (un `skewY` corre las puntas en proporción al ancho).
  umbralPxS: 600,
  saturacionPxS: 4500,
  topeGrados: 5,
  resorte: { rigidez: 140, amortiguacion: 13 },
  /** Por debajo de esto (grados y grados/s) el resorte está quieto y no se escribe nada. */
  reposo: 0.002,
} as const

/** Cuánto se quiere inclinar el título a una velocidad dada (px/s), en grados. Pura. */
export function inclinacionObjetivo(pxPorSegundo: number): number {
  const { umbralPxS, saturacionPxS, topeGrados } = INERCIA_DEL_TEXTO
  const v = Math.abs(pxPorSegundo)
  if (v <= umbralPxS) return 0
  const t = Math.min(1, (v - umbralPxS) / (saturacionPxS - umbralPxS))
  return Math.sign(pxPorSegundo) * topeGrados * t * t * (3 - 2 * t)
}

/** El estado de un resorte: la posición (grados) y la velocidad (grados/s). */
export interface EstadoDelResorte {
  x: number
  v: number
}

/**
 * La forma del resorte, calculada una vez: la frecuencia propia, el amortiguamiento relativo (ζ < 1: subamortiguado) y
 * la frecuencia amortiguada.
 */
const W0 = Math.sqrt(INERCIA_DEL_TEXTO.resorte.rigidez)
const ZETA = INERCIA_DEL_TEXTO.resorte.amortiguacion / (2 * W0)
const WD = W0 * Math.sqrt(1 - ZETA * ZETA)

/**
 * Un paso del resorte hacia `objetivo`, en `dtS` segundos. Muta `e`.
 *
 * La solución EXACTA del oscilador amortiguado con el objetivo quieto durante el paso (no Euler): el resultado no
 * depende de en cuántos pasos se parta el tiempo, así que el mismo gesto da la misma inclinación a 60, 75, 120 y 144 Hz
 * (Euler semi-implícito se separaba 0,18° de 2° entre 60 y 144 Hz: lo midió el invariante). El `dt` se acota a 1/30 s
 * contra los tirones (ESTADO-ESCENA §4).
 */
export function pasoDelResorte(e: EstadoDelResorte, objetivo: number, dtS: number): void {
  const dt = Math.min(Math.max(dtS, 0), 1 / 30)
  const y0 = e.x - objetivo
  const a = e.v + ZETA * W0 * y0
  const decae = Math.exp(-ZETA * W0 * dt)
  const c = Math.cos(WD * dt)
  const s = Math.sin(WD * dt)
  const y = decae * (y0 * c + (a / WD) * s)
  e.v = decae * (e.v * c - ((ZETA * W0 * e.v + W0 * W0 * y0) / WD) * s)
  e.x = objetivo + y
}

/** La inclinación de los títulos (grados de `skewY`). Una para todos: el mismo gesto, el mismo ángulo. */
const inclinacion: MotionValue<number> = motionValue(0)
const resorte: EstadoDelResorte = { x: 0, v: 0 } // una vez
let usuarios = 0

function paso({ delta }: { readonly delta: number }): void {
  const objetivo = inclinacionObjetivo(VELOCIDAD_DEL_SCROLL.pxPorSegundo)
  const { reposo } = INERCIA_DEL_TEXTO
  if (objetivo === 0 && Math.abs(resorte.x) < reposo && Math.abs(resorte.v) < reposo) {
    if (resorte.x !== 0) {
      resorte.x = 0
      resorte.v = 0
      inclinacion.set(0)
    }
    return
  }
  pasoDelResorte(resorte, objetivo, delta / 1000)
  inclinacion.set(resorte.x)
}

interface VentanaDelBanco {
  __entornoDeLaEscena?: string
  __inerciaDelBanco?: { estado: () => { velocidad: number; grados: number } }
}

/** El gancho del banco: sólo con el banco de la escena puesto (como los demás `__…DelBanco`). */
function publicarElGancho(): void {
  const w = window as Window & VentanaDelBanco
  if (typeof w.__entornoDeLaEscena !== 'string' || w.__inerciaDelBanco !== undefined) return
  w.__inerciaDelBanco = {
    estado: () => ({ velocidad: Math.round(VELOCIDAD_DEL_SCROLL.pxPorSegundo), grados: Math.round(resorte.x * 1000) / 1000 }),
  }
}

/**
 * La inclinación compartida, para el `style` de un título. Mientras haya al menos un título montado, el bucle corre;
 * con el último que se desmonta, se apaga.
 */
export function usarInclinacion(): MotionValue<number> {
  useEffect(() => {
    usuarios += 1
    if (usuarios === 1) {
      publicarElGancho()
      frame.update(paso, true)
    }
    return () => {
      usuarios -= 1
      if (usuarios === 0) cancelFrame(paso)
    }
  }, [])
  return inclinacion
}
