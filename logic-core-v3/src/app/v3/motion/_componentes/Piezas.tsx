'use client'

import type { ReactNode } from 'react'

import type { EstadoDelBloque } from './BloqueDePatron'
import { Pieza } from './Pieza'

/**
 * N PIEZAS DEL MISMO PATRÓN — el caso general de seis de los nueve.
 *
 * Existe por una razón concreta: la rama de movimiento reducido tiene que
 * renderizar EL MISMO contenido sin una sola transformada, y repetir esa rama en
 * cada patrón sería seis oportunidades de que una se desvíe. Acá está una vez.
 *
 * Con `progreso === null` no se monta `Pieza`: se renderiza el contenido pelado,
 * en su estado final. No hay `style`, no hay `MotionValue`, no hay suscripción.
 */

export interface PiezasProps {
  readonly estado: EstadoDelBloque
  readonly cantidad: number
  /** Clases de cada pieza. */
  readonly className?: string
  /** Clases del contenedor de las piezas. */
  readonly contenedor?: string
  readonly como?: 'div' | 'span'
  readonly render: (indice: number) => ReactNode
}

export function Piezas({
  estado,
  cantidad,
  className,
  contenedor,
  como = 'div',
  render,
}: PiezasProps): React.JSX.Element {
  const indices = Array.from({ length: cantidad }, (_, i) => i)

  if (estado.progreso === null) {
    return (
      <div className={contenedor}>
        {indices.map((i) =>
          como === 'span' ? (
            <span key={i} className={className}>
              {render(i)}
            </span>
          ) : (
            <div key={i} className={className}>
              {render(i)}
            </div>
          ),
        )}
      </div>
    )
  }

  const progreso = estado.progreso
  return (
    <div className={contenedor}>
      {indices.map((i) => (
        <Pieza
          key={i}
          spec={estado.spec}
          indice={i}
          progreso={progreso}
          como={como}
          className={className}
        >
          {render(i)}
        </Pieza>
      ))}
    </div>
  )
}
