'use client'

import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { useRef } from 'react'

/**
 * [RETOQUE 3D] 3G · CADA VALOR LLEGA DESDE LA SALA — el bloque entero (el ícono, el título y el texto) con CSS 3D: sale
 * de un lugar distinto del entorno para cada uno (lejos, a un costado, arriba o abajo, girado y apagado) y se asienta en
 * su lugar con el progreso de su tramo (con el scroll para atrás, al revés: sin reloj propio). El texto es del DOM: se
 * lee nítido, se selecciona y lo anuncia el lector. La perspectiva mira desde el logo (el centro del escenario).
 */
export interface DesdeDondeLlega {
  /** px: hacia el costado (negativo, a la izquierda), hacia abajo y hacia atrás (negativo). */
  readonly x: number
  readonly y: number
  readonly z: number
  /** Grados: el giro sobre el eje vertical y sobre el horizontal con que llega. */
  readonly giro: number
  readonly inclinacion: number
}

/** Uno por valor, en el orden de `VALORES` (tres a la izquierda del logo, tres a la derecha): cada uno de un lugar. */
export const DESDE_DONDE_LLEGAN: readonly DesdeDondeLlega[] = [
  { x: -900, y: -380, z: -1400, giro: 38, inclinacion: -22 },
  { x: -1250, y: 60, z: -900, giro: 58, inclinacion: 6 },
  { x: -650, y: 520, z: -1700, giro: 24, inclinacion: 34 },
  { x: 950, y: -460, z: -1300, giro: -42, inclinacion: -18 },
  { x: 1300, y: 20, z: -800, giro: -60, inclinacion: 4 },
  { x: 780, y: 480, z: -1600, giro: -26, inclinacion: 30 },
]

export const PERSPECTIVA_DE_LOS_VALORES = 1200

/** Porcentajes de la caja: a la izquierda del logo la perspectiva mira desde la derecha (el logo), y al revés. */
const MIRADA_DESDE_EL_LOGO = { izquierda: [120, 50], derecha: [-20, 50] } as const

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const salida = (t: number): number => 1 - (1 - t) ** 3

/** La pose del valor `indice` a `p` de su tramo: en 1, en su lugar y sin transformada. Pura: el invariante la recorre. */
export function poseDelValor(p: number, indice: number): { readonly transform: string; readonly opacidad: number } {
  const u = salida(acotar01(p))
  if (u >= 1) return { transform: 'none', opacidad: 1 }
  const d = DESDE_DONDE_LLEGAN[indice % DESDE_DONDE_LLEGAN.length]
  const f = 1 - u
  return {
    transform: `translate3d(${(d.x * f).toFixed(1)}px, ${(d.y * f).toFixed(1)}px, ${(d.z * f).toFixed(1)}px) rotateY(${(d.giro * f).toFixed(2)}deg) rotateX(${(d.inclinacion * f).toFixed(2)}deg)`,
    opacidad: acotar01(p / 0.35),
  }
}

export function ValorEnVolumen({ progreso, indice, children }: { readonly progreso: MotionValue<number>; readonly indice: number; readonly children: React.ReactNode }): React.JSX.Element {
  const pieza = useRef<HTMLDivElement | null>(null)
  useMotionValueEvent(progreso, 'change', (p) => {
    const el = pieza.current
    if (el === null) return
    const pose = poseDelValor(p, indice)
    el.style.transform = pose.transform
    el.style.opacity = pose.opacidad.toFixed(3)
  })
  const inicial = poseDelValor(progreso.get(), indice)
  const [x, y] = MIRADA_DESDE_EL_LOGO[indice < 3 ? 'izquierda' : 'derecha']
  const desdeElLogo = `${String(x)}% ${String(y)}%`
  return (
    <div data-pieza="valor-en-volumen" style={{ perspective: `${String(PERSPECTIVA_DE_LOS_VALORES)}px`, perspectiveOrigin: desdeElLogo }}>
      <div ref={pieza} style={{ transform: inicial.transform, opacity: inicial.opacidad }}>
        {children}
      </div>
    </div>
  )
}
