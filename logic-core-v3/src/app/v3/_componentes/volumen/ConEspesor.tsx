import { cn } from '@/lib/utils'

/**
 * [CIERRE RETOQUE 3D] D1 · EL ESPESOR DE UNA PIEZA DE CSS 3D — copias de lo mismo hacia atrás, cada `paso` px y cada vez
 * más mezcladas con el fondo, para que al girar (`useGiroDeLaMirada`) se le vean los costados, como a las letras
 * extruidas de la escena. La de adelante es la de verdad (se lee, se enfoca, la anuncia el lector); las de atrás son
 * `aria-hidden` y no se tocan, y van como `copia` (sin encabezados: el índice del documento no las cuenta). Pide
 * `transform-3d` en la cadena hasta la pieza que gira (y opacidad entera: una menor que 1 la aplana).
 */
export const ESPESOR = { capas: 8, paso: 1.25, mezclaAtras: 35, mezclaAdelante: 70 } as const

export function ConEspesor({ copia, children, className }: { readonly copia: React.ReactNode; readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  const e = ESPESOR
  return (
    <div className={cn('relative transform-3d', className)}>
      {Array.from({ length: e.capas }, (_, k) => {
        const mezcla = e.mezclaAtras + ((e.mezclaAdelante - e.mezclaAtras) * k) / Math.max(1, e.capas - 1)
        return (
          <div
            key={k}
            aria-hidden="true"
            data-parte="espesor"
            className="pointer-events-none absolute inset-0 select-none"
            style={{ transform: `translateZ(${(-(e.capas - k) * e.paso).toFixed(2)}px)`, color: `color-mix(in srgb, currentColor ${mezcla.toFixed(0)}%, var(--color-fondo))` }}
          >
            {copia}
          </div>
        )
      })}
      <div className="relative">{children}</div>
    </div>
  )
}
