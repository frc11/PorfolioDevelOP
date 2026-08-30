'use client'

import type { MotionValue } from 'motion/react'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { PATRONES } from '../../_lib/motion/patrones'
import { CanalDePieza } from '../_contrato/Canales'
import { CAPACIDADES } from './contenido'

/**
 * LA LISTA DE CAPACIDADES — P4, ítem por ítem, muy frenada.
 *
 * ── Por qué esto es un `<ul>` y no once `div` ─────────────────────────────
 *
 * `CanalDePiezas` emite `div` o `span` y su contenedor también es un `div`. Once
 * `div` con una frase adentro no son una lista para nadie que navegue por
 * listas: el lector de pantalla no anuncia "lista de once elementos" ni permite
 * saltar de ítem en ítem. Por eso el marcado lo pone este componente —`<ul>` con
 * sus `<li>`— y la pieza animada va ADENTRO de cada `<li>`, que es exactamente
 * el caso para el que el contrato expone `CanalDePieza`.
 *
 * ── El escalonado sale de cuántos ítems hay, no de un número escrito ──────
 *
 * `cantidad` es `CAPACIDADES.length`. P4 declara 2 s de duración y 0,2 s de
 * escalonado, así que la duración APLICADA es `2 + 0,2·(N−1)`: con once ítems son
 * 4 s de recorrido. Si mañana la lista tiene nueve, el cronograma se acorta solo.
 *
 * ── La regla horizontal no se mueve, el texto sí ──────────────────────────
 *
 * El `border-t` vive en el `<li>` y la pieza animada es su hijo: la retícula
 * queda quieta y lo que sube es el texto. Al revés —el borde adentro de la
 * pieza— la lista entera se vería temblar mientras entra.
 */

export interface CapacidadesProps {
  /** El progreso del bloque de P4, o `null` cuando no hay coreografía. */
  readonly progreso: MotionValue<number> | null
}

export function Capacidades({ progreso }: CapacidadesProps): React.JSX.Element {
  return (
    <ul className="grid grid-cols-1 gap-x-[var(--grilla-canal-amplio)] gap-y-[var(--spacing-6)] tablet:grid-cols-2">
      {CAPACIDADES.map((capacidad, indice) => (
        <li key={capacidad} className="border-borde border-t pt-[var(--spacing-3)]">
          <CanalDePieza
            progreso={progreso}
            patron={PATRONES.P4}
            cantidad={CAPACIDADES.length}
            indice={indice}
          >
            <Cuerpo>{capacidad}</Cuerpo>
          </CanalDePieza>
        </li>
      ))}
    </ul>
  )
}
