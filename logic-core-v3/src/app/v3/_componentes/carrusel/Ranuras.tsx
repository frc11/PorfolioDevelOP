'use client'

import { motion, useTransform, type MotionValue, type TargetAndTransition } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { ASOMA, poseEnLaVuelta, relativoEnLaVuelta } from './asoma'

/**
 * La transición entre tarjetas: la que se va se funde corriéndose hacia su lado y, terminada (el respiro), entra la nueva desde el otro.
 * Corta: un cambio no es un show. La curva de la casa. Con movimiento reducido, el corte.
 */
export const TRANSICION_DEL_CARRUSEL = { saleS: 0.18, entraS: 0.32, corridaPx: 16, curva: [0.25, 0.46, 0.45, 0.94] } as const

/** La línea de la tarjeta de ahora: se llena con el reloj (un valor de Motion: sin renders por cuadro). Quieta y llena si no rota. */
export function LineaDeAhora({ avance, quieta }: { readonly avance: MotionValue<number>; readonly quieta: boolean }): React.JSX.Element {
  return (
    <span data-parte="linea" data-linea="activa" className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/25">
      {quieta ? <span className="absolute inset-0 bg-tinta" /> : <motion.span className="absolute inset-0 origin-left bg-tinta" style={{ scaleX: avance }} />}
    </span>
  )
}

interface PropsDeLaRanura {
  readonly activa: boolean
  readonly nombre: string
  readonly children: ReactNode
}

type AccesoDeLaRanura = Pick<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-roledescription' | 'aria-label' | 'aria-hidden' | 'inert'> & {
  readonly 'data-parte': 'ranura'
  readonly 'data-activa': 'si' | 'no'
}

/** Lo que el lector y el teclado saben de una ranura: un grupo con nombre; las de afuera, escondidas e inertes. */
const accesoDeLaRanura = (activa: boolean, nombre: string): AccesoDeLaRanura => ({
  role: 'group',
  'aria-roledescription': 'tarjeta',
  'aria-label': nombre,
  'aria-hidden': activa ? undefined : true,
  inert: !activa,
  'data-parte': 'ranura',
  'data-activa': activa ? 'si' : 'no',
})

/** Una tarjeta en su lugar: todas en la misma celda (el alto es el de la más alta); la activa encima, las otras invisibles e inertes. */
export function Ranura({ activa, sentido, reducido, nombre, children }: PropsDeLaRanura & { readonly sentido: 1 | -1; readonly reducido: boolean }): React.JSX.Element {
  const { saleS, entraS, corridaPx, curva } = TRANSICION_DEL_CARRUSEL
  const destino: TargetAndTransition = reducido
    ? { opacity: activa ? 1 : 0, x: 0, transition: { duration: 0 } }
    : activa
      ? { opacity: [0, 1], x: [corridaPx * sentido, 0], transition: { delay: saleS, duration: entraS, ease: curva } }
      : { opacity: 0, x: -corridaPx * sentido, transition: { duration: saleS, ease: curva } }
  return (
    <motion.div
      {...accesoDeLaRanura(activa, nombre)}
      className={cn('col-start-1 row-start-1 min-w-0', activa ? 'relative z-[var(--z-elevado)]' : 'pointer-events-none')}
      initial={false}
      animate={destino}
    >
      {children}
    </motion.div>
  )
}

/**
 * [C2-41t] Una tarjeta del modo `asoma`: en la misma celda, corrida a su lugar relativo a la posición (`asoma.ts`) por el ancho medido; la
 * vecina más chica y apagada. Antes de medir, sólo la de ahora a la vista (sin el ancho no hay dónde ponerlas). Las de afuera, inertes:
 * un toque a la que asoma lo toma el carrusel (la trae).
 */
export function RanuraQueAsoma({ activa, nombre, indice, cantidad, posicion, ancho, fraccion, children }: PropsDeLaRanura & {
  readonly indice: number
  readonly cantidad: number
  readonly posicion: MotionValue<number>
  readonly ancho: MotionValue<number>
  readonly fraccion: number
}): React.JSX.Element {
  const rel = useTransform(posicion, (p) => relativoEnLaVuelta(indice, p, cantidad))
  const x = useTransform([rel, ancho], ([r, w]: number[]) => r * (w + ASOMA.separacionPx))
  const scale = useTransform(rel, (r) => poseEnLaVuelta(r).escala)
  const opacity = useTransform([rel, ancho], ([r, w]: number[]) => (w > 0 ? poseEnLaVuelta(r).opacidad : Math.abs(r) < 0.5 ? 1 : 0))
  const width = useTransform(ancho, (w) => (w > 0 ? `${String(w)}px` : `${String(fraccion * 100)}%`))
  return (
    <motion.div
      {...accesoDeLaRanura(activa, nombre)}
      data-asoma=""
      className={cn('col-start-1 row-start-1 h-full min-w-0 justify-self-start will-change-transform', activa ? 'relative z-[var(--z-elevado)]' : 'pointer-events-none')}
      style={{ x, scale, opacity, width }}
    >
      {children}
    </motion.div>
  )
}
