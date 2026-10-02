'use client'

import { motionValue, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

/**
 * [RETOQUE 3D] 3I · EL PIE EN VOLUMEN — con CSS 3D: el pie se arma alrededor del logo como una sala. Los dos bloques de
 * los costados son paredes que miran al logo (giradas sobre su borde de afuera) y la fila de abajo es un piso (acostada
 * sobre su borde de abajo); cada uno llega desde atrás y más girado, con el tramo de su llegada de siempre (al revés con
 * el scroll para atrás). Todo lo que se toca sigue siendo del DOM (los enlaces, los campos del formulario): se enfoca, se
 * escribe y lo anuncia el lector. Sin coreografía (abajo de 1025, movimiento reducido), plano.
 */
export type LadoDelPlano = 'izquierda' | 'derecha' | 'abajo'

export const PLANOS_DEL_PIE = {
  /** Grados: cuánto miran al logo las paredes y cuánto se acuesta el piso, y cuánto más traen al llegar. */
  pared: 14,
  piso: 16,
  deMas: 30,
  /** px: de cuán atrás llegan, y la perspectiva. */
  profundidad: 1000,
  perspectiva: 1400,
} as const

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const salida = (t: number): number => 1 - (1 - t) ** 3

/** Desde dónde mira cada plano (hacia el logo, en porcentajes de su caja) y sobre qué borde gira. */
const MIRADA: Readonly<Record<LadoDelPlano, { readonly origen: string; readonly desde: readonly [number, number] }>> = {
  izquierda: { origen: 'left center', desde: [140, 50] },
  derecha: { origen: 'right center', desde: [-40, 50] },
  abajo: { origen: 'center bottom', desde: [50, -300] },
}

/** La pose de un plano a `p` de su llegada. En 1, mirando al logo (nunca sin giro: el pie es una sala). */
export function poseDelPlano(p: number, lado: LadoDelPlano): string {
  const u = salida(acotar01(p))
  const f = PLANOS_DEL_PIE
  const z = `translateZ(${(-f.profundidad * (1 - u)).toFixed(1)}px)`
  if (lado === 'abajo') return `${z} rotateX(${(f.piso + f.deMas * (1 - u)).toFixed(2)}deg)`
  const signo = lado === 'izquierda' ? 1 : -1
  return `${z} rotateY(${(signo * (f.pared + f.deMas * (1 - u))).toFixed(2)}deg)`
}

const CERO = motionValue(0)

export function PlanoDelPie({ progreso, ventana, lado, children }: { readonly progreso: MotionValue<number> | null; readonly ventana: readonly [number, number]; readonly lado: LadoDelPlano; readonly children: React.ReactNode }): React.JSX.Element {
  const plano = useRef<HTMLDivElement | null>(null)
  const tramo = useTransform(progreso ?? CERO, [ventana[0], ventana[1]], [0, 1])
  useMotionValueEvent(tramo, 'change', (u) => {
    if (plano.current !== null) plano.current.style.transform = poseDelPlano(u, lado)
  })
  if (progreso === null) return <>{children}</>
  const { origen, desde } = MIRADA[lado]
  return (
    <div data-pieza="plano-del-pie" data-lado={lado} style={{ perspective: `${String(PLANOS_DEL_PIE.perspectiva)}px`, perspectiveOrigin: `${String(desde[0])}% ${String(desde[1])}%` }}>
      <div ref={plano} style={{ transform: poseDelPlano(tramo.get(), lado), transformOrigin: origen }}>
        {children}
      </div>
    </div>
  )
}
