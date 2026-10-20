'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import type { TransicionDeLasHistorias } from './Historias'

/**
 * [P-H31a] UN CORTE DIAGONAL DE PRUEBA para la transición propia de las historias (`transicion`): el paso que entra se destapa hacia
 * adelante desde abajo a la derecha y hacia atrás desde arriba a la izquierda, con la curva del velo (1 − (1 − t)²). Lo usa la ficha de
 * las historias de la galería (`/v3/componentes`), que no puede importar Motion (el padrón de S3); servicios trae el suyo.
 */

const curva = (t: number): number => 1 - (1 - t) * (1 - t)
const pct = (n: number): string => `${n.toFixed(2)}%`

/** El `clip-path` del que entra con el avance de la transición (0 → 1): en 1, sin recorte. */
export function recorteDiagonal(avance: number, sentido: 1 | -1): string {
  if (avance >= 1) return 'none'
  // La línea x + y = s barre el cuadro de 200 % a 0 % (adelante: queda lo de abajo a la derecha) o de 0 % a 200 % (atrás).
  const e = curva(Math.max(0, avance))
  if (sentido === 1) {
    const s = 200 * (1 - e)
    return s <= 100
      ? `polygon(${pct(s)} 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${pct(s)})`
      : `polygon(100% ${pct(s - 100)}, 100% 100%, ${pct(s - 100)} 100%)`
  }
  const s = 200 * e
  return s <= 100 ? `polygon(0% 0%, ${pct(s)} 0%, 0% ${pct(s)})` : `polygon(0% 0%, 100% 0%, 100% ${pct(s - 100)}, ${pct(s - 100)} 100%, 0% 100%)`
}

function CorteDiagonal({ avance, sentido, children }: { readonly avance: MotionValue<number>; readonly sentido: 1 | -1; readonly children: ReactNode }): React.JSX.Element {
  const recorte = useTransform(avance, (a) => recorteDiagonal(a, sentido))
  return (
    <motion.div data-parte="corte-diagonal" className="absolute inset-0" style={{ clipPath: recorte }}>
      {children}
    </motion.div>
  )
}

export const CORTE_DIAGONAL_DE_PRUEBA: TransicionDeLasHistorias = { ms: 600, Envoltorio: CorteDiagonal }
