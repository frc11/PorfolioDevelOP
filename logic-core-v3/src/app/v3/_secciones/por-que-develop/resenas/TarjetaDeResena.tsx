import { cn } from '@/lib/utils'

import { TEXTO_DE_LAS_RESENAS, type Resena } from './contenido'

/**
 * [NOCTURNO B2] LA CARA DE UNA TARJETA — la cita, el retrato, el nombre y el negocio, en papel con tinta (de día). Todo se mide con el ancho
 * de la tarjeta (`--ancho-de-la-tarjeta`, que escribe la escena con el tamaño de la placa de frente, o la lista con el suyo): la cara se ve
 * igual a cualquier tamaño y, de frente, el texto se rasteriza a su escala. La tinta y la tinta media sobre el papel: 17,6:1 y 7,4:1 (AA).
 *
 * El retrato es decorativo (`aria-hidden`: el nombre está escrito al lado) y va como fondo: es un placeholder ilustrado que se reemplaza.
 */
export function CaraDeLaResena({ resena, className }: { readonly resena: Resena; readonly className?: string }): React.JSX.Element {
  return (
    <span className={cn('flex h-full w-full flex-col justify-between overflow-hidden rounded-[calc(var(--ancho-de-la-tarjeta)*0.069)] bg-fondo p-[calc(var(--ancho-de-la-tarjeta)*0.07)] text-left text-tinta', className)}>
      <span className="block text-[length:calc(var(--ancho-de-la-tarjeta)/21)] leading-texto">«{resena.cita}»</span>
      <span className="flex items-center gap-[calc(var(--ancho-de-la-tarjeta)*0.04)]">
        <span aria-hidden="true" className="block size-[calc(var(--ancho-de-la-tarjeta)*0.13)] shrink-0 rounded-circulo" style={{ backgroundImage: `url(${resena.foto})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[length:calc(var(--ancho-de-la-tarjeta)/24)] font-semi">{resena.nombre}</span>
          <span className="truncate text-[length:calc(var(--ancho-de-la-tarjeta)/28)] text-tinta-media">{resena.negocio}</span>
        </span>
      </span>
    </span>
  )
}

/** La pastilla del hover (la de Demos: la del navbar, token por token), arriba de la tarjeta levantada. Con el foco del teclado, también. */
export function VerTrabajo(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      data-parte="ver-trabajo"
      className="pointer-events-none absolute bottom-full left-1/2 mb-[calc(var(--ancho-de-la-tarjeta)*0.05)] inline-flex -translate-x-1/2 items-center whitespace-nowrap rounded-[var(--radius-fuerte)] border border-borde bg-superficie-translucida px-[var(--spacing-4)] py-[var(--spacing-2)] text-cuerpo text-tinta opacity-0 shadow-flotante backdrop-blur-[var(--blur-panel)] transition-opacity duration-media group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {TEXTO_DE_LAS_RESENAS.verTrabajo}
    </span>
  )
}
