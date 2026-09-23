import { getImageProps } from 'next/image'

import { cn } from '@/lib/utils'

import { CONSULTA_DEL_CORTE, CORTES, MEDIDA_POR_CORTE, fuenteDelCorte } from './capturas'

/**
 * LA CAPTURA DE UN PROYECTO, CON DIRECCIÓN DE ARTE. **[MÓVIL-TRABAJOS]**
 *
 * Un `<picture>` con una `<source>` por corte y la imagen de escritorio de base.
 * El navegador toma la primera `<source>` cuya consulta cumple y descarga SÓLO
 * ésa: un teléfono no baja la de escritorio y una tablet no baja la del teléfono.
 * Las tres URL las arma `getImageProps`, o sea que pasan por el mismo optimizador
 * que `next/image`, con su `srcset` por ancho.
 *
 * Las `<source>` llevan su ancho y su alto: con eso el navegador reserva la caja
 * con la proporción del corte elegido antes de que llegue el archivo.
 */
export function CapturaPorDispositivo({
  fuente,
  alt,
  ancho,
  alto,
  sizes,
  className,
}: {
  readonly fuente: string
  readonly alt: string
  readonly ancho: number
  readonly alto: number
  readonly sizes: string
  readonly className?: string
}): React.JSX.Element {
  const { props: escritorio } = getImageProps({ src: fuente, alt, width: ancho, height: alto, sizes })
  return (
    <picture data-pieza="captura-por-dispositivo">
      {CORTES.map((corte) => {
        const medida = MEDIDA_POR_CORTE[corte]
        const { props } = getImageProps({ src: fuenteDelCorte(fuente, corte), alt, width: medida.ancho, height: medida.alto, sizes: '100vw' })
        return (
          <source
            key={corte}
            data-corte={corte}
            media={CONSULTA_DEL_CORTE[corte]}
            srcSet={props.srcSet}
            sizes={props.sizes}
            width={medida.ancho}
            height={medida.alto}
          />
        )
      })}
      {/* La base del `<picture>`: `getImageProps` arma sus atributos, el patrón de dirección de arte de Next. */}
      <img {...escritorio} alt={alt} data-pieza="imagen" className={cn('h-auto w-full', className)} />
    </picture>
  )
}
