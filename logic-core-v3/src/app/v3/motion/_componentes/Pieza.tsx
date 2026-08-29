'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import {
  propiedadesDePieza,
  propiedadesQueEscribe,
  type EspecificacionDePieza,
} from '../../_lib/motion/fotograma'
import type { PropiedadesReales } from '../../_lib/motion/traduccion'

/**
 * UNA PIEZA — el único lugar del sistema que escribe estilo.
 *
 * Toma el progreso del patrón, su índice dentro del escalonado, y escribe las
 * propiedades de CSS que le tocan. Todo lo que decide QUÉ escribir es puro y vive
 * en `_lib/motion`; acá solo se conecta.
 *
 * ── Un cálculo por cuadro, no cuatro ───────────────────────────────────────
 *
 * `propiedadesDePieza` corre UNA vez por cuadro y devuelve el objeto entero; las
 * cuatro derivaciones de abajo solo leen un campo. La cadena entera arranca en
 * `progreso`, que está acotado: fuera del rango del patrón no cambia, no avisa, y
 * nada de esto corre. Es la pausa fuera de pantalla, sin observador.
 *
 * ── Por qué `transform` entra como string y no como `x`/`y`/`scale` ────────
 *
 * Porque el orden de composición es parte de la traducción y no coincide con el
 * de `motion`: GSAP compone `rotate` ANTES que `scale` y `motion` al revés. Ver
 * `traduccion.ts`. `motion` soporta el string explícitamente —`buildHTMLStyles`
 * saltea su propia construcción cuando `latestValues.transform` ya viene puesto—
 * así que esto no pelea contra la librería, usa la puerta que deja abierta.
 *
 * ── Qué propiedades se declaran, se decide una sola vez ────────────────────
 *
 * Un `MotionValue` no puede "no escribir" una clave de `style` a mitad de una
 * animación: si la clave está en el objeto, se escribe siempre. Así que qué
 * claves existen lo decide el patrón —de sus claves declaradas— y no el
 * fotograma. Un patrón que solo anima opacidad no declara `transform` y por lo
 * tanto **no crea una capa de composición** que no pidió.
 */

export interface PiezaProps {
  readonly spec: EspecificacionDePieza
  /** Posición dentro del escalonado. La pieza 0 arranca primero. */
  readonly indice: number
  /** El progreso del PATRÓN, 0 → 1. La pieza deriva el suyo. */
  readonly progreso: MotionValue<number>
  /** `span` para piezas dentro de un flujo de texto; `div` para bloques. */
  readonly como?: 'div' | 'span'
  readonly className?: string
  readonly children: ReactNode
}

export function Pieza({
  spec,
  indice,
  progreso,
  como = 'div',
  className,
  children,
}: PiezaProps): React.JSX.Element {
  const escribe = propiedadesQueEscribe(spec)

  const propiedades = useTransform<number, PropiedadesReales>(progreso, (p) =>
    propiedadesDePieza(spec, indice, p),
  )

  // El tipo de salida se ensancha a `string` a propósito: `MotionValue` es
  // invariante en su parámetro, así que un `MotionValue<'visible' | 'hidden'>`
  // no entra donde se espera un `MotionValue<string>`. El valor sigue siendo el
  // de la unión; lo único que se relaja es el tipo del canal.
  const transform = useTransform(propiedades, (v): string => v.transform ?? 'none')
  const opacity = useTransform(propiedades, (v): number => v.opacity ?? 1)
  const visibility = useTransform(propiedades, (v): string => v.visibility ?? 'visible')
  const pointerEvents = useTransform(propiedades, (v): string => v.pointerEvents ?? 'auto')

  const estilo: Record<string, MotionValue<string> | MotionValue<number>> = {}
  if (escribe.transform) estilo.transform = transform
  if (escribe.opacity) estilo.opacity = opacity
  if (escribe.visibility) estilo.visibility = visibility
  if (escribe.pointerEvents) estilo.pointerEvents = pointerEvents

  // `will-change` solo donde hay transformada. Ponerlo en todo es peor que no
  // ponerlo: promueve capas que el compositor después tiene que sostener.
  const clases = [className, escribe.transform ? 'will-change-transform' : null]
    .filter(Boolean)
    .join(' ')

  if (como === 'span') {
    return (
      <motion.span style={estilo} className={clases}>
        {children}
      </motion.span>
    )
  }

  return (
    <motion.div style={estilo} className={clases}>
      {children}
    </motion.div>
  )
}
