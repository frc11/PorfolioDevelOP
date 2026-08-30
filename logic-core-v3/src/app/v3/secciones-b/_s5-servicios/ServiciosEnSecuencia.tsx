'use client'

import { useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { useState } from 'react'

import { SERVICIOS } from '../_contrato/acento'
import { tramoDeSecuencia } from '../_contrato/secuencia'
import { ContenidoDeServicio } from './ContenidoDeServicio'
import { CLASE_DEL_STICKY } from './geometria'

/**
 * LA SECUENCIA — un progreso, cinco canales, un solo `sticky`.
 *
 * ── Dos números derivados, no un objeto ───────────────────────────────────
 *
 * `indice` y `local` salen de dos `useTransform` separados sobre el MISMO
 * progreso, y no de uno solo que devuelva `{ indice, local }`. La razón es la
 * mecánica de `MotionValue`: solo avisa a sus suscriptores cuando el valor
 * CAMBIA (`updateAndNotify`: `if (this.current !== this.prev)`), y un objeto
 * nuevo por cuadro nunca es igual al anterior — así que avisaría siempre. Con
 * dos números, `indice` notifica DOS veces en todo el recorrido y es el único
 * que toca estado de React; `local` es el que corre, y no dispara ni un render.
 *
 * Esa es toda la diferencia entre una secuencia y un `setState` por cuadro.
 *
 * ── Por qué el tramo activo SÍ es estado de React ─────────────────────────
 *
 * Porque cambia el ÁRBOL, no un estilo: otro nombre, otro rubro, otro párrafo,
 * otros once ítems, otro pedido de video y otro valor de `data-servicio`. Nada
 * de eso se puede escribir desde un `MotionValue`, que solo sabe empujar `style`
 * al DOM. Y no es caro: son dos renders en 200svh de scroll.
 *
 * ── Exactamente UN `[data-servicio]` en toda la sección ───────────────────
 *
 * Está en el `sticky`, que es el ancestro de todo lo que se ve, y su valor es
 * el del tramo activo. Es la regla de la voz única de la paleta —un acento por
 * contexto, nunca los tres— hecha propiedad estructural: no hay dónde meter un
 * segundo acento aunque alguien quisiera. El instrumento cuenta las
 * ocurrencias del atributo y publica el número.
 *
 * ── Por qué `PanelDeSecuencia` se exporta ─────────────────────────────────
 *
 * Para que el instrumento pueda renderizar los TRES tramos sin inventar un
 * atributo de forzado en el producto. `activo` es una propiedad porque el
 * estado está izado un nivel más arriba, que es donde vive el `MotionValue` que
 * lo mueve; que además sirva para sondear los tres tramos es una consecuencia
 * de haberlo puesto donde va, no una concesión al instrumento.
 */

/** Los tramos son los servicios. No hay un cuarto. */
export const CANTIDAD_DE_TRAMOS = SERVICIOS.length

export interface PanelDeSecuenciaProps {
  /** El tramo activo, de 0 a `CANTIDAD_DE_TRAMOS − 1`. */
  readonly activo: number
  /** El progreso DENTRO del tramo, o `null` cuando no hay coreografía. */
  readonly progreso: MotionValue<number> | null
}

export function PanelDeSecuencia({ activo, progreso }: PanelDeSecuenciaProps): React.JSX.Element {
  // Acotado y no validado con una excepción: el índice viene de un
  // `MotionValue` que ya está acotado por `tramoDeSecuencia`, y una sección que
  // tira en el render por un borde de coma flotante es peor que una que muestra
  // el último tramo.
  const indice = Math.min(Math.max(activo, 0), CANTIDAD_DE_TRAMOS - 1)
  const servicio = SERVICIOS[indice]

  return (
    <div data-servicio={servicio.id} className={CLASE_DEL_STICKY}>
      <ContenidoDeServicio servicio={servicio} progreso={progreso} />
    </div>
  )
}

export interface ServiciosEnSecuenciaProps {
  /** El progreso del PIN, 0 cuando se clava y 1 cuando se suelta. */
  readonly progreso: MotionValue<number>
}

export function ServiciosEnSecuencia({
  progreso,
}: ServiciosEnSecuenciaProps): React.JSX.Element {
  const indice = useTransform(progreso, (p) => tramoDeSecuencia(p, CANTIDAD_DE_TRAMOS).indice)
  const local = useTransform(progreso, (p) => tramoDeSecuencia(p, CANTIDAD_DE_TRAMOS).local)
  const [activo, setActivo] = useState(0)

  useMotionValueEvent(indice, 'change', setActivo)

  return <PanelDeSecuencia activo={activo} progreso={local} />
}
