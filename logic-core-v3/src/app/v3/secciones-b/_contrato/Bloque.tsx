'use client'

import type { MotionValue } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'

import type { ParDeAnclas } from '../../_lib/motion/anclas'
import { useProgresoDePatron } from '../../_lib/motion/useProgresoDePatron'

/**
 * EL BLOQUE MEDIDO — el elemento que se mide, y el motor que cuelga de él.
 *
 * ── La regla estructural, que acá no se puede romper ──────────────────────
 *
 * **El elemento que se mide nunca se transforma.** Este componente renderiza un
 * `div` y le pone el `ref` del motor; todo lo que se mueve es descendiente suyo.
 * No es disciplina: `getBoundingClientRect()` devuelve coordenadas contaminadas
 * cuando hay transformadas activas —lección ya pagada en este repo— y medir el
 * mismo elemento que uno anima es la forma más corta de caer en eso. Acá el
 * `ref` está en un solo lugar y ese lugar no escribe `transform`.
 *
 * ── Dos componentes, no una rama ──────────────────────────────────────────
 *
 * Con `anima: false` se monta `BloqueQuieto`, que **no llama a ningún hook del
 * sistema**: ni motor de progreso, ni medición de caja, ni suscripción al
 * scroll. No es el mismo componente con la duración en cero — es otro árbol,
 * más chico. Es el mismo criterio con el que S2 escribió su política de
 * movimiento reducido, y por la misma razón: "duración cero" sigue midiendo,
 * sigue suscrito y sigue escribiendo `transform` en cada cuadro para terminar
 * mostrando lo mismo.
 *
 * ── Un progreso, N canales ────────────────────────────────────────────────
 *
 * El bloque entrega **un** `MotionValue` y no sabe qué se cuelga de él. Es lo
 * que permite que Servicios tenga un solo progreso con cinco canales y que una
 * sección normal tenga un bloque por patrón. La forma es la misma; lo que cambia
 * es cuántas cosas leen el mismo número.
 *
 * ── Por qué no hace falta un `IntersectionObserver` ───────────────────────
 *
 * `progresoEnRango` acota a `[0, 1]` y un `MotionValue` sólo avisa cuando el
 * valor CAMBIA. Un bloque fuera de su rango devuelve siempre el mismo 0 o el
 * mismo 1, así que no propaga: ni curvas, ni composición de transformada, ni
 * escritura al DOM. La pausa fuera de pantalla ya está, sin un oyente más.
 */

export interface BloqueProps {
  /** El par de anclas que define el rango de scroll del bloque. */
  readonly anclas: ParDeAnclas
  /**
   * Segundos de inercia del `scrub`, o `null` para seguir al scroll sin
   * retraso. Sale de `inerciaDe(patron)`.
   */
  readonly inerciaSegundos: number | null
  /** Si esta sección anima. Viene de la compuerta; el bloque no la consulta. */
  readonly anima: boolean
  readonly className?: string
  readonly style?: CSSProperties
  /** Recibe el progreso, o `null` cuando no hay coreografía. */
  readonly children: (progreso: MotionValue<number> | null) => ReactNode
}

function BloqueConMotor({
  anclas,
  inerciaSegundos,
  className,
  style,
  children,
}: Omit<BloqueProps, 'anima'>): React.JSX.Element {
  // El `ref` se crea acá y baja al motor. No sube: una propiedad que contiene un
  // `ref` no se puede leer durante el render (`react-hooks/refs`), y el `div` de
  // abajo es el único lugar donde se usa.
  const ref = useRef<HTMLDivElement | null>(null)
  const progreso = useProgresoDePatron({ ref, anclas, inerciaSegundos })

  return (
    <div ref={ref} className={className} style={style}>
      {children(progreso)}
    </div>
  )
}

function BloqueQuieto({
  className,
  style,
  children,
}: Pick<BloqueProps, 'className' | 'style' | 'children'>): React.JSX.Element {
  return (
    <div className={className} style={style}>
      {children(null)}
    </div>
  )
}

export function Bloque({ anima, ...resto }: BloqueProps): React.JSX.Element {
  return anima ? (
    <BloqueConMotor {...resto} />
  ) : (
    <BloqueQuieto className={resto.className} style={resto.style}>
      {resto.children}
    </BloqueQuieto>
  )
}
