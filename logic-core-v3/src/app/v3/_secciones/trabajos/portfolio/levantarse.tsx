'use client'

import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, type ReactNode } from 'react'

/**
 * [C2-40] EL EFECTO DE LOS TÍTULOS EN EL FLUJO (sin títulos 3D, abajo de 1024): el titular se levanta desde abajo de su ventana, de acostado
 * a parado, con una presencia por tiempo que dispara el cruce de la línea. Lo usan «Portfolio» (`EncabezadoDelPortfolio` con `seFunde`) y,
 * [C2-41t], «Demos» en el teléfono y la tablet (`DemosDelFlujo`): la misma pieza, no una copia. En el teléfono no se desactiva; con
 * movimiento reducido la presencia salta.
 */
export const LEVANTARSE = { desdeY: '110%', acostadoGrados: 70, perspectivaPx: 600 } as const

/** La duración y la curva de una presencia (la de los títulos: `PRESENCIA_DEL_ENCABEZADO`). */
export interface TiempoDeLaPresencia {
  readonly s: number
  readonly curva: readonly [number, number, number, number]
}

/** La presencia por tiempo: va a 1 con `adentro` y a 0 sin él, en su tiempo; con movimiento reducido, de una. */
export function usePresencia(adentro: boolean, reducido: boolean, tiempo: TiempoDeLaPresencia): MotionValue<number> {
  const presencia = useMotionValue(adentro ? 1 : 0)
  const { s, curva } = tiempo
  useEffect(() => {
    if (reducido) {
      presencia.set(adentro ? 1 : 0)
      return undefined
    }
    const a = animate(presencia, adentro ? 1 : 0, { duration: s, ease: [...curva] })
    return () => a.stop()
  }, [adentro, reducido, presencia, s, curva])
  return presencia
}

/** El estilo del titular que se levanta con la presencia (para un `motion` alrededor del titular). */
export function useEstiloQueSeLevanta(presencia: MotionValue<number>): {
  readonly y: MotionValue<string>
  readonly rotateX: MotionValue<number>
  readonly transformPerspective: number
  readonly transformOrigin: string
} {
  const y = useTransform(presencia, [0, 1], [LEVANTARSE.desdeY, '0%'])
  const rotateX = useTransform(presencia, [0, 1], [LEVANTARSE.acostadoGrados, 0])
  return { y, rotateX, transformPerspective: LEVANTARSE.perspectivaPx, transformOrigin: '50% 100%' }
}

/** El titular que se levanta, envuelto (un `span` en bloque, adentro de su ventana que recorta). */
export function TitularQueSeLevanta({ presencia, children }: { readonly presencia: MotionValue<number>; readonly children: ReactNode }): React.JSX.Element {
  return (
    <motion.span data-parte="se-levanta" className="block" style={useEstiloQueSeLevanta(presencia)}>
      {children}
    </motion.span>
  )
}
