'use client'

import { motion, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import { usarInclinacion } from '../../_lib/motion/inercia'
import { FAMILIA_DEL_TEXTO, type TipoDeTexto } from '../../_lib/motion/texto'
import { LineasDeTexto } from './LineasDeTexto'
import { PalabrasDeTexto } from './PalabrasDeTexto'

/**
 * [INTERFAZ 1] T1 · EL TEXTO QUE ENTRA — lo que va ADENTRO del elemento tipográfico, según su familia.
 *
 * El título y el párrafo, por línea (`LineasDeTexto` con raíz `span`: cabe en un `<h2>` o un `<p>`); la etiqueta, por
 * palabra (`PalabrasDeTexto`). Los valores, de `FAMILIA_DEL_TEXTO`: una curva y una escala de duraciones para todo /v3.
 * El título va además inclinado por la inercia del scroll (`Inclinado`).
 */
export function TextoQueEntra({
  tipo,
  texto,
  progreso,
}: {
  readonly tipo: TipoDeTexto
  readonly texto: string
  readonly progreso: MotionValue<number>
}): React.JSX.Element {
  const f = FAMILIA_DEL_TEXTO[tipo]
  const comun = { texto, progreso, claves: f.claves, curva: f.curva, duracionDeclarada: f.duracionDeclarada, escalonado: f.escalonado }
  const piezas = f.pieza === 'linea' ? <LineasDeTexto {...comun} como="span" /> : <PalabrasDeTexto {...comun} />
  return tipo === 'titulo' ? <Inclinado>{piezas}</Inclinado> : piezas
}

/**
 * [INTERFAZ 1] T1 · LA INERCIA DE UN TÍTULO — un envoltorio en bloque con la inclinación compartida en su `skewY`.
 *
 * `span` en bloque para caber en un encabezado; `div` cuando envuelve un bloque (los renglones partidos a mano de
 * Quiénes somos). El origen, en el centro: la inclinación se reparte a los dos lados en vez de mover sólo una punta.
 */
export function Inclinado({
  children,
  como = 'span',
  className,
}: {
  readonly children: ReactNode
  readonly como?: 'div' | 'span'
  readonly className?: string
}): React.JSX.Element {
  const inclinacion = usarInclinacion()
  const Elemento = como === 'div' ? motion.div : motion.span
  return (
    <Elemento data-inercia="" className={`block ${className ?? ''}`} style={{ skewY: inclinacion }}>
      {children}
    </Elemento>
  )
}
