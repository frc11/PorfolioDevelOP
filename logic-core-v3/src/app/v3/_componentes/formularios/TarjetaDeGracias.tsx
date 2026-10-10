'use client'

import type { Ref } from 'react'

import { cn } from '@/lib/utils'

import { GRACIAS } from '../../_lib/formularios/gracias'

/**
 * [PULIDO 9] H2 · H3 · LA TARJETA DE GRACIAS — lo que queda de un formulario enviado: el mensaje y, si se puede, «Enviar otro
 * mensaje». Recibe el foco al llegar (`tabIndex={-1}`); el anuncio va en la región viva de cada formulario. En el pie de
 * volumen la dibuja la escena (`data-relieve`: en relieve en su placa; el título en Archivo, `data-fuente`) y el DOM queda
 * transparente encima, para el foco y el clic.
 */
interface Props {
  readonly foco?: Ref<HTMLDivElement>
  /** En la placa 3D del pie: el texto lo dibuja la escena. */
  readonly enVolumen?: boolean
  readonly alOtro?: () => void
  readonly className?: string
}

export function TarjetaDeGracias({ foco, enVolumen = false, alOtro, className }: Props): React.JSX.Element {
  return (
    // [PULIDO 10] J4 · el foco se ve (el anillo de siempre: ya no se le quita el contorno); en 3D el título va en minúsculas (lo compone la
    // escena en Archivo, como la frase del CTA); en el DOM plano, las mayúsculas (la cara de display del DOM no trae minúsculas).
    <div ref={foco} tabIndex={-1} data-tarjeta="gracias" className={cn('flex flex-col gap-[var(--spacing-2)]', className)}>
      <p data-relieve="" data-fuente="archivo" className={cn('font-display font-fuerte tracking-display leading-titulo text-fluido-titulo-m', enVolumen ? 'text-transparent' : 'uppercase')}>
        {GRACIAS.titulo}
      </p>
      <p data-relieve="" className={cn('text-cuerpo leading-texto', enVolumen && 'text-transparent')}>
        {GRACIAS.bajada}
      </p>
      {alOtro !== undefined && (
        <button type="button" data-relieve="" onClick={alOtro} className={cn('mt-[var(--spacing-1)] -mx-[var(--spacing-2)] self-start px-[var(--spacing-2)] py-[var(--spacing-2)] text-micro leading-micro tracking-micro font-semi', enVolumen ? 'text-transparent' : 'underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:decoration-2')}>
          {GRACIAS.otro}
        </button>
      )}
    </div>
  )
}
