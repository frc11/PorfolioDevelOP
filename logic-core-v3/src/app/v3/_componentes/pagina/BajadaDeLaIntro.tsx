'use client'

import type { IdDePagina } from '../../_lib/escena/ruta/preset'
import { useAcompananteDelTitulo } from '../../_lib/titulos3d/acompanantes'
import { idDeLaParte } from '../titulos3d/TituloDePagina'

/**
 * [B12a.8] T4 · LA BAJADA DE LA INTRO, EN EL PLANO DE SU TÍTULO — como la bajada y los CTA del hero (`useAcompananteDelTitulo`): el título en
 * volumen va fijo en el mundo y la cámara lo muestra en perspectiva con el mouse; la bajada va en su mismo plano y nunca le queda debajo
 * (quieta en el DOM, con el mouse en un costado el título la pisaba hasta 120 px: medido). Sigue siendo el DOM (se lee, se selecciona). Sin
 * el título en volumen (abajo de 1024, sin WebGL o con movimiento reducido), en su lugar.
 */
export function BajadaDeLaIntro({ id, children }: { readonly id: IdDePagina; readonly children: React.ReactNode }): React.JSX.Element {
  const ref = useAcompananteDelTitulo<HTMLDivElement>(idDeLaParte(id, 1))
  return (
    <div ref={ref} data-parte="bajada" className="flex max-w-[42ch] flex-col gap-[var(--spacing-3)]">
      {children}
    </div>
  )
}
