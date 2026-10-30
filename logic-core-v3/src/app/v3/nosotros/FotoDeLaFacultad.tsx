import Image from 'next/image'

import { Caption } from '../_componentes/tipografia/Textos'

import { FOTO_DE_LA_FACULTAD } from './contenido'

/**
 * [L7g] LA FOTO DE LA FACULTAD de la historia de Nosotros. El archivo es de 500 × 298: la caja no pasa de 500 px de ancho (no se estira, no se
 * ve borrosa) y el `sizes` le dice al navegador lo mismo.
 */
export function FotoDeLaFacultad(): React.JSX.Element {
  return (
    <figure data-pieza="foto-de-la-facultad" className="flex w-full max-w-[500px] flex-col gap-[var(--spacing-3)] escritorio:justify-self-end">
      <Image
        src={FOTO_DE_LA_FACULTAD.src}
        alt={FOTO_DE_LA_FACULTAD.alt}
        width={FOTO_DE_LA_FACULTAD.ancho}
        height={FOTO_DE_LA_FACULTAD.alto}
        sizes="(min-width: 540px) 500px, 100vw"
        className="h-auto w-full rounded-[var(--radius-fuerte)]"
      />
      <Caption como="figcaption" className="text-tinta-media">
        {FOTO_DE_LA_FACULTAD.pie}
      </Caption>
    </figure>
  )
}
